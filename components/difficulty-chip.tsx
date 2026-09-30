/**
 * Easy / Medium / Hard, coloured the same way everywhere.
 *
 * Shared by the question bank and the project catalogue so a learner learns
 * the colour once. Green is not "correct" here and gold is not "reward" —
 * they are a ramp, and the ramp only reads as one if it is identical on both
 * surfaces.
 */

export type ChipDifficulty = "easy" | "medium" | "hard";

const STYLE: Record<ChipDifficulty, string> = {
  easy: "border-turf/50 bg-turf/10 text-turf",
  medium: "border-ice/50 bg-ice/10 text-ice",
  hard: "border-gold/50 bg-gold/10 text-gold",
};

const LABEL: Record<ChipDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export default function DifficultyChip({
  difficulty,
  className = "",
}: {
  difficulty: ChipDifficulty;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${STYLE[difficulty]} ${className}`}
    >
      {LABEL[difficulty]}
    </span>
  );
}
