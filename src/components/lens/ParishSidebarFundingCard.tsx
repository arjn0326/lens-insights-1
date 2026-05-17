import {
  FUNDING_BY_PARISH,
  formatFundingDollars,
  formatFundingPct,
  getParishFunding,
} from "@/lib/funding-by-parish";
import { TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  parishSlug: string;
}

export function ParishSidebarFundingCard({ parishSlug }: Props) {
  const record = getParishFunding(parishSlug);
  if (!record) return null;

  const isAbove = record.vs_state_avg_dollars > 0;
  const isBelow = record.vs_state_avg_dollars < 0;
  const accent = isAbove ? "var(--sev-orange)" : isBelow ? "var(--sev-green)" : "var(--blue)";
  const TrendIcon = isAbove ? TrendingUp : isBelow ? TrendingDown : null;

  return (
    <div className="border-b border-border px-4 py-4">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        Louisiana Treasurer · Per pupil expenditure
      </p>
      <div className="mt-2 flex items-end gap-2">
        <span className="font-display text-[28px] font-bold leading-none tabular-nums text-foreground">
          {formatFundingDollars(record.spend_per_pupil)}
        </span>
        <span className="mb-1 text-[10px] text-[var(--text-muted)]">per pupil</span>
      </div>
      <p className="mt-1.5 text-[10px] text-[var(--text-secondary)]">
        State avg {formatFundingDollars(FUNDING_BY_PARISH.meta.state_avg_per_pupil)}
      </p>
      <div
        className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-border bg-[var(--background)] p-2.5"
        style={{ borderTopWidth: 3, borderTopColor: accent }}
      >
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            vs state ($)
          </p>
          <p
            className="mt-0.5 flex items-center gap-1 font-mono text-[13px] font-bold tabular-nums"
            style={{ color: accent }}
          >
            {TrendIcon && <TrendIcon className="h-3 w-3" strokeWidth={2.5} />}
            {formatFundingDollars(record.vs_state_avg_dollars, true)}
          </p>
        </div>
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            vs state (%)
          </p>
          <p className="mt-0.5 font-mono text-[13px] font-bold tabular-nums" style={{ color: accent }}>
            {formatFundingPct(record.vs_state_avg_pct)}
          </p>
        </div>
        <div className="col-span-2 border-t border-border/80 pt-2">
          <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Rank
          </p>
          <p className="mt-0.5 font-display text-[15px] font-bold tabular-nums text-foreground">
            #{record.rank}{" "}
            <span className="text-[10px] font-normal text-[var(--text-muted)]">
              of {FUNDING_BY_PARISH.meta.parish_count} parishes
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
