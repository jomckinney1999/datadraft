/**
 * Local progress for scripted interview cases.
 * Separate from lesson Progress so timeouts / XP stay untouched.
 */

export type InterviewCaseStatus = "not_started" | "in_progress" | "completed";

export type InterviewCaseProgress = {
  status: InterviewCaseStatus;
  /** Question ids answered correctly (in order). */
  answered: string[];
  updatedAt: string;
};

export type InterviewProgress = Record<string, InterviewCaseProgress>;

const KEY = "sqlsports.interview.v1";

export function loadInterviewProgress(): InterviewProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as InterviewProgress;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveInterviewProgress(next: InterviewProgress): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked */
  }
}

export function markQuestionAnswered(
  caseId: string,
  questionId: string,
  totalQuestions: number,
): InterviewCaseProgress {
  const all = loadInterviewProgress();
  const prev = all[caseId] ?? {
    status: "not_started" as const,
    answered: [],
    updatedAt: "",
  };
  const answered = prev.answered.includes(questionId)
    ? prev.answered
    : [...prev.answered, questionId];
  const status: InterviewCaseStatus =
    answered.length >= totalQuestions ? "completed" : "in_progress";
  const entry: InterviewCaseProgress = {
    status,
    answered,
    updatedAt: new Date().toISOString(),
  };
  saveInterviewProgress({ ...all, [caseId]: entry });
  return entry;
}

export function markCaseStarted(caseId: string): InterviewCaseProgress {
  const all = loadInterviewProgress();
  if (all[caseId]?.status === "completed") return all[caseId];
  if (all[caseId]?.status === "in_progress") return all[caseId];
  const entry: InterviewCaseProgress = {
    status: "in_progress",
    answered: all[caseId]?.answered ?? [],
    updatedAt: new Date().toISOString(),
  };
  saveInterviewProgress({ ...all, [caseId]: entry });
  return entry;
}

export function statusCounts(
  caseIds: string[],
  progress: InterviewProgress,
): { notStarted: number; inProgress: number; completed: number } {
  let notStarted = 0;
  let inProgress = 0;
  let completed = 0;
  for (const id of caseIds) {
    const s = progress[id]?.status ?? "not_started";
    if (s === "completed") completed++;
    else if (s === "in_progress") inProgress++;
    else notStarted++;
  }
  return { notStarted, inProgress, completed };
}
