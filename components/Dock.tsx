"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconGrammar,
  IconNotes,
  IconQuiz,
  IconVerbs,
  IconVocab,
} from "@/components/Icons";

const items = [
  { href: "/", label: "Notes", match: (path: string) => path === "/" || path.startsWith("/notes") },
  { href: "/vocab", label: "Vocab", match: (path: string) => path.startsWith("/vocab") },
  { href: "/verbs", label: "Verbs", match: (path: string) => path.startsWith("/verbs") },
  { href: "/grammar", label: "Grammar", match: (path: string) => path.startsWith("/grammar") },
  { href: "/quiz", label: "Quiz", match: (path: string) => path.startsWith("/quiz") },
] as const;

const icons = {
  Notes: IconNotes,
  Vocab: IconVocab,
  Verbs: IconVerbs,
  Grammar: IconGrammar,
  Quiz: IconQuiz,
};

export function Dock({ dueCount = 0 }: { dueCount?: number }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
    >
      <div className="mx-auto flex max-w-xl items-stretch gap-2 rounded-[1.6rem] border border-line bg-canvas/90 p-2 shadow-[0_-12px_40px_rgba(0,0,0,0.35)] backdrop-blur">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = icons[item.label];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl border px-1 py-2 text-center transition ${
                active
                  ? "border-pink/50 bg-surface-2 text-cream"
                  : "border-transparent text-pink"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="w-full truncate text-[10px] font-medium tracking-[0.12em] uppercase">
                {item.label}
              </span>
              {item.label === "Quiz" && dueCount > 0 ? (
                <span className="absolute -top-1 right-1 min-w-4 rounded-full bg-pink px-1 text-[10px] font-semibold text-canvas">
                  {dueCount > 99 ? "99+" : dueCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
