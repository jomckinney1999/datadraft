# The DataDraft lesson grammar

The repeatable shape of one lesson. "Duolingo-like" is too vague to build
against; this is the version you can check a lesson against.

Worked example: `lib/curriculum-foundations.ts`, unit `f2`.

## One lesson = one idea

If you can't name the lesson's idea in four words, it's two lessons.

Good: `WHERE`. `BETWEEN`. `COUNT`. `DISTINCT`.
Bad: "Filtering and aggregation."

A lesson that teaches `WHERE`, `GROUP BY`, `HAVING`, `COUNT`, `SUM` and `AVG`
at once is six lessons that eventually combine.

## The beats, in order

Every lesson runs the same loop: **problem → one idea → tiny example → try →
feedback → slightly harder.**

| Beat | Where it lives | Budget |
|---|---|---|
| **1. Hook** — a question the learner wants answered | `brief.steps[0]` | ≤ 40 words, no SQL terms |
| **2. Teach** — the smallest idea that answers it | `brief.steps[1]` | ≤ 45 words |
| **3. Show** — the tiniest query that does it | `brief.steps[n].code` + `previewSql` | ≤ 4 lines of SQL |
| **4. Explain** — what actually matters in it | `intro` (+ `film` for depth) | 2–3 sentences |
| **5. Practice** — the ladder below | `exercises` | 4–6 per lesson |
| **6. Feedback** — why that answer was what it was | `explain` on every exercise | 1 sentence |
| **7. Connect** — where this shows up again | last `film` card or final `explain` | 1 sentence |

**Rules for beats**

- A beat that names a table shows it (`previewSql` / `previewSheet`). Naming a
  table without showing it asks the learner to picture something they've never
  seen.
- Picture first, term second. Show the rows, *then* say "that's a table."
- Never open with a definition.

## The difficulty ladder

Every concept climbs this inside its own lesson. This is the part that's
missing today, and it's what makes depth feel easy.

| Level | Asks | Type | Example |
|---|---|---|---|
| 1 Recognition | "What does this do?" | `mc` with `code` | Show a query, ask what comes back |
| 2 Completion | "Fill in the missing piece" | `fill` | `SELECT player ___ week_results` |
| 3 **Modification** | "Change it to answer a different question" | `query` with a **working query in `starter`** | Given points, make it yards |
| 4 Creation | "Write it yourself" | `query`, `starter` is a comment only | From a blank editor |
| 5 Application | "Use it with what you already know" | `query` combining this + an earlier concept | `WHERE` + `ORDER BY` |

Level 3 is the one people skip. Handing someone a query that already works and
asking them to move one piece is the cheapest win in the whole product — it
teaches shape without a blank page.

A lesson doesn't need all five. It needs to climb: never two level-1s in a row,
always end above where it started.

## Code grows, it never arrives

Show the query being built, one line at a time:

```sql
SELECT player FROM week_results;
SELECT player, fantasy_pts FROM week_results;
SELECT player, fantasy_pts FROM week_results ORDER BY fantasy_pts DESC;
SELECT player, fantasy_pts FROM week_results ORDER BY fantasy_pts DESC LIMIT 10;
```

Never drop a four-clause query on someone and explain it afterwards.

## Feedback has to name the mistake

`explain` is read at the exact moment someone is wrong, which is the moment
they're most willing to learn. Wasting it on "Incorrect" is the worst trade in
the product.

- Bad: "Incorrect."
- Bad: "The ORDER BY clause sorts results."
- Good: "Close — you sorted by `fantasy_pts`, but the question asked for
  rushing yards. Swap the column after `ORDER BY`."

Name what they likely did, then the one move that fixes it.

## Voice

Write like a good coach talking to one person.

- Short sentences. One idea per sentence.
- Contractions: you're, don't, that's, here's.
- Talk to "you". Never "the user" or "one".
- Football is seasoning, not a prerequisite. A learner who's never watched a
  game must never be blocked by a play call.
- Cut any sentence that doesn't teach, clarify, give context, or move them
  toward the answer.

**Banned — these are the tells of generated text:**

> In the realm of · It is important to note · Let's delve into · Utilize ·
> Facilitate · Leveraging · The aforementioned · In this section we will
> explore · As we embark on · It should be noted that · This powerful
> feature · Master the art of · Unlock the power of · Seamless · Robust

Also banned, from our own past copy: "the sentence that unlocks everything",
"Do not let the word put you off", "That's the whole deal."

Analogies: at most one per lesson, one sentence long, then move on. "`WHERE`
is a bouncer — rows that don't match don't get in" is a whole lesson's worth of
metaphor.

## Show the mistake on purpose

At least once per module, put a broken query in front of them and ask what's
wrong:

```sql
SELECT * FROM week_results WHERE team = NULL;
```

Then: "`NULL` isn't a value you can match with `=`. Use `IS NULL`." People
remember the rule they watched fail.

## Before a lesson ships

1. One idea, nameable in four words.
2. Opens with a problem, not a definition.
3. Every beat within its word budget.
4. The learner writes SQL at least twice.
5. The exercises climb the ladder; the last is harder than the first.
6. Every `explain` names the likely mistake.
7. Every factual claim about the data is checked against the database, not
   assumed (this has bitten us: a question once claimed `COUNT(*)` and
   `COUNT(col)` disagree on `week_results` — they don't, it has no NULLs).
8. `node scripts/verify-answer-keys.mjs` passes.
