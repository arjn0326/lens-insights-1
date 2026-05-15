import collegeData from "../../public/data/college_enrollment.json";
import { formatSigned, isValidScore } from "@/lib/academic-scores";

export const COLLEGE_YEARS = ["2020", "2021", "2022", "2023", "2024"] as const;
export type CollegeYearKey = (typeof COLLEGE_YEARS)[number];

export interface CollegeParishRecord {
  code: string;
  name: string;
  rates: Partial<Record<CollegeYearKey, number | null>>;
  avgRate: number | null;
}

export interface CollegeDataset {
  state: CollegeParishRecord;
  bySlug: Record<string, CollegeParishRecord>;
}

export const collegeEnrollment = collegeData as CollegeDataset;

export function getCollegeParish(slug: string): CollegeParishRecord | undefined {
  return collegeEnrollment.bySlug[slug];
}

export function buildCollegeComparisonChartData(
  parishSeries: Partial<Record<CollegeYearKey, number | null | undefined>>,
  stateSeries: Partial<Record<CollegeYearKey, number | null | undefined>>,
) {
  return COLLEGE_YEARS.map((year) => {
    const parish = parishSeries[year];
    const state = stateSeries[year];
    if (!isValidScore(parish) && !isValidScore(state)) return null;
    const row: { year: string; parish?: number; state?: number } = { year };
    if (isValidScore(parish)) row.parish = parish;
    if (isValidScore(state)) row.state = state;
    return row;
  }).filter((row): row is { year: string; parish?: number; state?: number } => row != null);
}

export function buildCollegeSingleSeriesChartData(
  series: Partial<Record<CollegeYearKey, number | null | undefined>>,
) {
  return COLLEGE_YEARS.map((year) => {
    const value = series[year];
    if (!isValidScore(value)) return null;
    return { year, value };
  }).filter((row): row is { year: string; value: number } => row != null);
}

export function collegeFiveYearChange(
  series: Partial<Record<CollegeYearKey, number | null | undefined>>,
): number | null {
  const start = series["2020"];
  const end = series["2024"];
  if (!isValidScore(start) || !isValidScore(end)) return null;
  return end - start;
}

export function collegeVsStateDiff(
  parishVal: number | null | undefined,
  stateVal: number | null | undefined,
): number | null {
  if (!isValidScore(parishVal) || !isValidScore(stateVal)) return null;
  return parishVal - stateVal;
}

export { formatSigned, isValidScore };
