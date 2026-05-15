import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InfoTip } from "@/components/lens/InfoTip";
import {
  actScores,
  buildComparisonChartData,
  fiveYearChange,
  formatSigned,
  getActParish,
  getLeapParish,
  isValidScore,
  leapScores,
  vsStateDiff,
} from "@/lib/academic-scores";

const axisTick = { fontSize: 10, fill: "var(--text-muted)" };

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-[var(--background)] p-2.5">
      <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {label}
      </div>
      <div className="mt-1 font-display text-[18px] font-bold leading-none tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

function AcademicChartCard({
  label,
  tooltip,
  children,
  footer,
}: {
  label: string;
  tooltip: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-[var(--surface-elevated)] p-5 shadow-card">
      <div className="mb-3 flex items-center gap-1.5">
        <h3 className="font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">
          {label}
        </h3>
        <InfoTip text={tooltip} size={10} />
      </div>
      {children}
      <div className="mt-3 grid grid-cols-1 gap-2 border-t border-border pt-3 sm:grid-cols-3">
        {footer}
      </div>
    </div>
  );
}

function ComparisonTooltip({
  active,
  payload,
  label,
  parishName,
  valueSuffix = "",
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string | number;
  parishName: string;
  valueSuffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-[var(--surface-elevated)] px-2.5 py-2 shadow-elevated">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
          <span className="text-[var(--text-secondary)]">
            {p.name === "parish" ? parishName : "Louisiana avg"}
          </span>
          <span className="ml-auto font-mono tabular-nums">
            {p.value?.toFixed(1)}
            {valueSuffix}
          </span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  parishId: string;
  parishName: string;
  parishColor?: string;
}

export function AcademicPerformanceSection({ parishId, parishName, parishColor = "var(--blue)" }: Props) {
  const actParish = getActParish(parishId);
  const leapParish = getLeapParish(parishId);
  const actState = actScores.state;
  const leapState = leapScores.state;

  if (!actParish && !leapParish) {
    return (
      <section className="mt-8">
        <div className="mb-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Academic Performance
          </div>
          <h2 className="mt-1 font-display text-[24px] font-bold tracking-tight text-foreground">
            ACT &amp; LEAP trends
          </h2>
        </div>
        <div className="rounded-2xl border border-border bg-[var(--surface-elevated)] p-6 text-[13px] text-[var(--text-secondary)]">
          Academic score data is not available for this parish.
        </div>
      </section>
    );
  }

  const actChart = actParish
    ? buildComparisonChartData(actParish.scores, actState.scores)
    : [];
  const leapChart = leapParish
    ? buildComparisonChartData(leapParish.proficiency312, leapState.proficiency312)
    : [];

  const act2025 = actParish?.scores["2025"];
  const actChange = actParish ? fiveYearChange(actParish.scores) : null;
  const actVsState = actParish ? vsStateDiff(act2025, actState.scores["2025"]) : null;

  const leap2025 = leapParish?.proficiency312["2025"];
  const leapChange = leapParish ? fiveYearChange(leapParish.proficiency312) : null;
  const leapVsState = leapParish ? vsStateDiff(leap2025, leapState.proficiency312["2025"]) : null;

  return (
    <section className="mt-8">
      <div className="mb-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Academic Performance
        </div>
        <h2 className="mt-1 font-display text-[24px] font-bold tracking-tight text-foreground">
          ACT &amp; LEAP trends
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {actParish ? (
          <AcademicChartCard
            label="College Readiness Score (ACT)"
            tooltip="The ACT is a standardized college readiness test taken by high school seniors. Scores range from 1–36. Louisiana's state average is 18.4. Higher scores indicate stronger college preparedness."
            footer={
              <>
                <StatPill
                  label="2025 Score"
                  value={isValidScore(act2025) ? act2025.toFixed(1) : "—"}
                />
                <StatPill
                  label="5-Year Change"
                  value={actChange != null ? formatSigned(actChange) : "—"}
                />
                <StatPill
                  label="vs State"
                  value={actVsState != null ? formatSigned(actVsState) : "—"}
                />
              </>
            }
          >
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={actChart} margin={{ top: 12, right: 12, bottom: 0, left: -6 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={axisTick}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip
                    content={
                      <ComparisonTooltip parishName={parishName} />
                    }
                  />
                  <Legend
                    verticalAlign="top"
                    height={28}
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ fontSize: 10, color: "var(--text-secondary)" }}
                    formatter={(value) =>
                      value === "parish" ? parishName : "Louisiana avg"
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="state"
                    name="state"
                    stroke="var(--blue)"
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                    dot={false}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="parish"
                    name="parish"
                    stroke={parishColor}
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: parishColor, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </AcademicChartCard>
        ) : null}

        {leapParish ? (
          <AcademicChartCard
            label="Academic Proficiency Rate (LEAP)"
            tooltip="LEAP 2025 measures the percentage of students scoring at Mastery level or above across core subjects. Proficiency 3–12 includes grades 3–8 plus high school end-of-course tests in Algebra, English, Biology, and more. Louisiana's state average is 34%. Higher percentages mean more students are performing at or above grade level."
            footer={
              <>
                <StatPill
                  label="2025 Rate"
                  value={isValidScore(leap2025) ? `${leap2025.toFixed(0)}%` : "—"}
                />
                <StatPill
                  label="5-Year Change"
                  value={leapChange != null ? `${formatSigned(leapChange, 0)} pts` : "—"}
                />
                <StatPill
                  label="vs State"
                  value={leapVsState != null ? `${formatSigned(leapVsState, 0)} pts` : "—"}
                />
              </>
            }
          >
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leapChart} margin={{ top: 12, right: 12, bottom: 0, left: -6 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={axisTick}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    content={
                      <ComparisonTooltip parishName={parishName} valueSuffix="%" />
                    }
                  />
                  <Legend
                    verticalAlign="top"
                    height={28}
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ fontSize: 10, color: "var(--text-secondary)" }}
                    formatter={(value) =>
                      value === "parish" ? parishName : "Louisiana avg"
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="state"
                    name="state"
                    stroke="var(--blue)"
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                    dot={false}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="parish"
                    name="parish"
                    stroke={parishColor}
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: parishColor, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </AcademicChartCard>
        ) : null}
      </div>
    </section>
  );
}
