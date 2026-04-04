"use client";

import { useEffect, useId, useState } from "react";
import ReactMarkdown from "react-markdown";

type ChangelogPopupProps = {
  onClose: () => void;
};

export default function ChangelogPopup({ onClose }: ChangelogPopupProps) {
  const panelId = useId();
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/changelog");
        const text = await res.text();
        if (cancelled) return;
        if (!res.ok) {
          setError(text || "Could not load changelog.");
          return;
        }
        setMarkdown(text);
      } catch {
        if (!cancelled) setError("Could not load changelog.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="!fixed !inset-0 z-[60] overflow-y-auto"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close changelog"
        className="fixed inset-0 bg-neutral-900/35"
        onClick={onClose}
      />
      <div className="flex min-h-[100dvh] items-center justify-center p-4">
        <div
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${panelId}-title`}
          className="flower-care-popup-enter relative z-10 max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-neutral-200 bg-white p-4 shadow-lg sm:max-h-[min(calc(100dvh-2rem),44rem)] sm:p-6"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-3 right-3 rounded-md p-1.5 text-neutral-500 transition hover:cursor-pointer hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="currentColor"
              aria-hidden
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>

          <h2
            id={`${panelId}-title`}
            className="pr-10 text-[1.35rem] font-bold leading-snug text-secondary-foreground sm:text-[1.6rem]"
          >
            Changelog
          </h2>

          <div className="mt-4 font-pangolin text-[1.05rem] leading-relaxed text-foreground sm:text-[1.1rem] [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-colors [&_a:hover]:text-health-bar-sage [&_h1]:mb-3 [&_h1]:text-[1.25rem] [&_h1]:font-bold [&_h1]:text-secondary-foreground [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-[1.15rem] [&_h2]:font-bold [&_h2]:text-secondary-foreground [&_h2:first-of-type]:mt-0 [&_li]:my-0.5 [&_p]:my-2 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
            {error ? (
              <p className="text-health-bar-low">{error}</p>
            ) : markdown === null ? (
              <p className="text-neutral-500">Loading…</p>
            ) : (
              <ReactMarkdown
                components={{
                  a: ({ href, children, ...props }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {markdown}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
