"use client";

import { useEffect, useState } from "react";
import { Library, Plus, Trash2 } from "lucide-react";
import {
  addNote,
  deleteNote,
  listNotes,
  type Note,
} from "@/services/notes";
import { BackLink, Kicker, PrimaryPill, ScreenHeader } from "./editorial";

export type NotesScreen = "home" | "add" | "library";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function NotesView({
  userId,
  initialScreen = "home",
}: {
  userId: string;
  initialScreen?: NotesScreen;
}) {
  const [screen, setScreen] = useState<NotesScreen>(initialScreen);
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
        <Kicker className="mt-8">New entry</Kicker>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-pink sm:text-5xl">
          Dump a note
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-cream/90">
          Whatever today&apos;s French left behind — a phrase, a correction, a
          word that surprised you.
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          placeholder="ex. « Je viens de finir » — just finished. venir de + infinitif…"
          className="mt-8 h-56 w-full resize-none rounded-card border border-edge bg-surface p-6 text-lg leading-relaxed text-cream placeholder:text-cream-dim/50 focus:border-pink-hot/60 focus:outline-none sm:h-64"
        />
        {error && <p className="mt-3 text-sm text-coral">{error}</p>}
        <div className="mt-6 flex items-center gap-5">
          <PrimaryPill onClick={handleSave}>Save note</PrimaryPill>
          <button
            type="button"
            onClick={() => {
              setDraft("");
              setError(null);
              setScreen("home");
            }}
            className="mono-label text-[0.72rem] text-cream-dim transition-colors hover:text-cream"
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
        <Kicker className="mt-8">The shelf</Kicker>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-pink sm:text-5xl">
            Notes library
          </h1>
          <span className="mono-label text-[0.72rem] text-cream-dim">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </span>
        </div>
        {notes.length === 0 ? (
          <div className="mt-10 rounded-card border border-edge bg-surface p-7 sm:p-8">
            <p className="text-lg leading-relaxed text-cream/90">
              Nothing on the shelf yet. Your notes will line up here by date.
            </p>
            <PrimaryPill onClick={() => setScreen("add")} className="mt-6">
              Dump a note
            </PrimaryPill>
          </div>
        ) : (
          <ul className="mt-10 space-y-4">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-card border border-edge bg-surface px-6 py-5 sm:px-7"
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
                <p className="mt-3 whitespace-pre-wrap text-[1.05rem] leading-relaxed text-cream">
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
      <ScreenHeader
        kicker="Mes notes de français"
        title="Notes"
        standfirst="Add your French notes here, and get vocabulary (with masculine/feminine + plural/singular variations), verbs and grammar rules extracted and organised from your notes."
      />
      <PrimaryPill onClick={() => setScreen("add")} className="mt-7">
        Start adding notes
      </PrimaryPill>

      <div className="mt-10 space-y-4">
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
 * Calm, tappable card: one eyebrow row (tag + icon, with an optional quiet
 * count), a bold title, a mono subtitle, and one line of body copy. Stacks
 * the same way at every width so nothing reflows into clutter.
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
      className="block w-full rounded-card border border-edge bg-surface px-6 py-6 text-left transition-colors hover:border-pink-hot/60 hover:bg-surface-raised sm:px-8"
    >
      <span className="flex items-start justify-between gap-4">
        <span className="flex flex-col gap-1">
          <span className="mono-label text-[0.7rem] text-pink-hot">{tag}</span>
          {tagNote && (
            <span className="mono-label text-[0.66rem] text-cream-dim">
              {tagNote}
            </span>
          )}
        </span>
        <span aria-hidden className="text-pink/80">
          {icon}
        </span>
      </span>
      <span className="mt-3 block text-2xl font-bold tracking-tight text-pink-pale">
        {title}
      </span>
      <span className="mono-label mt-1 block text-[0.66rem] text-cream-dim">
        {sub}
      </span>
      <span className="mt-3 block max-w-md text-[1.02rem] leading-relaxed text-cream/85">
        {description}
      </span>
    </button>
  );
}
