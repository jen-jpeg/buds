"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { BUDS_STORAGE_UPDATED_EVENT, STORAGE_KEY } from "../lib/storage";

type JsonEditorPopupProps = {
  onClose: () => void;
};

function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function JsonEditorPopup({ onClose }: JsonEditorPopupProps) {
  const panelId = useId();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const initialText = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return "[]";
      // Pretty-print if it's valid JSON, so editing is friendlier.
      const parsed = JSON.parse(raw) as unknown;
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If storage is corrupted, still show *something* editable.
      return localStorage.getItem(STORAGE_KEY) ?? "[]";
    }
  }, []);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

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

  const handleExport = () => {
    const ts = new Date();
    const yyyy = String(ts.getFullYear());
    const mm = String(ts.getMonth() + 1).padStart(2, "0");
    const dd = String(ts.getDate()).padStart(2, "0");
    downloadTextFile(`buds-session-${yyyy}-${mm}-${dd}.txt`, text);
  };

  const handleSave = () => {
    setError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setError("Invalid JSON (couldn’t parse).");
      return;
    }

    if (!Array.isArray(parsed)) {
      setError("Expected the stored value to be a JSON array.");
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      window.dispatchEvent(new Event(BUDS_STORAGE_UPDATED_EVENT));
      onClose();
    } catch {
      setError("Couldn’t write to local storage (quota/private mode?).");
    }
  };

  return (
    <div
      className="!fixed !inset-0 !z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close JSON editor"
        className="absolute inset-0 bg-neutral-900/35"
        onClick={onClose}
      />
      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${panelId}-title`}
        className="flower-care-popup-enter relative z-10 w-full max-w-3xl rounded-xl border border-neutral-200 bg-white p-6 shadow-lg"
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
          edit session JSON
        </h2>

        <p className="mt-2 text-[1.05rem] text-neutral-600">
          This edits the locally stored data for this browser session. Use to quickly edit or export your data.
        </p>

        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[1.05rem] text-red-700">
          note: not recommended to alter the "id" or "healthyImage" fields
        </div>

        <div className="mt-4">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            spellCheck={false}
            className="h-[52vh] w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-[0.95rem] leading-5 text-neutral-900 outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20"
          />
          {error ? (
            <p className="mt-2 text-[1rem] text-red-600">{error}</p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-[1.1rem] font-medium text-neutral-700 transition hover:cursor-pointer hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-button-green px-4 py-2 text-[1.1rem] font-semibold text-white transition hover:cursor-pointer hover:bg-button-green-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              save
            </button>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-[1.1rem] font-medium text-neutral-800 transition hover:cursor-pointer hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            export .txt
          </button>
        </div>
      </div>
    </div>
  );
}

