import { AppShell } from "@/components/AppShell";
import { Surface } from "@/components/Surface";
import { listVocab } from "@/lib/services/notes";

export default function VocabPage() {
  const vocab = listVocab();
  return (
    <AppShell title="Vocabulary">
      {vocab.length === 0 ? (
        <Surface className="px-5 py-8 text-center text-cream/80">
          No vocab yet. Dump a note with (m) / (f) and a meaning.
        </Surface>
      ) : (
        <ul className="flex flex-col gap-2">
          {vocab.map((item) => (
            <li key={item.id}>
              <Surface className="px-5 py-4">
                <p className="text-lg font-semibold text-cream">
                  {item.term}
                  {item.gender ? <span className="text-pink"> ({item.gender})</span> : null}
                </p>
                {item.plural ? <p className="text-sm text-cream/70">plural {item.plural}</p> : null}
                {item.meaning ? <p className="mt-1 text-cream/85">{item.meaning}</p> : null}
              </Surface>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
