import { getDb, newId, nowIso } from "@/lib/db";
import {
  extractFromNote,
  grammarAnswer,
  grammarPrompt,
  verbAnswer,
  verbPrompt,
  vocabAnswer,
  vocabPrompt,
} from "@/lib/services/extract";
import { writeTrace } from "@/lib/services/traces";
import type { Grammar, Note, Verb, Vocab } from "@/lib/types";

type NoteRow = {
  id: string;
  dumped_on: string;
  raw_text: string;
  corrected_text: string | null;
  correction_why: string | null;
  created_at: string;
};

function mapNote(row: NoteRow): Note {
  return {
    id: row.id,
    dumpedOn: row.dumped_on,
    rawText: row.raw_text,
    correctedText: row.corrected_text,
    correctionWhy: row.correction_why,
    createdAt: row.created_at,
  };
}

export function countNotes(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM notes")
    .get() as { n: number };
  return row.n;
}

export function listNotes(): Note[] {
  const rows = getDb()
    .prepare("SELECT * FROM notes ORDER BY dumped_on DESC, created_at DESC")
    .all() as NoteRow[];
  return rows.map(mapNote);
}

export function getNote(id: string): Note | null {
  const row = getDb().prepare("SELECT * FROM notes WHERE id = ?").get(id) as
    | NoteRow
    | undefined;
  return row ? mapNote(row) : null;
}

export function listVocab(noteId?: string): Vocab[] {
  const db = getDb();
  const rows = (
    noteId
      ? db.prepare("SELECT * FROM vocab WHERE note_id = ? ORDER BY term").all(noteId)
      : db.prepare("SELECT * FROM vocab ORDER BY term").all()
  ) as Array<{
    id: string;
    note_id: string;
    term: string;
    gender: "m" | "f" | null;
    plural: string | null;
    meaning: string | null;
    created_at: string;
  }>;
  return rows.map((row) => ({
    id: row.id,
    noteId: row.note_id,
    term: row.term,
    gender: row.gender,
    plural: row.plural,
    meaning: row.meaning,
    createdAt: row.created_at,
  }));
}

export function listVerbs(noteId?: string): Verb[] {
  const db = getDb();
  const rows = (
    noteId
      ? db.prepare("SELECT * FROM verbs WHERE note_id = ? ORDER BY infinitive").all(noteId)
      : db.prepare("SELECT * FROM verbs ORDER BY infinitive").all()
  ) as Array<{
    id: string;
    note_id: string;
    infinitive: string;
    phonetics: string | null;
    conjugations: string;
    created_at: string;
  }>;
  return rows.map((row) => ({
    id: row.id,
    noteId: row.note_id,
    infinitive: row.infinitive,
    phonetics: row.phonetics,
    conjugations: JSON.parse(row.conjugations) as Record<string, string>,
    createdAt: row.created_at,
  }));
}

export function listGrammar(noteId?: string): Grammar[] {
  const db = getDb();
  const rows = (
    noteId
      ? db.prepare("SELECT * FROM grammar WHERE note_id = ? ORDER BY title").all(noteId)
      : db.prepare("SELECT * FROM grammar ORDER BY title").all()
  ) as Array<{
    id: string;
    note_id: string;
    title: string;
    explanation: string;
    example: string | null;
    created_at: string;
  }>;
  return rows.map((row) => ({
    id: row.id,
    noteId: row.note_id,
    title: row.title,
    explanation: row.explanation,
    example: row.example,
    createdAt: row.created_at,
  }));
}

function replaceExtracts(noteId: string, rawText: string): ReturnType<typeof extractFromNote> {
  const db = getDb();
  const extracted = extractFromNote(rawText);
  const createdAt = nowIso();

  const oldVocab = db.prepare("SELECT id FROM vocab WHERE note_id = ?").all(noteId) as Array<{
    id: string;
  }>;
  const oldVerbs = db.prepare("SELECT id FROM verbs WHERE note_id = ?").all(noteId) as Array<{
    id: string;
  }>;
  const oldGrammar = db.prepare("SELECT id FROM grammar WHERE note_id = ?").all(noteId) as Array<{
    id: string;
  }>;
  const oldIds = [
    ...oldVocab.map((row) => row.id),
    ...oldVerbs.map((row) => row.id),
    ...oldGrammar.map((row) => row.id),
  ];
  if (oldIds.length > 0) {
    const placeholders = oldIds.map(() => "?").join(",");
    db.prepare(`DELETE FROM srs_cards WHERE item_id IN (${placeholders})`).run(...oldIds);
  }
  db.prepare("DELETE FROM vocab WHERE note_id = ?").run(noteId);
  db.prepare("DELETE FROM verbs WHERE note_id = ?").run(noteId);
  db.prepare("DELETE FROM grammar WHERE note_id = ?").run(noteId);

  const insertCard = db.prepare(
    `INSERT INTO srs_cards (
      id, kind, item_id, prompt, answer, due_at, interval_days, ease, reps, lapses, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, 0, 2.5, 0, 0, ?)`,
  );

  for (const item of extracted.vocab) {
    const id = newId();
    db.prepare(
      `INSERT INTO vocab (id, note_id, term, gender, plural, meaning, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, noteId, item.term, item.gender, item.plural, item.meaning, createdAt);
    insertCard.run(newId(), "vocab", id, vocabPrompt(item), vocabAnswer(item), createdAt, createdAt);
  }

  for (const item of extracted.verbs) {
    const id = newId();
    db.prepare(
      `INSERT INTO verbs (id, note_id, infinitive, phonetics, conjugations, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      noteId,
      item.infinitive,
      item.phonetics,
      JSON.stringify(item.conjugations),
      createdAt,
    );
    insertCard.run(newId(), "verb", id, verbPrompt(item), verbAnswer(item), createdAt, createdAt);
  }

  for (const item of extracted.grammar) {
    const id = newId();
    db.prepare(
      `INSERT INTO grammar (id, note_id, title, explanation, example, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(id, noteId, item.title, item.explanation, item.example, createdAt);
    insertCard.run(
      newId(),
      "grammar",
      id,
      grammarPrompt(item),
      grammarAnswer(item),
      createdAt,
      createdAt,
    );
  }

  db.prepare(
    "UPDATE notes SET corrected_text = ?, correction_why = ? WHERE id = ?",
  ).run(extracted.correctedText, extracted.correctionWhy, noteId);

  writeTrace("extract", {
    noteId,
    vocab: extracted.vocab.length,
    verbs: extracted.verbs.length,
    grammar: extracted.grammar.length,
  });

  return extracted;
}

export function dumpNote(rawText: string, dumpedOn: string): Note {
  const text = rawText.trim();
  if (!text) throw new Error("Note is empty");
  if (text.length > 20000) throw new Error("Note is too long");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dumpedOn)) throw new Error("Date looks wrong");

  const db = getDb();
  const id = newId();
  const createdAt = nowIso();
  db.prepare(
    `INSERT INTO notes (id, dumped_on, raw_text, corrected_text, correction_why, created_at)
     VALUES (?, ?, ?, NULL, NULL, ?)`,
  ).run(id, dumpedOn, text, createdAt);

  replaceExtracts(id, text);
  const note = getNote(id);
  if (!note) throw new Error("Failed to save note");
  return note;
}

export function reextractNote(id: string): Note {
  const note = getNote(id);
  if (!note) throw new Error("Note not found");
  replaceExtracts(id, note.rawText);
  const updated = getNote(id);
  if (!updated) throw new Error("Note not found");
  return updated;
}

export function updateCorrection(id: string, correctedText: string, correctionWhy: string): Note {
  const note = getNote(id);
  if (!note) throw new Error("Note not found");
  getDb()
    .prepare("UPDATE notes SET corrected_text = ?, correction_why = ? WHERE id = ?")
    .run(correctedText.trim(), correctionWhy.trim(), id);
  const updated = getNote(id);
  if (!updated) throw new Error("Note not found");
  return updated;
}
