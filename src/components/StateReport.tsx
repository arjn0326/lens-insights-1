import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ReportToolbar } from "@/components/lens/report/ReportToolbar";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import stateReportData from "../../public/data/state_report_data.json";
import { StatewideAcademicSection } from "@/components/lens/StatewideAcademicSection";
import { TeacherCompensationSection } from "@/components/lens/TeacherCompensationSection";
import { WorkforceSnapshotSection } from "@/components/lens/WorkforceSnapshotSection";
import { LaborMarketPanel } from "@/components/lens/LaborMarketPanel";
import { GraduationPanel } from "@/components/lens/GraduationPanel";
import { StatePerPupilFundingSection } from "@/components/lens/StatePerPupilFundingSection";
import { StateLdoeBudgetSankey } from "@/components/lens/StateLdoeBudgetSankey";
import { ReportLayout } from "@/components/lens/report/ReportLayout";
import { ReportSection } from "@/components/lens/report/ReportSection";
import {
  STATE_REPORT_SECTIONS,
} from "@/components/lens/report/state-report-sections";
import enrollmentData from "../../public/data/enrollment_by_parish.json";

const enrollmentMeta = (
  enrollmentData as {
    meta: {
      state_total_enrollment: number;
      state_total_schools: number;
      report_date: string;
      parish_count: number;
    };
  }
).meta;

const { gradeConfig, spsTrend, districtTrend } = stateReportData;

const SCHOOL_COLORS = {
  k8: "#378ADD",
  combination: "#1D9E75",
  highSchool: "#D85A30",
} as const;

const GRADE_LINE_COLORS = {
  A: "#3B6D11",
  B: "#378ADD",
  C: "#BA7517",
  D: "#D85A30",
  F: "#A32D2D",
} as const;

const gradeBarData = gradeConfig.labels.map((grade, i) => ({
  grade,
  k8: gradeConfig.k8[i],
  combination: gradeConfig.combination[i],
  highSchool: gradeConfig.highSchool[i],
}));

const districtLineData = districtTrend.years.map((year, i) => ({
  year,
  A: districtTrend.A[i],
  B: districtTrend.B[i],
  C: districtTrend.C[i],
  D: districtTrend.D[i],
  F: districtTrend.F[i],
}));

const axisTick = { fontSize: 10, fill: "var(--text-muted)" };
const gridStroke = "var(--border)";

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
    <div className="rounded-md border border-border bg-card px-2.5 py-2 shadow-md">
      {label !== undefined && (
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ background: entry.color ?? "currentColor" }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-mono tabular-nums">{entry.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpsTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { year: string; sps: number; grade: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const { year, sps, grade } = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-md text-sm">
      <p>
        <span className="text-muted-foreground">Year: </span>
        <span className="font-medium">{year}</span>
      </p>
      <p>
        <span className="text-muted-foreground">SPS score: </span>
        <span className="font-mono font-medium">{sps}</span>
      </p>
      <p>
        <span className="text-muted-foreground">Letter grade: </span>
        <span className="font-medium">{grade || "—"}</span>
      </p>
    </div>
  );
}

function reportShareUrl(path: string) {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  return path;
}

export function StateReport() {
  const shareUrl = reportShareUrl("/state");

  return (
    <div className="lens-report min-h-screen w-full bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-[var(--background)]/85 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link
            to="/app"
            className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)] transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to dashboard
          </Link>
          <div className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--blue)]" />
            LENS · State Report
          </div>
          <ReportToolbar shareUrl={shareUrl} />
        </div>
      </header>

      <ReportLayout
        sections={STATE_REPORT_SECTIONS}
        hero={
          <header>
            <p className="font-mono text-[10px] font-semibold tabular-nums tracking-wider text-[var(--blue)]">
              00 · STATEWIDE
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Louisiana — State Overview
            </h1>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[var(--text-secondary)]">
              A guided tour of enrollment, funding, graduation, school performance, workforce demand, and
              academic outcomes across all 64 parishes.
            </p>
          </header>
        }
      >
        <ReportSection id="at-a-glance" number="01" title="At a glance">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-[var(--surface-elevated)] p-4 sm:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              LDOE · {enrollmentMeta.report_date} · Public schools only
            </p>
            <p className="mt-1 text-[11px] text-[var(--text-secondary)]">Total students enrolled statewide</p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {enrollmentMeta.state_total_enrollment.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-[var(--surface-elevated)] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Reporting sites
            </p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {enrollmentMeta.state_total_schools.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
              across {enrollmentMeta.parish_count} parishes
            </p>
          </div>
        </div>
        </ReportSection>

        <ReportSection id="funding" number="02" title="Funding & investment">
          <div className="space-y-8">
            <StateLdoeBudgetSankey />
            <StatePerPupilFundingSection />
          </div>
        </ReportSection>

        <ReportSection id="graduation" number="03" title="Graduation & credentials">
          <GraduationPanel variant="state" />
        </ReportSection>

        <ReportSection id="school-performance" number="04" title="School performance">
        <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Schools by Letter Grade</CardTitle>
            <CardDescription>
              Count of schools at each performance grade, broken down by school type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeBarData} margin={{ top: 8, right: 16, bottom: 0, left: -4 }}>
                  <CartesianGrid stroke={gridStroke} strokeDasharray="2 4" vertical={false} />
                  <XAxis
                    dataKey="grade"
                    tick={axisTick}
                    axisLine={{ stroke: gridStroke }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--border)", opacity: 0.25 }} />
                  <Legend
                    verticalAlign="top"
                    height={32}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }}
                  />
                  <Bar
                    dataKey="k8"
                    name="K-8"
                    stackId="schools"
                    fill={SCHOOL_COLORS.k8}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="combination"
                    name="Combination"
                    stackId="schools"
                    fill={SCHOOL_COLORS.combination}
                  />
                  <Bar
                    dataKey="highSchool"
                    name="High School"
                    stackId="schools"
                    fill={SCHOOL_COLORS.highSchool}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>State Performance Score Trend</CardTitle>
            <CardDescription>
              Louisiana statewide SPS score and corresponding letter grade by school year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spsTrend} margin={{ top: 8, right: 16, bottom: 0, left: -4 }}>
                  <CartesianGrid stroke={gridStroke} strokeDasharray="2 4" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={axisTick}
                    axisLine={{ stroke: gridStroke }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip content={<SpsTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="sps"
                    name="SPS Score"
                    stroke="#378ADD"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#378ADD", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Districts by Letter Grade Over Time</CardTitle>
            <CardDescription>
              Number of school districts earning each letter grade, by school year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={districtLineData} margin={{ top: 8, right: 16, bottom: 0, left: -4 }}>
                  <CartesianGrid stroke={gridStroke} strokeDasharray="2 4" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={axisTick}
                    axisLine={{ stroke: gridStroke }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={32}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }}
                  />
                  {(["A", "B", "C", "D", "F"] as const).map((grade) => (
                    <Line
                      key={grade}
                      type="monotone"
                      dataKey={grade}
                      name={`Grade ${grade}`}
                      stroke={GRADE_LINE_COLORS[grade]}
                      strokeWidth={2}
                      dot={{ r: 3, fill: GRADE_LINE_COLORS[grade], strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        </div>
        </ReportSection>

        <ReportSection id="workforce" number="05" title="Workforce & economy">
          <div className="space-y-8">
            <LaborMarketPanel />
            <WorkforceSnapshotSection />
          </div>
        </ReportSection>

        <ReportSection id="academic" number="06" title="Academic outcomes">
          <StatewideAcademicSection />
        </ReportSection>

        <ReportSection id="educators" number="07" title="Educator compensation">
          <TeacherCompensationSection />
        </ReportSection>

        <footer className="border-t border-border pt-5 text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
          LENS · Louisiana Education &amp; Needs Synthesis
        </footer>
      </ReportLayout>
    </div>
  );
}
