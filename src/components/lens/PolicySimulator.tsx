import { useCallback, useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  WEIGHTS,
  calcHealthScore,
  calcIndices,
  getLensParishForSimulator,
  getSimulatedRank,
  type SimulatorIndices,
} from "@/lib/simulator";

interface Props {
  parishId: string;
}

type IndexKey = keyof typeof WEIGHTS;

const INDEX_ROWS: { key: IndexKey; label: string; weightPct: number }[] = [
  { key: "academic", label: "Academic", weightPct: 22 },
  { key: "equity", label: "Equity", weightPct: 20 },
  { key: "workforce_alignment", label: "Workforce", weightPct: 18 },
  { key: "educator_capacity", label: "Educator", weightPct: 18 },
  { key: "opportunity", label: "Opportunity", weightPct: 12 },
  { key: "graduation", label: "Graduation", weightPct: 10 },
];

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function deltaClass(delta: number): string {
  if (delta > 0) return "text-[var(--sev-green)]";
  if (delta < 0) return "text-[var(--sev-red)]";
  return "text-[var(--text-muted)]";
}

function formatDelta(delta: number, decimals = 1): string {
  if (delta === 0) return "0";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(decimals)}`;
}

interface SliderConfig {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  baseline: number;
  onChange: (v: number) => void;
  indexKey: IndexKey;
  directionNote: string;
  accent: string;
  formatValue?: (v: number) => string;
}

function SliderRow({
  config,
  baseIndex,
  simIndex,
}: {
  config: SliderConfig;
  baseIndex: number;
  simIndex: number;
}) {
  const idxDelta = simIndex - baseIndex;

  return (
    <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[13px] font-semibold text-foreground">{config.label}</p>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{config.directionNote}</p>
        </div>
        <p className="font-mono text-[12px] tabular-nums text-[var(--text-secondary)]">
          {config.formatValue ? config.formatValue(config.baseline) : config.baseline}
          {" → "}
          <span style={{ color: config.accent }}>
            {config.formatValue ? config.formatValue(config.value) : config.value}
          </span>
        </p>
      </div>
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={config.value}
        onChange={(e) => config.onChange(Number(e.target.value))}
        className="policy-sim-slider mt-3 w-full"
        style={{ accentColor: config.accent }}
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="text-[var(--text-muted)]">
          Index: {baseIndex.toFixed(1)} → {simIndex.toFixed(1)}{" "}
          <span className={deltaClass(idxDelta)}>({formatDelta(idxDelta)})</span>
        </span>
        <span className="text-[var(--text-muted)]">
          Weight {(WEIGHTS[config.indexKey] * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

function readBaseline(sig: Record<string, number | string | null | undefined>) {
  const num = (k: string, fallback: number) => {
    const v = sig[k];
    return typeof v === "number" && !Number.isNaN(v) ? v : fallback;
  };
  return {
    gradRate: num("grad_rate_parish_mean", 82.7),
    povertyRate: num("poverty_rate", 19.5),
    unemployment:
      num("unemployment_rate_bls", NaN) ||
      num("unemployment_rate", 4.3),
    sps: num("avg_sps_2025", 76.2),
    aShare: num("pct_a_schools_shrunk", 17.25),
    income: num("median_household_income", 45562),
    bachelors: num("pct_bachelors_or_higher", 13.9),
    spedGap:
      typeof sig.sped_teacher_gap_pct === "number" ? sig.sped_teacher_gap_pct : null,
  };
}

function interpretation(
  parishName: string,
  scoreDelta: number,
  baseRank: number,
  simRank: number,
): string {
  if (scoreDelta > 15) {
    return `These changes would move ${parishName} from rank ${ordinal(baseRank)} to approximately rank ${ordinal(simRank)} — a significant improvement into the top half of Louisiana parishes.`;
  }
  if (scoreDelta > 5) {
    return `These adjustments would lift ${parishName}'s Health Score by ${scoreDelta} points — moving from rank ${ordinal(baseRank)} to ${ordinal(simRank)} among Louisiana's 64 parishes.`;
  }
  if (scoreDelta > 0) {
    return `Modest improvement of ${scoreDelta} points. ${parishName} would move from rank ${ordinal(baseRank)} to ${ordinal(simRank)}.`;
  }
  if (scoreDelta === 0) {
    return "No change from current baseline. Adjust sliders to model improvements.";
  }
  return `These conditions would lower the Health Score by ${Math.abs(scoreDelta)} points — a useful stress test showing how outcomes deteriorate under pressure.`;
}

export function PolicySimulator({ parishId }: Props) {
  const lensParish = getLensParishForSimulator(parishId);
  const sig = lensParish?.signals ?? {};
  const baseline = useMemo(() => readBaseline(sig), [sig]);

  const baseIndices = (lensParish?.indices ?? {}) as SimulatorIndices;
  const baseScore = lensParish?.health_score ?? 0;
  const parishName = lensParish?.name ?? parishId;

  const [gradRate, setGradRate] = useState(baseline.gradRate);
  const [povertyRate, setPovertyRate] = useState(baseline.povertyRate);
  const [unemployment, setUnemployment] = useState(baseline.unemployment);
  const [sps, setSps] = useState(baseline.sps);
  const [aShare, setAShare] = useState(baseline.aShare);
  const [income, setIncome] = useState(baseline.income);

  const reset = useCallback(() => {
    setGradRate(baseline.gradRate);
    setPovertyRate(baseline.povertyRate);
    setUnemployment(baseline.unemployment);
    setSps(baseline.sps);
    setAShare(baseline.aShare);
    setIncome(baseline.income);
  }, [baseline]);

  useEffect(() => {
    reset();
  }, [parishId, reset]);

  const simSignals = useMemo(
    () => ({
      avg_sps_2025: sps,
      poverty_rate: povertyRate,
      unemployment_rate: unemployment,
      pct_a_schools_shrunk: aShare,
      median_household_income: income,
      pct_bachelors_or_higher: baseline.bachelors,
      grad_rate_parish_mean: gradRate,
    }),
    [sps, povertyRate, unemployment, aShare, income, baseline.bachelors, gradRate],
  );

  const simIndices = useMemo(() => calcIndices(simSignals), [simSignals]);
  const simScore = useMemo(() => calcHealthScore(simIndices), [simIndices]);
  const scoreDelta = simScore - baseScore;
  const simRank = getSimulatedRank(parishId, simScore);
  const baseRank = getSimulatedRank(parishId, baseScore);

  const baseIndicesResolved: SimulatorIndices = useMemo(
    () => ({
      academic: baseIndices.academic ?? simIndices.academic,
      equity: baseIndices.equity ?? simIndices.equity,
      workforce_alignment: baseIndices.workforce_alignment ?? simIndices.workforce_alignment,
      educator_capacity: baseIndices.educator_capacity ?? simIndices.educator_capacity,
      opportunity: baseIndices.opportunity ?? simIndices.opportunity,
      graduation: baseIndices.graduation ?? simIndices.graduation,
    }),
    [baseIndices, simIndices],
  );

  if (!lensParish) {
    return (
      <p className="text-[13px] text-[var(--text-muted)]">
        No LENS data available for this parish.
      </p>
    );
  }

  const sliders: SliderConfig[] = [
    {
      label: "Graduation Rate",
      min: 70,
      max: 99,
      step: 0.1,
      value: gradRate,
      baseline: baseline.gradRate,
      onChange: setGradRate,
      indexKey: "graduation",
      directionNote: "Higher = better",
      accent: "var(--sev-green)",
    },
    {
      label: "Family Poverty Rate",
      min: 5,
      max: 30,
      step: 0.1,
      value: povertyRate,
      baseline: baseline.povertyRate,
      onChange: setPovertyRate,
      indexKey: "equity",
      directionNote: "Lower = better",
      accent: "var(--sev-red)",
    },
    {
      label: "Unemployment Rate",
      min: 2,
      max: 10,
      step: 0.1,
      value: unemployment,
      baseline: baseline.unemployment,
      onChange: setUnemployment,
      indexKey: "workforce_alignment",
      directionNote: "Lower = better",
      accent: "var(--sev-orange)",
    },
    {
      label: "Avg School Performance Score",
      min: 60,
      max: 95,
      step: 0.1,
      value: sps,
      baseline: baseline.sps,
      onChange: setSps,
      indexKey: "academic",
      directionNote: "Higher = better",
      accent: "var(--blue)",
    },
    {
      label: "Share of A-Rated Schools",
      min: 5,
      max: 60,
      step: 0.1,
      value: aShare,
      baseline: baseline.aShare,
      onChange: setAShare,
      indexKey: "educator_capacity",
      directionNote: "Higher = better",
      accent: "var(--blue)",
    },
    {
      label: "Median Household Income",
      min: 30000,
      max: 100000,
      step: 500,
      value: income,
      baseline: baseline.income,
      onChange: setIncome,
      indexKey: "opportunity",
      directionNote: "Higher = better",
      accent: "var(--sev-green)",
      formatValue: (v) => `$${Math.round(v).toLocaleString()}`,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-[var(--surface-elevated)] shadow-card">
      <div
        className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
        style={{ background: "var(--ink)", color: "var(--primary-foreground)" }}
      >
        <div>
          <h3 className="text-[15px] font-bold tracking-tight">
            LENS Policy Simulator · {parishName}
          </h3>
          <p className="mt-0.5 text-[12px] opacity-80">
            Adjust signals to see live score changes
          </p>
          <span className="mt-2 inline-block rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] opacity-90">
            Based on real LDOE/ACS/BLS data
          </span>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-white/20"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to current
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          {sliders.map((config) => (
            <SliderRow
              key={config.label}
              config={config}
              baseIndex={baseIndicesResolved[config.indexKey]}
              simIndex={simIndices[config.indexKey]}
            />
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-[var(--surface-elevated)] p-5 shadow-card">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Current
                </p>
                <p className="mt-1 font-display text-[32px] font-bold tabular-nums text-foreground">
                  {baseScore}
                  <span className="text-[16px] font-semibold text-[var(--text-muted)]">/100</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Simulated
                </p>
                <p
                  className="mt-1 font-display text-[32px] font-bold tabular-nums transition-all duration-300"
                  style={{ color: scoreDelta >= 0 ? "var(--sev-green)" : "var(--sev-red)" }}
                >
                  {simScore}
                  <span className="text-[16px] font-semibold text-[var(--text-muted)]">/100</span>
                </p>
              </div>
            </div>
            <p className={`mt-4 text-center text-[14px] font-semibold ${deltaClass(scoreDelta)}`}>
              CHANGE: {scoreDelta > 0 ? "+" : ""}
              {scoreDelta} pts
            </p>
            <div className="mt-4 border-t border-border pt-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Rank
              </p>
              <p className="mt-1 font-mono text-[15px] font-semibold tabular-nums text-foreground">
                {ordinal(baseRank)} → {ordinal(simRank)}
                <span className="text-[12px] font-normal text-[var(--text-muted)]"> of 64</span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Index breakdown
            </p>
            <ul className="space-y-2">
              {INDEX_ROWS.map(({ key, label, weightPct }) => {
                const base = baseIndicesResolved[key];
                const sim = simIndices[key];
                const d = sim - base;
                return (
                  <li
                    key={key}
                    className="flex items-center justify-between gap-2 text-[12px]"
                  >
                    <span className="text-[var(--text-secondary)]">
                      {label}{" "}
                      <span className="text-[var(--text-muted)]">({weightPct}%)</span>
                    </span>
                    <span className="font-mono tabular-nums">
                      {base.toFixed(1)} → {sim.toFixed(1)}{" "}
                      <span className={deltaClass(d)}>({formatDelta(d)})</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {interpretation(parishName, scoreDelta, baseRank, simRank)}
          </p>

          {baseline.spedGap != null && (
            <div
              className="rounded-lg border px-3 py-2.5 text-[11px] leading-relaxed"
              style={{
                borderColor: "color-mix(in oklab, var(--sev-orange) 40%, transparent)",
                backgroundColor: "color-mix(in oklab, var(--sev-orange) 8%, transparent)",
                color: "var(--text-secondary)",
              }}
            >
              <strong className="text-foreground">Note:</strong> SpEd teacher certification gap (
              {baseline.spedGap}%) is shown for policy context but is not yet wired into the Health
              Score formula. It will be added in version 2.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
