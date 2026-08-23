import Link from "next/link";
import { fill, type Dict } from "@/i18n";
import { formatMoney } from "@/lib/bank";
import { Icons } from "@/components/icons";
import { Eyebrow, StatusChip } from "@/components/ui";
import type { PortfolioAccount } from "@/lib/portfolio";

/** Masked tail of an account number, e.g. "TL-48291023" -> "···· 1023". */
export function maskNumber(number: string) {
  return `···· ${number.slice(-4)}`;
}

/**
 * One deposit account, as a tappable card. Used on the dashboard grid and on
 * the accounts page — the same figures in both places, by construction.
 */
export function AccountCard({
  account,
  t,
  locale,
  href,
  showFullNumber = false,
}: {
  account: PortfolioAccount;
  t: Dict;
  locale: string;
  href?: string;
  showFullNumber?: boolean;
}) {
  const isSavings = account.kind === "SAVINGS";
  const Icon = isSavings ? Icons.savings : Icons.checking;
  const kindLabel = isSavings ? t.bank.savings : t.bank.checking;

  const body = (
    <div className="h-full rounded-2xl border border-gray-200/80 bg-white p-5 transition group-hover:border-accent-500/40 group-hover:shadow-md group-hover:shadow-navy-900/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Eyebrow className="text-gray-500">{kindLabel}</Eyebrow>
          <p className="tnum mt-1 font-mono text-[12px] text-gray-400">
            {showFullNumber ? account.number : maskNumber(account.number)}
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>

      <p className="tnum mt-4 text-2xl font-semibold tracking-tight text-navy-900">
        {formatMoney(account.balanceCents, locale, account.currency)}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusChip tone="ok">{t.products.active}</StatusChip>
        {account.pendingDepositCents > 0 && (
          <span className="tnum text-[11px] font-medium text-amber-700">
            {fill(t.accountsPage.pendingIn, {
              amount: formatMoney(account.pendingDepositCents, locale, account.currency),
            })}
          </span>
        )}
        {account.pendingWithdrawalCents > 0 && (
          <span className="tnum text-[11px] font-medium text-gray-500">
            {fill(t.accountsPage.heldForWithdrawal, {
              amount: formatMoney(account.pendingWithdrawalCents, locale, account.currency),
            })}
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return body;

  return (
    <Link
      href={href}
      className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
    >
      {body}
    </Link>
  );
}
