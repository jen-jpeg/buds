"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Flower, {
  type BudDisplay,
  type FertilizePlan,
} from "./components/flower";
import FlowerAddCard, {
  type NewBudPayload,
} from "./components/flower-add-card";
import FlowerCarePopup from "./components/flower-care-popup";
import {
  clampHealth,
  fertilizeBoost,
  localDateKey,
  healthAfterDecay,
  startOfCalendarWeekKey,
  waterPoints,
} from "./lib/bud-care";
import { BUDS_STORAGE_UPDATED_EVENT, STORAGE_KEY } from "./lib/storage";

function isFertilizePlan(value: unknown): value is FertilizePlan {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.plannedDate === "string" && typeof o.note === "string";
}

function parseBud(value: unknown): BudDisplay | undefined {
  if (value === null || typeof value !== "object") return undefined;
  const o = value as Record<string, unknown>;
  if (
    typeof o.id !== "string" ||
    typeof o.name !== "string" ||
    typeof o.healthyImage !== "string" ||
    typeof o.seeEveryDays !== "number" ||
    !Number.isFinite(o.seeEveryDays)
  ) {
    return undefined;
  }
  const health =
    typeof o.health === "number" && Number.isFinite(o.health)
      ? clampHealth(o.health)
      : 82;
  const lastInPersonAt =
    o.lastInPersonAt === null || o.lastInPersonAt === undefined
      ? null
      : typeof o.lastInPersonAt === "string"
        ? o.lastInPersonAt
        : null;
  let fertilizePlan: FertilizePlan | null = null;
  if (o.fertilizePlan !== null && o.fertilizePlan !== undefined) {
    if (isFertilizePlan(o.fertilizePlan)) fertilizePlan = o.fertilizePlan;
  }
  const lastChattedAt = typeof o.lastChattedAt === "string" ? o.lastChattedAt : null;
  const lastWaterWeekStartKey =
    typeof o.lastWaterWeekStartKey === "string"
      ? o.lastWaterWeekStartKey
      : null;
  const todayKey = localDateKey(new Date());
  const healthUpdatedAt =
    typeof o.healthUpdatedAt === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(o.healthUpdatedAt)
      ? o.healthUpdatedAt
      : todayKey;

  return {
    id: o.id,
    name: o.name,
    healthyImage: o.healthyImage,
    seeEveryDays: Math.max(1, Math.floor(o.seeEveryDays)),
    health,
    healthUpdatedAt,
    lastInPersonAt,
    fertilizePlan,
    lastChattedAt,
    lastWaterWeekStartKey,
  };
}

function parseStoredBuds(raw: string): BudDisplay[] | undefined {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;
    const out = parsed
      .map(parseBud)
      .filter((x): x is BudDisplay => x !== undefined);
    return out;
  } catch {
    return undefined;
  }
}

const defaultCareFields = (): Pick<
  BudDisplay,
  | "health"
  | "healthUpdatedAt"
  | "lastInPersonAt"
  | "fertilizePlan"
  | "lastChattedAt"
  | "lastWaterWeekStartKey"
> => ({
  health: 80,
  healthUpdatedAt: localDateKey(new Date()),
  lastInPersonAt: null,
  fertilizePlan: null,
  lastChattedAt: null,
  lastWaterWeekStartKey: null,
});

function reconcileHealthDecay(buds: BudDisplay[], at: Date): BudDisplay[] {
  return buds.map((b) => {
    const next = healthAfterDecay({
      health: b.health,
      healthUpdatedAt: b.healthUpdatedAt,
      seeEveryDays: b.seeEveryDays,
      at,
    });
    return { ...b, health: next.health, healthUpdatedAt: next.healthUpdatedAt };
  });
}

export default function Home() {
  const [buds, setBuds] = useState<BudDisplay[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [openCareId, setOpenCareId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<BudDisplay | null>(null);
  const flowerAnchorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const loadFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const next = parseStoredBuds(raw);
        if (next !== undefined) {
          setBuds(reconcileHealthDecay(next, new Date()));
          return;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      loadFromStorage();
    } finally {
      setHydrated(true);
    }
  }, [loadFromStorage]);

  useEffect(() => {
    if (!hydrated) return;
    const onUpdated = () => loadFromStorage();
    window.addEventListener(BUDS_STORAGE_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(BUDS_STORAGE_UPDATED_EVENT, onUpdated);
  }, [hydrated, loadFromStorage]);

  useEffect(() => {
    // refresh stats when the page is visible or focused
    if (!hydrated) return;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      setBuds((prev) => reconcileHealthDecay(prev, new Date()));
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(buds));
    } catch {
      /* quota or private mode */
    }
  }, [buds, hydrated]);

  const updateBud = useCallback(
    (id: string, fn: (b: BudDisplay) => BudDisplay) => {
      setBuds((prev) => prev.map((b) => (b.id === id ? fn(b) : b)));
    },
    [],
  );

  const handleAdd = useCallback((payload: NewBudPayload) => {
    setBuds((prev) => [
      ...prev,
      {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : String(Date.now()),
        name: payload.name,
        healthyImage: payload.healthyImage,
        seeEveryDays: payload.seeEveryDays,
        ...defaultCareFields(),
      },
    ]);
  }, []);

  const handleUpdateBud = useCallback((id: string, payload: NewBudPayload) => {
    setBuds((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              name: payload.name,
              healthyImage: payload.healthyImage,
              seeEveryDays: payload.seeEveryDays,
            }
          : b,
      ),
    );
  }, []);

  const handleDeleteBud = useCallback((id: string) => {
    setBuds((prev) => prev.filter((b) => b.id !== id));
    setOpenCareId((cur) => (cur === id ? null : cur));
    setEditTarget((cur) => (cur?.id === id ? null : cur));
  }, []);

  const handleWaterThisWeek = useCallback(
    (id: string) => {
      const today = localDateKey(new Date());
      const weekKey = startOfCalendarWeekKey(new Date());
      updateBud(id, (b) => ({
        ...b,
        lastChattedAt: today,
        lastWaterWeekStartKey: weekKey,
        health: clampHealth(b.health + waterPoints.thisWeek),
        healthUpdatedAt: today,
      }));
    },
    [updateBud],
  );

  const handleSavePlan = useCallback(
    (id: string, plan: FertilizePlan) => {
      updateBud(id, (b) => ({ ...b, fertilizePlan: plan }));
    },
    [updateBud],
  );

  const handleClearPlan = useCallback(
    (id: string) => {
      updateBud(id, (b) => ({ ...b, fertilizePlan: null }));
    },
    [updateBud],
  );

  const handleCompleteFertilize = useCallback(
    (id: string) => {
      const today = localDateKey(new Date());
      updateBud(id, (b) => {
        if (!b.fertilizePlan) return b;
        const boost = fertilizeBoost({
          lastInPersonAt: b.lastInPersonAt,
          seeEveryDays: b.seeEveryDays,
          at: new Date(),
        });
        return {
          ...b,
          lastInPersonAt: today,
          fertilizePlan: null,
          health: clampHealth(b.health + boost),
          healthUpdatedAt: today,
        };
      });
    },
    [updateBud],
  );

  return (
    <div className="mx-auto w-[90%] pl-0 sm:pl-[10%] md:pl-[5%] flex flex-col gap-6 p-6">
      <ul className="mx-auto w-fit grid grid-cols-2 justify-items-start gap-4 sm:flex sm:flex-row sm:flex-wrap sm:justify-start sm:gap-6">
        {buds.map((bud, index) => (
          <li key={bud.id} className="relative flex flex-col">
            <Flower
              bud={bud}
              swayDelay={index * 0.15}
              careOpen={openCareId === bud.id}
              onAnchorChange={(el) => {
                flowerAnchorRefs.current[bud.id] = el;
              }}
              onOpenCare={() =>
                setOpenCareId((cur) => (cur === bud.id ? null : bud.id))
              }
            />
            {openCareId === bud.id ? (
              <FlowerCarePopup
                bud={bud}
                anchorEl={flowerAnchorRefs.current[bud.id] ?? null}
                onClose={() => setOpenCareId(null)}
                onWaterToday={() => handleWaterThisWeek(bud.id)}
                onSavePlan={(plan) => handleSavePlan(bud.id, plan)}
                onClearPlan={() => handleClearPlan(bud.id)}
                onCompleteFertilize={() => handleCompleteFertilize(bud.id)}
                onRequestEdit={() => {
                  setOpenCareId(null);
                  setEditTarget(bud);
                }}
              />
            ) : null}
          </li>
        ))}
        <li className="relative flex flex-col">
          <FlowerAddCard
            onAdd={handleAdd}
            editTarget={editTarget}
            onCloseEdit={() => setEditTarget(null)}
            onUpdate={handleUpdateBud}
            onDelete={handleDeleteBud}
          />
        </li>
      </ul>
    </div>
  );
}
