-- One row per NFL game. The only table here with a date on it, which makes
-- it the join that turns "week 3" into a Thursday night in the rain.

with source as (

    select *
    from read_csv_auto(
        'https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv'
    )
    where game_type = 'REG'
      and season between 2022 and 2024

),

renamed as (

    select
        game_id                      as game_id,
        cast(season as integer)      as season,
        cast(week as integer)        as week,
        cast(gameday as date)        as game_date,
        weekday                      as weekday,
        home_team                    as home_team,
        away_team                    as away_team,
        cast(home_score as integer)  as home_score,
        cast(away_score as integer)  as away_score,
        roof                         as roof,
        surface                      as surface,
        cast(temp as integer)        as temperature

    from source

)

select * from renamed
