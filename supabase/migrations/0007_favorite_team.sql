-- Team drafted in the first-account orientation.
--
-- Null means the member has not completed the draft yet. The check keeps a
-- typo or historical alias from producing an avatar crop for the wrong cell.

alter table public.learner_progress
  add column if not exists favorite_team text;

alter table public.learner_progress
  drop constraint if exists learner_progress_favorite_team_check;

alter table public.learner_progress
  add constraint learner_progress_favorite_team_check
  check (
    favorite_team is null
    or favorite_team = any (array[
      'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE',
      'DAL','DEN','DET','GB','HOU','IND','JAX','KC',
      'LV','LAC','LAR','MIA','MIN','NE','NO','NYG',
      'NYJ','PHI','PIT','SF','SEA','TB','TEN','WAS'
    ])
  );
