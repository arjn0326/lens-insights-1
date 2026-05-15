import { useMemo, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
  certificationByGrade,
  headlines,
  retentionByPathway,
  vacanciesBySubject,
} from "@/lib/workforce-snapshot";

const axisTick = { fontSize: 10, fill: "var(--text-muted)" };
const ACCENT_FILL = "var(--accent)";
const OUT_OF_FIELD_FILL = "color-mix(in oklab, var(--text-muted) 55%, transparent)";
const UNCERTIFIED_FILL = "#ef4444";
const POST_BACC_FILL = "#ef4444";

const LEGEND_LABELS: Record<string, string> = {
  certified: "Certified",
  outOfField: "Out of field",
  uncertified: "Uncertified",
  undergraduate: "Undergraduate",
  postBacc: "Post-baccalaureate",
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

function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

function ChartTooltip({
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
    <div className="rounded-md border border-border bg-card px-2.5 py-2 shadow-md text-[11px]">
      {label != null && (
        <div className="mb-1 font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
          <span className="text-[var(--text-secondary)]">
            {LEGEND_LABELS[p.name ?? ""] ?? p.name}
          </span>
          <span className="ml-auto font-mono tabular-nums">
            {p.value != null
              ? p.name === "vacancies"
                ? formatCount(p.value)
                : `${p.value}%`
              : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  tooltip,
  children,
  pills,
}: {
  title: string;
  subtitle: string;
  tooltip: string;
  children: ReactNode;
  pills: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-[var(--surface-elevated)] p-5 shadow-card">
      <div className="mb-1 flex items-center gap-1.5">
        <h3 className="font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">{title}</h3>
        <InfoTip text={tooltip} size={10} />
      </div>
      <p className="mb-4 text-[11px] leading-snug text-[var(--text-muted)]">{subtitle}</p>
      {children}
      <div className="mt-4 grid grid-cols-1 gap-2 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
        {pills.map((pill) => (
          <StatPill key={pill.label} label={pill.label} value={pill.value} />
        ))}
      </div>
    </div>
  );
}

export function WorkforceSnapshotSection() {
  const sortedVacancies = useMemo(
    () => [...vacanciesBySubject].sort((a, b) => b.vacancies - a.vacancies),
    [],
  );

  const vacancyChartHeight = sortedVacancies.length * 28 + 56;

  return (
    <section className="flex flex-col gap-6">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          State Workforce Snapshot
        </p>
        <h2 className="mt-1 font-display text-xl font-bold tracking-tight md:text-2xl">
          Louisiana Educator Workforce — 2024-2025
        </h2>
      </header>

      <ChartCard
        title="Teacher Certification by School Letter Grade"
        subtitle="Share of teachers by certification status, grouped by parish SPS letter grade."
        tooltip="Stacked bars show the percentage of teachers who are fully certified, teaching out of field, or uncertified in schools at each accountability grade level."
        pills={[
          { label: "Total Teachers", value: formatCount(headlines.totalTeachers) },
          { label: "Teachers of Color", value: `${headlines.teachersOfColorPct}%` },
          { label: "Economically Disadvantaged", value: `${headlines.economicallyDisadvantagedPct}%` },
        ]}
      >
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={certificationByGrade} margin={{ top: 20, right: 16, bottom: 0, left: -8 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="grade"
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
              <Tooltip content={<ChartTooltip />} />
              <Legend
                verticalAlign="top"
                height={32}
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 9, color: "var(--text-secondary)" }}
                formatter={(value) => LEGEND_LABELS[String(value)] ?? value}
              />
              <Bar dataKey="certified" name="certified" stackId="cert" fill={ACCENT_FILL} />
              <Bar dataKey="outOfField" name="outOfField" stackId="cert" fill={OUT_OF_FIELD_FILL} />
              <Bar dataKey="uncertified" name="uncertified" stackId="cert" fill={UNCERTIFIED_FILL}>
                <LabelList
                  dataKey="uncertified"
                  position="top"
                  formatter={(v) => `${v}%`}
                  style={{ fontSize: 9, fill: "var(--text-secondary)", fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        title="Teacher Vacancies by Subject Area"
        subtitle="Open teaching positions reported statewide by subject, 2024-2025."
        tooltip="Count of unfilled teacher vacancies by subject area across Louisiana public schools, ranked from highest to lowest need."
        pills={[
          { label: "Total Vacancies", value: formatCount(headlines.totalVacancies) },
          { label: "Schools Reporting Vacancies", value: `${headlines.schoolsReportingVacanciesPct}%` },
          { label: "Total Students", value: formatCount(headlines.totalStudents) },
        ]}
      >
        <div style={{ height: vacancyChartHeight, minHeight: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedVacancies}
              layout="vertical"
              margin={{ top: 8, right: 48, bottom: 8, left: 4 }}
              barCategoryGap="20%"
            >
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" horizontal={false} />
              <XAxis type="number" tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
              <YAxis
                type="category"
                dataKey="subject"
                tick={{ fontSize: 9, fill: "var(--text-secondary)" }}
                axisLine={false}
                tickLine={false}
                width={112}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--border)", opacity: 0.25 }} />
              <Bar dataKey="vacancies" name="vacancies" fill={ACCENT_FILL} radius={[0, 3, 3, 0]} maxBarSize={16}>
                <LabelList
                  dataKey="vacancies"
                  position="right"
                  formatter={(v) => formatCount(Number(v))}
                  style={{ fontSize: 9, fill: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        title="New Teacher Retention by Preparation Pathway"
        subtitle="Retention of teachers hired in 2021-22, tracked through year four."
        tooltip="Percentage of new teachers still employed in Louisiana public schools by preparation pathway (undergraduate vs. post-baccalaureate), measured at hire and each subsequent year."
        pills={[
          { label: "Overall Retention", value: `${headlines.overallRetentionPct}%` },
          { label: "Students of Color", value: `${headlines.studentsOfColorPct}%` },
          {
            label: "Year 4 Retention (UG / PB)",
            value: `${retentionByPathway[3]?.undergraduate ?? "—"}% / ${retentionByPathway[3]?.postBacc ?? "—"}%`,
          },
        ]}
      >
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={retentionByPathway} margin={{ top: 16, right: 16, bottom: 0, left: -4 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 9, fill: "var(--text-secondary)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
                interval={0}
                angle={-12}
                textAnchor="end"
                height={48}
              />
              <YAxis
                domain={[60, 105]}
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                width={36}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                verticalAlign="top"
                height={32}
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 9, color: "var(--text-secondary)" }}
                formatter={(value) => LEGEND_LABELS[String(value)] ?? value}
              />
              <Line
                type="monotone"
                dataKey="undergraduate"
                name="undergraduate"
                stroke={ACCENT_FILL}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: ACCENT_FILL, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="postBacc"
                name="postBacc"
                stroke={POST_BACC_FILL}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: POST_BACC_FILL, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </section>
  );
}
