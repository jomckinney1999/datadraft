"use client";

/**
 * Arms the scroll-reveal system and drives it.
 *
 * Two jobs, both deliberately small:
 *
 * 1. Set `data-reveal-armed` on `<html>`. Until that lands, `.reveal`
 *    elements are plain visible content. That ordering is the whole safety
 *    story — if this component never mounts, if hydration fails, if
 *    JavaScript is off, the page reads normally instead of being a column of
 *    invisible sections. A reveal effect that can hide your page when a
 *    script fails is not an effect, it is an outage.
 *
 * 2. Watch every `[data-reveal-section]` and flip `data-revealed` when one
 *    comes into view. The stagger between children is pure CSS
 *    (`.sequence > :nth-child(n)`), so a section of twelve cards costs one
 *    observer entry, not twelve.
 *
 * Sections are unobserved once revealed: this animates on the way in, once,
 * and scrolling back up does not replay it. Re-triggering reads as a page
 * that cannot keep still.
 *
 * Anything already on screen at mount is revealed immediately with no
 * animation, so the hero never flashes.
 */

import { useEffect } from "react";

export default function Reveal() {
  useEffect(() => {
    const root = document.documentElement;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal-section]"),
    );
    if (sections.length === 0) return;

    // No IntersectionObserver (old browser, odd webview) means no reveal at
    // all rather than a page that never appears.
    if (typeof IntersectionObserver === "undefined") return;

    root.setAttribute("data-reveal-armed", "");

    const show = (el: HTMLElement, animate: boolean) => {
      if (!animate) el.style.setProperty("--reveal-duration", "0s");
      el.setAttribute("data-revealed", "true");
    };

    // Above the fold at mount: no animation, because there was no scroll to
    // trigger it and a hero that fades in after hydration reads as a flash.
    const viewport = window.innerHeight || 0;
    for (const el of sections) {
      if (el.getBoundingClientRect().top < viewport * 0.9) show(el, false);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement, true);
          io.unobserve(entry.target);
        }
      },
      // A little before the section's top edge arrives, so the first row has
      // finished moving by the time it is comfortably readable.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    for (const el of sections) {
      if (el.getAttribute("data-revealed") !== "true") io.observe(el);
    }

    return () => {
      io.disconnect();
      root.removeAttribute("data-reveal-armed");
    };
  }, []);

  return null;
}
