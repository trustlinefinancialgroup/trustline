import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/bank";
import { loadPortfolio } from "@/lib/portfolio";
import { loadHoldings } from "@/lib/holdings";
import { productsWithLabels } from "@/lib/product-view";
import { productsFor } from "@/lib/products";
import { availableCreditCents } from "@/lib/lending";
import { getDict, getLocale } from "@/i18n/server";
import { AppShell, Page } from "@/components/app-shell";
import { AccountCard } from "@/components/account-card";
import { Icons, NavIcons } from "@/components/icons";
import { Eyebrow, SectionHead, StatusChip } from "@/components/ui";

export const metadata = { title: "Accounts — Trustline Financial Group" };

export default async function AccountsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isAdmin(user.role)) redirect("/admin");
  if (user.status === "PENDING") redirect("/onboarding");
  if (user.status !== "ACTIVE") redirect("/login");

  const t = await getDict();
  const locale = await getLocale();

  const [portfolio, holdings] = await Promise.all([
    loadPortfolio(user.id),
    loadHoldings(user.id, user.accountType),
  ]);

  // One localized title per product key, so listings never re-derive labels.
  const titles = new Map(
    productsWithLabels(t, user.accountType).map(({ def, item }) => [def.key, item.title])
  );

  // Business clients have no savings product, so don't offer them one.
  const savingsOffered = productsFor(user.accountType).some((d) => d.key === "SAVINGS");

  const dateFmt = new Intl.DateTimeFormat(
    { en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES" }[locale],
    { dateStyle: "medium" }
  );

  return (
    <AppShell
      user={user}
      active="accounts"
      title={t.accountsPage.title}
      subtitle={t.accountsPage.subtitle}
    >
      <Page className="space-y-8">
        {/* Deposit accounts */}
        <section>
          <SectionHead title={t.accountsPage.groupDeposit} />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.accounts.map((account) => (
              <div key={account.id} className="space-y-2">
                <AccountCard
                  account={account}
                  t={t}
                  locale={locale}
                  href={`/activity?account=${account.id}`}
                  showFullNumber
                />
                <p className="px-1 text-[11px] text-gray-400">
                  {t.accountsPage.opened} {dateFmt.format(account.createdAt)}
                </p>
              </div>
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

        {/* Cards and credit */}
        {holdings.cards.length > 0 && (
          <section>
            <SectionHead
              title={t.accountsPage.groupCredit}
              href="/cards"
              linkLabel={t.dashboard.viewAll}
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {holdings.cards.map(({ app, def }) => {
                const available = availableCreditCents(app.approvedAmountCents, app.outstandingCents);
                return (
                  <Link
                    key={app.id}
                    href={`/cards?card=${app.id}`}
                    className="group block rounded-2xl border border-gray-200/80 bg-white p-5 transition hover:border-accent-500/40 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Eyebrow className="text-gray-500">
                          {titles.get(def.key) ?? def.key}
                        </Eyebrow>
                        {app.cardNumber && (
                          <p className="tnum mt-1 font-mono text-[12px] text-gray-400">
                            ···· {app.cardNumber.slice(-4)}
                          </p>
                        )}
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                        <Icons.card className="h-[18px] w-[18px]" />
                      </span>
                    </div>
                    <p className="tnum mt-4 text-2xl font-semibold tracking-tight text-navy-900">
                      {formatMoney(app.outstandingCents ?? 0, locale, user.currency)}
                    </p>
                    {available !== null && (
                      <p className="tnum mt-1 text-[12px] text-gray-500">
                        {t.products.availableCredit}:{" "}
                        {formatMoney(available, locale, user.currency)}
                      </p>
                    )}
                    <div className="mt-3">
                      {app.frozen ? (
                        <StatusChip tone="bad">{t.products.frozenBadge}</StatusChip>
                      ) : (
                        <StatusChip tone="ok">{t.products.active}</StatusChip>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Loans and mortgages */}
        {holdings.loans.length > 0 && (
          <section>
            <SectionHead
              title={t.accountsPage.groupLending}
              href="/loans"
              linkLabel={t.dashboard.viewAll}
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {holdings.loans.map(({ app, def }) => (
                <Link
                  key={app.id}
                  href={`/product/${def.key}`}
                  className="group block rounded-2xl border border-gray-200/80 bg-white p-5 transition hover:border-accent-500/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Eyebrow className="text-gray-500">
                      {titles.get(def.key) ?? def.key}
                    </Eyebrow>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                      <Icons.lending className="h-[18px] w-[18px]" />
                    </span>
                  </div>
                  <p className="tnum mt-4 text-2xl font-semibold tracking-tight text-navy-900">
                    {formatMoney(app.outstandingCents ?? 0, locale, user.currency)}
                  </p>
                  {app.interestRate && (
                    <p className="tnum mt-1 text-[12px] text-gray-500">{app.interestRate}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </Page>
    </AppShell>
  );
}
