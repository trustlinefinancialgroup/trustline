// Product catalogue. Entries are aligned by index with the i18n landing items
// (personal.items / commercial.items), and "kind" controls the tile's behaviour.
//
// Only genuine card products render a card face. Everything else is a product
// tile with its own photograph, so a mortgage looks like a home and not a
// payment card.

export type CardTheme = "BLUE" | "GOLD" | "PLATINUM" | "BLACK";

/** A question asked on the application form. Rendered from this definition. */
export type FieldDef = {
  name: string;
  kind: "text" | "money" | "number" | "select" | "textarea";
  /** Option values for selects; labels come from i18n products.fieldOptions. */
  options?: string[];
  required?: boolean;
  /** Only shown when another field has one of these values. */
  showIf?: { field: string; equals: string[] };
};

export type ProductDef = {
  key: string;
  kind: "apply" | "savings" | "deposit";
  amount?: boolean; // application asks for a requested amount
  card?: boolean; // card product: tier chooser, card face, issued details
  term?: boolean; // application asks for a repayment term in months
  // installment: principal disbursed to checking on approval, repaid over time.
  // revolving: a credit line the client draws from directly.
  credit?: "installment" | "revolving";
  /** Illustration key from components/product-art.tsx. Cards don't use one. */
  art?: string;
  /** Icon key from components/icons.tsx, used in compact listings. */
  icon: string;
  /** Extra questions beyond the shared ones. */
  fields?: FieldDef[];
};

// Asked on every application — the basics any bank wants up front.
export const SHARED_FIELDS: FieldDef[] = [
  {
    name: "employmentStatus",
    kind: "select",
    required: true,
    options: ["EMPLOYED", "SELF_EMPLOYED", "RETIRED", "STUDENT", "UNEMPLOYED"],
  },
  {
    name: "employer",
    kind: "text",
    showIf: { field: "employmentStatus", equals: ["EMPLOYED", "SELF_EMPLOYED"] },
  },
  { name: "annualIncome", kind: "money", required: true },
  {
    name: "housingStatus",
    kind: "select",
    required: true,
    options: ["OWN_OUTRIGHT", "OWN_MORTGAGE", "RENT", "LIVING_WITH_FAMILY"],
  },
];

export const PERSONAL_PRODUCTS: ProductDef[] = [
  {
    key: "CREDIT_CARD",
    kind: "apply",
    card: true,
    credit: "revolving",
    icon: "card",
  },
  { key: "SAVINGS", kind: "savings", art: "vault", icon: "savings" },
  {
    key: "PERSONAL_LOAN",
    kind: "apply",
    amount: true,
    term: true,
    credit: "installment",
    art: "contract",
    icon: "lending",
    fields: [{ name: "purpose", kind: "textarea" }],
  },
  {
    key: "MORTGAGE",
    kind: "apply",
    amount: true,
    term: true,
    credit: "installment",
    art: "house",
    icon: "mortgage",
    fields: [
      {
        name: "propertyType",
        kind: "select",
        required: true,
        options: ["HOUSE", "APARTMENT", "LAND", "COMMERCIAL"],
      },
      { name: "propertyPrice", kind: "money", required: true },
      { name: "downPayment", kind: "money", required: true },
      { name: "propertyLocation", kind: "text", required: true },
    ],
  },
  {
    key: "PERSONAL_INSURANCE",
    kind: "apply",
    art: "shield",
    icon: "insurance",
    fields: [
      {
        name: "coverType",
        kind: "select",
        required: true,
        options: ["LIFE", "HOME", "AUTO", "TRAVEL", "HEALTH"],
      },
      { name: "coveredPeople", kind: "number" },
    ],
  },
];

export const COMMERCIAL_PRODUCTS: ProductDef[] = [
  {
    key: "BUSINESS_CARD",
    kind: "apply",
    card: true,
    credit: "revolving",
    icon: "card",
    fields: [{ name: "businessName", kind: "text", required: true }],
  },
  { key: "DEPOSITS", kind: "deposit", art: "deposit", icon: "deposit" },
  {
    key: "FOREIGN_DRAFTS",
    kind: "apply",
    amount: true,
    art: "globe",
    icon: "draft",
    fields: [
      { name: "destinationCountry", kind: "text", required: true },
      { name: "beneficiaryName", kind: "text", required: true },
    ],
  },
  {
    key: "INTEREST_CHECKING",
    kind: "apply",
    art: "cheque",
    icon: "checking",
    fields: [{ name: "businessName", kind: "text", required: true }],
  },
  {
    key: "TELE_BANKING",
    kind: "apply",
    art: "handset",
    icon: "phone",
    fields: [{ name: "businessName", kind: "text", required: true }],
  },
  {
    key: "MONEY_MARKET",
    kind: "apply",
    amount: true,
    art: "market",
    icon: "money",
    fields: [{ name: "businessName", kind: "text", required: true }],
  },
  {
    key: "SMALL_BUSINESS",
    kind: "apply",
    amount: true,
    term: true,
    credit: "installment",
    art: "storefront",
    icon: "buildings",
    fields: [
      { name: "businessName", kind: "text", required: true },
      { name: "yearsTrading", kind: "number", required: true },
      { name: "annualRevenue", kind: "money", required: true },
      { name: "purpose", kind: "textarea" },
    ],
  },
];

/**
 * Card tiers, lowest first. Clients pick a tier rather than naming a limit —
 * each tier carries its own range and the final limit is set at approval.
 * Amounts are in cents; a null max means "and above".
 */
export const CARD_TIERS = ["CLASSIC", "GOLD", "PLATINUM", "BLACK"] as const;
export type CardTier = (typeof CARD_TIERS)[number];

export const TIER_LIMITS: Record<CardTier, { min: number; max: number | null }> = {
  CLASSIC: { min: 50_000, max: 250_000 },
  GOLD: { min: 250_000, max: 1_000_000 },
  PLATINUM: { min: 1_000_000, max: 2_500_000 },
  BLACK: { min: 2_500_000, max: null },
};

export const TIER_THEMES: Record<CardTier, CardTheme> = {
  CLASSIC: "BLUE",
  GOLD: "GOLD",
  PLATINUM: "PLATINUM",
  BLACK: "BLACK",
};

export function isCardTier(value: unknown): value is CardTier {
  return typeof value === "string" && (CARD_TIERS as readonly string[]).includes(value);
}

/** The card face colour for a tier, defaulting to the Trustline blue. */
export function themeForTier(tier?: string | null): CardTheme {
  const t = (tier ?? "").toUpperCase();
  return isCardTier(t) ? TIER_THEMES[t] : "BLUE";
}

/** Every question a product's application asks, shared ones first. */
export function fieldsFor(def: ProductDef): FieldDef[] {
  return [...SHARED_FIELDS, ...(def.fields ?? [])];
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
