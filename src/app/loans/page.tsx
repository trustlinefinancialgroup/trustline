import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/bank";
import { loadHoldings } from "@/lib/holdings";
import {
  availableCreditCents,
  isOverdue,
  monthlyPaymentCents,
  parseRatePercent,
  repaidPercent,
} from "@/lib/lending";
import { productsWithLabels } from "@/lib/product-view";
import { productsFor } from "@/lib/products";
import { getDict, getLocale } from "@/i18n/server";
import { fill } from "@/i18n";
import { AppShell, Page } from "@/components/app-shell";
import { Icons } from "@/components/icons";
import {
  Card,
  EmptyState,
  Eyebrow,
  ProgressBar,
  SectionHead,
  StatusChip,
} from "@/components/ui";

export const metadata = { title: "Loans — Trustline Financial Group" };

export default async function LoansPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isAdmin(user.role)) redirect("/admin");
  if (user.status === "PENDING") redirect("/onboarding");
  if (user.status !== "ACTIVE") redirect("/login");

  const t = await getDict();
  const locale = await getLocale();

  const holdings = await loadHoldings(user.id, user.accountType);
  const titles = new Map(
    productsWithLabels(t, user.accountType).map(({ def, item }) => [def.key, item.title])
  );

  // Every application the client has made, so the page shows decisions too.
  const applications = await db.productApplication.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const dateFmt = new Intl.DateTimeFormat(
    { en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES" }[locale],
    { dateStyle: "medium" }
  );

  // What this client could actually borrow — cards live on their own page.
  const lendingProducts = productsFor(user.accountType).filter((d) => d.credit && !d.card);

  const lendingApplications = applications.filter((a) => {
    const title = titles.get(a.productKey);
    return title && holdings.loans.every((l) => l.app.id !== a.id);
  });

  return (
    <AppShell
      user={user}
      active="loans"
      title={t.loansPage.title}
      subtitle={t.loansPage.subtitle}
      actions={
        lendingProducts.length > 0 ? (
          <Link
            href={`/product/${lendingProducts[0].key}`}
            className="hidden rounded-xl bg-accent-500 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-accent-600 sm:inline-flex"
          >
            {t.products.apply}
          </Link>
        ) : null
      }
    >
      <Page className="space-y-8">
        {holdings.loans.length === 0 ? (
          <section>
            <EmptyState title={t.loansPage.empty} body={t.loansPage.emptyBody} />
            {lendingProducts.length > 0 && (
              <>
                <SectionHead className="mt-8" title={t.loansPage.available} />
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {lendingProducts.map((d) => (
                    <Link
                      key={d.key}
                      href={`/product/${d.key}`}
                      className="group rounded-2xl border border-gray-200/80 bg-white p-5 transition hover:border-accent-500/40 hover:shadow-md"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                        <Icons.lending className="h-5 w-5" />
                      </span>
                      <p className="mt-3 text-sm font-semibold text-navy-900">
                        {titles.get(d.key) ?? d.key}
                      </p>
                      <span className="mt-2 inline-block rounded-full bg-accent-50 px-2.5 py-0.5 text-[11px] font-semibold text-accent-700 transition group-hover:bg-accent-500 group-hover:text-white">
                        {t.products.apply}
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>
        ) : (
          <section>
            <SectionHead title={t.loansPage.activeLoans} />
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {holdings.loans.map(({ app, def }) => {
                const revolving = def.credit === "revolving";
                const principal = app.approvedAmountCents ?? 0;
                const owed = app.outstandingCents ?? 0;
                const rate = parseRatePercent(app.interestRate);
                const monthly = revolving
                  ? null
                  : monthlyPaymentCents(principal, rate, app.termMonths);
                const progress = revolving ? null : repaidPercent(principal, owed);
                const available = revolving
                  ? availableCreditCents(app.approvedAmountCents, owed)
                  : null;
                const overdue = isOverdue(app.dueDate, owed);

                return (
                  <Card key={app.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Eyebrow className="text-gray-500">
                          {titles.get(def.key) ?? def.key}
                        </Eyebrow>
                        <p className="tnum mt-1.5 text-2xl font-semibold tracking-tight text-navy-900">
                          {formatMoney(owed, locale, user.currency)}
                        </p>
                        <p className="mt-0.5 text-[12px] text-gray-500">
                          {revolving ? t.loansPage.drawn : t.loansPage.balanceOwed}
                        </p>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                        <Icons.lending className="h-5 w-5" />
                      </span>
                    </div>

                    {/* Repayment progress — installment lending only */}
                    {progress !== null && (
                      <div className="mt-4">
                        <ProgressBar percent={progress} tone="ok" />
                        <p className="tnum mt-2 text-[12px] text-gray-500">
                          {fill(t.loansPage.paidOf, {
                            percent: String(Math.round(progress)),
                            total: formatMoney(principal, locale, user.currency),
                          })}
                        </p>
                      </div>
                    )}

                    <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-[13px]">
                      {app.interestRate && (
                        <div>
                          <dt className="text-gray-500">{t.products.interestRateLabel}</dt>
                          <dd className="tnum mt-0.5 font-semibold text-navy-900">
                            {app.interestRate}
                          </dd>
                        </div>
                      )}
                      {app.dueDate && (
                        <div>
                          <dt className="text-gray-500">{t.products.dueDateLabel}</dt>
                          <dd
                            className={`tnum mt-0.5 font-semibold ${
                              overdue ? "text-red-600" : "text-navy-900"
                            }`}
                          >
                            {dateFmt.format(app.dueDate)}
                          </dd>
                        </div>
                      )}
                      {monthly !== null && (
                        <div>
                          <dt className="text-gray-500">{t.loansPage.monthlyPayment}</dt>
                          <dd className="tnum mt-0.5 font-semibold text-navy-900">
                            {formatMoney(monthly, locale, user.currency)}
                          </dd>
                        </div>
                      )}
                      {app.termMonths && (
                        <div>
                          <dt className="text-gray-500">{t.loansPage.term}</dt>
                          <dd className="tnum mt-0.5 font-semibold text-navy-900">
                            {fill(t.loansPage.months, { count: String(app.termMonths) })}
                          </dd>
                        </div>
                      )}
                      {available !== null && (
                        <div>
                          <dt className="text-gray-500">{t.products.availableCredit}</dt>
                          <dd className="tnum mt-0.5 font-semibold text-navy-900">
                            {formatMoney(available, locale, user.currency)}
                          </dd>
                        </div>
                      )}
                    </dl>

                    {overdue && (
                      <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-800">
                        {t.loansPage.overdue}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link
                        href={`/product/${def.key}`}
                        className="rounded-xl bg-navy-800 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-navy-700"
                      >
                        {t.loansPage.manage}
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Applications, decided and undecided */}
        {lendingApplications.length > 0 && (
          <section>
            <SectionHead title={t.loansPage.applications} />
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200/80 bg-white">
              {lendingApplications.map((a, i) => (
                <Link
                  key={a.id}
                  href={`/product/${a.productKey}`}
                  className={`flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-navy-50/50 ${
                    i > 0 ? "border-t border-gray-100" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-navy-900">
                      {titles.get(a.productKey) ?? a.productKey}
                    </p>
                    <p className="tnum mt-0.5 text-[12px] text-gray-500">
                      {dateFmt.format(a.createdAt)}
                      {a.termMonths
                        ? ` · ${fill(t.loansPage.months, { count: String(a.termMonths) })}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {(a.approvedAmountCents ?? a.amountCents) !== null && (
                      <span className="tnum text-[14px] font-semibold text-navy-900">
                        {formatMoney(
                          a.approvedAmountCents ?? a.amountCents ?? 0,
                          locale,
                          user.currency
                        )}
                      </span>
                    )}
                    <StatusChip
                      tone={
                        a.status === "APPROVED"
                          ? "ok"
                          : a.status === "DECLINED"
                            ? "bad"
                            : "pending"
                      }
                    >
                      {a.status === "APPROVED"
                        ? t.products.active
                        : a.status === "DECLINED"
                          ? t.products.declined
                          : t.products.underReview}
                    </StatusChip>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </Page>
    </AppShell>
  );
}
