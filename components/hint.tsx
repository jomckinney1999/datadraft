"use client";

/**
 * A small explanation card for the status chips (streak, timeouts, tickets,
 * your level): what the number is, how it moves, and what to do about it
 * (decided 2026-10-05: they used to carry a bare `title`, which is slow,
 * unstyled and never shows on a phone).
 *
 * It opens on hover and on keyboard focus, and a tap toggles it, so it works
 * on touch screens too. The card is portalled to <body> with fixed
 * positioning because the chips sit in a horizontally scrolling strip that
 * would clip anything drawn outside it. It's clamped to the viewport and
 * closes on scroll, Escape or a tap elsewhere.
 *
 * Screen readers get the same words without the card: `sr` is rendered as
 * visually hidden text and wired to the trigger with aria-describedby. The
 * trigger still needs a name of its own (an aria-label, when its visible
 * content is only a number and an icon): a description is not a name, and
 * axe flagged the three status chips as unnamed buttons (2026-10-05).
 */

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const WIDTH = 272;

export default function Hint({
  title,
  body,
  sr,
  children,
  toggleOnTap = true,
  className = "",
}: {
  title: string;
  body: ReactNode;
  /** Plain-text version for screen readers. */
  sr: string;
  children: ReactNode;
  /** A tap toggles the card (chips). Off for triggers that are links. */
  toggleOnTap?: boolean;
  className?: string;
}) {
  const id = useId();
  const ref = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const place = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = Math.min(Math.max(8, r.left + r.width / 2 - WIDTH / 2), window.innerWidth - WIDTH - 8);
    setPos({ left, top: r.bottom + 8 });
  }, []);

  const show = useCallback(() => {
    place();
    setOpen(true);
  }, [place]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className={`inline-flex shrink-0 ${className}`}
      onMouseEnter={show}
      onMouseLeave={() => setOpen(false)}
      onFocus={show}
      onBlur={() => setOpen(false)}
      onClick={toggleOnTap ? () => (open ? setOpen(false) : show()) : undefined}
    >
      {isValidElement(children)
        ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, { "aria-describedby": id })
        : children}
      <span className="sr-only" id={id}>
        {sr}
      </span>
      {mounted &&
        open &&
        pos &&
        createPortal(
          <span
            role="tooltip"
            aria-hidden
            className="surface pointer-events-none fixed z-[100] block rounded-xl border border-panel-border bg-panel px-3.5 py-3 text-left shadow-float"
            style={{ left: pos.left, top: pos.top, width: WIDTH }}
          >
            <span className="block font-display text-sm font-bold text-ink">{title}</span>
            <span className="mt-1 block text-[12.5px] leading-relaxed text-ink-soft">{body}</span>
          </span>,
          document.body,
        )}
    </span>
  );
}
