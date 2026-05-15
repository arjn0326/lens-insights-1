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
  buildCollegeComparisonChartData,
  collegeEnrollment,
  collegeFiveYearChange,
  collegeVsStateDiff,
  formatSigned,
  getCollegeParish,
  isValidScore,
} from "@/lib/college-enrollment";

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

function EnrollmentTooltip({
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
          <span className="ml-auto font-mono tabular-nums">{p.value?.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  parishId: string;
  parishColor?: string;
}

export function PostGraduationOutcomesSection({
  parishId,
  parishColor = "var(--blue)",
}: Props) {
  const parish = getCollegeParish(parishId);
  const state = collegeEnrollment.state;

  return (
    <section className="mt-8">
      <div className="mb-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Post-Graduation Outcomes
        </div>
        <h2 className="mt-1 font-display text-[24px] font-bold tracking-tight text-foreground">
          College enrollment
        </h2>
      </div>

      {!parish ? (
        <div className="rounded-2xl border border-border bg-[var(--surface-elevated)] p-6 text-[13px] text-[var(--text-secondary)]">
          College enrollment data is not available for this parish.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-[var(--surface-elevated)] p-5 shadow-card">
          <div className="mb-3 flex items-center gap-1.5">
            <h3 className="font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">
              College Enrollment Rate
            </h3>
            <InfoTip
              text="Percentage of high school graduates from this parish who enrolled in college the following fall semester. Based on data from the Louisiana Department of Education and National Student Clearinghouse. Years shown are graduation years (e.g. 2024 = Class of 2024)."
              size={10}
            />
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={buildCollegeComparisonChartData(parish.rates, state.rates)}
                margin={{ top: 12, right: 12, bottom: 0, left: -6 }}
              >
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
                <Tooltip content={<EnrollmentTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={28}
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: 10, color: "var(--text-secondary)" }}
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
                  stroke={parishColor}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: parishColor, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 border-t border-border pt-3 sm:grid-cols-3">
            <StatPill
              label="2024 Rate"
              value={
                isValidScore(parish.rates["2024"])
                  ? `${parish.rates["2024"]!.toFixed(1)}%`
                  : "—"
              }
            />
            <StatPill
              label="5-Year Change"
              value={
                collegeFiveYearChange(parish.rates) != null
                  ? `${formatSigned(collegeFiveYearChange(parish.rates)!, 1)} pts`
                  : "—"
              }
            />
            <StatPill
              label="vs State"
              value={
                collegeVsStateDiff(parish.rates["2024"], state.rates["2024"]) != null
                  ? `${formatSigned(collegeVsStateDiff(parish.rates["2024"], state.rates["2024"])!, 1)} pts`
                  : "—"
              }
            />
          </div>
        </div>
      )}
    </section>
  );
}
