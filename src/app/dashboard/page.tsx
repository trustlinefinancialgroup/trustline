import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/bank";
import { loadPortfolio, monthChangePercent } from "@/lib/portfolio";
import { listPayees } from "@/lib/payees";
import { balanceTrend } from "@/lib/trend";
import { showWelcomeBonus, welcomeBonusState } from "@/lib/promo";
import { getDict, getLocale } from "@/i18n/server";
import { fill } from "@/i18n";
import { buildProductView, latestByKey, productsWithLabels } from "@/lib/product-view";
import { productsFor } from "@/lib/products";
import { AppShell, Page } from "@/components/app-shell";
import { AccountCard } from "@/components/account-card";
import { BankCard } from "@/components/bank-card";
import { BalanceTrend } from "@/components/balance-trend";
import { BalanceHero } from "@/components/balance-hero";
import { Greeting } from "@/components/greeting";
import { NavIcons } from "@/components/icons";
import { ProductBanner } from "@/components/product-banner";
import { ProductTile } from "@/components/product-tile";
import { TransactionList } from "@/components/transaction-list";
import { SectionHead } from "@/components/ui";
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

  const [transactions, applications, change, bonus, trend, pending] = await Promise.all([
    db.transaction.findMany({
      where: { accountId: { in: portfolio.accountIds } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.productApplication.findMany({ where: { userId: user.id } }),
    monthChangePercent(portfolio.accountIds, portfolio.totalCents),
    welcomeBonusState(user.id, portfolio.accountIds, user.createdAt),
    balanceTrend(portfolio.accountIds),
    // Anything the client is waiting on. A pending item buried in a list reads
    // as nothing happening, which is exactly when people start worrying.
    db.transaction.findMany({
      where: { accountId: { in: portfolio.accountIds }, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
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
  const shortDate = new Intl.DateTimeFormat(INTL_LOCALES[locale] ?? "en-US", {
    month: "short",
    day: "numeric",
  });

  // Formatted server-side so the chart carries no locale or currency logic.
  const trendData = trend.points.map((p) => ({
    v: p.balanceCents,
    date: shortDate.format(p.at),
    value: formatMoney(p.balanceCents, locale, portfolio.currency),
  }));

  const banners = [
    submitted && t.bank.submittedBanner,
    withdrawSubmitted && t.bank.withdrawSubmittedBanner,
    transferred && t.bank.transferredBanner,
    applied && t.bank.appliedBanner,
    sent && (sent === "instant" ? t.bank.sentInstantBanner : t.bank.sentPendingBanner),
  ].filter(Boolean) as string[];

  // The people already paid, most recent first — the same list the payments
  // screen keeps, surfaced here so a repeat payment is one tap rather than
  // four. Guarded inside listPayees, so a missing table shows nothing.
  const beneficiaries = (await listPayees(user.id)).slice(0, 8).map((payee) => ({
    id: payee.id,
    name: payee.nickname ?? payee.name,
    initial: (payee.name.trim()[0] ?? "?").toUpperCase(),
  }));

  // Depositing is the action that starts everything else, so it is the one
  // that gets the gold. Everything else is peer-level.
  const heroActions = [
    { href: "/transfers?tab=deposit", icon: "plus", label: t.bank.actionDeposit, primary: true },
    { href: "/transfers?tab=send", icon: "send", label: t.bank.actionSend },
    { href: "/transfers?tab=withdraw", icon: "bank", label: t.bank.withdraw },
    { href: "/payments", icon: "bill", label: t.payments.tabPay },
    ...(portfolio.savings
      ? [{ href: "/transfers?tab=between", icon: "swap", label: t.bank.transfer }]
      : []),
    { href: "/statements", icon: "statement", label: t.statements.link },
  ];

  const heroAccountLabel = portfolio.primary
    ? `${t.bank.checking} \u00b7 \u00b7\u00b7\u00b7\u00b7 ${portfolio.primary.number.slice(-4)}`
    : t.dashboard.totalBalance;

  return (
    <AppShell user={user} active="dashboard" title={t.dashboard.overview} bleed>
      {/* The immersive top: balance, trend and actions in one gradient that
          runs to the screen edges and up behind the floating header. */}
      <BalanceHero
        bleed
          greeting={
            <Greeting
              morning={fill(t.dashboard.greetingMorning, { name: user.firstName })}
              afternoon={fill(t.dashboard.greetingAfternoon, { name: user.firstName })}
              evening={fill(t.dashboard.greetingEvening, { name: user.firstName })}
              fallback={fill(t.dashboard.welcomeBack, { name: user.firstName })}
            />
          }
          accountLabel={heroAccountLabel}
          balance={formatMoney(portfolio.totalCents, locale, portfolio.currency)}
          changePercent={change}
          changeLabel={t.dashboard.thisMonth}
          pendingNote={
            portfolio.totalPendingDepositCents > 0
              ? fill(t.bank.pendingNote, {
                  amount: formatMoney(
                    portfolio.totalPendingDepositCents,
                    locale,
                    portfolio.currency
                  ),
                })
              : null
          }
          trend={trend.hasShape ? trendData : []}
          trendLabel={t.dashboard.trendLabel}
          hideLabel={t.dashboard.hideBalance}
          showLabel={t.dashboard.showBalance}
          actions={heroActions}
        />

      <Page className="space-y-6 pt-6">
        {banners.map((text) => (
          <p
            key={text}
            className="rounded-xl border border-pos/25 bg-pos/10 px-4 py-3 text-sm font-medium text-pos"
          >
            {text}
          </p>
        ))}

        {showWelcomeBonus(bonus) && !bonus.credited && (
          <WelcomeBonusBanner
            state={bonus}
            t={t}
            locale={locale}
            currency={portfolio.currency}
            creditedDate={null}
          />
        )}

        {pending.length > 0 && (
          <section className="rise" style={{ animationDelay: "120ms" }}>
            <SectionHead title={t.dashboard.inProgress} subtitle={t.dashboard.inProgressBody} />
            <div className="elev-2 mt-4 overflow-hidden rounded-2xl border border-line bg-ink-1">
              {pending.map((tx, i) => (
                <Link
                  key={tx.id}
                  href={`/activity/${tx.id}`}
                  className={`flex items-center gap-3.5 px-4 py-3.5 transition hover:bg-ink-2 sm:px-5 ${
                    i > 0 ? "border-t border-line-soft" : ""
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400/12 text-amber-700">
                    <NavIcons.clock className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-fg">
                      {tx.note?.trim() ||
                        (t.bank.types[tx.type as keyof typeof t.bank.types] ?? tx.type)}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-fg-faint">
                      {t.txn.stepReview}
                    </p>
                  </div>
                  <p className="display shrink-0 text-[15px] font-semibold text-fg">
                    {formatMoney(Math.abs(tx.amountCents), locale, portfolio.currency)}
                  </p>
                  <NavIcons.chevronRight className="h-4 w-4 shrink-0 text-fg-faint" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Who you pay, then how the money moved. Both were a tap away
            before — a client should not have to go looking for either. */}
        {beneficiaries.length > 0 && (
          <section>
            <SectionHead
              title={t.dashboard.sendAgain}
              subtitle={t.dashboard.beneficiaries}
              href="/payments?tab=payees"
              linkLabel={t.dashboard.viewAll}
            />
            <div className="no-scrollbar -mx-5 mt-4 flex gap-3 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              {beneficiaries.map((b) => (
                <Link
                  key={b.id}
                  href={`/payments?payee=${b.id}`}
                  className="group flex w-[4.75rem] shrink-0 flex-col items-center gap-2 text-center"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-ink-1 text-[15px] font-semibold text-brand-500 transition group-hover:border-brand-500/50">
                    {b.initial}
                  </span>
                  <span className="w-full truncate text-[11.5px] font-medium text-fg-muted transition group-hover:text-fg">
                    {b.name}
                  </span>
                </Link>
              ))}
              <Link
                href="/payments?tab=payees"
                className="group flex w-[4.75rem] shrink-0 flex-col items-center gap-2 text-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-line text-fg-faint transition group-hover:border-brand-500/50 group-hover:text-brand-500">
                  <NavIcons.plus className="h-5 w-5" />
                </span>
                <span className="w-full truncate text-[11.5px] font-medium text-fg-muted transition group-hover:text-fg">
                  {t.dashboard.addNew}
                </span>
              </Link>
            </div>
          </section>
        )}

        {trend.hasShape && (
          <section>
            <SectionHead title={t.dashboard.insights} subtitle={t.dashboard.last90} />
            <div className="elev-1 mt-4 grid grid-cols-2 divide-x divide-line overflow-hidden rounded-2xl border border-line bg-ink-1 sm:grid-cols-3 sm:divide-y-0">
              <div className="p-4 sm:p-5">
                <p className="flex items-center gap-2 text-[12px] font-medium text-fg-muted">
                  <span className="h-2 w-2 rounded-full bg-pos" aria-hidden="true" />
                  {t.dashboard.moneyIn}
                </p>
                <p className="tnum mt-1.5 text-xl font-semibold tracking-tight text-fg">
                  {formatMoney(trend.inCents, locale, portfolio.currency)}
                </p>
              </div>
              <div className="p-4 sm:p-5">
                <p className="flex items-center gap-2 text-[12px] font-medium text-fg-muted">
                  <span className="h-2 w-2 rounded-full bg-neg" aria-hidden="true" />
                  {t.dashboard.moneyOut}
                </p>
                <p className="tnum mt-1.5 text-xl font-semibold tracking-tight text-fg">
                  {formatMoney(trend.outCents, locale, portfolio.currency)}
                </p>
              </div>
              {/* Net spans the row on a phone, where there are only two
                  columns, because it is the figure the other two are for. */}
              <div className="col-span-2 border-t border-line p-4 sm:col-span-1 sm:border-t-0 sm:p-5">
                <p className="text-[12px] font-medium text-fg-muted">{t.dashboard.net}</p>
                <p
                  className={`tnum mt-1.5 text-xl font-semibold tracking-tight ${
                    trend.inCents - trend.outCents >= 0 ? "text-pos" : "text-neg"
                  }`}
                >
                  {trend.inCents - trend.outCents >= 0 ? "+" : "\u2212"}
                  {formatMoney(Math.abs(trend.inCents - trend.outCents), locale, portfolio.currency)}
                </p>
              </div>
            </div>
          </section>
        )}

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
                href={`/accounts/${account.id}`}
              />
            ))}
            {!portfolio.savings && savingsOffered && (
              <Link
                href="/product/SAVINGS"
                className="group flex min-h-[9.5rem] flex-col items-start justify-center gap-2 rounded-2xl border border-dashed border-line bg-ink-1/60 p-5 transition hover:border-accent-500/50 hover:bg-ink-1"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/12 text-brand-400">
                  <NavIcons.plus className="h-[18px] w-[18px]" />
                </span>
                <p className="text-sm font-semibold text-fg">{t.bank.openSavings}</p>
                <p className="text-[13px] leading-relaxed text-fg-muted">
                  {t.accountsPage.openSavingsBody}
                </p>
              </Link>
            )}
          </div>
        </section>

        {showWelcomeBonus(bonus) && bonus.credited && (
          <WelcomeBonusBanner
            state={bonus}
            t={t}
            locale={locale}
            currency={portfolio.currency}
            creditedDate={bonus.creditedAt ? dateFmt.format(bonus.creditedAt) : null}
          />
        )}

        {/* Product suite for the client's account type */}
        <section>
          <SectionHead title={t.products.yourProducts} subtitle={t.products.productsSubtitle} />

          {/* Phone: stacked banners. The artwork fills the right half of each
              card and bleeds off its edge, so the suite still looks like a
              bank, while five of them come to ~630px instead of the ~1900px
              five full tiles took. Nothing scrolls sideways. */}
          <div className="mt-4 space-y-3 sm:hidden">
            {productViews.map((v) => (
              <Link key={v.def.key} href={v.href} className="group block">
                <ProductBanner
                  title={v.title}
                  body={v.body}
                  art={v.render === "tile" ? v.art : null}
                  theme={v.render === "card" ? v.theme : null}
                  badge={v.render === "card" ? v.badge : null}
                  holder={v.render === "card" ? v.holder : null}
                  holderPlaceholder={v.render === "card" ? v.holderPlaceholder : ""}
                  number={v.render === "card" ? v.number : null}
                  expiry={v.render === "card" ? v.expiry : null}
                  valueLabel={v.valueLabel}
                  value={v.value}
                  status={v.status}
                  cta={v.cta}
                  placeholder={v.placeholder}
                />
              </Link>
            ))}
          </div>

          {/* Tablet and up there is room for every face at full size. */}
          <div className="mt-5 hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {productViews.map((v) => (
              <Link
                key={v.def.key}
                href={v.href}
                className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
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
                {/* A product needs a name, a line on what it is, and a figure
                    or an action — not a title with a pill stuck to it. */}
                <div className="mt-3 flex items-end justify-between gap-3 px-1">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-fg">{v.title}</p>
                    {v.value ? (
                      <p className="tnum mt-0.5 truncate text-[13px] text-fg-muted">
                        {v.valueLabel ? `${v.valueLabel}: ` : ""}
                        {v.value}
                      </p>
                    ) : (
                      <p className="mt-0.5 line-clamp-1 text-[13px] text-fg-muted">{v.body}</p>
                    )}
                  </div>
                  {!v.value && (
                    <span className="shrink-0 text-[13px] font-medium text-brand-400 transition group-hover:text-fg">
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

        <p className="flex items-center justify-end gap-2 text-right text-xs text-fg-faint">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-line text-[9px] font-bold text-fg-muted">
            FDIC
          </span>
          {t.bank.fdic}
        </p>
      </Page>
    </AppShell>
  );
}
