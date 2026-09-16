import "server-only";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  dumped_on TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  corrected_text TEXT,
  correction_why TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vocab (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL,
  term TEXT NOT NULL,
  gender TEXT,
  plural TEXT,
  meaning TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (note_id) REFERENCES notes(id)
);

CREATE TABLE IF NOT EXISTS verbs (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL,
  infinitive TEXT NOT NULL,
  phonetics TEXT,
  conjugations TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (note_id) REFERENCES notes(id)
);

CREATE TABLE IF NOT EXISTS grammar (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL,
  title TEXT NOT NULL,
  explanation TEXT NOT NULL,
  example TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (note_id) REFERENCES notes(id)
);

CREATE TABLE IF NOT EXISTS srs_cards (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  item_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  answer TEXT NOT NULL,
  due_at TEXT NOT NULL,
  interval_days REAL NOT NULL DEFAULT 0,
  ease REAL NOT NULL DEFAULT 2.5,
  reps INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS srs_cards_due_at ON srs_cards(due_at);
CREATE INDEX IF NOT EXISTS srs_cards_item ON srs_cards(kind, item_id);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  email TEXT,
  window_start_hour INTEGER NOT NULL DEFAULT 8,
  window_end_hour INTEGER NOT NULL DEFAULT 10,
  timezone TEXT NOT NULL DEFAULT 'Europe/Paris',
  last_email_sent_on TEXT
);

INSERT OR IGNORE INTO settings (id) VALUES (1);

CREATE TABLE IF NOT EXISTS traces (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;

type GlobalDb = typeof globalThis & { __frenchDb?: DatabaseSync };

function openDb(filename: string): DatabaseSync {
  if (filename !== ":memory:") {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
  }
  const db = new DatabaseSync(filename);
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(SCHEMA);
  return db;
}

export function defaultDbPath(): string {
  return process.env.FR_DB_PATH || path.join(process.cwd(), "data", "french.db");
}

export function getDb(): DatabaseSync {
  const g = globalThis as GlobalDb;
  if (!g.__frenchDb) {
    g.__frenchDb = openDb(defaultDbPath());
  }
  return g.__frenchDb;
}

export function resetDbForTests(): DatabaseSync {
  const g = globalThis as GlobalDb;
  g.__frenchDb = openDb(":memory:");
  return g.__frenchDb;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function newId(): string {
  return crypto.randomUUID();
}
