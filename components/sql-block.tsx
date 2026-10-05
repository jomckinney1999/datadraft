/**
 * A read-only, syntax-coloured SQL block for pages that show code rather
 * than run it (the pattern guides). Server-rendered from the same tokenizer
 * the editor uses (lib/highlight.ts), so a keyword is the same colour here
 * as when you type it.
 */

import { tokenize, TOKEN_CLASS } from "@/lib/highlight";

export default function SqlBlock({ sql, className = "" }: { sql: string; className?: string }) {
  return (
    <pre
      className={`overflow-x-auto rounded-xl border border-panel-border bg-night/60 px-4 py-3 font-mono text-[12.5px] leading-relaxed text-ink ${className}`}
    >
      <code>
        {tokenize(sql, "sql").map((t, i) =>
          t.kind === "plain" ? (
            t.text
          ) : (
            <span key={i} className={TOKEN_CLASS[t.kind]}>
              {t.text}
            </span>
          ),
        )}
      </code>
    </pre>
  );
}
