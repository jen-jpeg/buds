"use client";

import Image from "next/image";
import { useState } from "react";
import isMobile from "../hooks/is-mobile";
import { localDateKey, parseLocalDateKey } from "../lib/bud-care";

export type FertilizePlan = {
  plannedDate: string;
  note: string;
};

export type BudDisplay = {
  id: string;
  name: string;
  healthyImage: string;
  seeEveryDays: number;
  /** 0–100 shown on the care bar */
  health: number;
  /** Local YYYY-MM-DD when health was last reconciled (decay applied or care gained). */
  healthUpdatedAt: string;
  /** YYYY-MM-DD of last in-person visit */
  lastInPersonAt: string | null;
  fertilizePlan: FertilizePlan | null;
  /** YYYY-MM-DD when user last logged “chatted today” */
  lastChattedTodayAt: string | null;
  /** Monday week key when user last used “this week” water log */
  lastWaterWeekStartKey: string | null;
};

function formatShortPlanDate(iso: string): string {
  const d = parseLocalDateKey(iso);
  if (!d) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function hoverInfoLines(bud: BudDisplay): string[] {
  const today = localDateKey(new Date());
  const lines: string[] = [];
  if (bud.lastChattedTodayAt === today) {
    lines.push("Chatted today");
  }
  if (bud.fertilizePlan) {
    const { plannedDate, note } = bud.fertilizePlan;
    if (plannedDate >= today) {
      const tail = note.trim() ? ` — ${note.trim()}` : "";
      lines.push(`Visit planned ${formatShortPlanDate(plannedDate)}${tail}`);
    }
  }
  return lines;
}

function imageForHealth(healthyImage: string, health: number): string {
  // Images follow the convention: `*_0.png` (healthy), `*_1.png` (sick), `*_2.png` (joever).
  // If that convention ever changes, we fall back to the healthy image.
  const sickImage = healthyImage.replace(/_0\.png$/, "_1.png");
  const joeverImage = healthyImage.replace(/_0\.png$/, "_2.png");
  if (health < 50 && joeverImage !== healthyImage) return joeverImage;
  if (health < 70 && sickImage !== healthyImage) return sickImage;
  return healthyImage;
}

type FlowerProps = {
  bud: BudDisplay;
  swayDuration?: number;
  swayDelay?: number;
  careOpen?: boolean;
  onOpenCare?: () => void;
  onAnchorChange?: (el: HTMLDivElement | null) => void;
};

export default function Flower({
  bud,
  swayDuration = 4,
  swayDelay = 0,
  careOpen = false,
  onOpenCare,
  onAnchorChange,
}: FlowerProps) {
  const IMAGE_PX = isMobile() ? 100 : 600;
  const selected = careOpen;
  const [hovered, setHovered] = useState(false);
  const showHoverExtras = hovered && !careOpen;
  const glowActive = selected || showHoverExtras;

  const glowStyle = glowActive
    ? {
        filter:
          "drop-shadow(0 0 6px var(--flower-glow-inner)) drop-shadow(0 0 20px var(--flower-glow-outer))",
      }
    : undefined;

  const hoverLines = hoverInfoLines(bud);
  const imageSrc = imageForHealth(bud.healthyImage, bud.health);

  return (
    <div
      className="relative flex flex-col items-center gap-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={onAnchorChange}
        className="relative hover:cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenCare?.();
          }
        }}
        onClick={() => onOpenCare?.()}
        style={{
          transformOrigin: "bottom center",
          animationName: selected ? "none" : "sway1",
          animationDuration: `${swayDuration}s`,
          animationTimingFunction: "ease-in-out",
          animationDelay: `${swayDelay}s`,
          animationIterationCount: "infinite",
        }}
      >
        <div
          style={{
            transformOrigin: "bottom center",
            animationName: selected ? "none" : "sway2",
            animationDuration: `${swayDuration * 0.55}s`,
            animationTimingFunction: "ease-in-out",
            animationDelay: `${swayDelay + 0.5}s`,
            animationIterationCount: "infinite",
          }}
        >
          <Image
            src={imageSrc}
            alt=""
            width={IMAGE_PX}
            height={IMAGE_PX}
            className="inline-block h-22 w-22 md:h-48 md:w-48 object-contain"
            style={glowStyle}
          />
        </div>
      </div>
      <h2 className="text-center text-lg font-semibold">
        {bud.name}
      </h2>
      <div className="flex w-full min-w-[2rem] max-w-[14rem] flex-col gap-1">
        <div className="flex w-full items-center gap-1.5">
          <div
            className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full border border-lg border-emerald-900 bg-neutral-100/90"
            role="status"
            aria-label={`Health ${Math.round(bud.health)} percent. Connect every ${bud.seeEveryDays} days`}
          >
            <div
              className="h-full rounded-full bg-health-bar-sage transition-all duration-300"
              style={{ width: `${Math.round(bud.health)}%` }}
            />
          </div>
          <span
            className={`shrink-0 tabular-nums text-xs font-medium text-emerald-900/90 ${
              showHoverExtras ? "" : "invisible"
            }`}
            aria-hidden={!showHoverExtras}
          >
            {Math.round(bud.health)}%
          </span>
        </div>
        {showHoverExtras && hoverLines.length > 0 ? (
          <ul className="list-inside list-disc text-sm leading-snug text-neutral-600">
            {hoverLines.map((line, i) => (
              <li key={`${i}-${line.slice(0, 24)}`}>{line}</li>
            ))}
          </ul>
        ) : null}
        {(!showHoverExtras || hoverLines.length === 0) && <p className="text-center text-sm text-neutral-500">
          See every {bud.seeEveryDays} day{bud.seeEveryDays === 1 ? "" : "s"}
        </p>}
      </div>
    </div>
  );
}
