/**
 * The questions people ask before they will click anything.
 *
 * Native `<details>` on purpose: it opens and closes with no JavaScript, it
 * is keyboard-accessible for free, and a search engine can read every
 * answer. The only styling is hiding the default marker and turning the
 * chevron. Anything cleverer would be worse.
 *
 * Every answer here is a claim the rest of the site has to keep true.
 * "Free" is free. "Real" is real. If one of these stops being accurate the
 * answer changes, not the product's story.
 */

import { FACTS } from "@/lib/lesson-facts.generated";

// Ordered by what the person we're built for asks first: the fantasy
// league's numbers person who wants a data job (docs/PLAN.md, Target user).
// Their doubts are about whether it counts, whether they can, and whether
// they have time — not about football.
const ITEMS = [
  {
    q: "Will an employer take a football project seriously?",
    a: "The skills are identical: a JOIN on fantasy scores is the same JOIN on sales data, and the projects use the tools teams actually use — SQL, pandas, dbt, scikit-learn. What's different is the story. “I pulled my league from an API and worked out who was lucky” takes one breath to explain, and it shows the thing interviewers are really testing: that you can find a question in messy data and answer it.",
  },
  {
    q: "I'm good at Excel but I've never written code. Is this for me?",
    a: "That's exactly who it's for. There's an Excel course that runs real formulas, and SQL is the natural next step from there — a WHERE is a filter, a GROUP BY is a pivot table. Everything runs in your browser, so there's nothing to install.",
  },
  {
    q: "How much time does it take?",
    a: "The daily question takes about ninety seconds. A lesson is one drive, a few minutes. Projects take an afternoon. Coming back every day does more for you than a weekend marathon, which is why there's a new question every morning.",
  },
  {
    q: "Does it work with my league if I'm not on Sleeper?",
    a: "Yes. Sleeper loads straight from your username. On ESPN or Yahoo, fill a small CSV of weekly scores — manager, week, points for, points against, win — and drop it in. Either way your league stays in your browser; nothing is sent to us.",
  },
  {
    q: "Is it actually free?",
    a: "Yes, all of it, for the whole beta. No card. A free account is how you start — email yourself a link, and your progress follows you to the next device.",
  },
  {
    q: "Which languages can I practise?",
    a: "SQL, Python, R and Excel, and all four run for real in the browser rather than being multiple choice about code. SQL and Excel start instantly. Python and R download their runtime the first time you press Run — about 12 MB and 30 MB — and are instant after that.",
  },
  {
    q: "Is the data real?",
    a: `Yes. The lesson and question data is weekly NFL scoring from nflverse, ${FACTS.seasons[0]} through week ${FACTS.latest.week} of ${FACTS.latest.season}, pinned so the answers never move under you, and free to download under CC BY 4.0. The fantasy league comes from Sleeper: the waiver wire is Sleeper's real wire from week ${FACTS.league.wireWeek} of ${FACTS.league.season}, and the rosters are a draft run on Sleeper's real ${FACTS.league.season} ADP. The draft order is real; the five managers are ours, and every place the league appears says so.`,
  },
  {
    q: "What is a “drive”?",
    a: "A lesson. You start first-and-ten on your own 25, every question is a play, right answers gain yards and wrong ones burn a down. Reach the end zone and the lesson is cleared. It replaces the hearts most apps use, and it turns out to be a much better way to know how you are doing.",
  },
  {
    q: "Do I need to know a lot about football?",
    a: "No. Nobody needs a primer on who scored more points. The sport is the lens, not the test — every question is about the data, and the football is there so the data means something. You will pick up more than you expect, but nothing here requires it.",
  },
];

export default function Faq() {
  return (
    <section data-reveal-section className="border-b border-panel-border">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="sequence text-center">
          <p className="reveal label-broadcast text-ice">before you start</p>
          <h2 className="reveal mt-2 font-display text-2xl font-bold text-ink sm:text-4xl">
            Fair questions
          </h2>
        </div>

        <div className="sequence mt-10 space-y-2">
          {ITEMS.map((it) => (
            <details
              key={it.q}
              className="faq-item reveal surface group rounded-2xl border border-panel-border bg-panel transition-colors open:border-turf/40"
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-4">
                <span className="font-display text-[15px] font-bold text-ink">
                  {it.q}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="faq-chevron h-4 w-4 shrink-0 text-ink-muted"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">
                {it.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
