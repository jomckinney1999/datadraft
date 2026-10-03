"use client";

/**
 * Vercel Web Analytics: cookieless page views, and the only gauge the
 * funnels in Notion have.
 *
 * On the free plan the dashboard breaks traffic down by page, referrer,
 * country and device, but not by query string, and custom events and UTM
 * tags are paid. So the signals our own share links carry (?ref=chart on a
 * posted chart, ?ref=share on a daily-question result, ?r= on a Stat Duel or
 * Draft Room challenge) would vanish. Instead, every page view is reported
 * as its path plus a marker when it arrived through one of ours:
 * /questions/who-improved/~chart, /questions/duel/~challenge. Search the
 * Pages panel for "~" to read the funnel.
 *
 * Everything else in the query string is dropped, so nothing a visitor typed
 * into a URL is recorded. The internal pages (/demo, /brand) aren't counted.
 */

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

function report(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = new URL(event.url);
  if (/^\/(demo|brand)(\/|$)/.test(url.pathname)) return null;

  const ref = url.searchParams.get("ref");
  // /pricing?from=doctor: which Season Pass offer sent them (components/pass-offer.tsx).
  const from = url.searchParams.get("from");
  const marker =
    ref === "chart" || ref === "share"
      ? ref
      : url.searchParams.has("r")
        ? "challenge"
        : from && /^[a-z-]{1,24}$/.test(from)
          ? `from-${from}`
          : null;

  url.search = "";
  url.hash = "";
  if (marker) url.pathname = `${url.pathname.replace(/\/$/, "")}/~${marker}`;
  return { ...event, url: url.toString() };
}

export default function SiteAnalytics() {
  return <Analytics beforeSend={report} />;
}
