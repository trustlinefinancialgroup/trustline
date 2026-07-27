import type { Dict } from "@/i18n";
import { fill } from "@/i18n";
import { formatMoney } from "@/lib/bank";
import { productsFor, themeFor, type CardTheme, type ProductDef } from "@/lib/products";

// One place that decides how a product looks in every state, so the dashboard
// grid and the product page can never drift apart.

export type ProductState = "APPLY" | "REVIEW" | "DECLINED" | "ACTIVE" | "CLOSED" | "DEPOSIT";

export type CardApp = {
  id: string;
  status: string;
  cardTier: string | null;
  approvedAmountCents: number | null;
  outstandingCents: number | null;
  frozen: boolean;
  cardNumber: string | null;
  cardExpiry: string | null;
  cardHolder: string | null;
  adminNote: string | null;
};

export type ProductView = {
  def: ProductDef;
  title: string;
  body: string;
  state: ProductState;
  theme: CardTheme;
  badge: string | null;
  status: { label: string; tone: "ok" | "pending" | "bad" | "muted" } | null;
  holder: string | null;
  /** Shown in place of a cardholder name while the product is a preview. */
  holderPlaceholder: string;
  number: string | null;
  numberText: string | null;
  showNumber: boolean;
  expiry: string | null;
  placeholder: boolean;
  valueLabel: string | null;
  value: string | null;
  href: string;
  cta: string;
};

const TIER_BADGES: Record<string, string> = {
  GOLD: "Gold",
  PLATINUM: "Platinum",
  BLACK: "Black",
};

export function buildProductView({
  def,
  item,
  app,
  savingsOpen,
  savingsBalanceCents,
  savingsNumber,
  checkingNumber,
  t,
  locale,
  currency,
  holderName,
}: {
  def: ProductDef;
  item: { title: string; body: string };
  app: CardApp | null;
  savingsOpen: boolean;
  savingsBalanceCents: number;
  savingsNumber?: string | null;
  checkingNumber?: string | null;
  t: Dict;
  locale: string;
  currency: string;
  holderName: string;
}): ProductView {
  const base = {
    def,
    title: item.title,
    body: item.body,
    href: `/product/${def.key}`,
    holder: null as string | null,
    holderPlaceholder: def.card ? t.products.yourName : "",
    number: null as string | null,
    numberText: null as string | null,
    showNumber: Boolean(def.card),
    expiry: null as string | null,
    badge: null as string | null,
    valueLabel: null as string | null,
    value: null as string | null,
  };

  // Deposits tile (commercial) — always available, no application.
  if (def.kind === "deposit") {
    return {
      ...base,
      state: "DEPOSIT",
      theme: def.theme,
      placeholder: false,
      status: null,
      holder: holderName,
      numberText: checkingNumber ?? null,
      cta: t.bank.makeDeposit,
    };
  }

  // Savings — open instantly, then it carries a real balance.
  if (def.kind === "savings") {
    if (!savingsOpen) {
      return {
        ...base,
        state: "CLOSED",
        theme: "BLUE",
        placeholder: true,
        status: null,
        cta: t.products.open,
      };
    }
    return {
      ...base,
      state: "ACTIVE",
      theme: def.theme,
      placeholder: false,
      status: { label: t.products.activeBadge, tone: "ok" },
      holder: holderName,
      numberText: savingsNumber ?? null,
      valueLabel: t.products.balanceLabel,
      value: formatMoney(savingsBalanceCents, locale, currency),
      cta: t.products.viewDetails,
    };
  }

  // Applyable products.
  if (!app || app.status === "DECLINED") {
    return {
      ...base,
      state: app?.status === "DECLINED" ? "DECLINED" : "APPLY",
      theme: "BLUE",
      placeholder: true,
      status:
        app?.status === "DECLINED" ? { label: t.products.declined, tone: "bad" } : null,
      cta: app?.status === "DECLINED" ? t.products.reapply : t.products.apply,
    };
  }

  if (app.status === "SUBMITTED") {
    return {
      ...base,
      state: "REVIEW",
      theme: "BLUE",
      placeholder: true,
      status: { label: t.products.underReview, tone: "pending" },
      cta: t.products.viewDetails,
    };
  }

  // Approved and active.
  const limit = app.approvedAmountCents ?? 0;
  const owed = app.outstandingCents ?? 0;
  const isRevolving = def.credit === "revolving";
  const value = isRevolving
    ? formatMoney(Math.max(0, limit - owed), locale, currency)
    : def.credit === "installment"
      ? formatMoney(owed, locale, currency)
      : limit
        ? formatMoney(limit, locale, currency)
        : null;

  return {
    ...base,
    state: "ACTIVE",
    theme: themeFor(def, { active: true, tier: app.cardTier }),
    placeholder: false,
    status: app.frozen ? { label: t.products.frozenBadge, tone: "bad" } : null,
    holder: def.card ? app.cardHolder || holderName.toUpperCase() : holderName,
    number: def.card ? app.cardNumber : null,
    expiry: def.card ? app.cardExpiry : null,
    badge: def.card ? (app.cardTier ? TIER_BADGES[app.cardTier] ?? app.cardTier : null) : null,
    valueLabel: isRevolving
      ? t.products.availableCredit
      : def.credit === "installment"
        ? t.products.outstandingLabel
        : limit
          ? t.products.limitLabel
          : null,
    value,
    cta: t.products.viewDetails,
  };
}

/** Latest application per product key for a client. */
export function latestByKey<T extends { productKey: string; createdAt: Date }>(apps: T[]) {
  const map = new Map<string, T>();
  for (const a of apps) {
    const prev = map.get(a.productKey);
    if (!prev || a.createdAt > prev.createdAt) map.set(a.productKey, a);
  }
  return map;
}

/** Product definitions + their localized labels, in dashboard order. */
export function productsWithLabels(t: Dict, accountType: string) {
  const defs = productsFor(accountType);
  const items = accountType === "COMMERCIAL" ? t.landing.commercial.items : t.landing.personal.items;
  return defs.map((def, i) => ({ def, item: items[i] ?? { title: def.key, body: "" } }));
}

export { fill };
