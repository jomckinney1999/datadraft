/**
 * Portfolio projects — guided builds that use the learner's own data
 * (or a sample), outside the graded lesson player.
 *
 * These are not `lib/finals.ts` knowledge checks. A project ships a notebook
 * / README someone can put on a resume. Start with one live project; add more
 * by extending PROJECTS.
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
  /** Open-in-Colab URL (GitHub → Colab). */
  colabUrl: string;
  /** Raw notebook on GitHub for “view source”. */
  notebookPath: string;
  steps: ProjectStep[];
  questions: ProjectQuestion[];
  /** What they walk away with. */
  deliverables: string[];
};

const REPO = "jomckinney1999/SQL-Sports";
const BRANCH = "main";
const NOTEBOOK = "notebooks/my-league-scorecard.ipynb";

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
];

export function getProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export function liveProjects(): Project[] {
  return PROJECTS.filter((p) => p.status === "live");
}
