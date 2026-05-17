import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  CATEGORY_COLORS,
  FUNDING_BY_PARISH,
  SOURCE_COLORS,
  formatFundingDollars,
} from "@/lib/funding-by-parish";

const CATEGORY_FALLBACK = ["#185FA5", "#5C6B7A", "#0F6E56", "#B07D00", "#6B3FA0"];

function FundingTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { name: string; amount: number; pct: number; description?: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-[var(--surface-elevated)] px-3 py-2 shadow-card">
      <p className="text-[11px] font-semibold text-foreground">{d.name}</p>
      <p className="mt-0.5 font-mono text-[12px] tabular-nums text-[var(--blue)]">
        {formatFundingDollars(d.amount)} / pupil · {d.pct.toFixed(1)}%
      </p>
      {d.description && (
        <p className="mt-1 max-w-[200px] text-[10px] leading-snug text-[var(--text-secondary)]">
          {d.description}
        </p>
      )}
    </div>
  );
}

export function StatePerPupilFundingSection() {
  const { state, meta } = FUNDING_BY_PARISH;

  const categories = useMemo(
    () =>
      state.spending_categories.map((c, i) => ({
        name: c.name,
        amount: c.amount,
        pct: c.pct,
        description: c.description ?? undefined,
        fill: CATEGORY_COLORS[c.id] ?? CATEGORY_FALLBACK[i % CATEGORY_FALLBACK.length],
      })),
    [state.spending_categories],
  );

  const sources = useMemo(
    () =>
      state.funding_sources.map((s) => ({
        name: s.name.replace(" Sources", ""),
        amount: s.amount,
        pct: s.pct,
        fill: SOURCE_COLORS[s.id] ?? "#888",
      })),
    [state.funding_sources],
  );

  return (
    <section className="rounded-2xl border border-border bg-[var(--surface-elevated)] p-5 shadow-card md:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 lg:max-w-[280px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Louisiana Treasurer · LDOE
          </p>
          <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Per-pupil spending
          </h2>
          <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-secondary)]">
            How Louisiana allocates each education dollar — funding sources (outer ring) and spending
            categories (inner ring). State average{" "}
            <span className="font-semibold text-foreground">
              {formatFundingDollars(meta.state_avg_per_pupil)}
            </span>{" "}
            per pupil.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Funding sources
              </p>
              <ul className="space-y-1.5">
                {sources.map((s) => (
                  <li key={s.name} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.fill }} />
                      <span className="text-foreground">{s.name}</span>
                    </span>
                    <span className="font-mono tabular-nums text-[var(--text-secondary)]">
                      {formatFundingDollars(s.amount)} · {s.pct.toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Spending categories
              </p>
              <ul className="space-y-1.5">
                {categories.map((c) => (
                  <li key={c.name} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.fill }} />
                      <span className="truncate text-foreground">{c.name}</span>
                    </span>
                    <span className="shrink-0 font-mono tabular-nums text-[var(--text-secondary)]">
                      {c.pct.toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="relative mx-auto h-[300px] w-full max-w-[340px] shrink-0 lg:mx-0 lg:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<FundingTooltip />} />
              {/* Outer: State vs Federal */}
              <Pie
                data={sources}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="96%"
                paddingAngle={2}
                stroke="var(--surface-elevated)"
                strokeWidth={2}
              >
                {sources.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              {/* Inner: spending categories */}
              <Pie
                data={categories}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="38%"
                outerRadius="64%"
                paddingAngle={1.5}
                stroke="var(--surface-elevated)"
                strokeWidth={1.5}
              >
                {categories.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Per pupil
            </span>
            <span className="font-display text-2xl font-bold tabular-nums tracking-tight text-foreground">
              {formatFundingDollars(state.spend_per_pupil)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
