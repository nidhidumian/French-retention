import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { IconLibrary, IconPlus } from "@/components/Icons";
import { Surface } from "@/components/Surface";
import { countNotes } from "@/lib/services/notes";

export default function HomePage() {
  const notes = countNotes();
  return (
    <AppShell title="Notes">
      <p className="mb-6 max-w-md text-sm leading-6 text-cream/75">
        Dump a note. The app extracts vocab, verbs, and grammar, then queues a
        revise session.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/notes/new" className="block">
          <Surface className="flex aspect-square flex-col items-start justify-between p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-pink">
              <IconPlus className="h-7 w-7" />
            </span>
            <span className="text-lg font-semibold text-cream">Add note</span>
          </Surface>
        </Link>
        <Link href="/notes" className="block">
          <Surface className="relative flex aspect-square flex-col items-start justify-between p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-pink">
              <IconLibrary className="h-7 w-7" />
            </span>
            <span className="absolute top-4 right-4 rounded-full bg-pink px-2 py-0.5 text-xs font-semibold text-canvas">
              {notes}
            </span>
            <span className="text-lg font-semibold text-cream">Library</span>
          </Surface>
        </Link>
      </div>
    </AppShell>
  );
}
