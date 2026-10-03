import type { Metadata } from "next";
import ArcadeGames from "@/components/arcade-games";

export const metadata: Metadata = {
  title: "The Arcade — DataDraft",
  description:
    "Prep games between drives: Pattern Call, Foul Call, Film Room Match, the Two-Minute Drill, and the Extra Point. No timeouts, pays scouting tickets.",
};

export default function ArcadePage() {
  return <ArcadeGames />;
}
