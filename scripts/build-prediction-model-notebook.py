"""Generate notebooks/fantasy-points-model.ipynb for the Build a Fantasy
Prediction Model project.

Usage: python scripts/build-prediction-model-notebook.py

The notebook's code is exercised end to end by
scripts/test-prediction-model-notebook.mjs (Pyodide, the same pandas and
scikit-learn Colab ships), which runs every code cell against the real
nflverse files and fails if a cell errors or the model loses to the
baseline. Re-run both after editing a cell.
"""

from __future__ import annotations

import json
from pathlib import Path

NB_PATH = Path(__file__).resolve().parents[1] / "notebooks" / "fantasy-points-model.ipynb"


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

cells.append(md("""
# Build a Fantasy Prediction Model

**DataDraft portfolio project** — predict how many PPR points a player will score *before* the game is played, using real NFL history, and find out honestly whether your model beats the simplest guess there is.

What you'll build, in order:

1. Load every regular-season stat line since 2021 from [nflverse](https://github.com/nflverse/nflverse-data) (free, CC BY 4.0)
2. A **baseline** — each player's average over his last three games
3. **Features** that only use what you'd know before kickoff
4. A model trained on past seasons and **tested on a season it never saw**
5. The number that matters: does it beat the baseline, and where?
6. A **leak on purpose**, so you can see what a too-good-to-be-true score looks like
7. **Projections for the upcoming week**

You need a free Google account for Colab. Run the cells top to bottom — the first download takes about a minute.

> **The one rule:** a feature may only use information you'd have had before the game kicked off. Break it and your model looks brilliant and predicts nothing.
"""))

cells.append(md("""
## 0 · Setup

Everything here is already installed in Colab: pandas, NumPy, scikit-learn and matplotlib.
"""))

cells.append(code("""
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.inspection import permutation_importance
from sklearn.metrics import mean_absolute_error

pd.set_option("display.width", 120)
pd.set_option("display.max_columns", 20)

STATS_URL = "https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_{}.csv"
SCHEDULE_URL = "https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv"
POSITIONS = ["QB", "RB", "WR", "TE"]
print("Ready.")
"""))

cells.append(md("""
## 1 · Load real history

One file per season, straight off nflverse's GitHub releases. A season that hasn't started yet simply isn't there, so we try each year and keep what loads.

We keep regular-season games at the four fantasy positions, and only games a player **actually played** — a row with no attempts, carries or targets is a roster spot, not a performance.
"""))

cells.append(code("""
COLS = [
    "player_id", "player_display_name", "position", "season", "week", "season_type",
    "team", "opponent_team", "attempts", "carries", "targets", "target_share",
    "fantasy_points_ppr",
]

frames = []
for season in range(2021, pd.Timestamp.today().year + 2):
    try:
        frames.append(pd.read_csv(STATS_URL.format(season), usecols=COLS))
        print(f"{season}: loaded")
    except Exception:
        print(f"{season}: not published yet — skipping")

raw = pd.concat(frames, ignore_index=True)
df = raw[(raw["season_type"] == "REG") & raw["position"].isin(POSITIONS)].copy()
for col in ["attempts", "carries", "targets", "target_share"]:
    df[col] = df[col].fillna(0)
df = df[(df["attempts"] + df["carries"] + df["targets"]) > 0]
df = df.sort_values(["player_id", "season", "week"]).reset_index(drop=True)
print(f"{len(df):,} player-games from {df['season'].min()} to {df['season'].max()}")
"""))

cells.append(md("""
## 2 · Look before you model

Two things worth knowing up front: how much points vary by position, and how noisy a single game is. A running back's 20-point game and 4-point game can be a week apart with nothing changed.
"""))

cells.append(code("""
print(df.groupby("position")["fantasy_points_ppr"].describe()[["count", "mean", "std", "50%", "max"]].round(1))
"""))

cells.append(md("""
## 3 · Decide what you're testing on — then build the baseline

**Split by time, never at random.** Train on complete past seasons, test on the latest complete season. A random split lets the model peek at week 12 while predicting week 11, which is exactly what you can't do on a Sunday.

The baseline is the forecast everyone already makes in their head: *he's averaged 16 over his last three, so 16.* If a model can't beat that, it isn't a model.
"""))

cells.append(code("""
max_week = df.groupby("season")["week"].max()
complete = [s for s, w in max_week.items() if w >= 17]
TEST_SEASON = complete[-1]
TRAIN_SEASONS = [s for s in complete if s < TEST_SEASON]
CURRENT_SEASON = int(df["season"].max())
print("train on", TRAIN_SEASONS, "| test on", TEST_SEASON, "| current season", CURRENT_SEASON)

g = df.groupby("player_id", group_keys=False)

def past_mean(col, n):
    # shift(1): the average of the games BEFORE this one. Without the shift,
    # this game's own points leak into its forecast.
    return g[col].transform(lambda s: s.shift(1).rolling(n, min_periods=1).mean())

df["pts_last3"] = past_mean("fantasy_points_ppr", 3)
df["games_before"] = g.cumcount()

# Judge both forecasts on the same rows: players with at least 3 games of history.
test = df[(df["season"] == TEST_SEASON) & (df["games_before"] >= 3)]
baseline_mae = mean_absolute_error(test["fantasy_points_ppr"], test["pts_last3"])
print(f"Baseline MAE on {TEST_SEASON}: {baseline_mae:.2f} points per player-game")
"""))

cells.append(md("""
## 4 · Features — only what you'd know before kickoff

Every feature is built from **earlier** games (`shift(1)` again), so each row describes the player as he looked walking into that game:

| Feature | The idea |
|---|---|
| `pts_last3`, `pts_last8` | Recent form, short and long |
| `pts_season` | Form this season only |
| `targets_last3`, `carries_last3`, `attempts_last3` | Opportunity — volume is more stable than points |
| `target_share_last3` | His slice of the team's passing game |
| `games_before` | How much history we have on him |
| `opp_allowed_last4` | What this week's opponent has allowed to his position lately |
| `position` | QBs, RBs, WRs and TEs score differently |
"""))

cells.append(code("""
df["pts_last8"] = past_mean("fantasy_points_ppr", 8)
df["targets_last3"] = past_mean("targets", 3)
df["carries_last3"] = past_mean("carries", 3)
df["attempts_last3"] = past_mean("attempts", 3)
df["target_share_last3"] = past_mean("target_share", 3)
df["pts_season"] = df.groupby(["player_id", "season"], group_keys=False)["fantasy_points_ppr"].transform(
    lambda s: s.shift(1).expanding().mean()
)

# Points each defence allowed to each position, week by week — then the average
# of its PREVIOUS four weeks, so this week's game can't grade itself.
allowed = (
    df.groupby(["season", "week", "opponent_team", "position"], as_index=False)["fantasy_points_ppr"].sum()
    .rename(columns={"fantasy_points_ppr": "allowed"})
    .sort_values(["opponent_team", "position", "season", "week"])
)
allowed["opp_allowed_last4"] = allowed.groupby(["opponent_team", "position", "season"])["allowed"].transform(
    lambda s: s.shift(1).rolling(4, min_periods=1).mean()
)
df = df.merge(
    allowed[["season", "week", "opponent_team", "position", "opp_allowed_last4"]],
    on=["season", "week", "opponent_team", "position"],
    how="left",
)

FEATURES = [
    "pts_last3", "pts_last8", "pts_season", "targets_last3", "carries_last3",
    "attempts_last3", "target_share_last3", "games_before", "opp_allowed_last4",
]

def design(frame, columns=None):
    X = pd.get_dummies(frame[FEATURES + ["position"]], columns=["position"], dtype=float)
    return X if columns is None else X.reindex(columns=columns, fill_value=0.0)

print(df[FEATURES].describe().T[["mean", "min", "max"]].round(2))
"""))

cells.append(md("""
## 5 · Train on the past, test on the future

A gradient-boosted tree model: it learns thresholds like *"a receiver averaging 8+ targets against a defence that's leaking points"* on its own, and it copes with the gaps (a player's first game has no history) without you filling them in.
"""))

cells.append(code("""
train = df[df["season"].isin(TRAIN_SEASONS) & (df["games_before"] >= 1)]
test = df[(df["season"] == TEST_SEASON) & (df["games_before"] >= 3)]

X_train = design(train)
X_test = design(test, X_train.columns)

model = HistGradientBoostingRegressor(
    max_iter=300, learning_rate=0.05, min_samples_leaf=50, l2_regularization=1.0, random_state=0
)
model.fit(X_train, train["fantasy_points_ppr"])
pred = model.predict(X_test)

model_mae = mean_absolute_error(test["fantasy_points_ppr"], pred)
print(f"Baseline MAE: {baseline_mae:.2f}")
print(f"Model MAE:    {model_mae:.2f}")
print(f"Better by {baseline_mae - model_mae:.2f} points a player-game "
      f"({(baseline_mae - model_mae) / baseline_mae:.1%})")
"""))

cells.append(md("""
## 6 · Where it works, and where it doesn't

An overall number hides the interesting part. Break the error out by position.
"""))

cells.append(code("""
scored = test.assign(
    baseline_err=(test["fantasy_points_ppr"] - test["pts_last3"]).abs(),
    model_err=(test["fantasy_points_ppr"] - pred).abs(),
)
by_pos = scored.groupby("position").agg(
    games=("model_err", "size"),
    baseline_mae=("baseline_err", "mean"),
    model_mae=("model_err", "mean"),
).round(2)
print(by_pos)

ax = by_pos[["baseline_mae", "model_mae"]].plot.bar(figsize=(7, 3.5), rot=0)
ax.set_ylabel("Mean absolute error (points)")
ax.set_title(f"{TEST_SEASON}: last-3 average vs model")
plt.tight_layout()
plt.show()
"""))

cells.append(md("""
## 7 · What the model leans on

Permutation importance: scramble one feature at a time and see how much worse the model gets. The bigger the damage, the more it was relying on that feature.
"""))

cells.append(code("""
sample = X_test.sample(min(3000, len(X_test)), random_state=0)
imp = permutation_importance(
    model, sample, test.loc[sample.index, "fantasy_points_ppr"],
    n_repeats=5, random_state=0, scoring="neg_mean_absolute_error",
)
importance = pd.Series(imp.importances_mean, index=sample.columns).sort_values(ascending=False)
print(importance.round(3).head(10))
"""))

cells.append(md("""
## 8 · Leak on purpose

Add one feature you *couldn't* have known before kickoff — the targets and carries he got **in this game** — and retrain. Watch the error collapse.

That number is a lie. It's the single most common mistake in sports modelling, and now you'll recognise it: when a model looks too good, check whether it's reading the answer.
"""))

cells.append(code("""
leaky = FEATURES + ["targets", "carries"]
X_train_leak = pd.get_dummies(train[leaky + ["position"]], columns=["position"], dtype=float)
X_test_leak = pd.get_dummies(test[leaky + ["position"]], columns=["position"], dtype=float).reindex(
    columns=X_train_leak.columns, fill_value=0.0
)
leak_model = HistGradientBoostingRegressor(max_iter=300, learning_rate=0.05, random_state=0)
leak_model.fit(X_train_leak, train["fantasy_points_ppr"])
leak_mae = mean_absolute_error(test["fantasy_points_ppr"], leak_model.predict(X_test_leak))
print(f"Honest model MAE: {model_mae:.2f}")
print(f"Leaky model MAE:  {leak_mae:.2f}   <- looks amazing, predicts nothing")
"""))

cells.append(md("""
## 9 · Projections for the upcoming week

Now use it for real. Retrain on everything, find each team's next unplayed game on the schedule, and describe every active player as he looks today.
"""))

cells.append(code("""
final = HistGradientBoostingRegressor(
    max_iter=300, learning_rate=0.05, min_samples_leaf=50, l2_regularization=1.0, random_state=0
)
all_rows = df[df["games_before"] >= 1]
X_all = design(all_rows)
final.fit(X_all, all_rows["fantasy_points_ppr"])

sched = pd.read_csv(SCHEDULE_URL, usecols=["season", "week", "game_type", "home_team", "away_team", "result"])
upcoming = sched[(sched["season"] == CURRENT_SEASON) & (sched["game_type"] == "REG") & sched["result"].isna()]

if upcoming.empty:
    print(f"No unplayed regular-season games left in {CURRENT_SEASON}.")
else:
    next_week = int(upcoming["week"].min())
    games = upcoming[upcoming["week"] == next_week]
    matchups = pd.concat([
        games.rename(columns={"home_team": "team", "away_team": "opponent_team"}),
        games.rename(columns={"away_team": "team", "home_team": "opponent_team"}),
    ])[["team", "opponent_team"]]

    # Each player's most recent game this season, with its stats included in
    # his history now — the game is over, so it's fair to know about.
    cur = df[df["season"] == CURRENT_SEASON].sort_values(["player_id", "week"])
    hist = df.sort_values(["player_id", "season", "week"]).groupby("player_id")
    now = cur.groupby("player_id").tail(1)[["player_id", "player_display_name", "position", "team"]].copy()
    stats = pd.DataFrame({
        "pts_last3": hist["fantasy_points_ppr"].apply(lambda s: s.tail(3).mean()),
        "pts_last8": hist["fantasy_points_ppr"].apply(lambda s: s.tail(8).mean()),
        "targets_last3": hist["targets"].apply(lambda s: s.tail(3).mean()),
        "carries_last3": hist["carries"].apply(lambda s: s.tail(3).mean()),
        "attempts_last3": hist["attempts"].apply(lambda s: s.tail(3).mean()),
        "target_share_last3": hist["target_share"].apply(lambda s: s.tail(3).mean()),
        "games_before": hist.size(),
    })
    now = now.join(stats, on="player_id")
    now["pts_season"] = now["player_id"].map(cur.groupby("player_id")["fantasy_points_ppr"].mean())
    now = now.merge(matchups, on="team", how="inner")  # teams on a bye drop out here
    recent_allowed = (
        allowed[allowed["season"] == CURRENT_SEASON]
        .groupby(["opponent_team", "position"])["allowed"]
        .apply(lambda s: s.tail(4).mean())
        .rename("opp_allowed_last4")
    )
    now = now.join(recent_allowed, on=["opponent_team", "position"])
    now = now[now["games_before"] >= 3]

    now["projection"] = final.predict(design(now, X_all.columns)).round(1)
    print(f"Week {next_week} of {CURRENT_SEASON} — top projections by position\\n")
    for pos in POSITIONS:
        top = now[now["position"] == pos].nlargest(8, "projection")
        print(pos)
        print(top[["player_display_name", "team", "opponent_team", "pts_last3", "projection"]].round(1).to_string(index=False))
        print()
"""))

cells.append(md("""
## 10 · Ship it

File → Save a copy in Drive (or Download .ipynb), then put it on GitHub with a short README:

```
# Fantasy points model

**Question:** can a model forecast a player's PPR points better than his last-3-game average?
**Data:** nflverse weekly player stats, 2021 onward (CC BY 4.0).
**Method:** gradient-boosted trees on pre-kickoff features; trained on past seasons, tested on the latest complete one.
**Result:** baseline MAE X.XX → model MAE X.XX (−Y%). Biggest gain at <position>; hardest position was <position>.
**Honest caveat:** the leaky version scored X.XX — which is why every feature is shifted.
```

That last line is the one an interviewer asks about.

## Your turn

1. What's the baseline MAE on the test season, and by how much does your model beat it?
2. Which position is hardest to predict, and why do you think that is?
3. Which feature does the model lean on most? Did that surprise you?
4. Drop `opp_allowed_last4` and retrain. Does the matchup actually matter?
5. **Stretch:** predict a range, not a point — fit `HistGradientBoostingRegressor(loss="quantile", quantile=0.1)` and `0.9`, and report how often the real score lands inside.

*Data: nflverse-data (CC BY 4.0). Built on DataDraft.*
"""))

nb = {
    "cells": cells,
    "metadata": {
        "colab": {"provenance": []},
        "kernelspec": {"display_name": "Python 3", "name": "python3"},
        "language_info": {"name": "python"},
    },
    "nbformat": 4,
    "nbformat_minor": 0,
}

NB_PATH.parent.mkdir(parents=True, exist_ok=True)
NB_PATH.write_text(json.dumps(nb, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
# A copy the site serves, so learners can download it and upload it to Colab
# when they can't reach the GitHub repo.
PUBLIC_COPY = NB_PATH.parents[1] / "public" / "notebooks" / NB_PATH.name
PUBLIC_COPY.parent.mkdir(parents=True, exist_ok=True)
PUBLIC_COPY.write_text(json.dumps(nb, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"wrote {NB_PATH} ({len(cells)} cells)")
