import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth-actions";
import { toggleFreezeAction } from "@/lib/actions/product-actions";
import { formatMoney } from "@/lib/bank";
import { getDict, getLocale } from "@/i18n/server";
import { productDef, productLabel } from "@/lib/products";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { ProductMoneyForms } from "./product-money-forms";

export const metadata = { title: "Product — Trustline Financial Group" };

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ drawn?: string; paid?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isAdmin(user.role)) redirect("/admin");
  if (user.status !== "ACTIVE") redirect("/login");

  const { id } = await params;
  const { drawn, paid } = await searchParams;
  const app = await db.productApplication.findFirst({
    where: { id, userId: user.id, status: "APPROVED" },
  });
  if (!app) redirect("/dashboard");

  const t = await getDict();
  const locale = await getLocale();
  const def = productDef(user.accountType, app.productKey);
  const label = productLabel(t.landing, user.accountType, app.productKey);
  const dateFmt = new Intl.DateTimeFormat(
    { en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES" }[locale],
    { dateStyle: "long" }
  );

  const isRevolving = def?.credit === "revolving";
  const isInstallment = def?.credit === "installment";
  const limit = app.approvedAmountCents ?? 0;
  const owed = app.outstandingCents ?? 0;
  const available = Math.max(0, limit - owed);

  const rows: { label: string; value: string }[] = [
    {
      label: t.products.limitLabel,
      value: app.approvedAmountCents ? formatMoney(app.approvedAmountCents, locale) : t.products.notSet,
    },
  ];
  if (isRevolving) {
    rows.push({ label: t.products.availableCredit, value: formatMoney(available, locale) });
  }
  rows.push(
    {
      label: t.products.outstandingLabel,
      value: app.outstandingCents != null ? formatMoney(app.outstandingCents, locale) : t.products.notSet,
    },
    { label: t.products.interestRateLabel, value: app.interestRate || t.products.notSet },
    {
      label: t.products.dueDateLabel,
      value: app.dueDate ? dateFmt.format(app.dueDate) : t.products.notSet,
    }
  );
  if (def?.card) {
    rows.push({ label: t.products.cardTierLabel, value: app.cardTier || t.products.notSet });
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-navy-50/50">
      <header className="border-b border-white/10 bg-navy-900">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <Logo theme="dark" href="/dashboard" />
          <div className="flex items-center gap-3">
            <LanguageSwitcher current={locale} variant="dark" />
            <form action={logoutAction}>
              <button className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                {t.common.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
        <Link href="/dashboard" className="text-sm font-semibold text-accent-600 hover:text-accent-700">
          ← {t.bank.back}
        </Link>
        {(drawn || paid) && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
            {drawn ? t.products.drewBanner : t.products.paidBanner}
          </p>
        )}
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight text-navy-900">
              {label?.title ?? app.productKey}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                app.frozen ? "bg-red-100 text-red-700" : "bg-green-100 text-green-800"
              }`}
            >
              {app.frozen ? t.products.frozenBadge : t.products.activeBadge}
            </span>
          </div>

          {isInstallment && owed > 0 && (
            <p className="mt-4 rounded-lg bg-navy-50/70 px-3.5 py-2.5 text-sm text-navy-700">
              {t.products.disbursedNote}
            </p>
          )}

          <dl className="mt-6 divide-y divide-gray-100">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between py-3">
                <dt className="text-sm text-gray-500">{r.label}</dt>
                <dd className="text-sm font-semibold text-navy-900">{r.value}</dd>
              </div>
            ))}
          </dl>

          <ProductMoneyForms
            appId={app.id}
            showDraw={isRevolving && available > 0 && !app.frozen}
            showPay={owed > 0}
            labels={{
              draw: t.products.draw,
              drawAmount: t.products.drawAmount,
              pay: t.products.pay,
              payAmount: t.products.payAmount,
            }}
          />

          {def?.card && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              {app.frozen && (
                <p className="mb-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                  {t.products.frozenNote}
                </p>
              )}
              <form action={toggleFreezeAction}>
                <input type="hidden" name="appId" value={app.id} />
                <button
                  className={`w-full rounded-full py-3 text-sm font-semibold text-white transition ${
                    app.frozen ? "bg-accent-500 hover:bg-accent-600" : "bg-navy-800 hover:bg-navy-700"
                  }`}
                >
                  {app.frozen ? t.products.unfreezeCard : t.products.freezeCard}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
