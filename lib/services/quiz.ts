import { getDb } from "@/lib/db";
import { scheduleNext, type Grade } from "@/lib/services/srs";
import { writeTrace } from "@/lib/services/traces";
import type { QuizCard, SrsCard, SrsKind } from "@/lib/types";

const SESSION_SIZE = 10;

type CardRow = {
  id: string;
  kind: SrsKind;
  item_id: string;
  prompt: string;
  answer: string;
  due_at: string;
  interval_days: number;
  ease: number;
  reps: number;
  lapses: number;
  created_at: string;
};

function mapCard(row: CardRow): SrsCard {
  return {
    id: row.id,
    kind: row.kind,
    itemId: row.item_id,
    prompt: row.prompt,
    answer: row.answer,
    dueAt: row.due_at,
    intervalDays: row.interval_days,
    ease: row.ease,
    reps: row.reps,
    lapses: row.lapses,
    createdAt: row.created_at,
  };
}

export function countDueCards(now = new Date()): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM srs_cards WHERE due_at <= ?")
    .get(now.toISOString()) as { n: number };
  return row.n;
}

export function startQuiz(now = new Date()): QuizCard[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM srs_cards
       WHERE due_at <= ?
       ORDER BY due_at ASC
       LIMIT ?`,
    )
    .all(now.toISOString(), SESSION_SIZE) as CardRow[];
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    prompt: row.prompt,
    answer: row.answer,
  }));
}

export function gradeCard(cardId: string, grade: Grade, now = new Date()): SrsCard {
  const row = getDb().prepare("SELECT * FROM srs_cards WHERE id = ?").get(cardId) as
    | CardRow
    | undefined;
  if (!row) throw new Error("Card not found");
  const card = mapCard(row);
  const next = scheduleNext(card, grade, now);
  getDb()
    .prepare(
      `UPDATE srs_cards
       SET due_at = ?, interval_days = ?, ease = ?, reps = ?, lapses = ?
       WHERE id = ?`,
    )
    .run(next.dueAt, next.intervalDays, next.ease, next.reps, next.lapses, cardId);
  writeTrace("srs", {
    cardId,
    kind: card.kind,
    grade,
    dueAt: next.dueAt,
    intervalDays: next.intervalDays,
  });
  return { ...card, ...next };
}
