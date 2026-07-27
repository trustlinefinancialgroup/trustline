"use client";

import { useActionState, useState } from "react";
import { submitApplicationAction } from "@/lib/actions/product-actions";
import type { FormState } from "@/lib/actions/auth-actions";
import { BankCard } from "@/components/bank-card";
import { CARD_TIERS, type CardTheme } from "@/lib/products";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-[15px] text-navy-900 transition focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20";
const labelClass = "block text-[13px] font-semibold text-navy-800";

const TERMS = [12, 24, 36, 60, 120, 240, 360];

export function ApplyForm({
  productKey,
  productName,
  showAmount,
  showTerm,
  showTiers,
  holderName,
  labels,
}: {
  productKey: string;
  productName: string;
  showAmount: boolean;
  showTerm: boolean;
  showTiers: boolean;
  holderName: string;
  labels: {
    amount: string;
    purpose: string;
    submit: string;
    submitting: string;
    chooseTier: string;
    tierHint: string;
    term: string;
    termMonths: string;
    tiers: Record<string, string>;
    tierBlurbs: Record<string, string>;
  };
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    submitApplicationAction,
    null
  );
  const [tier, setTier] = useState<string>("PLATINUM");

  return (
    <form action={formAction} className="mt-7 space-y-6">
      <input type="hidden" name="productKey" value={productKey} />

      {showTiers && (
        <fieldset>
          <legend className={labelClass}>{labels.chooseTier}</legend>
          <input type="hidden" name="requestedTier" value={tier} />
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {CARD_TIERS.map((option) => {
              const selected = tier === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTier(option)}
                  aria-pressed={selected}
                  className={`rounded-2xl border-2 p-2 text-left transition ${
                    selected
                      ? "border-accent-500 shadow-md"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <BankCard
                    theme={option as CardTheme}
                    productName={productName}
                    badge={labels.tiers[option] ?? option}
                    holder={holderName.toUpperCase()}
                    placeholder
                  />
                  <p className="mt-2 px-1 text-[13px] font-semibold text-navy-900">
                    {labels.tiers[option] ?? option}
                  </p>
                  <p className="mt-0.5 px-1 pb-1 text-[11px] leading-snug text-gray-500">
                    {labels.tierBlurbs[option] ?? ""}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-gray-500">{labels.tierHint}</p>
        </fieldset>
      )}

      {showAmount && (
        <label className={labelClass}>
          {labels.amount}
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className={inputClass}
          />
        </label>
      )}

      {showTerm && (
        <label className={labelClass}>
          {labels.term}
          <select name="termMonths" defaultValue="" className={inputClass}>
            <option value="">—</option>
            {TERMS.map((n) => (
              <option key={n} value={n}>
                {labels.termMonths.replace("{n}", String(n))}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className={labelClass}>
        {labels.purpose}
        <textarea name="purpose" rows={4} maxLength={300} className={inputClass} />
      </label>

      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-600 disabled:opacity-60"
      >
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
