"use client";

import { MoveRight } from "lucide-react";
import { Kicker } from "./editorial";

/**
 * Editorial empty state for sections that ship in a later milestone:
 * kicker, big pink headline, cream standfirst, then a numbered
 * contents-style list of what will arrive here — after the CONTENTS
 * rows on the reference page.
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
      <div className="flex items-start justify-between gap-6">
        <div>
          <Kicker>{kicker}</Kicker>
          <h1 className="mt-2 text-5xl font-bold leading-[1.05] tracking-tight text-pink sm:text-6xl">
            {title}
          </h1>
        </div>
        <div className="mt-1 flex h-16 w-16 shrink-0 items-center justify-center rounded-card border border-edge bg-surface text-pink sm:h-20 sm:w-20">
          {icon}
        </div>
      </div>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-cream sm:text-xl">
        {description}
      </p>
      <p className="mono-label mt-6 inline-block rounded-full bg-pink-pale px-3.5 py-1.5 text-[0.72rem] text-surface">
        Coming next
      </p>

      <hr className="hairline mt-9 border-t" />

      <h2 className="mt-8 text-lg font-bold tracking-tight text-pink">
        WHAT ARRIVES HERE
      </h2>
      <ul className="mt-2">
        {contents.map((item, i) => (
          <li
            key={item}
            className="hairline flex items-center gap-4 border-b py-4 sm:gap-5"
          >
            <span className="mono-label text-[0.72rem] text-pink-hot">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex-1 text-[1.05rem] leading-relaxed text-cream">
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
