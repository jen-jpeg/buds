"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { seeEveryDaysToYMW } from "../lib/bud-care";
import flowersData from "../data/flowers.json";
import type { BudDisplay } from "./flower";
import isMobile from "../hooks/is-mobile";
export type NewBudPayload = {
  name: string;
  seeEveryDays: number;
  healthyImage: string;
};

type FlowerAddCardProps = {
  onAdd: (bud: NewBudPayload) => void;
  editTarget?: BudDisplay | null;
  onCloseEdit?: () => void;
  onUpdate?: (id: string, bud: NewBudPayload) => void;
  onDelete?: (id: string) => void;
};

type FlowerOption = (typeof flowersData.flowers)[number];

type IntervalAssist = "years" | "weeks" | "months" | null;

const YEARS_MAX = 20;
const WEEKS_MAX = 52;
const MONTHS_MAX = 12;

function clampYears(n: number) {
  return Math.min(YEARS_MAX, Math.max(0, Math.floor(Number.isFinite(n) ? n : 0)));
}

function clampWeeks(n: number) {
  return Math.min(WEEKS_MAX, Math.max(0, Math.floor(Number.isFinite(n) ? n : 0)));
}

function clampMonths(n: number) {
  return Math.min(MONTHS_MAX, Math.max(0, Math.floor(Number.isFinite(n) ? n : 0)));
}

export default function FlowerAddCard({
  onAdd,
  editTarget = null,
  onCloseEdit,
  onUpdate,
  onDelete,
}: FlowerAddCardProps) {
  const panelId = useId();
  const yearsSliderId = `${panelId}-years-slider`;
  const weeksSliderId = `${panelId}-weeks-slider`;
  const monthsSliderId = `${panelId}-months-slider`;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  /** Whole years (365 days each when totaling). */
  const [everyYears, setEveryYears] = useState(0);
  /** Full weeks (7 days each when totaling). */
  const [everyWeeks, setEveryWeeks] = useState(1);
  /** Whole months (30 days each when totaling). */
  const [everyMonths, setEveryMonths] = useState(0);
  const [intervalAssist, setIntervalAssist] = useState<IntervalAssist>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const yearsFieldRef = useRef<HTMLDivElement>(null);
  const weeksFieldRef = useRef<HTMLDivElement>(null);
  const monthsFieldRef = useRef<HTMLDivElement>(null);
  const flowerScrollRef = useRef<HTMLDivElement>(null);
  const [flowerFadeLeft, setFlowerFadeLeft] = useState(false);
  const [flowerFadeRight, setFlowerFadeRight] = useState(false);
  const [flowerRowOverflow, setFlowerRowOverflow] = useState(false);

  const updateFlowerScrollFades = useCallback(() => {
    const el = flowerScrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const eps = 2;
    const overflow = maxScroll > eps;
    setFlowerRowOverflow(overflow);
    setFlowerFadeLeft(overflow && el.scrollLeft > eps);
    setFlowerFadeRight(overflow && el.scrollLeft < maxScroll - eps);
  }, []);

  const scrollFlowerRow = useCallback((direction: -1 | 1) => {
    const el = flowerScrollRef.current;
    if (!el) return;
    const eps = 6; // epsilon for smooth scrolling
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    if (maxScroll <= eps) return;

    const first = el.children[0] as HTMLElement | undefined;
    if (!first) return;
    const second = el.children[1] as HTMLElement | undefined;
    const gap = second
      ? second.offsetLeft - first.offsetLeft - first.offsetWidth
      : 12;
    const cardsPerPage = window.matchMedia("(max-width: 640px)").matches
      ? 1
      : 2;
    const step = (first.offsetWidth + gap) * cardsPerPage;

    if (direction === 1) {
      if (el.scrollLeft >= maxScroll - eps) return;
      el.scrollBy({ left: step, behavior: "smooth" });
    } else {
      if (el.scrollLeft <= eps) return;
      el.scrollBy({ left: -step, behavior: "smooth" });
    }
  }, []);

  const seeEveryDays = useMemo(
    () => everyYears * 365 + everyWeeks * 7 + everyMonths * 30,
    [everyYears, everyWeeks, everyMonths],
  );

  const selectedFlower: FlowerOption | undefined = flowersData.flowers.find(
    (f) => f.name === selectedKey,
  );

  const close = useCallback(() => {
    setName("");
    setEveryYears(0);
    setEveryWeeks(1);
    setEveryMonths(0);
    setIntervalAssist(null);
    setSelectedKey(null);
    setOpen(false);
    onCloseEdit?.();
  }, [onCloseEdit]);

  useEffect(() => {
    if (!editTarget) return;
    setName(editTarget.name);
    const ymw = seeEveryDaysToYMW(editTarget.seeEveryDays);
    setEveryYears(ymw.everyYears);
    setEveryWeeks(ymw.everyWeeks);
    setEveryMonths(ymw.everyMonths);
    const match = flowersData.flowers.find(
      (f) => f.state.healthy === editTarget.healthyImage,
    );
    setSelectedKey(match?.name ?? null);
    setIntervalAssist(null);
    setOpen(true);
  }, [editTarget]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (intervalAssist !== null) {
        e.preventDefault();
        setIntervalAssist(null);
        return;
      }
      close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close, intervalAssist]);

  useEffect(() => {
    if (!open || intervalAssist === null) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (weeksFieldRef.current?.contains(t)) return;
      if (monthsFieldRef.current?.contains(t)) return;
      if (yearsFieldRef.current?.contains(t)) return;
      setIntervalAssist(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, intervalAssist]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el || el.contains(e.target as Node)) return;
      close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  useLayoutEffect(() => {
    if (!open) return;
    updateFlowerScrollFades();
    const el = flowerScrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      updateFlowerScrollFades();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, updateFlowerScrollFades, flowersData.flowers.length]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed || !selectedFlower) return;
    const payload: NewBudPayload = {
      name: trimmed,
      seeEveryDays: Math.max(1, seeEveryDays),
      healthyImage: selectedFlower.state.healthy,
    };
    if (editTarget) {
      onUpdate?.(editTarget.id, payload);
    } else {
      onAdd(payload);
    }
    close();
  };

  const canSubmit =
    name.trim().length > 0 && selectedFlower != null && seeEveryDays >= 1;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Add bud"
        onClick={() => {
          if (open) {
            close();
            return;
          }
          setIntervalAssist(null);
          setOpen(true);
        }}
        className="group flex mt-8 aspect-square w-[6.6rem] md:w-[14.4rem] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-400 bg-none text-neutral-800 transition hover:cursor-pointer hover:border-neutral-700 hover:bg-white/50 focus-visible:border-neutral-700 focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
      >
        <span
          className="text-4xl font-light opacity-50 transition group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden
        >
          +
        </span>
        <span className="text-[1.2rem] opacity-50 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          add bud
        </span>
      </button>

      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/10 hover:cursor-pointer"
            aria-hidden
            onClick={close}
          />
          <div
            id={panelId}
            role="dialog"
            aria-label={editTarget ? "Edit bud" : "Add a bud"}
            aria-modal="true"
            className="fixed top-1/2 left-1/2 z-50 max-h-[min(95vh,48rem)] w-[min(100vw-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-4 shadow-lg"
          >
            {/* Form */}
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-base">
                <span className="font-medium text-neutral-800">Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="bud's name"
                  className="rounded-md border border-neutral-200 px-3 py-2 text-neutral-900 outline-none ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                />
              </label>
              <div className="flex min-w-0 flex-col gap-2">
                <span className="text-[1.2rem] font-medium text-neutral-800">
                  Flower type
                </span>
                <div className="relative min-w-0 w-full">
                  <div
                    className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-white to-transparent transition-opacity duration-200 ${
                      flowerFadeLeft ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden
                  />
                  <div
                    className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-white to-transparent transition-opacity duration-200 ${
                      flowerFadeRight ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden
                  />
                  {flowerRowOverflow ? (
                    <>
                      <button
                        type="button"
                        aria-label="Previous flower"
                        onClick={() => scrollFlowerRow(-1)}
                        className="absolute top-1/2 left-1 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200/90 bg-white/95 text-neutral-700 shadow-sm transition hover:cursor-pointer hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path d="M15 5 9 12 15 19 15 5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="Next flower"
                        onClick={() => scrollFlowerRow(1)}
                        className="absolute top-1/2 right-1 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200/90 bg-white/95 text-neutral-700 shadow-sm transition hover:cursor-pointer hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path d="M9 5 15 12 9 19 9 5z" />
                        </svg>
                      </button>
                    </>
                  ) : null}
                  <div
                    ref={flowerScrollRef}
                    onScroll={updateFlowerScrollFades}
                    className={`flex w-full snap-x snap-proximity gap-3 overflow-x-auto overflow-y-hidden py-1 pb-2 [scrollbar-color:rgb(212_212_212)_transparent] [scrollbar-width:thin] touch-pan-x [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-track]:bg-transparent ${flowerRowOverflow ? "px-14 [scroll-padding-inline:3.5rem]" : ""}`}
                  >
                    {flowersData.flowers.map((flower) => {
                      const isSelected = selectedKey === flower.name;
                      return (
                        <button
                          key={flower.name}
                          type="button"
                          onClick={() => setSelectedKey(flower.name)}
                          className={`aspect-square flex shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 transition hover:cursor-pointer ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/25"
                              : "border-neutral-200/80 bg-neutral-50 hover:border-neutral-300"
                          }`}
                          aria-pressed={isSelected}
                          aria-label={`Select ${flower.name} flower`}
                        >
                          <div className="relative h-[9.6rem] w-[9.6rem] shrink-0">
                            <Image
                              src={flower.state.healthy}
                              alt=""
                              fill
                              className="object-contain"
                              sizes="(max-width:28rem) 45vw, 12rem"
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <fieldset className="flex flex-col gap-3 text-base">
                <legend className="mb-0.5 font-medium text-neutral-800">
                  See every
                </legend>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div ref={weeksFieldRef} className="flex min-w-0 flex-col gap-1">
                    <label className="flex flex-col gap-1">
                      <span className="text-neutral-600">Weeks</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        aria-expanded={intervalAssist === "weeks"}
                        aria-controls={
                          intervalAssist === "weeks" ? weeksSliderId : undefined
                        }
                        value={String(everyWeeks)}
                        onClick={() => setIntervalAssist("weeks")}
                        onFocus={() => setIntervalAssist("weeks")}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          if (digits === "") {
                            setEveryWeeks(0);
                            return;
                          }
                          setEveryWeeks(clampWeeks(Number.parseInt(digits, 10)));
                        }}
                        onBlur={() => {
                          setEveryWeeks((w) => clampWeeks(w));
                        }}
                        className="w-full min-w-0 rounded-md border border-neutral-200 px-2 py-2 tabular-nums text-neutral-900 outline-none ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 sm:px-3"
                      />
                    </label>
                    {intervalAssist === "weeks" ? (
                      <input
                        id={weeksSliderId}
                        type="range"
                        min={0}
                        max={WEEKS_MAX}
                        step={1}
                        value={everyWeeks}
                        onChange={(e) =>
                          setEveryWeeks(
                            Number.parseInt(e.target.value, 10),
                          )
                        }
                        className="w-full accent-emerald-600"
                        aria-valuemin={0}
                        aria-valuemax={WEEKS_MAX}
                        aria-valuenow={everyWeeks}
                        aria-label="Adjust weeks"
                      />
                    ) : null}
                  </div>
                  <div ref={monthsFieldRef} className="flex min-w-0 flex-col gap-1">
                    <label className="flex flex-col gap-1">
                      <span className="text-neutral-600">Months</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        aria-expanded={intervalAssist === "months"}
                        aria-controls={
                          intervalAssist === "months"
                            ? monthsSliderId
                            : undefined
                        }
                        value={String(everyMonths)}
                        onClick={() => setIntervalAssist("months")}
                        onFocus={() => setIntervalAssist("months")}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          if (digits === "") {
                            setEveryMonths(0);
                            return;
                          }
                          setEveryMonths(
                            clampMonths(Number.parseInt(digits, 10)),
                          );
                        }}
                        onBlur={() => {
                          setEveryMonths((m) => clampMonths(m));
                        }}
                        className="w-full min-w-0 rounded-md border border-neutral-200 px-2 py-2 tabular-nums text-neutral-900 outline-none ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 sm:px-3"
                      />
                    </label>
                    {intervalAssist === "months" ? (
                      <input
                        id={monthsSliderId}
                        type="range"
                        min={0}
                        max={MONTHS_MAX}
                        step={1}
                        value={everyMonths}
                        onChange={(e) =>
                          setEveryMonths(
                            Number.parseInt(e.target.value, 10),
                          )
                        }
                        className="w-full accent-emerald-600"
                        aria-valuemin={0}
                        aria-valuemax={MONTHS_MAX}
                        aria-valuenow={everyMonths}
                        aria-label="Adjust months"
                      />
                    ) : null}
                  </div>
                  <div ref={yearsFieldRef} className="flex min-w-0 flex-col gap-1">
                    <label className="flex flex-col gap-1">
                      <span className="text-neutral-600">Years</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        aria-expanded={intervalAssist === "years"}
                        aria-controls={
                          intervalAssist === "years"
                            ? yearsSliderId
                            : undefined
                        }
                        value={String(everyYears)}
                        onClick={() => setIntervalAssist("years")}
                        onFocus={() => setIntervalAssist("years")}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          if (digits === "") {
                            setEveryYears(0);
                            return;
                          }
                          setEveryYears(
                            clampYears(Number.parseInt(digits, 10)),
                          );
                        }}
                        onBlur={() => {
                          setEveryYears((y) => clampYears(y));
                        }}
                        className="w-full min-w-0 rounded-md border border-neutral-200 px-2 py-2 tabular-nums text-neutral-900 outline-none ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 sm:px-3"
                      />
                    </label>
                    {intervalAssist === "years" ? (
                      <input
                        id={yearsSliderId}
                        type="range"
                        min={0}
                        max={YEARS_MAX}
                        step={1}
                        value={everyYears}
                        onChange={(e) =>
                          setEveryYears(Number.parseInt(e.target.value, 10))
                        }
                        className="w-full accent-emerald-600"
                        aria-valuemin={0}
                        aria-valuemax={YEARS_MAX}
                        aria-valuenow={everyYears}
                        aria-label="Adjust years"
                      />
                    ) : null}
                  </div>
                </div>
                <p className="text-[1.05rem] text-neutral-500">
                  About every{" "}
                  <span className="font-medium text-neutral-700">
                    {seeEveryDays}
                  </span>{" "}
                  day{seeEveryDays === 1 ? "" : "s"} total
                  {seeEveryDays < 1 ? (
                    <span className="text-amber-700">
                      {" "}
                      — increase weeks, months, or years
                    </span>
                  ) : null}
                </p>
              </fieldset>
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="rounded-md bg-button-green px-4 py-2 text-[1.2rem] font-medium text-white transition enabled:hover:cursor-pointer enabled:hover:bg-button-green-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                {editTarget ? "Save" : "Add"}
              </button>
              {editTarget ? (
                <button
                  type="button"
                  onClick={() => {
                    onDelete?.(editTarget.id);
                    close();
                  }}
                  className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-[1.2rem] font-medium text-rose-800 transition hover:cursor-pointer hover:bg-rose-100"
                >
                  Delete friend
                </button>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
