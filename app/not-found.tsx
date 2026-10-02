import type { Metadata } from "next";
import Link from "next/link";
import AppNav from "@/components/app-nav";
import Coach from "@/components/coach";

export const metadata: Metadata = {
  title: "Page not found — DataDraft",
  robots: { index: false },
};

/**
 * The 404. It was Next's default — a white "This page could not be found" on
 * a black page, the one screen on the site that looked like a different site.
 * Now it's on brand and gives three ways back onto the field.
 */
export default function NotFound() {
  return (
    <>
      <AppNav />
      <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <Coach mood="whistle" size={120} />
        <p className="label-broadcast mt-4 text-gold">404 · flag on the play</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">That page isn&apos;t on the field.</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          The link might be old, or it might have a typo. Either way, the ball&apos;s still live — pick it up from one of
          these.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/questions" className="press btn-turf">
            Today&apos;s question
          </Link>
          <Link href="/learn" className="press btn-gold">
            Courses
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft hover:border-turf/40"
          >
            Home
          </Link>
        </div>
      </main>
    </>
  );
}
