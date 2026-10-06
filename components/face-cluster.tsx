import type { FeaturedPlayer } from "@/lib/question-players";
import { teamAccent } from "@/lib/team-colors";
import Headshot from "@/components/headshot";

/**
 * Two or three headshots, overlapping, each haloed in its team's colour.
 * The first is largest; the rest step down and tuck behind it. Names sit
 * underneath so nobody has to guess who they are looking at.
 */
export function FaceCluster({
  players,
  size = 88,
  names = true,
  className = "",
}: {
  players: FeaturedPlayer[];
  /** Diameter of the lead face in px; the others scale from it. */
  size?: number;
  names?: boolean;
  className?: string;
}) {
  if (players.length === 0) return null;
  const sizes = [size, Math.round(size * 0.82), Math.round(size * 0.7)];
  const overlap = Math.round(size * 0.28);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="flex items-end">
        {players.map((p, i) => (
          <span
            key={p.name}
            className="face-ring face-float relative"
            style={{
              ["--ring" as string]: teamAccent(p.team),
              marginLeft: i === 0 ? 0 : -overlap,
              zIndex: players.length - i,
              animationDelay: `${i * 0.9}s`,
            }}
          >
            <Headshot name={p.name} src={p.url} size={sizes[i] ?? sizes[2]} />
          </span>
        ))}
      </div>
      {names && (
        // Each name stays on one line with its team, and the players sit
        // apart: with only a space between them, "MIA A.J. BROWN" read as
        // one name.
        <p className="flex max-w-[18rem] flex-wrap justify-center gap-x-3 gap-y-0.5 text-center font-mono text-[10px] uppercase leading-relaxed tracking-wider text-ink-muted">
          {players.map((p) => (
            <span key={p.name} className="whitespace-nowrap">
              <span className="text-ink-soft">{p.name}</span>
              <span className="text-ink-muted"> · {p.team}</span>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
