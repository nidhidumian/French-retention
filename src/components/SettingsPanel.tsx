"use client";

import { X } from "lucide-react";

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-24 backdrop-blur-sm sm:justify-end sm:pr-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Settings"
        className="w-full max-w-sm rounded-card border border-edge bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-pink">
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-full border border-edge p-1.5 text-cream-dim transition-colors hover:text-cream"
          >
            <X strokeWidth={1.7} className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-[0.9rem] border border-edge bg-maroon/60 p-4">
          <p className="label-caps text-xs font-semibold text-pink-dim">
            Email hours
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-cream-dim">
            Pick the window when your daily quiz email arrives.
          </p>
          <p className="mt-3 inline-block rounded-full border border-edge px-3 py-1 text-xs text-pink">
            Coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
