import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth-actions";
import { balanceCents, ensureAccount, formatMoney, getSavings, pendingDepositCents } from "@/lib/bank";
import { getDict, getLocale } from "@/i18n/server";
import { fill } from "@/i18n";
import { productsFor } from "@/lib/products";
import { openSavingsAction } from "@/lib/actions/product-actions";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { NotificationCenter } from "@/components/notification-center";

export const metadata = { title: "Dashboard — Trustline Financial Group" };

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  POSTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    submitted?: string;
    withdrawSubmitted?: string;
    transferred?: string;
    applied?: string;
  }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isAdmin(user.role)) redirect("/admin");
  if (user.status === "PENDING") redirect("/onboarding");
  if (user.status !== "ACTIVE") redirect("/login");

  const t = await getDict();
  const locale = await getLocale();
  const { submitted, withdrawSubmitted, transferred, applied } = await searchParams;

  const account = await ensureAccount(user.id);
  const savings = await getSavings(user.id);
  const [balance, pending, savingsBal, transactions, notifications, applications] =
    await Promise.all([
      balanceCents(account.id),
      pendingDepositCents(account.id),
      savings ? balanceCents(savings.id) : Promise.resolve(0),
      db.transaction.findMany({
        where: { accountId: account.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      db.productApplication.findMany({ where: { userId: user.id } }),
    ]);

  // Latest application per product key.
  const appByKey = new Map<string, (typeof applications)[number]>();
  for (const a of applications) {
    const prev = appByKey.get(a.productKey);
    if (!prev || a.createdAt > prev.createdAt) appByKey.set(a.productKey, a);
  }
  const products = productsFor(user.accountType);
  const productItems =
    user.accountType === "COMMERCIAL" ? t.landing.commercial.items : t.landing.personal.items;

  const dateFmt = new Intl.DateTimeFormat(
    { en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES" }[locale],
    { dateStyle: "medium" }
  );

  const notifItems = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    unread: n.readAt === null,
    time: dateFmt.format(n.createdAt),
  }));

  return (
    <main className="flex-1 bg-navy-50/50">
      <header className="border-b border-white/10 bg-navy-900">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo theme="dark" href="/dashboard" />
          <div className="flex items-center gap-3">
            <NotificationCenter
              items={notifItems}
              labels={{ title: t.notif.title, empty: t.notif.empty, dismiss: t.notif.dismiss }}
            />
            <LanguageSwitcher current={locale} variant="dark" />
            <form action={logoutAction}>
              <button className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                {t.common.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {submitted && (
          <p className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
            {t.bank.submittedBanner}
          </p>
        )}
        {withdrawSubmitted && (
          <p className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
            {t.bank.withdrawSubmittedBanner}
          </p>
        )}
        {transferred && (
          <p className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
            {t.bank.transferredBanner}
          </p>
        )}
        {applied && (
          <p className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
            {t.bank.appliedBanner}
          </p>
        )}

        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          {fill(t.dashboard.welcome, { name: user.firstName })}
        </h1>

        {/* Balance hero */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 p-8 shadow-lg shadow-navy-900/20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-navy-300">
                {t.bank.availableBalance}
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-white">
                {formatMoney(balance, locale, account.currency)}
              </p>
              <p className="mt-2 text-sm text-navy-300">
                {t.bank.accountNo} {account.number}
              </p>
              {pending > 0 && (
                <p className="mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-navy-100">
                  {fill(t.bank.pendingNote, {
                    amount: formatMoney(pending, locale, account.currency),
                  })}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/deposit"
                className="rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-600"
              >
                {t.bank.makeDeposit}
              </Link>
              <Link
                href="/withdraw"
                className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t.bank.withdraw}
              </Link>
            </div>
          </div>
        </div>

        {/* Savings account card */}
        {savings && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wide text-gray-500">
                {t.bank.savings}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-navy-900">
                {formatMoney(savingsBal, locale, savings.currency)}
              </p>
              <p className="mt-1 text-xs text-gray-500">{savings.number}</p>
            </div>
            <Link
              href="/transfer"
              className="rounded-full bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
            >
              {t.bank.transfer}
            </Link>
          </div>
        )}

        {/* Product suite for the client's account type */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((def, i) => {
            const item = productItems[i];
            const app = appByKey.get(def.key);

            // Determine the tile's call-to-action and state label.
            let href: string | null = null;
            let stateLabel = "";
            let stateClass = "text-gray-500";
            let barClass = "bg-gray-200";

            if (def.kind === "deposit") {
              href = "/deposit";
              stateLabel = t.bank.makeDeposit;
              stateClass = "font-semibold text-accent-600";
              barClass = "bg-accent-500";
            } else if (def.kind === "savings") {
              href = savings ? "/transfer" : null;
              stateLabel = savings ? t.products.active : t.products.open;
              stateClass = "font-semibold text-accent-600";
              barClass = "bg-accent-500";
            } else {
              // applyable product
              if (!app || app.status === "DECLINED") {
                href = `/apply?type=${def.key}`;
                stateLabel = app?.status === "DECLINED" ? t.products.reapply : t.products.apply;
                stateClass = "font-semibold text-accent-600";
                barClass = app?.status === "DECLINED" ? "bg-red-300" : "bg-accent-500";
              } else if (app.status === "SUBMITTED") {
                stateLabel = t.products.underReview;
                stateClass = "font-semibold text-amber-600";
                barClass = "bg-amber-400";
              } else if (app.status === "APPROVED") {
                href = `/product/${app.id}`;
                stateLabel = app.frozen
                  ? t.products.frozenBadge
                  : app.approvedAmountCents
                    ? fill(t.products.approvedFor, {
                        amount: formatMoney(app.approvedAmountCents, locale),
                      })
                    : t.products.active;
                stateClass = app.frozen ? "font-semibold text-red-600" : "font-semibold text-green-600";
                barClass = app.frozen ? "bg-red-400" : "bg-green-500";
              }
            }

            const inner = (
              <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-accent-500/40 hover:shadow-md">
                <div className={`h-1 w-6 rounded-full ${barClass}`} />
                <p className="mt-3 text-sm font-semibold text-navy-900">{item.title}</p>
                <p className={`mt-1 text-xs ${stateClass}`}>{stateLabel}</p>
              </div>
            );

            if (def.kind === "savings" && !savings) {
              return (
                <form key={def.key} action={openSavingsAction} className="h-full">
                  <button type="submit" className="block h-full w-full text-left">
                    {inner}
                  </button>
                </form>
              );
            }
            return href ? (
              <Link key={def.key} href={href}>
                {inner}
              </Link>
            ) : (
              <div key={def.key}>{inner}</div>
            );
          })}
        </div>

        {/* Recent activity */}
        <h2 className="mt-10 text-lg font-semibold tracking-tight text-navy-900">
          {t.bank.recent}
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          {transactions.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-gray-500">{t.bank.none}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-navy-900">
                        {t.bank.types[tx.type as keyof typeof t.bank.types] ?? tx.type}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {dateFmt.format(tx.createdAt)} · {t.bank.reference} {tx.reference}
                        {tx.note ? ` · ${tx.note}` : ""}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p
                        className={`font-semibold ${
                          tx.status === "REJECTED"
                            ? "text-gray-400 line-through"
                            : tx.amountCents >= 0
                              ? "text-green-700"
                              : "text-navy-900"
                        }`}
                      >
                        {tx.amountCents >= 0 ? "+" : ""}
                        {formatMoney(tx.amountCents, locale, account.currency)}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusStyles[tx.status] ?? ""}`}
                      >
                        {t.bank.statuses[tx.status as keyof typeof t.bank.statuses] ?? tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-8 flex items-center justify-end gap-2 text-right text-xs text-gray-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-[9px] font-bold text-gray-500">
            FDIC
          </span>
          {t.bank.fdic}
        </p>
      </div>
    </main>
  );
}
