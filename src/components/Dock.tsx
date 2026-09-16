"use client";

import {
  NoteIcon,
  WordIcon,
  BoltIcon,
  LayersIcon,
  CardsIcon,
} from "./icons";
import type { Section } from "./sections";

const ITEMS: {
  id: Section;
  label: string;
  Icon: (p: { className?: string }) => React.ReactNode;
}[] = [
  { id: "notes", label: "Notes", Icon: NoteIcon },
  { id: "vocabulary", label: "Vocabulary", Icon: WordIcon },
  { id: "verbs", label: "Verbs", Icon: BoltIcon },
  { id: "grammar", label: "Grammar", Icon: LayersIcon },
  { id: "quiz", label: "Quiz", Icon: CardsIcon },
];

export function Dock({
  active,
  onSelect,
}: {
  active: Section;
  onSelect: (s: Section) => void;
}) {
  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex w-full max-w-2xl gap-2 rounded-card border border-edge bg-surface/90 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md sm:gap-3 sm:p-2.5">
        {ITEMS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 rounded-[0.9rem] border px-1 py-2 transition-colors sm:py-2.5 ${
                isActive
                  ? "border-edge-strong bg-surface-raised text-pink"
                  : "border-transparent text-cream-dim hover:border-edge hover:text-cream"
              }`}
            >
              <Icon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" />
              <span className="label-caps text-[0.66rem] font-semibold sm:text-xs">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
