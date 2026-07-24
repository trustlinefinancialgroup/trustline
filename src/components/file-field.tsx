"use client";

import { useRef, useState } from "react";

/**
 * Custom file picker: the native input is visually hidden (but kept focusable
 * for validation), so the button text comes from our translations instead of
 * the browser's UI language.
 */
export function FileField({
  name,
  accept,
  chooseLabel,
  emptyLabel,
  required = true,
}: {
  name: string;
  accept: string;
  chooseLabel: string;
  emptyLabel: string;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-dashed border-gray-300 px-3.5 py-3 transition hover:border-accent-500/50">
      <input
        ref={inputRef}
        type="file"
        name={name}
        required={required}
        accept={accept}
        className="sr-only"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="shrink-0 rounded-md bg-navy-50 px-4 py-2 text-[13px] font-semibold text-navy-800 transition hover:bg-navy-100"
      >
        {chooseLabel}
      </button>
      <span className="truncate text-sm text-gray-600">
        {fileName ?? emptyLabel}
      </span>
    </div>
  );
}
