"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { formatMoney } from "@/lib/bank";
import { getDict } from "@/i18n/server";
import type { FormState } from "./auth-actions";

const MAX_AMOUNT_CENTS = 100_000_000;

async function requireClient() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.status !== "ACTIVE" || user.role !== "CLIENT") redirect("/login");
  return user;
}

/**
 * Grants and tax refunds are applications, exactly like a loan or a card — they
 * become a ProductApplication that lands in the admin queue and is approved or
 * declined there. They are deliberately not in the product catalogue (they have
 * no card face, tier or repayment schedule), and admin renders any unknown
 * productKey safely, so this needs no change to the admin console.
 */
async function submitService(
  productKey: "GRANT" | "TAX_REFUND",
  formData: FormData,
  build: (fd: FormData) => { details: Record<string, unknown>; purpose: string; amountCents: number | null; error?: string }
): Promise<FormState> {
  const t = await getDict();
  const user = await requireClient();

  // One open request at a time, the same rule the product applications use.
  const open = await db.productApplication.findFirst({
    where: { userId: user.id, productKey, status: { in: ["SUBMITTED", "APPROVED"] } },
  });
  if (open) return { error: t.services.alreadyApplied };

  const { details, purpose, amountCents, error } = build(formData);
  if (error) return { error };

  await db.productApplication.create({
    data: { userId: user.id, productKey, amountCents, purpose, details: details as object },
  });

  await audit({
    actorId: user.id,
    actorLabel: user.email,
    action: "SERVICE_APPLIED",
    targetType: "USER",
    targetId: user.id,
    details: `Applied for ${productKey}${amountCents ? ` (${formatMoney(amountCents)})` : ""}`,
  });

  redirect(`/dashboard?applied=1`);
}

function parseAmount(fd: FormData, field = "amount") {
  const raw = String(fd.get(field) ?? "").trim().replace(",", ".");
  const cents = Math.round(Number(raw) * 100);
  if (!raw || !Number.isFinite(cents) || cents <= 0 || cents > MAX_AMOUNT_CENTS) return null;
  return cents;
}

// ---------------------------------------------------------------- grants
export async function applyGrantAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const t = await getDict();
  return submitService("GRANT", formData, (fd) => {
    const program = String(fd.get("program") ?? "").trim();
    const reason = String(fd.get("reason") ?? "").trim().slice(0, 1000);
    const amountCents = parseAmount(fd);
    if (!program) return { details: {}, purpose: "", amountCents: null, error: t.services.programRequired };
    if (!amountCents) return { details: {}, purpose: "", amountCents: null, error: t.bank.amountInvalid };
    if (!reason) return { details: {}, purpose: "", amountCents: null, error: t.services.reasonRequired };
    return {
      details: { program, reason },
      purpose: `${program} — ${reason}`,
      amountCents,
    };
  });
}

// ------------------------------------------------------------ tax refunds
export async function applyTaxRefundAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const t = await getDict();
  return submitService("TAX_REFUND", formData, (fd) => {
    const taxYear = String(fd.get("taxYear") ?? "").trim();
    const filingStatus = String(fd.get("filingStatus") ?? "").trim();
    const amountCents = parseAmount(fd, "expectedRefund");
    if (!taxYear) return { details: {}, purpose: "", amountCents: null, error: t.services.taxYearRequired };
    if (!amountCents) return { details: {}, purpose: "", amountCents: null, error: t.bank.amountInvalid };
    // Deliberately no SSN or ID.me password: identity is verified through
    // ID.me's own secure sign-in, never by collecting the credential here.
    return {
      details: { taxYear, filingStatus, identityVerification: "ID.me — pending secure verification" },
      purpose: `Tax year ${taxYear}${filingStatus ? ` · ${filingStatus}` : ""}`,
      amountCents,
    };
  });
}
