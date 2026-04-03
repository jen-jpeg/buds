const localDateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Calendar date in local timezone YYYY-MM-DD */
export function localDateKey(d: Date): string {
  return localDateFormatter.format(d);
}

export function parseLocalDateKey(key: string): Date | null {
  const parts = key.split("-");
  if (parts.length !== 3) return null;
  const [yearPart, monthPart, dayPart] = parts;
  if (yearPart.length !== 4 || monthPart.length !== 2 || dayPart.length !== 2) {
    return null;
  }
  const y = Number(yearPart);
  const mo = Number(monthPart) - 1; // js uses 0-11 for months
  const d = Number(dayPart);
  if (!Number.isInteger(y) || !Number.isInteger(mo) || !Number.isInteger(d)) {
    return null;
  }
  const dt = new Date(y, mo, d);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== mo ||
    dt.getDate() !== d
  ) {
    return null;
  }
  return dt;
}

export function diffCalendarDays(fromKey: string, toDate: Date): number {
  // Returns the number of days between two calendar dates in local timezone
  const from = parseLocalDateKey(fromKey);
  if (!from) return 0;
  const to = new Date(
    toDate.getFullYear(),
    toDate.getMonth(),
    toDate.getDate(),
  );
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

/** Monday-start calendar week id (local) */
export function startOfCalendarWeekKey(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = x.getDay();
  const mondayOffset = (dow + 6) % 7;
  x.setDate(x.getDate() - mondayOffset);
  return localDateKey(x);
}

/**
 * Weekly water / "chatted this week" is once per Monday-start calendar week.
 * True when the stored week key matches the week containing `at` (UI keeps the action disabled).
 */
export function isWaterAlreadyLoggedThisWeek(
  lastWaterWeekStartKey: string | null,
  at: Date,
): boolean {
  if (lastWaterWeekStartKey === null) return false;
  return lastWaterWeekStartKey === startOfCalendarWeekKey(at);
}

export function clampHealth(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const clamped = Math.min(100, Math.max(0, n));
  // Keep decimals so fractional decay isn't lost between frequent reconciliations.
  return clamped;
}

/**
 * Health lost over one full `seeEveryDays` window with no positive care (e.g. a week
 * apart → ~one week of silence costs a quarter of the bar). Daily loss = this / seeEveryDays.
 */
const HEALTH_DECAY_PER_INTERVAL = 25;

export function healthAfterDecay(args: {
  health: number;
  healthUpdatedAt: string;
  seeEveryDays: number;
  at: Date;
}): { health: number; healthUpdatedAt: string } {
  const todayKey = localDateKey(args.at);
  const days = diffCalendarDays(args.healthUpdatedAt, args.at);
  if (days <= 0) {
    return {
      health: clampHealth(args.health),
      healthUpdatedAt: args.healthUpdatedAt,
    };
  }
  const interval = Math.max(1, args.seeEveryDays);
  const decayPerDay = HEALTH_DECAY_PER_INTERVAL / interval;
  const lost = days * decayPerDay;
  return {
    health: clampHealth(args.health - lost),
    healthUpdatedAt: todayKey,
  };
}

const WATER_THIS_WEEK = 5;

export function fertilizeBoost(args: {
  lastInPersonAt: string | null;
  seeEveryDays: number;
  at: Date;
}): number {
  const interval = Math.max(1, args.seeEveryDays); // divide by 0 guard
  let daysSince: number;
  if (args.lastInPersonAt) {
    daysSince = diffCalendarDays(args.lastInPersonAt, args.at);
  } else {
    daysSince = 0;
  }
  const ratio = daysSince / interval;
  const base = 16;
  const extra = Math.min(38, Math.floor(ratio * 14));
  return base + extra;
}

export const waterPoints = {
  thisWeek: WATER_THIS_WEEK,
} as const;

const YEARS_MAX = 20;
const MONTHS_MAX = 12;

/** Approximate inverse of the add-card total (years×365 + months×30 + weeks×7). */
export function seeEveryDaysToYMW(total: number) {
  let d = Math.max(1, Math.floor(total));
  const everyYears = Math.min(YEARS_MAX, Math.floor(d / 365));
  d -= everyYears * 365;
  const everyMonths = Math.min(MONTHS_MAX, Math.floor(d / 30));
  d -= everyMonths * 30;
  const everyWeeks = Math.max(1, Math.ceil(d / 7));
  return { everyYears, everyMonths, everyWeeks };
}
