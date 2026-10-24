/**
 * Page transitions for the front door's two asks (decided 2026-10-06).
 *
 *   snap  — "Solve today's question": a broadcast replay wipe. A football
 *           spirals across trailing gold, ice and turf stripes, a curtain
 *           follows it, and the stripes sweep off the other side onto the
 *           question.
 *   chart — "Chart your league": a bar chart grows up out of the floor,
 *           draws its trend line, floods the screen, and the bars shoot off
 *           the top onto the league page.
 *
 * How it works: the link (components/transition-link.tsx) asks for a
 * transition with a window event instead of navigating; the curtain
 * (components/route-transition.tsx, in the root layout so it survives the
 * navigation) covers the page, pushes the route, and lifts once the new
 * pathname is in. If nothing answers the event, the link navigates as a
 * plain link, so the transition can never be the reason a click goes
 * nowhere.
 */

export type TransitionKind = "snap" | "chart";

export const TRANSITION_EVENT = "datadraft:transition";

export type TransitionRequest = {
  kind: TransitionKind;
  href: string;
  /** The destination's name, shown on the curtain while it's up. */
  label: string;
  /** Set by the curtain when it takes the job. */
  handled: boolean;
};

/**
 * Milliseconds to cover the page. The route is only pushed once the cover
 * is complete: a page that arrives mid-wipe shows through the gaps. The CSS
 * (route-transition.module.css) is timed to these.
 */
export const COVER_MS: Record<TransitionKind, number> = { snap: 540, chart: 880 };
/** Milliseconds to uncover the new page. */
export const REVEAL_MS: Record<TransitionKind, number> = { snap: 580, chart: 640 };
/**
 * Phones, tablets and anything with a finger for a pointer get a lighter,
 * shorter version of each transition. The CSS uses the same media query, so
 * the timings and the drawing can't disagree. Width alone missed a phone in
 * landscape and every iPad, which got the desktop version.
 */
export const LIGHT_QUERY = "(max-width: 700px), (pointer: coarse)";
export const LIGHT_COVER_MS: Record<TransitionKind, number> = { snap: 360, chart: 520 };
export const LIGHT_REVEAL_MS: Record<TransitionKind, number> = { snap: 340, chart: 380 };
/** Never hold the curtain longer than this, whatever the network does. */
export const MAX_HOLD_MS = 8000;

/** On <html> while a curtain is up; TRANSITION_END_EVENT fires when it's gone. */
export const CURTAIN_ATTR = "data-curtain";
export const TRANSITION_END_EVENT = "datadraft:transition-end";

/**
 * Resolves once no curtain is up. A page that boots something heavy on
 * arrival (the question workspace's database) waits for it, so the work
 * lands after the reveal rather than in the middle of it: on a phone, a
 * 100ms seed during the reveal was the hitch people saw. Never waits longer
 * than `maxMs`, so a lost event can't hold a page back.
 */
export function transitionSettled(maxMs = 2500): Promise<void> {
  if (typeof document === "undefined" || !document.documentElement.hasAttribute(CURTAIN_ATTR)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const done = () => {
      window.removeEventListener(TRANSITION_END_EVENT, done);
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(done, maxMs);
    window.addEventListener(TRANSITION_END_EVENT, done);
  });
}

/** Ask for a transition. False means nobody took it: navigate normally. */
export function requestTransition(kind: TransitionKind, href: string, label: string): boolean {
  if (typeof window === "undefined") return false;
  const detail: TransitionRequest = { kind, href, label, handled: false };
  window.dispatchEvent(new CustomEvent<TransitionRequest>(TRANSITION_EVENT, { detail }));
  return detail.handled;
}

/** The path part of an href, for telling whether the route changed. */
export const pathOf = (href: string) => href.split(/[?#]/)[0] || "/";
