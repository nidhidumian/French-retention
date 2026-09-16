import { AppShell } from "@/components/AppShell";
import { Surface } from "@/components/Surface";
import { listVerbs } from "@/lib/services/notes";

export default function VerbsPage() {
  const verbs = listVerbs();
  return (
    <AppShell title="Verbs">
      {verbs.length === 0 ? (
        <Surface className="px-5 py-8 text-center text-cream/80">
          No verbs yet. Dump an infinitive and je / tu / il forms.
        </Surface>
      ) : (
        <ul className="flex flex-col gap-2">
          {verbs.map((item) => (
            <li key={item.id}>
              <Surface className="px-5 py-4">
                <p className="text-lg font-semibold text-cream">
                  {item.infinitive}
                  {item.phonetics ? <span className="text-pink"> /{item.phonetics}/</span> : null}
                </p>
                <p className="mt-1 text-sm text-cream/85">
                  {Object.entries(item.conjugations)
                    .map(([pronoun, form]) => `${pronoun} ${form}`)
                    .join(", ") || "No conjugations parsed"}
                </p>
              </Surface>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
