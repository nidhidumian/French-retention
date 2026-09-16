"use client";

import { useState } from "react";
import { Dock } from "./Dock";
import { NotesView } from "./NotesView";
import { PlaceholderView } from "./PlaceholderView";
import { SettingsPanel } from "./SettingsPanel";
import type { Section } from "./sections";
import {
  BoltIcon,
  CardsIcon,
  GearIcon,
  LayersIcon,
  WordIcon,
} from "./icons";

const PLACEHOLDERS: Record<
  Exclude<Section, "notes">,
  { title: string; description: string; icon: React.ReactNode }
> = {
  vocabulary: {
    title: "Vocabulary",
    description:
      "Words pulled from your notes, with gender (m/f) and plurals. Extraction lands in the next milestone.",
    icon: <WordIcon className="h-11 w-11" />,
  },
  verbs: {
    title: "Verbs",
    description:
      "Conjugations and phonetics for the verbs you meet in your notes. Extraction lands in the next milestone.",
    icon: <BoltIcon className="h-11 w-11" />,
  },
  grammar: {
    title: "Grammar",
    description:
      "Grammar points spotted in your notes, with short corrections and whys. Extraction lands in the next milestone.",
    icon: <LayersIcon className="h-11 w-11" />,
  },
  quiz: {
    title: "Quiz",
    description:
      "Ten-card typed sessions driven by spaced repetition — forgot comes back sooner, remembered later. Coming after extraction.",
    icon: <CardsIcon className="h-11 w-11" />,
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
          className="rounded-full border border-edge bg-surface/80 p-2.5 text-pink-dim backdrop-blur-md transition-colors hover:border-edge-strong hover:text-pink"
        >
          <GearIcon className="h-5 w-5" />
        </button>
      </header>

      <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-5 pb-36 pt-16 sm:px-8 sm:pt-24">
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
