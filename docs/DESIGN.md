# Design — French retention

Reference: Nidhi's Field Notes / ICAN dark editorial pages (maroon canvas,
pink/cream type, thin-bordered rounded cards). The 2026-09 redesign samples
its colours and card language directly from three screenshots of those pages.

## Colours (sampled from the reference pages)
- Canvas: deep maroon `#270911`
- Surface / cards: lighter maroon `#3B101B`, raised/hover `#4A1522`
- Card borders: thin hairline mauve `#724754` (softer rgba for dividers)
- Display headings: dusty pink `#E8ABC7`
- Kickers, mono tags, numbers: hot pink `#E086AE`
- Card titles, pill backgrounds: pale pink `#EFC6D8` (pill text: dark maroon)
- Body text: warm near-white `#FEF9FC`; muted mono subtitles `#C8B8BD`
- Pull-quotes: pale pink italic `#F8D6E4` with a coral `#ED6A50` left bar

## Typography
Two-voice editorial system, matching the reference pages:
- **Display + body: Jost** (Google font, Futura-style geometric sans).
  Headings bold with tight tracking in dusty pink; body warm near-white,
  relaxed leading, magazine copy tone.
- **Mono: IBM Plex Mono** for the editorial furniture — kickers
  (`FIRST-PERSON ACCOUNT` style), card tags (`DUMP`, `SHELF`), mono
  subtitles (`THE PLANNER` style), contents numbers (`01`, `02`), pills and
  buttons. Uppercase, ~0.08em tracking (`.mono-label` utility).

## Card language
After the PLAN / BUILD / TEST stack on the reference page: full-width
rounded cards (~1.1rem radius), 1px hairline mauve border on the lighter
maroon surface, generous inner padding. Inside: mono tag column on the
left, bold pale-pink title + mono subtitle, cream description on the right.
Pills are pale pink with dark maroon mono text (`FIELD NOTES × …` style).

## Layout vibe
Personal iOS home screen on a maroon Field Notes canvas. Left-aligned
editorial mastheads (kicker → big headline → standfirst → pill → hairline),
generous spacing, no dashboard chrome. Empty sections read like a magazine
contents page: numbered rows, hairline separators, arrow at the right edge.

## Navigation
Bottom dock (MacBook + iPhone), macOS-Finder style: icons only, no permanent
labels. Hovering (or pressing/focusing on touch) shows the section name in a
small rounded mono tooltip above the icon; the active section gets a
pale-pink tint and a Finder-style dot under the icon.
1. Notes
2. Vocabulary
3. Verbs
4. Grammar
5. Quiz

## Icons
Lucide (`lucide-react`), cream/pink stroke:
- Notes: `NotebookPen`
- Vocabulary: `BookOpen`
- Verbs: `Zap`
- Grammar: `ListTree`
- Quiz: `Layers`
- Settings: `Settings` (gear, top right)

### Notes section
- Card A: Add note (opens dump) — coral-bar pull-quote as the prompt
- Card B: Notes library + count badge (pale pink mono pill, e.g. `3 NOTES`)

## Responsive
One design system; layout contracts for iPhone 14 Pro Max (~430px, card
columns stack) and expands for MacBook Air 13" Safari. Same dock, same
icons, same colours.
