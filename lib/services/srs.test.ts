import { describe, expect, it } from "vitest";
import { hourInWindow, scheduleNext } from "@/lib/services/srs";

const base = {
  intervalDays: 0,
  ease: 2.5,
  reps: 0,
  lapses: 0,
};

describe("scheduleNext", () => {
  it("puts a forgot card due in about 10 minutes", () => {
    const now = new Date("2026-09-16T10:00:00.000Z");
    const next = scheduleNext(base, "forgot", now);
    expect(next.reps).toBe(0);
    expect(next.lapses).toBe(1);
    expect(next.ease).toBeLessThan(2.5);
    expect(new Date(next.dueAt).getTime() - now.getTime()).toBe(10 * 60 * 1000);
  });

  it("gives a first remember a 1 day gap", () => {
    const now = new Date("2026-09-16T10:00:00.000Z");
    const next = scheduleNext(base, "remembered", now);
    expect(next.reps).toBe(1);
    expect(next.intervalDays).toBe(1);
    expect(new Date(next.dueAt).getTime() - now.getTime()).toBe(24 * 60 * 60 * 1000);
  });

  it("grows the gap after a second remember", () => {
    const now = new Date("2026-09-16T10:00:00.000Z");
    const first = scheduleNext(base, "remembered", now);
    const second = scheduleNext(first, "remembered", now);
    expect(second.intervalDays).toBe(3);
  });
});

describe("hourInWindow", () => {
  it("treats a same-day window as inclusive", () => {
    expect(hourInWindow(8, 8, 10)).toBe(true);
    expect(hourInWindow(10, 8, 10)).toBe(true);
    expect(hourInWindow(11, 8, 10)).toBe(false);
  });

  it("handles an overnight window", () => {
    expect(hourInWindow(23, 22, 7)).toBe(true);
    expect(hourInWindow(6, 22, 7)).toBe(true);
    expect(hourInWindow(12, 22, 7)).toBe(false);
  });
});
