import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { InfoTip } from "@/components/lens/InfoTip";
import { BLS_JOLTS_LOUISIANA } from "@/lib/bls-data";

const OPENINGS_TOOLTIP =
  "Job openings rate is the share of jobs unfilled in Louisiana vs. the U.S., from BLS JOLTS (Job Openings and Labor Turnover Survey). Seasonally adjusted statewide series — not parish-level. Source: bls.gov/jlt";

const SEPARATIONS_TOOLTIP =
  "Separations are workers leaving jobs in December 2025: voluntary quits, layoffs, and other. Values in thousands of workers. Source: bls.gov/jlt";

function ChartTitle({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="mb-3 flex items-center gap-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </p>
      <InfoTip text={tooltip} size={10} />
    </div>
  );
}

export function LaborMarketPanel() {
  const { headline, trend, source, reference_month, note } = BLS_JOLTS_LOUISIANA;

  const separationsData = [
    { name: "Quits", value: headline.quits / 1000, color: "#A32D2D" },
    { name: "Layoffs", value: headline.layoffs / 1000, color: "#888780" },
    { name: "Other", value: headline.other_separations / 1000, color: "#B4B2A9" },
  ];

  const insights = [
    {
      color: "#185FA5",
      text: "More open jobs than unemployed workers. Louisiana has 0.9 unemployed people per job opening — graduates entering the workforce have real opportunity, but only if they have the right skills.",
    },
    {
      color: "#A32D2D",
      text: "Workers are leaving voluntarily, not being pushed out. 54,000 quits vs 25,000 layoffs signals wage pressure and dissatisfaction — parishes producing underprepared graduates feed this churn cycle.",
    },
    {
      color: "#3B6D11",
      text: "Louisiana's hiring market beats the national average. A 4.5% openings rate vs 3.9% nationally means employer demand is strong. The gap is on the education supply side — exactly what LENS measures.",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-[var(--surface-elevated)] p-6">
      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Statewide · BLS JOLTS {reference_month}
        </p>
        <h2 className="mt-0.5 text-[17px] font-semibold text-foreground">
          Louisiana Labor Market Context
        </h2>
        <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
          Why the K–12 pipeline matters right now
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-[var(--surface)] p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Open jobs</p>
          <p className="mt-1 text-[22px] font-semibold text-foreground">95,000</p>
          <p className="text-[11px] text-[var(--text-secondary)]">statewide, seasonally adjusted</p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Unemployed per opening</p>
          <p className="mt-1 text-[22px] font-semibold text-[#3B6D11]">0.9</p>
          <p className="text-[11px] text-[var(--text-secondary)]">more jobs than job seekers</p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Opening rate vs US</p>
          <p className="mt-1 text-[22px] font-semibold text-[#185FA5]">
            4.5% <span className="text-[13px] text-[var(--text-secondary)]">vs 3.9%</span>
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">Louisiana outpaces national average</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <ChartTitle label="Job openings rate — Louisiana vs US" tooltip={OPENINGS_TOOLTIP} />
          <div className="mb-2 flex gap-4 text-[11px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm bg-[#185FA5]" />
              Louisiana
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm bg-[#888780]" />
              United States
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={[...trend]}
              margin={{ top: 4, right: 24, left: -12, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(136,135,128,0.15)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10 }}
                interval={0}
                padding={{ left: 8, right: 16 }}
              />
              <YAxis domain={[3, 9]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} width={32} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="louisiana" stroke="#185FA5" strokeWidth={2} dot={false} />
              <Line
                type="monotone"
                dataKey="us"
                stroke="#888780"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border p-4">
          <ChartTitle label="December 2025 separations breakdown" tooltip={SEPARATIONS_TOOLTIP} />
          <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--text-secondary)]">
            {separationsData.map((s) => (
              <span key={s.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
                {s.name} ({s.value}k)
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={separationsData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                dataKey="value"
              >
                {separationsData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}k workers`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        What this means for K–12 education in Louisiana
      </div>
      <div className="flex flex-col gap-2">
        {insights.map((ins, i) => (
          <div key={i} className="flex gap-3 rounded-lg bg-[var(--surface)] p-3">
            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: ins.color }} />
            <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">{ins.text}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-[var(--text-muted)]">
        Source: {source} · Released {BLS_JOLTS_LOUISIANA.release_date} · {note}
      </p>
    </div>
  );
}
