/**
 * Career Track playbooks — role pathways from first drill to draft day.
 *
 * Each playbook is the same underlying job-hunt arc (skills → projects →
 * resume → interviews → applications), dressed in the learner's sport so the
 * metaphor stays consistent with the rest of the product. Content behind each
 * station is still mostly placeholder; the structure is what we're locking in.
 *
 * Sport lexicon lives here (not in lib/sports.ts) because these terms are
 * Career Track copy, not sport identity.
 */

import type { SportId } from "./sports";

export type StationStatus = "live" | "placeholder";

export type PlaybookDrill = {
  /** Plain-English deliverable — what Andy actually walks away with. */
  label: string;
  status: StationStatus;
};

export type PlaybookStation = {
  id: string;
  /** Key into SportLexicon for the sports-flavored station name. */
  lexKey: keyof SportLexicon;
  /** Plain title shown under / beside the sports name. */
  plainTitle: string;
  blurb: string;
  drills: PlaybookDrill[];
};

export type CareerPlaybook = {
  id: string;
  role: string;
  /** One-line pitch for this pathway. */
  tagline: string;
  accent: "turf" | "gold";
  /** Honest availability — none of these are fully built yet. */
  status: "scouting" | "in-camp";
  stations: PlaybookStation[];
};

/** Sport-flavored labels for each station on a playbook. */
export type SportLexicon = {
  /** What we call a pathway itself. */
  playbook: string;
  playbooks: string;
  foundation: string;
  projects: string;
  portfolio: string;
  resume: string;
  interviews: string;
  applications: string;
  coaching: string;
  /** Badge for stations still being written. */
  comingSoon: string;
};

export const SPORT_LEXICON: Record<SportId, SportLexicon> = {
  football: {
    playbook: "Playbook",
    playbooks: "Playbooks",
    foundation: "Training Camp",
    projects: "Scrimmages",
    portfolio: "Game Film",
    resume: "Roster Card",
    interviews: "The Combine",
    applications: "Draft Board",
    coaching: "Position Coach",
    comingSoon: "Declaring next season",
  },
  basketball: {
    playbook: "Offensive Set",
    playbooks: "Offensive Sets",
    foundation: "Summer League",
    projects: "Pickup Runs",
    portfolio: "Highlight Reel",
    resume: "Scouting Report",
    interviews: "Workouts",
    applications: "Free Agency",
    coaching: "Player Development",
    comingSoon: "In the playbook",
  },
  baseball: {
    playbook: "Lineup Card",
    playbooks: "Lineup Cards",
    foundation: "Spring Training",
    projects: "Batting Practice",
    portfolio: "Highlight Tape",
    resume: "Scouting Card",
    interviews: "Showcase",
    applications: "Call-Up Board",
    coaching: "Hitting Coach",
    comingSoon: "On the 40-man — soon",
  },
};

/**
 * Shared arc every career pathway follows. Role-specific drills override
 * labels inside each playbook; the station order stays fixed so the page
 * reads as one system, not five unrelated courses.
 */
const SHARED_STATION_ORDER = [
  "foundation",
  "projects",
  "portfolio",
  "resume",
  "interviews",
  "applications",
  "coaching",
] as const;

function stations(
  drills: Record<(typeof SHARED_STATION_ORDER)[number], PlaybookDrill[]>,
  blurbs: Record<(typeof SHARED_STATION_ORDER)[number], string>,
  plains: Record<(typeof SHARED_STATION_ORDER)[number], string>,
): PlaybookStation[] {
  return SHARED_STATION_ORDER.map((key) => ({
    id: key,
    lexKey: key,
    plainTitle: plains[key],
    blurb: blurbs[key],
    drills: drills[key],
  }));
}

const PLAINS = {
  foundation: "Skills foundation",
  projects: "Portfolio projects",
  portfolio: "Capstone & case studies",
  resume: "Resume & LinkedIn",
  interviews: "Interview prep",
  applications: "Application strategy",
  coaching: "1:1 review",
} as const;

export const CAREER_PLAYBOOKS: CareerPlaybook[] = [
  {
    id: "data-analyst",
    role: "Data Analyst",
    tagline:
      "From your first SELECT to a hire-ready portfolio — the classic path Andy is buying.",
    accent: "turf",
    status: "in-camp",
    stations: stations(
      {
        foundation: [
          { label: "SQL fundamentals through live sports data", status: "live" },
          { label: "Python / pandas for weekly analysis", status: "live" },
          { label: "Stats literacy — mean, sample size, regression", status: "live" },
          { label: "Chart craft & honest visualization", status: "live" },
          { label: "Git / GitHub so managers can open your work", status: "live" },
        ],
        projects: [
          { label: "Your League Scorecard (BYO Sleeper / CSV)", status: "live" },
          { label: "Matchup model you can defend out loud", status: "placeholder" },
          { label: "Dashboard a GM would actually open", status: "placeholder" },
        ],
        portfolio: [
          { label: "Capstone brief + README that sells the work", status: "placeholder" },
          { label: "Case-study writeup (problem → method → punchline)", status: "placeholder" },
        ],
        resume: [
          { label: "Resume rewrite for analyst roles", status: "placeholder" },
          { label: "LinkedIn headline & project pins", status: "placeholder" },
        ],
        interviews: [
          { label: "SQL live-query drills", status: "placeholder" },
          { label: "Take-home walkthrough rehearsal", status: "placeholder" },
          { label: "Behavioral reps (STAR, without the fluff)", status: "placeholder" },
        ],
        applications: [
          { label: "Target-company shortlist", status: "placeholder" },
          { label: "Outreach scripts that aren't spam", status: "placeholder" },
          { label: "Weekly application cadence", status: "placeholder" },
        ],
        coaching: [
          { label: "Resume & portfolio review", status: "placeholder" },
          { label: "Mock interview with feedback", status: "placeholder" },
        ],
      },
      {
        foundation: "Build the toolkit every analyst job posting actually lists.",
        projects: "Ship small, real analyses — not toy Titanic clones.",
        portfolio: "One flagship piece you can talk through for 20 minutes.",
        resume: "Translate sports projects into language hiring managers scan for.",
        interviews: "Rep the formats you'll actually face: live SQL, take-homes, behavioral.",
        applications: "A system for applying, not a panic spray of résumés.",
        coaching: "Human eyes on the work before you send it into the void.",
      },
      PLAINS,
    ),
  },
  {
    id: "data-scientist",
    role: "Data Scientist",
    tagline:
      "Analyst foundation, then models, experiments, and the math that separates DS from BI.",
    accent: "gold",
    status: "scouting",
    stations: stations(
      {
        foundation: [
          { label: "Everything on the Data Analyst playbook", status: "placeholder" },
          { label: "Probability & inference on season data", status: "placeholder" },
          { label: "Feature work on player / team tables", status: "placeholder" },
          { label: "scikit-learn intro — predict, don't overfit", status: "placeholder" },
        ],
        projects: [
          { label: "Win-probability or player-value model", status: "placeholder" },
          { label: "A/B-style experiment writeup on a rule change", status: "placeholder" },
          { label: "Forecast that survives a holdout week", status: "placeholder" },
        ],
        portfolio: [
          { label: "Model card + failure modes documented", status: "placeholder" },
          { label: "Notebook → clean repo handoff", status: "placeholder" },
        ],
        resume: [
          { label: "DS-flavored resume (impact over tools)", status: "placeholder" },
          { label: "Project bullets that quantify lift", status: "placeholder" },
        ],
        interviews: [
          { label: "ML system-design lite", status: "placeholder" },
          { label: "Stats deep-dives & case questions", status: "placeholder" },
          { label: "Coding rounds in Python", status: "placeholder" },
        ],
        applications: [
          { label: "Role map: DS vs. analyst vs. MLE", status: "placeholder" },
          { label: "Company shortlist by stack & domain", status: "placeholder" },
        ],
        coaching: [
          { label: "Portfolio critique with a DS lens", status: "placeholder" },
          { label: "Mock case interview", status: "placeholder" },
        ],
      },
      {
        foundation: "Keep the analyst base; add the math and modeling layer.",
        projects: "Models with a sports punchline — and honest metrics.",
        portfolio: "Show judgment: what you tried, what failed, what shipped.",
        resume: "Lead with decisions and lift, not a laundry list of libraries.",
        interviews: "Cases, coding, and explaining uncertainty without hand-waving.",
        applications: "Aim at roles that match the depth you've actually built.",
        coaching: "Someone who's hired DS talent tears into your packet.",
      },
      PLAINS,
    ),
  },
  {
    id: "ai-engineer",
    role: "AI Engineer",
    tagline:
      "Ship AI features — prompts, evals, retrieval, and the product sense to not ship a toy.",
    accent: "turf",
    status: "scouting",
    stations: stations(
      {
        foundation: [
          { label: "Python fluency + APIs", status: "placeholder" },
          { label: "Prompt patterns that survive contact with users", status: "placeholder" },
          { label: "Evals — how you know it works", status: "placeholder" },
          { label: "RAG over a sports corpus (rules, box scores)", status: "placeholder" },
        ],
        projects: [
          { label: "Stats Q&A bot with citations", status: "placeholder" },
          { label: "Lineup assistant with guardrails", status: "placeholder" },
          { label: "Eval harness you can demo live", status: "placeholder" },
        ],
        portfolio: [
          { label: "Architecture one-pager + demo video", status: "placeholder" },
          { label: "Cost / latency / quality tradeoff writeup", status: "placeholder" },
        ],
        resume: [
          { label: "AI Engineer resume (systems > vibes)", status: "placeholder" },
          { label: "GitHub that shows shipped loops, not screenshots", status: "placeholder" },
        ],
        interviews: [
          { label: "LLM system design", status: "placeholder" },
          { label: "Debugging a bad eval", status: "placeholder" },
          { label: "Product sense for AI features", status: "placeholder" },
        ],
        applications: [
          { label: "Startup vs. platform role map", status: "placeholder" },
          { label: "Portfolio-first outreach", status: "placeholder" },
        ],
        coaching: [
          { label: "Demo rehearsal", status: "placeholder" },
          { label: "Mock AI system-design interview", status: "placeholder" },
        ],
      },
      {
        foundation: "Engineering first; models second. Reliability beats novelty.",
        projects: "Real assistants on sports data — with evals, not vibes.",
        portfolio: "Prove you can ship, measure, and iterate an AI feature.",
        resume: "Frame the work as product engineering, not prompt cosplay.",
        interviews: "Design, debug, and defend tradeoffs under pressure.",
        applications: "Target teams that ship AI into products, not slide decks.",
        coaching: "Critique from people who've put LLMs in production.",
      },
      PLAINS,
    ),
  },
  {
    id: "software-engineer",
    role: "Software Engineer",
    tagline:
      "Full-stack fundamentals with sports apps as the reps — APIs, tests, and deploy.",
    accent: "gold",
    status: "scouting",
    stations: stations(
      {
        foundation: [
          { label: "Python or TypeScript fundamentals", status: "placeholder" },
          { label: "HTTP APIs & data modeling", status: "placeholder" },
          { label: "Testing, git hygiene, code review basics", status: "placeholder" },
          { label: "Deploy a small service (Vercel / container)", status: "placeholder" },
        ],
        projects: [
          { label: "Stats API with auth & rate limits", status: "placeholder" },
          { label: "Frontend that consumes your own API", status: "placeholder" },
          { label: "CI pipeline on the repo", status: "placeholder" },
        ],
        portfolio: [
          { label: "README that a stranger can run in 5 minutes", status: "placeholder" },
          { label: "Design notes: what you'd redo at scale", status: "placeholder" },
        ],
        resume: [
          { label: "SWE resume — impact, ownership, stack", status: "placeholder" },
          { label: "Open-source / side-project framing", status: "placeholder" },
        ],
        interviews: [
          { label: "DSA reps at interview depth (not leetcode cosplay)", status: "placeholder" },
          { label: "System-design lite for a sports feed", status: "placeholder" },
          { label: "Behavioral: conflict, ownership, tradeoffs", status: "placeholder" },
        ],
        applications: [
          { label: "Role map: frontend / backend / full-stack", status: "placeholder" },
          { label: "Referral & cold-outreach playbook", status: "placeholder" },
        ],
        coaching: [
          { label: "Code review of your flagship repo", status: "placeholder" },
          { label: "Mock onsite loop", status: "placeholder" },
        ],
      },
      {
        foundation: "Write code that other people can run and trust.",
        projects: "Ship services, not notebooks — with tests and a deploy URL.",
        portfolio: "A repo that survives a hiring manager cloning it cold.",
        resume: "Ownership and outcomes over a laundry list of frameworks.",
        interviews: "Algorithms when needed; design and taste always.",
        applications: "Aim at teams where your stack matches the job.",
        coaching: "A practicing engineer reviews your loop end-to-end.",
      },
      PLAINS,
    ),
  },
  {
    id: "analytics-engineer",
    role: "Analytics Engineer",
    tagline:
      "The bridge role — warehouse modeling, dbt-style transforms, metrics the business can trust.",
    accent: "turf",
    status: "scouting",
    stations: stations(
      {
        foundation: [
          { label: "Advanced SQL (joins, windows, performance)", status: "placeholder" },
          { label: "Dimensional modeling on sports schemas", status: "placeholder" },
          { label: "dbt-style transforms & tests", status: "placeholder" },
          { label: "Metric definitions that survive an argument", status: "placeholder" },
        ],
        projects: [
          { label: "Mart layer for weekly player stats", status: "placeholder" },
          { label: "Data-quality tests that catch real mess", status: "placeholder" },
          { label: "Documentation a non-engineer can use", status: "placeholder" },
        ],
        portfolio: [
          { label: "Public dbt-style project + lineage diagram", status: "placeholder" },
          { label: "Postmortem on a bad metric you fixed", status: "placeholder" },
        ],
        resume: [
          { label: "AE resume — reliability & stakeholder trust", status: "placeholder" },
          { label: "Before/after metric impact bullets", status: "placeholder" },
        ],
        interviews: [
          { label: "SQL + modeling case", status: "placeholder" },
          { label: "Stakeholder conflict scenarios", status: "placeholder" },
        ],
        applications: [
          { label: "AE vs. analyst vs. DE role map", status: "placeholder" },
          { label: "Target companies with real warehouses", status: "placeholder" },
        ],
        coaching: [
          { label: "Model review", status: "placeholder" },
          { label: "Mock AE interview", status: "placeholder" },
        ],
      },
      {
        foundation: "Make data trustworthy — not just queryable once.",
        projects: "Marts, tests, and docs on a sports warehouse slice.",
        portfolio: "Show lineage, tests, and a metric you would bet on.",
        resume: "Reliability and stakeholder clarity over tool names.",
        interviews: "Modeling judgment under messy, real constraints.",
        applications: "Hunt roles that own the metric layer.",
        coaching: "Review from someone who's owned a warehouse.",
      },
      PLAINS,
    ),
  },
  {
    id: "forward-deployed",
    role: "Forward Deployed Engineer",
    tagline:
      "Customer-facing technical work — prototypes in the wild, tight loops, and clear communication.",
    accent: "gold",
    status: "scouting",
    stations: stations(
      {
        foundation: [
          { label: "Full-stack prototype speed", status: "placeholder" },
          { label: "SQL + scripting for messy client data", status: "placeholder" },
          { label: "Demo craft — show value in 10 minutes", status: "placeholder" },
          { label: "Writeups non-engineers finish reading", status: "placeholder" },
        ],
        projects: [
          { label: "Client-style prototype on a sports brief", status: "placeholder" },
          { label: "Integration against a quirky API", status: "placeholder" },
          { label: "Handoff doc the next engineer can trust", status: "placeholder" },
        ],
        portfolio: [
          { label: "Before/after case study with a stakeholder quote", status: "placeholder" },
          { label: "Demo video + architecture sketch", status: "placeholder" },
        ],
        resume: [
          { label: "FDE resume — customer impact + shipping speed", status: "placeholder" },
          { label: "Ambiguity & ownership bullets", status: "placeholder" },
        ],
        interviews: [
          { label: "Live prototyping exercise", status: "placeholder" },
          { label: "Stakeholder role-play", status: "placeholder" },
        ],
        applications: [
          { label: "FDE / solutions / AE-adjacent role map", status: "placeholder" },
          { label: "Story-led outreach", status: "placeholder" },
        ],
        coaching: [
          { label: "Demo rehearsal with sharp questions", status: "placeholder" },
          { label: "Mock client kickoff", status: "placeholder" },
        ],
      },
      {
        foundation: "Speed + clarity. You're the engineer in the room.",
        projects: "Prototypes that survive a skeptical stakeholder.",
        portfolio: "Proof you turn ambiguity into a working slice fast.",
        resume: "Lead with customer outcomes and cycle time.",
        interviews: "Build live, explain live, handle pushback live.",
        applications: "Target teams that embed engineers with customers.",
        coaching: "Practice the room, not just the code.",
      },
      PLAINS,
    ),
  },
];

export function playbookById(id: string): CareerPlaybook | undefined {
  return CAREER_PLAYBOOKS.find((p) => p.id === id);
}
