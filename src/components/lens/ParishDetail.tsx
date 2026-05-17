import {
  ALERT_EXPLANATIONS,
  INDEX_LABELS,
  LAYER_INFO,
  PARISHES,
  SEV_COLOR,
  interventionRecommendation,
  severity,
  severityLabel,
} from "@/lib/lens-data";
import { getMfpParish } from "@/lib/mfp-by-parish";
import {
  formatParishSchools,
  formatParishStudents,
  getParishRealStats,
} from "@/lib/parish-stats";
import { ArrowDown, ArrowRight, ArrowUp, Lightbulb, Minus, TriangleAlert } from "lucide-react";
import { InfoTip } from "@/components/lens/InfoTip";
import { ParishSidebarFundingCard } from "@/components/lens/ParishSidebarFundingCard";
import { FunderBriefButton } from "@/components/lens/FunderBriefButton";
import { Link } from "@tanstack/react-router";

interface Props {
  parishId: string;
}

function mfpEdColor(pct: number): string {
  if (pct > 70) return "var(--sev-red)";
  if (pct >= 50) return "var(--sev-orange)";
  return "var(--sev-green)";
}

export function ParishDetail({ parishId }: Props) {
  const parish = PARISHES.find((p) => p.id === parishId);
  if (!parish) return null;

  const real = getParishRealStats(parishId);
  const mfp = getMfpParish(parishId);

  const healthSev = severity("Health", parish.scores.Health);
  const healthColor = SEV_COLOR[healthSev];
  const healthLabel = severityLabel("Health", parish.scores.Health);
  const dfPct = ((parish.dfSchools / parish.totalSchools) * 100).toFixed(0);

  const TrendIcon = parish.trend === "up" ? ArrowUp : parish.trend === "down" ? ArrowDown : Minus;
  const trendColor =
    parish.trend === "up"
      ? "var(--sev-green)"
      : parish.trend === "down"
        ? "var(--sev-red)"
        : "var(--text-muted)";

  return (
    <div className="flex h-full flex-col">
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <header className="border-b border-border px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate font-display text-[22px] font-bold leading-tight tracking-tight text-foreground">
                {parish.name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[var(--text-secondary)]">
                <span className="font-mono tabular-nums">{formatParishStudents(real)} students</span>
                <span style={{ color: trendColor }} className="inline-flex items-center gap-0.5">
                  <TrendIcon className="h-3 w-3" />
                  {parish.trend === "flat" ? "stable" : parish.trend}
                </span>
              </div>
              {real.enrollmentSourceDate && (
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                  LDOE enrollment · {real.enrollmentSourceDate}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end">
              <span
                className="font-display text-[34px] font-bold leading-none tabular-nums"
                style={{ color: healthColor }}
              >
                {parish.scores.Health}
              </span>
              <span
                className="mt-1 rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                style={{
                  background: `color-mix(in oklab, ${healthColor} 14%, transparent)`,
                  color: healthColor,
                }}
              >
                {healthLabel}
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-2 border-b border-border px-4 py-4">
          <MiniStat label="Schools" value={formatParishSchools(real)} />
          <MiniStat
            label="Students"
            value={formatParishStudents(real)}
            sub={real.enrollmentSourceDate ? "LDOE" : undefined}
          />
          <MiniStat label="D/F Schools" value={`${parish.dfSchools}`} sub={`${dfPct}%`} tone="danger" />
        </div>

        <ParishSidebarFundingCard parishSlug={parishId} />

        {mfp && (
          <div className="border-b border-border px-4 py-4">
            <div className="mb-2 flex items-center gap-1">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                MFP weighted populations · FY2025-26
              </p>
              <InfoTip
                text="Share of MFP-funded membership in each weighted category. Percentages overlap — students may qualify for more than one."
                size={10}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MfpPill label="ED" pct={mfp.ed.pct} color={mfpEdColor(mfp.ed.pct)} />
              <MfpPill label="CTE" pct={mfp.cte.pct} color="var(--blue)" />
              <MfpPill label="SWD" pct={mfp.swd.pct} color="var(--sev-orange)" />
              <MfpPill label="MFP total" pct={100} color="var(--text-muted)" value={mfp.total_students.toLocaleString()} />
            </div>
          </div>
        )}

        <div className="border-b border-border px-4 py-4">
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Composite indices
          </p>
          <div className="flex flex-col gap-2.5">
            {INDEX_LABELS.map(({ key, label }) => {
              const score = parish.scores[key];
              const sev = severity(key, score);
              const color = SEV_COLOR[sev];
              return (
                <div key={key}>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                      {label}
                      <InfoTip text={LAYER_INFO[key]} size={10} />
                    </span>
                    <span className="font-mono text-[12px] font-bold tabular-nums" style={{ color }}>
                      {score}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${score}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {parish.alert && (
          <div className="border-b border-border px-4 py-4">
            <div
              className="rounded-lg border p-3"
              style={{
                backgroundColor: "color-mix(in oklab, var(--sev-red) 8%, transparent)",
                borderColor: "color-mix(in oklab, var(--sev-red) 30%, transparent)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--sev-red)" }} />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: "var(--sev-red)" }}
                >
                  {parish.alert}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                {ALERT_EXPLANATIONS[parish.alert]}
              </p>
            </div>
          </div>
        )}

        <div className="px-4 py-4">
          <div
            className="rounded-lg border p-3"
            style={{
              backgroundColor: "color-mix(in oklab, var(--blue) 8%, transparent)",
              borderColor: "color-mix(in oklab, var(--blue) 28%, transparent)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--blue)" }} />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: "var(--blue)" }}
              >
                Recommendation · {parish.intervention}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
              {interventionRecommendation(parish.intervention)}
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-[var(--surface)] p-4">
        <Link
          to="/parish/$parishId"
          params={{ parishId: parish.id }}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--background)] shadow-[0_4px_14px_color-mix(in_oklab,var(--foreground)_25%,transparent)] transition-all hover:brightness-110 active:scale-[0.99]"
        >
          See full report
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <FunderBriefButton parishId={parish.id} />
        <p className="mt-2 text-center text-[9px] leading-relaxed text-[var(--text-muted)]">
          Enrollment, MFP funding, academics, and workforce — full parish dossier
        </p>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "danger";
}) {
  const color = tone === "danger" ? "var(--sev-red)" : "var(--foreground)";
  return (
    <div className="rounded-md border border-border bg-[var(--background)] p-2.5">
      <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </div>
      <div className="mt-1 font-display text-[18px] font-bold leading-none tabular-nums" style={{ color }}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[9px] text-[var(--text-muted)]">{sub}</div>}
    </div>
  );
}

function MfpPill({
  label,
  pct,
  color,
  value,
}: {
  label: string;
  pct: number;
  color: string;
  value?: string;
}) {
  return (
    <div
      className="rounded-md border border-border bg-[var(--background)] px-2.5 py-2"
      style={{ borderTopWidth: 3, borderTopColor: color }}
    >
      <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-0.5 font-display text-[16px] font-bold tabular-nums" style={{ color }}>
        {value ?? `${pct}%`}
      </p>
    </div>
  );
}
