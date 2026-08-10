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
    name: "SQL Fundamentals: Rookie Season",
    classOf: "Available now",
    status: "live",
    scoutingReport:
      "The consensus #1 overall. Takes you from zero SQL to filtering, ranking, and aggregating real football data — the beginner-to-expert roadmap starts here.",
    skills: ["SELECT", "WHERE", "ORDER BY", "GROUP BY", "HAVING"],
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
    name: "Dynasty Mode: Python & Dashboards",
    classOf: "Future class",
    status: "declaring",
    scoutingReport:
      "The franchise-player extension: notebooks, visualization, and BI on top of your SQL base.",
    skills: ["Python", "Dashboards", "Pipelines"],
  },
];

export function getTrack(id: string | null | undefined): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}
