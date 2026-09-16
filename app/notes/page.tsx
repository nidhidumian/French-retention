import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Surface } from "@/components/Surface";
import { listNotes } from "@/lib/services/notes";

export default function NotesLibraryPage() {
  const notes = listNotes();
  return (
    <AppShell title="Library">
      {notes.length === 0 ? (
        <Surface className="px-5 py-8 text-center text-cream/80">
          No notes yet. Add one from the Notes home.
        </Surface>
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <li key={note.id}>
              <Link href={`/notes/${note.id}`}>
                <Surface className="px-5 py-4">
                  <p className="text-[11px] tracking-[0.18em] text-pink uppercase">
                    {note.dumpedOn}
                  </p>
                  <p className="mt-2 line-clamp-3 text-cream">{note.rawText}</p>
                </Surface>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
