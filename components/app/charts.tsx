"use client";

import { useId } from "react";

/* ── Mini line chart with a soft area fill (bespoke inline SVG) ────────────── */
export function MiniLineChart({
  data,
  color = "var(--color-primary)",
  height = 56,
  className,
}: {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const w = 200;
  const h = height;
  const pad = 4;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L${pts[0][0].toFixed(1)} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" style={{ width: "100%", height }}>
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#fill-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.6" fill={color} />
    </svg>
  );
}

/* ── Larger area chart (revenue) + optional bar overlay (visits) ───────────── */
export function AreaChart({
  data,
  bars,
  labels,
  color = "var(--color-primary)",
  barColor = "var(--seg-2)",
  height = 160,
}: {
  data: number[];
  /** Optional secondary series rendered as faint background bars (e.g. visits). */
  bars?: number[];
  labels?: string[];
  color?: string;
  barColor?: string;
  height?: number;
}) {
  const id = useId().replace(/:/g, "");
  const w = 560;
  const h = height;
  const padX = 10;
  const padTop = 10;
  const padBottom = labels ? 22 : 8;
  const max = Math.max(...data);
  const min = Math.min(...data) * 0.9;
  const span = max - min || 1;
  const step = (w - padX * 2) / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = padX + i * step;
    const y = padTop + (1 - (v - min) / span) * (h - padTop - padBottom);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const baseY = h - padBottom;
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${baseY} L${pts[0][0].toFixed(1)} ${baseY} Z`;

  const barMax = bars ? Math.max(...bars) : 1;
  const barW = step * 0.42;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`afill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* faint gridlines */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={padX} x2={w - padX} y1={padTop + g * (h - padTop - padBottom)} y2={padTop + g * (h - padTop - padBottom)} stroke="var(--color-border)" strokeWidth="1" />
      ))}
      {/* visits bars in the background */}
      {bars &&
        bars.map((b, i) => {
          const bh = (b / barMax) * (h - padTop - padBottom) * 0.62;
          const x = padX + i * step - barW / 2;
          return <rect key={i} x={x} y={baseY - bh} width={barW} height={bh} rx="2.5" fill={barColor} opacity="0.16" />;
        })}
      <path d={area} fill={`url(#afill-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 3.2 : 2.2} fill="var(--color-card)" stroke={color} strokeWidth="1.6" />
      ))}
      {labels &&
        labels.map((lab, i) => (
          <text key={lab} x={padX + i * step} y={h - 6} textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)" fontFamily="var(--font-mono)">
            {lab}
          </text>
        ))}
    </svg>
  );
}

/* ── Donut chart for appointment-type mix (bespoke inline SVG) ─────────────── */
export function DonutChart({
  segments,
  size = 132,
  thickness = 16,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }} className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-muted)" strokeWidth={thickness} />
      {segments.map((s) => {
        const len = (s.value / total) * circ;
        const dash = `${len} ${circ - len}`;
        const el = (
          <circle
            key={s.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

/* ── Multi-color segmented allocation bar (legend included) ─────────────────── */
export function SegmentedBar({
  segments,
  className,
}: {
  segments: { label: string; value: number; color: string }[];
  className?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className={className}>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((s, i) => (
          <span
            key={s.label}
            title={`${s.label} · ${s.value}%`}
            style={{ width: `${(s.value / total) * 100}%`, background: s.color, marginLeft: i === 0 ? 0 : 1.5 }}
            className="h-full first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.label}
            <span className="tnum text-foreground/70">{s.value}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
