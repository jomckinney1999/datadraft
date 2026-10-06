/**
 * Dealing Rapid Fire rounds. It reads every multiple-choice play in the live
 * curriculum, so it's imported dynamically when a round starts
 * (components/rapid-fire.tsx) rather than shipped with the page. The counts
 * on the language picker come from the server (app/learn/rapid/page.tsx).
 */

import { liveLessons, type MCExercise } from "./curriculum";
import { rapidBankFor } from "./rapid-bank";
import {
  RAPID_ROUND_SIZE,
  getRapidLang,
  type RapidLangId,
  type RapidQuestion,
} from "./rapid-fire";

/** Build the MC bank for a language from live curriculum + rapid-bank extras. */
export function buildRapidBank(langId: RapidLangId): RapidQuestion[] {
  const lang = getRapidLang(langId);
  if (!lang) return [];
  const out: RapidQuestion[] = [];

  for (const moduleId of lang.moduleIds) {
    for (const { lesson } of liveLessons(moduleId)) {
      lesson.exercises.forEach((ex, i) => {
        if (ex.type !== "mc") return;
        const mc = ex as MCExercise;
        out.push({
          id: `${lesson.id}:${i}`,
          lang: langId,
          prompt: mc.prompt,
          code: mc.code,
          choices: mc.options,
          answer: mc.answer,
          explain: mc.explain,
          lessonId: lesson.id,
        });
      });
    }
  }
  for (const snap of rapidBankFor(langId)) {
    out.push({
      id: snap.id,
      lang: langId,
      prompt: snap.prompt,
      code: snap.code,
      choices: snap.choices,
      answer: snap.answer,
      explain: snap.explain,
      lessonId: "rapid-bank",
    });
  }
  return out;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Multiple-choice snaps from one course, for a stop on that course's path. */
export function dealCourseRound(
  moduleId: string,
  size = 5,
  seed?: number,
): RapidQuestion[] {
  const out: RapidQuestion[] = [];
  for (const { lesson } of liveLessons(moduleId)) {
    lesson.exercises.forEach((ex, i) => {
      if (ex.type !== "mc") return;
      const mc = ex as MCExercise;
      out.push({
        id: `${lesson.id}:${i}`,
        lang: "sql",
        prompt: mc.prompt,
        code: mc.code,
        choices: mc.options,
        answer: mc.answer,
        explain: mc.explain,
        lessonId: lesson.id,
      });
    });
  }
  if (out.length === 0) return [];
  const rand = mulberry32(
    seed ?? (Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0,
  );
  const copy = [...out];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(size, copy.length));
}

/** Shuffle a fresh round. Seed optional for tests. */
export function dealRapidRound(
  langId: RapidLangId,
  size = RAPID_ROUND_SIZE,
  seed?: number,
): RapidQuestion[] {
  const bank = buildRapidBank(langId);
  if (bank.length === 0) return [];
  const rand = mulberry32(
    seed ?? (Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0,
  );
  const copy = [...bank];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(size, copy.length));
}

/** How many snaps each language has, for the picker's counts. */
export function rapidBankCounts(): Record<RapidLangId, number> {
  const counts = {} as Record<RapidLangId, number>;
  for (const id of ["sql", "python", "excel", "r", "stats", "git"] as RapidLangId[]) {
    counts[id] = buildRapidBank(id).length;
  }
  return counts;
}
