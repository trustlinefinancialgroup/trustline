import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/bank";
import { methodDef } from "@/lib/methods";
import { productsWithLabels } from "@/lib/product-view";
import { getDict, getLocale } from "@/i18n/server";
import { AppShell, Page } from "@/components/app-shell";
import { BackLink, Card, StatusChip, type Tone } from "@/components/ui";

export const metadata = { title: "Transaction — Trustline Financial Group" };

const INTL: Record<string, string> = { en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES" };

function statusTone(status: string): Tone {
  return status === "POSTED" ? "ok" : status === "REJECTED" ? "bad" : "pending";
}

export default async function TransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isAdmin(user.role)) redirect("/admin");
  if (user.status !== "ACTIVE") redirect("/login");

  const { id } = await params;
  const t = await getDict();
  const locale = await getLocale();

  // Scoped through the account relation, so one client can never open another's
  // receipt by guessing an id.
  const tx = await db.transaction.findFirst({
    where: { id, account: { userId: user.id } },
    include: {
      account: { select: { number: true, kind: true, currency: true } },
      application: { select: { productKey: true } },
    },
  });
  if (!tx) notFound();

  const stampFmt = new Intl.DateTimeFormat(INTL[locale] ?? "en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const titles = new Map(
    productsWithLabels(t, user.accountType).map(({ def, item }) => [def.key, item.title])
  );

  const credit = tx.amountCents >= 0;
  const kindLabel = tx.account.kind === "SAVINGS" ? t.bank.savings : t.bank.checking;

  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: t.bank.reference, value: tx.reference, mono: true },
    { label: t.txn.typeLabel, value: t.bank.types[tx.type as keyof typeof t.bank.types] ?? tx.type },
    { label: t.txn.accountLabel, value: `${kindLabel} · ${tx.account.number}`, mono: true },
    { label: t.txn.createdLabel, value: stampFmt.format(tx.createdAt) },
  ];

  if (tx.postedAt) rows.push({ label: t.txn.postedLabel, value: stampFmt.format(tx.postedAt) });
  if (tx.methodKey) {
    rows.push({ label: t.txn.methodLabel, value: methodDef(tx.methodKey).label });
  }
  if (tx.counterparty) rows.push({ label: t.txn.counterpartyLabel, value: tx.counterparty });
  if (tx.application) {
    rows.push({
      label: t.txn.productLabel,
      value: titles.get(tx.application.productKey) ?? tx.application.productKey,
    });
  }

  return (
    <AppShell
      user={user}
      active="activity"
      title={tx.note?.trim() || (t.bank.types[tx.type as keyof typeof t.bank.types] ?? tx.type)}
      subtitle={tx.reference}
    >
      <Page className="max-w-2xl space-y-5">
        <BackLink href="/activity">{t.txn.backToActivity}</BackLink>

        {/* The figure, big, with its state beside it */}
        <Card>
          <p
            className={`tnum text-3xl font-semibold tracking-tight ${
              tx.status === "REJECTED"
                ? "text-gray-400 line-through"
                : credit
                  ? "text-green-700"
                  : "text-navy-900"
            }`}
          >
            {credit ? "+" : ""}
            {formatMoney(tx.amountCents, locale, tx.account.currency)}
          </p>
          <div className="mt-3">
            <StatusChip tone={statusTone(tx.status)}>
              {t.bank.statuses[tx.status as keyof typeof t.bank.statuses] ?? tx.status}
            </StatusChip>
          </div>

          {tx.status === "PENDING" && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
              {t.txn.pendingNote}
            </p>
          )}
          {tx.status === "REJECTED" && tx.rejectReason && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
              {tx.rejectReason}
            </p>
          )}
        </Card>

        <Card>
          <dl className="divide-y divide-gray-100">
            {rows.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between gap-4 py-3 first:pt-0">
                <dt className="text-sm text-gray-500">{r.label}</dt>
                <dd
                  className={`break-all text-right text-sm font-semibold text-navy-900 ${
                    r.mono ? "tnum font-mono" : ""
                  }`}
                >
                  {r.value}
                </dd>
              </div>
            ))}
          </dl>

          {tx.note?.trim() && (
            <div className="mt-4 rounded-xl bg-navy-50/70 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                {t.txn.noteLabel}
              </p>
              <p className="mt-1 whitespace-pre-line text-[14px] text-navy-800">{tx.note}</p>
            </div>
          )}
        </Card>

        {/* Proof the client attached, if any */}
        {tx.proofStoredName && (
          <Card>
            <p className="text-[13px] font-semibold text-navy-900">{t.txn.proofLabel}</p>
            <a
              href={`/api/files/deposit/${tx.proofStoredName}`}
              className="mt-3 inline-block rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-semibold text-navy-800 transition hover:border-accent-500/40"
            >
              {tx.proofFileName ?? t.documentsPage.open}
            </a>
          </Card>
        )}

        <p className="px-1 text-[11px] text-gray-400">{t.txn.keepNote}</p>
      </Page>
    </AppShell>
  );
}
