import { useMemo, useRef, useState } from "react";
import {
  EMPLOYERS,
  HIGHWAYS,
  INVESTMENTS,
  PARISHES,
  PARISH_POLYGONS,
  SEV_COLOR,
  buildHexBins,
  buildSchoolDots,
  buildParishSchoolDots,
  failingClusterScore,
  severity,
  severityLabel,
  type Investment,
  type LayerKey,
  type ParishSchoolDot,
} from "@/lib/lens-data";
import { LA_PATH } from "@/lib/la-geo";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Crosshair,
  DollarSign,
  Flame,
  Hexagon,
  Maximize2,
  Minus,
  Pin,
  Plus,
  RotateCcw,
  TriangleAlert,
  X,
} from "lucide-react";

interface Props {
  layer: LayerKey;
  selectedId: string | null;
  onSelect: (id: string) => void;
  focusIds: Set<string>;
  onClearFocus: () => void;
}

type ViewMode = "pins" | "heatmap" | "hex";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3.5;

export function LouisianaMap({ layer, selectedId, onSelect, focusIds, onClearFocus }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [hoverInv, setHoverInv] = useState<Investment | null>(null);
  const [hoverEmp, setHoverEmp] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<ViewMode>("pins");
  const [isoSchool, setIsoSchool] = useState<ParishSchoolDot | null>(null);
  const dragStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const dots = useMemo(() => buildSchoolDots(), []);
  const hexes = useMemo(() => buildHexBins(4.0), []);
  const maxHex = useMemo(() => Math.max(1, ...hexes.map((h) => h.count)), [hexes]);

  // Per-focused-parish school dots — cached per id.
  const focusedDots = useMemo<ParishSchoolDot[]>(() => {
    if (focusIds.size === 0) return [];
    return [...focusIds].flatMap((id) => buildParishSchoolDots(id));
  }, [focusIds]);

  const hasFocus = focusIds.size > 0;

  const activeId = hoverId ?? selectedId;
  const activeParish = PARISHES.find((p) => p.id === activeId) ?? null;

  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const zoomBy = (delta: number) => {
    setZoom((z) => {
      const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta));
      if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
      return next;
    });
  };
  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 30) return;
    e.preventDefault();
    zoomBy(e.deltaY > 0 ? -0.2 : 0.2);
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom === 1) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
  };
  const onPointerUp = () => {
    setDragging(false);
    dragStart.current = null;
  };

  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
  const inv = 1 / zoom;
  const showPins = mode === "pins";
  const showHeat = mode === "heatmap";
  const showHex = mode === "hex";

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-[var(--surface-elevated)] shadow-card">
      {/* Top strip */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Geographic Intelligence
          </div>
          <div className="mt-0.5 font-display text-[15px] font-semibold tracking-tight text-foreground">
            Louisiana <span className="text-[var(--text-muted)]">·</span>{" "}
            <span className="text-gradient-accent">{layer}</span>
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-1 rounded-full border border-border bg-[var(--background)] p-0.5">
          <ModeBtn active={showPins} onClick={() => setMode("pins")} label="Pins" icon={Pin} />
          <ModeBtn active={showHeat} onClick={() => setMode("heatmap")} label="Heatmap" icon={Flame} />
          <ModeBtn active={showHex} onClick={() => setMode("hex")} label="Hex" icon={Hexagon} />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
          {showPins && (
            <>
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
            </>
          )}
          <Legend swatch={<DollarSign className="h-2.5 w-2.5" style={{ color: "var(--sev-green)" }} />}>
            $ Investment
          </Legend>
          <Legend swatch={<Briefcase className="h-2.5 w-2.5 text-foreground" />}>Employer</Legend>
          <Legend swatch={<TriangleAlert className="h-2.5 w-2.5" style={{ color: "var(--sev-red)" }} />}>
            Crisis flag
          </Legend>
        </div>
      </div>

      {/* Map canvas */}
      <div className="relative mx-auto mt-3 w-full max-w-[860px] flex-1 px-5 pb-4" style={{ minHeight: 460 }}>
        <div
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className={`relative h-full w-full select-none touch-none ${
            zoom > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
          }`}
          style={{ aspectRatio: "5 / 4" }}
        >
          {/* Transform wrapper */}
          <div
            className="absolute inset-0 origin-center"
            style={{
              transform,
              transition: dragging ? "none" : "transform 0.18s ease-out",
            }}
          >
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 h-full w-full"
            >
              <defs>
                <linearGradient id="laFill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.965 0.012 85)" />
                  <stop offset="100%" stopColor="oklch(0.935 0.014 85)" />
                </linearGradient>
                <pattern id="dots" width="1.6" height="1.6" patternUnits="userSpaceOnUse">
                  <circle cx="0.4" cy="0.4" r="0.15" fill="oklch(0.78 0.012 85)" />
                </pattern>
                <clipPath id="laClip">
                  <path d={LA_PATH} />
                </clipPath>

                {/* Heatmap radial gradients per parish */}
                {showHeat &&
                  PARISHES.map((p) => {
                    const score = p.scores[layer];
                    const color = SEV_COLOR[severity(layer, score)];
                    return (
                      <radialGradient key={p.id} id={`heat-${p.id}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.85" />
                        <stop offset="55%" stopColor={color} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                      </radialGradient>
                    );
                  })}
              </defs>

              {/* Real Louisiana shape */}
              <path
                d={LA_PATH}
                fill="url(#laFill)"
                stroke="var(--ink)"
                strokeWidth="0.35"
                strokeLinejoin="round"
              />
              <path d={LA_PATH} fill="url(#dots)" opacity="0.4" />

              {/* Highways */}
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
              <g className="pointer-events-none">
                {HIGHWAYS.map((h) => {
                  const m = h.d.match(/M\s*([\d.]+),([\d.]+)/);
                  if (!m) return null;
                  const x = parseFloat(m[1]) + 0.5;
                  const y = parseFloat(m[2]) - 1.2;
                  return (
                    <text
                      key={h.name}
                      x={x}
                      y={y}
                      fontSize="1.5"
                      fontWeight="600"
                      fill="var(--text-muted)"
                      letterSpacing="0.05em"
                    >
                      {h.name}
                    </text>
                  );
                })}
              </g>

              {/* HEATMAP MODE: density blobs replace pins */}
              {showHeat && (
                <g clipPath="url(#laClip)">
                  {PARISHES.map((p) => {
                    const r = 9 + Math.sqrt(p.totalSchools) * 1.6;
                    return (
                      <circle
                        key={p.id}
                        cx={p.x}
                        cy={p.y}
                        r={r}
                        fill={`url(#heat-${p.id})`}
                        style={{ mixBlendMode: "multiply" }}
                      />
                    );
                  })}
                </g>
              )}

              {/* HEX MODE: hex bins of school density */}
              {showHex && (
                <g clipPath="url(#laClip)">
                  {hexes.map((h, i) => {
                    const t = h.count / maxHex;
                    const failingT = h.failing / Math.max(1, h.count);
                    const color =
                      failingT > 0.4
                        ? "var(--sev-red)"
                        : failingT > 0.2
                        ? "var(--sev-orange)"
                        : "var(--ink)";
                    const size = 2.0;
                    return (
                      <polygon
                        key={i}
                        points={hexPoints(h.x, h.y, size)}
                        fill={color}
                        fillOpacity={0.15 + t * 0.55}
                        stroke="var(--background)"
                        strokeWidth="0.15"
                      />
                    );
                  })}
                </g>
              )}

              {/* School dots — only in pin mode */}
              {showPins && (
                <g clipPath="url(#laClip)">
                  {dots.map((d, i) => (
                    <circle
                      key={i}
                      cx={d.x}
                      cy={d.y}
                      r={d.failing ? 0.5 : 0.36}
                      className="school-dot"
                      fill={d.failing ? "var(--sev-red)" : "var(--ink)"}
                      opacity={d.failing ? 0.85 : 0.4}
                      style={{ animationDelay: `${(i % 7) * 0.4}s` }}
                    />
                  ))}
                </g>
              )}
            </svg>

            {/* Employer pins — visible on all layers, contextual on Health */}
            {EMPLOYERS.map((emp) => (
              <div
                key={emp.name}
                className="absolute z-20 flex flex-col items-center"
                style={{
                  left: `${emp.x}%`,
                  top: `${emp.y}%`,
                  transform: `translate(-50%, -100%) scale(${inv})`,
                  transformOrigin: "bottom center",
                }}
                onMouseEnter={() => setHoverEmp(emp.name)}
                onMouseLeave={() => setHoverEmp(null)}
              >
                <div className="flex items-center gap-1 rounded-full border border-foreground/30 bg-[var(--surface-elevated)] px-1.5 py-0.5 text-[9px] font-bold tracking-[0.06em] text-foreground shadow-card">
                  <Briefcase className="h-2 w-2" />
                  {emp.name}
                  <span className="font-mono text-[var(--text-muted)]">{emp.value}</span>
                </div>
                <div
                  className="mt-0.5 h-0 w-0"
                  style={{
                    borderLeft: "3.5px solid transparent",
                    borderRight: "3.5px solid transparent",
                    borderTop: "4.5px solid var(--ink)",
                  }}
                />
                {hoverEmp === emp.name && (
                  <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-border bg-[var(--surface-elevated)] px-2 py-1 text-[10px] text-[var(--text-secondary)] shadow-elevated">
                    Existing employer · {emp.value} payroll
                  </div>
                )}
              </div>
            ))}

            {/* Investment $ markers — green dollar signs */}
            {INVESTMENTS.map((inv2) => {
              const isHover = hoverInv?.id === inv2.id;
              return (
                <button
                  key={inv2.id}
                  onMouseEnter={() => setHoverInv(inv2)}
                  onMouseLeave={() => setHoverInv(null)}
                  className="absolute z-25 flex items-center justify-center"
                  style={{
                    left: `${inv2.x}%`,
                    top: `${inv2.y}%`,
                    transform: `translate(-50%, -50%) scale(${inv})`,
                  }}
                  aria-label={`Investment: ${inv2.name}`}
                >
                  <span
                    className="absolute rounded-full"
                    style={{
                      width: isHover ? 28 : 20,
                      height: isHover ? 28 : 20,
                      background: "var(--sev-green)",
                      opacity: isHover ? 0.22 : 0.14,
                      transition: "all 200ms ease",
                    }}
                  />
                  <span
                    className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 shadow-card"
                    style={{
                      borderColor: "var(--sev-green)",
                      background: "var(--surface-elevated)",
                    }}
                  >
                    <DollarSign className="h-3 w-3" style={{ color: "var(--sev-green)" }} strokeWidth={3} />
                  </span>
                </button>
              );
            })}

            {/* PIN MODE: Parish pins */}
            {showPins &&
              PARISHES.map((p) => {
                const score = p.scores[layer];
                const sev = severity(layer, score);
                const color = SEV_COLOR[sev];
                const isSelected = selectedId === p.id;
                const isHovered = hoverId === p.id;
                const isActive = isSelected || isHovered;

                return (
                  <button
                    key={p.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(p.id);
                    }}
                    onMouseEnter={() => setHoverId(p.id)}
                    onMouseLeave={() => setHoverId(null)}
                    className="absolute z-10 flex items-center justify-center"
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      transform: `translate(-50%, -50%) scale(${inv})`,
                    }}
                    aria-label={p.name}
                  >
                    <span
                      className="absolute rounded-full transition-all duration-300"
                      style={{
                        width: isActive ? 36 : 26,
                        height: isActive ? 36 : 26,
                        background: color,
                        opacity: isActive ? 0.18 : 0.1,
                      }}
                    />
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
                    {/* School count badge */}
                    <span
                      className="absolute -bottom-1 -right-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full border border-foreground/30 bg-[var(--surface-elevated)] px-1 font-mono text-[7px] font-bold tabular-nums text-foreground shadow-card"
                      title={`${p.totalSchools} schools`}
                    >
                      {p.totalSchools}
                    </span>
                    {p.alert && (
                      <span className="absolute -left-1 -top-1 flex h-3 w-3 items-center justify-center">
                        <span
                          className="alert-dot absolute inline-flex h-full w-full rounded-full"
                          style={{ background: "var(--sev-red)", opacity: 0.55 }}
                        />
                        <TriangleAlert
                          className="relative h-2.5 w-2.5"
                          style={{ color: "var(--sev-red)" }}
                          strokeWidth={3}
                        />
                      </span>
                    )}
                  </button>
                );
              })}

            {/* HEATMAP/HEX MODE: parish labels only */}
            {!showPins &&
              PARISHES.map((p) => (
                <button
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(p.id);
                  }}
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() => setHoverId(null)}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/20 bg-[var(--surface-elevated)]/85 px-1.5 py-0.5 text-[8px] font-semibold tracking-tight text-foreground shadow-card backdrop-blur-sm hover:border-foreground/50"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    transform: `translate(-50%, -50%) scale(${inv})`,
                  }}
                >
                  {p.name}
                </button>
              ))}

            {/* Investment hover card */}
            {hoverInv && (
              <InvestmentCard investment={hoverInv} inv={inv} />
            )}

            {/* Parish insight card */}
            {activeParish && showPins && (
              <ParishInsightCard
                parish={activeParish}
                layer={layer}
                pinned={!!selectedId && selectedId === activeParish.id}
                inv={inv}
              />
            )}
          </div>

          {/* Zoom controls */}
          <div className="absolute right-3 top-3 z-40 flex flex-col overflow-hidden rounded-md border border-border bg-[var(--surface-elevated)]/95 shadow-card backdrop-blur">
            <CtrlBtn onClick={() => zoomBy(0.4)} aria-label="Zoom in" disabled={zoom >= MAX_ZOOM}>
              <Plus className="h-3.5 w-3.5" />
            </CtrlBtn>
            <CtrlBtn onClick={() => zoomBy(-0.4)} aria-label="Zoom out" disabled={zoom <= MIN_ZOOM}>
              <Minus className="h-3.5 w-3.5" />
            </CtrlBtn>
            <CtrlBtn onClick={reset} aria-label="Reset" disabled={zoom === 1 && pan.x === 0 && pan.y === 0}>
              <RotateCcw className="h-3.5 w-3.5" />
            </CtrlBtn>
          </div>

          <div className="pointer-events-none absolute bottom-2 right-3 z-40 flex items-center gap-1.5 rounded-full border border-border bg-[var(--surface-elevated)]/85 px-2 py-0.5 font-mono text-[9px] tabular-nums text-[var(--text-muted)] backdrop-blur">
            <Maximize2 className="h-2.5 w-2.5" />
            {Math.round(zoom * 100)}%
          </div>

          {zoom === 1 && (
            <div className="pointer-events-none absolute bottom-2 left-3 z-40 rounded-full border border-border bg-[var(--surface-elevated)]/85 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)] backdrop-blur">
              Scroll or use + to zoom · drag to pan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function hexPoints(cx: number, cy: number, size: number) {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    pts.push(`${(cx + size * Math.cos(a)).toFixed(2)},${(cy + size * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

function ModeBtn({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: typeof Pin;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
        active
          ? "bg-foreground text-[var(--background)]"
          : "text-[var(--text-secondary)] hover:text-foreground"
      }`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}

function CtrlBtn({
  children,
  onClick,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center border-b border-border text-[var(--text-secondary)] transition-colors last:border-b-0 hover:bg-[var(--background)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      {...rest}
    >
      {children}
    </button>
  );
}

function InvestmentCard({ investment, inv }: { investment: Investment; inv: number }) {
  return (
    <div
      className="pointer-events-none absolute z-40 w-[220px]"
      style={{
        left: `${investment.x}%`,
        top: `${investment.y}%`,
        transform: `translate(-50%, calc(-100% - 14px)) scale(${inv})`,
        transformOrigin: "bottom center",
      }}
    >
      <div className="overflow-hidden rounded-xl border border-border bg-[var(--surface-elevated)]/97 shadow-elevated backdrop-blur-md">
        <div className="h-0.5 w-full" style={{ background: "var(--sev-green)" }} />
        <div className="px-3 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate font-display text-[13px] font-bold tracking-tight text-foreground">
                {investment.name}
              </div>
              <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                {investment.parish} parish · online {investment.online}
              </div>
            </div>
            <span
              className="font-display text-[18px] font-bold leading-none tabular-nums"
              style={{ color: "var(--sev-green)" }}
            >
              {investment.amount}
            </span>
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5 border-t border-border pt-2">
            <CardStat label="Jobs" value={investment.jobs.toLocaleString()} />
            <CardStat label="Sector" value={investment.sector.split(" ")[0]} />
            <CardStat label="Status" value={investment.status === "Operational" ? "Live" : investment.status === "Under construction" ? "Build" : "Plan"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</span>
      <span className="font-mono text-[11px] font-bold tabular-nums leading-tight text-foreground">{value}</span>
    </div>
  );
}

function ParishInsightCard({
  parish,
  layer,
  pinned,
  inv,
}: {
  parish: (typeof PARISHES)[number];
  layer: LayerKey;
  pinned: boolean;
  inv: number;
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

  const above = parish.y > 35;
  const baseTransform = above
    ? `translate(-50%, calc(-100% - 18px)) scale(${inv})`
    : `translate(-50%, 18px) scale(${inv})`;

  return (
    <div
      className="pointer-events-none absolute z-30 w-[220px] origin-bottom"
      style={{
        left: `${parish.x}%`,
        top: `${parish.y}%`,
        transform: baseTransform,
        transformOrigin: above ? "bottom center" : "top center",
      }}
    >
      <div className="overflow-hidden rounded-xl border border-border bg-[var(--surface-elevated)]/95 shadow-elevated backdrop-blur-md">
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

        <div className="grid grid-cols-3 gap-2 px-3 py-2.5">
          <MiniStat label="Schools" value={String(parish.totalSchools)} />
          <MiniStat label="Students" value={`${(parish.students / 1000).toFixed(0)}K`} />
          <MiniStat label="D/F" value={`${dfPct}%`} tone="danger" />
        </div>

        {parish.alert && (
          <div
            className="flex items-center gap-1.5 border-t border-border px-3 py-1.5"
            style={{ background: "color-mix(in oklab, var(--sev-red) 6%, transparent)" }}
          >
            <TriangleAlert className="h-3 w-3 shrink-0" style={{ color: "var(--sev-red)" }} />
            <span
              className="truncate text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: "var(--sev-red)" }}
            >
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
