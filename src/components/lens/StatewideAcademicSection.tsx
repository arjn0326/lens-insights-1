import { useMemo, useState } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InfoTip } from "@/components/lens/InfoTip";
import {
  actScores,
  buildParishRankings,
  buildSingleSeriesChartData,
  fiveYearChange,
  formatSigned,
  isValidScore,
  leapScores,
  LEAP_TIER_STYLES,
  leapTier,
  type ParishRankingRow,
} from "@/lib/academic-scores";
import {
  buildCollegeSingleSeriesChartData,
  collegeEnrollment,
  collegeFiveYearChange,
} from "@/lib/college-enrollment";
import {
  buildStateRatingsChartData,
  teacherEval,
  TEACHER_RATING_COLORS,
  TEACHER_RATING_LABELS,
} from "@/lib/teacher-eval";

const STATE_TEACHER_TOOLTIP_LABELS: Record<string, string> = {
  highlyEffective: TEACHER_RATING_LABELS.highlyEffective,
  proficient: TEACHER_RATING_LABELS.proficient,
  emerging: TEACHER_RATING_LABELS.emerging,
};

const axisTick = { fontSize: 10, fill: "var(--text-muted)" };

type SortKey = "rank" | "name" | "leapAvg" | "actAvg" | "leap2025" | "act2025";

function SectionLabel({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <CardTitle className="text-base">{label}</CardTitle>
      <InfoTip text={tooltip} size={10} />
    </div>
  );
}

function StateLineTooltip({
  active,
  payload,
  label,
  suffix = "",
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string | number;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card px-2.5 py-2 shadow-md text-[11px]">
      <div className="mb-1 font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-mono tabular-nums">
        {payload[0].value?.toFixed(suffix === "%" ? 0 : 1)}
        {suffix}
      </div>
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm">
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-mono font-semibold tabular-nums">{value}</span>
    </p>
  );
}

function StateRatingsTooltip({
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
      <div className="mb-1 font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
          <span className="text-muted-foreground">
            {STATE_TEACHER_TOOLTIP_LABELS[p.name ?? ""] ?? p.name}
          </span>
          <span className="ml-auto font-mono tabular-nums">{p.value?.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

export function StatewideAcademicSection() {
  const [sortKey, setSortKey] = useState<SortKey>("leapAvg");
  const [sortAsc, setSortAsc] = useState(false);

  const actState = actScores.state;
  const leapState = leapScores.state;

  const actChart = useMemo(
    () => buildSingleSeriesChartData(actState.scores),
    [actState.scores],
  );
  const leapChart = useMemo(
    () => buildSingleSeriesChartData(leapState.proficiency312),
    [leapState.proficiency312],
  );
  const collegeChart = useMemo(
    () => buildCollegeSingleSeriesChartData(collegeEnrollment.state.rates),
    [],
  );
  const teacherChart = useMemo(
    () => buildStateRatingsChartData(teacherEval.state),
    [],
  );

  const actChange = fiveYearChange(actState.scores);
  const leapChange = fiveYearChange(leapState.proficiency312);
  const collegeChange = collegeFiveYearChange(collegeEnrollment.state.rates);
  const act2025 = actState.scores["2025"];
  const leap2025 = leapState.proficiency312["2025"];
  const college2024 = collegeEnrollment.state.rates["2024"];
  const teacherHe2024 = teacherEval.state.highlyEffective["2024"];
  const teacherProf2024 = teacherEval.state.proficient["2024"];
  const teacherEmerging2024 = teacherEval.state.emerging["2024"];

  const sortedRows = useMemo(() => {
    const rows = buildParishRankings();
    const mult = sortAsc ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (sortKey === "rank") return mult * (a.rank - b.rank);
      if (sortKey === "name") return mult * a.name.localeCompare(b.name);
      const av = a[sortKey] ?? -Infinity;
      const bv = b[sortKey] ?? -Infinity;
      return mult * (Number(av) - Number(bv));
    });
  }, [sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(key === "name");
    }
  };

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortAsc ? " ↑" : " ↓") : "";

  return (
    <section className="flex flex-col gap-6">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Accountability data
        </p>
        <h2 className="mt-1 font-display text-xl font-bold tracking-tight md:text-2xl">
          Statewide Academic Performance
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <SectionLabel
              label="College Readiness Score (ACT) — Statewide Trend"
              tooltip="Average ACT composite score for all Louisiana public school seniors. Scores range from 1–36. Tracks college readiness across the state over time."
            />
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={actChart} margin={{ top: 8, right: 16, bottom: 0, left: -4 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="year" tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                  <YAxis domain={["auto", "auto"]} tick={axisTick} axisLine={false} tickLine={false} width={36} />
                  <Tooltip content={<StateLineTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#378ADD"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#378ADD", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
              <StatLine
                label="2025 State Average"
                value={isValidScore(act2025) ? act2025.toFixed(1) : "—"}
              />
              <StatLine
                label="5-Year Change"
                value={actChange != null ? formatSigned(actChange) : "—"}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionLabel
              label="Academic Proficiency Rate (LEAP) — Statewide Trend"
              tooltip="Percentage of Louisiana students scoring Mastery or above on LEAP 2025 assessments across grades 3–12. Combines elementary, middle, and high school end-of-course test results."
            />
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leapChart} margin={{ top: 8, right: 16, bottom: 0, left: -4 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="year" tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<StateLineTooltip suffix="%" />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#378ADD"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#378ADD", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
              <StatLine
                label="2025 State Rate"
                value={isValidScore(leap2025) ? `${leap2025.toFixed(0)}%` : "—"}
              />
              <StatLine
                label="5-Year Change"
                value={leapChange != null ? `${formatSigned(leapChange, 0)} pts` : "—"}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionLabel
              label="College Enrollment Rate — Statewide Trend"
              tooltip="Percentage of Louisiana public high school graduates who enrolled in college the following fall. State average across all 64 parishes by graduation year."
            />
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={collegeChart} margin={{ top: 8, right: 16, bottom: 0, left: -4 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="year" tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<StateLineTooltip suffix="%" />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#378ADD"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#378ADD", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
              <StatLine
                label="2024 Rate"
                value={isValidScore(college2024) ? `${college2024.toFixed(1)}%` : "—"}
              />
              <StatLine
                label="5-Year Change"
                value={collegeChange != null ? `${formatSigned(collegeChange, 1)} pts` : "—"}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionLabel
              label="Teacher Evaluation Ratings — Statewide Trend"
              tooltip="Breakdown of teacher evaluation ratings under Louisiana's Compass system. Highly Effective is the top tier, Effective: Proficient is meeting expectations, and Effective: Emerging indicates a developing teacher. Percentages show the share of evaluated teachers in each parish falling into each category. Louisiana state average shown as a dashed reference line for Highly Effective only."
            />
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={teacherChart} margin={{ top: 16, right: 16, bottom: 0, left: -4 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="year" tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<StateRatingsTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ fontSize: 9, color: "var(--text-secondary)" }}
                    formatter={(value) => STATE_TEACHER_TOOLTIP_LABELS[String(value)] ?? value}
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
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
              <StatLine
                label="Highly Effective 2024"
                value={isValidScore(teacherHe2024) ? `${teacherHe2024.toFixed(1)}%` : "—"}
              />
              <StatLine
                label="Proficient 2024"
                value={isValidScore(teacherProf2024) ? `${teacherProf2024.toFixed(1)}%` : "—"}
              />
              <StatLine
                label="Emerging 2024"
                value={isValidScore(teacherEmerging2024) ? `${teacherEmerging2024.toFixed(1)}%` : "—"}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <SectionLabel
            label="Parish Academic Rankings"
            tooltip="All 64 Louisiana parishes ranked by their 5-year average LEAP proficiency rate (Grades 3–12). Color tiers: Green = 40% or above, Yellow = 25–39%, Red = below 25%."
          />
          <CardDescription>Click a column header to sort</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <RankingsTable
            rows={sortedRows}
            sortIndicator={sortIndicator}
            onSort={toggleSort}
          />
        </CardContent>
      </Card>
    </section>
  );
}

function RankingsTable({
  rows,
  sortIndicator,
  onSort,
}: {
  rows: ParishRankingRow[];
  sortIndicator: (key: SortKey) => string;
  onSort: (key: SortKey) => void;
}) {
  const headClass =
    "cursor-pointer select-none text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className={headClass} onClick={() => onSort("rank")}>
            Rank{sortIndicator("rank")}
          </TableHead>
          <TableHead className={headClass} onClick={() => onSort("name")}>
            Parish{sortIndicator("name")}
          </TableHead>
          <TableHead className={headClass} onClick={() => onSort("leapAvg")}>
            LEAP Avg (2021–25){sortIndicator("leapAvg")}
          </TableHead>
          <TableHead className={headClass} onClick={() => onSort("actAvg")}>
            ACT Avg (2021–25){sortIndicator("actAvg")}
          </TableHead>
          <TableHead className={headClass} onClick={() => onSort("leap2025")}>
            2025 LEAP{sortIndicator("leap2025")}
          </TableHead>
          <TableHead className={headClass} onClick={() => onSort("act2025")}>
            2025 ACT{sortIndicator("act2025")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const tier = leapTier(row.leapAvg);
          const tierStyle = tier ? LEAP_TIER_STYLES[tier] : null;
          return (
            <TableRow key={row.slug}>
              <TableCell className="font-mono text-xs tabular-nums">{row.rank}</TableCell>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell
                className="font-mono text-xs tabular-nums"
                style={
                  tierStyle
                    ? { background: tierStyle.bg, color: tierStyle.text }
                    : undefined
                }
              >
                {isValidScore(row.leapAvg) ? `${row.leapAvg.toFixed(1)}%` : "—"}
              </TableCell>
              <TableCell className="font-mono text-xs tabular-nums">
                {isValidScore(row.actAvg) ? row.actAvg.toFixed(2) : "—"}
              </TableCell>
              <TableCell className="font-mono text-xs tabular-nums">
                {isValidScore(row.leap2025) ? `${row.leap2025.toFixed(0)}%` : "—"}
              </TableCell>
              <TableCell className="font-mono text-xs tabular-nums">
                {isValidScore(row.act2025) ? row.act2025.toFixed(1) : "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
