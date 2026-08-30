import { Icons, NavIcons } from "./icons";

// Artwork for the products that aren't payment cards.
//
// Two kinds. The ten flagship products have a rendered 3D illustration, fitted
// to the card ratio and served from /public/art. The lending products added
// later have no bespoke render — so rather than reuse the personal-loan photo
// for the car loan and the student loan alike (three identical pen-on-paper
// tiles, which is exactly the sloppiness to avoid), each gets a designed tile:
// its own icon on its own accent, on the same dark ground as the photos so the
// set still reads as one system.

/** Product art key → the rendered file the build script writes. */
const FILES: Record<string, string> = {
  vault: "savings",
  house: "mortgage",
  contract: "personal-loan",
  shield: "insurance",
  deposit: "deposits",
  globe: "foreign-drafts",
  cheque: "interest-checking",
  handset: "tele-banking",
  market: "money-market",
  storefront: "small-business",
};

/** Product art key → a designed icon tile, for products with no photo. */
const TILES: Record<string, { icon: string; glow: string }> = {
  auto: { icon: "car", glow: "#35c7d6" },
  student: { icon: "student", glow: "#8b7bf0" },
  renovation: { icon: "renovation", glow: "#e0b15c" },
  equity: { icon: "buildings", glow: "#35d6a4" },
};

export function ProductArt({ art, className }: { art: string; className?: string }) {
  const file = FILES[art];
  if (file) {
    return (
      // Deliberately a plain <img>. These are already WebP at exactly the two
      // widths the layout asks for, so the image optimiser would re-encode work
      // that is already done and bill for it.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/art/${file}.webp`}
        srcSet={`/art/${file}-half.webp 450w, /art/${file}.webp 900w`}
        sizes="(max-width: 640px) 100vw, 400px"
        alt=""
        width={900}
        height={567}
        loading="lazy"
        decoding="async"
        className={`object-cover ${className ?? ""}`}
      />
    );
  }

  const tile = TILES[art];
  if (!tile) return null;

  const draw = Icons[tile.icon] ?? NavIcons[tile.icon] ?? Icons.review;
  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center ${className ?? ""}`}
      style={{
        // A container so the icon sizes to the tile's own width (cqw) rather
        // than to a definite pixel value — the tile is 335px in a banner and
        // 160px two-up, and the icon should read the same in both.
        containerType: "inline-size",
        color: tile.glow,
        background:
          `radial-gradient(90% 90% at 72% 18%, ${tile.glow}2e 0%, transparent 55%),` +
          "linear-gradient(150deg,#173763 0%,#0a1f3d 48%,#061530 100%)",
      }}
    >
      {/* The wrapper carries the size in cqw; the icon fills it. */}
      <span className="block opacity-95 [&>svg]:h-full [&>svg]:w-full" style={{ width: "34cqw", height: "34cqw" }}>
        {draw({ className: "h-full w-full" })}
      </span>
    </span>
  );
}
