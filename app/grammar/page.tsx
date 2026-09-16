import { AppShell } from "@/components/AppShell";
import { Surface } from "@/components/Surface";
import { listGrammar } from "@/lib/services/notes";

export default function GrammarPage() {
  const grammar = listGrammar();
  return (
    <AppShell title="Grammar">
      {grammar.length === 0 ? (
        <Surface className="px-5 py-8 text-center text-cream/80">
          No grammar yet. Dump a short rule as a full sentence.
        </Surface>
      ) : (
        <ul className="flex flex-col gap-2">
          {grammar.map((item) => (
            <li key={item.id}>
              <Surface className="px-5 py-4">
                <p className="text-lg font-semibold text-cream">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-cream/85">{item.explanation}</p>
              </Surface>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
