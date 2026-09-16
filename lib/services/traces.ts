import { getDb, newId, nowIso } from "@/lib/db";

export type TraceKind = "extract" | "srs" | "email_quiz";

export function writeTrace(kind: TraceKind, payload: unknown): void {
  getDb()
    .prepare("INSERT INTO traces (id, kind, payload, created_at) VALUES (?, ?, ?, ?)")
    .run(newId(), kind, JSON.stringify(payload), nowIso());
}

export function listTraces(kind?: TraceKind, limit = 50) {
  const db = getDb();
  const rows = (
    kind
      ? db
          .prepare("SELECT * FROM traces WHERE kind = ? ORDER BY created_at DESC LIMIT ?")
          .all(kind, limit)
      : db.prepare("SELECT * FROM traces ORDER BY created_at DESC LIMIT ?").all(limit)
  ) as Array<{ id: string; kind: TraceKind; payload: string; created_at: string }>;
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    payload: JSON.parse(row.payload) as unknown,
    createdAt: row.created_at,
  }));
}
