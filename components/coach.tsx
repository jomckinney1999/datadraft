// Coach Blitz — the SQL Sports mascot. A football with a coach's temper.
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
// Every part that moves is its own <g> so cast.module.css can animate it:
// blink, glance, breathe for idle; a squash-and-stretch jump for cheer; crossed
// arms and a tapping cleat for angry. The API is unchanged from the static
// version — `mood`, `size`, `className` — so every existing call site picked
// up the redesign without edits. Pass `animated={false}` for a still pose.
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
  | "whistle";

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
};

type Arm = { d: string; hand: [number, number] };
type Pose = { l: Arm; r: Arm; front: boolean };

// Shoulders sit just inside the body edge at y≈70. Arms drawn behind the body
// are hidden from the shoulder to the edge, which is what attaches them;
// poses that cross the body (think, angry, whistle) are drawn in front.
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
};

const BROWS: Record<CoachMood, [string, string]> = {
  idle: ["M37 33 L54 36", "M66 36 L83 33"],
  happy: ["M37 32 Q45.5 26 54 31", "M66 31 Q74.5 26 83 32"],
  cheer: ["M37 30 Q45.5 23 54 29", "M66 29 Q74.5 23 83 30"],
  sad: ["M38 36 L54 30", "M66 30 L82 36"],
  think: ["M37 34 L54 34", "M66 31 Q74.5 24 83 29"],
  angry: ["M36 30 L56 40", "M64 40 L84 30"],
  whistle: ["M37 34 L55 38", "M65 38 L83 34"],
};

// Pupil centres. Idle converges them slightly, which reads as friendlier.
const PUPILS: Record<CoachMood, [[number, number], [number, number], number]> = {
  idle: [[49, 48], [71, 48], 6.5],
  happy: [[48, 47], [72, 47], 6.5],
  cheer: [[48, 47], [72, 47], 6.5],
  sad: [[47, 51], [73, 51], 6.5],
  think: [[51, 43], [75, 43], 6.2],
  angry: [[49, 48], [71, 48], 5.4],
  whistle: [[49, 48], [71, 48], 6],
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
};

const BODY_ANIM: Record<CoachMood, string> = {
  idle: styles.breathe,
  happy: styles.bounce,
  cheer: styles.jump,
  sad: styles.droop,
  think: styles.tilt,
  angry: styles.huff,
  whistle: styles.breathe,
};

export default function Coach({
  mood = "idle",
  size = 120,
  className = "",
  animated = true,
}: {
  mood?: CoachMood;
  size?: number;
  className?: string;
  animated?: boolean;
}) {
  const a = (cls: string | undefined) => (animated ? cls : undefined);
  const pose = POSES[mood];
  const [browL, browR] = BROWS[mood];
  const [pl, pr, pupilR] = PUPILS[mood];
  const lids = LIDS[mood];
  const eyesClosed = mood === "cheer";

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
      <g className={a(mood === "cheer" ? styles.wiggleL : undefined)}>
        <path
          d={pose.l.d}
          fill="none"
          stroke={C.arm}
          strokeWidth="9.5"
          strokeLinecap="round"
        />
        <Glove at={pose.l.hand} />
      </g>
      <g
        className={a(
          mood === "happy"
            ? styles.waveR
            : mood === "cheer"
              ? styles.wiggleR
              : undefined,
        )}
      >
        <path
          d={pose.r.d}
          fill="none"
          stroke={C.arm}
          strokeWidth="9.5"
          strokeLinecap="round"
        />
        <Glove at={pose.r.hand} />
      </g>
    </>
  );

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      overflow="visible"
      className={`${styles.figure} ${animated ? styles.animated : ""} ${className}`}
      role="img"
      aria-label={`Coach Blitz looking ${mood}`}
    >
      {/* ground shadow stays put while the body moves */}
      <g className={a(mood === "cheer" ? styles.shadowJump : undefined)}>
        <ellipse cx="60" cy="113" rx="30" ry="4.2" fill="#000" opacity="0.3" />
      </g>

      <g className={a(BODY_ANIM[mood])}>
        {/* cleats peek out beneath the ball */}
        <g className={a(mood === "angry" ? styles.tap : undefined)}>
          <path
            d="M34 107 Q34 101 42 101 L50 101 Q57 101 57 107 Q57 111.5 51 111.5 L40 111.5 Q34 111.5 34 107 Z"
            fill={C.cleat}
          />
          <path d="M36.5 110 L54.5 110" stroke={C.cleatSole} strokeWidth="1.8" strokeLinecap="round" />
        </g>
        <path
          d="M86 107 Q86 101 78 101 L70 101 Q63 101 63 107 Q63 111.5 69 111.5 L80 111.5 Q86 111.5 86 107 Z"
          fill={C.cleat}
        />
        <path d="M83.5 110 L65.5 110" stroke={C.cleatSole} strokeWidth="1.8" strokeLinecap="round" />

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
        {mood !== "whistle" && mood !== "angry" && (
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
        {eyesClosed ? (
          <g>
            <path d="M38 49 Q47 40 56 49" fill="none" stroke={C.ink} strokeWidth="3.6" strokeLinecap="round" />
            <path d="M64 49 Q73 40 82 49" fill="none" stroke={C.ink} strokeWidth="3.6" strokeLinecap="round" />
          </g>
        ) : (
          <g className={a(styles.blink)}>
            <ellipse cx="47" cy="47" rx="10.5" ry="12" fill={C.white} />
            <ellipse cx="73" cy="47" rx="10.5" ry="12" fill={C.white} />
            <g className={a(mood === "idle" ? styles.look : undefined)}>
              <circle cx={pl[0]} cy={pl[1]} r={pupilR} fill={C.ink} />
              <circle cx={pr[0]} cy={pr[1]} r={pupilR} fill={C.ink} />
              <circle cx={pl[0] + 1.9} cy={pl[1] - 2.3} r="2" fill={C.white} />
              <circle cx={pr[0] + 1.9} cy={pr[1] - 2.3} r="2" fill={C.white} />
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

        {mood === "sad" && (
          <path d="M40 57 Q37 62 40 64.5 Q43 62 40 57 Z" fill={C.tear} />
        )}

        <Mouth mood={mood} animated={animated} />

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
      </g>
    </svg>
  );
}

function Glove({ at }: { at: [number, number] }) {
  return (
    <circle
      cx={at[0]}
      cy={at[1]}
      r="5.8"
      fill={C.white}
      stroke={C.gloveShade}
      strokeWidth="1.4"
    />
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
      return (
        <g>
          <path d="M46 67 Q60 90 74 67 Z" fill={C.ink} />
          <path d="M50 67 L70 67 L69 69.6 L51 69.6 Z" fill={C.white} />
          <ellipse cx="60" cy="74.5" rx="7" ry="3" fill={C.tongue} />
        </g>
      );
    case "sad":
      return (
        <path d="M52 76 Q60 70 68 76" fill="none" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />
      );
    case "think":
      return (
        <path d="M55 74 L67 72" fill="none" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />
      );
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
      return (
        <path d="M52 72 Q60 76.5 69 70.5" fill="none" stroke={C.ink} strokeWidth="3.2" strokeLinecap="round" />
      );
  }
}
