import { redirect } from "next/navigation";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { getDict, getLocale } from "@/i18n/server";
import { AppShell, Page } from "@/components/app-shell";
import { Card, SectionHead } from "@/components/ui";
import { Icons } from "@/components/icons";
import { TaxForm } from "./tax-form";

export const metadata = { title: "Tax refund — Trustline Financial Group" };

export default async function TaxRefundPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isAdmin(user.role)) redirect("/admin");
  if (user.status === "PENDING") redirect("/onboarding");
  if (user.status !== "ACTIVE") redirect("/login");

  const t = await getDict();
  await getLocale();

  const statuses = [
    { value: "SINGLE", label: t.services.filingSingle },
    { value: "JOINT", label: t.services.filingJoint },
    { value: "SEPARATE", label: t.services.filingSeparate },
    { value: "HEAD", label: t.services.filingHead },
  ];

  return (
    <AppShell user={user} active="taxRefund" title={t.services.taxHeading} subtitle={t.services.taxLede}>
      <Page className="max-w-2xl space-y-6">
        {/* Identity verification note — the honest ID.me flow, never a
            password field. */}
        <div className="flex items-start gap-3 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/12 text-brand-500">
            <Icons.shield className="h-[20px] w-[20px]" />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-fg">{t.services.idmeTitle}</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-fg-muted">{t.services.idmeBody}</p>
          </div>
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
