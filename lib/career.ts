/**
 * Why each course is worth someone's time, in job terms.
 *
 * Written to be defensible rather than impressive. There are no invented
 * percentages, salary figures or "9 out of 10 employers" claims anywhere in
 * here, because a learner deciding how to spend forty hours deserves an
 * honest read and because a made-up number is the fastest way to lose them
 * when they check it.
 *
 * Where something is a judgement call rather than a fact, it says so. Where a
 * skill is genuinely niche, it says that too — talking someone into R when
 * they want a analyst job in a normal company would be a disservice.
 */

export type CareerNote = {
  /** One line on what this skill actually buys you. */
  headline: string;
  /** The honest case, a couple of sentences. */
  why: string;
  /** Job titles that routinely list it. */
  roles: string[];
  /** What it combines with to make you employable, rather than just skilled. */
  pairsWith: string;
  /** Where it sits in a hiring process — the concrete, checkable bit. */
  inInterviews: string;
  /** Rough honesty about who should skip or defer it. */
  skipIf?: string;
};

export const CAREER: Record<string, CareerNote> = {
  "sql-fundamentals": {
    headline: "The one skill nearly every data job asks for by name.",
    why: "SQL is how you get data out of a database, and essentially every company that stores anything stores it in one. That makes it the common denominator across analyst, engineering, product and operations roles — the skill that is assumed rather than listed as a bonus. It is also unusually stable: the SELECT you learn this week will still be correct in twenty years, which is not true of most tooling.",
    roles: [
      "Data Analyst",
      "Business Analyst",
      "Analytics Engineer",
      "Data Scientist",
      "Product Manager",
    ],
    pairsWith:
      "Spreadsheets for presenting the answer, and a little Python once the questions outgrow one query.",
    inInterviews:
      "Most analyst processes contain a live SQL round. It is usually the first technical filter, and it is the one candidates most often fail — not on exotic syntax, but on JOINs and GROUP BY under mild pressure.",
  },
  "sql-advanced": {
    headline: "The difference between writing queries and owning the data.",
    why: "CTEs, window functions, views and indexing are what separate someone who can answer a question from someone trusted to build the thing everyone else queries. This is the material that shows up in senior analyst and analytics engineer interviews, and it is where the pay steps up.",
    roles: ["Analytics Engineer", "Senior Data Analyst", "Data Engineer", "BI Developer"],
    pairsWith: "Git, because at this level your SQL lives in a repository rather than a scratch tab.",
    inInterviews:
      "Window functions are the single most common senior-round SQL question. Being able to explain why you would use one instead of a self-join is often the whole answer.",
    skipIf: "You have not finished Fundamentals. This course assumes JOINs and GROUP BY are comfortable, not new.",
  },
  excel: {
    headline: "Still the most widely used analysis tool in business.",
    why: "It is unglamorous and it is everywhere. Finance, operations, marketing, HR and most of the small-to-mid-sized world run on spreadsheets, and a great many analyst jobs are mostly Excel with a little SQL attached. Being genuinely good at it — lookups, pivots, clean workbooks other people can use — is a hiring signal in far more roles than Python is.",
    roles: [
      "Financial Analyst",
      "Business Analyst",
      "Operations Analyst",
      "Marketing Analyst",
    ],
    pairsWith: "SQL. Pull with SQL, present in Excel is the daily loop of a huge number of analyst jobs.",
    inInterviews:
      "Frequently tested as a timed practical: here is a messy file, produce a summary. Lookups and PivotTables are the usual content.",
  },
  python: {
    headline: "Where analysis turns into something that runs by itself.",
    why: "Python is the general-purpose tool: when a question is too awkward for SQL, needs cleaning first, has to run on a schedule, or is heading toward machine learning, this is what you reach for. It is also the widest-open door — the same language covers analysis, automation, scripting and ML, so the investment keeps paying out in directions you have not chosen yet.",
    roles: ["Data Analyst", "Data Scientist", "Data Engineer", "ML Engineer"],
    pairsWith: "SQL first. Python that pulls its data with a good query beats Python that pulls everything and filters in memory.",
    inInterviews:
      "Usually a take-home or a pandas exercise rather than algorithm puzzles, for analyst roles. The bar is normally can you clean and reshape a real file, not can you invert a binary tree.",
    skipIf: "You are three weeks from applying for an analyst job and your SQL is shaky. Fix the SQL first; it is asked about more often.",
  },
  stats: {
    headline: "The reason anyone believes the number you just produced.",
    why: "Every tool in this catalogue will happily compute a confident answer from too little data. Statistics is what stops you presenting one. Sample size, significance and regression to the mean are the difference between an analyst who reports a fluke as a trend and one who gets listened to in the room.",
    roles: ["Data Analyst", "Data Scientist", "Product Analyst", "Research Analyst"],
    pairsWith: "Anything. This is the layer that makes the rest trustworthy rather than a skill you list on its own.",
    inInterviews:
      "Rarely a dedicated round, very often a follow-up question: are you sure that is real. Not having an answer is what costs you.",
  },
  git: {
    headline: "Expected on day one, taught almost nowhere.",
    why: "Version control is assumed by every engineering-adjacent team, and analysts increasingly sit inside those teams. It is also a short course with a high floor: a few hours gets you from cannot collaborate to entirely fine, and the gap it closes is one hiring managers notice immediately.",
    roles: ["Analytics Engineer", "Data Engineer", "Data Scientist", "Any technical role"],
    pairsWith: "Whatever you write. Git is how your SQL and Python stop living on your laptop.",
    inInterviews:
      "Seldom tested directly, frequently assumed. The cost of not having it shows up on your first day rather than in the interview.",
  },
  r: {
    headline: "Specialist, and genuinely strong where it is strong.",
    why: "R is the first language of academic statistics, biostatistics and a large share of published sports analytics. If you are heading into research, epidemiology or public sports work, it is an edge and the community is excellent. If you are heading into a normal company analyst role, Python is the safer bet and this is the honest version of that advice.",
    roles: ["Research Analyst", "Biostatistician", "Sports Analyst", "Academic Researcher"],
    pairsWith: "Statistics, which is the field R was built to serve.",
    inInterviews:
      "Asked for by name in research and biostatistics postings. Rarely required elsewhere, though reading it is useful because so much public analysis is published in it.",
    skipIf:
      "Your goal is a general analyst job at a typical company. Learn Python instead and come back to R if a specific role asks for it.",
  },
  tableau: {
    headline: "The skill that gets your work seen by decision makers.",
    why: "Analysis nobody can read does not change anything. Tableau is one of the two dominant tools for turning a result into a dashboard a stakeholder can use without you in the room, and dashboard-building is a large share of many analyst jobs.",
    roles: ["BI Analyst", "Data Analyst", "Data Visualization Specialist"],
    pairsWith: "SQL, which is where the data behind every dashboard comes from.",
    inInterviews:
      "Often a portfolio question: show us something you built. A single well-made public dashboard does more here than a certificate.",
  },
  powerbi: {
    headline: "The enterprise default, especially anywhere Microsoft-heavy.",
    why: "Power BI is what a great many large organisations standardised on, so it appears constantly in corporate analyst postings. DAX is a genuinely different way of thinking about calculation, and being comfortable with it is the part people find hard and the part that is worth money.",
    roles: ["BI Developer", "Data Analyst", "Reporting Analyst"],
    pairsWith: "Excel and SQL — the same stack most corporate analytics teams already run.",
    inInterviews:
      "Data modelling and DAX questions are common. Knowing when a measure beats a calculated column is the usual dividing line.",
  },
  ai: {
    headline: "New, loud, and worth learning with your guard up.",
    why: "LLMs are genuinely useful for analysts and are also the most oversold thing in the field right now. Knowing how to prompt well, how to evaluate output, and specifically how these tools fail is becoming a real differentiator. Treating them as a magic box is not.",
    roles: ["Data Analyst", "Data Scientist", "AI Engineer", "Product Manager"],
    pairsWith: "Statistics, which is what lets you tell a plausible answer from a correct one.",
    inInterviews:
      "Increasingly asked about, rarely tested rigorously yet. Being able to describe a failure mode you have personally hit is worth more than tool familiarity.",
  },
};

export function careerFor(courseId: string): CareerNote | undefined {
  return CAREER[courseId];
}
