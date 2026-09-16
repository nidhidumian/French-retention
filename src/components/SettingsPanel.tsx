"use client";

import { X } from "lucide-react";
import { Kicker } from "./editorial";

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-24 backdrop-blur-sm sm:justify-end sm:pr-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Settings"
        className="w-full max-w-sm rounded-card border border-edge bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <Kicker className="text-[0.7rem]">The dials</Kicker>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-pink">
              Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-full border border-edge p-1.5 text-cream-dim transition-colors hover:text-cream"
          >
            <X strokeWidth={1.7} className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 rounded-card border border-edge bg-maroon/60 p-5">
          <p className="mono-label text-[0.7rem] text-pink-hot">Email hours</p>
          <p className="mt-2 text-[0.98rem] leading-relaxed text-cream">
            Pick the window when your daily quiz email arrives.
          </p>
          <p className="mono-label mt-4 inline-block rounded-full bg-pink-pale px-3 py-1 text-[0.66rem] text-surface">
            Coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
