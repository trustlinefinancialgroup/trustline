import type { CardTheme } from "@/lib/products";

// A physical-looking Trustline card face. Used everywhere a product is shown:
// the dashboard grid, the product page, and the apply flow. Products the client
// hasn't opened yet render the blue Trustline card with placeholder details.

type Face = {
  background: string;
  ink: string; // primary text
  inkSoft: string; // secondary text
  chip: string;
  chipLine: string;
  ring: string; // decorative arc colour
};

const FACES: Record<CardTheme, Face> = {
  BLUE: {
    background: "linear-gradient(135deg,#1B3F7A 0%,#0A1F3D 55%,#08182F 100%)",
    ink: "#F2F5FA",
    inkSoft: "#9DB3D6",
    chip: "#E4C56B",
    chipLine: "#B9973A",
    ring: "#3D6BB5",
  },
  BLACK: {
    background: "linear-gradient(135deg,#2A2E36 0%,#111318 60%,#08090C 100%)",
    ink: "#F5F6F8",
    inkSoft: "#9AA1AE",
    chip: "#D9C07C",
    chipLine: "#A98718",
    ring: "#454B57",
  },
  GOLD: {
    background: "linear-gradient(135deg,#E8CE7C 0%,#C9A227 55%,#A5811A 100%)",
    ink: "#37290A",
    inkSoft: "#6B5314",
    chip: "#FBF2D4",
    chipLine: "#A5811A",
    ring: "#F3E3AE",
  },
  PLATINUM: {
    background: "linear-gradient(135deg,#F1F3F6 0%,#C7CBD2 55%,#A2A8B3 100%)",
    ink: "#22262D",
    inkSoft: "#5B626D",
    chip: "#E7DCB4",
    chipLine: "#9C8A50",
    ring: "#FFFFFF",
  },
  TEAL: {
    background: "linear-gradient(135deg,#12706E 0%,#0B4E52 55%,#07373C 100%)",
    ink: "#EAF7F6",
    inkSoft: "#8FC6C3",
    chip: "#E4C56B",
    chipLine: "#B9973A",
    ring: "#2C9C96",
  },
  VIOLET: {
    background: "linear-gradient(135deg,#4B3A93 0%,#2E2263 55%,#1E1642 100%)",
    ink: "#F2EFFB",
    inkSoft: "#AFA3DA",
    chip: "#E4C56B",
    chipLine: "#B9973A",
    ring: "#6B57C4",
  },
  GREEN: {
    background: "linear-gradient(135deg,#1C6B41 0%,#124A2D 55%,#0C331F 100%)",
    ink: "#ECF8F1",
    inkSoft: "#96C7AC",
    chip: "#E4C56B",
    chipLine: "#B9973A",
    ring: "#2E9159",
  },
  SLATE: {
    background: "linear-gradient(135deg,#4A5568 0%,#2D3748 55%,#1C222E 100%)",
    ink: "#F2F4F8",
    inkSoft: "#A3AEC2",
    chip: "#E4C56B",
    chipLine: "#B9973A",
    ring: "#69768D",
  },
};

const STATUS_TONES = {
  ok: "bg-emerald-400/90 text-emerald-950",
  pending: "bg-amber-300/95 text-amber-950",
  bad: "bg-red-400/90 text-red-950",
  muted: "bg-white/20 text-white",
} as const;

/** Groups a card number into 4s; masks all but the last four when asked. */
export function formatCardNumber(number?: string | null, masked = false) {
  const digits = (number ?? "").replace(/\D/g, "");
  if (digits.length < 4) return "••••  ••••  ••••  ••••";
  const groups = digits.match(/.{1,4}/g) ?? [];
  if (!masked) return groups.join("  ");
  return groups.map((g, i) => (i === groups.length - 1 ? g : "••••")).join("  ");
}

export type BankCardProps = {
  theme: CardTheme;
  /** Product name printed on the card, e.g. "Credit card". */
  productName: string;
  /** Small label top-right — the tier, or a short product word. */
  badge?: string | null;
  holder?: string | null;
  number?: string | null;
  expiry?: string | null;
  masked?: boolean;
  /** Printed instead of a card number — e.g. a savings account number. */
  numberText?: string | null;
  /** Products without a number (loans, insurance) leave the line empty. */
  showNumber?: boolean;
  /** Bottom-right figure, e.g. available credit or savings balance. */
  valueLabel?: string | null;
  value?: string | null;
  status?: { label: string; tone: keyof typeof STATUS_TONES } | null;
  /** Draws the card dimmed with sample details (product not opened yet). */
  placeholder?: boolean;
  /** Name shown when there is no cardholder yet. */
  holderPlaceholder?: string;
  className?: string;
};

export function BankCard({
  theme,
  productName,
  badge,
  holder,
  number,
  expiry,
  masked = true,
  numberText,
  showNumber = true,
  valueLabel,
  value,
  status,
  placeholder = false,
  holderPlaceholder = "Cardholder name",
  className = "",
}: BankCardProps) {
  const face = FACES[theme] ?? FACES.BLUE;

  return (
    <div
      className={`relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl p-5 shadow-lg shadow-navy-900/20 ${className}`}
      style={{ background: face.background }}
    >
      {/* decorative arcs */}
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-20"
        style={{ background: `radial-gradient(circle, ${face.ring} 0%, transparent 70%)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-10 h-52 w-52 rounded-full opacity-15"
        style={{ background: `radial-gradient(circle, ${face.ring} 0%, transparent 70%)` }}
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-[13px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: face.ink }}
            >
              Trustline
            </p>
            <p
              className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.32em]"
              style={{ color: face.inkSoft }}
            >
              Financial Group
            </p>
          </div>
          {badge && (
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: face.ink }}
            >
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* chip */}
          <svg width="38" height="29" viewBox="0 0 38 29" aria-hidden="true">
            <rect width="38" height="29" rx="5" fill={face.chip} />
            <path
              d="M0 14.5H38M19 0V29M11 5.5V23.5M27 5.5V23.5"
              stroke={face.chipLine}
              strokeWidth="1"
              fill="none"
            />
          </svg>
          {/* contactless */}
          <svg width="18" height="22" viewBox="0 0 18 22" aria-hidden="true">
            <path
              d="M3 7 a9 9 0 0 1 0 8 M8 4 a14 14 0 0 1 0 14"
              fill="none"
              stroke={face.inkSoft}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p
          className="min-h-[1.4em] font-mono text-[15px] tracking-[0.1em] sm:text-[17px]"
          style={{ color: face.ink }}
        >
          {numberText
            ? numberText
            : !showNumber
              ? ""
              : placeholder
                ? "••••  ••••  ••••  ••••"
                : formatCardNumber(number, masked)}
        </p>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p
              className="truncate text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: face.ink }}
            >
              {holder || holderPlaceholder}
            </p>
            <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em]" style={{ color: face.inkSoft }}>
              {expiry ? `Valid thru ${expiry}` : productName}
            </p>
          </div>
          {value ? (
            <div className="shrink-0 text-right">
              {valueLabel && (
                <p className="text-[8px] uppercase tracking-[0.16em]" style={{ color: face.inkSoft }}>
                  {valueLabel}
                </p>
              )}
              <p className="text-sm font-semibold" style={{ color: face.ink }}>
                {value}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {status && (
        <span
          className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_TONES[status.tone]}`}
        >
          {status.label}
        </span>
      )}
    </div>
  );
}
