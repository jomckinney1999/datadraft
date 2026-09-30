# nflverse_warehouse

A small, real dbt project over free NFL data. It exists so you can say you
have modelled raw source data into a tested warehouse — and actually have
done it, on data nobody else's portfolio is using.

Runs on **DuckDB**, so there is no cloud account, no credit card, and no
warehouse to wait on. The dbt is the same dbt you would run against Snowflake
or BigQuery; only the profile changes.

## Run it

```bash
pip install dbt-duckdb
cp profiles.example.yml ~/.dbt/profiles.yml   # or set DBT_PROFILES_DIR here
dbt deps      # no packages yet, but get in the habit
dbt build     # runs the models and their tests together
```

`dbt build` is the one to learn. `dbt run` builds models and tells you
nothing about whether they are right.

## What's here

```
models/
  staging/     stg_player_weeks, stg_games   — rename, cast, filter. No logic.
  marts/       dim_players, fct_player_weeks — the grain, tested.
```

The layering is the lesson. Staging models are views that do nothing but make
the raw data legible. Marts are tables that make a decision — what the grain
is, what counts as a boom week — and are tested on it.

## The three things worth arguing about

1. **`fct_player_weeks` has a `player_week_key` with a `unique` test on it.**
   The weekly file happens to carry `game_id`, so the join to the schedule is
   one clean equality. Without that key you would be matching on season, week
   and "this team was on either side of the game" — an OR across home and
   away — and getting it slightly wrong turns one stat line into two. Nothing
   errors; every total downstream quietly doubles. Writing the grain down as
   a tested column is how you find out the same day.

2. **`game_id` is allowed to be null.** A LEFT JOIN that finds nothing is
   information. Forcing it to match would bury it.

3. **`fantasy_points_ppr` has no `>= 0` test.** It goes negative — a lost
   fumble outweighs a two-yard catch. Real data is the point.

## Where to take it

- Add `dbt docs generate && dbt docs serve` and screenshot the lineage graph.
- Add a `mart_weekly_position_ranks` on top of the fact using `rank()`.
- Swap DuckDB for a free Snowflake or BigQuery trial. Only the profile changes,
  which is the thing worth proving to yourself.

Data: [nflverse-data](https://github.com/nflverse/nflverse-data), CC BY 4.0.
