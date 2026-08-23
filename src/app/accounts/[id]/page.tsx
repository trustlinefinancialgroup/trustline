import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/bank";
import { loadPortfolio } from "@/lib/portfolio";
import { balanceTrend } from "@/lib/trend";
import { getDict, getLocale } from "@/i18n/server";
import { fill } from "@/i18n";
import { AppShell, Page } from "@/components/app-shell";
import { BalanceTrend } from "@/components/balance-trend";
import { TransactionList } from "@/components/transaction-list";
import { BackLink, Card, Eyebrow, QuickAction, SectionHead } from "@/components/ui";

export const metadata = { title: "Account — Trustline Financial Group" };

const INTL: Record<string, string> = { en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES" };

export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isAdmin(user.role)) redirect("/admin");
  if (user.status !== "ACTIVE") redirect("/login");

  const { id } = await params;
  const t = await getDict();
  const locale = await getLocale();

  const portfolio = await loadPortfolio(user.id);
  const account = portfolio.accounts.find((a) => a.id === id);
  if (!account) notFound();

  const [rows, trend] = await Promise.all([
    db.transaction.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    balanceTrend([account.id]),
  ]);

  const shortDate = new Intl.DateTimeFormat(INTL[locale] ?? "en-US", {
    month: "short",
    day: "numeric",
  });
  const dateFmt = new Intl.DateTimeFormat(INTL[locale] ?? "en-US", { dateStyle: "long" });

  const trendData = trend.points.map((p) => ({
    v: p.balanceCents,
    date: shortDate.format(p.at),
    value: formatMoney(p.balanceCents, locale, account.currency),
  }));

  const isSavings = account.kind === "SAVINGS";
  const kindLabel = isSavings ? t.bank.savings : t.bank.checking;

  const details: { label: string; value: string; mono?: boolean }[] = [
    { label: t.accountsPage.accountNumber, value: account.number, mono: true },
    { label: t.txn.typeLabel, value: kindLabel },
    { label: t.account.currencyLabel, value: account.currency },
    { label: t.accountsPage.opened, value: dateFmt.format(account.createdAt) },
  ];

  return (
    <AppShell user={user} active="accounts" title={kindLabel} subtitle={account.number}>
      <Page className="max-w-3xl space-y-5">
        <BackLink href="/accounts">{t.accountsPage.title}</BackLink>

        {/* This account's own balance card, chart and actions */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 p-5 shadow-lg shadow-navy-900/20 sm:p-7">
          <Eyebrow className="text-navy-300">{t.bank.availableBalance}</Eyebrow>
          <p className="tnum mt-1.5 text-[2rem] font-semibold leading-none tracking-tight text-white sm:text-[2.5rem]">
            {formatMoney(account.balanceCents, locale, account.currency)}
          </p>
          {account.pendingDepositCents > 0 && (
            <p className="tnum mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-navy-100">
              {fill(t.accountsPage.pendingIn, {
                amount: formatMoney(account.pendingDepositCents, locale, account.currency),
              })}
            </p>
          )}
          {account.pendingWithdrawalCents > 0 && (
            <p className="tnum mt-2 text-[12px] text-navy-300">
              {fill(t.accountsPage.heldForWithdrawal, {
                amount: formatMoney(account.pendingWithdrawalCents, locale, account.currency),
              })}
            </p>
          )}

          {trend.hasShape && (
            <div className="mt-4">
              <BalanceTrend data={trendData} label={t.dashboard.trendLabel} />
            </div>
          )}

          <div className="no-scrollbar mt-5 flex gap-1 overflow-x-auto border-t border-white/10 pt-5 sm:gap-3">
            <QuickAction href="/transfers?tab=deposit" icon="plus" label={t.bank.actionDeposit} />
            <QuickAction href="/transfers?tab=send" icon="send" label={t.bank.actionSend} />
            <QuickAction href="/transfers?tab=withdraw" icon="bank" label={t.bank.withdraw} />
            {portfolio.savings && (
              <QuickAction href="/transfers?tab=between" icon="swap" label={t.bank.transfer} />
            )}
            <QuickAction href="/statements" icon="statement" label={t.statements.link} />
          </div>
        </div>

        {trend.hasShape && (
          <div className="grid grid-cols-2 gap-4">
            <Card padded={false} className="p-4 sm:p-5">
              <p className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                {t.dashboard.moneyIn}
              </p>
              <p className="tnum mt-1.5 text-xl font-semibold tracking-tight text-navy-900">
                {formatMoney(trend.inCents, locale, account.currency)}
              </p>
            </Card>
            <Card padded={false} className="p-4 sm:p-5">
              <p className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
                <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                {t.dashboard.moneyOut}
              </p>
              <p className="tnum mt-1.5 text-xl font-semibold tracking-tight text-navy-900">
                {formatMoney(trend.outCents, locale, account.currency)}
              </p>
            </Card>
          </div>
        )}

        <section>
          <SectionHead
            title={t.bank.recent}
            href={`/activity?account=${account.id}`}
            linkLabel={t.dashboard.viewAll}
          />
          <div className="mt-4">
            <TransactionList
              rows={rows}
              labels={{
                types: t.bank.types,
                statuses: t.bank.statuses,
                reference: t.bank.reference,
              }}
              locale={locale}
              currency={account.currency}
              emptyText={t.bank.none}
            />
          </div>
        </section>

        <Card>
          <SectionHead title={t.txn.detailsTitle} />
          <dl className="mt-4 divide-y divide-gray-100">
            {details.map((d) => (
              <div key={d.label} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-sm text-gray-500">{d.label}</dt>
                <dd
                  className={`text-right text-sm font-semibold text-navy-900 ${
                    d.mono ? "tnum font-mono" : ""
                  }`}
                >
                  {d.value}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href="/statements"
            className="mt-4 inline-block rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-semibold text-navy-800 transition hover:border-accent-500/40"
          >
            {t.statements.link}
          </Link>
        </Card>
      </Page>
    </AppShell>
  );
}
