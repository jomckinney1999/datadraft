/**
 * Career resources hub — resume samples, job-hunt tactics, and books.
 *
 * Written for “Andy”: someone using SQL Sports to change careers, not a
 * hobbyist. Voice stays coach-plain. No invented salary stats. Role ids match
 * lib/career-paths.ts so the page can default to the learner’s roadmap pick.
 */

import { CAREER_ROLES } from "./career-paths";

export type ResourceRoleId = (typeof CAREER_ROLES)[number]["id"] | "all";

export type ResumeBullet = {
  /** Plain role line, e.g. "Data Analyst Intern · Acme · 2024". */
  header: string;
  bullets: string[];
};

export type ResumeSample = {
  roleId: (typeof CAREER_ROLES)[number]["id"];
  /** One-line pitch for this sample. */
  blurb: string;
  /** What to lead with for this title. */
  headline: string;
  skills: string[];
  experience: ResumeBullet[];
  projects: ResumeBullet[];
  /** Honest notes from real job-hunt pain. */
  tips: string[];
};

export type Tactic = {
  id: string;
  title: string;
  body: string;
  /** Optional source / book callout. */
  from?: string;
};

export type BookRec = {
  id: string;
  title: string;
  author: string;
  why: string;
  /** Which roadmaps get the most from it. Empty = everyone. */
  roleIds: Array<(typeof CAREER_ROLES)[number]["id"]> | "all";
};

export const RESUME_SAMPLES: ResumeSample[] = [
  {
    roleId: "data-analyst",
    blurb: "Lead with SQL + a clear business question you answered.",
    headline: "Data Analyst · SQL · Excel · Python",
    skills: [
      "SQL (joins, windows, CTEs)",
      "Excel / Google Sheets",
      "Python (pandas)",
      "Tableau or Power BI",
      "Stakeholder writeups",
    ],
    experience: [
      {
        header: "Data Analyst (or adjacent title) · Company · Dates",
        bullets: [
          "Built weekly SQL pulls that cut manual reporting from ~4 hours to under 30 minutes for the ops team.",
          "Defined one trusted metric (with grain + exclusions written down) so finance and product stopped arguing past each other.",
          "Shipped a dashboard used in the Monday standup — not a vanity chart, a decision tool.",
        ],
      },
    ],
    projects: [
      {
        header: "Fantasy League Scorecard · Portfolio · SQL Sports / personal",
        bullets: [
          "Loaded a real fantasy league into SQLite; ranked managers by points-for, wins, and all-play win rate to separate lineup skill from schedule luck.",
          "Documented assumptions in a one-page README a commissioner (or hiring manager) could skim in two minutes.",
        ],
      },
    ],
    tips: [
      "Put the project that sounds like the job near the top — not buried under coursework.",
      "Every bullet: verb → what you built → who it helped. Drop tool lists that aren’t attached to an outcome.",
      "If you’re career-switching, a strong project beats a weak internship line. Say the switch plainly in a one-line summary.",
    ],
  },
  {
    roleId: "business-analyst",
    blurb: "Show you can translate messy ops into a decision, not just a chart.",
    headline: "Business Analyst · Process · SQL · Spreadsheets",
    skills: [
      "Requirements / process mapping",
      "Excel (lookups, pivots, what-if)",
      "SQL fundamentals",
      "Power BI or Tableau",
      "Stakeholder facilitation",
    ],
    experience: [
      {
        header: "Business Analyst · Company · Dates",
        bullets: [
          "Mapped the weekly forecast workflow end-to-end and removed two handoffs that caused late numbers.",
          "Wrote acceptance criteria for a reporting change so engineering and finance signed the same definition of done.",
          "Built an Excel model the team still uses when the warehouse job is late — documented, not tribal knowledge.",
        ],
      },
    ],
    projects: [
      {
        header: "Ops scorecard · Portfolio",
        bullets: [
          "Took a messy export, cleaned it in Excel/SQL, and produced a one-page weekly brief with three actions — not twenty charts.",
        ],
      },
    ],
    tips: [
      "BA resumes die when they’re only tools. Lead with decisions you unblocked.",
      "Mention the people you worked with (ops, finance, eng) — collaboration is the job.",
    ],
  },
  {
    roleId: "analytics-engineer",
    blurb: "Prove you can ship trusted models other people query without fear.",
    headline: "Analytics Engineer · dbt-minded SQL · Git",
    skills: [
      "Advanced SQL (CTEs, windows, performance)",
      "Dimensional modeling basics",
      "Git / code review",
      "Python for awkward transforms",
      "Tests + docs on metrics",
    ],
    experience: [
      {
        header: "Analytics Engineer · Company · Dates",
        bullets: [
          "Owned a mart other teams queried daily; added tests that caught grain bugs before they hit dashboards.",
          "Cut a slow dashboard query from minutes to seconds by fixing the model — not by asking BI to cache harder.",
          "Wrote metric definitions stakeholders could argue with productively (and then agree).",
        ],
      },
    ],
    projects: [
      {
        header: "Weekly player-stats mart · Portfolio",
        bullets: [
          "Modeled season → week → player grain with documented tests; published a README with lineage a stranger could follow.",
        ],
      },
    ],
    tips: [
      "Show Git. A public repo with PRs beats “familiar with version control.”",
      "Reliability language > flashy ML language for this title.",
    ],
  },
  {
    roleId: "data-scientist",
    blurb: "Impact and honesty about holdouts — not a laundry list of libraries.",
    headline: "Data Scientist · SQL · Python · Stats",
    skills: [
      "SQL for clean pulls",
      "Python (pandas, scikit-learn)",
      "Experimental thinking / holdouts",
      "Clear model cards / failure modes",
      "Communication to non-DS partners",
    ],
    experience: [
      {
        header: "Data Scientist · Company · Dates",
        bullets: [
          "Shipped a model that changed a weekly decision; reported lift on a holdout week, not only in-sample fit.",
          "Killed a project early when the signal wasn’t there — and wrote down why so the team didn’t revive it monthly.",
        ],
      },
    ],
    projects: [
      {
        header: "Player-value / win-prob style project · Portfolio",
        bullets: [
          "Trained a simple baseline, beat it honestly, and documented where the model fails (small samples, position quirks).",
        ],
      },
    ],
    tips: [
      "Lead with the decision the model served. Tools are the footnote.",
      "One well-told project > five Kaggle screenshots.",
    ],
  },
  {
    roleId: "bi-analyst",
    blurb: "Dashboards people open on Monday — with the SQL underneath named.",
    headline: "BI Analyst · SQL · Tableau / Power BI",
    skills: [
      "SQL",
      "Tableau and/or Power BI",
      "Excel for ad-hoc",
      "Design for one question per view",
      "Publishing + access hygiene",
    ],
    experience: [
      {
        header: "BI Analyst · Company · Dates",
        bullets: [
          "Owned a published dashboard used in the weekly leadership meeting; cut three unused sheets that confused the story.",
          "Partnered with data eng to fix a grain issue at the source instead of patching it in the viz tool forever.",
        ],
      },
    ],
    projects: [
      {
        header: "Season report dashboard · Portfolio",
        bullets: [
          "One clear question per page; SQL in the repo; Tableau Public or Power BI share link in the README.",
        ],
      },
    ],
    tips: [
      "Link a live dashboard. Screenshots alone look like homework.",
      "Say what you removed — editing is a BI skill.",
    ],
  },
  {
    roleId: "data-engineer",
    blurb: "Pipelines, reliability, and “what breaks at 2am.”",
    headline: "Data Engineer · SQL · Python · Pipelines",
    skills: [
      "Advanced SQL",
      "Python",
      "Orchestration / scheduling basics",
      "Git + CI hygiene",
      "Data quality checks",
    ],
    experience: [
      {
        header: "Data Engineer · Company · Dates",
        bullets: [
          "Built or owned a pipeline that landed trusted tables before the morning dashboards ran.",
          "Added alerts and a short runbook so on-call wasn’t archaeology.",
        ],
      },
    ],
    projects: [
      {
        header: "Ingest + transform demo · Portfolio",
        bullets: [
          "Pulled a public sports feed, landed a clean table, documented refresh + failure modes.",
        ],
      },
    ],
    tips: [
      "Reliability stories beat “used Spark once.”",
      "Show you think about late data and bad rows — that’s the job.",
    ],
  },
];

/** Tactics that worked in real job searches — not a corporate checklist. */
export const JOB_TACTICS: Tactic[] = [
  {
    id: "lamp",
    title: "Build a LAMP list before you spray applications",
    body: "List ~40 employers you’d actually want (alike peers, alumni-dense places, dream + backup). Rank them. Outreach follows the list — not the other way around. Random Easy Apply is how you burn a month.",
    from: "The 2-Hour Job Search",
  },
  {
    id: "alumni",
    title: "Talk to people, not portals",
    body: "Alumni and warm intros beat cold apps. Ask for 20 minutes about their team’s problems — not “can you get me a job.” Good conversations turn into referrals; bad templates get ignored.",
    from: "The 2-Hour Job Search",
  },
  {
    id: "proof",
    title: "Ship one proof piece early",
    body: "A public notebook, dashboard, or GitHub README that answers a real question beats another unfinished course. Hiring managers remember the story: problem → method → punchline.",
  },
  {
    id: "title-match",
    title: "Match the title on your roadmap",
    body: "If your path is Data Analyst, don’t lead the resume with “aspiring data scientist.” Mirror the posting’s language for the role you’re actually chasing this month.",
  },
  {
    id: "weekly-cadence",
    title: "Run a weekly cadence you can keep",
    body: "Example that survives burnout: 5 thoughtful outreaches, 2 applications you’d defend out loud, 1 portfolio improvement. Track it. Inconsistency kills more searches than weak SQL.",
  },
  {
    id: "interview-loop",
    title: "Practice the loop on your own material",
    body: "Walk someone through your league scorecard or a SQL case for 15 minutes. If you can’t explain grain and tradeoffs out loud, the onsite will feel like that — only worse.",
  },
  {
    id: "reject-fast",
    title: "Reject roles that aren’t the job",
    body: "Unpaid “analyst” work that’s really spreadsheet janitor with no SQL, or “DS” roles that are pure ad-hoc Excel, will stall your growth. Be picky enough that your practice time compounds.",
  },
];

export const BOOK_RECS: BookRec[] = [
  {
    id: "two-hour",
    title: "The 2-Hour Job Search",
    author: "Steve Dalton",
    why: "The playbook for structured outreach when you don’t have a warm network yet. LAMP lists + alumni contact math beat vibes-based applying.",
    roleIds: "all",
  },
  {
    id: "never-search-alone",
    title: "Never Search Alone",
    author: "Phyl Terry",
    why: "Job search is lonely and skewed toward silence. A small job-search council keeps the cadence honest when energy dips.",
    roleIds: "all",
  },
  {
    id: "storytelling",
    title: "Storytelling with Data",
    author: "Cole Nussbaumer Knaflic",
    why: "Analysts and BI folks get hired for clarity. This book kills chart junk and teaches one-point-per-slide thinking.",
    roleIds: ["data-analyst", "bi-analyst", "business-analyst"],
  },
  {
    id: "designing-data",
    title: "The Data Warehouse Toolkit (skim chapters)",
    author: "Ralph Kimball",
    why: "When you start talking grain, facts, and dimensions in interviews, you sound like someone who’s modeled before — not only queried.",
    roleIds: ["analytics-engineer", "data-engineer", "data-analyst"],
  },
  {
    id: "python-ds",
    title: "Python for Data Analysis",
    author: "Wes McKinney",
    why: "The pandas reference you’ll actually open during projects. Pair it with a real dataset, not toy tutorials alone.",
    roleIds: ["data-scientist", "data-analyst", "data-engineer"],
  },
  {
    id: "staff-eng",
    title: "Staff Engineer (selected essays) / The Staff Engineer's Path",
    author: "Will Larson / Tanya Reilly",
    why: "If you’re aiming past IC-1, these reframe impact, scope, and writing — useful even when your title still says Analyst.",
    roleIds: ["data-engineer", "analytics-engineer", "data-scientist"],
  },
];

export function resumeForRole(roleId: string): ResumeSample | undefined {
  return RESUME_SAMPLES.find((r) => r.roleId === roleId);
}

export function booksForRole(roleId: string | "all"): BookRec[] {
  if (roleId === "all") return BOOK_RECS;
  return BOOK_RECS.filter(
    (b) => b.roleIds === "all" || b.roleIds.includes(roleId as never),
  );
}

/** Flatten a resume sample into copy-paste markdown. */
export function resumeToMarkdown(sample: ResumeSample): string {
  const role = CAREER_ROLES.find((r) => r.id === sample.roleId);
  const lines: string[] = [
    `# ${role?.title ?? "Resume"} — sample outline`,
    "",
    `**Headline:** ${sample.headline}`,
    "",
    "## Skills",
    ...sample.skills.map((s) => `- ${s}`),
    "",
    "## Experience",
  ];
  for (const block of sample.experience) {
    lines.push(`### ${block.header}`);
    for (const b of block.bullets) lines.push(`- ${b}`);
    lines.push("");
  }
  lines.push("## Projects");
  for (const block of sample.projects) {
    lines.push(`### ${block.header}`);
    for (const b of block.bullets) lines.push(`- ${b}`);
    lines.push("");
  }
  lines.push("## Notes");
  for (const t of sample.tips) lines.push(`- ${t}`);
  lines.push("");
  lines.push("_Sample for practice — rewrite in your voice with real numbers._");
  return lines.join("\n");
}
