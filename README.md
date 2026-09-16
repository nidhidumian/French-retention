# French retention

Personal app: dump French notes → correct + extract vocab/verbs/grammar → spaced-repetition quiz via email.

MVP: notes → extract → SRS → Resend email → 10-card session.

## Run locally

Requires Node 20+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What exists today (shell UI)

- Maroon canvas with the design system from `docs/DESIGN.md` (deep maroon background, lighter maroon cards with thin pink borders, cream body text, dusty-pink headings).
- Bottom dock with five sections: Notes, Vocabulary, Verbs, Grammar, Quiz.
- Notes (default view): **Add note** opens a text dump that saves to your browser (localStorage); **Notes library** shows saved notes by date with a count badge.
- Vocabulary / Verbs / Grammar / Quiz: placeholder "coming next" screens.
- Settings gear (top right): placeholder panel for email hours.

Not built yet: extraction, spaced repetition, quiz sessions, Resend email.

## Code layout

- `src/app/` — Next.js pages and global styles (design tokens live in `globals.css`).
- `src/components/` — shell UI (dock, notes, placeholders, settings).
- `src/services/notes.ts` — note storage. localStorage today; swap this file to move to a real database later.

## Checks

```bash
npm run build
```
