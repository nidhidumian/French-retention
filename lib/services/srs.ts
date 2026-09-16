import type { SrsCard } from "@/lib/types";

const MIN_EASE = 1.3;
const FORGOT_MINUTES = 10;

export type Grade = "remembered" | "forgot";

export function scheduleNext(
  card: Pick<SrsCard, "intervalDays" | "ease" | "reps" | "lapses">,
  grade: Grade,
  now = new Date(),
): Pick<SrsCard, "intervalDays" | "ease" | "reps" | "lapses" | "dueAt"> {
  if (grade === "forgot") {
    const ease = Math.max(MIN_EASE, card.ease - 0.2);
    const due = new Date(now.getTime() + FORGOT_MINUTES * 60 * 1000);
    return {
      intervalDays: FORGOT_MINUTES / (24 * 60),
      ease,
      reps: 0,
      lapses: card.lapses + 1,
      dueAt: due.toISOString(),
    };
  }

  const ease = card.ease + 0.1;
  let intervalDays: number;
  if (card.reps === 0) intervalDays = 1;
  else if (card.reps === 1) intervalDays = 3;
  else intervalDays = Math.max(1, card.intervalDays * ease);

  const due = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  return {
    intervalDays,
    ease,
    reps: card.reps + 1,
    lapses: card.lapses,
    dueAt: due.toISOString(),
  };
}

export function hourInWindow(hour: number, start: number, end: number): boolean {
  if (start === end) return hour === start;
  if (start < end) return hour >= start && hour <= end;
  return hour >= start || hour <= end;
}
