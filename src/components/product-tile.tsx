import Image from "next/image";
import { Icons } from "./icons";

// A product that isn't a payment card — savings, a mortgage, insurance. Each
// one is a photograph of the thing itself under a navy wash, with its real
// figure on top. Same aspect ratio as a card so the grid stays even.

const STATUS_TONES = {
  ok: "bg-emerald-400/95 text-emerald-950",
  pending: "bg-amber-300/95 text-amber-950",
  bad: "bg-red-400/95 text-red-950",
  muted: "bg-white/25 text-white backdrop-blur-sm",
} as const;

export type ProductTileProps = {
  /** Used for the image's accessible name; the visible label sits below. */
  title: string;
  photo?: string | null;
  icon?: string;
  /** Bottom-left figure, e.g. a balance or what's outstanding. */
  valueLabel?: string | null;
  value?: string | null;
  status?: { label: string; tone: keyof typeof STATUS_TONES } | null;
  /** Not opened yet — the photo sits back and a call to action leads. */
  placeholder?: boolean;
  /** Shown in place of the figure while the product isn't open. */
  cta?: string | null;
  className?: string;
};

export function ProductTile({
  title,
  photo,
  icon,
  valueLabel,
  value,
  status,
  placeholder = false,
  cta,
  className = "",
}: ProductTileProps) {
  const Icon = icon ? Icons[icon] : undefined;

  return (
    <div
      className={`relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl bg-navy-900 shadow-lg shadow-navy-900/20 ${className}`}
    >
      {photo && (
        <Image
          src={`/images/${photo}`}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition duration-500 ${
            placeholder ? "scale-100 opacity-55" : "opacity-80 group-hover:scale-[1.04]"
          }`}
        />
      )}
      {/* Navy wash so the type stays readable over any photograph. */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-900/25" />

      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          {Icon ? (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
              <Icon className="h-5 w-5 text-white" />
            </span>
          ) : (
            <span />
          )}
          {status && (
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_TONES[status.tone]}`}
            >
              {status.label}
            </span>
          )}
        </div>

        <div>
          {value ? (
            <>
              {valueLabel && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-200">
                  {valueLabel}
                </p>
              )}
              <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{value}</p>
            </>
          ) : cta ? (
            <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur-sm transition group-hover:bg-accent-500">
              {cta}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
