import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Lightbulb,
  Minus,
  TriangleAlert,
} from "lucide-react";
import { ReportToolbar } from "@/components/lens/report/ReportToolbar";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Sankey,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ALERT_EXPLANATIONS,
  INDEX_LABELS,
  LAYERS,
  PARISHES,
  SEV_COLOR,
  STATE_AVG,
  buildFundingBreakdown,
  buildGradeDistribution,
  buildTrendSeries,
  buildWorkforceAlignment,
  interventionRecommendation,
  severity,
  severityLabel,
} from "@/lib/lens-data";
import { AcademicPerformanceSection } from "@/components/lens/AcademicPerformanceSection";
import { EducatorQualitySection } from "@/components/lens/EducatorQualitySection";
import { PostGraduationOutcomesSection } from "@/components/lens/PostGraduationOutcomesSection";
import { SpedAccessPanel } from "@/components/lens/SpedAccessPanel";
import { EnrollmentPanel, type EnrollmentData } from "@/components/lens/EnrollmentPanel";
import { MFPFundingPanel } from "@/components/lens/MFPFundingPanel";
import { GraduationPanel } from "@/components/lens/GraduationPanel";
import { ParishPerPupilFundingPanel } from "@/components/lens/ParishPerPupilFundingPanel";
import {
  formatFundingDollars,
  getParishFunding,
  FUNDING_BY_PARISH,
} from "@/lib/funding-by-parish";
import {
  formatParishSchools,
  formatParishStudents,
  getParishRealStats,
} from "@/lib/parish-stats";
import { ReportLayout } from "@/components/lens/report/ReportLayout";
import { ReportSection } from "@/components/lens/report/ReportSection";
import {
  PARISH_REPORT_SECTIONS,
} from "@/components/lens/report/parish-report-sections";
import enrollmentData from "../../../public/data/enrollment_by_parish.json";
import { buildOutcomeSankeyFromCohort } from "@/lib/parish-outcome-sankey";
import { getParishRecommendationCopy } from "@/lib/parish-report-insights";
import { PolicySimulator } from "@/components/lens/PolicySimulator";

interface Props {
  parishId: string;
}

export function ParishReport({ parishId }: Props) {
  const parish = PARISHES.find((p) => p.id === parishId);
  if (!parish) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Link to="/app" className="text-sm underline">
          Parish not found — back to dashboard
        </Link>
      </div>
    );
  }

  const healthSev = severity("Health", parish.scores.Health);
  const healthColor = SEV_COLOR[healthSev];
  const healthLabel = severityLabel("Health", parish.scores.Health);

  const TrendIcon = parish.trend === "up" ? ArrowUp : parish.trend === "down" ? ArrowDown : Minus;
  const trendColor =
    parish.trend === "up"
      ? "var(--sev-green)"
      : parish.trend === "down"
      ? "var(--sev-red)"
      : "var(--text-muted)";

  const dfPct = (parish.dfSchools / parish.totalSchools) * 100;
  const real = getParishRealStats(parishId);
  const fundingRecord = getParishFunding(parishId);
  const studentTotal = real.students ?? parish.students;
  const schoolTotal = real.schools ?? parish.totalSchools;
  const studentsPerSchool = schoolTotal > 0 ? Math.round(studentTotal / schoolTotal) : 0;

  const trendSeries = buildTrendSeries(parishId);
  const grades = buildGradeDistribution(parishId);
  const funding = buildFundingBreakdown(parishId);
  const workforce = buildWorkforceAlignment(parishId);
  const sankey = buildOutcomeSankeyFromCohort(parishId);
  const recommendationCopy = getParishRecommendationCopy(parishId);

  const radarData = LAYERS.map((k) => ({
    layer: k,
    parish: parish.scores[k],
    state: STATE_AVG[k],
  }));

  const compareData = LAYERS.map((k) => ({
    layer: k,
    parish: parish.scores[k],
    state: STATE_AVG[k],
  }));

  const fundingTotal = funding.reduce((a, b) => a + b.value, 0);

  // Rank within state for Health
  const sorted = [...PARISHES].sort((a, b) => b.scores.Health - a.scores.Health);
  const rank = sorted.findIndex((p) => p.id === parishId) + 1;

  type EnrollmentParishRecord = EnrollmentData & { parish_slug: string };
  const enrollmentParish = (
    enrollmentData as { parishes: EnrollmentParishRecord[] }
  ).parishes.find((p) => p.parish_slug === parishId);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/parish/${parishId}`
      : `/parish/${parishId}`;

  return (
    <div className="lens-report min-h-screen w-full bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-[var(--background)]/85 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 py-3">
          <Link
            to="/app"
            className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)] transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to dashboard
          </Link>
          <div className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--blue)]" />
            LENS · Full Parish Report
          </div>
          <ReportToolbar shareUrl={shareUrl} parishId={parishId} />
        </div>
      </header>

      <ReportLayout
        sections={PARISH_REPORT_SECTIONS}
        hero={
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              <span>Louisiana</span>
              <span className="h-px w-6 bg-border" />
              <span>Parish Report</span>
            </div>
            <h1 className="mt-2 font-display text-[64px] font-bold leading-[0.95] tracking-[-0.04em] text-foreground">
              {parish.name}
              <span className="text-[var(--text-muted)]">.</span>
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[var(--text-secondary)]">
              <Stat label="Students" value={formatParishStudents(real)} />
              <Dot />
              <Stat label="Schools" value={formatParishSchools(real)} />
              <Dot />
              <span className="inline-flex items-center gap-1" style={{ color: trendColor }}>
                <TrendIcon className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {parish.trend === "flat" ? "Stable trajectory" : `Trending ${parish.trend}`}
                </span>
              </span>
            </div>

            {parish.alert && (
              <div
                className="mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                style={{
                  borderColor: "color-mix(in oklab, var(--sev-red) 35%, transparent)",
                  backgroundColor: "color-mix(in oklab, var(--sev-red) 8%, transparent)",
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                    style={{ background: "var(--sev-red)" }}
                  />
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ background: "var(--sev-red)" }}
                  />
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: "var(--sev-red)" }}
                >
                  Active alert · {parish.alert}
                </span>
              </div>
            )}
          </div>

          {/* Hero score card */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-[var(--surface-elevated)] p-6 shadow-elevated">
            <div
              className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-[0.10] blur-2xl"
              style={{ background: healthColor }}
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Composite Health
                </span>
                <span
                  className="rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]"
                  style={{
                    background: `color-mix(in oklab, ${healthColor} 14%, transparent)`,
                    color: healthColor,
                  }}
                >
                  {healthLabel}
                </span>
              </div>

              <div className="mt-4 flex items-end gap-3">
                <span
                  className="font-display text-[112px] font-bold leading-none tracking-[-0.06em] tabular-nums"
                  style={{ color: healthColor }}
                >
                  {parish.scores.Health}
                </span>
                <div className="mb-3 flex flex-col gap-0.5 text-[11px] text-[var(--text-secondary)]">
                  <span className="font-mono tabular-nums">/ 100</span>
                  <span className="text-[var(--text-muted)]">vs state {STATE_AVG.Health}</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <Mini label="State Rank" value={`#${rank}`} sub={`of ${PARISHES.length}`} />
                <Mini
                  label="vs State"
                  value={`${parish.scores.Health - STATE_AVG.Health > 0 ? "+" : ""}${
                    parish.scores.Health - STATE_AVG.Health
                  }`}
                  tone={parish.scores.Health >= STATE_AVG.Health ? "positive" : "negative"}
                />
              </div>
            </div>
          </div>
        </section>
        }
      >
        <ReportSection id="at-a-glance" number="01" title="At a glance">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi
            label="D/F Schools"
            value={String(parish.dfSchools)}
            sub={`${dfPct.toFixed(1)}% of ${parish.totalSchools}`}
            tone="danger"
          />
          <Kpi
            label="Students / School"
            value={studentsPerSchool.toLocaleString()}
            sub={`${studentTotal.toLocaleString()} total · LDOE`}
          />
          <Kpi
            label="Per-Pupil Funding"
            value={
              fundingRecord
                ? formatFundingDollars(fundingRecord.spend_per_pupil)
                : `$${(fundingTotal / 1000).toFixed(1)}K`
            }
            sub={
              fundingRecord
                ? `#${fundingRecord.rank} of ${FUNDING_BY_PARISH.meta.parish_count} · Treasurer`
                : "annual avg"
            }
            tone={fundingRecord && fundingRecord.vs_state_avg_dollars > 0 ? "info" : undefined}
          />
          <Kpi
            label="Intervention"
            value={parish.intervention}
            sub="recommended track"
            tone="info"
          />
        </div>
        </ReportSection>

        <ReportSection id="enrollment" number="02" title="Enrollment & demographics">
          <div className="space-y-6">
            <EnrollmentPanel data={enrollmentParish ?? null} hideSourceDate />
            <MFPFundingPanel parishSlug={parishId} />
            <ParishPerPupilFundingPanel parishSlug={parishId} parishName={parish.name} />
          </div>
        </ReportSection>

        <ReportSection id="outcomes" number="03" title="Outcomes & trajectory">
        <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Panel
            title="Health Trajectory"
            subtitle="Composite health vs Louisiana statewide"
            badge={`${trendSeries[0]?.parish ?? 0} → ${trendSeries.at(-1)?.parish ?? 0}`}
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendSeries} margin={{ top: 10, right: 16, bottom: 0, left: -8 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip content={<TooltipBox />} />
                  <Legend
                    verticalAlign="top"
                    height={28}
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ fontSize: 10, color: "var(--text-secondary)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="state"
                    name="Louisiana avg"
                    stroke="var(--blue)"
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="parish"
                    name={parish.name}
                    stroke={healthColor}
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: healthColor, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Index Footprint" subtitle="Six layers vs Louisiana statewide">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="78%">
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="layer"
                    tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                    axisLine={false}
                  />
                  <Tooltip content={<TooltipBox />} />
                  <Radar
                    name="State"
                    dataKey="state"
                    stroke="var(--blue)"
                    fill="var(--blue)"
                    fillOpacity={0.08}
                    strokeWidth={1.2}
                  />
                  <Radar
                    name={parish.name}
                    dataKey="parish"
                    stroke={healthColor}
                    fill={healthColor}
                    fillOpacity={0.22}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

          <Panel
            title="Composite Indices · Comparative"
            subtitle={`How ${parish.name} stacks against Louisiana statewide`}
          >
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={compareData}
                  margin={{ top: 16, right: 16, bottom: 0, left: -8 }}
                  barCategoryGap="22%"
                >
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis
                    dataKey="layer"
                    tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--border)", opacity: 0.3 }} />
                  <Legend
                    verticalAlign="top"
                    height={28}
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ fontSize: 10, color: "var(--text-secondary)" }}
                  />
                  <Bar dataKey="state" name="Louisiana" fill="var(--blue)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="parish" name={parish.name} radius={[3, 3, 0, 0]}>
                    {compareData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={SEV_COLOR[severity(entry.layer, entry.parish)]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
              {INDEX_LABELS.map(({ key, label }) => {
                const score = parish.scores[key];
                const sev = severity(key, score);
                const color = SEV_COLOR[sev];
                const delta = score - STATE_AVG[key];
                return (
                  <div
                    key={key}
                    className="rounded-lg border border-border bg-[var(--background)] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                        {label}
                      </span>
                      <span className="font-mono text-[14px] font-bold tabular-nums" style={{ color }}>
                        {score}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${score}%`, background: color }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                      <span>State {STATE_AVG[key]}</span>
                      <span style={{ color: delta === 0 ? "var(--text-muted)" : color }}>
                        {delta > 0 ? "+" : ""}
                        {delta} vs state
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
          <div className="mt-4">
            <GraduationPanel parishSlug={parishId} />
          </div>
        </div>
        </ReportSection>

        <ReportSection
          id="deep-signals"
          number="04"
          title="Deep signals"
          badge="Cohort · Class of 2024"
        >
          <Panel
            title="Graduate Outcome Flow"
            subtitle="LDOE cohort credentials · college enrollment · estimated grad-class pathways"
          >
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <Sankey
                  data={sankey}
                  nodePadding={18}
                  nodeWidth={10}
                  iterations={64}
                  link={{ stroke: "var(--ink)", strokeOpacity: 0.18 }}
                  node={
                    <SankeyNode
                      containerWidth={0}
                      healthColor={healthColor}
                      gradClass={sankey.gradClass}
                    />
                  }
                >
                  <Tooltip content={<TooltipBox suffix=" students" />} />
                </Sankey>
              </ResponsiveContainer>
            </div>
          </Panel>
        </ReportSection>

        <ReportSection id="academic" number="05" title="Academic performance">
          <div className="space-y-6">
            <AcademicPerformanceSection
              parishId={parishId}
              parishName={parish.name}
              parishColor={healthColor}
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="School Grade Distribution" subtitle={`${parish.totalSchools} schools rated`}>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={grades} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis
                    dataKey="grade"
                    tick={{ fontSize: 11, fill: "var(--text-secondary)", fontWeight: 600 }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--border)", opacity: 0.3 }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {grades.map((g, i) => {
                      const colors = [
                        "var(--sev-green)",
                        "var(--sev-lime)",
                        "var(--sev-yellow)",
                        "var(--sev-orange)",
                        "var(--sev-red)",
                      ];
                      return <Cell key={i} fill={colors[i]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[11px]">
              <span className="text-[var(--text-muted)]">D/F concentration</span>
              <span className="font-mono font-bold tabular-nums" style={{ color: "var(--sev-red)" }}>
                {dfPct.toFixed(1)}%
              </span>
            </div>
          </Panel>

            </div>
          </div>
        </ReportSection>

        <ReportSection id="educators" number="06" title="Educator quality">
          <EducatorQualitySection parishId={parishId} />
        </ReportSection>

        <ReportSection id="post-graduation" number="07" title="Post-graduation">
          <div className="space-y-6">
            <PostGraduationOutcomesSection parishId={parishId} parishColor={healthColor} />
            <Panel
              title="Workforce Pathway Alignment"
              subtitle="Graduate credentials vs projected employer demand by sector"
            >
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={workforce}
                    margin={{ top: 16, right: 16, bottom: 0, left: -8 }}
                    barCategoryGap="28%"
                  >
                    <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                    <XAxis
                      dataKey="sector"
                      tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                      unit="%"
                    />
                    <Tooltip content={<TooltipBox suffix="%" />} cursor={{ fill: "var(--border)", opacity: 0.3 }} />
                    <Legend
                      verticalAlign="top"
                      height={28}
                      iconType="circle"
                      iconSize={7}
                      wrapperStyle={{ fontSize: 10, color: "var(--text-secondary)" }}
                    />
                    <Bar dataKey="aligned" name="Grads aligned" fill="var(--ink)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="demand" name="Employer demand" fill="var(--blue)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        </ReportSection>

        <ReportSection id="equity" number="08" title="Equity & access">
          <SpedAccessPanel
            parishName={parish.name}
            iepPct={parish.signals?.sped_iep_pct ?? null}
            gapPct={parish.signals?.sped_teacher_gap_pct ?? null}
            iepCount={parish.signals?.sped_iep_count ?? null}
            fteTotal={parish.signals?.sped_teacher_fte_total ?? null}
            fteCertified={parish.signals?.sped_teacher_fte_certified ?? null}
            fteUncertified={parish.signals?.sped_teacher_fte_uncertified ?? null}
          />
        </ReportSection>

        {/* Policy Simulator */}
        <section id="policy-simulator" className="mt-8 scroll-mt-28">
          <div className="mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Interactive · What-If Analysis
            </p>
            <h2 className="mt-0.5 text-[17px] font-semibold text-foreground">Policy Simulator</h2>
            <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
              Adjust real signals and see how Health Score changes live
            </p>
          </div>
          <PolicySimulator parishId={parishId} />
        </section>

        <ReportSection id="recommendations" number="09" title="Recommendations">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {parish.alert && (
            <div
              className="overflow-hidden rounded-2xl border p-5"
              style={{
                backgroundColor: "color-mix(in oklab, var(--sev-red) 6%, transparent)",
                borderColor: "color-mix(in oklab, var(--sev-red) 28%, transparent)",
              }}
            >
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4" style={{ color: "var(--sev-red)" }} />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: "var(--sev-red)" }}
                >
                  Active Alert
                </span>
              </div>
              <h3
                className="mt-2 font-display text-[24px] font-bold tracking-[-0.02em]"
                style={{ color: "var(--sev-red)" }}
              >
                {parish.alert}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                {recommendationCopy.alertDetail ?? ALERT_EXPLANATIONS[parish.alert]}
              </p>
            </div>
          )}

          <div
            className={`overflow-hidden rounded-2xl border p-5 ${parish.alert ? "" : "lg:col-span-2"}`}
            style={{
              backgroundColor: "color-mix(in oklab, var(--blue) 6%, transparent)",
              borderColor: "color-mix(in oklab, var(--blue) 28%, transparent)",
            }}
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" style={{ color: "var(--blue)" }} />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "var(--blue)" }}
              >
                Recommendation · {parish.intervention}
              </span>
            </div>
            <h3
              className="mt-2 font-display text-[20px] font-bold tracking-[-0.01em]"
              style={{ color: "var(--blue)" }}
            >
              {interventionRecommendation(parish.intervention)}
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">
              {recommendationCopy.interventionDetail}
            </p>
          </div>
        </div>
        </ReportSection>

        <footer className="flex items-center justify-between border-t border-border pt-5 text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
          <span>LENS · Louisiana Education & Needs Synthesis</span>
          <span>Louisiana Education &amp; Needs Synthesis</span>
        </footer>
      </ReportLayout>
    </div>
  );
}

/* ---------- helpers ---------- */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</span>
      <span className="font-mono text-[12px] font-semibold tabular-nums text-foreground">{value}</span>
    </span>
  );
}

function Dot() {
  return <span className="inline-block h-1 w-1 rounded-full bg-border" />;
}

function Mini({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "positive" | "negative";
}) {
  const color =
    tone === "positive"
      ? "var(--sev-green)"
      : tone === "negative"
      ? "var(--sev-red)"
      : "var(--foreground)";
  return (
    <div>
      <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </div>
      <div className="mt-0.5 font-display text-[18px] font-bold leading-none tabular-nums" style={{ color }}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">{sub}</div>}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "danger" | "info";
}) {
  const accent =
    tone === "danger" ? "var(--sev-red)" : tone === "info" ? "var(--blue)" : "var(--foreground)";
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-[var(--surface-elevated)] p-4 transition-shadow hover:shadow-card">
      <div
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: accent, opacity: 0.6 }}
      />
      <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {label}
      </div>
      <div
        className="mt-1.5 font-display text-[28px] font-bold leading-none tabular-nums"
        style={{ color: accent }}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] text-[var(--text-secondary)]">{sub}</div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-[var(--surface-elevated)] p-5 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{subtitle}</p>
          )}
        </div>
        {badge && (
          <span className="rounded-full border border-border bg-[var(--background)] px-2 py-0.5 font-mono text-[10px] tabular-nums text-[var(--text-secondary)]">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function TooltipBox({
  active,
  payload,
  label,
  suffix = "",
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string }>;
  label?: string | number;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-[var(--surface-elevated)] px-2.5 py-2 shadow-elevated">
      {label !== undefined && (
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          {label}
        </div>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ background: p.color ?? "var(--foreground)" }}
            />
            <span className="text-[var(--text-secondary)]">{p.name}</span>
            <span className="ml-auto font-mono font-bold tabular-nums text-foreground">
              {p.value}
              {suffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== Intelligence Suite components ===================== */

/** Custom Sankey node — colored by category with label. */
function SankeyNode(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  payload?: { name?: string; value?: number };
  containerWidth: number;
  healthColor: string;
  gradClass?: number;
}) {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    payload,
    containerWidth,
    healthColor,
    gradClass = 0,
  } = props;
  const name = payload?.name ?? "";
  const value = payload?.value ?? 0;

  // Color by node category
  const colorMap: Record<string, string> = {
    Graduates: "var(--ink)",
    "On-time grads": "var(--sev-green)",
    "On-time": "var(--sev-green)",
    "Late / GED": "var(--sev-orange)",
    "4-yr college": "var(--blue)",
    "4-yr College": "var(--blue)",
    "2-yr college": "var(--cyan)",
    "2-yr College": "var(--cyan)",
    "CTE credential": "var(--sev-lime)",
    "CTE Credential": "var(--sev-lime)",
    "Direct workforce": "var(--sev-yellow)",
    "Direct Workforce": "var(--sev-yellow)",
    Military: "var(--text-muted)",
    Unknown: "var(--text-muted)",
    "Employed @ 1yr": "var(--sev-green)",
    "Still enrolled": "var(--blue)",
    Disconnected: "var(--sev-red)",
  };
  const color = colorMap[name] ?? healthColor;
  const isLast = x + width > containerWidth - 80;
  const labelX = isLast ? x - 6 : x + width + 6;
  const anchor = isLast ? "end" : "start";

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} fillOpacity={0.9} rx={2} />
      <text x={labelX} y={y + height / 2} textAnchor={anchor} dominantBaseline="middle" fontSize={10} fontWeight={600} fill="var(--foreground)">
        {name}
      </text>
      <text x={labelX} y={y + height / 2 + 11} textAnchor={anchor} dominantBaseline="middle" fontSize={9} fill="var(--text-muted)" className="font-mono tabular-nums">
        {gradClass > 0 ? `${Math.round((value / gradClass) * 100)}%` : value.toLocaleString()}
      </text>
    </g>
  );
}
