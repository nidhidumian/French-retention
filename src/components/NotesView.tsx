"use client";

import { useEffect, useState } from "react";
import { Library, Plus, Trash2 } from "lucide-react";
import {
  addNote,
  deleteNote,
  listNotes,
  type Note,
} from "@/services/notes";
import { BackLink, Kicker } from "./editorial";

type NotesScreen = "home" | "add" | "library";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function NotesView({ userId }: { userId: string }) {
  const [screen, setScreen] = useState<NotesScreen>("home");
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  // localStorage only exists in the browser, so load after mount.
  useEffect(() => {
    const result = listNotes(userId);
    if (result.ok) setNotes(result.notes);
  }, [userId]);

  function handleSave() {
    const result = addNote(userId, draft);
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
    const result = deleteNote(userId, id);
    if (result.ok) setNotes(result.notes);
  }

  if (screen === "add") {
    return (
      <section className="mx-auto w-full max-w-2xl">
        <BackLink onClick={() => setScreen("home")} />
        <Kicker className="mt-6">New entry</Kicker>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-pink sm:text-5xl">
          Dump a note
        </h1>
        <blockquote className="mt-6 border-l-[3px] border-coral pl-4 sm:pl-5">
          <p className="text-lg italic leading-relaxed text-quote sm:text-xl">
            Whatever today&apos;s French left behind — a phrase, a correction,
            a word that surprised you.
          </p>
        </blockquote>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          placeholder="ex. « Je viens de finir » — just finished. venir de + infinitif…"
          className="mt-7 h-56 w-full resize-none rounded-card border border-edge bg-surface p-5 text-lg leading-relaxed text-cream placeholder:text-cream-dim/50 focus:border-pink-hot/60 focus:outline-none sm:h-64"
        />
        {error && <p className="mt-2 text-sm text-coral">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="mono-label rounded-full bg-pink-pale px-6 py-2.5 text-[0.78rem] text-surface transition-opacity hover:opacity-90"
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
            className="mono-label rounded-full border border-edge px-6 py-2.5 text-[0.78rem] text-cream-dim transition-colors hover:border-edge hover:text-cream"
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
        <BackLink onClick={() => setScreen("home")} />
        <Kicker className="mt-6">The shelf</Kicker>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-pink sm:text-5xl">
            Notes library
          </h1>
          <span className="mono-label text-[0.72rem] text-cream-dim">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </span>
        </div>
        {notes.length === 0 ? (
          <div className="mt-8 rounded-card border border-edge bg-surface p-6 sm:p-7">
            <p className="text-lg italic leading-relaxed text-quote">
              Nothing on the shelf yet. Dump your first note and it will show
              up here by date.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-card border border-edge bg-surface px-5 py-4 sm:px-6 sm:py-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="mono-label text-[0.7rem] text-pink-hot">
                    {dateFormat.format(new Date(note.createdAt))}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    aria-label="Delete note"
                    className="text-cream-dim/50 transition-colors hover:text-coral"
                  >
                    <Trash2 strokeWidth={1.6} className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2.5 whitespace-pre-wrap text-[1.05rem] leading-relaxed text-cream">
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
      <Kicker>Mes notes de français</Kicker>
      <h1 className="mt-2 text-5xl font-bold leading-[1.05] tracking-tight text-pink sm:text-6xl">
        Notes
      </h1>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-cream sm:text-xl">
        Add your French notes here, and get vocabulary (with
        masculine/feminine + plural/singular variations), verbs and grammar
        rules extracted and organised from your notes.
      </p>
      <button
        type="button"
        onClick={() => setScreen("add")}
        className="mono-label mt-6 inline-block rounded-full bg-pink-pale px-3.5 py-1.5 text-[0.72rem] text-surface transition-opacity hover:opacity-90"
      >
        Start adding notes
      </button>

      <hr className="hairline mt-9 border-t" />

      <div className="mt-9 space-y-4 sm:space-y-5">
        <HomeCard
          tag="Dump"
          title="Add notes"
          sub="Today's French"
          description="A phrase, a correction, a word that surprised you. Add it all here."
          onClick={() => setScreen("add")}
          icon={<Plus strokeWidth={1.6} className="h-6 w-6" />}
        />
        <HomeCard
          tag="Shelf"
          tagNote={`${notes.length} ${notes.length === 1 ? "note" : "notes"}`}
          title="Notes library"
          sub="By date, newest first"
          description="Everything you've dumped so far, in case you want to revisit your unfiltered notes."
          onClick={() => setScreen("library")}
          icon={<Library strokeWidth={1.6} className="h-6 w-6" />}
        />
      </div>
    </section>
  );
}

/**
 * Full-width editorial card, after the PLAN / BUILD / TEST cards on the
 * reference page: mono tag on the left (with an optional quiet count line
 * under it), bold pale-pink title with a mono subtitle, cream description.
 */
function HomeCard({
  tag,
  tagNote,
  title,
  sub,
  description,
  icon,
  onClick,
}: {
  tag: string;
  tagNote?: string;
  title: string;
  sub: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full rounded-card border border-edge bg-surface px-5 py-5 text-left transition-colors hover:border-pink-hot/60 hover:bg-surface-raised sm:px-7 sm:py-6"
    >
      <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[5rem_minmax(0,11rem)_1fr] sm:gap-6">
        {/* On mobile the icon sits on the tag row so the description keeps
            the full card width; on desktop it moves to the right. */}
        <span className="flex items-start justify-between sm:block sm:pt-0.5">
          <span className="flex flex-col gap-1">
            <span className="mono-label text-[0.72rem] text-pink-hot">
              {tag}
            </span>
            {tagNote && (
              <span className="mono-label text-[0.66rem] text-cream-dim">
                {tagNote}
              </span>
            )}
          </span>
          <span className="text-pink sm:hidden">{icon}</span>
        </span>
        <span className="flex flex-col gap-1">
          <span className="text-xl font-bold tracking-tight text-pink-pale">
            {title}
          </span>
          <span className="mono-label text-[0.66rem] text-cream-dim">
            {sub}
          </span>
        </span>
        <span className="flex items-start justify-between gap-4">
          <span className="max-w-md text-[1.02rem] leading-relaxed text-cream">
            {description}
          </span>
          <span className="hidden shrink-0 text-pink transition-transform group-hover:translate-x-0.5 sm:block">
            {icon}
          </span>
        </span>
      </div>
    </button>
  );
}
