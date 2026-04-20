import { useMemo, useState } from "react";
import {
  EMPLOYERS,
  HIGHWAYS,
  PARISHES,
  SEV_COLOR,
  buildSchoolDots,
  severity,
  severityLabel,
  type LayerKey,
} from "@/lib/lens-data";
import { ArrowDown, ArrowUp, Minus, TriangleAlert } from "lucide-react";

interface Props {
  layer: LayerKey;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Approximate Louisiana state outline in a 100×100 viewBox.
 * Shape captures the boot/heel and the Florida Parishes notch.
 */
const LA_PATH =
  "M 6,8 L 53,7 L 53,18 L 92,18 L 92,42 L 88,52 L 86,62 L 90,68 L 92,76 L 86,80 L 78,82 L 76,88 L 70,90 L 64,86 L 60,90 L 54,88 L 50,92 L 44,90 L 40,94 L 34,92 L 28,94 L 22,92 L 16,88 L 12,82 L 8,74 L 6,62 L 7,46 L 6,30 Z";

export function LouisianaMap({ layer, selectedId, onSelect }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const dots = useMemo(() => buildSchoolDots(), []);
  const activeId = hoverId ?? selectedId;
  const activeParish = PARISHES.find((p) => p.id === activeId) ?? null;

  return (
    <div className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-[var(--surface-elevated)] shadow-card">
      {/* Top strip: title + legend */}
      <div className="flex items-start justify-between px-5 pt-4">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Geographic View
          </div>
          <div className="mt-0.5 font-display text-[15px] font-semibold tracking-tight text-foreground">
            Louisiana <span className="text-[var(--text-muted)]">·</span>{" "}
            <span className="text-gradient-accent">{layer}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
          <Legend swatch={<span className="h-2 w-2 rounded-full" style={{ background: "var(--sev-green)" }} />}>
            Healthy
          </Legend>
          <Legend swatch={<span className="h-2 w-2 rounded-full" style={{ background: "var(--sev-yellow)" }} />}>
            Concerning
          </Legend>
          <Legend swatch={<span className="h-2 w-2 rounded-full" style={{ background: "var(--sev-red)" }} />}>
            Crisis
          </Legend>
          <span className="mx-1 h-3 w-px bg-border" />
          <Legend swatch={<span className="h-1.5 w-1.5 rounded-full bg-foreground/55" />}>School</Legend>
          <Legend swatch={<span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--sev-red)" }} />}>
            D/F
          </Legend>
          <Legend swatch={<span className="h-px w-3 bg-foreground/35" />}>Highway</Legend>
        </div>
      </div>

      {/* Map canvas */}
      <div className="relative mx-auto mt-3 aspect-[5/4] w-full max-w-[820px] px-5 pb-4">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 mx-auto h-full w-full"
        >
          <defs>
            <linearGradient id="laFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.96 0.012 85)" />
              <stop offset="100%" stopColor="oklch(0.93 0.014 85)" />
            </linearGradient>
            <pattern id="dots" width="2" height="2" patternUnits="userSpaceOnUse">
              <circle cx="0.5" cy="0.5" r="0.18" fill="oklch(0.78 0.012 85)" />
            </pattern>
            <clipPath id="laClip">
              <path d={LA_PATH} />
            </clipPath>
          </defs>

          {/* State silhouette */}
          <path d={LA_PATH} fill="url(#laFill)" stroke="var(--ink)" strokeWidth="0.35" strokeLinejoin="round" />
          <path d={LA_PATH} fill="url(#dots)" opacity="0.5" />

          {/* Highways clipped to state */}
          <g clipPath="url(#laClip)" opacity="0.55">
            {HIGHWAYS.map((h) => (
              <path
                key={h.name}
                d={h.d}
                fill="none"
                stroke="var(--ink)"
                strokeWidth="0.35"
                strokeDasharray="0.9 0.6"
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* Highway labels */}
          <g className="pointer-events-none">
            {HIGHWAYS.map((h) => {
              // label at first coord
              const m = h.d.match(/M\s*([\d.]+),([\d.]+)/);
              if (!m) return null;
              const x = parseFloat(m[1]) + 0.5;
              const y = parseFloat(m[2]) - 1.2;
              return (
                <text
                  key={h.name}
                  x={x}
                  y={y}
                  fontSize="1.6"
                  fontWeight="600"
                  fill="var(--text-muted)"
                  letterSpacing="0.05em"
                >
                  {h.name}
                </text>
              );
            })}
          </g>

          {/* School dots */}
          <g clipPath="url(#laClip)">
            {dots.map((d, i) => (
              <circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={d.failing ? 0.55 : 0.42}
                className="school-dot"
                fill={d.failing ? "var(--sev-red)" : "var(--ink)"}
                opacity={d.failing ? 0.85 : 0.45}
                style={{ animationDelay: `${(i % 7) * 0.4}s` }}
              />
            ))}
          </g>
        </svg>

        {/* Employer markers (Health layer only) */}
        {layer === "Health" &&
          EMPLOYERS.map((emp) => (
            <div
              key={emp.name}
              className="pointer-events-none absolute z-20 flex flex-col items-center"
              style={{ left: `${emp.x}%`, top: `${emp.y}%`, transform: "translate(-50%, -100%)" }}
            >
              <div className="rounded-full border border-foreground/25 bg-[var(--surface-elevated)] px-2 py-0.5 font-mono text-[8px] font-bold tracking-[0.08em] text-foreground shadow-card">
                {emp.name} <span className="text-[var(--text-muted)]">{emp.value}</span>
              </div>
              <div
                className="mt-0.5 h-0 w-0"
                style={{
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderTop: "5px solid var(--ink)",
                }}
              />
            </div>
          ))}

        {/* Parish hit-targets (invisible, capture clicks/hover) and rich pin */}
        {PARISHES.map((p) => {
          const score = p.scores[layer];
          const sev = severity(layer, score);
          const color = SEV_COLOR[sev];
          const isSelected = selectedId === p.id;
          const isHovered = hoverId === p.id;
          const isActive = isSelected || isHovered;

          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              onMouseEnter={() => setHoverId(p.id)}
              onMouseLeave={() => setHoverId(null)}
              className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              aria-label={p.name}
            >
              {/* Outer halo */}
              <span
                className="absolute rounded-full transition-all duration-300"
                style={{
                  width: isActive ? 36 : 26,
                  height: isActive ? 36 : 26,
                  background: color,
                  opacity: isActive ? 0.18 : 0.10,
                }}
              />
              {/* Pin */}
              <span
                className="relative flex items-center justify-center rounded-full border-2 bg-[var(--background)] font-mono text-[10px] font-bold tabular-nums shadow-card transition-all"
                style={{
                  width: isActive ? 30 : 24,
                  height: isActive ? 30 : 24,
                  borderColor: color,
                  color: color,
                }}
              >
                {score}
              </span>
              {p.alert && (
                <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                  <span
                    className="alert-dot absolute inline-flex h-full w-full rounded-full"
                    style={{ background: "var(--sev-red)" }}
                  />
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full ring-1 ring-[var(--background)]"
                    style={{ background: "var(--sev-red)" }}
                  />
                </span>
              )}
            </button>
          );
        })}

        {/* Floating insight card for active parish */}
        {activeParish && (
          <ParishInsightCard
            parish={activeParish}
            layer={layer}
            pinned={!!selectedId && selectedId === activeParish.id}
          />
        )}
      </div>
    </div>
  );
}

function ParishInsightCard({
  parish,
  layer,
  pinned,
}: {
  parish: (typeof PARISHES)[number];
  layer: LayerKey;
  pinned: boolean;
}) {
  const score = parish.scores[layer];
  const sev = severity(layer, score);
  const color = SEV_COLOR[sev];
  const label = severityLabel(layer, score);
  const TrendIcon = parish.trend === "up" ? ArrowUp : parish.trend === "down" ? ArrowDown : Minus;
  const trendColor =
    parish.trend === "up"
      ? "var(--sev-green)"
      : parish.trend === "down"
      ? "var(--sev-red)"
      : "var(--text-muted)";
  const dfPct = ((parish.dfSchools / parish.totalSchools) * 100).toFixed(0);

  // Position above parish if there's room, else below
  const above = parish.y > 35;
  const transform = above
    ? "translate(-50%, calc(-100% - 18px))"
    : "translate(-50%, 18px)";

  return (
    <div
      className="pointer-events-none absolute z-30 w-[220px]"
      style={{ left: `${parish.x}%`, top: `${parish.y}%`, transform }}
    >
      <div className="overflow-hidden rounded-xl border border-border bg-[var(--surface-elevated)]/95 shadow-elevated backdrop-blur-md">
        {/* Severity ribbon */}
        <div className="h-0.5 w-full" style={{ background: color }} />
        <div className="flex items-center justify-between gap-2 px-3 pt-2.5">
          <div className="min-w-0">
            <div className="truncate font-display text-[14px] font-semibold tracking-tight text-foreground">
              {parish.name}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
              <span className="font-mono tabular-nums">{(parish.population / 1000).toFixed(0)}K pop</span>
              <span style={{ color: trendColor }} className="inline-flex items-center gap-0.5">
                <TrendIcon className="h-2.5 w-2.5" />
                {parish.trend === "flat" ? "stable" : parish.trend}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end leading-none">
            <span className="font-display font-bold tabular-nums" style={{ color, fontSize: 22 }}>
              {score}
            </span>
            <span
              className="mt-0.5 rounded-sm px-1 py-px text-[8px] font-semibold uppercase tracking-[0.1em]"
              style={{
                background: `color-mix(in oklab, ${color} 14%, transparent)`,
                color,
              }}
            >
              {label}
            </span>
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2 px-3 py-2.5">
          <MiniStat label="Schools" value={String(parish.totalSchools)} />
          <MiniStat label="Students" value={`${(parish.students / 1000).toFixed(0)}K`} />
          <MiniStat label="D/F" value={`${dfPct}%`} tone="danger" />
        </div>

        {parish.alert && (
          <div className="flex items-center gap-1.5 border-t border-border px-3 py-1.5"
            style={{ background: "color-mix(in oklab, var(--sev-red) 6%, transparent)" }}>
            <TriangleAlert className="h-3 w-3 shrink-0" style={{ color: "var(--sev-red)" }} />
            <span className="truncate text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: "var(--sev-red)" }}>
              {parish.alert}
            </span>
          </div>
        )}

        {pinned && (
          <div className="border-t border-border px-3 py-1 text-center text-[8px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Pinned · See sidebar for detail
          </div>
        )}
      </div>
      {/* Pointer */}
      <div
        className="mx-auto h-0 w-0"
        style={{
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          ...(above
            ? { borderTop: "6px solid color-mix(in oklab, var(--surface-elevated) 95%, transparent)", marginTop: -1 }
            : { borderBottom: "6px solid color-mix(in oklab, var(--surface-elevated) 95%, transparent)", marginBottom: -1, position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)" }),
        }}
      />
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: "danger" }) {
  const color = tone === "danger" ? "var(--sev-red)" : "var(--foreground)";
  return (
    <div className="flex flex-col">
      <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </span>
      <span className="font-mono text-[12px] font-bold tabular-nums leading-tight" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function Legend({ swatch, children }: { swatch: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      {swatch}
      {children}
    </span>
  );
}
