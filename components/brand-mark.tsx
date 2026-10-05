/**
 * The DD monogram, and the logo that shrinks into it.
 *
 * The mark is traced from the supplied artwork (2026-10-05): a white D behind,
 * a turf D in front whose stem folds down into its bowl, the two kept apart by
 * a channel of empty space rather than an outline, so it sits on any
 * background. Coordinates are the source image's pixels, cropped by the
 * viewBox. The white D is the wordmark's own `--pop-text` and the green one is
 * `--c-turf`, so "Data" and "Draft" and the two Ds are the same colours.
 *
 * `BrandLogo` is the wordmark that becomes the mark: with `compact` on, the
 * "ata" and "raft" fold away until the two capitals stand side by side, then
 * they hand over to the monogram. The landing page's floating bar turns it on
 * once you scroll (components/site-nav.tsx). The motion is CSS (`.brand-*` in
 * globals.css) and is off under reduced motion.
 */

const WHITE_D =
  "M224 218 H448 L539 308 H457 L425 276 H287 V532 L363 483 V335 L424 395 V511 L330 580 H224 Z";

const GREEN_D =
  "M372 324 H583 L665 406 V594 L586 673 H334 V598 L480 481 V396 H542 V507 L401 620 H556 L603 573 V425 L558 380 H428 Z";

export function DDMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="224 218 441 455" className={className} aria-hidden focusable="false">
      <path d={WHITE_D} fill="rgb(var(--pop-text))" />
      <path d={GREEN_D} fill="rgb(var(--c-turf))" />
    </svg>
  );
}

export default function BrandLogo({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={`brand-logo ${className}`} data-compact={compact ? "true" : "false"}>
      <span className="brand-word font-display text-lg font-bold tracking-tight text-pop">
        D
        <span className="brand-tail">
          <span>ata</span>
        </span>
        <span className="text-turf">
          D
          <span className="brand-tail">
            <span>raft</span>
          </span>
        </span>
      </span>
      <DDMark className="brand-dd h-7 w-auto" />
    </span>
  );
}
