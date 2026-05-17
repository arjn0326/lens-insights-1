import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import {
  BUDGET_SOURCES,
  BUDGET_SPENDING,
  STATE_BUDGET_FY,
  STATE_BUDGET_TOTAL_B,
  formatBudgetAmount,
  type BudgetFlowItem,
} from "@/lib/state-ldoe-budget";

const CHART_H = 400;
const BAR_W = 16;
const HUB_W = 128;
const HUB_H = 80;
const GAP = 6;
const MIN_VISUAL_SHARE = 0.045;
const MAX_VISUAL_SHARE = 0.48;

type Band = { item: BudgetFlowItem; y: number; h: number };

type FlowBand = {
  id: string;
  color: string;
  item: BudgetFlowItem;
  bar: { x: number; y: number; h: number };
  d: string;
};

type HoverTarget = {
  item: BudgetFlowItem;
  x: number;
  y: number;
};

function visualWeights(items: BudgetFlowItem[]): number[] {
  const total = items.reduce((s, i) => s + i.amountB, 0);
  const floored = items.map((i) => Math.max(i.amountB, total * MIN_VISUAL_SHARE));
  const capped = floored.map((v) => Math.min(v, total * MAX_VISUAL_SHARE));
  const sum = capped.reduce((s, v) => s + v, 0);
  return capped.map((v) => v / sum);
}

function layoutBands(items: BudgetFlowItem[], innerH: number): Band[] {
  const weights = visualWeights(items);
  const gaps = GAP * Math.max(0, items.length - 1);
  const usable = innerH - gaps;
  let y = 0;
  return items.map((item, i) => {
    const h = Math.max(20, weights[i] * usable);
    const band = { item, y, h };
    y += h + GAP;
    return band;
  });
}

function stackHeight(bands: Band[]): number {
  if (!bands.length) return 0;
  const last = bands[bands.length - 1];
  return last.y + last.h;
}

function ribbonPath(
  x0: number,
  y0: number,
  h0: number,
  x1: number,
  y1: number,
  h1: number,
): string {
  const xm = (x0 + x1) / 2;
  return [
    `M ${x0} ${y0}`,
    `C ${xm} ${y0}, ${xm} ${y1}, ${x1} ${y1}`,
    `L ${x1} ${y1 + h1}`,
    `C ${xm} ${y1 + h1}, ${xm} ${y0 + h0}, ${x0} ${y0 + h0}`,
    "Z",
  ].join(" ");
}

function FlowTooltip({ target }: { target: HoverTarget }) {
  const { item } = target;
  return (
    <div
      className="pointer-events-none absolute z-20 max-w-[260px] -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-[var(--surface-elevated)] px-3 py-2.5 shadow-elevated"
      style={{ left: target.x, top: target.y - 8 }}
    >
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: item.color }} />
        <span className="font-mono text-[12px] font-bold text-foreground">{item.shortLabel}</span>
        <span className="ml-auto font-mono text-[12px] font-semibold tabular-nums text-[var(--blue)]">
          {formatBudgetAmount(item.amountB)}
        </span>
      </div>
      <p className="mt-1 text-[10px] text-[var(--text-muted)]">{item.pct}% of budget</p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">{item.info}</p>
    </div>
  );
}

export function StateLdoeBudgetSankey() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(760);
  const [hover, setHover] = useState<HoverTarget | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => {
    const pad = { top: 32, bottom: 20, left: 40, right: 40 };
    const innerH = CHART_H - pad.top - pad.bottom;
    const innerW = width - pad.left - pad.right;

    const sourceBands = layoutBands(BUDGET_SOURCES, innerH);
    const spendBands = layoutBands(BUDGET_SPENDING, innerH);
    const srcStackH = stackHeight(sourceBands);
    const spendStackH = stackHeight(spendBands);
    const flowStackH = Math.max(srcStackH, spendStackH);

    const srcStartY = pad.top + (innerH - srcStackH) / 2;
    const spendStartY = pad.top + (innerH - spendStackH) / 2;
    const flowStartY = pad.top + (innerH - flowStackH) / 2;

    const leftX = pad.left;
    const hubX = pad.left + innerW / 2 - HUB_W / 2;
    const hubY = flowStartY + flowStackH / 2 - HUB_H / 2;
    const rightX = pad.left + innerW - BAR_W;
    const sourceOutX = leftX + BAR_W;
    const hubInX = hubX;
    const hubOutX = hubX + HUB_W;
    const spendInX = rightX;

    const sourceFlows: FlowBand[] = sourceBands.map((b) => {
      const y0 = srcStartY + b.y;
      const hubSliceY = flowStartY + (b.y / srcStackH) * flowStackH;
      const hubSliceH = Math.max((b.h / srcStackH) * flowStackH, 10);
      return {
        id: b.item.id,
        color: b.item.color,
        item: b.item,
        bar: { x: leftX, y: y0, h: b.h },
        d: ribbonPath(sourceOutX, y0, b.h, hubInX, hubSliceY, hubSliceH),
      };
    });

    const spendFlows: FlowBand[] = spendBands.map((b) => {
      const y0 = spendStartY + b.y;
      const hubSliceY = flowStartY + (b.y / spendStackH) * flowStackH;
      const hubSliceH = Math.max((b.h / spendStackH) * flowStackH, 10);
      return {
        id: b.item.id,
        color: b.item.color,
        item: b.item,
        bar: { x: rightX, y: y0, h: b.h },
        d: ribbonPath(hubOutX, hubSliceY, hubSliceH, spendInX, y0, b.h),
      };
    });

    return { pad, innerW, sourceFlows, spendFlows, hubX, hubY, rightX };
  }, [width]);

  const showTooltip = useCallback((item: BudgetFlowItem, clientX: number, clientY: number) => {
    if (!wrapRef.current) return;
    const wrap = wrapRef.current.getBoundingClientRect();
    setHover({
      item,
      x: clientX - wrap.left,
      y: clientY - wrap.top,
    });
    setActiveId(item.id);
  }, []);

  const clearHover = useCallback(() => {
    setHover(null);
    setActiveId(null);
  }, []);

  const isLit = (id: string) => !activeId || activeId === id;

  const handlePathHover = (item: BudgetFlowItem, e: MouseEvent) => {
    showTooltip(item, e.clientX, e.clientY);
  };

  const handleBarHover = (item: BudgetFlowItem, e: MouseEvent) => {
    showTooltip(item, e.clientX, e.clientY);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-[var(--surface-elevated)] shadow-card">
      <div className="border-b border-border/80 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Louisiana Treasurer · LDOE · {STATE_BUDGET_FY}
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold tracking-tight text-foreground md:text-xl">
              How Louisiana funds and spends education
            </h3>
            <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-[var(--text-secondary)]">
              Hover any colored band or flow for amounts and definitions. Smaller categories use a
              minimum width so they stay visible.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Total budget
            </p>
            <p className="font-display text-2xl font-bold tabular-nums text-foreground">
              ${STATE_BUDGET_TOTAL_B}B
            </p>
          </div>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="relative w-full px-4 pb-3 pt-1"
        onMouseLeave={clearHover}
      >
        <svg width={width} height={CHART_H} className="mx-auto block overflow-visible">
          <text
            x={layout.pad.left + BAR_W / 2}
            y={18}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize={9}
            fontWeight={600}
            letterSpacing="0.14em"
          >
            SOURCES
          </text>
          <text
            x={layout.pad.left + layout.innerW - BAR_W / 2}
            y={18}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize={9}
            fontWeight={600}
            letterSpacing="0.14em"
          >
            SPENDING
          </text>

          {/* Hub behind flows so ribbons read as connecting through the total */}
          <rect
            x={layout.hubX}
            y={layout.hubY}
            width={HUB_W}
            height={HUB_H}
            rx={12}
            fill="var(--ink)"
            stroke="var(--border)"
            strokeWidth={1}
          />

          {layout.sourceFlows.map((f) => (
            <path
              key={`in-${f.id}`}
              d={f.d}
              fill={f.color}
              fillOpacity={isLit(f.id) ? 0.72 : 0.12}
              stroke={f.color}
              strokeOpacity={isLit(f.id) ? 0.55 : 0.08}
              strokeWidth={1}
              className="cursor-pointer"
              onMouseEnter={(e) => handlePathHover(f.item, e)}
              onMouseMove={(e) => handlePathHover(f.item, e)}
            />
          ))}

          {layout.spendFlows.map((f) => (
            <path
              key={`out-${f.id}`}
              d={f.d}
              fill={f.color}
              fillOpacity={isLit(f.id) ? 0.72 : 0.12}
              stroke={f.color}
              strokeOpacity={isLit(f.id) ? 0.55 : 0.08}
              strokeWidth={1}
              className="cursor-pointer"
              onMouseEnter={(e) => handlePathHover(f.item, e)}
              onMouseMove={(e) => handlePathHover(f.item, e)}
            />
          ))}

          {layout.sourceFlows.map((f) => (
            <rect
              key={`bar-src-${f.id}`}
              x={f.bar.x - 6}
              y={f.bar.y - 3}
              width={BAR_W + 12}
              height={f.bar.h + 6}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={(e) => handleBarHover(f.item, e)}
              onMouseMove={(e) => handleBarHover(f.item, e)}
            />
          ))}
          {layout.sourceFlows.map((f) => (
            <rect
              key={`bar-src-vis-${f.id}`}
              x={f.bar.x}
              y={f.bar.y}
              width={BAR_W}
              height={f.bar.h}
              fill={f.color}
              rx={3}
              opacity={isLit(f.id) ? 1 : 0.3}
              className="pointer-events-none"
            />
          ))}

          {layout.spendFlows.map((f) => (
            <rect
              key={`bar-sp-hit-${f.id}`}
              x={f.bar.x - 6}
              y={f.bar.y - 3}
              width={BAR_W + 12}
              height={f.bar.h + 6}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={(e) => handleBarHover(f.item, e)}
              onMouseMove={(e) => handleBarHover(f.item, e)}
            />
          ))}
          {layout.spendFlows.map((f) => (
            <rect
              key={`bar-sp-vis-${f.id}`}
              x={f.bar.x}
              y={f.bar.y}
              width={BAR_W}
              height={f.bar.h}
              fill={f.color}
              rx={3}
              opacity={isLit(f.id) ? 1 : 0.3}
              className="pointer-events-none"
            />
          ))}

          <g pointerEvents="none">
          <text
            x={layout.hubX + HUB_W / 2}
            y={layout.hubY + HUB_H / 2 - 12}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--background)"
            fontSize={10}
            fontWeight={600}
            letterSpacing="0.1em"
          >
            LDOE TOTAL
          </text>
          <text
            x={layout.hubX + HUB_W / 2}
            y={layout.hubY + HUB_H / 2 + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--background)"
            fontSize={24}
            fontWeight={700}
            fontFamily="var(--font-display, inherit)"
          >
            ${STATE_BUDGET_TOTAL_B}B
          </text>
          <text
            x={layout.hubX + HUB_W / 2}
            y={layout.hubY + HUB_H / 2 + 30}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="oklch(1 0 0 / 0.65)"
            fontSize={9}
          >
            {STATE_BUDGET_FY}
          </text>
          </g>
        </svg>

        {hover && <FlowTooltip target={hover} />}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-border/80 px-5 py-3 sm:grid-cols-5">
        {BUDGET_SOURCES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="flex items-center gap-1.5 rounded px-1 py-0.5 text-left text-[10px] transition-colors hover:bg-muted/40"
            onMouseEnter={(e) => showTooltip(s, e.clientX, e.clientY)}
            onMouseMove={(e) => showTooltip(s, e.clientX, e.clientY)}
            onMouseLeave={clearHover}
          >
            <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="font-semibold text-foreground">{s.shortLabel}</span>
          </button>
        ))}
        {BUDGET_SPENDING.map((s) => (
          <button
            key={s.id}
            type="button"
            className="flex items-center gap-1.5 rounded px-1 py-0.5 text-left text-[10px] transition-colors hover:bg-muted/40"
            onMouseEnter={(e) => showTooltip(s, e.clientX, e.clientY)}
            onMouseMove={(e) => showTooltip(s, e.clientX, e.clientY)}
            onMouseLeave={clearHover}
          >
            <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="truncate font-semibold text-foreground">{s.shortLabel}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
