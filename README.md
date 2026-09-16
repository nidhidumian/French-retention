# French retention

Personal app: dump French notes, extract vocab / verbs / grammar, then run a spaced-repetition quiz. Email (Resend) can nudge you in a time window you set.

Language: TypeScript. App: Next.js. Data: SQLite (`data/french.db`).

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

```bash
npm test
npm run lint
npm run build
```

## Loop

1. Notes home: Add note or Library
2. Dump a dated note. Extract runs on save.
3. Fix wording on the note page (correction + short why)
4. Browse Vocabulary, Verbs, Grammar
5. Quiz: type, flip, remembered / forgot (10 due cards)
6. Settings gear (top right): email hours, send a test Resend mail

Dock is five pins: Notes, Vocab, Verbs, Grammar, Quiz. Settings stays a gear.

Copy `.env.example` to `.env.local` for `RESEND_API_KEY` and `APP_URL`. Without a key, the app still runs; mail send will tell you to add one.

Hourly mail: `GET /api/cron/email`
