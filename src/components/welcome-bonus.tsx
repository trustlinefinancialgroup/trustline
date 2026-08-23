import Link from "next/link";
import { fill, type Dict } from "@/i18n";
import { formatMoney, formatMoneyWhole } from "@/lib/bank";
import { Icons } from "@/components/icons";
import { ProgressBar } from "@/components/ui";
import type { WelcomeBonusState } from "@/lib/promo";

/**
 * The new-client offer, on the dashboard. Two halves: the flat welcome bonus
 * (either awaiting the team's review or already credited) and the boosted
 * introductory rate, which shows real progress towards the funding threshold
 * rather than a decorative bar.
 */
export function WelcomeBonusBanner({
  state,
  t,
  locale,
  currency,
  creditedDate,
}: {
  state: WelcomeBonusState;
  t: Dict;
  locale: string;
  currency: string;
  creditedDate: string | null;
}) {
  const target = formatMoneyWhole(state.thresholdCents, locale, currency);
  const funded = formatMoney(state.fundedCents, locale, currency);

  return (
    <div className="overflow-hidden rounded-2xl border border-accent-100 bg-gradient-to-br from-accent-50 to-white">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:gap-6 sm:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
          <Icons.gift className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center rounded-full bg-accent-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-accent-700">
            {t.promo.badge}
          </span>

          <h2 className="mt-2.5 text-base font-semibold tracking-tight text-navy-900">
            {state.credited ? t.promo.creditedTitle : t.promo.title}
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
            {state.credited && creditedDate
              ? fill(t.promo.creditedBody, {
                  amount: formatMoney(state.creditedCents, locale, currency),
                  date: creditedDate,
                })
              : t.promo.pendingBody}
          </p>

          {/* Introductory rate — only worth showing until they qualify. */}
          {!state.qualifiesForRate ? (
            <div className="mt-4 rounded-xl border border-gray-200/80 bg-white p-4">
              <p className="text-[13px] font-semibold text-navy-900">{t.promo.rateTitle}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
                {fill(t.promo.rateBody, { target })}
              </p>
              <div className="mt-3">
                <ProgressBar percent={state.percent} />
                <p className="tnum mt-2 text-[12px] font-medium text-gray-500">
                  {fill(t.promo.rateProgress, { funded, target })}
                </p>
              </div>
              <Link
                href="/transfers?tab=deposit"
                className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-accent-500 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-accent-600"
              >
                {t.promo.fundNow}
              </Link>
            </div>
          ) : (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              {t.promo.rateDone}
            </p>
          )}

          <p className="mt-3 text-[11px] text-gray-400">{t.promo.terms}</p>
        </div>
      </div>
    </div>
  );
}
