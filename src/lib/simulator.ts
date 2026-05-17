import lensData from "../../public/data/lens.json";

type LensParish = {
  name: string;
  name_slug: string;
  health_score: number;
  indices: Record<string, number>;
  signals: Record<string, number | string | null | undefined>;
};

type LensMeta = {
  scaling: Record<string, { q05: number; q95: number }>;
};

const lens = lensData as { meta: LensMeta; parishes: LensParish[] };

/** Exact weights from lens.json meta */
export const WEIGHTS = {
  academic: 0.22,
  equity: 0.2,
  workforce_alignment: 0.18,
  educator_capacity: 0.18,
  opportunity: 0.12,
  graduation: 0.1,
} as const;

/** Exact scaling from lens.json meta.scaling */
export const SCALING = lens.meta.scaling;

export type SimulatorSignals = {
  avg_sps_2025: number;
  poverty_rate: number;
  unemployment_rate: number;
  pct_a_schools_shrunk: number;
  median_household_income: number;
  pct_bachelors_or_higher: number;
  grad_rate_parish_mean: number;
};

export type SimulatorIndices = {
  academic: number;
  equity: number;
  workforce_alignment: number;
  educator_capacity: number;
  opportunity: number;
  graduation: number;
};

/** Scale a raw signal to 0–100 using statewide quantiles */
export function scaleQuantile(
  value: number | null | undefined,
  q05: number,
  q95: number,
  invert = false,
): number {
  if (value == null || Number.isNaN(value) || q95 === q05) return 50;
  const t = Math.max(0, Math.min(100, ((value - q05) / (q95 - q05)) * 100));
  return Math.round(invert ? 100 - t : t);
}

/** Calculate all six pillar indices from raw signals */
export function calcIndices(signals: SimulatorSignals): SimulatorIndices {
  const s = SCALING;
  const oppInc = scaleQuantile(
    signals.median_household_income,
    s.median_household_income.q05,
    s.median_household_income.q95,
  );
  const oppEdu = scaleQuantile(
    signals.pct_bachelors_or_higher,
    s.pct_bachelors_or_higher.q05,
    s.pct_bachelors_or_higher.q95,
  );
  return {
    academic: scaleQuantile(signals.avg_sps_2025, s.avg_sps.q05, s.avg_sps.q95),
    equity: scaleQuantile(signals.poverty_rate, s.poverty_rate.q05, s.poverty_rate.q95, true),
    workforce_alignment: scaleQuantile(
      signals.unemployment_rate,
      s.unemployment_combined.q05,
      s.unemployment_combined.q95,
      true,
    ),
    educator_capacity: scaleQuantile(
      signals.pct_a_schools_shrunk,
      s.pct_a_schools_shrunk.q05,
      s.pct_a_schools_shrunk.q95,
    ),
    opportunity: Math.round((oppInc + oppEdu) / 2),
    graduation: scaleQuantile(
      signals.grad_rate_parish_mean,
      s.grad_rate.q05,
      s.grad_rate.q95,
    ),
  };
}

/** Calculate health score from indices */
export function calcHealthScore(indices: SimulatorIndices): number {
  return Math.round(
    indices.academic * WEIGHTS.academic +
      indices.equity * WEIGHTS.equity +
      indices.workforce_alignment * WEIGHTS.workforce_alignment +
      indices.educator_capacity * WEIGHTS.educator_capacity +
      indices.opportunity * WEIGHTS.opportunity +
      indices.graduation * WEIGHTS.graduation,
  );
}

/** Parish rank among 64 by health score (1 = best) */
export function getSimulatedRank(parishId: string, simulatedScore: number): number {
  const rows = lens.parishes.map((p) => ({
    isTarget: p.name_slug === parishId,
    score: p.name_slug === parishId ? simulatedScore : p.health_score,
  }));
  const sorted = [...rows].sort((a, b) => b.score - a.score);
  const idx = sorted.findIndex((r) => r.isTarget);
  return idx >= 0 ? idx + 1 : 64;
}

export function getLensParishForSimulator(parishId: string) {
  return lens.parishes.find((p) => p.name_slug === parishId);
}
