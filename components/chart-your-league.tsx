/**
 * "Chart your league" — the home page's second ask, straight after today's
 * question, because it is the most irresistible thing on the site for the
 * person it's built for: the numbers person in a fantasy league, who will
 * load their own league before they'll load anything of ours.
 *
 * The example chart is real data, not a made-up league: every number on this
 * site is real, and a real league would put strangers' names on our front
 * page. It is the honest NFL version of the luck chart — point differential
 * against win % (all-play doesn't transfer: in the NFL, points against is
 * defence, not luck) — made with Chart it from the `games` table and saved to
 * public/charts/. Re-make it from any SQL question with the query in
 * CLAUDE.md if the look changes.
 */

import Image from "next/image";
import StickerLink from "@/components/sticker-cta";

const ASKS = ["Who's actually good", "Who got lucky", "Whose schedule was brutal", "Points left on the bench"];

export default function ChartYourLeague() {
  return (
    <section id="chart-your-league" data-reveal-section className="wash-turf scroll-mt-14 border-b border-panel-border">
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1.15fr]">
        <div className="sequence">
          <p className="reveal label-broadcast text-turf">chart your league</p>
          <h2 className="reveal mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            Settle the group chat. With a chart.
          </h2>
          <p className="reveal mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
            Type your Sleeper username, or drop in a CSV from ESPN or Yahoo. Your league loads right in your browser,
            and one click turns it into a chart your league mates can&apos;t argue with.
          </p>
          <ul className="reveal mt-5 flex flex-wrap gap-2">
            {ASKS.map((a) => (
              <li
                key={a}
                className="rounded-full border border-turf/40 bg-turf/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-turf"
              >
                {a}
              </li>
            ))}
          </ul>
          <div className="reveal mt-7">
            <StickerLink href="/projects/my-league-scorecard#your-league" tone="turf" icon="football" arrow transition={{ kind: "chart", label: "Your league" }}>
              Chart your league
            </StickerLink>
          </div>
          <p className="reveal mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            No account · nothing leaves your browser
          </p>
        </div>

        <figure className="reveal">
          <div className="surface overflow-hidden rounded-2xl border border-turf/30">
            <Image
              src="/charts/nfl-luck-2025.png"
              alt="A scatter chart of all 32 NFL teams in 2025: point differential against win percentage, with Lucky, Legit, Bad and Unlucky corners."
              width={1600}
              height={900}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center font-mono text-[11px] text-ink-muted">
            Same chart, real 2025 NFL teams. Made with Chart it.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
