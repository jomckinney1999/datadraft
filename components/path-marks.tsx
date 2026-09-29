/**
 * Small marks on the course path — a chest and an end zone.
 * Drawn, not emoji, so they sit with the nodes.
 */

export function PathChest({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden>
      <path
        d="M8 20h32v18a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V20z"
        fill="currentColor"
        opacity="0.25"
      />
      <path
        d={open ? "M6 20h36l-4-8H10L6 20z" : "M8 18h32l-3-7H11l-3 7z"}
        fill="currentColor"
        opacity="0.9"
      />
      <rect x="10" y="22" width="28" height="16" rx="2" fill="currentColor" />
      <rect x="21" y="22" width="6" height="16" fill="rgb(var(--c-night))" opacity="0.35" />
      <circle cx="24" cy="30" r="2.2" fill="rgb(var(--c-night))" />
    </svg>
  );
}

export function PathFlag({ won }: { won: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden>
      <path
        d="M16 40V10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d={won ? "M16 12h18l-4 6 4 6H16z" : "M16 12h16l-3 5 3 5H16z"}
        fill="currentColor"
      />
      {won && (
        <path
          d="M24 34l1.4 2.8 3.1.4-2.2 2.2.5 3.1L24 41l-2.8 1.5.5-3.1-2.2-2.2 3.1-.4z"
          fill="currentColor"
        />
      )}
    </svg>
  );
}
