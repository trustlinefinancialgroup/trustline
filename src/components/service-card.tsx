import Link from "next/link";
import { Icons, NavIcons } from "@/components/icons";

/**
 * A financial-services card: a tinted icon chip, a title with a status pill, a
 * one-line figure or note, and a full-colour call to action.
 *
 * Each service owns an accent — loans blue, grants green, tax violet, cards
 * amber — carried by the chip and the button, so the grid reads as a set of
 * distinct services at a glance rather than a wall of identical navy tiles.
 * The accents stay within a controlled set; this is not a licence for every
 * element on the page to pick its own colour.
 */

export type ServiceAccent = "blue" | "green" | "violet" | "amber" | "red";

type Tone = "ok" | "pending" | "muted";

const ACCENT: Record<
  ServiceAccent,
  { chip: string; icon: string; btn: string; btnText: string }
> = {
  blue: {
    chip: "bg-brand-500/12",
    icon: "text-brand-500",
    btn: "bg-brand-500 hover:bg-brand-600",
    btnText: "text-white",
  },
  green: {
    chip: "bg-emerald-500/12",
    icon: "text-emerald-600",
    btn: "bg-emerald-600 hover:bg-emerald-700",
    btnText: "text-white",
  },
  violet: {
    chip: "bg-violet-500/12",
    icon: "text-violet-600",
    btn: "bg-violet-600 hover:bg-violet-700",
    btnText: "text-white",
  },
  amber: {
    chip: "bg-gold-400/20",
    icon: "text-gold",
    btn: "bg-gold-500 hover:bg-gold-400",
    btnText: "text-navy-900",
  },
  red: {
    chip: "bg-rose-500/12",
    icon: "text-rose-600",
    btn: "bg-rose-600 hover:bg-rose-700",
    btnText: "text-white",
  },
};

const PILL: Record<Tone, string> = {
  ok: "bg-emerald-500/12 text-emerald-700",
  pending: "bg-amber-400/15 text-amber-700",
  muted: "bg-ink-3 text-fg-muted",
};

export function ServiceCard({
  href,
  icon,
  title,
  status,
  note,
  cta,
  ctaIcon,
  accent,
}: {
  href: string;
  icon: string;
  title: string;
  status?: { label: string; tone: Tone };
  /** The figure or one-line note under the title. */
  note: string;
  cta: string;
  ctaIcon?: string;
  accent: ServiceAccent;
}) {
  const a = ACCENT[accent];
  const drawIcon = Icons[icon] ?? NavIcons[icon] ?? Icons.review;
  const drawCta = ctaIcon ? Icons[ctaIcon] ?? NavIcons[ctaIcon] : null;

  return (
    <div className="elev-1 flex flex-col rounded-2xl border border-line bg-ink-1 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${a.chip} ${a.icon}`}
        >
          {drawIcon({ className: "h-[22px] w-[22px]" })}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-tight text-fg">{title}</p>
          {status && (
            <span
              className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${PILL[status.tone]}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
              {status.label}
            </span>
          )}
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-fg-muted">{note}</p>

      <Link
        href={href}
        className={`mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold shadow-sm transition ${a.btn} ${a.btnText}`}
      >
        {drawCta?.({ className: "h-[17px] w-[17px]" })}
        {cta}
      </Link>
    </div>
  );
}
