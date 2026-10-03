/**
 * Portfolio builds — guided projects that end in something you can show
 * someone, outside the graded lesson player.
 *
 * These are not `lib/finals.ts` knowledge checks, and they are not the short
 * scripted cases in `lib/interview-cases.ts` either. A case is thirty minutes
 * and a right answer. A build takes an afternoon and ends in a repo.
 *
 * The bar for adding one: it has to be something a learner could not have
 * done on any other SQL site. The live ones clear it — your own fantasy
 * league through a public API, raw nflverse into a tested dbt warehouse,
 * next week's points graded against the obvious guess. Builds with
 * status "building" show in the catalogue as coming soon (art + brief ready,
 * notebook/repo not shipped yet).
 */

import { REPO } from "@/lib/site";

export type ProjectStep = {
  id: string;
  title: string;
  body: string;
  /** Optional external action (Colab, docs). */
  cta?: { label: string; href: string };
};

export type ProjectQuestion = {
  id: string;
  prompt: string;
  tip?: string;
};

export type Project = {
  id: string;
  title: string;
  blurb: string;
  /** Why this exists — one short line. */
  pitch: string;
  /** Rough time to finish. */
  hours: string;
  level: string;
  accent: "turf" | "gold";
  status: "live" | "building";
  /** Course this pairs with best. */
  pairsWith: string;
  /** What you leave holding — shown on the card. */
  artifact: string;
  /** Skills badge row on the card. */
  skills: string[];
  /** Open-in-Colab URL, for notebook builds. */
  colabUrl?: string;
  /** Raw notebook on GitHub for “view source”. */
  notebookPath?: string;
  /** Source folder on GitHub, for builds that are a repo rather than a notebook. */
  repoPath?: string;
  steps: ProjectStep[];
  questions: ProjectQuestion[];
  /** What they walk away with. */
  deliverables: string[];
};

const BRANCH = "main";
const NOTEBOOK = "notebooks/my-league-scorecard.ipynb";
const DBT_DIR = "dbt/nflverse_warehouse";
const MODEL_NOTEBOOK = "notebooks/fantasy-points-model.ipynb";

export const PROJECTS: Project[] = [
  {
    id: "my-league-scorecard",
    title: "Your League Scorecard",
    blurb:
      "Pull your real fantasy league, load it into SQL, and answer the questions managers argue about every week.",
    pitch: "Bring your own league. Leave with a portfolio notebook.",
    hours: "1–2h",
    level: "After SQL Fundamentals",
    accent: "gold",
    status: "live",
    pairsWith: "SQL Fundamentals",
    artifact: "A Colab notebook on your own league",
    skills: ["APIs", "SQL", "Joins", "Aggregation"],
    notebookPath: NOTEBOOK,
    colabUrl: `https://colab.research.google.com/github/${REPO}/blob/${BRANCH}/${NOTEBOOK}`,
    steps: [
      {
        id: "platform",
        title: "Pick how you'll get the data",
        body: "Sleeper is the easy path — free public API, no passwords, no CSV wrestling. ESPN and Yahoo work too: fill a small CSV template from your league app, then upload it in Colab. Want to see your league before opening Colab? Load it in the panel above — same tables, right in this tab.",
      },
      {
        id: "export",
        title: "Grab your league",
        body: "On Sleeper: note your username (the one in your profile URL). The notebook lists your leagues and you pick one. On ESPN/Yahoo: copy weekly scores into the template CSV the notebook links.",
      },
      {
        id: "colab",
        title: "Open the notebook",
        body: "Google Colab runs in the browser — no install. Click Open in Colab, sign in with Google if asked, then run the cells top to bottom.",
        cta: {
          label: "Open in Colab",
          href: `https://colab.research.google.com/github/${REPO}/blob/${BRANCH}/${NOTEBOOK}`,
        },
      },
      {
        id: "load",
        title: "Load tables + peek",
        body: "You'll build three tables: managers, weekly_scores, and (on Sleeper) starter_points. Run the peek cells — same idea as SELECT * LIMIT 10 in the lessons.",
      },
      {
        id: "questions",
        title: "Answer the scorecard questions",
        body: "Write real SQL against your league. Hints sit under each question. Solutions are at the bottom — try first, peek second.",
      },
      {
        id: "chart",
        title: "Chart it for the group chat",
        body: "Run the luck query in the panel above (or any query of your own) and press Chart it. You get a chart of your league with everyone's name on it — post it in the league chat and watch the arguments start.",
      },
      {
        id: "ship",
        title: "Save something you can show",
        body: "File → Download .ipynb, or copy to your Drive. Add a three-line README: question, how you got the data, one finding. That's interview fuel.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Who leads the league in wins right now?",
        tip: "Group weekly_scores by manager and count wins — or sum the win column if you built one.",
      },
      {
        id: "q2",
        prompt: "Who has scored the most total points (PF) this season?",
        tip: "SUM(points_for) per manager, ORDER BY that total DESC.",
      },
      {
        id: "q3",
        prompt: "What's the highest single-week score, and who got it?",
        tip: "ORDER BY points_for DESC LIMIT 1 — include week and manager.",
      },
      {
        id: "q4",
        prompt: "Which matchup was the closest (smallest point gap)?",
        tip: "Join each row to its opponent that week, then ABS(pf - pa). Smallest wins.",
      },
      {
        id: "q5",
        prompt:
          "Who left the most points on the bench? (Sleeper path — starter vs roster points)",
        tip: "Compare starter points to all rostered player points that week, then sum the gap.",
      },
      {
        id: "q6",
        prompt:
          "Stretch: what's each manager's all-play record — win rate if they'd faced every team every week?",
        tip: "Self-join weekly scores within the same week. Count how often your PF beats theirs.",
      },
    ],
    deliverables: [
      "A Colab notebook with your league loaded",
      "SQL answers to the scorecard questions",
      "A chart of your league, made with Chart it, for the group chat",
      "A short README: question, data source, one finding",
    ],
  },

  {
    id: "nflverse-dbt-warehouse",
    title: "Build the Warehouse",
    blurb:
      "Model three seasons of raw nflverse releases into a tested dbt warehouse — staging views, a dimension, a fact, and the tests that catch a bad join.",
    pitch:
      "Analytics engineering, on data nobody else\u2019s portfolio is using.",
    hours: "3–4h",
    level: "After SQL Fundamentals",
    accent: "turf",
    status: "live",
    pairsWith: "Analytics Engineering",
    artifact: "A dbt repo with passing tests and a lineage graph",
    skills: ["dbt", "Data modelling", "Testing", "DuckDB"],
    repoPath: DBT_DIR,
    steps: [
      {
        id: "why",
        title: "What analytics engineering actually is",
        body: "Someone has to turn raw exports into tables the rest of the company can trust. That job is modelling, testing and documenting — and dbt is how most teams do it. You are about to do the whole loop on real data.",
      },
      {
        id: "install",
        title: "Install dbt — on DuckDB, not a cloud warehouse",
        body: "pip install dbt-duckdb. No account, no credit card, no warehouse to wait on, and DuckDB reads CSVs straight off a URL. The dbt you write here is the same dbt you would run against Snowflake; only the profile file changes.",
        cta: {
          label: "Starter project on GitHub",
          href: `https://github.com/${REPO}/tree/${BRANCH}/${DBT_DIR}`,
        },
      },
      {
        id: "staging",
        title: "Write the staging layer",
        body: "Two models, both views, both boring on purpose: pick the columns worth keeping, rename them the way a human would, cast them. No business logic — the moment staging decides what a good week is, every model downstream inherits that opinion.",
      },
      {
        id: "marts",
        title: "Build a dimension and a fact",
        body: "dim_players answers who someone is. fct_player_weeks answers how they did, one row per player per game, with the game\u2019s own conditions joined on. Keeping those two jobs apart is most of what data modelling is.",
      },
      {
        id: "test",
        title: "Make the grain a test",
        body: "Write the grain down as a column — player + season + week — and put a unique test on it. If a join ever fans out, every total downstream doubles and nothing errors. That test is the only thing standing between you and a wrong number in a meeting.",
      },
      {
        id: "ship",
        title: "Run dbt build, then docs",
        body: "dbt build runs models and tests together, which is the habit worth forming — dbt run tells you nothing about whether the output is right. Then dbt docs generate && dbt docs serve, and screenshot the lineage graph. That picture is what gets you asked about it.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Which position produced the most total PPR points in 2024?",
        tip: "Group fct_player_weeks by position. This is the query the mart exists to make one line long.",
      },
      {
        id: "q2",
        prompt:
          "Does scoring actually go up indoors? Compare average points by is_indoors.",
        tip: "is_indoors is a column because you put it there in the mart. That is the payoff of modelling — the analyst never has to know which roof values mean what.",
      },
      {
        id: "q3",
        prompt:
          "How many player-weeks have no matching game_id, and why might that be?",
        tip: "The LEFT JOIN is deliberate. Count the nulls before you assume it is a bug.",
      },
      {
        id: "q4",
        prompt:
          "Add a mart that ranks players within their position by weekly points.",
        tip: "rank() over (partition by season, week, position order by fantasy_points_ppr desc). Then test that rank 1 is unique per partition.",
      },
      {
        id: "q5",
        prompt:
          "Break a join on purpose — then watch which test catches it.",
        tip: "Change the join in fct_player_weeks to match on season and week alone. dbt build should fail on player_week_key. If it does not, your test is not doing its job.",
      },
    ],
    deliverables: [
      "A dbt project that builds and passes its tests",
      "A dimension and a fact with the grain written down",
      "A lineage graph screenshot from dbt docs",
    ],
  },

  {
    // Clears the bar the same way: the question is one every fantasy manager
    // argues about, and the honest answer — "did it beat his last-3 average?"
    // — is the one most prediction tutorials never ask. The notebook is
    // generated by scripts/build-prediction-model-notebook.py and run end to
    // end, against the real files, by scripts/test-prediction-model-notebook.mjs.
    id: "fantasy-points-model",
    title: "Build a Fantasy Prediction Model",
    blurb:
      "Predict every player's PPR points before kickoff from real NFL history — then find out, honestly, whether you beat his last-three-games average.",
    pitch: "Your own projections, graded against what actually happened.",
    hours: "3–4h",
    level: "After Python & pandas",
    accent: "gold",
    status: "live",
    pairsWith: "Python & pandas",
    artifact: "A Colab notebook with a model, a backtest, and this week's projections",
    skills: ["pandas", "Feature engineering", "scikit-learn", "Backtesting"],
    notebookPath: MODEL_NOTEBOOK,
    colabUrl: `https://colab.research.google.com/github/${REPO}/blob/${BRANCH}/${MODEL_NOTEBOOK}`,
    steps: [
      {
        id: "target",
        title: "Decide exactly what you're predicting",
        body: "One number: a player's PPR points in his next game. And one rule that everything else hangs on — a feature may only use what you'd have known before kickoff. Break it and the model looks brilliant and predicts nothing.",
      },
      {
        id: "open",
        title: "Open the notebook",
        body: "It runs in Colab, in the browser, with nothing to install. It pulls every regular-season stat line since 2021 straight from nflverse's public releases, so the first run takes about a minute.",
        cta: {
          label: "Open in Colab",
          href: `https://colab.research.google.com/github/${REPO}/blob/${BRANCH}/${MODEL_NOTEBOOK}`,
        },
      },
      {
        id: "baseline",
        title: "Build the baseline first",
        body: "Before any model: his average over his last three games. That's the forecast everyone already makes in their head, and it's the bar. Split by time — train on past seasons, test on the latest complete one — never at random, or the model gets to read next week.",
      },
      {
        id: "features",
        title: "Engineer features that respect the clock",
        body: "Recent form, volume (targets, carries, attempts), target share, and what this week's opponent has been allowing to his position. Every one is built from earlier games with a shift, so each row describes the player walking into the game, not walking out of it.",
      },
      {
        id: "train",
        title: "Train, test, and break it down",
        body: "A gradient-boosted tree model, scored on mean absolute error against the baseline — overall and by position. Then permutation importance, to see what it actually leans on. Then leak a feature on purpose and watch the error collapse, so you know what a lie looks like.",
      },
      {
        id: "ship",
        title: "Project next week, then ship it",
        body: "Retrain on everything, read the real schedule for each team's next game, and print the top projections at every position. Save to GitHub with a five-line README: question, data, method, result against the baseline, and the leak you avoided.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "What's the baseline's error on the test season, and by how much does your model beat it?",
        tip: "Same rows for both — players with at least three games of history — or the comparison flatters one of them.",
      },
      {
        id: "q2",
        prompt: "Which position is hardest to predict, and why might that be?",
        tip: "Look at the spread of points per position in section 2 before you guess.",
      },
      {
        id: "q3",
        prompt: "Which feature does the model lean on most?",
        tip: "Permutation importance scrambles one column at a time; the bigger the damage, the more it mattered.",
      },
      {
        id: "q4",
        prompt: "Drop the matchup feature and retrain. Does the opponent actually matter?",
        tip: "Remove opp_allowed_last4 from FEATURES and re-run sections 5 and 6.",
      },
      {
        id: "q5",
        prompt: "Stretch: predict a range, not a point. How often does the real score land inside it?",
        tip: "Fit loss=\"quantile\" at 0.1 and 0.9 and count the hits. Aim for about 80%.",
      },
    ],
    deliverables: [
      "A Colab notebook with an honest backtest against a baseline",
      "An error-by-position table and chart",
      "Next week's projections at every position",
      "A README with the result — and the leak you avoided",
    ],
  },

  {
    id: "waiver-edge",
    title: "Waiver Edge",
    blurb:
      "Rank the wire with a documented SQL score — trend, opportunity, and who is actually free — then ship a top-15 you could argue for in league chat.",
    pitch: "A waiver priority list with receipts, not vibes.",
    hours: "2–3h",
    level: "After SQL Fundamentals",
    accent: "turf",
    status: "building",
    pairsWith: "SQL Fundamentals",
    artifact: "A notebook: ranked free agents + the scoring SQL",
    skills: ["CTEs", "Anti-joins", "Window functions", "nflverse / Sleeper"],
    steps: [
      {
        id: "define",
        title: "Write the score before you write SQL",
        body: "Pick three ingredients you can defend (recent points trend, target or carry share, rostered %). Write the formula in plain English first — a black-box rank isn't a portfolio piece.",
      },
      {
        id: "data",
        title: "Load the wire and the games",
        body: "Pull Sleeper research (or the lesson waiver_wire) and weekly scores. Keep free agents as an anti-join against your league's rosters so you never recommend someone already owned.",
      },
      {
        id: "rank",
        title: "Build the ranked list in SQL",
        body: "CTEs for each ingredient, one final SELECT with the composite score, ORDER BY that score. Cap at fifteen. Document ties.",
      },
      {
        id: "ship",
        title: "Ship the list + the definition",
        body: "README: question, data week, formula, top five names. Screenshot the query. That's the artifact.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Who is #1 on your wire this week, and which ingredient drove it?",
      },
      {
        id: "q2",
        prompt: "Name one player your score ranks high who Sleeper % rostered would bury — why keep him?",
      },
    ],
    deliverables: [
      "Documented composite waiver score",
      "Top-15 free-agent table from SQL",
      "README with the week and the formula",
    ],
  },

  {
    id: "adp-vs-outcome",
    title: "ADP vs Outcome",
    blurb:
      "Compare preseason fantasy ADP to end-of-season points: steals, busts, and hit rates by round — on a real draft board, not a toy table.",
    pitch: "Prove whether your draft room beat the market.",
    hours: "2–3h",
    level: "After SQL Fundamentals",
    accent: "gold",
    status: "building",
    pairsWith: "SQL Fundamentals",
    artifact: "A notebook: steals/busts table + round hit-rate chart",
    skills: ["Joins", "Percentiles", "Sleeper ADP", "nflverse"],
    steps: [
      {
        id: "board",
        title: "Freeze a draft board",
        body: "Use a real preseason ADP (Sleeper PPR) and a finished season of points. Pick one season so the story doesn't smear across rule changes.",
      },
      {
        id: "join",
        title: "Join ADP to outcomes",
        body: "Match players carefully (suffixes, team changes). One row per drafted name with adp_rank and season_points.",
      },
      {
        id: "labels",
        title: "Define steal and bust",
        body: "Write the rules down — e.g. finished 24+ spots above ADP = steal. No mystery thresholds.",
      },
      {
        id: "ship",
        title: "Round hit rates + the hall of shame/fame",
        body: "Hit rate by draft round, top steals, top busts. Chart it. README with the season and the definitions.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Which round had the highest hit rate under your definition?",
      },
      {
        id: "q2",
        prompt: "Who was the biggest steal — and was it skill or injury luck on the board around them?",
      },
    ],
    deliverables: [
      "ADP-to-points join with clear player matching",
      "Steal/bust table and round hit rates",
      "Chart + short README",
    ],
  },

  {
    id: "start-sit-backtest",
    title: "Start/Sit Backtest",
    blurb:
      "Encode transparent start/sit rules in SQL or pandas, replay a season of choices, and measure how often the rules beat a naive \"start your studs\" baseline.",
    pitch: "Advice you can grade — not a hot take.",
    hours: "3–4h",
    level: "After SQL + a bit of Python",
    accent: "turf",
    status: "building",
    pairsWith: "Python & pandas",
    artifact: "A notebook: rules, backtest table, win rate vs baseline",
    skills: ["Rules engines", "Backtesting", "SQL or pandas", "Evaluation"],
    steps: [
      {
        id: "rules",
        title: "Write rules a human can audit",
        body: "Example: start the RB with more rush attempts over the last three games, ties to projected points. No black-box model required — clarity is the point.",
      },
      {
        id: "replay",
        title: "Replay every decision week",
        body: "For each week, apply only information available before kickoff. Record the chosen starter and the points they actually scored.",
      },
      {
        id: "baseline",
        title: "Beat a dumb baseline",
        body: "Compare to \"always start higher ADP\" or \"always start last week's points.\" Report win rate and total points.",
      },
      {
        id: "ship",
        title: "Ship the ledger",
        body: "Table of decisions, season score vs baseline, and three weeks you'd change the rule after seeing the tape.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Did your rules beat the baseline on total points? By how much?",
      },
      {
        id: "q2",
        prompt: "Which rule fired the most — and which one you'd delete?",
      },
    ],
    deliverables: [
      "Written start/sit rules",
      "Week-by-week decision ledger",
      "Score vs baseline in a README",
    ],
  },
];

export function getProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export function liveProjects(): Project[] {
  return PROJECTS.filter((p) => p.status === "live");
}

export function buildingProjects(): Project[] {
  return PROJECTS.filter((p) => p.status === "building");
}
