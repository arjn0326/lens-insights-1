import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InfoTip } from "@/components/lens/InfoTip";
import {
  buildParishSalaryRankings2025,
  formatDollars,
  isValidScore,
  teacherSalary,
} from "@/lib/teacher-salary";

const axisTick = { fontSize: 10, fill: "var(--text-muted)" };
const BAR_HEIGHT = 22;
const CHART_PADDING = 48;

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-[var(--background)] p-2.5">
      <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {label}
      </div>
      <div className="mt-1 font-display text-[16px] font-bold leading-none tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

function RankingTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { name?: string; salary2025?: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row?.name || !isValidScore(row.salary2025)) return null;
  return (
    <div className="rounded-md border border-border bg-card px-2.5 py-2 shadow-md text-[11px]">
      <div className="font-semibold text-foreground">{row.name}</div>
      <div className="mt-0.5 font-mono tabular-nums">{formatDollars(row.salary2025)}</div>
    </div>
  );
}

export function TeacherCompensationSection() {
  const stateAvg2025 = teacherSalary.state.salaries["2025"];
  const rankings = useMemo(() => buildParishSalaryRankings2025(), []);

  const chartHeight = rankings.length * BAR_HEIGHT + CHART_PADDING;
  const xDomain = useMemo(() => {
    if (!rankings.length) return [0, 100000] as [number, number];
    const min = Math.min(...rankings.map((r) => r.salary2025));
    const max = Math.max(...rankings.map((r) => r.salary2025));
    const pad = Math.max(2000, (max - min) * 0.06);
    return [Math.floor(min - pad), Math.ceil(max + pad)] as [number, number];
  }, [rankings]);

  const highest = rankings[0];
  const lowest = rankings[rankings.length - 1];

  return (
    <section className="flex flex-col gap-6">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Educator compensation
        </p>
        <h2 className="mt-1 font-display text-xl font-bold tracking-tight md:text-2xl">
          Teacher Compensation
        </h2>
      </header>

      <div className="rounded-2xl border border-border bg-[var(--surface-elevated)] p-5 shadow-card">
        <div className="mb-1 flex items-center gap-1.5">
          <h3 className="font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">
            Parish Teacher Salary Rankings — 2025
          </h3>
          <InfoTip
            text="Horizontal bar chart showing average 2025 teacher salary for all 64 Louisiana parishes, ranked highest to lowest. The vertical dashed line marks the Louisiana state average. Salaries exclude extra compensation such as bonuses and supplements."
            size={10}
          />
        </div>
        <p className="mb-4 text-[11px] leading-snug text-[var(--text-muted)]">
          Average classroom teacher salary by parish, excluding extra compensation. Source: LDOE.
        </p>

        <div className="max-h-[min(72vh,920px)] overflow-y-auto overflow-x-hidden rounded-lg border border-border/60 pr-1">
          <div style={{ height: chartHeight, minHeight: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rankings}
                layout="vertical"
                margin={{ top: 8, right: 72, bottom: 8, left: 4 }}
                barCategoryGap="18%"
              >
                <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" horizontal={false} />
                <XAxis
                  type="number"
                  domain={xDomain}
                  tick={axisTick}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  tickFormatter={(v) => formatDollars(Number(v))}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "var(--text-secondary)" }}
                  axisLine={false}
                  tickLine={false}
                  width={108}
                />
                <Tooltip content={<RankingTooltip />} cursor={{ fill: "var(--border)", opacity: 0.25 }} />
                {isValidScore(stateAvg2025) && (
                  <ReferenceLine
                    x={stateAvg2025}
                    stroke="var(--text-muted)"
                    strokeDasharray="5 4"
                    strokeWidth={1.5}
                    label={{
                      value: `LA Avg: ${formatDollars(stateAvg2025)}`,
                      position: "top",
                      fill: "var(--text-secondary)",
                      fontSize: 10,
                    }}
                  />
                )}
                <Bar dataKey="salary2025" radius={[0, 3, 3, 0]} maxBarSize={14}>
                  {rankings.map((entry) => (
                    <Cell key={entry.slug} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="salary2025"
                    position="right"
                    formatter={(v) => formatDollars(Number(v))}
                    style={{ fontSize: 9, fill: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 border-t border-border pt-4 sm:grid-cols-3">
          <StatPill
            label="2025 State Average"
            value={isValidScore(stateAvg2025) ? formatDollars(stateAvg2025) : "—"}
          />
          <StatPill
            label="Highest"
            value={
              highest
                ? `${highest.name} — ${formatDollars(highest.salary2025)}`
                : "—"
            }
          />
          <StatPill
            label="Lowest"
            value={
              lowest ? `${lowest.name} — ${formatDollars(lowest.salary2025)}` : "—"
            }
          />
        </div>
      </div>
    </section>
  );
}
