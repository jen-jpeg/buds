"use client";

import Image from "next/image";
import { useState } from "react";
import {
  diffCalendarDays,
  localDateKey,
  parseLocalDateKey,
} from "../lib/bud-care";
import { healthBarColorClasses, imageForHealth } from "../lib/flower-display";

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
  /** YYYY-MM-DD when user last logged a chat */
  lastChattedAt: string | null;
  /** Monday week key when user last used “this week” water log */
  lastWaterWeekStartKey: string | null;
};

function formatShortPlanDate(iso: string): string {
  const d = parseLocalDateKey(iso);
  if (!d) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function lastSawLine(bud: BudDisplay): string {
  if (!bud.lastInPersonAt) {
    return "";
  }
  const today = localDateKey(new Date());
  const key = bud.lastInPersonAt;
  if (key === today) {
    return "Last saw today";
  }
  const days = diffCalendarDays(key, new Date());
  if (days === 1) {
    return "Last saw yesterday";
  }
  if (days <= 14) {
    return `Last saw ${days} days ago`;
  }
  const d = parseLocalDateKey(key);
  if (!d) {
    return `Last saw ${key}`;
  }
  const y = d.getFullYear();
  const thisYear = new Date().getFullYear();
  if (y === thisYear) {
    return `Last saw ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }
  return `Last saw ${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function lastChattedLine(bud: BudDisplay): string {
  if (!bud.lastChattedAt) {
    return "";
  }
  const today = localDateKey(new Date());
  const key = bud.lastChattedAt;
  if (key === today) {
    return "Last logged chat: today";
  }
  const days = diffCalendarDays(key, new Date());
  if (days === 1) {
    return "Last logged chat: yesterday";
  }
  if (days <= 14) {
    return `Last logged chat: ${days} days ago`;
  }
  const d = parseLocalDateKey(key);
  if (!d) {
    return `Last logged chat: ${key}`;
  }
  const y = d.getFullYear();
  const thisYear = new Date().getFullYear();
  if (y === thisYear) {
    return `Last logged chat: ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }
  return `Last logged chat: ${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function hoverInfoLines(bud: BudDisplay): string[] {
  const today = localDateKey(new Date());
  let lines: string[] = [lastSawLine(bud), lastChattedLine(bud)];
  lines = lines.filter(line => line !== "");
  if (bud.fertilizePlan) {
    const { plannedDate, note } = bud.fertilizePlan;
    if (plannedDate >= today) {
      const tail = note.trim() ? ` — ${note.trim()}` : "";
      lines.push(`Visit planned ${formatShortPlanDate(plannedDate)}${tail}`);
    }
  }
  return lines;
}

export { healthBarColorClasses } from "../lib/flower-display";

/** Intrinsic size for optimizer; display is 7.2rem / 14.4rem (≈2× retina for the larger). */
const FLOWER_IMAGE_PX = 480;

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
  const { trackBorder, fill: healthBarFill } = healthBarColorClasses(bud.health);
  const swayEnabled = Number.isFinite(bud.health) && bud.health >= 50;

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
          animationName: selected || !swayEnabled ? "none" : "sway1",
          animationDuration: `${swayDuration}s`,
          animationTimingFunction: "ease-in-out",
          animationDelay: `${swayDelay}s`,
          animationIterationCount: "infinite",
          // Apply first keyframe during delay so staggered sways don’t snap in sequence.
          animationFillMode: "backwards",
        }}
      >
        <div
          style={{
            transformOrigin: "bottom center",
            animationName: selected || !swayEnabled ? "none" : "sway2",
            animationDuration: `${swayDuration * 0.55}s`,
            animationTimingFunction: "ease-in-out",
            animationDelay: `${swayDelay + 0.5}s`,
            animationIterationCount: "infinite",
            animationFillMode: "backwards",
          }}
        >
          <Image
            src={imageSrc}
            alt=""
            width={FLOWER_IMAGE_PX}
            height={FLOWER_IMAGE_PX}
            sizes="(max-width: 767px) 7.2rem, 14.4rem"
            quality={70}
            className="inline-block h-[7.2rem] w-[7.2rem] md:h-[14.4rem] md:w-[14.4rem] object-contain"
            style={glowStyle}
          />
        </div>
      </div>
      <h2 className="text-center text-[1.35rem] font-semibold">
        {bud.name}
      </h2>
      <div className="flex w-full min-w-[2rem] max-w-[10rem] flex-col gap-1">
        <div className="flex w-full items-center gap-1.5">
          <div
            className={`h-2 min-w-0 flex-1 overflow-hidden rounded-full border border-lg bg-neutral-100/90 ${trackBorder}`}
            role="status"
            aria-label={`Health ${Math.round(bud.health)} percent. Connect every ${bud.seeEveryDays} days`}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${healthBarFill}`}
              style={{ width: `${Math.round(bud.health)}%` }}
            />
          </div>
          <span
            className={`shrink-0 tabular-nums text-[1.05rem] font-medium text-foreground ${
              showHoverExtras ? "" : "invisible"
            }`}
            aria-hidden={!showHoverExtras}
          >
            {Math.round(bud.health)}%
          </span>
        </div>
        {showHoverExtras && hoverLines.length > 0 ? (
          <ul className="list-inside list-disc text-[1.05rem] absolute pt-[1.5rem] leading-snug text-neutral-600">
            {hoverLines.map((line, i) => (
              <li key={`${i}-${line.slice(0, 24)}`}>{line}</li>
            ))}
          </ul>
        ) : null}
        {(!showHoverExtras || hoverLines.length === 0) && (
          <p className="text-center text-[1.05rem] text-neutral-500">
            See every {bud.seeEveryDays} day{bud.seeEveryDays === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </div>
  );
}
