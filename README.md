# French retention

Personal app: dump French notes → correct + extract vocab/verbs/grammar → spaced-repetition quiz via email.

MVP: notes → extract → SRS → Resend email → 10-card session.

## Run locally

Requires Node 20+.

```bash
npm install
cp .env.example .env.local   # then fill in the Clerk + Gemini keys (next sections)
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

The sign-up form asks for a password of at least 8 characters. Clerk also
checks the password server-side against the policy set in its dashboard, so
if your Clerk application enforces something stricter (say a 15-character
minimum), sign-ups the form accepts will still be rejected. Set the policy
to allow 8+ characters under **Configure → User & authentication →
Password** in the Clerk Dashboard.

Shortcut: `npx clerk@latest init` creates a development instance and writes
the keys to `.env.local` for you; run `npx clerk auth login` later to claim
it into your Clerk account.

When deploying, set the same variables in the host's environment (they're
needed at build time):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` — the app
  refuses to render auth pages without both (`src/services/clerkConfig.ts`).
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` and
  `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` — so Clerk's own redirects land
  on this app's custom pages instead of Clerk-hosted ones.

### Clerk domains on Vercel

Which keys work depends on the domain the deployment runs on:

- A `*.vercel.app` domain (previews, or a project without a custom domain)
  only works with **development** keys (`pk_test_` / `sk_test_`).
  Development instances accept any origin, so nothing needs to be added in
  the Clerk Dashboard. Development instances cap sign-ups and show a Clerk
  banner, so they're not for real traffic.
- **Production** keys (`pk_live_` / `sk_live_`) require a domain you own,
  added under **Configure → Domains** in the Clerk Dashboard with the DNS
  records it lists. Clerk cannot serve a production instance from
  `*.vercel.app` (you can't add DNS records there), so a custom domain is a
  hard requirement for going live.
- On Vercel, scope the variables per environment: production keys on the
  Production environment (custom domain), development keys on Preview.

A key/domain mismatch (production keys on a `*.vercel.app` URL) makes
Clerk's frontend API reject or misroute requests, which surfaces as broken
sign-in/sign-up on an app that builds and renders fine. If sign-up fails
only on the deployed site, check this first.

## Set up Google Gemini (extraction)

Saving a note automatically sends it to `/api/extract`, which uses Google
Gemini to correct the French and pull out vocabulary, verbs and grammar —
there is no Extract button; if a run fails, the note keeps a **Try again**
action in the library. This needs one key, and Google AI Studio gives one
away free:

1. Go to [aistudio.google.com](https://aistudio.google.com), sign in with a
   Google account, and click **Get API key** → **Create API key**. Copy the
   key (starts with `AIza`). The free tier is plenty for personal use — no
   card needed.
2. Locally: add `GEMINI_API_KEY=AIza...` to `.env.local` and restart
   `npm run dev`.
3. On Vercel: open the project → **Settings → Environment Variables**, add
   `GEMINI_API_KEY` with the key as its value (Production and Preview), and
   **redeploy** — environment changes only apply to new deployments.

The key stays server-side (`src/app/api/extract/route.ts`); it is never
sent to the browser. If you already have the key under the name
`GOOGLE_GENERATIVE_AI_API_KEY` (the Vercel AI SDK's spelling), that works
too. Optional: set `GEMINI_MODEL` to override the default
(`gemini-2.5-flash`) — pick a model that supports `generateContent` with
JSON-schema structured output.

**If extraction fails on Vercel:** environment-variable changes (adding
`GEMINI_API_KEY`, changing `GEMINI_MODEL`) only take effect after a
**Redeploy** — trigger one from the Deployments tab. If it still fails
after redeploying, open the project's **Logs** (or Observability →
Functions) and filter for `/api/extract`: the route logs the real upstream
Gemini error (`[extract] Gemini call failed: …`), e.g. an invalid model
name or an API key restriction, and the same sanitized detail is shown in
the app under the "hiccup" message.

To retest after adding the key: sign in, dump a sample note such as

> Je suis allé au boulangerie hier. J'ai acheté deux baguette.

and save it. Extraction starts on its own: you should see a corrected
version (au → à la, baguette → baguettes) with a short English why for each
fix, and new entries under Vocabulary, Verbs and Grammar in the dock.
Without the key, the same flow shows a message telling you to add
`GEMINI_API_KEY` — the note stays saved, so you can retry it later from the
notes library.

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
- **Extraction**: saving a note (or tapping **Extract** on an existing one)
  corrects the French — each fix with a short English why — and files the
  words, verbs and grammar rules into the libraries. Repeats reinforce
  existing entries instead of duplicating them; nothing already learned is
  ever wiped. Verbs are conjugated at the level/stage from onboarding
  (A1 stage 1 present / 2 passé composé / 3 future; A2+ get present).
  Extracts store in the browser next to the notes (localStorage, keyed per
  account), so a database swap later touches only `src/services/`.
- **Vocabulary / Verbs / Grammar**: living numbered indexes fed by
  extraction, with search (vocabulary) and per-pronoun conjugations at the
  user's stage (verbs).
- **Quiz**: placeholder "coming next" screen.

Not built yet: spaced repetition, quiz sessions, Resend email.

## Code layout

- `src/app/` — Next.js pages: the app (`page.tsx`), auth (`welcome`,
  `sign-in`, `sign-up`), `onboarding`, `terms`, `privacy`. Design tokens
  live in `globals.css`. `api/extract` is the server route that calls
  Google Gemini (signed-in users only; the key never reaches the browser).
- `src/middleware.ts` — Clerk route protection: signed-out users only see
  the auth pages.
- `src/components/` — shell UI (dock, notes, vocabulary, verbs, grammar,
  placeholders, settings, auth forms, hand-drawn icons).
- `src/services/` — the "how": note storage, extraction orchestration,
  onboarding profile, vocabulary/verb/grammar libraries, Clerk helpers.

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
