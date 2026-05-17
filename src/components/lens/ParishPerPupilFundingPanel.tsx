import {
  FUNDING_BY_PARISH,
  formatFundingDollars,
  formatFundingPct,
  getParishFunding,
} from "@/lib/funding-by-parish";
import { TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  parishSlug: string;
  parishName: string;
}

export function ParishPerPupilFundingPanel({ parishSlug, parishName }: Props) {
  const record = getParishFunding(parishSlug);
  if (!record) return null;

  const vsDollars = record.vs_state_avg_dollars;
  const vsPct = record.vs_state_avg_pct;
  const isAbove = vsDollars > 0;
  const isBelow = vsDollars < 0;
  const accent = isAbove ? "var(--sev-orange)" : isBelow ? "var(--sev-green)" : "var(--blue)";
  const TrendIcon = isAbove ? TrendingUp : isBelow ? TrendingDown : null;

  const rankLabel = `#${record.rank}`;
  const rankSub = `of ${FUNDING_BY_PARISH.meta.parish_count} parishes · highest spend = #1`;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-[var(--surface-elevated)] shadow-card">
      <div
        className="absolute -right-20 -top-20 h-48 w-48 rounded-full opacity-[0.08] blur-3xl"
        style={{ background: accent }}
      />
      <div className="relative grid grid-cols-1 gap-0 md:grid-cols-[1.35fr_1fr]">
        <div className="border-b border-border p-5 md:border-b-0 md:border-r md:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Louisiana Treasurer · Per pupil expenditure
          </p>
          <h2 className="mt-1 font-display text-lg font-bold tracking-tight text-foreground">
            {parishName}
          </h2>
          <div className="mt-4 flex items-end gap-3">
            <span className="font-display text-5xl font-bold tabular-nums tracking-tight text-foreground md:text-6xl">
              {formatFundingDollars(record.spend_per_pupil)}
            </span>
            <span className="mb-2 text-[11px] font-medium text-[var(--text-muted)]">per pupil</span>
          </div>
          <p className="mt-2 text-[11px] text-[var(--text-secondary)]">
            State average {formatFundingDollars(FUNDING_BY_PARISH.meta.state_avg_per_pupil)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-3 md:grid-cols-1 md:grid-rows-3">
          <MetricCell
            label="vs state avg ($)"
            value={formatFundingDollars(vsDollars, true)}
            tone={isAbove ? "high" : isBelow ? "low" : "neutral"}
            icon={TrendIcon}
          />
          <MetricCell
            label="vs state avg (%)"
            value={formatFundingPct(vsPct)}
            tone={isAbove ? "high" : isBelow ? "low" : "neutral"}
          />
          <MetricCell label="Rank" value={rankLabel} sub={rankSub} highlight />
        </div>
      </div>
    </section>
  );
}

function MetricCell({
  label,
  value,
  sub,
  large,
  tone,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  large?: boolean;
  tone?: "high" | "low" | "neutral";
  icon?: typeof TrendingUp | null;
  highlight?: boolean;
}) {
  const toneColor =
    tone === "high"
      ? "var(--sev-orange)"
      : tone === "low"
        ? "var(--sev-green)"
        : highlight
          ? "var(--blue)"
          : "var(--foreground)";

  return (
    <div
      className={`flex flex-col justify-center bg-[var(--background)] px-4 py-4 md:px-5 ${
        highlight ? "bg-[color-mix(in_oklab,var(--blue)_6%,var(--background))]" : ""
      }`}
    >
      <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {label}
      </span>
      <div className="mt-1 flex items-center gap-1.5">
        {Icon && <Icon className="h-4 w-4 shrink-0" style={{ color: toneColor }} strokeWidth={2.5} />}
        <span
          className={`font-display font-bold tabular-nums tracking-tight ${
            large ? "text-2xl" : "text-xl"
          }`}
          style={{ color: tone ? toneColor : undefined }}
        >
          {value}
        </span>
      </div>
      {sub && <p className="mt-1 text-[10px] leading-snug text-[var(--text-muted)]">{sub}</p>}
    </div>
  );
}
