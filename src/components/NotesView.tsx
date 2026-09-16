"use client";

import { useEffect, useState } from "react";
import {
  addNote,
  deleteNote,
  listNotes,
  type Note,
} from "@/services/notes";
import { BackIcon, BookIcon, PlusIcon, TrashIcon } from "./icons";

type NotesScreen = "home" | "add" | "library";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function NotesView() {
  const [screen, setScreen] = useState<NotesScreen>("home");
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  // localStorage only exists in the browser, so load after mount.
  useEffect(() => {
    const result = listNotes();
    if (result.ok) setNotes(result.notes);
  }, []);

  function handleSave() {
    const result = addNote(draft);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotes(result.notes);
    setDraft("");
    setError(null);
    setScreen("library");
  }

  function handleDelete(id: string) {
    const result = deleteNote(id);
    if (result.ok) setNotes(result.notes);
  }

  if (screen === "add") {
    return (
      <section className="mx-auto w-full max-w-2xl">
        <BackButton onClick={() => setScreen("home")} />
        <h1 className="mt-4 text-3xl font-bold text-pink sm:text-4xl">
          Dump a note
        </h1>
        <p className="mt-2 text-sm text-cream-dim">
          Anything from today&apos;s French — phrases, corrections, words you
          met. Saved on this device for now.
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          placeholder="ex. « Je viens de finir » — just finished. venir de + infinitif…"
          className="mt-5 h-56 w-full resize-none rounded-card border border-edge bg-surface p-4 text-base text-cream placeholder:text-cream-dim/50 focus:border-edge-strong focus:outline-none sm:h-64"
        />
        {error && <p className="mt-2 text-sm text-coral">{error}</p>}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-pink px-6 py-2.5 text-sm font-bold text-maroon transition-opacity hover:opacity-90"
          >
            Save note
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft("");
              setError(null);
              setScreen("home");
            }}
            className="rounded-full border border-edge px-6 py-2.5 text-sm font-semibold text-cream-dim transition-colors hover:text-cream"
          >
            Cancel
          </button>
        </div>
      </section>
    );
  }

  if (screen === "library") {
    return (
      <section className="mx-auto w-full max-w-2xl">
        <BackButton onClick={() => setScreen("home")} />
        <div className="mt-4 flex items-baseline gap-3">
          <h1 className="text-3xl font-bold text-pink sm:text-4xl">
            Notes library
          </h1>
          <span className="rounded-full bg-pink px-2.5 py-0.5 text-sm font-bold text-maroon">
            {notes.length}
          </span>
        </div>
        {notes.length === 0 ? (
          <p className="mt-6 rounded-card border border-edge bg-surface p-6 text-sm text-cream-dim">
            Nothing here yet. Dump your first note and it will show up by
            date.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="group rounded-card border border-edge bg-surface p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="label-caps text-xs font-semibold text-pink-dim">
                    {dateFormat.format(new Date(note.createdAt))}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    aria-label="Delete note"
                    className="text-cream-dim/50 transition-colors hover:text-coral"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-cream">
                  {note.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <p className="label-caps text-sm font-semibold text-pink-dim">
        French retention
      </p>
      <h1 className="mt-1 text-3xl font-bold text-pink sm:text-4xl">Notes</h1>
      <p className="mt-2 max-w-md text-sm text-cream-dim">
        Dump what you learned; the app will turn it into vocab, verbs and
        grammar to retain.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:gap-5">
        <HomeTile
          label="Add note"
          hint="Open the dump"
          onClick={() => setScreen("add")}
        >
          <PlusIcon className="h-9 w-9 sm:h-10 sm:w-10" />
        </HomeTile>
        <HomeTile
          label="Notes library"
          hint="Saved by date"
          onClick={() => setScreen("library")}
          badge={notes.length}
        >
          <BookIcon className="h-9 w-9 sm:h-10 sm:w-10" />
        </HomeTile>
      </div>
    </section>
  );
}

function HomeTile({
  label,
  hint,
  badge,
  onClick,
  children,
}: {
  label: string;
  hint: string;
  badge?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex aspect-square flex-col items-center justify-center gap-3 rounded-tile border border-edge bg-surface text-pink transition-colors hover:border-edge-strong hover:bg-surface-raised sm:aspect-[4/3]"
    >
      {badge !== undefined && (
        <span className="absolute right-4 top-4 min-w-7 rounded-full bg-pink px-2 py-0.5 text-center text-sm font-bold text-maroon">
          {badge}
        </span>
      )}
      {children}
      <span className="flex flex-col items-center gap-0.5">
        <span className="text-base font-bold text-cream sm:text-lg">
          {label}
        </span>
        <span className="label-caps text-xs text-pink-dim">{hint}</span>
      </span>
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm font-semibold text-pink-dim transition-colors hover:text-pink"
    >
      <BackIcon className="h-4 w-4" />
      Notes
    </button>
  );
}
