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
  buildParishRatingsChartData,
  formatSigned,
  getTeacherEvalParish,
  isValidScore,
  teacherEval,
  TEACHER_RATING_COLORS,
  TEACHER_RATING_LABELS,
  teacherEvalVsStateDiff,
} from "@/lib/teacher-eval";
import {
  buildSalaryComparisonChartData,
  formatDollars,
  formatSignedDollars,
  getTeacherSalaryParish,
  salaryVsStateDiff,
  salaryYAxisDomain,
  teacherSalary,
} from "@/lib/teacher-salary";

const axisTick = { fontSize: 10, fill: "var(--text-muted)" };

const TOOLTIP_LABELS: Record<string, string> = {
  highlyEffective: TEACHER_RATING_LABELS.highlyEffective,
  proficient: TEACHER_RATING_LABELS.proficient,
  emerging: TEACHER_RATING_LABELS.emerging,
  stateHighlyEffective: TEACHER_RATING_LABELS.stateHighlyEffective,
};

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

function SalaryTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const labelMap: Record<string, string> = {
    parish: "This Parish",
    state: "Louisiana Average",
  };
  return (
    <div className="rounded-md border border-border bg-[var(--surface-elevated)] px-2.5 py-2 shadow-elevated">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
          <span className="text-[var(--text-secondary)]">{labelMap[p.name ?? ""] ?? p.name}</span>
          <span className="ml-auto font-mono tabular-nums">
            {p.value != null ? formatDollars(p.value) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

function RatingsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string | number;
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
            {TOOLTIP_LABELS[p.name ?? ""] ?? p.name}
          </span>
          <span className="ml-auto font-mono tabular-nums">{p.value?.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  parishId: string;
}

export function EducatorQualitySection({ parishId }: Props) {
  const parish = getTeacherEvalParish(parishId);
  const state = teacherEval.state;
  const chartData = parish ? buildParishRatingsChartData(parish, state) : [];

  const salaryParish = getTeacherSalaryParish(parishId);
  const salaryState = teacherSalary.state;
  const salaryChartData = salaryParish
    ? buildSalaryComparisonChartData(salaryParish.salaries, salaryState.salaries)
    : [];
  const salaryYDomain = salaryYAxisDomain(salaryChartData);

  const vsStateHe = parish
    ? teacherEvalVsStateDiff(parish.highlyEffective["2024"], state.highlyEffective["2024"])
    : null;

  const vsStateSalary = salaryParish
    ? salaryVsStateDiff(salaryParish.salaries["2025"], salaryState.salaries["2025"])
    : null;

  return (
    <section className="mt-8">
      <div className="mb-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Educator Quality
        </div>
        <h2 className="mt-1 font-display text-[24px] font-bold tracking-tight text-foreground">
          Teacher effectiveness
        </h2>
      </div>

      {!parish ? (
        <div className="rounded-2xl border border-border bg-[var(--surface-elevated)] p-6 text-[13px] text-[var(--text-secondary)]">
          Teacher evaluation data is not available for this parish.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-[var(--surface-elevated)] p-5 shadow-card">
          <div className="mb-3 flex items-center gap-1.5">
            <h3 className="font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">
              Teacher Evaluation Ratings
            </h3>
            <InfoTip
              text="Breakdown of teacher evaluation ratings under Louisiana's Compass system. Highly Effective is the top tier, Effective: Proficient is meeting expectations, and Effective: Emerging indicates a developing teacher. Percentages show the share of evaluated teachers in each parish falling into each category. Louisiana state average shown as a dashed reference line for Highly Effective only."
              size={10}
            />
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 16, right: 12, bottom: 0, left: -6 }}>
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
                <Tooltip content={<RatingsTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: 9, color: "var(--text-secondary)" }}
                  formatter={(value) => TOOLTIP_LABELS[String(value)] ?? value}
                />
                <Line
                  type="monotone"
                  dataKey="highlyEffective"
                  name="highlyEffective"
                  stroke={TEACHER_RATING_COLORS.highlyEffective}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: TEACHER_RATING_COLORS.highlyEffective, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="proficient"
                  name="proficient"
                  stroke={TEACHER_RATING_COLORS.proficient}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: TEACHER_RATING_COLORS.proficient, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="emerging"
                  name="emerging"
                  stroke={TEACHER_RATING_COLORS.emerging}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: TEACHER_RATING_COLORS.emerging, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="stateHighlyEffective"
                  name="stateHighlyEffective"
                  stroke={TEACHER_RATING_COLORS.highlyEffective}
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill
              label="Highly Effective 2024"
              value={
                isValidScore(parish.highlyEffective["2024"])
                  ? `${parish.highlyEffective["2024"]!.toFixed(1)}%`
                  : "—"
              }
            />
            <StatPill
              label="Proficient 2024"
              value={
                isValidScore(parish.proficient["2024"])
                  ? `${parish.proficient["2024"]!.toFixed(1)}%`
                  : "—"
              }
            />
            <StatPill
              label="Emerging 2024"
              value={
                isValidScore(parish.emerging["2024"])
                  ? `${parish.emerging["2024"]!.toFixed(1)}%`
                  : "—"
              }
            />
            <StatPill
              label="vs State (HE)"
              value={vsStateHe != null ? `${formatSigned(vsStateHe, 1)} pts` : "—"}
            />
          </div>

          {salaryParish && salaryChartData.length > 0 && (
            <div className="mt-5 border-t border-border pt-5">
              <div className="mb-1 flex items-center gap-1.5">
                <h3 className="font-display text-[14px] font-bold tracking-[-0.01em] text-foreground">
                  Average Teacher Salary
                </h3>
                <InfoTip
                  text="Average annual classroom teacher salary in this parish, excluding extra compensation such as bonuses. Source: Louisiana Department of Education Public School Staff Data. Salary data reflects actual reported pay, not budgeted amounts."
                  size={10}
                />
              </div>
              <p className="mb-3 text-[10px] leading-snug text-[var(--text-muted)]">
                Avg. classroom teacher salary excluding extra compensation (LDOE)
              </p>

              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salaryChartData}
                    margin={{ top: 12, right: 12, bottom: 0, left: 2 }}
                  >
                    <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={axisTick}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={salaryYDomain}
                      tick={axisTick}
                      axisLine={false}
                      tickLine={false}
                      width={52}
                      tickFormatter={(v) => formatDollars(Number(v))}
                    />
                    <Tooltip content={<SalaryTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={28}
                      iconType="circle"
                      iconSize={7}
                      wrapperStyle={{ fontSize: 9, color: "var(--text-secondary)" }}
                      formatter={(value) =>
                        value === "parish" ? "This Parish" : "Louisiana Average"
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
                      stroke="var(--sev-green)"
                      strokeWidth={2}
                      dot={{ r: 2.5, fill: "var(--sev-green)", strokeWidth: 0 }}
                      activeDot={{ r: 4 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <StatPill
                  label="2025 Salary"
                  value={
                    isValidScore(salaryParish.salaries["2025"])
                      ? formatDollars(salaryParish.salaries["2025"]!)
                      : "—"
                  }
                />
                <StatPill
                  label="vs State"
                  value={vsStateSalary != null ? formatSignedDollars(vsStateSalary) : "—"}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}




