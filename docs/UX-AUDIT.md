# UX audit — 2026-09-29

Measured on the live site at a phone viewport (390×844), as a brand-new
visitor with local storage cleared, plus desktop spot-checks. Numbers are
counted from the DOM, not estimated.

## What's already working — don't undo these

- **`/learn` and the course roadmap got much lighter.** The roadmap went from
  18 top-level cards to 6, and `/learn` is 3.2 screens with 2 cards. The rail
  consolidation (9 cards → 3) and "cut the extra choices" both landed.
- **The lesson screen is the best screen in the product.** One idea, one
  primary button, progress dots, and the table peek right where it's needed.
- **The hero is clear.** One promise, one primary CTA, one secondary text link.
- Colour contrast passes AA everywhere (`scripts/verify-contrast.mjs`, 48
  pairings), and no page scrolls sideways on a phone.

---

## 1. Fourteen taps from landing page to the first question

**The single biggest problem.** Counted, as a new visitor on a phone:

| Step | Taps |
|---|---|
| Home → `/learn` | 1 |
| Pick "Data Analyst" → mode picker | 1 |
| Pick "Practice snaps" → lesson opens | 1 |
| Brief beats + chalkboard cards → first question | **11** |
| **Total** | **14** |

Duolingo has you answering in 2–3. Eleven screens of reading before the first
interaction is a lot for a product whose pitch is short gamified practice, and
**there is no skip** — `hasSkip: false` on every lesson screen.

This is a direct consequence of "ease every lesson in", which was the right
call for absolute beginners and is now overcorrected for everyone else.

**Fix, in order of value:**

1. **Put one question inside the walk-in**, around beat 2–3. The learner does
   something in under a minute, then keeps reading. Answering early is what
   makes the reading feel earned.
2. **Add "I've done this before → skip to the drills"** on the first beat.
   One tap, remembered per course, reversible.
3. **Collapse beats after the first visit.** Someone replaying a lesson should
   land on the drills with the brief one tap away.

## 2. The homepage is 17 screens on a phone

14,274px tall, 18 cards, 9 sections. The largest single section is 3,324px —
four screens for one section. A visitor deciding whether to try this has to
scroll past eleven screens of argument to reach the second CTA.

**Fix:** cut to roughly 6 screens. Keep hero → live sandbox → one proof
section → pricing/CTA. Everything else (sport picker, comparison table,
playbooks, challenge, Stat Guru) either collapses behind "read more" or moves
to its own page. The sandbox is the strongest asset on the page and should sit
directly under the hero, because *trying it* converts better than reading
about it.

## 3. Tap targets are too small, especially on `/resources`

| Page | Tappable | Under 40px |
|---|---|---|
| `/resources` | 17 | **17 (all of them)** |
| `/` | 33 | 29 |
| Career path | 8 | 6 |
| Course roadmap | 30 | 8 |

Apple's guidance is 44px; WCAG 2.5.8 sets 24px as the AA floor. The role
filter pills, tab chips and status chips are all below comfortable.

**Fix:** raise the shared chip/pill padding so the hit box clears 44px without
the text getting bigger — pills can look the same and be easier to hit. This
is one change in a couple of shared classes, not per-component work.

## 4. Too much text under 11.5px

72 elements on the homepage, 21 on the roadmap, 13–16 elsewhere. The
`font-mono text-[10px]` uppercase label is used everywhere — as a section
eyebrow, a chip, a caption, a counter and a note.

**Fix:** keep it for eyebrows only. Anything a learner has to *read* (notes,
captions, provenance, explanations) goes to 12–13px. The broadcast look
survives; the reading doesn't get worse.

## 5. The homepage quotes the wrong salary

The hero stat reads **"MEDIAN DS SALARY $120k"**, footnoted "U.S. median for
Data Scientists, BLS OEWS May 2025."

It's sourced and honestly footnoted, which is right. But the product sells a
**Data Analyst** path — that's the first role on `/learn`, and the whole
Foundations spine. Quoting the *Data Scientist* median to someone we're
pointing at analyst jobs overstates what this path leads to, and a reader who
checks will find analyst pay is lower.

**Fix:** quote the Data Analyst median from the same BLS series, or drop the
figure and use something we can stand behind completely (hours of content,
number of drills, "no account needed"). Same reasoning as the no-invented-
statistics rule in `lib/career.ts`: a number a learner can check and find
misleading costs more than it earns.

## 6. Code blocks clip mid-line on a phone

In lesson chalkboard cards, lines with trailing comments run past the right
edge and need a horizontal swipe to finish reading —
`SELECT *    -- every column, p…` cuts off.

**Fix:** put comments on their own line in lesson snippets at phone width, or
wrap. Nobody should have to swipe sideways to read the explanation of the code
they're being taught.

---

## Quick wins (small, self-contained)

1. Chip/pill hit boxes to 44px (one shared class).
2. Small-text floor of 12px for anything that isn't an eyebrow label.
3. "Skip to the drills" on lesson beat 1.
4. Swap or drop the DS salary stat.
5. Wrap code comments in lesson snippets.

## Bigger moves

1. **First question inside the walk-in** — the highest-value change in the
   product, and the one that needs real content judgement per lesson.
2. **Homepage down to ~6 screens**, sandbox directly under the hero.
3. **One consistent "what now?" control.** Nav, rail, chips and cards all
   offer routes; a learner mid-course should have exactly one obvious next
   action on every screen, with everything else secondary.
4. **Empty and first-run states.** A new visitor sees 0 XP, 0 yards, 5/5
   timeouts, an empty trophy case and locked nodes before doing anything.
   Those read as "you have nothing" rather than "here's where to start".
