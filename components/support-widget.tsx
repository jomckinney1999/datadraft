"use client";

import { useState } from "react";

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSent(true);
    setMessage("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex w-[320px] max-w-[calc(100vw-2.5rem)] flex-col border border-panel-border bg-panel shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:w-[360px]">
          <div className="flex items-center justify-between border-b border-panel-border px-4 py-3">
            <span className="font-display text-sm font-bold text-pop">
              SQL<span className="text-teal">Sports</span>
              <span className="ml-2 label-broadcast align-middle text-[10px] text-ink-muted">
                support
              </span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close support panel"
              className="text-ink-muted transition-colors duration-150 hover:text-ink"
            >
              ✕
            </button>
          </div>

          <div className="px-4 pb-4 pt-5">
            <p className="font-display text-lg font-semibold leading-snug text-pop">
              Hi there 👋
              <br />
              How can we help?
            </p>

            <form onSubmit={handleSend} className="mt-4">
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setSent(false);
                }}
                placeholder="Send us a message"
                rows={3}
                className="w-full resize-none border border-panel-border bg-night/60 px-3 py-2.5 font-sans text-sm text-ink outline-none placeholder:text-ink-muted focus:border-teal/50"
              />
              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 border border-teal/50 bg-teal/10 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-teal transition-colors duration-150 hover:border-teal hover:bg-teal/20"
              >
                Send
              </button>
            </form>

            {sent && (
              <p className="mt-3 font-mono text-[11px] text-ink-muted">
                Thanks — we&apos;ll get back to you soon.
              </p>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-teal/50 bg-teal text-night shadow-[0_8px_24px_rgba(79,209,197,0.35)] transition-transform duration-150 hover:scale-105"
      >
        {open ? (
          <span className="text-xl leading-none">✕</span>
        ) : (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6"
          >
            <path
              d="M4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v10c0 .83-.67 1.5-1.5 1.5H9l-4 3.5v-3.5H5.5C4.67 17 4 16.33 4 15.5v-10Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
