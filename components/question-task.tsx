/**
 * The question, said plainly and made the loudest thing on the card.
 *
 * Every question has a story (`prompt`, Coach's line) and a spec (`returns`).
 * Testers kept reading the story and missing the ask inside it ("Settle it."),
 * so the task now has its own sentence (`ask`) set big in a lit gold card, with
 * the answer's shape underneath it. The story moves below as context.
 *
 * Pure markup, no hooks, so server and client components can both use it.
 */

import type { ReactNode } from "react";

/** Plain words that also happen to be lowercase tokens in some keys. */
const NOT_COLUMNS = new Set([
  "a", "an", "and", "as", "at", "by", "each", "first", "for", "in", "is", "of",
  "on", "one", "only", "or", "order", "per", "row", "rows", "the", "then", "to",
  "with", "most", "last", "both", "if", "it", "like", "no", "not",
]);

/**
 * The returns line with its column names set as code chips, so the shape of
 * the answer can be read at a glance. A word counts as a column only when it
 * is a lowercase identifier the SQL key itself uses — the key's output names
 * are exactly what the learner has to match. Without a key (cards that ship
 * the question with its key blanked), it's the plain sentence.
 */
export function ReturnsLine({ returns, expected }: { returns: string; expected?: string }): ReactNode {
  if (!expected) return returns;
  const known = new Set(
    (expected.replace(/'[^']*'/g, " ").match(/\b[a-z_][a-z0-9_]*\b/g) ?? []).filter((w) => !NOT_COLUMNS.has(w)),
  );
  if (known.size === 0) return returns;
  const parts = returns.split(/(\b[a-z_][a-z0-9_]*\b)/g);
  return parts.map((part, i) =>
    i % 2 === 1 && known.has(part) ? (
      <code key={i} className="task-col">
        {part}
      </code>
    ) : (
      part
    ),
  );
}

export function QuestionTask({
  ask,
  returns,
  expected,
  done = false,
  size = "lg",
  className = "",
}: {
  ask: string;
  returns?: string;
  /** The SQL key, used only to spot column names in `returns`. */
  expected?: string;
  done?: boolean;
  /** lg on the question page; md in cards and timed screens. */
  size?: "lg" | "md";
  className?: string;
}) {
  return (
    <div className={`task-card rounded-2xl ${size === "lg" ? "p-5" : "p-4"} ${className}`} data-done={done || undefined}>
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 font-mono text-[11px] font-bold ${
            done ? "border-turf bg-turf text-night" : "border-gold text-transparent"
          }`}
        >
          ✓
        </span>
        <p className={`font-mono text-[11px] font-bold uppercase tracking-[0.18em] ${done ? "text-turf" : "text-gold"}`}>
          {done ? "Solved" : "Your task"}
        </p>
      </div>
      <p
        className={`mt-2 font-display font-bold leading-snug text-ink ${
          size === "lg" ? "text-xl sm:text-[1.6rem] sm:leading-tight" : "text-lg"
        }`}
      >
        {ask}
      </p>
      {returns && (
        <div className="task-returns mt-4 rounded-xl px-3 py-2.5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ice">Return exactly</p>
          <p className="mt-1 text-sm leading-relaxed text-ink">
            <ReturnsLine returns={returns} expected={expected} />
          </p>
        </div>
      )}
    </div>
  );
}
