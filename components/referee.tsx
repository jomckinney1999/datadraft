/**
 * The referee on the home page's title screen — big, outlined, and built to
 * be animated.
 *
 * The sideline Ref (`sideline-cast.tsx`) is a flat 64px figure standing next
 * to a path node. This one fills the middle of a screen, so it is drawn the
 * way the rest of the art is: chunky shapes with the `night` outline, limbs
 * as outlined strokes (a wide night stroke under a narrower fill stroke), a
 * gold whistle on a turf lanyard like Coach Blitz's.
 *
 * Two poses, both always in the DOM, and the title screen's CSS swaps them
 * with `data-phase` on an ancestor (see `.title-gate` in globals.css):
 *
 *   idle — hand on hip, whistle on his chest, blinking.
 *   blow — whistle in his mouth, cheeks puffed, eyes squeezed shut, the other
 *          arm straight up, sound lines coming off the whistle.
 *
 * A pose swap rather than a tween is deliberate: that is how a cartoon does
 * it — a held pose, a snap, a squash — and the squash lives on `.ref-body`.
 * As with the rest of the illustrated cast, skin, shirt and trouser colours
 * are fixed illustration hexes; the outline and accents are theme tokens.
 */

import { c, N } from "@/components/art-kit";

const SKIN = "#C68B63";
const SKIN_SHADE = "#A8704C";
const SHIRT = "#F4F6F7";
const STRIPE = "#1D2328";
const CAP_LINE = "#D5DDE2";
const MOUSTACHE = "#4A3223";
const BLUSH = "#E8796B";
const MOUSTACHE_D =
  "M87 101 Q94 96 100 99.5 Q106 96 113 101 Q106 105 100 102 Q94 105 87 101 Z";
const TORSO =
  "M64 134 Q64 118 82 116 L118 116 Q136 118 136 134 L130 196 Q100 202 70 196 Z";

/** A limb with the art's outline: a night stroke under a narrower fill. */
function Limb({ d, fill, w }: { d: string; fill: string; w: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={N} strokeWidth={w + 7} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={fill} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

/** Upper arm in a striped short sleeve, forearm, hand. */
function Arm({
  shoulder,
  elbow,
  hand,
}: {
  shoulder: [number, number];
  elbow: [number, number];
  hand: [number, number];
}) {
  const [sx, sy] = shoulder;
  const [ex, ey] = elbow;
  const [hx, hy] = hand;
  // The sleeve covers the first 55% of the upper arm.
  const mx = Math.round((sx + (ex - sx) * 0.55) * 10) / 10;
  const my = Math.round((sy + (ey - sy) * 0.55) * 10) / 10;
  return (
    <g>
      <Limb d={`M${sx} ${sy} L${ex} ${ey} L${hx} ${hy}`} fill={SKIN} w={13} />
      <Limb d={`M${sx} ${sy} L${mx} ${my}`} fill={SHIRT} w={20} />
      <path d={`M${sx} ${sy} L${mx} ${my}`} fill="none" stroke={STRIPE} strokeWidth="5" strokeLinecap="round" />
      <circle cx={hx} cy={hy} r="9.5" fill={SKIN} stroke={N} strokeWidth="3.5" />
    </g>
  );
}

function Whistle({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* mouthpiece tube, then the round chamber the pea rattles in */}
      <rect x="-2" y="-5" width="18" height="10" rx="3.5" fill={c("gold")} stroke={N} strokeWidth="3" />
      <circle cx="20" cy="2" r="9" fill={c("gold")} stroke={N} strokeWidth="3" />
      <rect x="4" y="-5" width="6" height="3.5" rx="1" fill={N} />
      <ellipse cx="17" cy="-2.5" rx="3.6" ry="2" fill="#FFFFFF" opacity="0.7" />
    </g>
  );
}

export default function Referee({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 260"
      className={className}
      overflow="visible"
      role="img"
      aria-label="A referee with a whistle"
    >
      <defs>
        <clipPath id="gate-ref-torso">
          <path d={TORSO} />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="251" rx="54" ry="7" fill={N} opacity="0.55" />

      <g className="ref-body">
        {/* trousers and shoes */}
        <path d="M72 192 L98 192 L96 238 L78 238 Z" fill={STRIPE} stroke={N} strokeWidth="4" strokeLinejoin="round" />
        <path d="M102 192 L128 192 L122 238 L104 238 Z" fill={STRIPE} stroke={N} strokeWidth="4" strokeLinejoin="round" />
        <path d="M68 244 Q68 235 79 235 L95 235 Q100 235 100 241 Q100 248 94 248 L73 248 Q68 248 68 244 Z" fill="#101619" stroke={N} strokeWidth="3.5" />
        <path d="M132 244 Q132 235 121 235 L105 235 Q100 235 100 241 Q100 248 106 248 L127 248 Q132 248 132 244 Z" fill="#101619" stroke={N} strokeWidth="3.5" />

        {/* Arms sit behind the shirt so the shoulders read as joints. The
            right hand is on his hip in both poses; the left arm is what
            changes. */}
        <Arm shoulder={[132, 128]} elbow={[158, 152]} hand={[134, 170]} />
        <g className="pose-idle">
          <Arm shoulder={[68, 128]} elbow={[58, 160]} hand={[62, 188]} />
        </g>
        <g className="pose-blow">
          <g className="ref-signal">
            <Arm shoulder={[68, 126]} elbow={[48, 94]} hand={[46, 52]} />
          </g>
        </g>

        {/* the shirt: stripes clipped to the torso, outline on top */}
        <path d={TORSO} fill={SHIRT} />
        <g clipPath="url(#gate-ref-torso)" fill={STRIPE}>
          {[74, 87, 100, 113, 126].map((x) => (
            <rect key={x} x={x - 3.5} y="108" width="7" height="100" />
          ))}
        </g>
        <path d={TORSO} fill="none" stroke={N} strokeWidth="4" strokeLinejoin="round" />
        <path d="M88 117 L100 129 L112 117" fill="none" stroke={STRIPE} strokeWidth="5" strokeLinejoin="round" />

        {/* idle: the whistle hangs on his chest */}
        <g className="pose-idle">
          <path d="M86 118 Q98 150 106 146" fill="none" stroke={c("turf")} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M114 118 Q112 140 106 146" fill="none" stroke={c("turf")} strokeWidth="3.5" strokeLinecap="round" />
          <Whistle x={96} y={148} scale={0.8} />
        </g>

        {/* neck, ears, head */}
        <rect x="91" y="104" width="18" height="16" fill={SKIN} stroke={N} strokeWidth="3.5" />
        <circle cx="70" cy="88" r="7" fill={SKIN} stroke={N} strokeWidth="3.5" />
        <circle cx="130" cy="88" r="7" fill={SKIN} stroke={N} strokeWidth="3.5" />
        <circle cx="100" cy="84" r="30" fill={SKIN} stroke={N} strokeWidth="4" />
        <circle cx="100" cy="93" r="4.5" fill={SKIN_SHADE} />

        {/* idle face: eyes that blink, a calm moustache, a small smile */}
        <g className="pose-idle">
          <g className="ref-blink">
            <ellipse cx="89" cy="85" rx="4" ry="5" fill={N} />
            <ellipse cx="111" cy="85" rx="4" ry="5" fill={N} />
            <circle cx="90.5" cy="83" r="1.4" fill="#FFFFFF" />
            <circle cx="112.5" cy="83" r="1.4" fill="#FFFFFF" />
          </g>
          <path d="M82 75 Q89 71 95 75 M105 75 Q111 71 118 75" fill="none" stroke={N} strokeWidth="3" strokeLinecap="round" />
          <path d="M93 106 Q100 110 107 106" fill="none" stroke={N} strokeWidth="2.6" strokeLinecap="round" />
        </g>
        <path d={MOUSTACHE_D} fill={MOUSTACHE} />

        {/* blow face: puffed cheeks, eyes squeezed, whistle in his mouth */}
        <g className="pose-blow">
          {/* Cheeks bulge out past the face, the way a cartoon blows: the
              outlined cheeks, then a disc of skin just inside the head's
              outline over them, so only the bulge keeps its outline. */}
          <g className="ref-cheeks">
            <circle cx="72" cy="98" r="12" fill={SKIN} stroke={N} strokeWidth="3.5" />
            <circle cx="128" cy="98" r="12" fill={SKIN} stroke={N} strokeWidth="3.5" />
          </g>
          <circle cx="100" cy="84" r="28" fill={SKIN} />
          <circle cx="100" cy="93" r="4.5" fill={SKIN_SHADE} />
          <ellipse cx="75" cy="100" rx="6" ry="3.8" fill={BLUSH} opacity="0.75" />
          <ellipse cx="125" cy="100" rx="6" ry="3.8" fill={BLUSH} opacity="0.75" />
          <path d={MOUSTACHE_D} fill={MOUSTACHE} />
          <path d="M83 82 L92 86 L83 90 M117 82 L108 86 L117 90" fill="none" stroke={N} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M80 72 L95 77 M120 72 L105 77" fill="none" stroke={N} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M122 114 Q118 124 110 120" fill="none" stroke={c("turf")} strokeWidth="3.5" strokeLinecap="round" />
          <g className="ref-whistle">
            <Whistle x={98} y={106} />
          </g>
          {/* sound coming off the whistle */}
          <g className="ref-sound" fill="none" stroke={c("gold")} strokeWidth="4.5" strokeLinecap="round">
            <path d="M136 98 Q142 108 136 118" />
            <path d="M146 92 Q155 108 146 124" />
            <path d="M156 86 Q168 108 156 130" />
          </g>
        </g>

        {/* the white cap of the referee in charge */}
        <path d="M68 74 Q68 44 100 44 Q132 44 132 74 Z" fill="#FFFFFF" stroke={N} strokeWidth="4" strokeLinejoin="round" />
        <path d="M100 46 L100 72 M85 49 Q79 60 79 72 M115 49 Q121 60 121 72" fill="none" stroke={CAP_LINE} strokeWidth="2" />
        <path d="M64 74 Q100 65 146 76 Q152 83 141 85 Q100 76 66 81 Q60 78 64 74 Z" fill="#FFFFFF" stroke={N} strokeWidth="4" strokeLinejoin="round" />
        <circle cx="100" cy="44" r="3.5" fill="#FFFFFF" stroke={N} strokeWidth="2.5" />
      </g>
    </svg>
  );
}
