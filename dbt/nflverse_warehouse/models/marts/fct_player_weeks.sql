-- One row per player per game, with the game's own facts joined on.
--
-- Note which key this joins on. The weekly file carries `game_id`, so the
-- join is one clean equality. Without it you would have to match on season,
-- week, and "this team was on either side of the game" -- an OR across home
-- and away -- and getting that slightly wrong turns one stat line into two.
-- Nothing errors; every total downstream just quietly doubles.
--
-- Which is why `player_week_key` exists and is tested for uniqueness. Write
-- the grain down as a column and a failing test tells you the join fanned
-- out, instead of a director telling you six weeks later.

with weeks as (

    select * from {{ ref('stg_player_weeks') }}

),

games as (

    select * from {{ ref('stg_games') }}

)

select
    -- The grain, written down as a column so a test can hold it.
    w.player_id || '-' || w.season || '-' || w.week as player_week_key,
    w.player_id,
    w.player_name,
    w.position,
    w.team,
    w.season,
    w.week,
    w.opponent,

    g.game_id,
    g.game_date,
    g.weekday,
    case when g.roof in ('dome', 'closed') then true else false end as is_indoors,
    g.surface,
    g.temperature,

    w.passing_yards,
    w.passing_tds,
    w.interceptions,
    w.rushing_yards,
    w.rushing_tds,
    w.targets,
    w.receptions,
    w.receiving_yards,
    w.receiving_tds,
    w.fantasy_points_ppr,

    -- Your first real business rule, and it belongs here rather than in
    -- staging: "a boom week" is a decision about the league you play in,
    -- not a fact about the NFL.
    w.fantasy_points_ppr >= 20 as is_boom_week

from weeks w
left join games g
  on g.game_id = w.game_id
