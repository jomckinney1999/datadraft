import { QUESTIONS, type Question } from "@/lib/questions";
import { needsDownload } from "@/lib/practice-schemas";

/**
 * The SQL questions a timed screen draws from: everything but the questions
 * whose tables have to be downloaded first (the play-by-play and the app),
 * so a clock never waits on a fetch. Built in the page, on the server, and
 * passed down, so the mock and Analyst screens don't ship the whole bank
 * (72 kB gzipped) to pick three questions (2026-10-06).
 */
export function screenPool(): Question[] {
  return QUESTIONS.filter((q) => q.lang === "sql" && !needsDownload(q.tables)).map(
    // A timed screen shows no hints, and never reads when a question was
    // added or whose faces go on its card: about a sixth of the pool's size.
    ({ added: _added, players: _players, ...q }) => ({ ...q, hint: "" }),
  );
}
