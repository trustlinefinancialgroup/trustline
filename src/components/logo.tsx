import Link from "next/link";

/**
 * Trustline brand mark: geometric "T" on a gradient tile, plus wordmark.
 * theme "dark" = for navy backgrounds (white text), "light" = for white pages.
 */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="tl-mark" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#2F6FED" />
          <stop offset="1" stopColor="#0A1F3D" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#tl-mark)" />
      <rect x="9.5" y="11.5" width="21" height="4.6" rx="2.3" fill="#ffffff" />
      <rect x="17.7" y="11.5" width="4.6" height="17.5" rx="2.3" fill="#ffffff" />
      <rect x="25.9" y="21.5" width="4.6" height="4.6" rx="2.3" fill="#7fa4f3" />
    </svg>
  );
}

export function Logo({
  theme = "dark",
  subtitle,
  href = "/",
}: {
  theme?: "dark" | "light";
  subtitle?: string;
  href?: string | null;
}) {
  const nameColor = theme === "dark" ? "text-white" : "text-navy-900";
  const subColor = theme === "dark" ? "text-navy-300" : "text-gray-500";

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
