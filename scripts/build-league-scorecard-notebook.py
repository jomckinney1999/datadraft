"""Generate notebooks/my-league-scorecard.ipynb for the Your League Scorecard project."""

from __future__ import annotations

import json
from pathlib import Path

NB_PATH = Path(__file__).resolve().parents[1] / "notebooks" / "my-league-scorecard.ipynb"


def md(source: str) -> dict:
    text = source.strip("\n") + "\n"
    return {"cell_type": "markdown", "metadata": {}, "source": [text]}


def code(source: str) -> dict:
    text = source.strip("\n") + "\n"
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [text],
    }


cells: list[dict] = []

cells.append(
    md(
        """# Your League Scorecard

**DataDraft portfolio project** — pull *your* fantasy league, load it into SQL, answer real questions.

You'll need:
- A free [Google](https://accounts.google.com/) account (for Colab)
- A [Sleeper](https://sleeper.com/) username **or** a small CSV of weekly scores (ESPN / Yahoo)

Run cells **top to bottom**. Don't skip the setup cells.

> Privacy: this notebook talks to Sleeper's *public* API from *your* Colab session. Nothing is sent to DataDraft servers."""
    )
)

cells.append(
    md(
        """## 0 · Setup

Install nothing — Colab already has pandas. We use SQLite so you write real SQL, same idea as the lessons."""
    )
)

cells.append(
    code(
        """import json
import sqlite3
from pathlib import Path

import pandas as pd
import requests

pd.set_option("display.max_rows", 40)
pd.set_option("display.width", 120)

DB_PATH = Path("league.sqlite")
if DB_PATH.exists():
    DB_PATH.unlink()

conn = sqlite3.connect(DB_PATH)
print("Ready. Empty SQLite file at", DB_PATH.resolve())"""
    )
)

cells.append(
    md(
        """## 1 · Pick your data path

### Path A — Sleeper (recommended)

1. Open the Sleeper app or [sleeper.com](https://sleeper.com)
2. Your **username** is in your profile (URL looks like `sleeper.com/@yourname`)
3. Paste it below and run the next cells

### Path B — ESPN / Yahoo CSV

If you're not on Sleeper, skip to **§1b**. Fill a CSV with weekly scores from your league app (see `weekly_scores.example.csv` in this folder), upload it to Colab, and load it there."""
    )
)

cells.append(md("### 1a · Sleeper — find your leagues"))

cells.append(
    code(
        """# ← put your Sleeper username here (no @)
SLEEPER_USERNAME = "CHANGE_ME"

# Season year for the league you want (e.g. 2025)
SEASON = "2025"

BASE = "https://api.sleeper.app/v1"

def sleeper_get(path: str):
    r = requests.get(f"{BASE}{path}", timeout=60)
    r.raise_for_status()
    return r.json()

user = sleeper_get(f"/user/{SLEEPER_USERNAME}")
print("Found:", user["display_name"], "| user_id:", user["user_id"])

leagues = sleeper_get(f"/user/{user['user_id']}/leagues/nfl/{SEASON}")
if not leagues:
    raise SystemExit(
        f"No NFL leagues for {SLEEPER_USERNAME} in {SEASON}. "
        "Try another SEASON year, or check the username."
    )

pd.DataFrame(
    [
        {
            "league_id": L["league_id"],
            "name": L["name"],
            "status": L["status"],
            "teams": L["total_rosters"],
        }
        for L in leagues
    ]
)"""
    )
)

cells.append(
    code(
        """# ← paste a league_id from the table above
LEAGUE_ID = "CHANGE_ME"

league = sleeper_get(f"/league/{LEAGUE_ID}")
users = sleeper_get(f"/league/{LEAGUE_ID}/users")
rosters = sleeper_get(f"/league/{LEAGUE_ID}/rosters")

owner_by_roster = {}
name_by_user = {
    u["user_id"]: u.get("display_name") or u.get("username") for u in users
}
for r in rosters:
    owner_by_roster[r["roster_id"]] = name_by_user.get(
        r.get("owner_id"), f"Roster {r['roster_id']}"
    )

managers = pd.DataFrame(
    [
        {
            "roster_id": rid,
            "manager": name,
            "league": league["name"],
            "season": league["season"],
        }
        for rid, name in owner_by_roster.items()
    ]
)
managers.to_sql("managers", conn, index=False, if_exists="replace")
print(f"Loaded {len(managers)} managers from «{league['name']}»")
managers"""
    )
)

cells.append(
    code(
        """# Pull every week that has matchup data
rows = []
starter_rows = []

for week in range(1, 23):
    matchups = sleeper_get(f"/league/{LEAGUE_ID}/matchups/{week}")
    if not matchups:
        continue
    if week > 1 and all(not m.get("players") for m in matchups):
        continue

    by_matchup = {}
    for m in matchups:
        mid = m.get("matchup_id")
        if mid is None:
            continue
        by_matchup.setdefault(mid, []).append(m)

    for mid, pair in by_matchup.items():
        for m in pair:
            rid = m["roster_id"]
            opp = [o for o in pair if o["roster_id"] != rid]
            pa = float(opp[0].get("points") or 0) if opp else None
            pf = float(m.get("points") or 0)
            win = None if pa is None else int(pf > pa)
            rows.append(
                {
                    "week": week,
                    "roster_id": rid,
                    "matchup_id": mid,
                    "points_for": pf,
                    "points_against": pa,
                    "win": win,
                }
            )

            starters = m.get("starters") or []
            pp = m.get("players_points") or {}
            starter_pts = sum(
                float(pp.get(pid) or 0) for pid in starters if pid and pid != "0"
            )
            roster_pts = sum(float(v or 0) for v in pp.values())
            starter_rows.append(
                {
                    "week": week,
                    "roster_id": rid,
                    "starter_points": starter_pts,
                    "roster_points": roster_pts,
                    "bench_left": roster_pts - starter_pts,
                }
            )

weekly = pd.DataFrame(rows)
starters = pd.DataFrame(starter_rows)

if weekly.empty:
    raise SystemExit(
        "No matchup points yet for this league/season. "
        "Try a prior SEASON, or use the CSV path in §1b."
    )

weekly = weekly.merge(managers[["roster_id", "manager"]], on="roster_id", how="left")
starters = starters.merge(
    managers[["roster_id", "manager"]], on="roster_id", how="left"
)

weekly.to_sql("weekly_scores", conn, index=False, if_exists="replace")
starters.to_sql("starter_points", conn, index=False, if_exists="replace")

print(
    f"weekly_scores: {len(weekly)} rows · weeks {weekly.week.min()}–{weekly.week.max()}"
)
print(f"starter_points: {len(starters)} rows")
weekly.head(10)"""
    )
)

cells.append(
    md(
        """### 1b · ESPN / Yahoo — CSV upload (optional)

Skip this section if you already loaded Sleeper data.

1. In Colab: **Files** (folder icon) → **Upload** a CSV named `weekly_scores.csv`
2. Columns required:

| column | example |
|---|---|
| `manager` | Alex |
| `week` | 3 |
| `points_for` | 118.4 |
| `points_against` | 102.1 |
| `win` | 1 |

`win` = 1 if they won that week, 0 if they lost. One row per manager per week."""
    )
)

cells.append(
    code(
        """# Only run this cell if you are on the CSV path (not Sleeper).
CSV_PATH = Path("weekly_scores.csv")

if CSV_PATH.exists():
    weekly_csv = pd.read_csv(CSV_PATH)
    need = {"manager", "week", "points_for", "points_against", "win"}
    missing = need - set(weekly_csv.columns)
    if missing:
        raise SystemExit(f"CSV missing columns: {sorted(missing)}")

    managers_csv = (
        weekly_csv[["manager"]]
        .drop_duplicates()
        .reset_index(drop=True)
        .assign(
            roster_id=lambda d: d.index + 1,
            league="my-league",
            season="csv",
        )
    )
    weekly_csv = weekly_csv.merge(
        managers_csv[["manager", "roster_id"]], on="manager"
    )

    managers_csv.to_sql("managers", conn, index=False, if_exists="replace")
    weekly_csv.to_sql("weekly_scores", conn, index=False, if_exists="replace")
    print("Loaded CSV into managers + weekly_scores")
    display(weekly_csv.head())
else:
    print("No weekly_scores.csv found — using Sleeper tables (that's fine).")"""
    )
)

cells.append(
    md(
        """## 2 · Peek at the tables

Same habit as the lessons: look before you ask."""
    )
)

cells.append(
    code(
        '''def sql(query: str) -> pd.DataFrame:
    return pd.read_sql_query(query, conn)

print(
    "Tables:",
    sql("SELECT name FROM sqlite_master WHERE type='table' ORDER BY 1")[
        "name"
    ].tolist(),
)
print()
display(sql("SELECT * FROM managers LIMIT 10;"))
display(sql("SELECT * FROM weekly_scores LIMIT 10;"))
try:
    display(sql("SELECT * FROM starter_points LIMIT 5;"))
except Exception:
    print("(no starter_points — CSV path)")'''
    )
)

cells.append(
    md(
        """## 3 · Scorecard questions

Replace the `...` with real SQL. Run each cell. Hints sit under each question.

Solutions are folded at the bottom — try first."""
    )
)

# Practice cells — stubs only
q_stubs = [
    (
        "### Q1 · Who leads the league in wins?",
        '''sql("""
SELECT ...
FROM weekly_scores
...
""")''',
        "*Hint: `SUM(win)` per manager, biggest first.*",
    ),
    (
        "### Q2 · Who has the most total points (PF)?",
        '''sql("""
SELECT ...
FROM weekly_scores
...
""")''',
        "*Hint: `SUM(points_for)` — sorting decides the leaderboard.*",
    ),
    (
        "### Q3 · Highest single-week score?",
        '''sql("""
SELECT ...
FROM weekly_scores
...
""")''',
        "*Hint: sort by `points_for`, take one row with `LIMIT 1`.*",
    ),
    (
        "### Q4 · Closest matchup of the season?",
        '''sql("""
SELECT ...
FROM weekly_scores a
JOIN weekly_scores b
  ON ...
...
""")''',
        "*Hint: same `week` + same `matchup_id`. Use `roster_id <` so each game appears once. Sort by `ABS` gap.*",
    ),
    (
        "### Q5 · Who left the most points on the bench? *(Sleeper path)*",
        '''sql("""
SELECT ...
FROM starter_points
...
""")''',
        "*Hint: sum `bench_left` per manager. CSV path may not have this table — skip if so.*",
    ),
    (
        "### Q6 · Stretch — all-play win rate",
        '''sql("""
-- compare every manager to every other manager, same week
SELECT ...
""")''',
        "*Hint: self-join on `week` where `roster_id` differs. Average how often your PF is higher. Compare to Q1 wins.*",
    ),
]

for title, stub, hint in q_stubs:
    cells.append(md(title))
    cells.append(code(stub))
    cells.append(md(hint))

cells.append(
    md(
        """## 4 · Solutions (peek only after you try)

Run these if you want a check — then rewrite them in your own words in the cells above."""
    )
)

solutions = [
    (
        "Q1",
        '''sql("""
SELECT manager, SUM(win) AS wins
FROM weekly_scores
WHERE win IS NOT NULL
GROUP BY manager
ORDER BY wins DESC;
""")''',
    ),
    (
        "Q2",
        '''sql("""
SELECT manager, ROUND(SUM(points_for), 1) AS pf
FROM weekly_scores
GROUP BY manager
ORDER BY pf DESC;
""")''',
    ),
    (
        "Q3",
        '''sql("""
SELECT week, manager, points_for
FROM weekly_scores
ORDER BY points_for DESC
LIMIT 1;
""")''',
    ),
    (
        "Q4",
        '''sql("""
SELECT
  a.week,
  a.manager AS manager_a,
  b.manager AS manager_b,
  a.points_for AS pf_a,
  b.points_for AS pf_b,
  ROUND(ABS(a.points_for - b.points_for), 2) AS gap
FROM weekly_scores a
JOIN weekly_scores b
  ON a.week = b.week
 AND a.matchup_id = b.matchup_id
 AND a.roster_id < b.roster_id
ORDER BY gap ASC
LIMIT 5;
""")''',
    ),
    (
        "Q5",
        '''sql("""
SELECT manager, ROUND(SUM(bench_left), 1) AS points_left_on_bench
FROM starter_points
GROUP BY manager
ORDER BY points_left_on_bench DESC;
""")''',
    ),
    (
        "Q6",
        '''sql("""
WITH pairwise AS (
  SELECT
    a.manager AS manager,
    a.week,
    CASE WHEN a.points_for > b.points_for THEN 1.0 ELSE 0.0 END AS beat
  FROM weekly_scores a
  JOIN weekly_scores b
    ON a.week = b.week
   AND a.roster_id != b.roster_id
)
SELECT
  manager,
  ROUND(AVG(beat), 3) AS all_play_win_pct,
  COUNT(*) AS games_vs_field
FROM pairwise
GROUP BY manager
ORDER BY all_play_win_pct DESC;
""")''',
    ),
]

for label, src in solutions:
    cells.append(md(f"#### Solution — {label}"))
    cells.append(code(src))

cells.append(
    md(
        """## 5 · Write your finding

In a new text cell (or a README next to this notebook), finish these three lines:

1. **Question:** e.g. “Who actually managed best in my league — wins vs all-play?”
2. **Data:** Sleeper league _X_, season _Y_ (or CSV).
3. **Finding:** one sentence a commissioner would care about.

File → **Download .ipynb** (or copy to Drive). That’s the portfolio piece.

### Resume bullet (edit the names)

> Analyzed my fantasy football league in SQL (SQLite): built win, points-for, and all-play standings from weekly matchup data to separate lineup skill from schedule luck.

---

*Built for [DataDraft](https://data-draft.vercel.app) — Your League Scorecard project.*"""
    )
)

nb = {
    "nbformat": 4,
    "nbformat_minor": 5,
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3",
        },
        "language_info": {"name": "python", "pygments_lexer": "ipython3"},
        "colab": {"provenance": [], "toc_visible": True},
    },
    "cells": cells,
}

NB_PATH.parent.mkdir(parents=True, exist_ok=True)
NB_PATH.write_text(json.dumps(nb, indent=1), encoding="utf-8")
# A copy the site serves, so learners can download it and upload it to Colab
# when they can't reach the GitHub repo.
PUBLIC_COPY = NB_PATH.parents[1] / "public" / "notebooks" / NB_PATH.name
PUBLIC_COPY.parent.mkdir(parents=True, exist_ok=True)
PUBLIC_COPY.write_text(json.dumps(nb, indent=1), encoding="utf-8")
print("Wrote", NB_PATH, "·", len(cells), "cells")
