const STORIES = [
  {
    initials: "FH",
    title: "Fantasy hobbyist → data analyst",
    accent: "turf" as const,
    quote:
      "Spent every Sunday arguing about who should've started. Ran those same arguments as SQL queries instead — and the capstone project turned into the portfolio piece that got me interviews.",
    stat: "6 mo",
    statLabel: "Box scores → job interviews",
  },
  {
    initials: "SR",
    title: "Spreadsheet user → SQL at work",
    accent: "gold" as const,
    quote:
      "Used to fight VLOOKUP for every roster question. Learned joins on fantasy data first, then used the exact same logic to automate reports at my actual job.",
    stat: "3 mo",
    statLabel: "VLOOKUP → automated reports",
  },
  {
    initials: "CS",
    title: "College student → data internship",
    accent: "turf" as const,
    quote:
      "Needed a portfolio project that wasn't another Titanic dataset. Built a fantasy analytics dashboard from the Roadmap capstone and used it to land a summer internship.",
    stat: "1",
    statLabel: "Capstone → internship offer",
  },
  {
    initials: "CC",
    title: "Career switcher → junior analyst",
    accent: "gold" as const,
    quote:
      "Ten years in retail management, no technical background. The mock interview practice was what finally got me comfortable talking through a SQL problem out loud.",
    stat: "1 yr",
    statLabel: "Retail → junior analyst",
  },
  {
    initials: "CF",
    title: "Casual fan → confident with SQL",
    accent: "turf" as const,
    quote:
      "Just wanted to stop losing my league on vibes. Didn't expect GROUP BY to become the most useful thing I learned all year.",
    stat: "8 wk",
    statLabel: "First GROUP BY query",
  },
];

function StoryCard({ story }: { story: (typeof STORIES)[number] }) {
  return (
    <div className="surface flex w-[320px] shrink-0 flex-col justify-between border border-panel-border bg-panel/90 p-5 backdrop-blur-sm sm:w-[360px]">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${
                story.accent === "turf"
                  ? "bg-turf/15 text-turf"
                  : "bg-gold/15 text-gold"
              }`}
            >
              {story.initials}
            </span>
            <p className="font-display text-sm font-semibold leading-tight text-pop">
              {story.title}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          &ldquo;{story.quote}&rdquo;
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-panel-border pt-4">
        <span className="label-broadcast text-[10px] text-ink-muted">
          Illustrative example
        </span>
        <div className="text-right">
          <p
            className={`stat-number text-lg leading-none ${
              story.accent === "turf" ? "stat-number-turf" : ""
            }`}
          >
            {story.stat}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            {story.statLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessStories() {
  const track = [...STORIES, ...STORIES];

  return (
    <section
      id="stories"
      className="border-t border-panel-border bg-night/60 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="label-broadcast mb-3">
          <span className="mr-2 inline-block h-1.5 w-1.5 bg-turf align-middle" />
          What the path can look like
        </p>
        <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-pop sm:text-4xl">
          Fantasy football in, SQL skills out.
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-soft">
          DataDraft is brand new — these are illustrative example paths
          showing what the curriculum is designed to do, not verified
          testimonials from real members.
        </p>
      </div>

      <div className="relative mt-10 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-night to-transparent sm:w-32"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-night to-transparent sm:w-32"
        />
        <div className="flex w-max animate-marquee gap-4 px-4 hover:[animation-play-state:paused] sm:gap-5 sm:px-6">
          {track.map((story, i) => (
            <StoryCard key={`${story.initials}-${i}`} story={story} />
          ))}
        </div>
      </div>
    </section>
  );
}
