"use client";

import { useState } from "react";
import { BookOpen, Layers, ListTree, Settings, Zap } from "lucide-react";
import { Dock } from "./Dock";
import { NotesView } from "./NotesView";
import { PlaceholderView } from "./PlaceholderView";
import { SettingsPanel } from "./SettingsPanel";
import type { Section } from "./sections";

const PLACEHOLDERS: Record<
  Exclude<Section, "notes">,
  {
    kicker: string;
    title: string;
    description: string;
    contents: string[];
    icon: React.ReactNode;
  }
> = {
  vocabulary: {
    kicker: "Chapter 02 · Words",
    title: "Vocabulary",
    description:
      "Every word your notes give up, kept the way a magazine keeps an index — gender, plural, the lot.",
    contents: [
      "Words extracted from your own notes",
      "Gender and plural for every noun",
      "Phonetics you can actually say out loud",
    ],
    icon: <BookOpen strokeWidth={1.5} className="h-8 w-8 sm:h-9 sm:w-9" />,
  },
  verbs: {
    kicker: "Chapter 03 · Action",
    title: "Verbs",
    description:
      "Conjugations and phonetics for the verbs you actually meet — not the ones a textbook thinks you should.",
    contents: [
      "The verbs your notes keep mentioning",
      "The conjugations that matter first",
      "Sound-it-out phonetics beside each form",
    ],
    icon: <Zap strokeWidth={1.5} className="h-8 w-8 sm:h-9 sm:w-9" />,
  },
  grammar: {
    kicker: "Chapter 04 · Rules",
    title: "Grammar",
    description:
      "The rules hiding in your notes, each with a short why — explained like a margin note, not a lecture.",
    contents: [
      "Rules surfaced from your own French",
      "A short, human why for each one",
      "Examples pulled from your notes",
    ],
    icon: <ListTree strokeWidth={1.5} className="h-8 w-8 sm:h-9 sm:w-9" />,
  },
  quiz: {
    kicker: "Chapter 05 · Recall",
    title: "Quiz",
    description:
      "Ten typed cards a day. Forget one and it comes back sooner; remember it and it drifts later.",
    contents: [
      "Ten typed cards, once a day",
      "Missed cards return sooner",
      "Known cards drift further out",
    ],
    icon: <Layers strokeWidth={1.5} className="h-8 w-8 sm:h-9 sm:w-9" />,
  },
};

export function AppShell() {
  const [section, setSection] = useState<Section>("notes");
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      <header className="fixed right-0 top-0 z-40 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          className="tooltip-trigger relative rounded-full border border-edge bg-surface/90 p-2.5 text-pink backdrop-blur-md transition-colors hover:border-pink-hot/60 hover:text-pink-pale"
        >
          <span
            role="tooltip"
            className="tooltip mono-label absolute -bottom-10 right-0 whitespace-nowrap rounded-lg border border-edge bg-surface px-2.5 py-1.5 text-[0.7rem] text-pink-hot shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
          >
            Settings
          </span>
          <Settings strokeWidth={1.6} className="h-[1.35rem] w-[1.35rem]" />
        </button>
      </header>

      <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-5 pb-40 pt-16 sm:px-8 sm:pt-24">
        {section === "notes" ? (
          <NotesView />
        ) : (
          <PlaceholderView {...PLACEHOLDERS[section]} />
        )}
      </main>

      <Dock active={section} onSelect={setSection} />

      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
