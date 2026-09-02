import Link from "next/link";

/**
 * The wordmark, top-left, always linking to the homepage.
 *
 * Two problems this fixes. Six routes had no route home at all — /interview,
 * /data, /demo, the draft, the playbook quiz and the roadmap — so the only way
 * back was the browser's back button or editing the URL. And on three of the
 * routes that *did* show the wordmark it pointed at /learn rather than /,
 * which is worse than having no link: the affordance everyone reaches for
 * first silently did something else.
 *
 * So the rule is now simple and worth keeping: **the wordmark goes home,
 * everywhere, with no exceptions.** A page that also wants an in-context
 * "back" renders it as its own separate link (see `back`) instead of
 * overloading the logo with a second meaning.
 */
export default function HomeLink({
  label,
  back,
  backLabel,
}: {
  /** Small caps suffix naming the current area, e.g. "learn", "draft day". */
  label?: string;
  /** Optional in-context back target, rendered beside the wordmark. */
  back?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex min-w-0 items-baseline gap-3">
      <Link
        href="/"
        aria-label="SQL Sports home"
        className="shrink-0 font-display text-lg font-bold tracking-tight text-ink transition-opacity hover:opacity-80"
      >
        SQL<span className="text-turf">Sports</span>
        {label && (
          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            {label}
          </span>
        )}
      </Link>
      {back && (
        <Link
          href={back}
          className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-turf"
        >
          ← {backLabel ?? "back"}
        </Link>
      )}
    </div>
  );
}
