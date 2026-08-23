import Link from "next/link";
import { formatMoney } from "@/lib/bank";
import { NavIcons } from "@/components/icons";

// Shared ledger table — used on the dashboard and on every product page.

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  POSTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-700",
};

export type LedgerRow = {
  id: string;
  type: string;
  status: string;
  amountCents: number;
  reference: string;
  note: string | null;
  createdAt: Date;
};

export function TransactionList({
  rows,
  labels,
  locale,
  currency,
  emptyText,
  /** When false the rows are inert — used where a detail page makes no sense. */
  linkRows = true,
}: {
  rows: LedgerRow[];
  labels: {
    types: Record<string, string>;
    statuses: Record<string, string>;
    reference: string;
  };
  locale: string;
  currency: string;
  emptyText: string;
  linkRows?: boolean;
}) {
  const dateFmt = new Intl.DateTimeFormat(
    ({ en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES" } as Record<string, string>)[locale] ??
      "en-US",
    { dateStyle: "medium" }
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      {rows.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-gray-500">{emptyText}</p>
      ) : (
        <ul>
          {rows.map((tx) => {
            const body = (
              <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-navy-900">
                    {tx.note?.trim() || (labels.types[tx.type] ?? tx.type)}
                  </p>
                  <p className="tnum mt-0.5 truncate text-xs text-gray-500">
                    {dateFmt.format(tx.createdAt)}
                    {tx.note?.trim() ? ` · ${labels.types[tx.type] ?? tx.type}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`tnum font-semibold ${
                      tx.status === "REJECTED"
                        ? "text-gray-400 line-through"
                        : tx.amountCents >= 0
                          ? "text-green-700"
                          : "text-navy-900"
                    }`}
                  >
                    {tx.amountCents >= 0 ? "+" : ""}
                    {formatMoney(tx.amountCents, locale, currency)}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      statusStyles[tx.status] ?? ""
                    }`}
                  >
                    {labels.statuses[tx.status] ?? tx.status}
                  </span>
                </div>
                {linkRows && (
                  <NavIcons.chevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                )}
              </div>
            );

            return (
              <li key={tx.id} className="border-b border-gray-100 last:border-0">
                {linkRows ? (
                  <Link href={`/activity/${tx.id}`} className="block transition hover:bg-navy-50/50">
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
