"use client";

/**
 * The lesson database (sql.js, seeded from lib/fantasy-data.ts) for a page
 * that only needs to read it: the /viz and /dax labs. Loads once on mount;
 * `run` throws a plain message until it's ready, which the builders show.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Database, QueryExecResult } from "sql.js";
import { buildSeedSql } from "@/lib/fantasy-data";

export function useLessonDb() {
  const dbRef = useRef<Database | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("sql.js")
      .then((mod) => mod.default({ locateFile: () => "/sql-wasm.wasm" }))
      .then((SQL) => {
        if (cancelled) return;
        const db = new SQL.Database();
        db.run(buildSeedSql());
        dbRef.current = db;
        setReady(true);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      dbRef.current?.close();
      dbRef.current = null;
    };
  }, []);

  // Stable across renders once ready, so a builder's memo doesn't rerun the
  // view's query on every keystroke elsewhere on the page.
  const run = useCallback(
    (sql: string): QueryExecResult | undefined => {
      const db = dbRef.current;
      if (!db) throw new Error(failed ? "The database couldn't load. Refresh the page." : "Loading the data…");
      return db.exec(sql)[0];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, failed],
  );

  return { ready, failed, run };
}
