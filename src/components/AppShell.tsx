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
  { title: string; description: string; icon: React.ReactNode }
> = {
  vocabulary: {
    title: "Vocabulary",
    description:
      "Every word your notes give up — gender, plural, the lot. Extraction arrives in the next milestone.",
    icon: <BookOpen strokeWidth={1.5} className="h-11 w-11" />,
  },
  verbs: {
    title: "Verbs",
    description:
      "Conjugations and phonetics for the verbs you actually meet. Extraction arrives in the next milestone.",
    icon: <Zap strokeWidth={1.5} className="h-11 w-11" />,
  },
  grammar: {
    title: "Grammar",
    description:
      "The rules hiding in your notes, each with a short why. Extraction arrives in the next milestone.",
    icon: <ListTree strokeWidth={1.5} className="h-11 w-11" />,
  },
  quiz: {
    title: "Quiz",
    description:
      "Ten typed cards a day. Forget one and it comes back sooner; remember it and it drifts later. Coming after extraction.",
    icon: <Layers strokeWidth={1.5} className="h-11 w-11" />,
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
          className="group relative rounded-full border border-edge bg-surface/80 p-2.5 text-pink-dim backdrop-blur-md transition-colors hover:border-edge-strong hover:text-pink"
        >
          <span
            role="tooltip"
            className="pointer-events-none absolute -bottom-10 right-0 whitespace-nowrap rounded-lg border border-edge bg-surface px-2.5 py-1 text-xs font-semibold tracking-wide text-pink opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-opacity duration-100 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            Settings
          </span>
          <Settings strokeWidth={1.7} className="h-[1.35rem] w-[1.35rem]" />
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
