import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/bank";
import { loadPortfolio, monthChangePercent } from "@/lib/portfolio";
import { showWelcomeBonus, welcomeBonusState } from "@/lib/promo";
import { getDict, getLocale } from "@/i18n/server";
import { fill } from "@/i18n";
import { buildProductView, latestByKey, productsWithLabels } from "@/lib/product-view";
import { productsFor } from "@/lib/products";
import { AppShell, Page } from "@/components/app-shell";
import { AccountCard } from "@/components/account-card";
import { BankCard } from "@/components/bank-card";
import { Greeting, TodayDate } from "@/components/greeting";
import { Icons, NavIcons } from "@/components/icons";
import { ProductTile } from "@/components/product-tile";
import { TransactionList } from "@/components/transaction-list";
import { ActionButton, Eyebrow, SectionHead } from "@/components/ui";
import { WelcomeBonusBanner } from "@/components/welcome-bonus";

export const metadata = { title: "Dashboard — Trustline Financial Group" };

const INTL_LOCALES: Record<string, string> = {
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    submitted?: string;
    withdrawSubmitted?: string;
    transferred?: string;
    applied?: string;
    sent?: string;
  }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isAdmin(user.role)) redirect("/admin");
  if (user.status === "PENDING") redirect("/onboarding");
  if (user.status !== "ACTIVE") redirect("/login");

  const t = await getDict();
  const locale = await getLocale();
  const { submitted, withdrawSubmitted, transferred, applied, sent } = await searchParams;

  const portfolio = await loadPortfolio(user.id);

  const [transactions, applications, change, bonus] = await Promise.all([
    db.transaction.findMany({
      where: { accountId: { in: portfolio.accountIds } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.productApplication.findMany({ where: { userId: user.id } }),
    monthChangePercent(portfolio.accountIds, portfolio.totalCents),
    welcomeBonusState(user.id, portfolio.accountIds, user.createdAt),
  ]);

  // Latest application per product key, turned into a card view per product.
  const appByKey = latestByKey(applications);
  const holderName = `${user.firstName} ${user.lastName}`.trim();
  const productViews = productsWithLabels(t, user.accountType).map(({ def, item }) =>
    buildProductView({
      def,
      item,
      app: appByKey.get(def.key) ?? null,
      savingsOpen: Boolean(portfolio.savings),
      savingsBalanceCents: portfolio.savings?.balanceCents ?? 0,
      savingsNumber: portfolio.savings?.number,
      t,
      locale,
      currency: user.currency,
      holderName,
    })
  );

  // Savings is a personal product — business clients have no /product/SAVINGS
  // page, so offering them one would land on a 404.
  const savingsOffered = productsFor(user.accountType).some((d) => d.key === "SAVINGS");

  const dateFmt = new Intl.DateTimeFormat(INTL_LOCALES[locale] ?? "en-US", { dateStyle: "medium" });

  const banners = [
    submitted && t.bank.submittedBanner,
    withdrawSubmitted && t.bank.withdrawSubmittedBanner,
    transferred && t.bank.transferredBanner,
    applied && t.bank.appliedBanner,
    sent && (sent === "instant" ? t.bank.sentInstantBanner : t.bank.sentPendingBanner),
  ].filter(Boolean) as string[];

  return (
    <AppShell
      user={user}
      active="dashboard"
      title={
        <Greeting
          morning={fill(t.dashboard.greetingMorning, { name: user.firstName })}
          afternoon={fill(t.dashboard.greetingAfternoon, { name: user.firstName })}
          evening={fill(t.dashboard.greetingEvening, { name: user.firstName })}
          fallback={fill(t.dashboard.welcomeBack, { name: user.firstName })}
        />
      }
      subtitle={<TodayDate locale={INTL_LOCALES[locale] ?? "en-US"} />}
    >
      <Page className="space-y-6">
        {banners.map((text) => (
          <p
            key={text}
            className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
          >
            {text}
          </p>
        ))}

        {showWelcomeBonus(bonus) && (
          <WelcomeBonusBanner
            state={bonus}
            t={t}
            locale={locale}
            currency={portfolio.currency}
            creditedDate={bonus.creditedAt ? dateFmt.format(bonus.creditedAt) : null}
          />
        )}

        {/* Portfolio hero */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 p-6 shadow-lg shadow-navy-900/20 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <Eyebrow className="text-navy-300">{t.dashboard.totalBalance}</Eyebrow>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="tnum text-4xl font-semibold tracking-tight text-white sm:text-[2.75rem]">
                  {formatMoney(portfolio.totalCents, locale, portfolio.currency)}
                </p>
                {change !== null && (
                  <span
                    className={`tnum inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                      change >= 0
                        ? "bg-emerald-400/15 text-emerald-300"
                        : "bg-red-400/15 text-red-300"
                    }`}
                  >
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(1)}% {t.dashboard.thisMonth}
                  </span>
                )}
              </div>
              <p className="tnum mt-2 text-sm text-navy-300">
                {t.bank.accountNo} {portfolio.primary.number}
              </p>
              {portfolio.totalPendingDepositCents > 0 && (
                <p className="tnum mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-navy-100">
                  {fill(t.bank.pendingNote, {
                    amount: formatMoney(
                      portfolio.totalPendingDepositCents,
                      locale,
                      portfolio.currency
                    ),
                  })}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <ActionButton href="/transfers?tab=deposit" icon="arrowDown">
                {t.bank.makeDeposit}
              </ActionButton>
              <ActionButton href="/transfers?tab=send" icon="exchange" variant="ghost">
                {t.bank.sendMoney}
              </ActionButton>
              <ActionButton href="/transfers?tab=withdraw" icon="arrowUp" variant="ghost">
                {t.bank.withdraw}
              </ActionButton>
            </div>
          </div>
        </div>

        {/* Accounts */}
        <section>
          <SectionHead
            title={t.dashboard.yourAccounts}
            href="/accounts"
            linkLabel={t.dashboard.viewAll}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                t={t}
                locale={locale}
                href={`/activity?account=${account.id}`}
              />
            ))}
            {!portfolio.savings && savingsOffered && (
              <Link
                href="/product/SAVINGS"
                className="group flex min-h-[9.5rem] flex-col items-start justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white/60 p-5 transition hover:border-accent-500/50 hover:bg-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                  <NavIcons.plus className="h-[18px] w-[18px]" />
                </span>
                <p className="text-sm font-semibold text-navy-900">{t.bank.openSavings}</p>
                <p className="text-[13px] leading-relaxed text-gray-500">
                  {t.accountsPage.openSavingsBody}
                </p>
              </Link>
            )}
          </div>
        </section>

        {/* Secondary destinations that aren't on the tab bar */}
        <div className="flex flex-wrap gap-2.5">
          {[
            { href: "/statements", label: t.statements.link, icon: "statement" },
            { href: "/goals", label: t.bank.goalsLink, icon: "savings" },
            { href: "/documents", label: t.appnav.documents, icon: "list" },
            { href: "/support", label: t.support.link, icon: "chat" },
          ].map((link) => {
            const Icon = NavIcons[link.icon] ?? Icons[link.icon];
            return (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-navy-800 transition hover:border-accent-500/40 hover:shadow-sm"
              >
                <Icon className="h-4 w-4 text-gray-400" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Product suite for the client's account type */}
        <section>
          <SectionHead title={t.products.yourProducts} subtitle={t.products.productsSubtitle} />
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {productViews.map((v) => (
              <Link
                key={v.def.key}
                href={v.href}
                className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
              >
                {v.render === "card" ? (
                  <BankCard
                    theme={v.theme}
                    productName={v.title}
                    badge={v.badge}
                    holder={v.holder}
                    holderPlaceholder={v.holderPlaceholder}
                    number={v.number}
                    expiry={v.expiry}
                    valueLabel={v.valueLabel}
                    value={v.value}
                    status={v.status}
                    placeholder={v.placeholder}
                    className={`transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl ${
                      v.placeholder ? "opacity-80 group-hover:opacity-100" : ""
                    }`}
                  />
                ) : (
                  <ProductTile
                    title={v.title}
                    art={v.art}
                    valueLabel={v.valueLabel}
                    value={v.value}
                    status={v.status}
                    placeholder={v.placeholder}
                    cta={null}
                    className="transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl"
                  />
                )}
                <div className="mt-3 flex items-center gap-2 px-1">
                  <p className="text-sm font-semibold text-navy-900">{v.title}</p>
                  {!v.value && (
                    <span className="rounded-full bg-accent-50 px-2.5 py-0.5 text-[11px] font-semibold text-accent-700 transition group-hover:bg-accent-500 group-hover:text-white">
                      {v.cta}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <SectionHead title={t.bank.recent} href="/activity" linkLabel={t.dashboard.viewAll} />
          <div className="mt-4">
            <TransactionList
              rows={transactions}
              labels={{
                types: t.bank.types,
                statuses: t.bank.statuses,
                reference: t.bank.reference,
              }}
              locale={locale}
              currency={portfolio.currency}
              emptyText={t.bank.none}
            />
          </div>
        </section>

        <p className="flex items-center justify-end gap-2 text-right text-xs text-gray-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-[9px] font-bold text-gray-500">
            FDIC
          </span>
          {t.bank.fdic}
        </p>
      </Page>
    </AppShell>
  );
}
