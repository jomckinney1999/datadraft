"use client";

import { useEffect, useRef } from "react";
import {
  tokenize,
  TOKEN_CLASS,
  type HighlightLang,
} from "@/lib/highlight";

/**
 * A syntax-highlighted editor built from a real <textarea>.
 *
 * A highlighted <pre> sits underneath and the textarea on top renders its text
 * transparent — so the learner sees colour but keeps every native behaviour a
 * textarea gives for free: selection, undo/redo, spellcheck control, IME and
 * mobile keyboards, and screen-reader support. Swapping in a contenteditable
 * or a full editor library would cost all of that (and, for Monaco, more
 * JavaScript than the rest of this app combined).
 *
 * The two layers must lay out glyphs identically or the caret drifts. Shared
 * geometry lives in the `.code-layer` class and the padding/size classes are
 * applied to both — change one, change the other.
 */
export default function CodeEditor({
  value,
  onChange,
  lang,
  disabled,
  ariaLabel,
  rows = 6,
  className = "",
  padding = "px-4 py-3",
  textSize = "text-[13px] leading-relaxed",
}: {
  value: string;
  onChange: (next: string) => void;
  lang: HighlightLang;
  disabled?: boolean;
  ariaLabel: string;
  rows?: number;
  className?: string;
  padding?: string;
  textSize?: string;
}) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);

  // Keep the highlight scrolled in lockstep with the caret.
  useEffect(() => {
    const ta = taRef.current;
    const pre = preRef.current;
    if (!ta || !pre) return;
    const sync = () => {
      pre.scrollTop = ta.scrollTop;
      pre.scrollLeft = ta.scrollLeft;
    };
    sync();
    ta.addEventListener("scroll", sync);
    return () => ta.removeEventListener("scroll", sync);
  }, []);

  const tokens = tokenize(value, lang);
  const shared = `code-layer ${padding} ${textSize}`;

  return (
    <div className={`relative ${className}`}>
      <pre
        ref={preRef}
        aria-hidden
        className={`${shared} pointer-events-none absolute inset-0 overflow-auto text-ink`}
      >
        {tokens.map((t, i) => (
          <span key={i} className={TOKEN_CLASS[t.kind]}>
            {t.text}
          </span>
        ))}
        {/* A trailing newline isn't rendered by <pre>, so without this the
            highlight is one line short whenever the caret is on a fresh line. */}
        {value.endsWith("\n") ? "\n" : ""}
      </pre>

      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // Tab should indent, not escape the editor. Shift+Tab still moves on,
          // so keyboard users are never trapped.
          if (e.key !== "Tab" || e.shiftKey) return;
          e.preventDefault();
          const el = e.currentTarget;
          const { selectionStart: s, selectionEnd: en } = el;
          const next = value.slice(0, s) + "  " + value.slice(en);
          onChange(next);
          requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = s + 2;
          });
        }}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        rows={rows}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`${shared} relative w-full resize-none bg-transparent text-transparent caret-turf outline-none selection:bg-turf/30`}
      />
    </div>
  );
}
