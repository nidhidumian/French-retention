"use client";

import { MoveRight } from "lucide-react";
import { ScreenHeader } from "./editorial";

/**
 * Editorial empty state for sections that ship in a later milestone:
 * shared screen header, a quiet "coming next" tag, then a numbered
 * contents-style list of what will arrive here.
 */
export function PlaceholderView({
  kicker,
  title,
  description,
  contents,
  icon,
}: {
  kicker: string;
  title: string;
  description: string;
  contents: string[];
  icon: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-2xl">
      <ScreenHeader
        kicker={kicker}
        title={title}
        standfirst={description}
        icon={icon}
      />
      <p className="mono-label mt-8 inline-block rounded-full border border-edge px-4 py-1.5 text-[0.68rem] text-cream-dim">
        Coming next
      </p>

      <p className="mono-label mt-10 text-[0.7rem] text-pink-hot">
        What arrives here
      </p>
      <ul className="mt-2">
        {contents.map((item, i) => (
          <li
            key={item}
            className="hairline flex items-center gap-4 border-b py-5 sm:gap-5"
          >
            <span className="mono-label text-[0.72rem] text-pink-hot">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex-1 text-[1.05rem] leading-relaxed text-cream/90">
              {item}
            </span>
            <MoveRight
              strokeWidth={1.6}
              className="h-4 w-4 shrink-0 text-pink-hot"
              aria-hidden
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
