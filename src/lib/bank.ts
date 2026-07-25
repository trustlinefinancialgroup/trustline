import "server-only";
import { randomInt, randomBytes } from "crypto";
import { db } from "./db";
import type { Locale } from "@/i18n";

const INTL_LOCALES: Record<Locale, string> = {
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
};

/** Formats cents as localized currency, e.g. 123456 -> "$1,234.56". */
export function formatMoney(cents: number, locale: string = "en", currency = "USD") {
  const intl = INTL_LOCALES[(locale as Locale) in INTL_LOCALES ? (locale as Locale) : "en"];
  return new Intl.NumberFormat(intl, { style: "currency", currency }).format(cents / 100);
}

/** Returns the user's account, creating it (with a unique number) if needed. */
export async function ensureAccount(userId: string) {
  const existing = await db.account.findUnique({ where: { userId } });
  if (existing) return existing;

  for (let attempt = 0; attempt < 5; attempt++) {
    const number = `TL-${randomInt(10_000_000, 100_000_000)}`;
    try {
      return await db.account.create({ data: { userId, number } });
    } catch {
      // number collision — retry with a new one
    }
  }
  throw new Error("Could not allocate an account number");
}

/** Balance = sum of POSTED ledger amounts. Never stored, always derived. */
export async function balanceCents(accountId: string) {
  const agg = await db.transaction.aggregate({
    where: { accountId, status: "POSTED" },
    _sum: { amountCents: true },
  });
  return agg._sum.amountCents ?? 0;
}

export async function pendingDepositCents(accountId: string) {
  const agg = await db.transaction.aggregate({
    where: { accountId, status: "PENDING", type: "DEPOSIT" },
    _sum: { amountCents: true },
  });
  return agg._sum.amountCents ?? 0;
}

/** Total of not-yet-approved withdrawals (returned as a positive number). */
export async function pendingWithdrawalCents(accountId: string) {
  const agg = await db.transaction.aggregate({
    where: { accountId, status: "PENDING", type: "WITHDRAWAL" },
    _sum: { amountCents: true },
  });
  return Math.abs(agg._sum.amountCents ?? 0);
}

/** Receipt reference like TL-D-8F3A21C4. */
export function newReference(prefix = "D") {
  return `TL-${prefix}-${randomBytes(4).toString("hex").toUpperCase()}`;
}
