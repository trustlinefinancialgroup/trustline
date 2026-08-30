"use client";

import { useActionState } from "react";
import { applyGrantAction } from "@/lib/actions/service-actions";
import type { FormState } from "@/lib/actions/auth-actions";
import { fieldClass, labelClass } from "@/components/ui";

type Labels = {
  program: string;
  programHint: string;
  programs: { value: string; label: string }[];
  amount: string;
  reason: string;
  reasonHint: string;
  submit: string;
  submitting: string;
};

export function GrantForm({ labels }: { labels: Labels }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(applyGrantAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <label className={labelClass}>
        {labels.program}
        <select name="program" defaultValue="" required className={fieldClass}>
          <option value="" disabled>
            —
          </option>
          {labels.programs.map((p) => (
            <option key={p.value} value={p.label}>
              {p.label}
            </option>
          ))}
        </select>
        <span className="mt-1.5 block text-xs font-normal text-fg-muted">{labels.programHint}</span>
      </label>

      <label className={labelClass}>
        {labels.amount}
        <input
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          placeholder="0.00"
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        {labels.reason}
        <textarea name="reason" rows={4} required className={fieldClass} />
        <span className="mt-1.5 block text-xs font-normal text-fg-muted">{labels.reasonHint}</span>
      </label>

      {state?.error && (
        <p className="rounded-lg border border-neg/25 bg-neg/10 px-3.5 py-2.5 text-sm text-neg">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
