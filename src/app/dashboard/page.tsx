import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth-actions";
import { balanceCents, ensureAccount, formatMoney, pendingDepositCents } from "@/lib/bank";
import { getDict, getLocale } from "@/i18n/server";
import { fill } from "@/i18n";
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
  searchParams: Promise<{ submitted?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isAdmin(user.role)) redirect("/admin");
  if (user.status === "PENDING") redirect("/onboarding");
  if (user.status !== "ACTIVE") redirect("/login");

  const t = await getDict();
  const locale = await getLocale();
  const { submitted } = await searchParams;

  const account = await ensureAccount(user.id);
  const [balance, pending, transactions, notifications] = await Promise.all([
    balanceCents(account.id),
    pendingDepositCents(account.id),
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
  ]);

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
            <Link
              href="/deposit"
              className="rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-600"
            >
              {t.bank.makeDeposit}
            </Link>
          </div>
        </div>

        {/* Product suite for the client's account type */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(user.accountType === "COMMERCIAL"
            ? t.landing.commercial.items
            : t.landing.personal.items
          ).map((p, i) => {
            const isDeposits = user.accountType === "COMMERCIAL" && i === 1;
            const card = (
              <div
                className={`h-full rounded-2xl border bg-white p-5 shadow-sm transition ${
                  isDeposits
                    ? "border-accent-500/40 hover:border-accent-500 hover:shadow-md"
                    : "border-gray-200"
                }`}
              >
                <div className={`h-1 w-6 rounded-full ${isDeposits ? "bg-accent-500" : "bg-gray-200"}`} />
                <p className="mt-3 text-sm font-semibold text-navy-900">{p.title}</p>
                <p className={`mt-1 text-xs ${isDeposits ? "font-semibold text-accent-600" : "text-gray-500"}`}>
                  {isDeposits ? t.bank.makeDeposit : t.bank.comingSoon}
                </p>
              </div>
            );
            return isDeposits ? (
              <Link key={p.title} href="/deposit">
                {card}
              </Link>
            ) : (
              <div key={p.title}>{card}</div>
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
      </div>
    </main>
  );
}
