"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  clampHealth,
  diffCalendarDays,
  fertilizeBoost,
  isWaterAlreadyLoggedThisWeek,
  localDateKey,
  parseLocalDateKey,
  waterPoints,
} from "../lib/bud-care";
import {
  healthBarColorClasses,
  type BudDisplay,
  type FertilizePlan,
} from "./flower";

type Tab = "water" | "fertilize";

type FlowerCarePopupProps = {
  bud: BudDisplay;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onWaterToday: () => void;
  onSavePlan: (plan: FertilizePlan) => void;
  onClearPlan: () => void;
  onCompleteFertilize: () => void;
  onRequestEdit: () => void;
};

export default function FlowerCarePopup({
  bud,
  anchorEl,
  onClose,
  onWaterToday,
  onSavePlan,
  onClearPlan,
  onCompleteFertilize,
  onRequestEdit,
}: FlowerCarePopupProps) {
  const formatRelativeDate = (key: string | null, base: Date, empty: string) => {
    if (!key) return empty;
    const todayKey = localDateKey(base);
    if (key === todayKey) return "today";
    const days = diffCalendarDays(key, base);
    if (days === 1) return "yesterday";
    if (days <= 14) return `${days} days ago`;
    const d = parseLocalDateKey(key);
    if (!d) return key;
    const thisYear = base.getFullYear();
    if (d.getFullYear() === thisYear) {
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const [tab, setTab] = useState<Tab>("water");
  const [position, setPosition] = useState({ top: 0, left: 0, ready: false });
  const [planDate, setPlanDate] = useState(
    () => bud.fertilizePlan?.plannedDate ?? localDateKey(new Date()),
  );
  const [planNote, setPlanNote] = useState(
    () => bud.fertilizePlan?.note ?? "",
  );

  useEffect(() => {
    setPlanDate(bud.fertilizePlan?.plannedDate ?? localDateKey(new Date()));
    setPlanNote(bud.fertilizePlan?.note ?? "");
  }, [bud.fertilizePlan?.plannedDate, bud.fertilizePlan?.note, bud.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el || el.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onClose]);

  useLayoutEffect(() => {
    const EDGE_GAP = 8;
    const updatePosition = () => {
      const panel = rootRef.current;
      if (!panel || !anchorEl) return;
      const anchorRect = anchorEl.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const idealLeft = anchorRect.left + anchorRect.width / 2 - panelRect.width / 2;
      const idealTop = anchorRect.top + anchorRect.height / 2 - panelRect.height / 2;
      const maxLeft = Math.max(EDGE_GAP, window.innerWidth - panelRect.width - EDGE_GAP);
      const maxTop = Math.max(EDGE_GAP, window.innerHeight - panelRect.height - EDGE_GAP);
      const left = Math.max(EDGE_GAP, Math.min(idealLeft, maxLeft));
      const top = Math.max(EDGE_GAP, Math.min(idealTop, maxTop));
      setPosition({ top, left, ready: true });
    };

    setPosition((prev) => ({ ...prev, ready: false }));
    const raf = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorEl, tab, bud.fertilizePlan, bud.id, bud.health]);

  const now = new Date();
  const todayKey = localDateKey(now);
  const chattedThisWeek = isWaterAlreadyLoggedThisWeek(
    bud.lastWaterWeekStartKey,
    now,
  );

  const nextBoost = fertilizeBoost({
    lastInPersonAt: bud.lastInPersonAt,
    seeEveryDays: bud.seeEveryDays,
    at: now,
  });

  const lastVisitLabel = formatRelativeDate(bud.lastInPersonAt, now, "not yet");
  const lastChattedLabel = formatRelativeDate(bud.lastChattedAt, now, "not yet");

  const healthPct = Math.round(clampHealth(bud.health));
  const { trackBorder, fill: healthBarFill } = healthBarColorClasses(bud.health);

  const handleSavePlan = () => {
    const trimmed = planNote.trim();
    if (!planDate) return;
    onSavePlan({ plannedDate: planDate, note: trimmed });
  };

  return (
    <div
      ref={rootRef}
      id={panelId}
      role="dialog"
      aria-label={`Care for ${bud.name}`}
      className={`flower-care-popup-enter fixed z-30 w-[min(100vw-1.5rem,18rem)] rounded-xl border border-neutral-200 bg-white p-2.5 shadow-lg sm:w-[min(100vw-1rem,20rem)] sm:p-3 ${position.ready ? "opacity-100" : "opacity-0"}`}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          type="button"
          aria-label={`Edit ${bud.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onRequestEdit();
          }}
          className="rounded-md p-1.5 text-neutral-500 transition hover:cursor-pointer hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="currentColor"
            aria-hidden
          >
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
        </button>
      </div>

      <h3 className="pr-10 text-[1.05rem] font-bold leading-tight text-secondary-foreground sm:text-base">
        {bud.name}
      </h3>
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2 pr-1">
          <span className="text-[0.95rem] text-neutral-500 sm:text-[1.05rem]">Health</span>
          <span className="text-[0.95rem] font-medium tabular-nums text-neutral-700 sm:text-[1.05rem]">
            {healthPct}%
          </span>
        </div>
        <div
          className={`h-2 w-full overflow-hidden rounded-full border bg-neutral-100/90 ${trackBorder}`}
          role="status"
          aria-label={`Health ${healthPct} percent`}
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${healthBarFill}`}
            style={{ width: `${healthPct}%` }}
          />
        </div>
      </div>

      <div
        className="mt-2.5 flex rounded-lg bg-neutral-100 p-0.5 text-[1.1rem] sm:mt-3 sm:text-[1.35rem]"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "water"}
          className={`flex-1 rounded-md px-1.5 py-1 text-[1.05rem] font-medium transition hover:cursor-pointer sm:px-2 sm:py-1.5 sm:text-[1.35rem] ${
            tab === "water"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
          onClick={() => setTab("water")}
        >
          Water
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "fertilize"}
          className={`flex-1 rounded-md px-1.5 py-1 text-[1.05rem] font-medium transition hover:cursor-pointer sm:px-2 sm:py-1.5 sm:text-[1.35rem] ${
            tab === "fertilize"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
          onClick={() => setTab("fertilize")}
        >
          Fertilize
        </button>
      </div>

      {tab === "water" ? (
        <div className="mt-2.5 flex flex-col gap-1.5 text-[1.05rem] sm:mt-3 sm:gap-2 sm:text-[1.2rem]" role="tabpanel">
          <p className="text-neutral-500 text-[0.9rem] font-pangolin sm:text-[1rem]">
            Small drops of connection keep the friendship from drying out!
          </p>
          <p className="text-[0.9rem] text-neutral-500 sm:text-[1rem]">
            Last chatted:{" "}
            <span className="font-medium text-neutral-700">
              {lastChattedLabel}
            </span>
          </p>
          <button
            type="button"
            disabled={chattedThisWeek}
            onClick={onWaterToday}
            className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-left text-[0.95rem] font-medium text-blue-900 transition enabled:hover:cursor-pointer enabled:hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-45 sm:px-3 sm:py-2 sm:text-base"
          >
            Chatted this week
            <span className="mt-0.5 block text-[0.9rem] font-normal text-blue-800/80 sm:text-[1.05rem]">
              +{waterPoints.thisWeek} health
              {chattedThisWeek ? " · already logged this week" : ""}
            </span>
          </button>
        </div>
      ) : (
        <div className="mt-2.5 flex flex-col gap-2 text-[0.95rem] text-neutral-500 sm:mt-3 sm:gap-3 sm:text-[1rem]" role="tabpanel">
          <p className="font-pangolin text-[0.9rem] sm:text-[1rem]">
            The biggest health boost comes from seeing your bud in person. Plan a visit and mark when complete!
          </p>
          <p className="text-neutral-500">
            Last seen:{" "}
            <span className="font-medium text-neutral-700">
              {lastVisitLabel}
            </span>
          </p>

          {bud.fertilizePlan ? (
            <div className="rounded-md border border-blue-200 bg-blue-50/80 p-2 text-blue-950">
              <p className="font-medium">
                Planned {bud.fertilizePlan.plannedDate}
              </p>
              {bud.fertilizePlan.note ? (
                <p className="mt-1 text-amber-900/90">
                  {bud.fertilizePlan.note}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onCompleteFertilize}
                  className="rounded-md bg-button-green px-2.5 py-1 text-[1.05rem] font-medium text-white hover:cursor-pointer hover:bg-button-green-hover"
                >
                  We met — fertilize
                </button>
                <button
                  type="button"
                  onClick={onClearPlan}
                  className="rounded-md border border-blue-200/80 px-2.5 py-1 text-[1.05rem] font-medium text-blue-900 hover:cursor-pointer hover:bg-blue-100/80"
                >
                  Clear plan
                </button>
              </div>
            </div>
          ) : (
            <>
              <label className="flex flex-col gap-1">
                <span className="font-medium text-neutral-700">Visit date</span>
                <input
                  type="date"
                  value={planDate}
                  onChange={(e) => setPlanDate(e.target.value)}
                  className="rounded-md border border-neutral-200 px-2 py-1.5 text-[1.1rem] text-neutral-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium text-neutral-700">Plan</span>
                <textarea
                  value={planNote}
                  onChange={(e) => setPlanNote(e.target.value)}
                  rows={3}
                  placeholder="Coffee, walk, game night…"
                  className="resize-none rounded-md border border-neutral-200 px-2 py-1.5 text-[1.1rem] text-neutral-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                />
              </label>
              <button
                type="button"
                onClick={handleSavePlan}
            className="rounded-md bg-button-green px-3 py-2 text-[1.35rem] font-medium text-white hover:cursor-pointer hover:bg-button-green-hover"
              >
                Save plan
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
