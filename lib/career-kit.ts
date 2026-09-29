/**
 * The rest of the career kit — everything between "I can write SQL" and
 * "I signed an offer".
 *
 * lib/resources.ts already covers resume content, job-hunt tactics and books.
 * This file fills the gaps: the messages you actually have to send, the
 * tracker that stops a search falling apart, the interview you get asked
 * before the SQL one, and where to find real pay numbers.
 *
 * Two rules, same as lib/career.ts:
 *
 *   1. **No invented statistics.** No "70% of jobs are never posted", no
 *      salary figures. Where a number matters, we send people to the source
 *      that publishes it. A learner who checks a number we made up has every
 *      reason to distrust the lessons too.
 *   2. **Everything is copy-paste ready.** A script you have to rewrite isn't
 *      a script. Placeholders are in [square brackets] so they're obvious.
 *
 * Voice: plain coach. Short sentences. No hype.
 */

export type Script = {
  id: string;
  title: string;
  /** When to send it. */
  when: string;
  /** Subject line, where the channel has one. */
  subject?: string;
  body: string;
  /** One line on why it works. */
  why: string;
};

export type Checklist = {
  id: string;
  title: string;
  items: string[];
  note?: string;
};

export type InterviewQuestion = {
  q: string;
  /** What they're actually checking. */
  listeningFor: string;
};

export type SalarySource = {
  name: string;
  url: string;
  what: string;
};

/* ── Outreach ─────────────────────────────────────────────────
   The tactics page already argues for talking to people instead of portals.
   These are the actual messages, because "network more" is not an action. */

export const OUTREACH_SCRIPTS: Script[] = [
  {
    id: "referral-warm",
    title: "Asking someone you know for a referral",
    when: "You know them, even loosely. Send before you apply, not after.",
    subject: "Quick question about [Company]",
    body: `Hi [Name],

I'm moving into data analytics and [Company] posted a [Job Title] role I'm a good fit for — SQL, Excel and Python, plus a project where I [one-line result, e.g. "analysed three seasons of NFL scoring to rank players by consistency"].

Would you be comfortable referring me? Happy to send a short blurb you can paste, so it's two minutes of your time.

If you're not close enough to the team for that, no problem at all — even a name to talk to would help.

Thanks,
[You]`,
    why: "Gives them an easy yes, an easy no, and a smaller third option. Most referral asks fail by offering only the first.",
  },
  {
    id: "referral-blurb",
    title: "The blurb you attach to that ask",
    when: "Paste it under the referral request so they never have to write one.",
    body: `[You] is moving into data analytics from [current field]. Strong SQL (joins, window functions), Excel and Python, and they've built [project] — [what it answered]. They're specifically interested in [team//product] because [one real reason]. Resume attached.`,
    why: "The person referring you has to write something. Write it for them and your version is what the recruiter reads.",
  },
  {
    id: "informational",
    title: "Asking a stranger for 15 minutes",
    when: "Someone doing the job you want, at a company you like. No ask for a job.",
    subject: "15 minutes on how you got into [Company]?",
    body: `Hi [Name],

I'm learning data analytics and working toward my first analyst role. You've been doing it at [Company] for [time] — I'd love 15 minutes to hear how the team actually works and what you'd tell someone starting now.

I'm not asking you to refer me. I'd just rather learn from someone doing the job than guess.

Any 15 minutes that suits you, this week or next.

Thanks,
[You]`,
    why: "Saying you're not asking for a referral is what makes people reply. Ask for the job here and the reply rate collapses.",
  },
  {
    id: "recruiter-reply",
    title: "Replying to a recruiter who reached out",
    when: "Within a day. Answer the money question early, politely.",
    body: `Hi [Name],

Thanks for reaching out — the [Job Title] role looks interesting, particularly [one specific thing].

Before we book time: what's the budgeted range for the role? I want to make sure we're in the same area before either of us spends an hour.

Free [two concrete windows].

[You]`,
    why: "Asking for the range first is normal and saves you whole interview loops. Recruiters expect it.",
  },
  {
    id: "follow-up",
    title: "Following up on an application",
    when: "7–10 days after applying, once. Then stop.",
    subject: "Following up — [Job Title], applied [date]",
    body: `Hi [Name],

I applied for the [Job Title] role on [date] and wanted to put a face to the application.

Short version: [one line on your background], and I built [project] — [what it answered]. If it's useful, the code and writeup are here: [link].

Happy to answer anything. If the role's filled, I'd still like to be considered for similar openings.

Thanks,
[You]`,
    why: "One follow-up with a link to real work is a nudge. Three follow-ups is a problem you've created for yourself.",
  },
  {
    id: "thank-you",
    title: "After the interview",
    when: "Same day. Short.",
    subject: "Thanks — [Job Title]",
    body: `Hi [Name],

Thanks for the time today. [One specific thing from the conversation you actually found interesting.]

On [the thing you fumbled]: I thought about it afterwards — [the better answer, two sentences].

Looking forward to next steps.

[You]`,
    why: "The second paragraph is the whole point. It's your only chance to fix the answer you walked out regretting.",
  },
  {
    id: "after-no",
    title: "After a rejection",
    when: "Once, within a couple of days. This one pays off months later.",
    body: `Hi [Name],

Understood, and thanks for telling me rather than leaving it open.

If you have 30 seconds: was there a specific gap that made the difference? I'd rather fix it than guess.

Either way, I'd like to stay on your radar for future [role] openings.

Thanks,
[You]`,
    why: "Most people vanish after a no. The ones who ask well are remembered when the next role opens, and sometimes get the real reason.",
  },
];

/* ── Cover letters ────────────────────────────────────────── */

export const COVER_LETTER: {
  guidance: string[];
  template: string;
} = {
  guidance: [
    "Most analyst applications don't need one. Write it when the posting asks, when you're switching careers, or when you have a genuine reason for wanting that team.",
    "Four short paragraphs. If it's longer than the job description, nobody's reading it.",
    "Never restate your resume. The letter's job is the one thing a resume can't carry: why this, why you, why now.",
    "Name one real thing about the company. If you can't, you don't want the job enough to write a letter about it.",
  ],
  template: `Dear [Hiring Manager name, if you can find it],

I'm applying for the [Job Title] role. I'm moving into data from [current field], and I've spent the last [time] building the actual skills the posting lists: SQL, Excel, Python and [tool].

The clearest example is [project]: I [what you did] and found [the result]. [One sentence on what you'd do differently now — it shows judgement, not just completion.]

I'm interested in [Company] specifically because [one real, checkable reason — a product, a post someone on the team wrote, how they use data].

I'd welcome the chance to talk it through.

[You]
[phone] · [email] · [portfolio link]`,
};

/* ── Application tracker ──────────────────────────────────── */

export const TRACKER = {
  file: "/kit/application-tracker.csv",
  columns: [
    ["Company", "The employer."],
    ["Role", "Exact title from the posting — you'll apply to three variants of the same job."],
    ["Source", "Where you found it. Tells you which channels actually work for you."],
    ["Contact", "A human at the company. Blank here is a warning sign."],
    ["Applied", "Date. Drives your follow-up."],
    ["Follow-up due", "Applied + 7 days. One nudge, then let it go."],
    ["Stage", "Applied / Screen / Take-home / Onsite / Offer / Closed."],
    ["Range", "The pay range, once you know it. Stops you interviewing for roles you'd decline."],
    ["Notes", "Names, what they asked, what you fumbled — you will not remember by week six."],
    ["Next step", "The one action you owe this row. If it's blank, the row is done or dead."],
  ] as const,
  howTo: [
    "One row per application. Sort by follow-up date every Monday.",
    "Anything with no contact name is a cold application — keep those under half your list.",
    "When a row closes, write why in Notes. Patterns show up after ten rows, not two.",
    "This is the whole system. A tracker you maintain beats any tool you abandon.",
  ],
};

/* ── LinkedIn ─────────────────────────────────────────────── */

export const LINKEDIN_CHECKLIST: Checklist[] = [
  {
    id: "headline",
    title: "Headline",
    items: [
      "Say the job you want, not the job you have: \"Data Analyst · SQL, Python, Tableau\".",
      "Drop \"aspiring\" and \"seeking opportunities\". Nobody searches for those.",
      "Recruiters search by tool. If SQL isn't in your headline or skills, you don't appear.",
    ],
  },
  {
    id: "about",
    title: "About",
    items: [
      "Three short paragraphs: what you do now, the proof, what you're looking for.",
      "Put one concrete result in it. A number you produced beats every adjective.",
      "Write it in first person. Third-person bios read like a press release nobody asked for.",
    ],
    note: "Only the first two lines show before \"see more\". Put the good part there.",
  },
  {
    id: "featured",
    title: "Featured & projects",
    items: [
      "Pin your best project with a screenshot — a chart reads instantly, a repo link doesn't.",
      "Link the writeup, not just the code. Most people scanning you can't read code.",
      "One strong project beats four half-finished ones.",
    ],
  },
  {
    id: "activity",
    title: "Activity",
    items: [
      "Post what you learned, not that you're learning. \"Here's how I ranked players by consistency in SQL\" is a portfolio piece.",
      "Comment on other people's work weekly. It's the cheapest way to be visible to a team you want to join.",
      "Turn on \"Open to work\" — recruiter-only if your current employer is a concern.",
    ],
  },
];

/* ── The interview before the SQL interview ───────────────── */

export const BEHAVIORAL_PREP = {
  star: [
    ["Situation", "One sentence of context. Where, when, what was at stake."],
    ["Task", "What you specifically were responsible for."],
    ["Action", "What you did — this is most of the answer, and it says \"I\", not \"we\"."],
    ["Result", "What changed. A number if you have one, an honest outcome if you don't."],
  ] as const,
  questions: [
    {
      q: "Tell me about a time you found something in the data nobody expected.",
      listeningFor:
        "Whether you check surprises before reporting them. Say how you verified it, not just what you found.",
    },
    {
      q: "Walk me through a project end to end.",
      listeningFor:
        "That you can explain to a non-technical person. Lead with the question you answered, not the tools.",
    },
    {
      q: "Tell me about a time your analysis was wrong.",
      listeningFor:
        "Honesty and what you changed afterwards. \"I've never been wrong\" ends the interview badly.",
    },
    {
      q: "How do you handle a stakeholder who wants a number that supports their view?",
      listeningFor:
        "That you hold the line without being difficult. Give the real number, then help them with the actual question.",
    },
    {
      q: "You're given a messy dataset and a vague question. What do you do first?",
      listeningFor:
        "That you go back and sharpen the question before touching the data. Everyone wants to start querying.",
    },
    {
      q: "Why are you leaving [current field]?",
      listeningFor:
        "A forward reason, not a complaint. What you're moving toward, not who you're escaping.",
    },
    {
      q: "What would you do in your first 30 days?",
      listeningFor:
        "Learn the data, find who owns which table, ship one small useful thing. Not \"restructure the warehouse\".",
    },
    {
      q: "Do you have questions for us?",
      listeningFor:
        "Always yes. Ask what the last person in this seat struggled with, how success is measured at six months, and who consumes the analysis.",
    },
  ] as InterviewQuestion[],
  projectStory: [
    "Two minutes, four beats: the question, the data, what you did, what you found.",
    "Open with the question in plain English. \"Which players score consistently instead of in one big week?\"",
    "Say one thing that went wrong and how you handled it. That's the part that sounds like a real job.",
    "End on what you'd do next with more time. It shows you know the work isn't finished.",
  ],
};

/* ── What makes a portfolio project count ─────────────────── */

export const PORTFOLIO_BAR: Checklist[] = [
  {
    id: "counts",
    title: "A project that counts",
    items: [
      "Answers a question someone could actually ask, not \"exploring the dataset\".",
      "Uses data with real mess in it — missing weeks, changed teams, inconsistent names.",
      "Has a conclusion you could say out loud in one sentence.",
      "Is reproducible: someone can clone it and get your numbers.",
    ],
    note: "Titanic and Iris are on thousands of resumes. Anything with your own question beats them.",
  },
  {
    id: "readme",
    title: "The README that gets it read",
    items: [
      "Line 1: the question. Line 2: the answer. Everything else is optional for the reader.",
      "One chart near the top. Most people will look at that and nothing else.",
      "Say where the data came from and its licence.",
      "\"How to run this\" in three commands or fewer.",
      "A short \"what I'd do next\" — it's the difference between a finished project and an abandoned one.",
    ],
  },
];

/* ── Pay ──────────────────────────────────────────────────── */

export const SALARY_SOURCES: SalarySource[] = [
  {
    name: "US Bureau of Labor Statistics (OES)",
    url: "https://www.bls.gov/oes/",
    what: "Government wage data by occupation and metro area. Slow to update, impossible to fake — the honest floor for what a role pays in your city.",
  },
  {
    name: "Levels.fyi",
    url: "https://www.levels.fyi/",
    what: "Self-reported total compensation, strongest for tech companies. Skews toward large employers and higher levels, so read it as a ceiling.",
  },
  {
    name: "Glassdoor",
    url: "https://www.glassdoor.com/Salaries/",
    what: "Broad, self-reported, noisy. Useful for a rough band at non-tech employers where the other two are thin.",
  },
  {
    name: "The job posting itself",
    url: "https://www.dol.gov/agencies/whd/state/pay-transparency",
    what: "Several US states require a pay range in the posting. Filter your search to those states and you can read ranges directly instead of guessing.",
  },
];

export const NEGOTIATION_NOTES: string[] = [
  "Get their range before you give a number. \"What's budgeted for the role?\" is a normal question that recruiters answer every day.",
  "If you must go first, give a range whose bottom you'd genuinely accept — you will be offered the bottom.",
  "Base your number on the sources above for your city and level, not on what you earn now. Career changers who anchor on their old salary stay underpaid for years.",
  "Negotiate once, on the whole package, after the offer is in writing. Start date, remote days and a signing bonus are often easier for them to move than base.",
  "\"I'm excited about this. Can you do [number]?\" then stop talking. Silence is not your problem to fill.",
  "Never accept in the moment. \"Can I have until [day] to look it over?\" is always fine, and nobody has ever lost an offer for asking.",
];
