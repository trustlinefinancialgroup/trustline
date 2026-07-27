// Product tiles per account type, aligned by index with the i18n landing items
// (personal.items / commercial.items). "kind" controls the tile's behavior.
export type CardTheme = "BLUE" | "GOLD" | "PLATINUM" | "BLACK" | "TEAL" | "VIOLET" | "SLATE" | "GREEN";

export type ProductDef = {
  key: string;
  kind: "apply" | "savings" | "deposit";
  amount?: boolean; // whether the application asks for a requested amount
  card?: boolean; // credit-card style (approval sets a tier + limit)
  term?: boolean; // application asks for a repayment term in months
  // installment: principal disbursed to checking on approval, repaid over time.
  // revolving: a credit line the client draws from directly.
  credit?: "installment" | "revolving";
  // Face colour once the product is active. Cards override this with their
  // approved tier; everything unopened shows the blue Trustline card.
  theme: CardTheme;
};

export const PERSONAL_PRODUCTS: ProductDef[] = [
  { key: "CREDIT_CARD", kind: "apply", amount: true, card: true, credit: "revolving", theme: "BLACK" },
  { key: "SAVINGS", kind: "savings", theme: "TEAL" },
  { key: "PERSONAL_LOAN", kind: "apply", amount: true, term: true, credit: "installment", theme: "VIOLET" },
  { key: "MORTGAGE", kind: "apply", amount: true, term: true, credit: "installment", theme: "GREEN" },
  { key: "PERSONAL_INSURANCE", kind: "apply", theme: "SLATE" },
];

export const COMMERCIAL_PRODUCTS: ProductDef[] = [
  { key: "BUSINESS_CARD", kind: "apply", amount: true, card: true, credit: "revolving", theme: "BLACK" },
  { key: "DEPOSITS", kind: "deposit", theme: "TEAL" },
  { key: "FOREIGN_DRAFTS", kind: "apply", amount: true, theme: "VIOLET" },
  { key: "INTEREST_CHECKING", kind: "apply", theme: "GREEN" },
  { key: "TELE_BANKING", kind: "apply", theme: "SLATE" },
  { key: "MONEY_MARKET", kind: "apply", amount: true, theme: "TEAL" },
  { key: "SMALL_BUSINESS", kind: "apply", amount: true, term: true, credit: "installment", theme: "VIOLET" },
];

/** Card tiers a client can request when applying for a card product. */
export const CARD_TIERS = ["GOLD", "PLATINUM", "BLACK"] as const;
export type CardTier = (typeof CARD_TIERS)[number];

/** The face colour to draw for a product in a given state. */
export function themeFor(def: ProductDef, opts: { active: boolean; tier?: string | null }): CardTheme {
  if (!opts.active) return "BLUE";
  if (def.card) {
    const tier = (opts.tier ?? "").toUpperCase();
    return tier === "GOLD" || tier === "PLATINUM" || tier === "BLACK" ? tier : "BLUE";
  }
  return def.theme;
}

export function productsFor(accountType: string): ProductDef[] {
  return accountType === "COMMERCIAL" ? COMMERCIAL_PRODUCTS : PERSONAL_PRODUCTS;
}

export function productDef(accountType: string, key: string): ProductDef | undefined {
  return productsFor(accountType).find((p) => p.key === key);
}

/** The localized {title, body} for a product key, from the landing dictionary. */
export function productLabel(
  landing: { personal: { items: { title: string; body: string }[] }; commercial: { items: { title: string; body: string }[] } },
  accountType: string,
  key: string
): { title: string; body: string } | null {
  const list = productsFor(accountType);
  const idx = list.findIndex((p) => p.key === key);
  if (idx < 0) return null;
  const items = accountType === "COMMERCIAL" ? landing.commercial.items : landing.personal.items;
  return items[idx] ?? null;
}
