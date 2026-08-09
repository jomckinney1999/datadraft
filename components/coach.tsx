// Coach Blitz — the SQL Sports mascot. A football wearing a coach's headset.
// Pure inline SVG so moods can swap without image assets.

export type CoachMood = "idle" | "happy" | "sad" | "cheer" | "think";

export default function Coach({
  mood = "idle",
  size = 120,
  className = "",
}: {
  mood?: CoachMood;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Coach Blitz looking ${mood}`}
    >
      {/* cheer arms — behind the ball */}
      {mood === "cheer" && (
        <g stroke="#8a5a2b" strokeWidth="7" strokeLinecap="round">
          <path d="M30 62 Q16 48 14 34" fill="none" />
          <path d="M90 62 Q104 48 106 34" fill="none" />
        </g>
      )}
      {mood !== "cheer" && (
        <g stroke="#8a5a2b" strokeWidth="7" strokeLinecap="round">
          <path d="M32 66 Q20 74 16 84" fill="none" />
          <path d="M88 66 Q100 74 104 84" fill="none" />
        </g>
      )}

      {/* football body */}
      <ellipse
        cx="60"
        cy="60"
        rx="34"
        ry="44"
        fill="#a5672f"
        stroke="#7c4a1e"
        strokeWidth="3"
      />
      <ellipse cx="52" cy="52" rx="26" ry="36" fill="#b3743a" opacity="0.55" />

      {/* laces up top */}
      <line x1="60" y1="20" x2="60" y2="38" stroke="#f4ede2" strokeWidth="3" strokeLinecap="round" />
      {[24, 29, 34].map((y) => (
        <line
          key={y}
          x1="54"
          y1={y}
          x2="66"
          y2={y}
          stroke="#f4ede2"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ))}

      {/* headset: band + earcups + mic */}
      <path
        d="M28 52 Q60 24 92 52"
        fill="none"
        stroke="#1e2533"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="28" cy="56" r="7" fill="#1e2533" stroke="#4FD1C5" strokeWidth="2" />
      <circle cx="92" cy="56" r="7" fill="#1e2533" stroke="#4FD1C5" strokeWidth="2" />
      <path d="M34 60 Q42 74 52 76" fill="none" stroke="#1e2533" strokeWidth="3" />
      <circle cx="53" cy="76" r="3.5" fill="#4FD1C5" />

      {/* eyes */}
      {mood === "sad" ? (
        <g>
          <path d="M44 56 q5 -5 10 0" fill="none" stroke="#141820" strokeWidth="3" strokeLinecap="round" />
          <path d="M66 56 q5 -5 10 0" fill="none" stroke="#141820" strokeWidth="3" strokeLinecap="round" />
        </g>
      ) : mood === "happy" || mood === "cheer" ? (
        <g>
          <path d="M44 54 q5 6 10 0" fill="none" stroke="#141820" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M66 54 q5 6 10 0" fill="none" stroke="#141820" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <circle cx="49" cy="54" r="4.5" fill="#141820" />
          <circle cx="71" cy="54" r="4.5" fill="#141820" />
          <circle cx="50.5" cy="52.5" r="1.5" fill="#f4ede2" />
          <circle cx="72.5" cy="52.5" r="1.5" fill="#f4ede2" />
        </g>
      )}

      {/* brows for think */}
      {mood === "think" && (
        <g stroke="#141820" strokeWidth="3" strokeLinecap="round">
          <line x1="43" y1="45" x2="54" y2="47" />
          <line x1="66" y1="47" x2="77" y2="45" />
        </g>
      )}

      {/* mouth */}
      {mood === "cheer" ? (
        <path d="M50 66 q10 12 20 0 q-10 6 -20 0" fill="#141820" />
      ) : mood === "happy" ? (
        <path d="M50 66 q10 9 20 0" fill="none" stroke="#141820" strokeWidth="3.5" strokeLinecap="round" />
      ) : mood === "sad" ? (
        <path d="M51 71 q9 -7 18 0" fill="none" stroke="#141820" strokeWidth="3.5" strokeLinecap="round" />
      ) : mood === "think" ? (
        <line x1="53" y1="68" x2="66" y2="68" stroke="#141820" strokeWidth="3.5" strokeLinecap="round" />
      ) : (
        <path d="M52 67 q8 5 16 0" fill="none" stroke="#141820" strokeWidth="3.5" strokeLinecap="round" />
      )}

      {/* legs + cleats */}
      <g stroke="#8a5a2b" strokeWidth="7" strokeLinecap="round">
        <line x1="50" y1="102" x2="48" y2="112" />
        <line x1="70" y1="102" x2="72" y2="112" />
      </g>
      <ellipse cx="46" cy="114" rx="7" ry="3.5" fill="#1e2533" />
      <ellipse cx="74" cy="114" rx="7" ry="3.5" fill="#1e2533" />
    </svg>
  );
}
