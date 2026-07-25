// Product tiles per account type, aligned by index with the i18n landing items
// (personal.items / commercial.items). "kind" controls the tile's behavior.
export type ProductDef = {
  key: string;
  kind: "apply" | "savings" | "deposit";
  amount?: boolean; // whether the application asks for a requested amount
  card?: boolean; // credit-card style (approval sets a tier + limit)
  // installment: principal disbursed to checking on approval, repaid over time.
  // revolving: a credit line the client draws from directly.
  credit?: "installment" | "revolving";
};

export const PERSONAL_PRODUCTS: ProductDef[] = [
  { key: "CREDIT_CARD", kind: "apply", amount: true, card: true, credit: "revolving" },
  { key: "SAVINGS", kind: "savings" },
  { key: "PERSONAL_LOAN", kind: "apply", amount: true, credit: "installment" },
  { key: "MORTGAGE", kind: "apply", amount: true, credit: "installment" },
  { key: "PERSONAL_INSURANCE", kind: "apply" },
];

export const COMMERCIAL_PRODUCTS: ProductDef[] = [
  { key: "BUSINESS_CARD", kind: "apply", amount: true, card: true, credit: "revolving" },
  { key: "DEPOSITS", kind: "deposit" },
  { key: "FOREIGN_DRAFTS", kind: "apply", amount: true },
  { key: "INTEREST_CHECKING", kind: "apply" },
  { key: "TELE_BANKING", kind: "apply" },
  { key: "MONEY_MARKET", kind: "apply", amount: true },
  { key: "SMALL_BUSINESS", kind: "apply", amount: true, credit: "installment" },
];

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
