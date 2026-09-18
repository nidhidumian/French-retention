# French retention

Personal app: dump French notes → correct + extract vocab/verbs/grammar → spaced-repetition quiz via email.

MVP: notes → extract → SRS → Resend email → 10-card session.

## Run locally

Requires Node 20+.

```bash
npm install
cp .env.example .env.local   # then fill in the Clerk keys (next section)
npm run dev
```

Open http://localhost:3000.

## Set up Clerk (accounts)

The app uses [Clerk](https://clerk.com) for accounts. Without keys it still
builds and runs, but shows a "Connect Clerk" notice instead of sign-in.

1. Sign up at [clerk.com](https://clerk.com) (free tier is fine) and create
   an application. Enable **Email** and **Password** as sign-in options.
2. In the Clerk dashboard, open **API keys** and copy both values into
   `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
   - `CLERK_SECRET_KEY` (starts with `sk_`)
3. Restart `npm run dev`.

Shortcut: `npx clerk@latest init` creates a development instance and writes
the keys to `.env.local` for you; run `npx clerk auth login` later to claim
it into your Clerk account.

When deploying, set the same two variables in the host's environment
(they're needed at build time).

## What exists today

- **Auth**: signed-out visitors land on a welcome screen with Create
  account / Log in. Sign-up asks for email, name, password (twice) and
  acceptance of the placeholder `/terms` and `/privacy` pages, then
  verifies the email with a code. Logging in on a new device asks for an
  email code once (Clerk Device Trust). Sessions persist on the device
  until log out (Settings gear → Log out).
- **Onboarding**: first sign-in asks for a CEFR level (A1–C1) and, at A1, a
  conjugation stage (1 present / 2 passé composé / 3 future). Stored on the
  Clerk user's `publicMetadata`, so it follows the account across devices.
- **Notes** (default view): dump notes and browse the library by date.
  Notes save to the browser (localStorage), keyed per account; swapping in
  a real database later means changing `src/services/notes.ts` only.
- **Vocabulary / Verbs**: living-index screens with search (vocabulary) and
  per-pronoun conjugation layout (verbs). Empty until extraction ships.
- **Grammar / Quiz**: placeholder "coming next" screens.

Not built yet: extraction, spaced repetition, quiz sessions, Resend email.

## Code layout

- `src/app/` — Next.js pages: the app (`page.tsx`), auth (`welcome`,
  `sign-in`, `sign-up`), `onboarding`, `terms`, `privacy`. Design tokens
  live in `globals.css`.
- `src/middleware.ts` — Clerk route protection: signed-out users only see
  the auth pages.
- `src/components/` — shell UI (dock, notes, vocabulary, verbs,
  placeholders, settings, auth forms, hand-drawn icons).
- `src/services/` — the "how": note storage, onboarding profile,
  vocabulary/verb data shapes, Clerk helpers.

## Checks

```bash
npm run build
```

## Screenshots

With the dev server running and Clerk keys in `.env.local`:

```bash
node scripts/capture-screens.mjs
```

captures desktop and 430px screenshots of every screen into
`/tmp/polish-shots` (uses Playwright, a dev dependency).
