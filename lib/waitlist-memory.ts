/**
 * Remember a waitlist signup in this browser so soft offers don't nag after
 * someone's already on the list. The server is still the source of truth;
 * this is just UX memory.
 */

const KEY = "sqlsports.waitlist.v1";

export function waitlistJoined(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markWaitlistJoined(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    /* storage blocked */
  }
}
