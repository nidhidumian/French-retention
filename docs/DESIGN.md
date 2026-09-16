# Design — French retention

Reference: Nidhi’s Field Notes / ICAN dark editorial pages (maroon canvas, pink/cream type, rounded bordered cards).

## Colours
- Background: deep maroon / eggplant (~#2A0B16)
- Surface / cards: slightly lighter maroon, thin light border
- Primary text: warm off-white / cream
- Accent text & labels: dusty pink / mauve (~#EFA7BC)
- Optional highlight: coral/orange-red (quotes, focus)
- Badge: high-contrast on Notes count (pink pill or cream on maroon)

## Layout vibe
Personal iOS home screen on a maroon field. Not a dense dashboard.

## Navigation
Bottom dock (MacBook + iPhone), macOS-Finder style: icons only, no permanent
labels. Hovering (or pressing/focusing on touch) shows the section name in a
small rounded tooltip above the icon; the active section gets a pink tint and
a Finder-style dot under the icon.
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
- Icon A: Add note (opens dump)
- Icon B: Notes library + count badge (total notes)

## Responsive
One design system; layout contracts for iPhone 14 Pro Max and expands for MacBook Air 13" Safari. Same dock, same icons, same colours.

## Typography
Field Notes editorial direction: Inter Tight (Google font). Headings extra
bold with tight tracking in dusty pink; body warm cream, relaxed leading;
small caps labels where useful. Magazine copy tone, not UI-chrome tone.
