"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Dock } from "./Dock";
import { NotesView } from "./NotesView";
import { PlaceholderView } from "./PlaceholderView";
import { SettingsPanel } from "./SettingsPanel";
import { VerbsView } from "./VerbsView";
import { VocabularyView } from "./VocabularyView";
import { TicketCheckIcon, TimerIcon } from "./icons";
import type { Section } from "./sections";
import type { FrenchProfile } from "@/services/onboarding";

const PLACEHOLDERS: Record<
  "grammar" | "quiz",
  {
    kicker: string;
    title: string;
    description: string;
    contents: string[];
    icon: React.ReactNode;
  }
> = {
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
    icon: (
      <TicketCheckIcon strokeWidth={1.5} className="h-8 w-8 sm:h-9 sm:w-9" />
    ),
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
    icon: <TimerIcon strokeWidth={1.5} className="h-8 w-8 sm:h-9 sm:w-9" />,
  },
};

export function AppShell({
  userId,
  firstName,
  email,
  profile,
}: {
  userId: string;
  firstName: string | null;
  email: string | null;
  profile: FrenchProfile;
}) {
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
        {section === "notes" && <NotesView userId={userId} />}
        {section === "vocabulary" && <VocabularyView userId={userId} />}
        {section === "verbs" && (
          <VerbsView userId={userId} profile={profile} />
        )}
        {(section === "grammar" || section === "quiz") && (
          <PlaceholderView {...PLACEHOLDERS[section]} />
        )}
      </main>

      <Dock active={section} onSelect={setSection} />

      {settingsOpen && (
        <SettingsPanel
          onClose={() => setSettingsOpen(false)}
          firstName={firstName}
          email={email}
          profile={profile}
        />
      )}
    </div>
  );
}
