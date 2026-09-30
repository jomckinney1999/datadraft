/**
 * Portfolio builds — guided projects that end in something you can show
 * someone, outside the graded lesson player.
 *
 * These are not `lib/finals.ts` knowledge checks, and they are not the short
 * scripted cases in `lib/interview-cases.ts` either. A case is thirty minutes
 * and a right answer. A build takes an afternoon and ends in a repo.
 *
 * The bar for adding one: it has to be something a learner could not have
 * done on any other SQL site. Both of the live ones clear it — one pulls the
 * learner's own fantasy league through a public API, the other models raw
 * nflverse releases into a tested dbt warehouse. Neither exists elsewhere
 * because neither works without football data someone actually cares about.
 */

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

const REPO = "jomckinney1999/SQL-Sports";
const BRANCH = "main";
const NOTEBOOK = "notebooks/my-league-scorecard.ipynb";
const DBT_DIR = "dbt/nflverse_warehouse";

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
        body: "Sleeper is the easy path — free public API, no passwords, no CSV wrestling. ESPN and Yahoo work too: fill a small CSV template from your league app, then upload it in Colab.",
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
];

export function getProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export function liveProjects(): Project[] {
  return PROJECTS.filter((p) => p.status === "live");
}
