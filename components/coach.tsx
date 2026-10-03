// Coach Blitz — the DataDraft mascot. A football with a coach's temper.
//
// Built in the flat, outline-free style of a modern mascot: one leather body
// with a darker rim for shading, huge eyes, heavy brows that carry most of the
// expression, eye black, white gloves, cleats, and a whistle on a turf-green
// lanyard. The laces sit on top as a crest; the white end-stripe of the ball
// wraps his base.
//
// He is a football on purpose. A round green bird would read as a copy of a
// trademarked mascot; a football with an attitude is ours, and the sport is
// the personality.
//
// Every part that moves is its own <g> so cast.module.css can animate it.
// Sixteen moods (2026-10-03: he had seven, and the site leaned on four of
// them, so every right answer got the same jump). Each is a pose, a face and
// a motion of its own:
//
//   idle       breathes, blinks, glances about
//   happy      bounces and waves
//   cheer      jumps, both arms up
//   clap       claps, with a spark where the gloves meet
//   dance      raises the roof, side to side, notes floating up
//   flex       flexes, a star at his fist
//   point      points up and off to the side ("over there")
//   think      hand to chin, tilting
//   clipboard  scribbles on a clipboard, tongue out in concentration
//   surprised  jolts back, "!" over his head
//   shrug      palms up, shoulders up ("eh, not quite")
//   sad        droops, a tear
//   facepalm   glove over his eyes, shaking his head
//   angry      arms folded, cleat tapping
//   whistle    blows the whistle, cheeks puffing
//   sleep      eyes shut, Z's floating up
//
// `talking` moves his mouth while a line types out (cutscenes, the tour);
// `facing="left"` mirrors him so he can point or look toward something on
// his left. Hovering him makes him hop, and his pupils follow the pointer
// (components/coach-eyes.tsx sets --lx / --ly on every Coach on the page).
// Pass `animated={false}` for a still pose. All motion is off under reduced
// motion.
//
// Illustration colours are fixed hexes by design: he is the same character in
// every context, not a themed surface.

import styles from "./cast.module.css";

export type CoachMood =
  | "idle"
  | "happy"
  | "sad"
  | "cheer"
  | "think"
  | "angry"
  | "whistle"
  | "clap"
  | "dance"
  | "flex"
  | "point"
  | "clipboard"
  | "surprised"
  | "shrug"
  | "facepalm"
  | "sleep";

/** Every mood, in the order the gallery shows them. */
export const COACH_MOODS: CoachMood[] = [
  "idle", "happy", "cheer", "clap", "dance", "flex", "point", "think",
  "clipboard", "surprised", "shrug", "sad", "facepalm", "angry", "whistle", "sleep",
];

/** The celebrations, for places that want a different one each time. */
export const CELEBRATIONS: CoachMood[] = ["cheer", "clap", "dance", "flex"];

/**
 * A celebration picked by a stable key (a question id, a day), never at
 * random: a random pick re-rolls on every render and flickers, and a server
 * render that disagrees with the client tears hydration.
 */
export function celebrationFor(key: string): CoachMood {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return CELEBRATIONS[h % CELEBRATIONS.length];
}

const C = {
  leatherDark: "#8F4318",
  leather: "#C0652B",
  leatherLight: "#E08D52",
  arm: "#8E4519",
  ink: "#1C1411",
  brow: "#3A1B0A",
  white: "#FFFFFF",
  lace: "#FFF6EA",
  gloveShade: "#C9D3D8",
  cleat: "#1B262C",
  cleatSole: "#E9EEF1",
  lanyard: "#58CC02",
  whistle: "#DCE4E8",
  whistleShade: "#9FB0B8",
  tongue: "#F07070",
  cheek: "#E7875A",
  tear: "#1CB0F6",
  gold: "#FFC800",
  board: "#6E4A2C",
  boardEdge: "#523520",
  paper: "#F4F1EA",
};

type Arm = { d: string; hand: [number, number] };
type Pose = { l: Arm; r: Arm; front: boolean };

// Shoulders sit just inside the body edge at y≈70. Arms drawn behind the body
// are hidden from the shoulder to the edge, which is what attaches them;
// poses that cross the body (think, angry, whistle, clap...) are drawn in front.
const HIP_L: Arm = { d: "M29 70 Q15 78 24 90", hand: [25, 90] };
const POSES: Record<CoachMood, Pose> = {
  idle: {
    l: { d: "M29 70 Q19 79 17 90", hand: [17, 91] },
    r: { d: "M91 70 Q101 79 103 90", hand: [103, 91] },
    front: false,
  },
  happy: {
    l: { d: "M29 70 Q17 78 14 88", hand: [14, 89] },
    r: { d: "M91 68 Q106 64 107 50", hand: [107, 48] },
    front: false,
  },
  cheer: {
    l: { d: "M29 66 Q16 56 15 40", hand: [15, 37] },
    r: { d: "M91 66 Q104 56 105 40", hand: [105, 37] },
    front: false,
  },
  sad: {
    l: { d: "M30 72 Q25 84 27 95", hand: [27, 96] },
    r: { d: "M90 72 Q95 84 93 95", hand: [93, 96] },
    front: false,
  },
  think: {
    l: { d: "M27 72 Q19 81 18 91", hand: [18, 92] },
    r: { d: "M94 72 Q104 92 74 84", hand: [71, 83] },
    front: true,
  },
  angry: {
    l: { d: "M27 72 Q42 94 82 80", hand: [83, 80] },
    r: { d: "M93 72 Q78 94 38 80", hand: [37, 80] },
    front: true,
  },
  whistle: {
    l: { d: "M27 71 Q12 81 27 92", hand: [28, 92] },
    r: { d: "M94 71 Q103 86 71 79", hand: [70, 79] },
    front: true,
  },
  clap: {
    l: { d: "M28 72 Q33 90 51 86", hand: [52, 86] },
    r: { d: "M92 72 Q87 90 69 86", hand: [68, 86] },
    front: true,
  },
  dance: {
    l: { d: "M29 66 Q16 56 15 40", hand: [15, 37] },
    r: { d: "M91 66 Q104 56 105 40", hand: [105, 37] },
    front: false,
  },
  flex: {
    l: HIP_L,
    r: { d: "M91 70 Q111 74 108 55", hand: [107, 53] },
    front: false,
  },
  point: {
    l: HIP_L,
    r: { d: "M91 66 Q106 60 113 52", hand: [114, 51] },
    front: false,
  },
  clipboard: {
    l: { d: "M29 72 Q20 90 31 98", hand: [32, 98] },
    r: { d: "M92 72 Q86 94 51 85", hand: [50, 84] },
    front: true,
  },
  surprised: {
    l: { d: "M29 70 Q15 64 19 50", hand: [20, 48] },
    r: { d: "M91 70 Q105 64 101 50", hand: [100, 48] },
    front: false,
  },
  shrug: {
    l: { d: "M30 76 Q10 85 9 66", hand: [9, 64] },
    r: { d: "M90 76 Q110 85 111 66", hand: [111, 64] },
    front: false,
  },
  facepalm: {
    l: { d: "M30 72 Q23 84 24 95", hand: [24, 96] },
    r: { d: "M93 73 Q103 62 84 51", hand: [74, 45] },
    front: true,
  },
  sleep: {
    l: { d: "M30 74 Q24 88 27 98", hand: [27, 99] },
    r: { d: "M90 74 Q96 88 93 98", hand: [93, 99] },
    front: false,
  },
};

const BROWS: Record<CoachMood, [string, string]> = {
  idle: ["M37 33 L54 36", "M66 36 L83 33"],
  happy: ["M37 32 Q45.5 26 54 31", "M66 31 Q74.5 26 83 32"],
  cheer: ["M37 30 Q45.5 23 54 29", "M66 29 Q74.5 23 83 30"],
  sad: ["M38 36 L54 30", "M66 30 L82 36"],
  think: ["M37 34 L54 34", "M66 31 Q74.5 24 83 29"],
  angry: ["M36 30 L56 40", "M64 40 L84 30"],
  whistle: ["M37 34 L55 38", "M65 38 L83 34"],
  clap: ["M37 31 Q45.5 25 54 30", "M66 30 Q74.5 25 83 31"],
  dance: ["M37 30 Q45.5 23 54 29", "M66 29 Q74.5 23 83 30"],
  flex: ["M37 35 L54 36", "M66 31 Q74.5 24 83 28"],
  point: ["M37 35 L54 37", "M66 32 Q74.5 25 83 29"],
  clipboard: ["M37 35 L54 37", "M66 37 L83 35"],
  surprised: ["M37 27 Q45.5 21 54 26", "M66 26 Q74.5 21 83 27"],
  shrug: ["M37 33 Q46 31 54 27", "M66 27 Q74 31 83 33"],
  facepalm: ["M37 36 L54 39", "M66 39 L83 36"],
  sleep: ["M38 37 L54 38", "M66 38 L82 37"],
};

// Pupil centres and radius. Idle converges them slightly, which reads as friendlier.
const PUPILS: Record<CoachMood, [[number, number], [number, number], number]> = {
  idle: [[49, 48], [71, 48], 6.5],
  happy: [[48, 47], [72, 47], 6.5],
  cheer: [[48, 47], [72, 47], 6.5],
  sad: [[47, 51], [73, 51], 6.5],
  think: [[51, 43], [75, 43], 6.2],
  angry: [[49, 48], [71, 48], 5.4],
  whistle: [[49, 48], [71, 48], 6],
  clap: [[48, 47], [72, 47], 6.5],
  dance: [[48, 47], [72, 47], 6.5],
  flex: [[51, 45], [75, 44], 6.2],
  point: [[52, 45], [76, 44], 6.2],
  clipboard: [[45, 51], [69, 51], 6.2],
  surprised: [[47, 47], [73, 47], 4.2],
  shrug: [[46, 45], [70, 45], 6.2],
  facepalm: [[49, 48], [71, 48], 6],
  sleep: [[49, 48], [71, 48], 6],
};

// How the eyes are drawn: open, shut in a smile (^ ^), or shut flat.
const EYES: Partial<Record<CoachMood, "smile" | "shut">> = {
  cheer: "smile",
  dance: "smile",
  sleep: "shut",
  facepalm: "shut",
};

// Upper eyelids, as the eye's own top arc closed off by a straight edge — so
// they always sit exactly on the eye without needing a clip path (which would
// need a per-instance id, and this component has no client state).
const LIDS: Partial<Record<CoachMood, [string, string]>> = {
  angry: [
    "M37.45 42 A10.5 12 0 0 1 57.46 46 Z",
    "M62.54 46 A10.5 12 0 0 1 82.55 42 Z",
  ],
  whistle: [
    "M37.91 41 A10.5 12 0 0 1 56.09 41 Z",
    "M63.91 41 A10.5 12 0 0 1 82.09 41 Z",
  ],
  clipboard: [
    "M37.91 41 A10.5 12 0 0 1 56.09 41 Z",
    "M63.91 41 A10.5 12 0 0 1 82.09 41 Z",
  ],
};

const BODY_ANIM: Record<CoachMood, string> = {
  idle: styles.breathe,
  happy: styles.bounce,
  cheer: styles.jump,
  sad: styles.droop,
  think: styles.tilt,
  angry: styles.huff,
  whistle: styles.breathe,
  clap: styles.bounceQuick,
  dance: styles.dance,
  flex: styles.flexBody,
  point: styles.lean,
  clipboard: styles.breathe,
  surprised: styles.jolt,
  shrug: styles.shrug,
  facepalm: styles.headShake,
  sleep: styles.snooze,
};

const ARM_ANIM: Partial<Record<CoachMood, [string | undefined, string | undefined]>> = {
  happy: [undefined, styles.waveR],
  cheer: [styles.wiggleL, styles.wiggleR],
  clap: [styles.clapL, styles.clapR],
  dance: [styles.roofL, styles.roofR],
  flex: [undefined, styles.flexR],
  point: [undefined, styles.jab],
  clipboard: [undefined, styles.scribble],
  shrug: [styles.shrugArm, styles.shrugArm],
};

// The whistle on the lanyard is hidden where it's in his mouth, or where his
// hands (or the clipboard) would sit on top of it.
const NO_LANYARD_WHISTLE = new Set<CoachMood>(["whistle", "angry", "clap", "clipboard"]);

// Moods whose mouth can move while he talks. Not with a whistle in it, not
// asleep, and not mid-shout.
const CAN_TALK = new Set<CoachMood>(["idle", "happy", "think", "point", "shrug", "clipboard", "flex", "sad"]);

export default function Coach({
  mood = "idle",
  size = 120,
  className = "",
  animated = true,
  talking = false,
  facing = "right",
}: {
  mood?: CoachMood;
  size?: number;
  className?: string;
  animated?: boolean;
  /** Move his mouth, for while a line of his types out. */
  talking?: boolean;
  /** "left" mirrors him, so he points and looks to his left. */
  facing?: "left" | "right";
}) {
  const a = (cls: string | undefined) => (animated ? cls : undefined);
  const pose = POSES[mood];
  const [browL, browR] = BROWS[mood];
  const [pl, pr, pupilR] = PUPILS[mood];
  const lids = LIDS[mood];
  const eyes = EYES[mood];
  const [armL, armR] = ARM_ANIM[mood] ?? [undefined, undefined];

  // Crossed arms overlap, so their gloves go on top of both strokes;
  // otherwise one arm would hide the other's hand and the pose reads as a
  // brown blob instead of arms folded.
  const crossed = mood === "angry";
  const arms = crossed ? (
    <>
      <path d={pose.l.d} fill="none" stroke={C.arm} strokeWidth="9.5" strokeLinecap="round" />
      <path d={pose.r.d} fill="none" stroke={C.arm} strokeWidth="9.5" strokeLinecap="round" />
      <Glove at={pose.l.hand} />
      <Glove at={pose.r.hand} />
    </>
  ) : (
    <>
      <g className={a(armL)}>
        <path d={pose.l.d} fill="none" stroke={C.arm} strokeWidth="9.5" strokeLinecap="round" />
        <Glove at={pose.l.hand} />
      </g>
      <g className={a(armR)}>
        <path d={pose.r.d} fill="none" stroke={C.arm} strokeWidth="9.5" strokeLinecap="round" />
        {mood === "flex" && <ellipse cx="103" cy="70" rx="6.5" ry="5.2" fill={C.arm} />}
        {mood === "point" && (
          // the pointing finger, out along the arm
          <g strokeLinecap="round">
            <path d="M114 51 L120.5 45.5" stroke={C.gloveShade} strokeWidth="5.6" />
            <path d="M114 51 L120.5 45.5" stroke={C.white} strokeWidth="3.4" />
          </g>
        )}
        {mood === "clipboard" && (
          // a pencil, tip on the page
          <g strokeLinecap="round">
            <path d="M53 80 L43.5 90.5" stroke={C.gold} strokeWidth="3.2" />
            <path d="M44.6 89.3 L42.6 91.6" stroke={C.ink} strokeWidth="2" />
          </g>
        )}
        {mood === "facepalm" ? <Palm at={pose.r.hand} /> : <Glove at={pose.r.hand} />}
      </g>
    </>
  );

  const talks = talking && animated && CAN_TALK.has(mood);
  const tracks = animated && eyes === undefined;
  const flip = facing === "left";

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      overflow="visible"
      className={`${styles.figure} ${animated ? styles.animated : ""} ${className}`}
      role="img"
      aria-label={`Coach Blitz, ${LABEL[mood]}`}
      data-coach-eyes={tracks ? (flip ? "left" : "right") : undefined}
    >
      <g transform={flip ? "matrix(-1 0 0 1 120 0)" : undefined}>
        {/* ground shadow stays put while the body moves */}
        <g className={a(mood === "cheer" ? styles.shadowJump : mood === "dance" ? styles.shadowDance : undefined)}>
          <ellipse cx="60" cy="113" rx="30" ry="4.2" fill="#000" opacity="0.3" />
        </g>

        {/* hover: a hop, on top of whatever the mood is doing */}
        <g className={a(styles.react)}>
          <g className={a(BODY_ANIM[mood])}>
            {/* cleats peek out beneath the ball */}
            <g className={a(mood === "angry" ? styles.tap : mood === "dance" ? styles.stepL : undefined)}>
              <path
                d="M34 107 Q34 101 42 101 L50 101 Q57 101 57 107 Q57 111.5 51 111.5 L40 111.5 Q34 111.5 34 107 Z"
                fill={C.cleat}
              />
              <path d="M36.5 110 L54.5 110" stroke={C.cleatSole} strokeWidth="1.8" strokeLinecap="round" />
            </g>
            <g className={a(mood === "dance" ? styles.stepR : undefined)}>
              <path
                d="M86 107 Q86 101 78 101 L70 101 Q63 101 63 107 Q63 111.5 69 111.5 L80 111.5 Q86 111.5 86 107 Z"
                fill={C.cleat}
              />
              <path d="M83.5 110 L65.5 110" stroke={C.cleatSole} strokeWidth="1.8" strokeLinecap="round" />
            </g>

            {!pose.front && arms}

            {/* the ball: dark rim, lit face, specular patch */}
            <ellipse cx="60" cy="60" rx="38" ry="46" fill={C.leatherDark} />
            <ellipse cx="57.5" cy="57" rx="35" ry="43" fill={C.leather} />
            <ellipse
              cx="47"
              cy="37"
              rx="12"
              ry="16.5"
              fill={C.leatherLight}
              opacity="0.5"
              transform="rotate(-22 47 37)"
            />

            {/* laces as a crest */}
            <path d="M60 16 L60 30" stroke={C.lace} strokeWidth="2.6" strokeLinecap="round" />
            <path
              d="M55.5 19 L64.5 19 M55.5 23.3 L64.5 23.3 M55.5 27.6 L64.5 27.6"
              stroke={C.lace}
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* the ball's end-stripe, wrapping his base */}
            <path d="M33 92 Q60 99 87 92 L81.6 98 Q60 104 38.4 98 Z" fill={C.white} />

            {/* lanyard; in whistle mood it runs up to his mouth instead */}
            {mood === "whistle" ? (
              <path d="M30 70 Q46 92 58 76" fill="none" stroke={C.lanyard} strokeWidth="2.6" strokeLinecap="round" />
            ) : (
              <path d="M30 70 Q60 104 90 70" fill="none" stroke={C.lanyard} strokeWidth="2.6" strokeLinecap="round" />
            )}
            {!NO_LANYARD_WHISTLE.has(mood) && (
              <g>
                <rect x="55" y="84" width="13" height="7.5" rx="3.7" fill={C.whistle} />
                <rect x="66.5" y="85.2" width="5.5" height="4.6" rx="1.2" fill={C.whistleShade} />
                <circle cx="55.8" cy="87.75" r="2.5" fill="none" stroke={C.whistleShade} strokeWidth="1.5" />
                <circle cx="61.4" cy="86.4" r="1.2" fill={C.whistleShade} />
              </g>
            )}

            {/* eye black */}
            <rect x="39" y="60.5" width="15" height="3.6" rx="1.8" fill={C.ink} />
            <rect x="66" y="60.5" width="15" height="3.6" rx="1.8" fill={C.ink} />

            {/* eyes */}
            {eyes === "smile" ? (
              <g>
                <path d="M38 49 Q47 40 56 49" fill="none" stroke={C.ink} strokeWidth="3.6" strokeLinecap="round" />
                <path d="M64 49 Q73 40 82 49" fill="none" stroke={C.ink} strokeWidth="3.6" strokeLinecap="round" />
              </g>
            ) : eyes === "shut" ? (
              <g>
                <path d="M38 47 Q47 53 56 47" fill="none" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />
                <path d="M64 47 Q73 53 82 47" fill="none" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />
              </g>
            ) : (
              <g className={a(styles.blink)}>
                <ellipse cx="47" cy="47" rx="10.5" ry="12" fill={C.white} />
                <ellipse cx="73" cy="47" rx="10.5" ry="12" fill={C.white} />
                {/* outer group follows the pointer; inner one does the idle glance */}
                <g className={a(styles.track)}>
                  <g className={a(mood === "idle" ? styles.look : undefined)}>
                    <circle cx={pl[0]} cy={pl[1]} r={pupilR} fill={C.ink} />
                    <circle cx={pr[0]} cy={pr[1]} r={pupilR} fill={C.ink} />
                    <circle cx={pl[0] + 1.9} cy={pl[1] - 2.3} r={pupilR > 5 ? 2 : 1.4} fill={C.white} />
                    <circle cx={pr[0] + 1.9} cy={pr[1] - 2.3} r={pupilR > 5 ? 2 : 1.4} fill={C.white} />
                  </g>
                </g>
                {lids && (
                  <g fill={C.leather}>
                    <path d={lids[0]} />
                    <path d={lids[1]} />
                  </g>
                )}
              </g>
            )}

            {/* brows carry most of the expression */}
            <g stroke={C.brow} strokeWidth="5" strokeLinecap="round" fill="none">
              <path d={browL} />
              <path d={browR} />
            </g>

            {mood === "sad" && <path d="M40 57 Q37 62 40 64.5 Q43 62 40 57 Z" fill={C.tear} />}
            {mood === "facepalm" && <path d="M27 36 Q24 41 27 43.5 Q30 41 27 36 Z" fill={C.tear} />}

            {talks ? <TalkingMouth /> : <Mouth mood={mood} animated={animated} />}

            {mood === "clipboard" && <Clipboard animated={animated} />}

            {pose.front && arms}

            {/* whistle held to his mouth, drawn over the hand holding it */}
            {mood === "whistle" && (
              <g>
                <rect x="53.5" y="71.2" width="6" height="4.4" rx="1.2" fill={C.whistleShade} />
                <rect x="58.5" y="69.5" width="13.5" height="7.8" rx="3.8" fill={C.whistle} />
                <circle cx="72.4" cy="73.4" r="2.6" fill="none" stroke={C.whistleShade} strokeWidth="1.5" />
                <circle cx="64" cy="71.8" r="1.2" fill={C.whistleShade} />
                <g className={a(styles.tweet)}>
                  <path
                    d="M48 64 L43 60 M47 73 L41 73 M48 81 L43 85"
                    stroke={C.white}
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                </g>
              </g>
            )}

            {/* where the gloves meet */}
            {mood === "clap" && (
              <g className={a(styles.spark)}>
                <path
                  d="M60 77 L60 70.5 M54.5 78 L51 73.5 M65.5 78 L69 73.5"
                  stroke={C.white}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
            )}
          </g>
        </g>

        {/* things in the air around him, outside the body so they don't bounce with it */}
        {mood === "surprised" && (
          <g transform="translate(101 6)">
            <g className={a(styles.pop)}>
              <path d="M1.4 0 L0 11.5" stroke={C.gold} strokeWidth="3.6" strokeLinecap="round" />
              <circle cx="-0.6" cy="17" r="2.1" fill={C.gold} />
            </g>
          </g>
        )}
        {mood === "flex" && (
          <g transform="translate(113 40)">
            <g className={a(styles.twinkle)}>
              <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill={C.gold} />
            </g>
          </g>
        )}
        {mood === "sleep" &&
          [
            [92, 30, 1, styles.z1],
            [100, 22, 1.25, styles.z2],
            [108, 12, 1.5, styles.z3],
          ].map(([x, y, s, cls]) => (
            <g key={String(cls)} transform={`translate(${x} ${y}) scale(${s})`}>
              <g className={a(cls as string)}>
                <path d="M0 0 H5 L0 6 H5" fill="none" stroke={C.whistle} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          ))}
        {mood === "dance" &&
          [
            [10, 30, styles.note1],
            [106, 24, styles.note2],
          ].map(([x, y, cls]) => (
            <g key={String(cls)} transform={`translate(${x} ${y})`}>
              <g className={a(cls as string)}>
                <ellipse cx="0" cy="8" rx="2.8" ry="2.1" fill={C.white} transform="rotate(-20 0 8)" />
                <path d="M2.4 7.4 V-1.5 Q6 0 7 3.5" fill="none" stroke={C.white} strokeWidth="1.6" strokeLinecap="round" />
              </g>
            </g>
          ))}
      </g>
    </svg>
  );
}

const LABEL: Record<CoachMood, string> = {
  idle: "looking on",
  happy: "waving",
  sad: "looking sad",
  cheer: "cheering",
  think: "thinking",
  angry: "arms folded, not impressed",
  whistle: "blowing his whistle",
  clap: "clapping",
  dance: "dancing",
  flex: "flexing",
  point: "pointing",
  clipboard: "taking notes",
  surprised: "surprised",
  shrug: "shrugging",
  facepalm: "facepalming",
  sleep: "asleep",
};

function Glove({ at, r = 5.8 }: { at: [number, number]; r?: number }) {
  return <circle cx={at[0]} cy={at[1]} r={r} fill={C.white} stroke={C.gloveShade} strokeWidth="1.4" />;
}

/** An open glove laid across his eyes, fingers up toward his brow. */
function Palm({ at }: { at: [number, number] }) {
  const [x, y] = at;
  return (
    <g transform={`rotate(-24 ${x} ${y})`}>
      <ellipse cx={x} cy={y} rx="12" ry="8.6" fill={C.white} stroke={C.gloveShade} strokeWidth="1.4" />
      <path
        d={`M${x - 6} ${y - 7.6} V${y - 2.5} M${x - 1.5} ${y - 8.6} V${y - 2.8} M${x + 3} ${y - 8.2} V${y - 2.6}`}
        stroke={C.gloveShade}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </g>
  );
}

/** A clipboard held low on his left, a line writing itself on the page. */
function Clipboard({ animated }: { animated: boolean }) {
  return (
    <g transform="rotate(-8 37 84)">
      <rect x="24" y="68" width="27" height="33" rx="3" fill={C.board} stroke={C.boardEdge} strokeWidth="1.4" />
      <rect x="27" y="73" width="21" height="25" rx="1.2" fill={C.paper} />
      <rect x="32" y="66" width="11" height="5" rx="1.6" fill={C.whistleShade} />
      <path d="M30 78 H44 M30 83 H41" stroke={C.whistleShade} strokeWidth="1.6" strokeLinecap="round" />
      <path
        className={animated ? styles.write : undefined}
        d="M30 88 Q32 86 34 88 T38 88 T42 88"
        fill="none"
        stroke={C.ink}
        strokeWidth="1.5"
        strokeLinecap="round"
        pathLength={1}
      />
    </g>
  );
}

/** A mouth that opens and closes in an uneven rhythm, like speech. */
function TalkingMouth() {
  return (
    <g className={styles.talk}>
      <path d="M51 70 Q60 80 69 70 Z" fill={C.ink} />
      <ellipse cx="60" cy="74.2" rx="4.6" ry="1.8" fill={C.tongue} />
    </g>
  );
}

function Mouth({ mood, animated }: { mood: CoachMood; animated: boolean }) {
  switch (mood) {
    case "happy":
      return (
        <g>
          <path d="M49 69 Q60 83 71 69 Z" fill={C.ink} />
          <ellipse cx="60" cy="73.6" rx="5.5" ry="2" fill={C.tongue} />
        </g>
      );
    case "cheer":
    case "dance":
    case "clap":
      return (
        <g>
          <path d="M46 67 Q60 90 74 67 Z" fill={C.ink} />
          <path d="M50 67 L70 67 L69 69.6 L51 69.6 Z" fill={C.white} />
          <ellipse cx="60" cy="74.5" rx="7" ry="3" fill={C.tongue} />
        </g>
      );
    case "flex":
      return (
        <g>
          <path d="M48 68 Q60 82 72 68 Z" fill={C.ink} />
          <path d="M50.5 68 L69.5 68 L68.6 71.4 L51.4 71.4 Z" fill={C.white} />
        </g>
      );
    case "point":
      return (
        <g>
          <path d="M51 70 Q60 79 69 69 Z" fill={C.ink} />
          <ellipse cx="60.5" cy="73.4" rx="4" ry="1.6" fill={C.tongue} />
        </g>
      );
    case "sad":
      return <path d="M52 76 Q60 70 68 76" fill="none" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />;
    case "think":
      return <path d="M55 74 L67 72" fill="none" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />;
    case "clipboard":
      // concentration: a straight mouth, tongue out at the corner
      return (
        <g>
          <ellipse cx="66.5" cy="74.6" rx="2.6" ry="2.1" fill={C.tongue} />
          <path d="M53 73 Q60 75 67 72.5" fill="none" stroke={C.ink} strokeWidth="3.2" strokeLinecap="round" />
        </g>
      );
    case "surprised":
      return (
        <g>
          <ellipse cx="60" cy="74" rx="5" ry="6.2" fill={C.ink} />
          <ellipse cx="60" cy="77" rx="3" ry="1.6" fill={C.tongue} />
        </g>
      );
    case "shrug":
      return (
        <path
          d="M51 74 Q55.5 71 60 74 Q64.5 77 69 74"
          fill="none"
          stroke={C.ink}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      );
    case "facepalm":
      return <path d="M52 76 Q56 73 60 75 Q64 77 68 74" fill="none" stroke={C.ink} strokeWidth="3.2" strokeLinecap="round" />;
    case "sleep":
      return <ellipse className={animated ? styles.snore : undefined} cx="60" cy="74" rx="2.8" ry="3.4" fill={C.ink} />;
    case "angry":
      return (
        <g>
          <rect x="49" y="68" width="22" height="9" rx="3" fill={C.white} stroke={C.ink} strokeWidth="2.6" />
          <path d="M49.5 72.5 L70.5 72.5" stroke={C.ink} strokeWidth="1.6" />
          <path d="M55 68.5 V76.5 M60 68.5 V76.5 M65 68.5 V76.5" stroke={C.ink} strokeWidth="1.3" />
        </g>
      );
    case "whistle":
      return (
        // Each cheek puffs about its own centre; on a shared group they would
        // scale about the midpoint between them and slide apart instead.
        <g>
          <circle className={animated ? styles.puff : undefined} cx="41" cy="69" r="5.5" fill={C.cheek} opacity="0.9" />
          <circle className={animated ? styles.puff : undefined} cx="79" cy="69" r="5.5" fill={C.cheek} opacity="0.9" />
        </g>
      );
    default:
      // idle: a confident, lopsided smirk
      return <path d="M52 72 Q60 76.5 69 70.5" fill="none" stroke={C.ink} strokeWidth="3.2" strokeLinecap="round" />;
  }
}
