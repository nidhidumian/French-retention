"use client";

import { ChevronLeft } from "lucide-react";

/** Monospace editorial kicker line, e.g. FIRST-PERSON ACCOUNT. */
export function Kicker({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`mono-label text-[0.78rem] text-pink-hot ${className}`}>
      {children}
    </p>
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
