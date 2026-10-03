"use client";

/**
 * A one-frame broadcast wipe when you change pages — turf flash, then gone.
 * Makes the app feel cut between segments the way a game broadcast does,
 * without changing layout height or blocking clicks.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function BroadcastCut() {
  const pathname = usePathname() ?? "";
  const first = useRef(true);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setFlash(true);
    const id = window.setTimeout(() => setFlash(false), 420);
    return () => window.clearTimeout(id);
  }, [pathname]);

  if (!flash) return null;

  return <div className="broadcast-cut" aria-hidden />;
}
