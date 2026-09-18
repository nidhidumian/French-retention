"use client";

import { useEffect, useState } from "react";
import { Library, MoveRight, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  addNote,
  deleteNote,
  listNotes,
  type Note,
} from "@/services/notes";
import { extractNote } from "@/services/extraction";
import { BackLink, Kicker, PrimaryPill, ScreenHeader } from "./editorial";

export type NotesScreen = "home" | "add" | "library" | "extract";

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

  // The note the extract screen is showing, plus its in-flight state.
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<{
    message: string;
    missingKey: boolean;
  } | null>(null);

  // localStorage only exists in the browser, so load after mount.
  useEffect(() => {
    const result = listNotes(userId);
    if (result.ok) setNotes(result.notes);
  }, [userId]);

  async function runExtraction(note: Note) {
    setActiveNote(note);
    setExtractError(null);
    setExtracting(true);
    setScreen("extract");

    const outcome = await extractNote(userId, note);
    setExtracting(false);
    if (!outcome.ok) {
      setExtractError({ message: outcome.error, missingKey: outcome.missingKey });
      return;
    }
    // Re-read so the library list shows the extraction badge too.
    const refreshed = listNotes(userId);
    if (refreshed.ok) setNotes(refreshed.notes);
    setActiveNote({ ...note, extraction: outcome.extraction });
  }

  function handleSave() {
    const result = addNote(userId, draft);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotes(result.notes);
    setDraft("");
    setError(null);
    // listNotes sorts newest first, so the note just saved is at the top.
    void runExtraction(result.notes[0]);
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

  if (screen === "extract" && activeNote) {
    return (
      <ExtractScreen
        note={activeNote}
        extracting={extracting}
        error={extractError}
        onRetry={() => void runExtraction(activeNote)}
        onDone={() => setScreen("library")}
      />
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
                <button
                  type="button"
                  onClick={() => {
                    if (note.extraction) {
                      setActiveNote(note);
                      setExtractError(null);
                      setScreen("extract");
                    } else {
                      void runExtraction(note);
                    }
                  }}
                  className="mono-label mt-4 flex items-center gap-1.5 text-[0.7rem] text-pink-hot transition-colors hover:text-pink-pale"
                >
                  <Sparkles strokeWidth={1.6} className="h-3.5 w-3.5" />
                  {note.extraction ? "See corrections & extracts" : "Extract"}
                </button>
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
 * What happens after a note is saved (or Extract is tapped): a loading
 * beat while the note is corrected and mined, then the corrected note,
 * every fix with its why, and how much landed in the libraries.
 */
function ExtractScreen({
  note,
  extracting,
  error,
  onRetry,
  onDone,
}: {
  note: Note;
  extracting: boolean;
  error: { message: string; missingKey: boolean } | null;
  onRetry: () => void;
  onDone: () => void;
}) {
  if (extracting) {
    return (
      <section className="mx-auto w-full max-w-2xl">
        <Kicker className="mt-8">Reading your note</Kicker>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-pink sm:text-5xl">
          Extracting…
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-cream/90">
          Correcting the French and pulling out the words, verbs and rules
          worth keeping. A few seconds.
        </p>
        <div className="mt-8 animate-pulse rounded-card border border-edge bg-surface p-6 sm:p-7">
          <p className="whitespace-pre-wrap text-[1.05rem] leading-relaxed text-cream-dim">
            {note.text}
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-2xl">
        <BackLink onClick={onDone} />
        <Kicker className="mt-8">Extraction paused</Kicker>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-pink sm:text-5xl">
          {error.missingKey ? "One key missing" : "That didn't work"}
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-cream/90">
          {error.message}
        </p>
        <p className="mt-3 max-w-lg text-[1.02rem] leading-relaxed text-cream-dim">
          Your note is safe on the shelf — extraction can run on it any time.
        </p>
        {!error.missingKey && (
          <PrimaryPill onClick={onRetry} className="mt-7">
            Try again
          </PrimaryPill>
        )}
      </section>
    );
  }

  const extraction = note.extraction;
  if (!extraction) return null;
  const { counts } = extraction;

  return (
    <section className="mx-auto w-full max-w-2xl">
      <BackLink onClick={onDone} />
      <Kicker className="mt-8">Corrected &amp; extracted</Kicker>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-pink sm:text-5xl">
        Your note, polished
      </h1>

      <div className="mt-8 rounded-card border border-edge bg-surface p-6 sm:p-7">
        <p className="mono-label text-[0.7rem] text-pink-hot">Corrected note</p>
        <p className="mt-3 whitespace-pre-wrap text-[1.05rem] leading-relaxed text-cream">
          {extraction.correctedText}
        </p>
      </div>

      <p className="mono-label mt-10 text-[0.7rem] text-pink-hot">
        What changed and why
      </p>
      {extraction.corrections.length === 0 ? (
        <p className="mt-3 text-lg leading-relaxed text-cream/90">
          Nothing to fix — this note was already right.
        </p>
      ) : (
        <ul className="mt-2">
          {extraction.corrections.map((c, i) => (
            <li
              key={`${c.original}-${i}`}
              className="hairline border-b py-5"
            >
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[1.02rem] leading-relaxed">
                <span className="text-cream-dim line-through decoration-coral/70">
                  {c.original}
                </span>
                <MoveRight
                  strokeWidth={1.6}
                  className="h-4 w-4 shrink-0 text-pink-hot"
                  aria-hidden
                />
                <span className="font-bold text-pink-pale">{c.corrected}</span>
              </p>
              <p className="mt-2 text-[0.98rem] leading-relaxed text-cream/85">
                {c.why}
              </p>
            </li>
          ))}
        </ul>
      )}

      {extraction.encouragement && (
        <p className="mt-8 text-[1.02rem] italic leading-relaxed text-quote">
          {extraction.encouragement}
        </p>
      )}

      <p className="mono-label mt-10 text-[0.7rem] text-pink-hot">
        Added to your libraries
      </p>
      <p className="mt-3 text-lg leading-relaxed text-cream/90">
        {counts.words} {counts.words === 1 ? "word" : "words"} · {counts.verbs}{" "}
        {counts.verbs === 1 ? "verb" : "verbs"} · {counts.rules}{" "}
        {counts.rules === 1 ? "rule" : "rules"} — find them under Vocabulary,
        Verbs and Grammar in the dock. Repeats reinforce what&apos;s already
        there.
      </p>

      <PrimaryPill onClick={onDone} className="mt-8">
        Done
      </PrimaryPill>
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
