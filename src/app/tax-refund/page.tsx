import { redirect } from "next/navigation";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { getDict, getLocale } from "@/i18n/server";
import { AppShell, Page } from "@/components/app-shell";
import { Card, SectionHead } from "@/components/ui";
import { Icons } from "@/components/icons";
import { TaxForm } from "./tax-form";

export const metadata = { title: "Tax refund — Trustline Financial Group" };

export default async function TaxRefundPage({
  searchParams,
}: {
  searchParams: Promise<{ idme?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isAdmin(user.role)) redirect("/admin");
  if (user.status === "PENDING") redirect("/onboarding");
  if (user.status !== "ACTIVE") redirect("/login");

  const t = await getDict();
  await getLocale();
  const { idme } = await searchParams;

  const statuses = [
    { value: "SINGLE", label: t.services.filingSingle },
    { value: "JOINT", label: t.services.filingJoint },
    { value: "SEPARATE", label: t.services.filingSeparate },
    { value: "HEAD", label: t.services.filingHead },
  ];

  return (
    <AppShell user={user} active="taxRefund" title={t.services.taxHeading} subtitle={t.services.taxLede}>
      <Page className="max-w-2xl space-y-6">
        {/* Identity verification — a secure connect to ID.me, never a password
            field on our page. The button sends the client to ID.me to sign in;
            ID.me returns a verification, not the password. */}
        <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/12 text-brand-500">
              <Icons.shield className="h-[20px] w-[20px]" />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-fg">{t.services.idmeTitle}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-fg-muted">{t.services.idmeBody}</p>
            </div>
          </div>

          {idme === "pending" ? (
            <p className="mt-4 rounded-xl border border-line bg-ink-1 px-3.5 py-2.5 text-[13px] text-fg-muted">
              {t.services.idmePending}
            </p>
          ) : (
            <a
              href="/api/idme/start"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-brand-600 sm:w-auto"
            >
              <Icons.shield className="h-4 w-4" />
              {t.services.idmeVerify}
            </a>
          )}
        </div>

        <Card>
          <SectionHead title={t.services.taxHeading} />
          <div className="mt-5">
            <TaxForm
              labels={{
                taxYear: t.services.taxYear,
                years: ["2025", "2024", "2023", "2022"],
                filingStatus: t.services.filingStatus,
                statuses,
                expectedRefund: t.services.expectedRefund,
                submit: t.services.applyTax,
                submitting: t.auth.submitting,
              }}
            />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-fg-faint">{t.services.reviewNote}</p>
        </Card>
      </Page>
    </AppShell>
  );
}
