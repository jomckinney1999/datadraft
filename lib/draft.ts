// The SQLSports Draft: the course-selection ceremony. One track is live
// today; future tracks appear on the board as prospects "declaring next
// season" so the roadmap reads like a real draft class.

export type Track = {
  id: string;
  name: string;
  classOf: string;
  status: "live" | "declaring";
  scoutingReport: string;
  skills: string[];
};

export const TRACKS: Track[] = [
  {
    id: "rookie-season",
    name: "Analyst Fundamentals: Rookie Season",
    classOf: "Available now",
    status: "live",
    scoutingReport:
      "The consensus #1 overall. Zero to job-ready fundamentals on real sports data: SQL first, then Python, statistics, visualization, Git, and R.",
    skills: ["SQL", "Python", "Statistics", "Charts", "Git", "R"],
  },
  {
    id: "contender-season",
    name: "Contender Season: Joins & Window Functions",
    classOf: "Declaring next season",
    status: "declaring",
    scoutingReport:
      "The sophomore leap: multi-table joins, rolling averages, ranks within groups. Scouts say it separates job-ready from beginner.",
    skills: ["JOIN", "OVER", "PARTITION BY"],
  },
  {
    id: "analytics-combine",
    name: "The Analytics Combine: Interview Drills",
    classOf: "Declaring next season",
    status: "declaring",
    scoutingReport:
      "Timed query sets and whiteboard-style problems — the 40-yard dash for analyst interviews.",
    skills: ["CTEs", "Debugging", "Speed reads"],
  },
  {
    id: "dynasty-mode",
    name: "Dynasty Mode: Prediction & Machine Learning",
    classOf: "Future class",
    status: "declaring",
    scoutingReport:
      "The franchise-player extension: build models that project performance instead of just describing it, then measure honestly whether they beat a coin flip.",
    skills: ["Modeling", "Validation", "Pipelines"],
  },
];

export function getTrack(id: string | null | undefined): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}
