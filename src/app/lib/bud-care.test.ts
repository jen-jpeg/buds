import { describe, expect, it } from "vitest";
import {
  clampHealth,
  healthAfterDecay,
  isWaterAlreadyLoggedThisWeek,
  startOfCalendarWeekKey,
} from "./bud-care";

describe("clampHealth", () => {
  it("clamps to 0–100", () => {
    expect(clampHealth(-1)).toBe(0);
    expect(clampHealth(0)).toBe(0);
    expect(clampHealth(50)).toBe(50);
    expect(clampHealth(100)).toBe(100);
    expect(clampHealth(101)).toBe(100);
  });

  it("treats non-finite values as 0", () => {
    expect(clampHealth(Number.NaN)).toBe(0);
    expect(clampHealth(Number.POSITIVE_INFINITY)).toBe(0);
    expect(clampHealth(Number.NEGATIVE_INFINITY)).toBe(0);
  });
});

describe("healthAfterDecay", () => {
  const jan1 = new Date(2026, 0, 1);
  const jan8 = new Date(2026, 0, 8);

  it("does not decay when at is on or before the health update calendar day", () => {
    expect(
      healthAfterDecay({
        health: 88,
        healthUpdatedAt: "2026-01-01",
        seeEveryDays: 7,
        at: jan1,
      }),
    ).toEqual({ health: 88, healthUpdatedAt: "2026-01-01" });
  });

  it("applies decay over full calendar days and advances healthUpdatedAt to today", () => {
    // 7 calendar days at seeEveryDays 7 = one full interval → 25 points (a quarter of 100)
    const result = healthAfterDecay({
      health: 100,
      healthUpdatedAt: "2026-01-01",
      seeEveryDays: 7,
      at: jan8,
    });
    expect(result.health).toBeCloseTo(75, 5);
    expect(result.healthUpdatedAt).toBe("2026-01-08");
  });

  it("uses at least 1 day for the care interval when scaling decay", () => {
    const oneDayLater = new Date(2026, 0, 2);
    const result = healthAfterDecay({
      health: 100,
      healthUpdatedAt: "2026-01-01",
      seeEveryDays: 0,
      at: oneDayLater,
    });
    // 1 day × (25 / 1) = 25
    expect(result.health).toBeCloseTo(75, 5);
    expect(result.healthUpdatedAt).toBe("2026-01-02");
  });

  it("floors health at 0 after heavy decay", () => {
    const farFuture = new Date(2026, 1, 1);
    const result = healthAfterDecay({
      health: 10,
      healthUpdatedAt: "2026-01-01",
      seeEveryDays: 1,
      at: farFuture,
    });
    expect(result.health).toBe(0);
    expect(result.healthUpdatedAt).toBe("2026-02-01");
  });

  it("scales decay inversely with seeEveryDays (14 vs 7 over the same span)", () => {
    const at = new Date(2026, 0, 8);
    const weekInterval = healthAfterDecay({
      health: 100,
      healthUpdatedAt: "2026-01-01",
      seeEveryDays: 7,
      at,
    });
    const twoWeekInterval = healthAfterDecay({
      health: 100,
      healthUpdatedAt: "2026-01-01",
      seeEveryDays: 14,
      at,
    });
    // Same 7 days: loss 25 vs 12.5
    expect(weekInterval.health).toBeCloseTo(75, 5);
    expect(twoWeekInterval.health).toBeCloseTo(87.5, 5);
  });
});

describe("isWaterAlreadyLoggedThisWeek (chatted this week / weekly water)", () => {
  it("is false when nothing has been logged", () => {
    expect(isWaterAlreadyLoggedThisWeek(null, new Date(2026, 0, 7))).toBe(
      false,
    );
  });

  it("stays true for every day in the same Monday-start week after logging", () => {
    const wednesday = new Date(2026, 0, 7);
    const loggedWeekKey = startOfCalendarWeekKey(wednesday);
    expect(isWaterAlreadyLoggedThisWeek(loggedWeekKey, wednesday)).toBe(true);
    expect(isWaterAlreadyLoggedThisWeek(loggedWeekKey, new Date(2026, 0, 5))).toBe(
      true,
    );
    expect(isWaterAlreadyLoggedThisWeek(loggedWeekKey, new Date(2026, 0, 11))).toBe(
      true,
    );
  });

  it("is false again in the next calendar week", () => {
    const wednesday = new Date(2026, 0, 7);
    const loggedWeekKey = startOfCalendarWeekKey(wednesday);
    expect(isWaterAlreadyLoggedThisWeek(loggedWeekKey, new Date(2026, 0, 12))).toBe(
      false,
    );
  });
});
