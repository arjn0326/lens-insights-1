import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { sankey, sankeyLinkHorizontal, type SankeyGraph, type SankeyLink, type SankeyNode } from "d3-sankey";
import { ArrowLeft } from "lucide-react";
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
import ldoeFundingData from "../../public/data/ldoe_funding.json";
import { StatewideAcademicSection } from "@/components/lens/StatewideAcademicSection";
import { TeacherCompensationSection } from "@/components/lens/TeacherCompensationSection";
import { WorkforceSnapshotSection } from "@/components/lens/WorkforceSnapshotSection";

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

const LDOE_SOURCE_COLOR = "#3D3A35";
const APPROPRIATION_COLORS: Record<string, string> = {
  "678": "#378ADD",
  "681": "#1D9E75",
  "682": "#BA7517",
  "695": "#534AB7",
  "697": "#D85A30",
};

type FundingNodeDatum = { id: string; label: string };
type FundingSankeyNode = SankeyNode<FundingNodeDatum, Record<string, unknown>>;
type FundingSankeyLink = SankeyLink<FundingNodeDatum, FundingSankeyNode>;
type FundingGraph = SankeyGraph<FundingNodeDatum, FundingSankeyLink>;

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

function LdoeFundingSankey() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const height = 380;
  const margin = { top: 12, right: 148, bottom: 12, left: 108 };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const graph = useMemo((): FundingGraph | null => {
    if (width <= 0) return null;
    const nodes = ldoeFundingData.nodes.map((n) => ({ ...n }));
    const links = ldoeFundingData.links.map((l) => ({ ...l }));
    const layout = sankey<FundingNodeDatum, Record<string, unknown>>()
      .nodeId((d) => d.id)
      .nodeWidth(16)
      .nodePadding(20)
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);
    return layout({ nodes, links }) as FundingGraph;
  }, [width]);

  const linkPath = useMemo(() => sankeyLinkHorizontal(), []);

  return (
    <div ref={containerRef} className="w-full">
      <svg width={width} height={height} className="overflow-visible">
        {graph?.links.map((link, i) => {
          const targetId = (link.target as FundingSankeyNode).id;
          const color = APPROPRIATION_COLORS[targetId] ?? "#378ADD";
          const d = linkPath(link);
          if (!d) return null;
          return (
            <path
              key={i}
              d={d}
              fill={color}
              fillOpacity={0.4}
              stroke="none"
            />
          );
        })}
        {graph?.nodes.map((node) => {
          const nodeId = node.id;
          const color =
            nodeId === "LDOE" ? LDOE_SOURCE_COLOR : (APPROPRIATION_COLORS[nodeId] ?? "#378ADD");
          const x = node.x0 ?? 0;
          const y = node.y0 ?? 0;
          const w = (node.x1 ?? 0) - x;
          const h = (node.y1 ?? 0) - y;
          const onLeft = x + w / 2 < width / 2;
          const labelX = onLeft ? x - 10 : (node.x1 ?? 0) + 10;
          const anchor = onLeft ? "end" : "start";
          const lines = node.label.split("\n");

          return (
            <g key={nodeId}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={color}
                rx={2}
                opacity={0.92}
              />
              <text
                x={labelX}
                y={y + h / 2}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill="var(--foreground)"
                fontSize={10}
                fontWeight={nodeId === "LDOE" ? 700 : 600}
              >
                {lines.map((line, li) => (
                  <tspan
                    key={li}
                    x={labelX}
                    dy={li === 0 ? `${-(lines.length - 1) * 0.55}em` : "1.1em"}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function StateReport() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-[var(--background)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-4 py-3 md:px-8">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)] transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to dashboard
          </Link>
          <div className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--blue)]" />
            LENS · State Report
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[960px] px-4 py-8 md:px-8">
        <header className="mb-8">
          <p className="font-mono text-[10px] font-semibold tabular-nums tracking-wider text-[var(--blue)]">
            00 · STATEWIDE
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl">
            Louisiana — State Overview
          </h1>
        </header>

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

        <Card>
          <CardHeader>
            <CardTitle>LDOE 5YR Strategic Plan Funding Flow 2023–2028</CardTitle>
            <CardDescription>
              Total budget dispersal across five major appropriation categories (amounts in $M)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LdoeFundingSankey />
          </CardContent>
        </Card>

        <StatewideAcademicSection />

        <TeacherCompensationSection />

        <WorkforceSnapshotSection />
        </div>
      </div>
    </div>
  );
}
