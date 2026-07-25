"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { ensureAccount, ensureAccountOfKind, getSavings, balanceCents, transferBetween, formatMoney } from "@/lib/bank";
import { productsFor, productDef } from "@/lib/products";
import { getDict } from "@/i18n/server";
import type { FormState } from "./auth-actions";

const MAX_AMOUNT_CENTS = 100_000_000;

async function requireClient() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.status !== "ACTIVE" || user.role !== "CLIENT") redirect("/login");
  return user;
}

// ---------- open a savings account (instant) ----------

export async function openSavingsAction() {
  const user = await requireClient();
  await ensureAccountOfKind(user.id, "SAVINGS");
  await audit({
    actorId: user.id,
    actorLabel: user.email,
    action: "SAVINGS_OPENED",
    targetType: "USER",
    targetId: user.id,
  });
  revalidatePath("/dashboard");
}

// ---------- transfer between checking and savings ----------

export async function transferAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const t = await getDict();
  const user = await requireClient();

  const direction = String(formData.get("direction")) === "TO_CHECKING" ? "TO_CHECKING" : "TO_SAVINGS";
  const raw = String(formData.get("amount") ?? "").trim().replace(",", ".");
  const amountCents = Math.round(Number(raw) * 100);
  if (!raw || !Number.isFinite(amountCents) || amountCents <= 0 || amountCents > MAX_AMOUNT_CENTS) {
    return { error: t.bank.amountInvalid };
  }

  const checking = await ensureAccount(user.id);
  const savings = await getSavings(user.id);
  if (!savings) return { error: t.bank.savingsNeeded };

  const from = direction === "TO_SAVINGS" ? checking : savings;
  const to = direction === "TO_SAVINGS" ? savings : checking;

  const fromBalance = await balanceCents(from.id);
  if (amountCents > fromBalance) return { error: t.bank.insufficientFunds };

  await transferBetween(from.id, to.id, amountCents, t.bank.transferNote);
  await audit({
    actorId: user.id,
    actorLabel: user.email,
    action: "TRANSFER",
    targetType: "USER",
    targetId: user.id,
    details: `${formatMoney(amountCents)} ${direction === "TO_SAVINGS" ? "to savings" : "to checking"}`,
  });

  redirect("/dashboard?transferred=1");
}

// ---------- product application ----------

export async function submitApplicationAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const t = await getDict();
  const user = await requireClient();

  const productKey = String(formData.get("productKey") ?? "").trim();
  const def = productDef(user.accountType, productKey);
  if (!def || def.kind !== "apply") return { error: t.products.applyError };

  // Block duplicate open applications for the same product.
  const open = await db.productApplication.findFirst({
    where: { userId: user.id, productKey, status: { in: ["SUBMITTED", "APPROVED"] } },
  });
  if (open) return { error: t.products.alreadyApplied };

  let amountCents: number | null = null;
  if (def.amount) {
    const raw = String(formData.get("amount") ?? "").trim().replace(",", ".");
    const cents = Math.round(Number(raw) * 100);
    if (raw && Number.isFinite(cents) && cents > 0 && cents <= MAX_AMOUNT_CENTS) {
      amountCents = cents;
    }
  }
  const purpose = String(formData.get("purpose") ?? "").trim().slice(0, 300) || null;

  await db.productApplication.create({
    data: { userId: user.id, productKey, amountCents, purpose },
  });

  await audit({
    actorId: user.id,
    actorLabel: user.email,
    action: "PRODUCT_APPLIED",
    targetType: "USER",
    targetId: user.id,
    details: `Applied for ${productKey}${amountCents ? ` (${formatMoney(amountCents)})` : ""}`,
  });

  redirect("/dashboard?applied=1");
}
