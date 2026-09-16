import Link from "next/link";
import { notFound } from "next/navigation";
import { reextractNoteAction } from "@/app/actions/notes";
import { AppShell } from "@/components/AppShell";
import { CorrectionForm } from "@/components/CorrectionForm";
import { Surface } from "@/components/Surface";
import { getNote, listGrammar, listVerbs, listVocab } from "@/lib/services/notes";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NoteDetailPage({ params }: Props) {
  const { id } = await params;
  const note = getNote(id);
  if (!note) notFound();
  const vocab = listVocab(note.id);
  const verbs = listVerbs(note.id);
  const grammar = listGrammar(note.id);

  return (
    <AppShell title={note.dumpedOn}>
      <div className="flex flex-col gap-5">
        <Link href="/notes" className="text-sm text-pink">
          Back to library
        </Link>
        <Surface className="px-5 py-4">
          <p className="text-[11px] tracking-[0.18em] text-pink uppercase">Dump</p>
          <p className="mt-2 whitespace-pre-wrap text-cream">{note.rawText}</p>
        </Surface>
        <Surface className="px-5 py-4">
          <p className="mb-3 text-[11px] tracking-[0.18em] text-pink uppercase">
            Correction
          </p>
          <CorrectionForm note={note} />
        </Surface>
        <form action={reextractNoteAction.bind(null, note.id)}>
          <button
            type="submit"
            className="rounded-full border border-line px-4 py-2 text-sm text-cream"
          >
            Re-run extract
          </button>
        </form>
        <section>
          <h2 className="mb-2 text-sm tracking-[0.18em] text-pink uppercase">Vocab</h2>
          {vocab.length === 0 ? (
            <p className="text-sm text-cream/70">None from this note.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {vocab.map((item) => (
                <li key={item.id}>
                  <Surface className="px-4 py-3 text-cream">
                    <span className="font-semibold">{item.term}</span>
                    {item.gender ? <span className="text-pink"> ({item.gender})</span> : null}
                    {item.plural ? <span className="text-cream/70"> · {item.plural}</span> : null}
                    {item.meaning ? <span className="block text-sm text-cream/80">{item.meaning}</span> : null}
                  </Surface>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="mb-2 text-sm tracking-[0.18em] text-pink uppercase">Verbs</h2>
          {verbs.length === 0 ? (
            <p className="text-sm text-cream/70">None from this note.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {verbs.map((item) => (
                <li key={item.id}>
                  <Surface className="px-4 py-3 text-cream">
                    <span className="font-semibold">{item.infinitive}</span>
                    {item.phonetics ? <span className="text-pink"> /{item.phonetics}/</span> : null}
                    <span className="mt-1 block text-sm text-cream/80">
                      {Object.entries(item.conjugations)
                        .map(([pronoun, form]) => `${pronoun} ${form}`)
                        .join(", ") || "No conjugations parsed"}
                    </span>
                  </Surface>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="mb-2 text-sm tracking-[0.18em] text-pink uppercase">Grammar</h2>
          {grammar.length === 0 ? (
            <p className="text-sm text-cream/70">None from this note.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {grammar.map((item) => (
                <li key={item.id}>
                  <Surface className="px-4 py-3 text-cream">
                    <span className="font-semibold">{item.title}</span>
                    <span className="mt-1 block text-sm text-cream/80">{item.explanation}</span>
                  </Surface>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
