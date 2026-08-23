import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { getDict, getLocale } from "@/i18n/server";
import { formatPeriod, statementPeriods } from "@/lib/statements";
import { AppShell, Page } from "@/components/app-shell";

export const metadata = { title: "Statements — Trustline Financial Group" };

export default async function StatementsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isAdmin(user.role)) redirect("/admin");
  if (user.status !== "ACTIVE") redirect("/login");

  const t = await getDict();
  const locale = await getLocale();
  const periods = await statementPeriods(user.id);

  const monthFmt = new Intl.DateTimeFormat(
    { en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES" }[locale],
    { month: "long", year: "numeric", timeZone: "UTC" }
  );

  return (
    <AppShell
      user={user}
      active="documents"
      title={t.statements.title}
      subtitle={t.statements.subtitle}
    >
      <Page className="max-w-2xl">

        {periods.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center text-sm text-gray-500">
            {t.statements.none}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {periods.map((p) => {
              const key = formatPeriod(p);
              return (
                <li key={key}>
                  <Link
                    href={`/statements/${key}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-navy-50/60"
                  >
                    <span className="font-semibold text-navy-900">
                      {monthFmt.format(new Date(Date.UTC(p.year, p.month - 1, 1)))}
                    </span>
                    <span className="text-sm font-semibold text-accent-600">
                      {t.statements.view} →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Page>
    </AppShell>
  );
}
