import Link from "next/link";

/**
 * The Trustline mark: the TL monogram on the shield, taken from the seal on
 * the company's own artwork rather than the generic tile that stood in for it.
 *
 * The T and the L share a stem, the way they do on the seal. Everything is
 * drawn with straight edges and no hairlines, because this renders at 16px in
 * a browser tab as often as it does at 32px in a header — the same file backs
 * src/app/icon.svg.
 *
 * theme "dark" = for navy backgrounds (white text), "light" = for white pages.
 */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Deliberately no <defs>. Two of these render on a page and a shared
          gradient id resolves to whichever is first in the document — which
          was the hidden one, leaving the shield unpainted. Flat fills instead. */}

      {/* Shield: square shoulders, sides falling to a point — the seal's
          silhouette, which is what makes it recognisable at tab size. */}
      <path
        d="M4.5 3.5 H35.5 V21.6 C35.5 28.8 28.9 34.1 20 37.2 C11.1 34.1 4.5 28.8 4.5 21.6 Z"
        fill="#12407b"
      />
      {/* The light falls from the upper left, as it does on the seal. */}
      <path d="M4.5 3.5 H35.5 V13.2 H4.5 Z" fill="#1d4bb0" fillOpacity="0.55" />
      {/* The seal's inner keyline, held at a weight that survives downscaling */}
      <path
        d="M7.4 6.4 H32.6 V21.4 C32.6 26.9 27.4 31.2 20 34.0 C12.6 31.2 7.4 26.9 7.4 21.4 Z"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.32"
        strokeWidth="1.1"
      />

      {/* TL, sharing a stem */}
      <path d="M11.2 11.6 H28.8 V15.0 H11.2 Z" fill="#ffffff" />
      <path d="M18.3 11.6 H21.7 V28.2 H18.3 Z" fill="#ffffff" />
      <path d="M21.7 24.8 H28.4 V28.2 H21.7 Z" fill="#ffffff" />
    </svg>
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
      <LogoMark className="h-8 w-8 shrink-0" />
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
