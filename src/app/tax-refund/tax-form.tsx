"use client";

import { useActionState } from "react";
import { applyTaxRefundAction } from "@/lib/actions/service-actions";
import type { FormState } from "@/lib/actions/auth-actions";
import { fieldClass, labelClass } from "@/components/ui";

type Labels = {
  taxYear: string;
  years: string[];
  filingStatus: string;
  statuses: { value: string; label: string }[];
  expectedRefund: string;
  submit: string;
  submitting: string;
};

export function TaxForm({ labels }: { labels: Labels }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    applyTaxRefundAction,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          {labels.taxYear}
          <select name="taxYear" defaultValue="" required className={fieldClass}>
            <option value="" disabled>
              —
            </option>
            {labels.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          {labels.filingStatus}
          <select name="filingStatus" defaultValue="" className={fieldClass}>
            <option value="">—</option>
            {labels.statuses.map((s) => (
              <option key={s.value} value={s.label}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={labelClass}>
        {labels.expectedRefund}
        <input
          name="expectedRefund"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          placeholder="0.00"
          className={fieldClass}
        />
      </label>

      {state?.error && (
        <p className="rounded-lg border border-neg/25 bg-neg/10 px-3.5 py-2.5 text-sm text-neg">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60"
      >
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
