/**
 * What a question page hands the workspace, shared by the question's own
 * page and its challenge page (/questions/<id>/vs/<n>-<tries>), so the two
 * can't drift apart. A page file can only export what Next allows, which is
 * why this lives here and not beside them.
 */

import { isDailyQuestion, leagueDay, questionsIn, type Question } from "@/lib/questions";
import { questionIsFree } from "@/lib/pass-gates";

/** The day before `day`, for the streak check. */
function previousDay(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function workspaceProps(question: Question) {
  const day = leagueDay();
  // "Next" stays inside the language you are already working in. Throwing
  // someone from a SQL question straight into a 30 MB R download because it
  // happened to be the next array entry is not a next question, it is an exit.
  const pool = questionsIn(question.lang);
  const index = pool.findIndex((q) => q.id === question.id);
  const next = pool[(index + 1) % pool.length];
  const prev = pool[(index - 1 + pool.length) % pool.length];
  return {
    question,
    isQotd: isDailyQuestion(day, question),
    day,
    prevDay: previousDay(day),
    nextId: next.id === question.id ? null : next.id,
    prevId: prev.id === question.id ? null : prev.id,
    position: index + 1,
    total: pool.length,
    // Free without the Season Pass: the daily, a week after it, the starter
    // set (lib/pass-gates.ts). Only matters once the paywall is on.
    free: questionIsFree(question, day),
  };
}
