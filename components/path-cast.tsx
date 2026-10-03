"use client";

/**
 * The characters on a Duolingo-style path, and the thing that makes them move.
 *
 * Renders one absolutely-positioned layer inside a `.path-board` (which must
 * be `relative`). The board itself is untouched: it only has to tag its
 * pieces with data attributes —
 *
 *   data-path-node="<lessonId>"   on each lesson node's wrapper
 *   data-path-decor="chest" | "clear" | "endzone"   on chests and trophies
 *
 * — and this layer measures them and stands characters beside them:
 *
 *   • Coach Blitz beside your current play. When you come back having
 *     advanced, he hops node by node from where he last stood to where you are
 *     now; where he stood is remembered per board in localStorage.
 *   • A Rookie beside every chest and a Ref at every clear and end zone.
 *
 * Why an overlay instead of drawing them inside the nodes: the board stage is
 * tilted in 3D (`rotateX`) and each node is translated sideways, so a
 * character nested in a node would inherit the tilt and could never travel
 * between nodes. Measuring the nodes' on-screen boxes and drawing the cast
 * flat on top gives both: they stand on the board, and they can move across it.
 *
 * Everything degrades to "already in place". Positions are written as the
 * element's base transform before any animation starts, so a hop that never
 * plays (hidden tab, reduced motion) leaves Coach at the right node rather
 * than stuck at the old one or invisible.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Coach, { celebrationFor, type CoachMood } from "@/components/coach";
import SidelineCast, { type CastKind } from "@/components/sideline-cast";
import { displayStreak, loadProgress, type Progress } from "@/lib/progress";
import styles from "./cast.module.css";

const GAP = 10;
const HOP_MS = 360;
const MAX_HOPS = 6;
/**
 * The board renders once with empty progress before the real progress loads,
 * which briefly makes the first lesson look current. Acting on that would hop
 * Coach from lesson one on every visit, so a current node only counts once it
 * has held still this long.
 */
const SETTLE_MS = 180;

type Spot = { x: number; y: number; side: 1 | -1 };
type Decor = Spot & { key: string; kind: CastKind; tone: number; delay: number; w: number };

/** Lines are picked by a counter, never Math.random — a re-render must not re-roll what he is saying mid-read. */
const LINES: Record<"angry" | "cheer" | "happy" | "fresh" | "idle" | "sleep", string[]> = {
  angry: [
    "Streak's on the line. Snap the ball.",
    "I didn't drive to practice to watch you scroll.",
    "One drive. That's all I'm asking.",
    "You call that a two-minute drill?",
  ],
  cheer: ["First down! Keep it moving.", "That's how you move the chains.", "Look at you go."],
  happy: [
    "Good reps today.",
    "Film room's open if you want more.",
    "Hydrate. Then one more drive.",
  ],
  fresh: ["First snap's yours, rookie.", "Helmet on. Let's see what you've got."],
  idle: ["Let's get a rep in.", "Ball's on the tee.", "Warmups are over. Let's play."],
  sleep: [
    "Zzz… tap me when you're ready.",
    "I've been waiting. Wake me up.",
    "Practice starts when you do.",
  ],
};

function todayUTC() {
  // Same day boundary lib/progress.ts uses for streaks.
  return new Date().toISOString().slice(0, 10);
}

/** Whole UTC days since `yyyy-mm-dd`, or null when the day is missing. */
function daysSince(day: string | undefined | null): number | null {
  if (!day) return null;
  const then = Date.parse(`${day}T00:00:00.000Z`);
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
}

function moodFor(p: Progress | null): { mood: CoachMood; lines: keyof typeof LINES } {
  if (!p || p.completedLessons.length === 0) return { mood: "whistle", lines: "fresh" };
  if (p.lastActiveDay === todayUTC()) return { mood: "happy", lines: "happy" };
  if (displayStreak(p) > 0) return { mood: "angry", lines: "angry" };
  const away = daysSince(p.lastActiveDay);
  if (away !== null && away >= 3) return { mood: "sleep", lines: "sleep" };
  return { mood: "idle", lines: "idle" };
}

export default function PathCast({
  boardKey,
  currentId,
  walker = true,
}: {
  /** Identifies this board for remembering where Coach last stood. */
  boardKey: string;
  /** The lesson id of the current play, or null when every play is done. */
  currentId: string | null;
  /**
   * Whether Coach belongs on this board at all. A course roadmap draws one
   * board per unit, and only the unit holding the current play gets him.
   */
  walker?: boolean;
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const walkerRef = useRef<HTMLButtonElement>(null);
  const settledRef = useRef<string | null | undefined>(undefined);
  const [decor, setDecor] = useState<Decor[]>([]);
  const [placed, setPlaced] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [hopping, setHopping] = useState(false);
  // Which way the bubble opens, and how wide it may get: toward whichever
  // side of Coach has more room, so it can never push past the board edge
  // and make a phone scroll sideways.
  const [bubble, setBubble] = useState<{ dir: 1 | -1; max: number }>({ dir: 1, max: 184 });
  const [size, setSize] = useState(64);
  const [lineIdx, setLineIdx] = useState(0);
  const [bubbleOn, setBubbleOn] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [poke, setPoke] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const board = useCallback(
    () => layerRef.current?.parentElement ?? null,
    [],
  );

  /** Where a character stands beside `el`, in layer coordinates (feet position). */
  const spotBeside = useCallback(
    (el: Element, w: number, preferSide?: 1 | -1): Spot | null => {
      const b = board();
      if (!b) return null;
      const bRect = b.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      // The disc, not the wrapper, sets the width to clear; the wrapper also
      // holds the title underneath and is as wide as the text.
      const disc =
        (el.querySelector(".path-node") as HTMLElement | null) ??
        (el as HTMLElement);
      const discW = disc.offsetWidth || r.width;
      const discH = disc.offsetHeight || r.height;
      const cx = r.left + r.width / 2 - bRect.left;
      const feet = r.top - bRect.top + discH - 4;
      const reach = discW / 2 + GAP + w / 2;
      const roomL = cx - reach - w / 2;
      const roomR = bRect.width - (cx + reach + w / 2);
      let s: 1 | -1 = preferSide ?? (roomR >= roomL ? 1 : -1);
      if (s === 1 && roomR < 0 && roomL > roomR) s = -1;
      if (s === -1 && roomL < 0 && roomR > roomL) s = 1;
      const x = Math.min(
        Math.max(cx + s * reach, w / 2),
        bRect.width - w / 2,
      );
      return { x, y: feet, side: s };
    },
    [board],
  );

  const place = useCallback(
    (el: HTMLElement, spot: Spot, w: number) => {
      el.style.transform = `translate(${spot.x - w / 2}px, ${spot.y - w}px)`;
    },
    [],
  );

  const layout = useCallback(
    (animateFrom: string | null, quiet = false) => {
      const b = board();
      if (!b) return;
      const wide = b.getBoundingClientRect().width;
      // Big enough to be a presence beside a node, the way Duolingo's cast
      // stands as tall as the chests; smaller on a phone-width board.
      const w = wide < 420 ? 58 : 78;
      setSize(w);

      // Sideline cast beside chests and trophies, alternating sides.
      const anchors = Array.from(b.querySelectorAll("[data-path-decor]"));
      const castW = w - 6;
      setDecor(
        anchors
          .map((el, i) => {
            const kind: CastKind =
              el.getAttribute("data-path-decor") === "chest" ? "rookie" : "ref";
            const spot = spotBeside(el, castW, i % 2 === 0 ? -1 : 1);
            return spot
              ? { ...spot, key: `${kind}-${i}`, kind, tone: i, delay: (i * 1.3) % 4, w: castW }
              : null;
          })
          .filter((d): d is Decor => d !== null),
      );

      const wEl = walkerRef.current;
      if (!walker || !wEl) return;
      const nodes = Array.from(
        b.querySelectorAll<HTMLElement>("[data-path-node]"),
      );
      if (nodes.length === 0) return;
      const ids = nodes.map((n) => n.getAttribute("data-path-node"));
      // All done: he waits at the last play.
      const targetIdx = currentId ? ids.indexOf(currentId) : nodes.length - 1;
      if (targetIdx < 0) return;

      const target = spotBeside(nodes[targetIdx], w);
      if (!target) return;
      // Open away from the node he's standing beside, so the bubble never
      // covers the SNAP pill — unless that side is too tight, then flip.
      const roomR = wide - target.x;
      const roomL = target.x;
      const away = target.side === 1 ? roomR : roomL;
      const dir: 1 | -1 = away >= 120 ? target.side : target.side === 1 ? -1 : 1;
      setBubble({ dir, max: Math.min(184, Math.max(110, (dir === 1 ? roomR : roomL) + 6)) });
      // Final position first, so a hop that never runs still lands him here.
      place(wEl, target, w);
      setPlaced(true);

      const fromIdx = animateFrom ? ids.indexOf(animateFrom) : -1;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (quiet) return;
      if (reduce) {
        setBubbleOn(true);
        return;
      }

      if (fromIdx >= 0 && fromIdx < targetIdx) {
        // Hop through each play in between, keeping only the last few so a
        // long absence doesn't turn into a ten-second parade.
        let path = nodes.slice(fromIdx, targetIdx + 1);
        if (path.length > MAX_HOPS + 1) path = [path[0], ...path.slice(-MAX_HOPS)];
        const spots = path
          .map((n, i) => (i === path.length - 1 ? target : spotBeside(n, w)))
          .filter((s): s is Spot => s !== null);
        const frames: Keyframe[] = [];
        const steps = spots.length - 1;
        spots.forEach((s, i) => {
          const at = (x: number, y: number, extra = "") =>
            `translate(${x - w / 2}px, ${y - w}px)${extra}`;
          frames.push({ transform: at(s.x, s.y), offset: i / steps });
          const next = spots[i + 1];
          if (next) {
            const midX = (s.x + next.x) / 2;
            const midY = Math.min(s.y, next.y) - 34;
            frames.push({
              transform: at(midX, midY, " scale(0.96, 1.04)"),
              offset: (i + 0.5) / steps,
            });
          }
        });
        setHopping(true);
        const anim = wEl.animate(frames, {
          duration: HOP_MS * steps,
          easing: "ease-in-out",
        });
        anim.onfinish = anim.oncancel = () => {
          setHopping(false);
          setCelebrate(true);
          setBubbleOn(true);
        };
      } else if (fromIdx < 0 && animateFrom === null) {
        // First time on this board: he drops in. Transform only, so if the
        // animation never runs he is simply already standing there.
        wEl.animate(
          [
            { transform: `translate(${target.x - w / 2}px, ${target.y - w - 60}px)` },
            { transform: `translate(${target.x - w / 2}px, ${target.y - w + 3}px) scale(1.06, 0.92)`, offset: 0.75 },
            { transform: `translate(${target.x - w / 2}px, ${target.y - w}px)` },
          ],
          { duration: 620, easing: "cubic-bezier(0.3, 0.7, 0.4, 1)" },
        );
        setBubbleOn(true);
      } else {
        setBubbleOn(true);
      }
    },
    [board, currentId, place, spotBeside, walker],
  );

  // Act on the current play once it has settled, then remember it.
  useEffect(() => {
    const key = `sqlsports.coach.${boardKey}`;
    const t = window.setTimeout(() => {
      if (settledRef.current === currentId) return;
      settledRef.current = currentId;
      let from: string | null = null;
      try {
        from = window.localStorage.getItem(key);
      } catch {
        // storage blocked: he just won't remember
      }
      layout(from === currentId ? "" : from);
      try {
        if (currentId) window.localStorage.setItem(key, currentId);
      } catch {
        // ignore
      }
    }, SETTLE_MS);
    return () => window.clearTimeout(t);
  }, [boardKey, currentId, layout]);

  // Re-measure on resize without replaying anything.
  useEffect(() => {
    const b = board();
    if (!b || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      if (settledRef.current === undefined) return;
      walkerRef.current?.getAnimations().forEach((an) => an.finish());
      layout("", true);
    });
    ro.observe(b);
    return () => ro.disconnect();
  }, [board, layout]);

  const base = moodFor(progress);

  useEffect(() => {
    if (!poke) return;
    const t = window.setTimeout(() => setPoke(false), 900);
    return () => window.clearTimeout(t);
  }, [poke, lineIdx]);

  // Lines fade after a few seconds — except the angry nag, which stays up
  // until you do something about your streak.
  useEffect(() => {
    if (!bubbleOn && !celebrate) return;
    const t = window.setTimeout(() => {
      setCelebrate(false);
      if (base.mood !== "angry") setBubbleOn(false);
    }, 4200);
    return () => window.clearTimeout(t);
  }, [bubbleOn, celebrate, base.mood, lineIdx]);

  // A tap gets a reaction of its own, or — if he's already angry — the whistle.
  // Celebrations rotate by board + line so he isn't always the same jump.
  const party = celebrationFor(`${boardKey}-${lineIdx}`);
  const mood: CoachMood = hopping
    ? party
    : poke
      ? base.mood === "angry"
        ? "whistle"
        : base.mood === "sleep"
          ? "surprised"
          : party
      : celebrate
        ? party
        : base.mood;
  const bank = LINES[celebrate ? "cheer" : base.lines];
  const line = bank[lineIdx % bank.length];

  return (
    <div
      ref={layerRef}
      className="pointer-events-none absolute inset-0 z-[5]"
      aria-hidden={walker ? undefined : true}
    >
      {decor.map((d) => (
        <div
          key={d.key}
          className={styles.castSpot}
          style={{ transform: `translate(${d.x - d.w / 2}px, ${d.y - d.w}px)` }}
          aria-hidden
        >
          <SidelineCast kind={d.kind} tone={d.tone} delay={d.delay} size={d.w} />
        </div>
      ))}

      {walker && (
        <button
          ref={walkerRef}
          type="button"
          className={styles.walker}
          style={{ visibility: placed ? "visible" : "hidden", width: size, height: size }}
          aria-label={`Coach Blitz: ${line}`}
          onClick={() => {
            setLineIdx((i) => i + 1);
            setCelebrate(false);
            setPoke(true);
            setBubbleOn(true);
          }}
        >
          <span
            className={`${styles.bubble} ${bubble.dir === 1 ? styles.bubbleRight : styles.bubbleLeft} ${
              base.mood === "angry" && !celebrate ? styles.bubbleAngry : ""
            } ${bubbleOn && !hopping ? "" : styles.bubbleHidden}`}
            style={{ maxWidth: bubble.max }}
            aria-hidden
          >
            {line}
          </span>
          <Coach mood={mood} size={size} />
        </button>
      )}
    </div>
  );
}
