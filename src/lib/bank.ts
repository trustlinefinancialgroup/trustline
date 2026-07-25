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

/** Returns the user's account of a kind, creating it with a unique number if needed. */
export async function ensureAccountOfKind(userId: string, kind: "CHECKING" | "SAVINGS") {
  const existing = await db.account.findFirst({ where: { userId, kind } });
  if (existing) return existing;

  for (let attempt = 0; attempt < 5; attempt++) {
    const number = `TL-${randomInt(10_000_000, 100_000_000)}`;
    try {
      return await db.account.create({ data: { userId, number, kind } });
    } catch {
      // number collision — retry with a new one
    }
  }
  throw new Error("Could not allocate an account number");
}

/** The primary checking account (auto-created). */
export function ensureAccount(userId: string) {
  return ensureAccountOfKind(userId, "CHECKING");
}

/** The client's savings account, or null if they haven't opened one. */
export function getSavings(userId: string) {
  return db.account.findFirst({ where: { userId, kind: "SAVINGS" } });
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

/** Moves money between two of the user's accounts as two POSTED ledger entries. */
export async function transferBetween(
  fromAccountId: string,
  toAccountId: string,
  amountCents: number,
  note: string
) {
  const ref = newReference("T");
  await db.$transaction([
    db.transaction.create({
      data: {
        accountId: fromAccountId,
        type: "TRANSFER",
        status: "POSTED",
        amountCents: -amountCents,
        reference: `${ref}-O`,
        note,
        postedAt: new Date(),
      },
    }),
    db.transaction.create({
      data: {
        accountId: toAccountId,
        type: "TRANSFER",
        status: "POSTED",
        amountCents: amountCents,
        reference: `${ref}-I`,
        note,
        postedAt: new Date(),
      },
    }),
  ]);
  return ref;
}
