/**
 * Notes service — owns how notes are stored and retrieved.
 *
 * Storage is localStorage for now (shell-UI milestone). The rest of the app
 * only talks to this module, so swapping in an API/database later means
 * changing this file only.
 */

export type Note = {
  id: string;
  text: string;
  createdAt: string; // ISO timestamp
};

export type NotesResult =
  | { ok: true; notes: Note[] }
  | { ok: false; error: string };

const STORAGE_KEY = "french-retention.notes.v1";

function readAll(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n): n is Note =>
        typeof n === "object" &&
        n !== null &&
        typeof n.id === "string" &&
        typeof n.text === "string" &&
        typeof n.createdAt === "string"
    );
  } catch {
    return [];
  }
}

function writeAll(notes: Note[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch {
    return false;
  }
}

export function listNotes(): NotesResult {
  // Newest first — the app shows notes by date.
  const notes = [...readAll()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  return { ok: true, notes };
}

export function addNote(text: string): NotesResult {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Note is empty." };
  const note: Note = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text: trimmed,
    createdAt: new Date().toISOString(),
  };
  const all = [...readAll(), note];
  if (!writeAll(all)) return { ok: false, error: "Could not save note." };
  return listNotes();
}

export function deleteNote(id: string): NotesResult {
  const all = readAll().filter((n) => n.id !== id);
  if (!writeAll(all)) return { ok: false, error: "Could not delete note." };
  return listNotes();
}
