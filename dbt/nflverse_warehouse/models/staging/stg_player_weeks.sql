-- One row per player per game played.
--
-- Staging does three jobs and no others: pick the columns worth keeping,
-- give them names a human would choose, and cast them. No business logic —
-- the moment a staging model starts deciding what "a good week" is, every
-- mart downstream inherits that opinion whether it wanted it or not.

with source as (

    select *
    from read_csv_auto(
        [
            'https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_2022.csv',
            'https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_2023.csv',
            'https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_2024.csv'
        ],
        union_by_name = true
    )
    where season_type = 'REG'

),

renamed as (

    select
        player_id                        as player_id,
        game_id                          as game_id,
        player_display_name              as player_name,
        position                         as position,
        team                             as team,
        cast(season as integer)          as season,
        cast(week as integer)            as week,
        opponent_team                    as opponent,

        cast(completions as integer)     as completions,
        cast(attempts as integer)        as pass_attempts,
        cast(passing_yards as double)    as passing_yards,
        cast(passing_tds as integer)     as passing_tds,
        cast(passing_interceptions as integer) as interceptions,

        cast(carries as integer)         as carries,
        cast(rushing_yards as double)    as rushing_yards,
        cast(rushing_tds as integer)     as rushing_tds,

        cast(targets as integer)         as targets,
        cast(receptions as integer)      as receptions,
        cast(receiving_yards as double)  as receiving_yards,
        cast(receiving_tds as integer)   as receiving_tds,

        cast(fantasy_points_ppr as double) as fantasy_points_ppr

    from source

)

select * from renamed
