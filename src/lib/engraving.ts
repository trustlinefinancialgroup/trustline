/**
 * Line-engraving primitives — the drawing language of banknotes, share
 * certificates and passports.
 *
 * Everything here returns plain SVG path data from pure maths: deterministic,
 * identical on server and client, sharp at any size, and free of blur filters.
 *
 * Three things separate this from ordinary vector line work, and all three are
 * implemented here rather than approximated:
 *
 *   • Swelled lines. A graver cuts deeper as it enters shadow, so an engraved
 *     line is not a constant-width stroke — it thickens and tapers along its
 *     length. These are emitted as filled outlines, not strokes.
 *   • Crossed line systems. Tone is built by laying hatch at two or three
 *     angles, never by making one set darker.
 *   • Modulated guilloché. Real rosettes ride an amplitude wave and are laid
 *     down in phase-shifted passes, so the layers interfere and moiré appears.
 */

/** Fixed precision keeps server and client markup byte-identical. */
const p = (n: number) => n.toFixed(1);

/* ── Guilloché ─────────────────────────────────────────────────────────── */

export type GuillocheOptions = {
  cx: number;
  cy: number;
  /** Mean radius of the figure. */
  R: number;
  /** Depth of the petal wave riding on that radius. */
  amplitude: number;
  /** Petals around the figure. */
  petals: number;
  /** Radius of the secondary epicycle that gives the lace its detail. */
  epicycle: number;
  /** How many turns of the epicycle per revolution. */
  epicycleTurns: number;
  phase?: number;
  steps?: number;
};

/**
 * A rosette traced by a point on an epicycle riding an amplitude-modulated
 * radius. Small changes to `petals` and `epicycleTurns` give completely
 * different figures, which is how each product gets its own.
 */
export function guilloche({
  cx,
  cy,
  R,
  amplitude,
  petals,
  epicycle,
  epicycleTurns,
  phase = 0,
  steps = 1100,
}: GuillocheOptions): string {
  const out: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const radius = R + amplitude * Math.cos(petals * t + phase);
    const x = cx + radius * Math.cos(t) + epicycle * Math.cos(epicycleTurns * t + phase);
    const y = cy + radius * Math.sin(t) - epicycle * Math.sin(epicycleTurns * t + phase);
    out.push(`${i === 0 ? "M" : "L"}${p(x)},${p(y)}`);
  }
  return out.join(" ") + " Z";
}

/**
 * The same rosette laid down several times with a small phase shift each pass.
 * The passes interfere, which is what produces the moiré in real lathe work.
 */
export function guillocheStack(
  base: GuillocheOptions,
  passes = 3,
  phaseStep = 0.09
): string[] {
  return Array.from({ length: passes }, (_, i) =>
    guilloche({ ...base, phase: (base.phase ?? 0) + i * phaseStep })
  );
}

/* ── Swelled line work ─────────────────────────────────────────────────── */

/**
 * One engraved line as a filled outline whose width varies along its length.
 * `w0`, `w1` and `w2` are the widths at the start, middle and end.
 */
export function swelledLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  w0: number,
  w1: number,
  w2: number,
  samples = 5
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  const width = (t: number) =>
    t < 0.5 ? w0 + (w1 - w0) * (t / 0.5) : w1 + (w2 - w1) * ((t - 0.5) / 0.5);

  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const w = width(t) / 2;
    const x = x1 + dx * t;
    const y = y1 + dy * t;
    top.push(`${p(x + nx * w)},${p(y + ny * w)}`);
    bottom.push(`${p(x - nx * w)},${p(y - ny * w)}`);
  }
  bottom.reverse();
  return `M${top.join("L")}L${bottom.join("L")}Z`;
}

/**
 * Radial line work around a disc, swelling as it turns out of the light.
 * Returns filled outlines, so the tone comes from the shape of the cut rather
 * than from opacity alone.
 */
export function radialEngraving({
  cx,
  cy,
  inner,
  outer,
  count = 200,
  lightAngle = -2.2,
  maxWidth = 1.9,
  minWidth = 0.18,
}: {
  cx: number;
  cy: number;
  inner: number;
  outer: number;
  count?: number;
  lightAngle?: number;
  maxWidth?: number;
  minWidth?: number;
}): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const away = (1 - Math.cos(a - lightAngle)) / 2; // 0 lit, 1 in shadow
    const eased = away * away; // shadow gathers rather than ramping evenly
    const w = minWidth + (maxWidth - minWidth) * eased;
    out.push(
      swelledLine(
        cx + Math.cos(a) * inner,
        cy + Math.sin(a) * inner,
        cx + Math.cos(a) * outer,
        cy + Math.sin(a) * outer,
        w * 0.35,
        w,
        w * 0.2,
        4
      )
    );
  }
  return out;
}

/**
 * A field of parallel swelled lines at an angle, fading across the shape.
 * Laid twice at different angles this is how a flat plane gets its tone.
 */
export function hatchField({
  x,
  y,
  width,
  height,
  angle,
  gap = 4,
  maxWidth = 1.5,
  fade = "right",
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Radians. */
  angle: number;
  gap?: number;
  maxWidth?: number;
  /** Which edge the tone gathers towards. */
  fade?: "left" | "right" | "none";
}): string[] {
  const out: string[] = [];
  const diag = Math.hypot(width, height);
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const cx = x + width / 2;
  const cy = y + height / 2;
  const count = Math.ceil(diag / gap);

  for (let i = -count; i <= count; i++) {
    const off = i * gap;
    // Line centre, offset perpendicular to the hatch direction
    const ox = cx + -dy * off;
    const oy = cy + dx * off;
    const t = (i + count) / (count * 2); // 0 → 1 across the field
    const strength = fade === "none" ? 0.75 : fade === "right" ? t : 1 - t;
    const w = maxWidth * (0.15 + 0.85 * strength * strength);
    out.push(
      swelledLine(
        ox - dx * diag * 0.5,
        oy - dy * diag * 0.5,
        ox + dx * diag * 0.5,
        oy + dy * diag * 0.5,
        w * 0.2,
        w,
        w * 0.2,
        4
      )
    );
  }
  return out;
}

/* ── Borders and edges ─────────────────────────────────────────────────── */

/**
 * An engine-turned band: a sine wave run around a rectangle. Two of them at
 * opposite phase give the woven border of a certificate.
 */
export function waveBand({
  x,
  y,
  width,
  height,
  amplitude = 3,
  waves = 44,
  phase = 0,
  steps = 520,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  amplitude?: number;
  waves?: number;
  phase?: number;
  steps?: number;
}): string {
  const perimeter = 2 * (width + height);
  const out: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const d = (i / steps) * perimeter;
    let px: number;
    let py: number;
    let nx: number;
    let ny: number;

    if (d < width) {
      px = x + d; py = y; nx = 0; ny = -1;
    } else if (d < width + height) {
      px = x + width; py = y + (d - width); nx = 1; ny = 0;
    } else if (d < 2 * width + height) {
      px = x + width - (d - width - height); py = y + height; nx = 0; ny = 1;
    } else {
      px = x; py = y + height - (d - 2 * width - height); nx = -1; ny = 0;
    }

    const w = amplitude * Math.sin((d / perimeter) * waves * Math.PI * 2 + phase);
    out.push(`${i === 0 ? "M" : "L"}${p(px + nx * w)},${p(py + ny * w)}`);
  }
  return out.join(" ") + " Z";
}

/** A ring of milled ticks — the edge of a coin or a vault wheel. */
export function knurl(cx: number, cy: number, inner: number, outer: number, count = 96): string {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    out.push(
      `M${p(cx + Math.cos(a) * inner)},${p(cy + Math.sin(a) * inner)}` +
        `L${p(cx + Math.cos(a) * outer)},${p(cy + Math.sin(a) * outer)}`
    );
  }
  return out.join(" ");
}

/** A circle as path data, so it can join a single stroked group. */
export function ring(cx: number, cy: number, r: number): string {
  return (
    `M${p(cx - r)},${p(cy)}` +
    `a${p(r)},${p(r)} 0 1,0 ${p(r * 2)},0` +
    `a${p(r)},${p(r)} 0 1,0 ${p(-r * 2)},0`
  );
}
