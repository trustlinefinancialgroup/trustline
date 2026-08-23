"use client";

import { useId, useMemo, useRef, useState } from "react";

/**
 * The balance over time, drawn on the dark balance card.
 *
 * One series, so there is no legend — the card's own label names it. The line
 * is 2px on a recessive baseline, the fill is a single sequential hue fading
 * out, and hovering anywhere reveals a crosshair with that day's figure. The
 * hit area is the full plot rather than the line itself, so it is reachable on
 * a phone.
 */

/** Each point arrives pre-formatted, so Intl stays on the server. */
export type TrendDatum = { v: number; date: string; value: string };

const W = 600; // viewBox units; the SVG scales to its container
const H = 130;
const PAD_Y = 10;

export function BalanceTrend({ data, label }: { data: TrendDatum[]; label: string }) {
  const gradientId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const geom = useMemo(() => {
    if (data.length < 2) return null;
    const values = data.map((d) => d.v);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;

    const x = (i: number) => (i / (data.length - 1)) * W;
    const y = (v: number) => PAD_Y + (1 - (v - min) / span) * (H - PAD_Y * 2);

    const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${y(d.v).toFixed(2)}`).join(" ");
    const area = `${line} L${W},${H} L0,${H} Z`;
    return { x, y, line, area };
  }, [data]);

  if (!geom) return null;

  const active = hover === null ? null : data[hover];

  function onMove(event: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const i = Math.round(ratio * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  }

  return (
    <figure className="relative m-0">
      <figcaption className="sr-only">{label}</figcaption>

      {/* Read-out sits above the plot so it never covers the line */}
      <div className="mb-1 flex h-5 items-center justify-end gap-2 text-[11px] text-navy-300">
        {active && (
          <>
            <span className="tnum">{active.date}</span>
            <span className="tnum font-semibold text-white">{active.value}</span>
          </>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-[110px] w-full touch-none"
        role="img"
        aria-label={label}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b8def" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#5b8def" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={geom.area} fill={`url(#${gradientId})`} />
        <path
          d={geom.line}
          fill="none"
          stroke="#5b8def"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {active && hover !== null && (
          <g>
            <line
              x1={geom.x(hover)}
              y1={0}
              x2={geom.x(hover)}
              y2={H}
              stroke="#ffffff"
              strokeOpacity="0.28"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            {/* 2px surface ring keeps the marker legible over the fill */}
            <circle
              cx={geom.x(hover)}
              cy={geom.y(active.v)}
              r="5"
              fill="#5b8def"
              stroke="#061530"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}
      </svg>
    </figure>
  );
}
