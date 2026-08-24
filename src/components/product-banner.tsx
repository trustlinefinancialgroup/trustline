import { BankCard } from "./bank-card";
import { ProductArt } from "./product-art";
import type { CardTheme } from "@/lib/products";

// A product as a full-width banner, for stacking down a phone screen.
//
// The tile version is a poster: beautiful, and 366px of screen each, which
// buries a page once there are five of them. The row version that replaced it
// was 79px and looked like a settings menu. This is the middle: the artwork
// still fills half the card and bleeds off its edge, and the name, the line
// about it and its status sit on the panel beside it. 116px, and it still
// reads as a bank.

const STATUS_TONES = {
  ok: "bg-emerald-400/95 text-emerald-950",
  pending: "bg-amber-300/95 text-amber-950",
  bad: "bg-red-400/95 text-red-950",
  muted: "bg-ink-3/80 text-fg",
} as const;

export type ProductBannerProps = {
  title: string;
  /** One line on what the product is — shown when there is no figure. */
  body: string;
  art?: string | null;
  /** Card products show their real face rather than artwork. */
  theme?: CardTheme | null;
  valueLabel?: string | null;
  value?: string | null;
  status?: { label: string; tone: keyof typeof STATUS_TONES } | null;
  cta?: string | null;
  placeholder?: boolean;
};

export function ProductBanner({
  title,
  body,
  art,
  theme,
  valueLabel,
  value,
  status,
  cta,
  placeholder = false,
}: ProductBannerProps) {
  return (
    <div className="elev-2 relative h-[116px] w-full overflow-hidden rounded-2xl border border-line bg-ink-1 transition group-hover:border-brand-500/40">
      {/* Artwork sits against the right edge and bleeds off it. */}
      <div className="absolute inset-y-0 right-0 w-[46%]">
        {theme ? (
          <div className="flex h-full items-center pr-3">
            <BankCard
              theme={theme}
              productName={title}
              badge={null}
              holder={null}
              holderPlaceholder=""
              number={null}
              expiry={null}
              valueLabel={null}
              value={null}
              status={null}
              placeholder={placeholder}
            />
          </div>
        ) : (
          art && (
            <ProductArt
              art={art}
              className={`h-full w-full ${placeholder ? "opacity-75" : "opacity-100"}`}
            />
          )
        )}
        {/* Fades the artwork into the panel so it reads as one card, not a
            picture stuck next to some text. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-1 via-ink-1/55 to-transparent" />
      </div>

      <div className="relative flex h-full w-[62%] flex-col justify-center gap-1 py-4 pl-4">
        <p className="truncate text-[15px] font-semibold tracking-tight text-fg">{title}</p>

        {value ? (
          <p className="tnum truncate text-[17px] font-semibold text-white">
            {value}
            {valueLabel && (
              <span className="ml-1.5 text-[11px] font-medium text-fg-faint">{valueLabel}</span>
            )}
          </p>
        ) : (
          <p className="line-clamp-2 text-[12.5px] leading-snug text-fg-muted">{body}</p>
        )}

        <div className="mt-0.5 flex items-center gap-2">
          {status ? (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${STATUS_TONES[status.tone]}`}
            >
              {status.label}
            </span>
          ) : (
            cta && (
              <span className="text-[12.5px] font-semibold text-brand-400 transition group-hover:text-fg">
                {cta} →
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
