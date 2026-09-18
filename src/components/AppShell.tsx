"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Dock } from "./Dock";
import { GrammarView } from "./GrammarView";
import { NotesView } from "./NotesView";
import { PlaceholderView } from "./PlaceholderView";
import { SettingsPanel } from "./SettingsPanel";
import { VerbsView } from "./VerbsView";
import { VocabularyView } from "./VocabularyView";
import { TimerIcon } from "./icons";
import type { Section } from "./sections";
import type { FrenchProfile } from "@/services/onboarding";

const PLACEHOLDERS: Record<
  "quiz",
  {
    kicker: string;
    title: string;
    description: string;
    contents: string[];
    icon: React.ReactNode;
  }
> = {
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
  // When an empty state's "Dump a note" is tapped, land on Notes with the
  // editor already open. Cleared on any normal dock navigation.
  const [pendingDump, setPendingDump] = useState(false);

  function selectSection(next: Section) {
    setPendingDump(false);
    setSection(next);
  }

  function goDumpNote() {
    setPendingDump(true);
    setSection("notes");
  }

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

      <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-5 pb-44 pt-20 sm:px-8 sm:pt-24">
        {section === "notes" && (
          <NotesView
            key={pendingDump ? "dump" : "browse"}
            userId={userId}
            initialScreen={pendingDump ? "add" : "home"}
          />
        )}
        {section === "vocabulary" && (
          <VocabularyView userId={userId} onDumpNote={goDumpNote} />
        )}
        {section === "verbs" && (
          <VerbsView userId={userId} profile={profile} onDumpNote={goDumpNote} />
        )}
        {section === "grammar" && (
          <GrammarView userId={userId} onDumpNote={goDumpNote} />
        )}
        {section === "quiz" && <PlaceholderView {...PLACEHOLDERS.quiz} />}
      </main>

      <Dock active={section} onSelect={selectSection} />

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
