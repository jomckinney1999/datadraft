/**
 * The last thing on the page: one more field, Coach Blitz, and the two
 * buttons from the top of the page again.
 *
 * By this point the reader has scrolled through everything. This is not
 * the place for another argument — it is the place to make the next click
 * as easy as possible, which is why the buttons are the same two as the
 * hero and the copy is Coach's own line from the path board.
 *
 * The weekly-challenge waitlist rides underneath as the quiet second ask.
 */

import Coach from "@/components/coach";
import StickerLink from "@/components/sticker-cta";
import WaitlistForm from "@/components/waitlist-form";

export default function FinalCta({ qotdId }: { qotdId?: string }) {
  return (
    <section
      data-reveal-section
      className="field-stage edge-fade-y border-b border-panel-border"
    >
      <div aria-hidden className="field-layer field-turf" />
      <div aria-hidden className="field-layer field-sweep" />
      <div aria-hidden className="field-layer dot-field" />

      <div className="sequence relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <div className="reveal flex justify-center">
          <Coach mood="whistle" size={96} />
        </div>
        <h2 className="reveal mt-6 font-display text-3xl font-bold text-pop sm:text-5xl">
          First snap&apos;s yours, rookie.
        </h2>
        <p className="reveal mx-auto mt-4 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
          Today&apos;s question is waiting and it doesn&apos;t need an
          account. Ninety seconds from now you&apos;ll have run real SQL on a
          real season.
        </p>
        <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-4">
          <StickerLink href={qotdId ? `/questions/${qotdId}` : "/questions"} tone="gold" icon="question">
            Solve today&apos;s question
          </StickerLink>
          <StickerLink href="/projects/my-league-scorecard#your-league" tone="turf" icon="football" arrow>
            Chart your league
          </StickerLink>
        </div>

        <div className="reveal mx-auto mt-14 max-w-md rounded-2xl border border-panel-border bg-panel/70 p-5 backdrop-blur">
          <p className="label-broadcast text-ice">coming next</p>
          <p className="mt-1 font-display text-lg font-bold text-ink">
            A weekly challenge on the week that just happened
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            The daily runs on three pinned seasons. The weekly won&apos;t.
            Leave an email and we&apos;ll tell you when it lands.
          </p>
          <div className="mt-4">
            <WaitlistForm
              interest="weekly-challenge"
              source="home"
              label="Notify me"
              compact
            />
          </div>
        </div>
      </div>
    </section>
  );
}
