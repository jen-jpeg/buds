"use client";

import { useEffect, useId } from "react";

type AboutPopupProps = {
  onClose: () => void;
};

export default function AboutPopup({ onClose }: AboutPopupProps) {
  const panelId = useId();

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

  return (
    <div
      className="!fixed !inset-0 !z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close about"
        className="absolute inset-0 bg-neutral-900/35"
        onClick={onClose}
      />
      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${panelId}-title`}
        className="flower-care-popup-enter relative z-10 w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-lg"
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
          className="pr-10 text-[1.6rem] font-bold text-secondary-foreground"
        >
          .✦ ݁˖ what is buds? ⋆˚✿˖°
        </h2>
        <p className="mt-3 text-[1.2rem] leading-snug text-foreground font-pangolin">
          Just like flowers, friendships need care to stay healthy! <br /> <br />
          Buds is a simple friendship health tracker that lets you plant your <i>buddies</i> as flower <i>buds</i>  :p 
          <br /> <br />
          Bud health decreases daily at a rate based on how often you want to see them! Text or plan a hangout to keep them healthy :) <br /> <br />
          Data is stored locally in your browser and can be exported or directly edited via JSON.
        </p>
        <p className="mt-5 border-t border-neutral-100 pt-4 text-[1.2rem]">
          <a
            href="https://github.com/jen-jpeg/buds"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex gap-2 font-medium text-foreground hover:text-health-bar-sage transition hover:text-foreground"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 shrink-0"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
