// Playbook styles: the three learning-experience modes, plus the onboarding
// quiz that sorts a learner into one. The lesson player reads the chosen
// style from progress and adapts theory depth, pacing, and hints.

export type PlaybookStyle = "film-room" | "gunslinger" | "dual-threat";

export type StyleDef = {
  id: PlaybookStyle;
  name: string;
  tagline: string;
  description: string;
  changes: string[];
  coachLine: string;
};

export const STYLES: StyleDef[] = [
  {
    id: "film-room",
    name: "Film Room General",
    tagline: "Study the playbook. Master it. Then execute.",
    description:
      "You want to understand the scheme before you run it. Every lesson opens with the full chalkboard session — concepts, worked examples, and extra film — before you take a single snap.",
    changes: [
      "Full chalkboard theory before every drive",
      "Bonus film-study cards with deeper examples",
      "Hints always visible on SQL drills",
    ],
    coachLine:
      "A general sees the whole field before the snap. We'll watch the film together, then you'll execute like you wrote the playbook yourself.",
  },
  {
    id: "gunslinger",
    name: "Gunslinger",
    tagline: "Hand me the ball. I'll figure it out in the pocket.",
    description:
      "You learn by doing — reps over reading. Lessons skip the lecture and throw you straight into drills. Theory shows up only where it earns its place: in the feedback after each play.",
    changes: [
      "Straight to the drills — no chalkboard lecture",
      "Concept questions trimmed; more reps per minute",
      "Hints tucked away until you ask for them",
    ],
    coachLine:
      "Some players learn in the film room. You learn with the ball in your hands. Take the snap — I'll coach you between plays.",
  },
  {
    id: "dual-threat",
    name: "Dual-Threat",
    tagline: "Read the defense AND take off running.",
    description:
      "You want both: enough theory to know why, enough reps to make it stick. A quick chalkboard walkthrough, then a balanced mix of concept checks and hands-on SQL.",
    changes: [
      "Quick chalkboard walkthrough before each drive",
      "The full balanced mix of concepts and drills",
      "Hints visible on SQL drills",
    ],
    coachLine:
      "Pocket presence and wheels — the modern game. We'll walk the scheme, then run it live. Best of both worlds.",
  },
];

export function getStyle(id: PlaybookStyle | null | undefined): StyleDef {
  return STYLES.find((s) => s.id === id) ?? STYLES[2]; // default dual-threat
}

export type QuizQuestion = {
  prompt: string;
  options: { label: string; style: PlaybookStyle }[];
};

export const QUIZ: QuizQuestion[] = [
  {
    prompt:
      "First day at the facility, rookie. Where do you head?",
    options: [
      {
        label: "The film room — I want to understand the scheme before I run it",
        style: "film-room",
      },
      {
        label: "Straight to the practice field — hand me the ball",
        style: "gunslinger",
      },
      {
        label: "Quick walkthrough of the play, then give me reps",
        style: "dual-threat",
      },
    ],
  },
  {
    prompt: "How do you learn a new play best?",
    options: [
      {
        label: "Read the whole playbook page — every route, every read",
        style: "film-room",
      },
      {
        label: "Run it. Mess it up. Run it again until it clicks",
        style: "gunslinger",
      },
      {
        label: "Skim the diagram, then drill it a few times",
        style: "dual-threat",
      },
    ],
  },
  {
    prompt: "Your query throws an error. What's your first move?",
    options: [
      {
        label: "Go back to the concept — I want to know WHY it broke",
        style: "film-room",
      },
      {
        label: "Tweak it and re-run. And again. It'll work",
        style: "gunslinger",
      },
      {
        label: "Compare against a worked example, then adjust",
        style: "dual-threat",
      },
    ],
  },
];

export function scoreQuiz(answers: PlaybookStyle[]): PlaybookStyle {
  const tally: Record<PlaybookStyle, number> = {
    "film-room": 0,
    gunslinger: 0,
    "dual-threat": 0,
  };
  answers.forEach((a) => {
    tally[a] += 1;
  });
  const max = Math.max(tally["film-room"], tally.gunslinger, tally["dual-threat"]);
  const leaders = (Object.keys(tally) as PlaybookStyle[]).filter(
    (k) => tally[k] === max,
  );
  // A split vote is the definition of wanting balance.
  return leaders.length === 1 ? leaders[0] : "dual-threat";
}
