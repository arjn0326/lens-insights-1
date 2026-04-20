import {
  ALERT_EXPLANATIONS,
  INDEX_LABELS,
  PARISHES,
  SEV_COLOR,
  interventionRecommendation,
  severity,
  severityLabel,
} from "@/lib/lens-data";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Lightbulb, Minus, TriangleAlert } from "lucide-react";

interface Props {
  parishId: string;
  onBack: () => void;
}

export function ParishDetail({ parishId, onBack }: Props) {
  const parish = PARISHES.find((p) => p.id === parishId);
  if (!parish) return null;

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

  return (
    <div className="flex h-full flex-col">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 border-b border-border px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to rankings
      </button>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-[20px] font-bold leading-tight text-foreground">
              {parish.name}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
              <span className="font-mono">{parish.population.toLocaleString()} pop</span>
              <span style={{ color: trendColor }} className="inline-flex items-center gap-0.5">
                <TrendIcon className="h-3 w-3" />
                {parish.trend === "flat" ? "stable" : parish.trend}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-mono text-[32px] font-bold leading-none" style={{ color: healthColor }}>
              {parish.scores.Health}
            </span>
            <span
              className="mt-1 rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
              style={{ background: `${healthColor}22`, color: healthColor }}
            >
              {healthLabel}
            </span>
          </div>
        </div>

        {/* Composite indices */}
        <div className="border-b border-border px-4 py-4">
          <div className="mb-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Composite Indices
          </div>
          <div className="flex flex-col gap-2.5">
            {INDEX_LABELS.map(({ key, label }) => {
              const score = parish.scores[key];
              const sev = severity(key, score);
              const color = SEV_COLOR[sev];
              return (
                <div key={key}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-secondary)]">{label}</span>
                    <span className="font-mono text-[12px] font-bold" style={{ color }}>
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

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-2 border-b border-border px-4 py-4">
          <MiniStat label="Students" value={parish.students.toLocaleString()} />
          <MiniStat label="D/F Schools" value={String(parish.dfSchools)} tone="danger" />
        </div>

        {/* Alert */}
        {parish.alert && (
          <div className="border-b border-border px-4 py-4">
            <div
              className="rounded-md border p-3"
              style={{
                background: "var(--sev-red)/10",
                backgroundColor: "color-mix(in oklab, var(--sev-red) 10%, transparent)",
                borderColor: "color-mix(in oklab, var(--sev-red) 35%, transparent)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <TriangleAlert className="h-3.5 w-3.5" style={{ color: "var(--sev-red)" }} />
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

        {/* Recommendation */}
        <div className="px-4 py-4">
          <div
            className="rounded-md border p-3"
            style={{
              backgroundColor: "color-mix(in oklab, var(--blue) 10%, transparent)",
              borderColor: "color-mix(in oklab, var(--blue) 35%, transparent)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" style={{ color: "var(--cyan)" }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cyan)]">
                Recommendation · {parish.intervention}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
              {interventionRecommendation(parish.intervention)}
            </p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-2 border-t border-border bg-[var(--surface)] p-4">
        <button className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-brand px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-glow transition-transform hover:scale-[1.01]">
          Generate Funder Brief <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button className="rounded-md border border-border bg-transparent px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] transition-colors hover:border-[var(--cyan)]/40 hover:text-foreground">
          Open in Simulator
        </button>
        <button className="rounded-md border border-border bg-transparent px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] transition-colors hover:border-[var(--cyan)]/40 hover:text-foreground">
          View School-Level Detail
        </button>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "danger";
}) {
  const color = tone === "danger" ? "var(--sev-red)" : "var(--foreground)";
  return (
    <div className="rounded-md border border-border bg-[var(--background)] p-2.5">
      <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </div>
      <div className="mt-1 font-mono text-[18px] font-bold leading-none" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
