/**
 * The briefing cutscene for each case (components/cutscene.tsx): Coach takes
 * the call, the client explains the problem in their own words, Coach sends
 * you in. The objectives are the case's own questions, so they're not
 * repeated here.
 *
 * The clients are invented people at the cases' invented companies (the
 * companies are invented on purpose; see lib/interview-cases.ts). Lines stay
 * short, one idea each, in the site's coaching voice, and never give away
 * the answer: a hint about what to watch for is fine, a query is not.
 *
 * The verifier fails a case with no scene here.
 */

import type { Beat } from "@/components/cutscene";
import type { PortraitTone } from "@/components/caller-portrait";

type CaseScene = {
  caller: { name: string; title: string; tone: PortraitTone };
  /** Coach picks up. */
  open: string;
  /** The client, a line at a time. */
  lines: string[];
  /** Coach sends you in. */
  close: string;
};

export const CASE_SCENES: Record<string, CaseScene> = {
  "waiver-pulse": {
    caller: { name: "Dana", title: "Roster team lead · Gridiron Desk", tone: "ice" },
    open: "Phone's ringing, rookie. Gridiron Desk, line one.",
    lines: [
      "Thanks for jumping on. Users say our waiver suggestions feel like the same five names every week.",
      "Before we rebuild anything, I need to know how varied last month's recommendations really were.",
    ],
    close: "Three questions, one table. Read the schema before you write a word.",
  },
  "slate-leaders": {
    caller: { name: "Marcus", title: "Recap editor · SnapCount Labs", tone: "gold" },
    open: "Deadline call. SnapCount Labs needs you.",
    lines: [
      "The Sunday recap goes out in an hour, and it needs a highlight reel.",
      "Give me the biggest single-game scores from week 3. Numbers I can put in a headline.",
    ],
    close: "Three questions. Get them right and your numbers lead the newsletter.",
  },
  "league-standings": {
    caller: { name: "Priya", title: "Product manager · Waiver Wire Labs", tone: "turf" },
    open: "Commissioners are waiting on standings. Waiver Wire Labs is calling.",
    lines: [
      "We're shipping a standings page for private leagues this week.",
      "I need season-to-date points for every fantasy team, and they have to match what managers see in the app.",
    ],
    close: "Tables to join and totals to add. Check your row counts before you trust a sum.",
  },
  "form-guide": {
    caller: { name: "Jordan", title: "Coaching product lead · Sideline Metrics", tone: "ice" },
    open: "Sideline Metrics on the line. They want a form guide.",
    lines: [
      "Managers want to know who's hot. We're adding a form strip to every player card.",
      "For each player, I need this week's points sitting right next to last week's.",
    ],
    close: "Week over week is the whole game here. Mind the players with no week before.",
  },
  "positional-ranks": {
    caller: { name: "Sam", title: "Draft board engineer · Combine Analytics", tone: "gold" },
    open: "Draft night's coming, and Combine Analytics needs a board.",
    lines: [
      "Our live draft board shows the top two scorers at every position.",
      "Ties happen. The board can't squeeze three players into a two-player slot.",
    ],
    close: "This is a hard one. Rank inside each group, and decide what a tie means.",
  },
  "retention-report": {
    caller: { name: "Alex", title: "Growth lead · Lock Screen Co", tone: "turf" },
    open: "Growth team at Lock Screen Co. They want to know who sticks around.",
    lines: [
      "We lock lineups at kickoff. Managers who set one two weeks running are the ones who stay.",
      "I need to know who they are, and how many of them we've got.",
    ],
    close: "Two weeks, one set of users. Think hard about what \"both\" means in SQL.",
  },
};

/** The scene as beats for the cutscene, or null for a case without one. */
export function caseBeats(caseId: string): Beat[] | null {
  const s = CASE_SCENES[caseId];
  if (!s) return null;
  const caller = { kind: "caller" as const, ...s.caller };
  return [
    { who: { kind: "coach", mood: "whistle" }, text: s.open },
    ...s.lines.map((text) => ({ who: caller, text })),
    { who: { kind: "coach", mood: "think" }, text: s.close },
  ];
}
