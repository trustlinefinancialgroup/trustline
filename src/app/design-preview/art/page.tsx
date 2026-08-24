// TEMPORARY — engraved artwork, for judging the direction. Delete after.
//
// The technique's strength is ornament and shading, not draughtsmanship. So
// the plate is what carries the work — a guilloché rosette unique to each
// product, an engine-turned border, a counter panel — and the subject is a
// single clean line mark set in a medallion, the way a denomination sits on
// the back of a note.
import { guillocheStack, hatchField, knurl, ring, waveBand } from "@/lib/engraving";

export const metadata = { title: "Engraved artwork" };

const INK = "#E7EFFA";

type Motif = {
  label: string;
  accent: string;
  /** 24×24 line art, drawn at the medallion's centre. */
  paths: string[];
  /** Rosette parameters — different figure per product. */
  rosette: { R: number; amplitude: number; petals: number; epicycle: number; epicycleTurns: number };
};

const MOTIFS: Motif[] = [
  {
    label: "Savings",
    accent: "#35D6A4",
    paths: ["M4 10h16", "M12 4 4 8h16z", "M6.5 10v7M10.5 10v7M13.5 10v7M17.5 10v7", "M4 20h16"],
    rosette: { R: 96, amplitude: 3, petals: 76, epicycle: 3.2, epicycleTurns: 64 },
  },
  {
    label: "Mortgages",
    accent: "#57C77E",
    paths: ["M4 11l8-6 8 6", "M6 10v9h12v-9", "M10 19v-5h4v5"],
    rosette: { R: 96, amplitude: 3.4, petals: 54, epicycle: 3.6, epicycleTurns: 45 },
  },
  {
    label: "Personal Loans",
    accent: "#8B7BF0",
    paths: ["M6 3h9l4 4v14H6z", "M9 9h6M9 13h6M9 17h4"],
    rosette: { R: 96, amplitude: 2.6, petals: 92, epicycle: 2.8, epicycleTurns: 78 },
  },
  {
    label: "Personal Insurance",
    accent: "#4C86F5",
    paths: ["M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z", "M9.4 12l1.9 1.9 3.4-3.9"],
    rosette: { R: 96, amplitude: 3.8, petals: 42, epicycle: 4, epicycleTurns: 36 },
  },
  {
    label: "Money Market",
    accent: "#E0B15C",
    paths: ["M4 19V9M9 19V5M14 19v-7M19 19v-4"],
    rosette: { R: 96, amplitude: 3, petals: 64, epicycle: 3, epicycleTurns: 88 },
  },
  {
    label: "Foreign Drafts",
    accent: "#6FA8FF",
    paths: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M3 12h18", "M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z"],
    rosette: { R: 96, amplitude: 3.2, petals: 58, epicycle: 3.4, epicycleTurns: 52 },
  },
];

function Plate({ motif, className }: { motif: Motif; className?: string }) {
  const cx = 200;
  const cy = 118;
  const id = motif.label.replace(/\W/g, "");

  const rosette = [
    ...guillocheStack({ cx, cy, ...motif.rosette }, 3, 0.022),
    ...guillocheStack(
      {
        cx,
        cy,
        R: motif.rosette.R * 0.72,
        amplitude: motif.rosette.amplitude * 0.7,
        petals: Math.round(motif.rosette.petals * 0.62),
        epicycle: motif.rosette.epicycle * 0.8,
        epicycleTurns: Math.round(motif.rosette.epicycleTurns * 0.7),
        phase: 0.6,
      },
      3,
      0.02
    ),
  ];

  const medallionShade = hatchField({
    x: cx - 46, y: cy - 46, width: 92, height: 92,
    angle: 0.55, gap: 3.6, maxWidth: 0.85, fade: "right",
  });

  // 24-unit art scaled into a 46px mark at the medallion's centre
  const s = 46 / 24;

  return (
    <svg viewBox="0 0 400 252" className={className} role="presentation" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-vig`} cx="38%" cy="26%" r="82%">
          <stop offset="0%" stopColor="#101C30" />
          <stop offset="100%" stopColor="#04070D" />
        </radialGradient>
        <clipPath id={`${id}-plate`}>
          <rect x="8" y="8" width="384" height="236" rx="9" />
        </clipPath>
        <clipPath id={`${id}-orn`}>
          <rect x="8" y="8" width="384" height="236" rx="9" />
        </clipPath>
        <clipPath id={`${id}-med`}>
          <circle cx={cx} cy={cy} r="46" />
        </clipPath>
      </defs>

      <rect width="400" height="252" fill={`url(#${id}-vig)`} />

      <g clipPath={`url(#${id}-plate)`}>
        {/* The rosette, in two passes a hair apart — a two-plate press never
            registers perfectly, and that misregistration is the tell. */}
        <g clipPath={`url(#${id}-orn)`} fill="none" strokeWidth="0.26">
          <g stroke={motif.accent} strokeOpacity="0.5">
            {rosette.map((d, i) => (
              <path key={`r${i}`} d={d} />
            ))}
          </g>
          <g stroke={INK} strokeOpacity="0.1" transform="translate(0.6,-0.6)">
            {rosette.map((d, i) => (
              <path key={`r2${i}`} d={d} />
            ))}
          </g>
        </g>

        {/* Medallion */}
        <circle cx={cx} cy={cy} r="46" fill="#070C16" fillOpacity="0.86" />
        <g clipPath={`url(#${id}-med)`} fill={INK} fillOpacity="0.07">
          {medallionShade.map((d, i) => (
            <path key={`m${i}`} d={d} />
          ))}
        </g>
        <g fill="none" stroke={INK}>
          <path d={ring(cx, cy, 46)} strokeWidth="1.1" strokeOpacity="0.55" />
          <path d={ring(cx, cy, 42)} strokeWidth="0.4" strokeOpacity="0.28" />
          <path d={knurl(cx, cy, 42, 46, 96)} strokeWidth="0.4" strokeOpacity="0.24" />
        </g>

        {/* The mark */}
        <g
          transform={`translate(${cx - 23} ${cy - 23}) scale(${s})`}
          fill="none"
          stroke={INK}
          strokeOpacity="0.92"
          strokeWidth={1.5 / s}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {motif.paths.map((d, i) => (
            <path key={`p${i}`} d={d} />
          ))}
        </g>

        {/* Counter panel — microtext rules and a rule in the product's hue */}
        <g>
          <path d="M28 190h74v34H28z" fill="none" stroke={INK} strokeOpacity="0.26" strokeWidth="0.55" />
          <path d="M36 200h58" stroke={INK} strokeOpacity="0.34" strokeWidth="2.2" strokeDasharray="0.7 1.6" />
          <path d="M36 209h58" stroke={INK} strokeOpacity="0.2" strokeWidth="2.2" strokeDasharray="0.7 1.6" />
          <path d="M36 217h32" stroke={motif.accent} strokeOpacity="0.75" strokeWidth="1.8" />
        </g>
        <g>
          <path d="M298 190h74v34h-74z" fill="none" stroke={INK} strokeOpacity="0.26" strokeWidth="0.55" />
          <path d={ring(335, 207, 12)} fill="none" stroke={INK} strokeOpacity="0.3" strokeWidth="0.5" />
          <path d={knurl(335, 207, 9, 12, 40)} fill="none" stroke={motif.accent} strokeOpacity="0.5" strokeWidth="0.5" />
        </g>
      </g>

      {/* Engine-turned border */}
      <g fill="none" stroke={INK} strokeWidth="0.4">
        <path d={waveBand({ x: 14, y: 14, width: 372, height: 224, amplitude: 2.4, waves: 62 })} strokeOpacity="0.26" />
        <path
          d={waveBand({ x: 14, y: 14, width: 372, height: 224, amplitude: 2.4, waves: 62, phase: Math.PI })}
          strokeOpacity="0.14"
        />
      </g>
      <rect x="8" y="8" width="384" height="236" rx="9" fill="none" stroke={INK} strokeOpacity="0.2" strokeWidth="0.7" />
    </svg>
  );
}

export default function ArtPreview() {
  return (
    <div className="min-h-screen bg-ink-0 p-6 text-fg">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-lg font-semibold">Engraved — plate and medallion</h1>
          <p className="mt-1 text-[13px] text-fg-muted">
            A rosette unique to each product, an engine-turned border, the mark set in a medallion.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {MOTIFS.map((m) => (
            <div key={m.label}>
              <div className="elev-2 overflow-hidden rounded-2xl border border-line">
                <Plate motif={m} className="block w-full" />
              </div>
              <p className="mt-2 px-1 text-[13px] text-fg-muted">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="elev-2 overflow-hidden rounded-2xl border border-line">
          <Plate motif={MOTIFS[0]} className="block w-full" />
        </div>
      </div>
    </div>
  );
}
