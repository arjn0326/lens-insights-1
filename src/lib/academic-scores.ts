import actData from "../../public/data/act_scores.json";
import leapData from "../../public/data/leap_scores.json";

export const ACADEMIC_YEARS = ["2021", "2022", "2023", "2024", "2025"] as const;

export type YearKey = (typeof ACADEMIC_YEARS)[number];

export interface ActParishRecord {
  code: string;
  name: string;
  scores: Partial<Record<YearKey, number | null>>;
  overallAvg: number | null;
}

export interface LeapParishRecord {
  code: string;
  name: string;
  proficiency38: Partial<Record<YearKey, number | null>>;
  proficiency312: Partial<Record<YearKey, number | null>>;
  proficiency38Avg: number | null;
  proficiency312Avg: number | null;
}

export interface ActDataset {
  state: ActParishRecord;
  bySlug: Record<string, ActParishRecord>;
}

export interface LeapDataset {
  state: {
    code: string;
    name: string;
    proficiency38: Partial<Record<YearKey, number | null>>;
    proficiency312: Partial<Record<YearKey, number | null>>;
    proficiency38Avg: number | null;
    proficiency312Avg: number | null;
  };
  bySlug: Record<string, LeapParishRecord>;
}

export const actScores = actData as ActDataset;
export const leapScores = leapData as LeapDataset;

export function getActParish(slug: string): ActParishRecord | undefined {
  return actScores.bySlug[slug];
}

export function getLeapParish(slug: string): LeapParishRecord | undefined {
  return leapScores.bySlug[slug];
}

export function isValidScore(v: number | null | undefined): v is number {
  return v != null && !Number.isNaN(v);
}

/** Build merged chart rows; omit year if both series lack a value. */
export function buildComparisonChartData(
  parishSeries: Partial<Record<YearKey, number | null | undefined>>,
  stateSeries: Partial<Record<YearKey, number | null | undefined>>,
) {
  return ACADEMIC_YEARS.map((year) => {
    const parish = parishSeries[year];
    const state = stateSeries[year];
    if (!isValidScore(parish) && !isValidScore(state)) return null;
    const row: { year: string; parish?: number; state?: number } = { year };
    if (isValidScore(parish)) row.parish = parish;
    if (isValidScore(state)) row.state = state;
    return row;
  }).filter((row): row is { year: string; parish?: number; state?: number } => row != null);
}

export function buildSingleSeriesChartData(
  series: Partial<Record<YearKey, number | null | undefined>>,
) {
  return ACADEMIC_YEARS.map((year) => {
    const value = series[year];
    if (!isValidScore(value)) return null;
    return { year, value };
  }).filter((row): row is { year: string; value: number } => row != null);
}

export function formatSigned(value: number, decimals = 1, suffix = ""): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}${suffix}`;
}

export function fiveYearChange(
  series: Partial<Record<YearKey, number | null | undefined>>,
): number | null {
  const start = series["2021"];
  const end = series["2025"];
  if (!isValidScore(start) || !isValidScore(end)) return null;
  return end - start;
}

export function vsStateDiff(
  parishVal: number | null | undefined,
  stateVal: number | null | undefined,
): number | null {
  if (!isValidScore(parishVal) || !isValidScore(stateVal)) return null;
  return parishVal - stateVal;
}

export type LeapTier = "green" | "yellow" | "red";

export function leapTier(value: number | null | undefined): LeapTier | null {
  if (!isValidScore(value)) return null;
  if (value >= 40) return "green";
  if (value >= 25) return "yellow";
  return "red";
}

export const LEAP_TIER_STYLES: Record<LeapTier, { bg: string; text: string }> = {
  green: {
    bg: "color-mix(in oklab, var(--sev-green) 18%, transparent)",
    text: "var(--sev-green)",
  },
  yellow: {
    bg: "color-mix(in oklab, var(--sev-yellow) 22%, transparent)",
    text: "var(--sev-orange)",
  },
  red: {
    bg: "color-mix(in oklab, var(--sev-red) 14%, transparent)",
    text: "var(--sev-red)",
  },
};

export interface ParishRankingRow {
  rank: number;
  slug: string;
  name: string;
  leapAvg: number | null;
  actAvg: number | null;
  leap2025: number | null;
  act2025: number | null;
}

export function buildParishRankings(): ParishRankingRow[] {
  const slugs = new Set([
    ...Object.keys(actScores.bySlug),
    ...Object.keys(leapScores.bySlug),
  ]);

  const rows: Omit<ParishRankingRow, "rank">[] = [...slugs].map((slug) => {
    const act = actScores.bySlug[slug];
    const leap = leapScores.bySlug[slug];
    return {
      slug,
      name: act?.name ?? leap?.name ?? slug,
      leapAvg: leap?.proficiency312Avg ?? null,
      actAvg: act?.overallAvg ?? null,
      leap2025: leap?.proficiency312?.["2025"] ?? null,
      act2025: act?.scores?.["2025"] ?? null,
    };
  });

  rows.sort((a, b) => {
    const av = a.leapAvg ?? -1;
    const bv = b.leapAvg ?? -1;
    return bv - av;
  });

  return rows.map((row, i) => ({ ...row, rank: i + 1 }));
}
