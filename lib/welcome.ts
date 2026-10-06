/**
 * The welcome tour's shared state: whether this browser has answered it, and
 * the event that opens it. Kept apart from the tour itself so the nav's
 * small "New here?" card doesn't load the tour and every drawing in it.
 */

export const SEEN_KEY = "sqlsports.welcome.v1";
export const OPEN_EVENT = "datadraft:tour";

/** Open the tour from anywhere on the page. */
export function openTour() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, new Date().toISOString().slice(0, 10));
  } catch {
    // Private mode: the card may come back next visit, which is harmless.
  }
}
