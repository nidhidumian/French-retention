"use client";

import {
  NotebookPen,
  BookOpen,
  Zap,
  ListTree,
  Layers,
  type LucideIcon,
} from "lucide-react";
import type { Section } from "./sections";

const ITEMS: { id: Section; label: string; Icon: LucideIcon }[] = [
  { id: "notes", label: "Notes", Icon: NotebookPen },
  { id: "vocabulary", label: "Vocabulary", Icon: BookOpen },
  { id: "verbs", label: "Verbs", Icon: Zap },
  { id: "grammar", label: "Grammar", Icon: ListTree },
  { id: "quiz", label: "Quiz", Icon: Layers },
];

/**
 * macOS-Finder-style dock: icons only, with the section name in a small
 * rounded tooltip above the icon on hover/focus/press. The active section
 * gets a pale-pink tint and a Finder-like dot under the icon.
 */
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
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.9rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex gap-1.5 rounded-card border border-edge bg-surface/95 px-2.5 py-2 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-md sm:gap-2 sm:px-3">
        {ITEMS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`tooltip-trigger relative flex h-[52px] w-[52px] items-center justify-center rounded-[0.8rem] border transition-colors sm:h-14 sm:w-14 ${
                isActive
                  ? "border-edge bg-surface-raised text-pink-pale"
                  : "border-transparent text-cream-dim hover:border-edge-soft hover:bg-surface-raised/60 hover:text-cream active:border-edge active:text-pink-pale"
              }`}
            >
              <span
                role="tooltip"
                className="tooltip mono-label absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-edge bg-surface px-2.5 py-1.5 text-[0.7rem] text-pink-hot shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
              >
                {label}
              </span>
              <Icon
                strokeWidth={1.6}
                className="h-6 w-6 sm:h-[1.6rem] sm:w-[1.6rem]"
              />
              <span
                aria-hidden
                className={`absolute bottom-1 h-1 w-1 rounded-full bg-pink transition-opacity ${
                  isActive ? "opacity-90" : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
