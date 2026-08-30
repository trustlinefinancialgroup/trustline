import Link from "next/link";

/**
 * The Trustline mark: the company's own TL shield, cut from the seal they had
 * designed. It was previously redrawn as SVG paths, which is not the same
 * thing as their logo and never quite matched it.
 *
 * The browser tab is served from src/app/icon.png — the same mark in white on
 * a navy tile, because a navy line-mark disappears against dark browser chrome
 * and a tab is the one surface whose background we do not control.
 */
export function LogoMark({
  className = "h-8 w-8",
  onDark = false,
}: {
  className?: string;
  /** White line-work, for navy surfaces. */
  onDark?: boolean;
}) {
  // Deliberately an <img> of the company's own mark rather than paths I drew.
  // The seal prints the shield as navy line-work over a photographic ground;
  // scripts/build-brand.mjs keys that ground out, so what is left is the mark
  // itself on transparency, in navy and in white.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={onDark ? "/brand/mark-light.png" : "/brand/mark.png"}
      alt=""
      width={512}
      height={512}
      className={`object-contain ${className}`}
    />
  );
}

export function Logo({
  onDark = false,
  subtitle,
  href = "/",
}: {
  /**
   * Set only where the logo sits on a genuinely dark surface — the marketing
   * header and footer, and the legal pages. Everything else takes its colour
   * from the tokens, so it follows the page instead of assuming one.
   *
   * This used to be theme="dark" and meant the same thing, which read as "the
   * dark logo" and left the wordmark painted white on white when the app went
   * light.
   */
  onDark?: boolean;
  subtitle?: string;
  href?: string | null;
}) {
  const nameColor = onDark ? "text-white" : "text-fg";
  const subColor = onDark ? "text-navy-300" : "text-fg-muted";

  const content = (
    <span className="flex items-center gap-2.5">
      <LogoMark className="h-8 w-8 shrink-0" onDark={onDark} />
      <span className="leading-tight">
        <span className={`block text-[15px] font-bold tracking-[0.08em] ${nameColor}`}>
          TRUSTLINE
        </span>
        <span className={`block text-[10px] font-medium uppercase tracking-[0.22em] ${subColor}`}>
          {subtitle ?? "Financial Group"}
        </span>
      </span>
    </span>
  );

  if (href === null) return content;
  return <Link href={href}>{content}</Link>;
}
