-- One row per player. A dimension answers "who is this", never "how did
-- they do" — the moment you put a stat in here you have to decide which
-- season it is from, and you have quietly built a fact table.
--
-- current_team is the interesting column: four of these players changed
-- team inside the window, so "their team" is only meaningful as of a date.
-- Saying so in the name is cheaper than explaining it in a meeting later.

with weeks as (

    select * from {{ ref('stg_player_weeks') }}

),

latest as (

    select
        player_id,
        team,
        row_number() over (
            partition by player_id
            order by season desc, week desc
        ) as rn
    from weeks

)

select
    w.player_id,
    max(w.player_name)                                as player_name,
    max(w.position)                                   as position,
    max(l.team)                                       as current_team,
    min(w.season)                                     as first_season,
    max(w.season)                                     as last_season,
    count(*)                                          as games_played

from weeks w
join latest l
  on l.player_id = w.player_id
 and l.rn = 1
group by w.player_id
