"use client";

import { ChevronLeft } from "lucide-react";

/** Monospace editorial kicker line, e.g. MES NOTES DE FRANÇAIS. */
export function Kicker({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`mono-label text-[0.75rem] text-pink-hot ${className}`}>
      {children}
    </p>
  );
}

/**
 * Shared header for every section screen: kicker, display title, optional
 * icon tile on the right, and a standfirst. One component so the type
 * scale and rhythm stay identical everywhere.
 */
export function ScreenHeader({
  kicker,
  title,
  standfirst,
  icon,
  uppercaseTitle = false,
}: {
  kicker: string;
  title: string;
  standfirst?: string;
  icon?: React.ReactNode;
  uppercaseTitle?: boolean;
}) {
  return (
    <header>
      <div className="flex items-start justify-between gap-6">
        <div>
          <Kicker>{kicker}</Kicker>
          <h1
            className={`mt-3 text-[2.6rem] font-bold leading-[1.04] tracking-tight text-pink sm:text-6xl ${
              uppercaseTitle ? "uppercase" : ""
            }`}
          >
            {title}
          </h1>
        </div>
        {icon && (
          <div
            aria-hidden
            className="mt-1 hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-edge bg-surface text-pink sm:flex sm:h-16 sm:w-16"
          >
            {icon}
          </div>
        )}
      </div>
      {standfirst && (
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-cream/90 sm:text-xl">
          {standfirst}
        </p>
      )}
    </header>
  );
}

/** Back-to-Notes link in the same mono voice as the kickers. */
export function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mono-label flex items-center gap-1 text-[0.72rem] text-cream-dim transition-colors hover:text-pink"
    >
      <ChevronLeft strokeWidth={1.8} className="h-3.5 w-3.5" />
      Notes
    </button>
  );
}

/** The one loud thing on a screen: filled pink pill for the primary action. */
export function PrimaryPill({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mono-label rounded-full bg-pink-pale px-6 py-3 text-[0.75rem] text-surface transition-opacity hover:opacity-90 ${className}`}
    >
      {children}
    </button>
  );
}
