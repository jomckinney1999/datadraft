"use client";

/**
 * Beta test bench — an internal QA surface, not a marketing page.
 *
 * Demoing the product normally means walking the full onboarding ceremony
 * (draft → playbook quiz → lessons) before you can open a single lesson, and
 * then clicking through a roadmap to reach the one you actually wanted to
 * check. This page skips all of that: arm a profile in one click, flip
 * playbook style to see how the same lesson changes, and jump straight into
 * any lesson in the catalogue.
 *
 * It is deliberately not linked from the site nav — it is a URL you keep in a
 * bookmark, and it reads and writes the same localStorage progress the real
 * player uses, so what you test is the real thing.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { COURSES, courseByModule } from "@/lib/courses";
import {
  MODULES,
  ALL_MODULE,
  moduleUnits,
  type Exercise,
  type Unit,
} from "@/lib/curriculum";
import { STYLES, type PlaybookStyle } from "@/lib/playbook";
import { loadProgress, saveProgress, type Progress } from "@/lib/progress";
import { MODULE_STORAGE_KEY } from "@/lib/use-module";
import ThemeToggle from "@/components/theme-toggle";
import HomeLink from "@/components/home-link";

const TYPE_LABEL: Record<Exercise["type"], string> = {
  mc: "MC",
  fill: "Fill",
  query: "SQL",
  code: "Code",
  formula: "Formula",
};

/** Live-executed exercise types — the ones that run real code, not checkboxes. */
const EXECUTED: Exercise["type"][] = ["query", "code", "formula"];

function countTypes(units: Unit[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const u of units) {
    for (const l of u.lessons) {
      for (const e of l.exercises) {
        out[e.type] = (out[e.type] ?? 0) + 1;
      }
    }
  }
  return out;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-panel-border bg-panel/50 px-4 py-3">
      <p className="font-display text-2xl font-bold text-turf">{value}</p>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
        {label}
      </p>
    </div>
  );
}

export default function DemoPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [openModule, setOpenModule] = useState<string | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  function update(patch: Partial<Progress>) {
    const next = { ...loadProgress(), ...patch };
    saveProgress(next);
    setProgress(next);
  }

  /** Fill in exactly the fields the lesson player gates on, and nothing else. */
  function armProfile() {
    update({
      username: progress?.username || "Demo",
      draftedTrack: progress?.draftedTrack || "sql-fundamentals",
      playbookStyle: progress?.playbookStyle || "dual-threat",
    });
  }

  function resetAll() {
    update({
      xp: 0,
      completedLessons: [],
      streak: 0,
      lastActiveDay: "",
      playbookStyle: null,
      username: null,
      draftedTrack: null,
    });
  }

  function pickModule(id: string) {
    try {
      window.localStorage.setItem(MODULE_STORAGE_KEY, id);
    } catch {
      // private-mode browsers: the lesson player falls back to the default
    }
  }

  // Only modules that actually have live units are worth listing as testable.
  const testable = MODULES.filter(
    (m) =>
      m.id !== ALL_MODULE &&
      moduleUnits(m.id).some((u) => u.status === "live"),
  );

  const allUnits = moduleUnits(ALL_MODULE);
  const liveUnits = allUnits.filter((u) => u.status === "live");
  const totals = countTypes(liveUnits);
  const lessonCount = liveUnits.reduce((n, u) => n + u.lessons.length, 0);
  const exerciseCount = Object.values(totals).reduce((a, b) => a + b, 0);
  const executedCount = EXECUTED.reduce((n, t) => n + (totals[t] ?? 0), 0);
  const liveCourses = COURSES.filter((c) => c.status === "live").length;

  const armed = Boolean(
    progress?.username && progress?.draftedTrack && progress?.playbookStyle,
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-10">
      <div className="mb-8">
        <HomeLink label="beta bench" back="/learn" backLabel="courses" />
      </div>

      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="label-broadcast text-gold">internal · beta bench</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">
            Demo &amp; Test
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Jump straight into any lesson without walking the draft and quiz
            first. Everything here writes the same local progress the real
            player reads, so you are testing the actual product.
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* ── profile controls ── */}
      <section className="mt-8 border border-panel-border bg-panel/40 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label-broadcast text-turf">demo profile</p>
            <p className="mt-1 font-mono text-[12px] text-ink-soft">
              {progress === null
                ? "reading…"
                : armed
                  ? `${progress.username} · ${progress.draftedTrack} · ${progress.playbookStyle} · ${progress.xp} XP · ${progress.completedLessons.length} lessons done`
                  : "not armed — onboarding gates will redirect you"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={armProfile}
              className="border border-turf bg-turf/15 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-turf transition-colors hover:bg-turf/25"
            >
              {armed ? "Re-arm" : "Arm demo profile"}
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="border border-panel-border px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-ink-muted transition-colors hover:border-gold/50 hover:text-gold"
            >
              Reset all
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-panel-border pt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            playbook style — changes which exercises a lesson shows
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STYLES.map((s) => {
              const active = progress?.playbookStyle === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    update({ playbookStyle: s.id as PlaybookStyle })
                  }
                  className={`border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                    active
                      ? "border-turf bg-turf/15 text-turf"
                      : "border-panel-border text-ink-muted hover:border-turf/50 hover:text-turf"
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
            Gunslinger drops multiple choice on any lesson with 3+ hands-on
            drills — the fastest way to see the formula and code exercises
            back to back.
          </p>
        </div>
      </section>

      {/* ── what exists ── */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="courses live" value={`${liveCourses}/${COURSES.length}`} />
        <Stat label="live units" value={liveUnits.length} />
        <Stat label="lessons" value={lessonCount} />
        <Stat label="exercises" value={exerciseCount} />
        <Stat label="run for real" value={executedCount} />
        <Stat
          label="formula drills"
          value={totals.formula ?? 0}
        />
      </section>

      {/* ── quick routes ── */}
      <section className="mt-6">
        <p className="label-broadcast text-turf">other routes</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            ["/", "Landing"],
            ["/learn", "Course catalog"],
            ["/field", "Practice Field"],
            ["/learn/draft", "Draft ceremony"],
            ["/learn/playbook", "Playbook quiz"],
            ["/account", "Sign in"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="border border-panel-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors hover:border-turf/50 hover:text-turf"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── the lesson index ── */}
      <section className="mt-8">
        <p className="label-broadcast text-turf">every lesson</p>
        <p className="mt-1 text-[12px] text-ink-muted">
          Clicking a lesson also switches the active course, so “next lesson”
          advances the way a learner in that course would experience it.
        </p>

        <div className="mt-4 space-y-3">
          {testable.map((mod) => {
            const units = moduleUnits(mod.id);
            const counts = countTypes(units.filter((u) => u.status === "live"));
            const course = courseByModule(mod.id);
            const open = openModule === mod.id;
            const lessons = units
              .filter((u) => u.status === "live")
              .reduce((n, u) => n + u.lessons.length, 0);

            return (
              <div
                key={mod.id}
                className="border border-panel-border bg-panel/30"
              >
                <button
                  type="button"
                  onClick={() => setOpenModule(open ? null : mod.id)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-panel/60"
                >
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold text-ink">
                      {course?.title ?? mod.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
                      {lessons} lessons ·{" "}
                      {Object.entries(counts)
                        .map(
                          ([t, n]) =>
                            `${n} ${TYPE_LABEL[t as Exercise["type"]] ?? t}`,
                        )
                        .join(" · ")}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                    {open ? "hide" : "open"}
                  </span>
                </button>

                {open && (
                  <div className="border-t border-panel-border px-4 py-3">
                    {units.map((unit) => (
                      <div key={unit.id} className="mb-4 last:mb-0">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                          {unit.title}
                          {unit.status !== "live" && " · in build"}
                        </p>
                        {unit.status === "live" ? (
                          <ul className="mt-1.5 space-y-1">
                            {unit.lessons.map((lesson) => {
                              const done =
                                progress?.completedLessons.includes(lesson.id);
                              return (
                                <li key={lesson.id}>
                                  <Link
                                    href={`/learn/${lesson.id}`}
                                    onClick={() => {
                                      pickModule(mod.id);
                                      if (!armed) armProfile();
                                    }}
                                    className="flex items-center justify-between gap-3 border border-transparent px-2 py-1.5 transition-colors hover:border-panel-border hover:bg-panel/60"
                                  >
                                    <span className="min-w-0 truncate text-[13px] text-ink-soft">
                                      <span className="font-mono text-[11px] text-ink-muted">
                                        {lesson.id}
                                      </span>{" "}
                                      {lesson.title}
                                    </span>
                                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                                      {done && (
                                        <span className="mr-2 text-turf">
                                          done
                                        </span>
                                      )}
                                      {Object.entries(
                                        countTypes([
                                          {
                                            ...unit,
                                            lessons: [lesson],
                                          },
                                        ]),
                                      )
                                        .map(
                                          ([t, n]) =>
                                            `${n}${
                                              TYPE_LABEL[
                                                t as Exercise["type"]
                                              ] ?? t
                                            }`,
                                        )
                                        .join(" ")}
                                    </span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="mt-1 text-[12px] text-ink-muted">
                            No lessons authored yet.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <p className="mt-10 border-t border-panel-border pt-4 font-mono text-[11px] text-ink-muted">
        Not linked from the site nav. Progress is local to this browser.
      </p>
    </main>
  );
}
