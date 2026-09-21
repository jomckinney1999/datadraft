// The sideline cast — people who stand beside the path, the way a Duolingo
// unit has characters waiting by its chests. Same flat style and 120-unit box
// as Coach Blitz so they read as one world.
//
//   Rookie — helmet on, tosses a football up and watches it come down.
//   Ref    — striped shirt, whistle, signals touchdown every few seconds.
//
// Skin tone varies by `tone`, chosen deterministically from the character's
// position on the path so a long board shows a mixed sideline without the
// cast reshuffling on every render.
//
// Motion lives in cast.module.css and stops entirely under reduced motion.
// `--cast-delay` staggers instances so a row of them never moves in lockstep.

import styles from "./cast.module.css";

const INK = "#1C1411";
const SKIN = ["#8C5A3C", "#E0A882", "#5E3A26", "#C68B63"];
const CLEAT = "#1B262C";

export type CastKind = "rookie" | "ref";

export default function SidelineCast({
  kind,
  tone = 0,
  size = 64,
  delay = 0,
  animated = true,
}: {
  kind: CastKind;
  tone?: number;
  size?: number;
  /** Seconds; offsets this instance's loops from its neighbours. */
  delay?: number;
  animated?: boolean;
}) {
  const skin = SKIN[((tone % SKIN.length) + SKIN.length) % SKIN.length];
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      overflow="visible"
      className={`${styles.figure} ${animated ? styles.animated : ""}`}
      style={{ ["--cast-delay" as string]: `${-delay}s` }}
      role="img"
      aria-label={kind === "rookie" ? "A rookie tossing a football" : "A referee"}
    >
      {kind === "rookie" ? (
        <Rookie skin={skin} animated={animated} />
      ) : (
        <Ref skin={skin} animated={animated} />
      )}
    </svg>
  );
}

function Shadow() {
  return <ellipse cx="60" cy="113" rx="24" ry="4" fill="#000" opacity="0.3" />;
}

function Rookie({ skin, animated }: { skin: string; animated: boolean }) {
  const a = (cls: string) => (animated ? cls : undefined);
  const jersey = "#1CB0F6";
  const helmet = "#58CC02";
  const helmetShade = "#3F9A00";
  const pants = "#EEF2F4";
  const mask = "#D7DEE2";

  return (
    <>
      <Shadow />
      <g className={a(styles.breathe)}>
        {/* legs, socks, cleats */}
        <rect x="47" y="85" width="12" height="15" rx="3" fill={pants} />
        <rect x="61" y="85" width="12" height="15" rx="3" fill={pants} />
        <rect x="48" y="97" width="10" height="8" fill={jersey} />
        <rect x="62" y="97" width="10" height="8" fill={jersey} />
        <path d="M44 108 Q44 104 49 104 L58 104 Q61 104 61 108 Q61 111 58 111 L47 111 Q44 111 44 108 Z" fill={CLEAT} />
        <path d="M76 108 Q76 104 71 104 L62 104 Q59 104 59 108 Q59 111 62 111 L73 111 Q76 111 76 108 Z" fill={CLEAT} />

        {/* jersey with shoulder pads */}
        <path d="M38 64 Q37 54 47 53 L73 53 Q83 54 82 64 L78 89 Q60 92 42 89 Z" fill={jersey} />
        <text
          x="60"
          y="81"
          textAnchor="middle"
          fontSize="17"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#FFFFFF"
        >
          1
        </text>

        {/* neck and head */}
        <rect x="55" y="47" width="10" height="8" fill={skin} />
        <circle cx="60" cy="38" r="13" fill={skin} />
        <g className={a(styles.blink)}>
          <g className={a(styles.watch)}>
            <circle cx="55" cy="37" r="2.6" fill={INK} />
            <circle cx="65" cy="37" r="2.6" fill={INK} />
          </g>
        </g>
        <path d="M55.5 42 Q60 45.5 64.5 42" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />

        {/* helmet shell over the head, face open at the front */}
        <path
          d="M40 40 Q39 17 60 16 Q81 17 80 40 L80 45 Q76 45 74 40 L74 34 Q60 30 46 34 L46 40 Q44 45 40 45 Z"
          fill={helmet}
        />
        <path d="M74 34 Q78 25 74 19 Q80 23 80 40 L80 45 Q76 45 74 40 Z" fill={helmetShade} />
        <path d="M57.5 16.3 Q60 16 62.5 16.3 L62 31.8 Q60 31.5 58 31.8 Z" fill="#FFFFFF" />
        <ellipse cx="50" cy="23" rx="6" ry="3.2" fill="#FFFFFF" opacity="0.35" transform="rotate(-28 50 23)" />
        <path
          d="M46 40 L46 47 M74 40 L74 47 M47 46.5 Q60 52 73 46.5 M48.5 50.5 Q60 55.5 71.5 50.5 M60 49 L60 54"
          fill="none"
          stroke={mask}
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* arms cradle the ball; they lift slightly on the toss */}
        <g className={a(styles.tossArms)}>
          <path d="M41 58 L35 67" stroke={jersey} strokeWidth="9" strokeLinecap="round" />
          <path d="M35 67 Q38 74 47 72" fill="none" stroke={skin} strokeWidth="7.5" strokeLinecap="round" />
          <circle cx="48" cy="71.5" r="4.8" fill={skin} />
          <path d="M79 58 L85 67" stroke={jersey} strokeWidth="9" strokeLinecap="round" />
          <path d="M85 67 Q82 74 73 72" fill="none" stroke={skin} strokeWidth="7.5" strokeLinecap="round" />
          <circle cx="72" cy="71.5" r="4.8" fill={skin} />
        </g>

        {/* the ball: rises, spins, comes back to the hands */}
        <g className={a(styles.toss)}>
          <ellipse cx="60" cy="66" rx="9" ry="5.4" fill="#C0652B" transform="rotate(-25 60 66)" />
          <path d="M56.5 66.6 L63.5 64.6" stroke="#FFF6EA" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M58.3 64.3 L59 66.6 M61.1 63.5 L61.8 65.8" stroke="#FFF6EA" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </g>
    </>
  );
}

function Ref({ skin, animated }: { skin: string; animated: boolean }) {
  const a = (cls: string) => (animated ? cls : undefined);
  const shirt = "#F4F6F7";
  const black = "#1D2328";

  // Hanging arm, drawn pointing down from the shoulder; the signal animation
  // swings it up about that shoulder.
  const arm = (side: "l" | "r") => {
    const s = side === "l" ? { x: 41, e: 37.5, h: 36 } : { x: 79, e: 82.5, h: 84 };
    return (
      <>
        <path d={`M${s.x} 58 L${s.e} 66`} stroke={shirt} strokeWidth="9" strokeLinecap="round" />
        <path d={`M${s.x} 58 L${s.e} 66`} stroke={black} strokeWidth="2.4" strokeLinecap="round" />
        <path d={`M${s.e} 66 L${s.h} 79`} stroke={skin} strokeWidth="7.5" strokeLinecap="round" />
        <circle cx={s.h} cy="81" r="4.8" fill={skin} />
      </>
    );
  };

  return (
    <>
      <Shadow />
      <g className={a(styles.breathe)}>
        {/* trousers and shoes */}
        <path d="M47 86 L58 86 L58 104 L48 104 Z" fill={black} />
        <path d="M62 86 L73 86 L72 104 L62 104 Z" fill={black} />
        <path d="M44 108 Q44 104 49 104 L58 104 Q61 104 61 108 Q61 111 58 111 L47 111 Q44 111 44 108 Z" fill={CLEAT} />
        <path d="M76 108 Q76 104 71 104 L62 104 Q59 104 59 108 Q59 111 62 111 L73 111 Q76 111 76 108 Z" fill={CLEAT} />

        {/* arms behind the shirt so the shoulders read as joints */}
        <g className={a(styles.signalL)}>{arm("l")}</g>
        <g className={a(styles.signalR)}>{arm("r")}</g>

        {/* striped shirt */}
        <path d="M38 64 Q37 54 47 53 L73 53 Q83 54 82 64 L78 89 Q60 92 42 89 Z" fill={shirt} />
        <g fill={black}>
          <rect x="43" y="55" width="4" height="34" />
          <rect x="50.5" y="54" width="4" height="36" />
          <rect x="58" y="54" width="4" height="37" />
          <rect x="65.5" y="54" width="4" height="36" />
          <rect x="73" y="55" width="4" height="34" />
        </g>
        <path d="M54 53 L60 60 L66 53" fill="none" stroke={black} strokeWidth="2.5" strokeLinejoin="round" />

        {/* whistle on its cord */}
        <path d="M52 54 Q60 64 68 54" fill="none" stroke="#DCE4E8" strokeWidth="1.6" />
        <rect x="56.5" y="62.5" width="8" height="4.5" rx="2.2" fill="#DCE4E8" />

        {/* head, cap, moustache */}
        <rect x="55" y="46" width="10" height="9" fill={skin} />
        <circle cx="46" cy="37" r="3" fill={skin} />
        <circle cx="74" cy="37" r="3" fill={skin} />
        <circle cx="60" cy="36" r="14" fill={skin} />
        <g className={a(styles.blink)}>
          <circle cx="55" cy="39.5" r="2.4" fill={INK} />
          <circle cx="65" cy="39.5" r="2.4" fill={INK} />
        </g>
        <path
          d="M53.5 45 Q57 42.8 60 44.4 Q63 42.8 66.5 45 Q63 47 60 45.6 Q57 47 53.5 45 Z"
          fill="#4A3223"
        />
        <path d="M57.5 48.2 Q60 49.8 62.5 48.2" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M45 33 Q46 19 60 19 Q74 19 75 33 Z" fill={black} />
        <path d="M44 33 Q60 30 80 34 Q82 36.5 78 37 Q60 34.5 45 36 Z" fill={black} />
        <path
          d="M60 19.5 L60 32.5 M52 21 Q49 27 49 32.5 M68 21 Q71 27 71 32.5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          opacity="0.8"
        />
        <circle cx="60" cy="19.5" r="1.6" fill="#FFFFFF" />
      </g>
    </>
  );
}
