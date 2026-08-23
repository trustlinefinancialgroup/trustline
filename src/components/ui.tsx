import Link from "next/link";
import { Icons, NavIcons } from "@/components/icons";

/** A plain white panel — the base surface for everything inside the shell. */
export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200/80 bg-white shadow-sm shadow-navy-900/[0.03] ${
        padded ? "p-5 sm:p-6" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Section heading with an optional link on the right ("View all"). */
export function SectionHead({
  title,
  subtitle,
  href,
  linkLabel,
  className = "",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-tight text-navy-900 sm:text-base">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-[13px] text-gray-500">{subtitle}</p>}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="shrink-0 text-[13px] font-semibold text-accent-600 transition hover:text-accent-700"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

/** The small uppercase label above a figure. */
export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${className}`}>{children}</p>
  );
}

export type Tone = "ok" | "pending" | "bad" | "muted" | "info";

const TONE_DOT: Record<Tone, string> = {
  ok: "bg-emerald-500",
  pending: "bg-amber-500",
  bad: "bg-red-500",
  muted: "bg-gray-400",
  info: "bg-accent-500",
};

const TONE_CHIP: Record<Tone, string> = {
  ok: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/15",
  bad: "bg-red-50 text-red-700 ring-red-600/15",
  muted: "bg-gray-100 text-gray-600 ring-gray-500/15",
  info: "bg-accent-50 text-accent-700 ring-accent-600/15",
};

/** Status pill, e.g. "Active", "Under review". */
export function StatusChip({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${TONE_CHIP[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} aria-hidden="true" />
      {children}
    </span>
  );
}

/** A labelled figure — used for the stat rows on the dashboard and in admin. */
export function StatTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-4">
      <Eyebrow className="text-gray-500">{label}</Eyebrow>
      <p className="tnum mt-2 text-xl font-semibold tracking-tight text-navy-900">{value}</p>
      {hint && (
        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-gray-500">
          {tone && <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} aria-hidden="true" />}
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * The row of round action tiles every modern banking app puts under the
 * balance — an icon in a soft circle with its label beneath, rather than a
 * button with an arrow glyph inside it.
 */
export function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  const draw = NavIcons[icon] ?? Icons[icon] ?? NavIcons.home;
  return (
    <Link
      href={href}
      className="group flex w-[3.9rem] shrink-0 flex-col items-center gap-1.5 text-center focus:outline-none sm:w-[4.5rem]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-inset ring-white/15 transition group-hover:bg-white/20 group-focus-visible:ring-2 group-focus-visible:ring-white/60">
        {draw({ className: "h-5 w-5" })}
      </span>
      <span className="w-full truncate text-[11px] font-medium leading-tight text-navy-200 transition group-hover:text-white">
        {label}
      </span>
    </Link>
  );
}

/**
 * Page tabs. An underline rail that scrolls sideways rather than a row of
 * pills that wrap onto a second line as soon as a label is more than one word.
 */
export function Tabs({
  items,
}: {
  items: { key: string; href: string; label: string; active: boolean; dot?: boolean }[];
}) {
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto border-b border-gray-200 px-4 sm:-mx-6 sm:px-6">
      <nav className="flex min-w-max gap-6">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 pb-3 pt-1 text-sm font-semibold transition ${
              item.active
                ? "border-accent-500 text-navy-900"
                : "border-transparent text-gray-500 hover:text-navy-900"
            }`}
          >
            {item.label}
            {item.dot && (
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden="true" />
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}

/** A back link that uses a chevron rather than a text arrow. */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-semibold text-accent-600 transition hover:text-accent-700"
    >
      {NavIcons.chevronLeft({ className: "h-4 w-4" })}
      {children}
    </Link>
  );
}

/** Round action button used on the balance hero and page headers. */
export function ActionButton({
  href,
  icon,
  children,
  variant = "solid",
}: {
  href: string;
  icon?: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
}) {
  const Icon = icon ? NavIcons[icon] ?? Icons[icon] : null;
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
        variant === "solid"
          ? "bg-accent-500 text-white shadow-sm hover:bg-accent-600"
          : "border border-white/25 text-white hover:bg-white/10"
      }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  );
}

/** Empty-state block for lists with nothing in them yet. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-navy-900">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-md text-[13px] text-gray-500">{body}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/** Thin progress bar — repayment progress, savings goals, bonus funding. */
export function ProgressBar({
  percent,
  tone = "info",
  className = "",
}: {
  percent: number;
  tone?: Tone;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div
        className={`h-full rounded-full transition-all ${TONE_DOT[tone]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
