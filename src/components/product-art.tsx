// Artwork for the products that aren't payment cards.
//
// Ten scenes built from one construction so they read as a set: a near-black
// ground matched to the app's own surfaces, a single bloom of the product's
// hue thrown from the upper left, the motif built from translucent planes with
// a lit top edge and a shadowed underside, and a soft pool of light on the
// floor beneath it. The light comes from the same place in every scene, which
// is most of what separates a designed set from ten drawings.
//
// The viewBox matches the card aspect ratio (1.586:1) exactly, so a tile and a
// card face are interchangeable in a grid.

type ArtProps = { className?: string };

const BASE_TOP = "#0E1728";
const BASE_MID = "#0A1220";
const BASE_DEEP = "#060B14";

/** One hue per motif — the only thing that changes between scenes. */
const ACCENTS: Record<string, string> = {
  vault: "#35D6A4",
  house: "#57C77E",
  contract: "#8B7BF0",
  shield: "#4C86F5",
  deposit: "#35C7D6",
  globe: "#6FA8FF",
  cheque: "#7FD4A0",
  handset: "#A8B8D8",
  market: "#E0B15C",
  storefront: "#B98BF0",
};

/** The ground, the bloom and the horizon — identical in every scene. */
function Field({ id, accent }: { id: string; accent: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-base`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={BASE_TOP} />
          <stop offset="58%" stopColor={BASE_MID} />
          <stop offset="100%" stopColor={BASE_DEEP} />
        </linearGradient>

        {/* The single light source, thrown from upper left */}
        <radialGradient id={`${id}-bloom`} cx="28%" cy="18%" r="72%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.42" />
          <stop offset="45%" stopColor={accent} stopOpacity="0.10" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>

        {/* Glass: what every plane in the motif is filled with */}
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
        </linearGradient>

        <linearGradient id={`${id}-tint`} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.12" />
        </linearGradient>

        <radialGradient id={`${id}-pool`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>

        <filter id={`${id}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      <rect width="400" height="252" fill={`url(#${id}-base)`} />
      <rect width="400" height="252" fill={`url(#${id}-bloom)`} />
      {/* Horizon: a single hairline keeps the objects standing on something */}
      <path d="M0 186H400" stroke="#FFFFFF" strokeOpacity="0.05" />
    </>
  );
}

/** The pool of light an object sits in. */
function Pool({ id, cx = 200, rx = 92 }: { id: string; cx?: number; rx?: number }) {
  return <ellipse cx={cx} cy="186" rx={rx} ry="13" fill={`url(#${id}-pool)`} opacity="0.9" />;
}

function Scene({ id, children }: { id: string; children: React.ReactNode }) {
  const accent = ACCENTS[id] ?? "#4C86F5";
  return (
    <>
      <Field id={id} accent={accent} />
      {children}
    </>
  );
}

/* Shared stroke weights. Lit edges catch the light from upper left; the
   shadowed ones sit under and to the right. */
const LIT = { stroke: "#FFFFFF", strokeOpacity: 0.34, strokeWidth: 1.4, fill: "none" } as const;
const EDGE = { stroke: "#FFFFFF", strokeOpacity: 0.12, strokeWidth: 1, fill: "none" } as const;

function Frame({ className, id, children }: ArtProps & { id: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 400 252" className={className} role="presentation" aria-hidden="true">
      <Scene id={id}>{children}</Scene>
    </svg>
  );
}

/* ── Savings: a vault door, opened just enough to show light behind it ── */
function Vault({ className }: ArtProps) {
  return (
    <Frame className={className} id="vault">
      <Pool id="vault" rx={86} />
      <rect x="128" y="62" width="144" height="124" rx="18" fill="url(#vault-glass)" />
      <rect x="128" y="62" width="144" height="124" rx="18" {...EDGE} />
      <path d="M146 62h108" {...LIT} />
      <circle cx="200" cy="124" r="42" fill="url(#vault-tint)" />
      <circle cx="200" cy="124" r="42" {...EDGE} />
      <circle cx="200" cy="124" r="28" {...LIT} strokeOpacity={0.26} />
      <circle cx="200" cy="124" r="9" fill="#FFFFFF" fillOpacity="0.5" />
      <g {...LIT}>
        <path d="M200 96v-14M200 166v-14M172 124h-14M242 124h-14" />
      </g>
      <circle cx="200" cy="124" r="52" fill="url(#vault-pool)" filter="url(#vault-soft)" />
    </Frame>
  );
}

/* ── Mortgage: a roofline with the lights on ── */
function House({ className }: ArtProps) {
  return (
    <Frame className={className} id="house">
      <Pool id="house" rx={96} />
      <path d="M200 58l82 58v70H118v-70z" fill="url(#house-glass)" />
      <path d="M200 58l82 58v70H118v-70z" {...EDGE} />
      <path d="M108 120L200 54l92 66" {...LIT} strokeWidth={1.8} strokeLinecap="round" />
      <rect x="176" y="138" width="48" height="48" rx="4" fill="url(#house-tint)" />
      <rect x="176" y="138" width="48" height="48" rx="4" {...EDGE} />
      <g {...LIT} strokeOpacity={0.22}>
        <rect x="138" y="132" width="26" height="26" rx="3" />
        <rect x="236" y="132" width="26" height="26" rx="3" />
      </g>
      <ellipse cx="200" cy="176" rx="34" ry="22" fill="url(#house-pool)" filter="url(#house-soft)" />
    </Frame>
  );
}

/* ── Personal loan: an agreement, signed ── */
function Contract({ className }: ArtProps) {
  return (
    <Frame className={className} id="contract">
      <Pool id="contract" rx={84} />
      <g transform="rotate(-5 200 122)">
        <rect x="140" y="52" width="120" height="140" rx="10" fill="url(#contract-glass)" />
        <rect x="140" y="52" width="120" height="140" rx="10" {...EDGE} />
        <path d="M150 52h100" {...LIT} />
        <g stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="4" strokeLinecap="round">
          <path d="M160 82h80M160 98h80M160 114h52" />
        </g>
        {/* the signature */}
        <path
          d="M160 152c10-12 16 10 26 2s12-16 22-6 14 12 30 2"
          fill="none"
          stroke={ACCENTS.contract}
          strokeOpacity="0.95"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path d="M160 168h80" stroke="#FFFFFF" strokeOpacity="0.14" strokeWidth="2" />
      </g>
      <ellipse cx="200" cy="150" rx="52" ry="30" fill="url(#contract-pool)" filter="url(#contract-soft)" />
    </Frame>
  );
}

/* ── Insurance: cover, and the tick that means it held ── */
function Shield({ className }: ArtProps) {
  return (
    <Frame className={className} id="shield">
      <Pool id="shield" rx={78} />
      <path d="M200 52l58 24v50c0 38-26 58-58 68-32-10-58-30-58-68V76z" fill="url(#shield-glass)" />
      <path d="M200 52l58 24v50c0 38-26 58-58 68-32-10-58-30-58-68V76z" {...EDGE} />
      <path d="M200 52l58 24" {...LIT} strokeWidth={1.8} strokeLinecap="round" />
      <path d="M200 66l44 18v42c0 29-20 45-44 53-24-8-44-24-44-53V84z" fill="url(#shield-tint)" opacity="0.5" />
      <path
        d="M176 122l17 17 33-37"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.9"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="200" cy="140" rx="46" ry="34" fill="url(#shield-pool)" filter="url(#shield-soft)" />
    </Frame>
  );
}

/* ── Deposits: money arriving ── */
function Deposit({ className }: ArtProps) {
  return (
    <Frame className={className} id="deposit">
      <Pool id="deposit" rx={90} />
      <rect x="120" y="132" width="160" height="54" rx="12" fill="url(#deposit-glass)" />
      <rect x="120" y="132" width="160" height="54" rx="12" {...EDGE} />
      <path d="M136 132h128" {...LIT} />
      <rect x="160" y="144" width="80" height="7" rx="3.5" fill="#FFFFFF" fillOpacity="0.22" />
      <g transform="translate(0 -6)">
        <rect x="166" y="52" width="68" height="46" rx="8" fill="url(#deposit-tint)" />
        <rect x="166" y="52" width="68" height="46" rx="8" {...EDGE} />
        <path d="M176 52h48" {...LIT} />
      </g>
      <path
        d="M200 104v18m0 0l-11-11m11 11l11-11"
        fill="none"
        stroke={ACCENTS.deposit}
        strokeOpacity="0.95"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="200" cy="150" rx="60" ry="26" fill="url(#deposit-pool)" filter="url(#deposit-soft)" />
    </Frame>
  );
}

/* ── Foreign drafts: money crossing a border ── */
function Globe({ className }: ArtProps) {
  return (
    <Frame className={className} id="globe">
      <Pool id="globe" rx={82} />
      <circle cx="200" cy="118" r="62" fill="url(#globe-glass)" />
      <circle cx="200" cy="118" r="62" {...EDGE} />
      <path d="M158 74a62 62 0 0 1 84 0" {...LIT} strokeLinecap="round" />
      <g stroke="#FFFFFF" strokeOpacity="0.16" strokeWidth="1" fill="none">
        <path d="M138 118h124M200 56v124" />
        <ellipse cx="200" cy="118" rx="30" ry="62" />
        <ellipse cx="200" cy="118" rx="62" ry="26" />
      </g>
      {/* the transfer arc */}
      <path
        d="M156 142c26-46 62-46 88 0"
        fill="none"
        stroke={ACCENTS.globe}
        strokeOpacity="0.95"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="5 7"
      />
      <circle cx="156" cy="142" r="5" fill="#FFFFFF" fillOpacity="0.85" />
      <circle cx="244" cy="142" r="5" fill={ACCENTS.globe} />
      <circle cx="200" cy="118" r="70" fill="url(#globe-pool)" filter="url(#globe-soft)" opacity="0.5" />
    </Frame>
  );
}

/* ── Interest checking: a balance that earns ── */
function Cheque({ className }: ArtProps) {
  return (
    <Frame className={className} id="cheque">
      <Pool id="cheque" rx={92} />
      <rect x="112" y="74" width="176" height="102" rx="12" fill="url(#cheque-glass)" />
      <rect x="112" y="74" width="176" height="102" rx="12" {...EDGE} />
      <path d="M128 74h144" {...LIT} />
      <g stroke="#FFFFFF" strokeOpacity="0.16" strokeWidth="3.5" strokeLinecap="round">
        <path d="M130 100h68M130 116h44" />
      </g>
      <path
        d="M130 158l32-22 26 16 30-34 32 20"
        fill="none"
        stroke={ACCENTS.cheque}
        strokeOpacity="0.95"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="250" cy="138" r="4.5" fill={ACCENTS.cheque} />
      <ellipse cx="200" cy="150" rx="60" ry="28" fill="url(#cheque-pool)" filter="url(#cheque-soft)" />
    </Frame>
  );
}

/* ── Telephone banking: a person on the other end ── */
function Handset({ className }: ArtProps) {
  return (
    <Frame className={className} id="handset">
      <Pool id="handset" rx={74} />
      <rect x="162" y="52" width="76" height="134" rx="16" fill="url(#handset-glass)" />
      <rect x="162" y="52" width="76" height="134" rx="16" {...EDGE} />
      <path d="M176 52h48" {...LIT} />
      <rect x="174" y="70" width="52" height="86" rx="7" fill="url(#handset-tint)" opacity="0.5" />
      <circle cx="200" cy="170" r="5" fill="#FFFFFF" fillOpacity="0.4" />
      <g fill="none" stroke={ACCENTS.handset} strokeLinecap="round">
        <path d="M256 88a44 44 0 0 1 0 62" strokeOpacity="0.75" strokeWidth="2.4" />
        <path d="M274 74a68 68 0 0 1 0 90" strokeOpacity="0.4" strokeWidth="2.4" />
        <path d="M144 88a44 44 0 0 0 0 62" strokeOpacity="0.35" strokeWidth="2.4" />
      </g>
      <ellipse cx="200" cy="140" rx="44" ry="34" fill="url(#handset-pool)" filter="url(#handset-soft)" />
    </Frame>
  );
}

/* ── Money market: a rate worth watching ── */
function Market({ className }: ArtProps) {
  return (
    <Frame className={className} id="market">
      <Pool id="market" rx={96} />
      <g>
        {[
          [132, 140],
          [166, 116],
          [200, 128],
          [234, 92],
          [268, 68],
        ].map(([x, y], i) => (
          <g key={x}>
            <rect x={x} y={y} width="26" height={186 - y} rx="6" fill="url(#market-glass)" />
            <rect x={x} y={y} width="26" height={186 - y} rx="6" {...EDGE} />
            <path d={`M${x + 4} ${y}h18`} {...LIT} strokeOpacity={0.3 - i * 0.02} />
          </g>
        ))}
      </g>
      <path
        d="M145 132l34-22 34 12 34-34 34-22"
        fill="none"
        stroke={ACCENTS.market}
        strokeOpacity="0.95"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="281" cy="66" r="5" fill={ACCENTS.market} />
      <ellipse cx="220" cy="130" rx="70" ry="40" fill="url(#market-pool)" filter="url(#market-soft)" opacity="0.7" />
    </Frame>
  );
}

/* ── Small business: the shop that opens tomorrow ── */
function Storefront({ className }: ArtProps) {
  return (
    <Frame className={className} id="storefront">
      <Pool id="storefront" rx={98} />
      <rect x="118" y="98" width="164" height="88" rx="10" fill="url(#storefront-glass)" />
      <rect x="118" y="98" width="164" height="88" rx="10" {...EDGE} />
      {/* awning */}
      <path d="M110 98l14-30h152l14 30z" fill="url(#storefront-tint)" />
      <path d="M110 98l14-30h152l14 30z" {...EDGE} />
      <path d="M124 68h152" {...LIT} strokeWidth={1.8} strokeLinecap="round" />
      <g stroke="#FFFFFF" strokeOpacity="0.14" strokeWidth="1">
        <path d="M138 98v-30M166 98v-30M194 98v-30M222 98v-30M250 98v-30" />
      </g>
      <rect x="180" y="132" width="40" height="54" rx="5" fill="#FFFFFF" fillOpacity="0.10" />
      <rect x="180" y="132" width="40" height="54" rx="5" {...EDGE} />
      <rect x="136" y="128" width="30" height="26" rx="4" {...EDGE} />
      <rect x="234" y="128" width="30" height="26" rx="4" {...EDGE} />
      <ellipse cx="200" cy="160" rx="70" ry="30" fill="url(#storefront-pool)" filter="url(#storefront-soft)" />
    </Frame>
  );
}

const SCENES: Record<string, (p: ArtProps) => React.ReactElement> = {
  vault: Vault,
  house: House,
  contract: Contract,
  shield: Shield,
  deposit: Deposit,
  globe: Globe,
  cheque: Cheque,
  handset: Handset,
  market: Market,
  storefront: Storefront,
};

export function ProductArt({ art, className }: { art: string; className?: string }) {
  const Scene = SCENES[art] ?? Vault;
  return <Scene className={className} />;
}
