import salaryData from "../../public/data/teacher_salary.json";
import { isValidScore } from "@/lib/academic-scores";

export const TEACHER_SALARY_YEARS = ["2021", "2022", "2023", "2024", "2025"] as const;
export type TeacherSalaryYearKey = (typeof TEACHER_SALARY_YEARS)[number];

export type TeacherSalarySeries = Partial<Record<TeacherSalaryYearKey, number | null>>;

export interface TeacherSalaryParishRecord {
  code: string;
  name: string;
  salaries: TeacherSalarySeries;
  salaryAvg: number | null;
}

export interface TeacherSalaryDataset {
  state: TeacherSalaryParishRecord;
  bySlug: Record<string, TeacherSalaryParishRecord>;
}

export const teacherSalary = salaryData as TeacherSalaryDataset;

export const SALARY_TIER_THRESHOLD = 3000;

export const SALARY_TIER_COLORS = {
  above: "var(--sev-green)",
  near: "var(--sev-orange)",
  below: "var(--sev-red)",
} as const;

export function formatDollars(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function formatSignedDollars(diff: number): string {
  const sign = diff >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(Math.round(diff)).toLocaleString("en-US")}`;
}

export function getTeacherSalaryParish(slug: string): TeacherSalaryParishRecord | undefined {
  return teacherSalary.bySlug[slug];
}

export function salaryTier(
  parishSalary: number,
  stateSalary: number,
): keyof typeof SALARY_TIER_COLORS {
  const diff = parishSalary - stateSalary;
  if (diff > SALARY_TIER_THRESHOLD) return "above";
  if (diff < -SALARY_TIER_THRESHOLD) return "below";
  return "near";
}

export function salaryTierColor(parishSalary: number, stateSalary: number): string {
  return SALARY_TIER_COLORS[salaryTier(parishSalary, stateSalary)];
}

export type SalaryComparisonChartRow = {
  year: string;
  parish?: number;
  state?: number;
};

export function buildSalaryComparisonChartData(
  parishSeries: TeacherSalarySeries,
  stateSeries: TeacherSalarySeries,
): SalaryComparisonChartRow[] {
  return TEACHER_SALARY_YEARS.map((year) => {
    const parish = parishSeries[year];
    const state = stateSeries[year];
    if (!isValidScore(parish) && !isValidScore(state)) return null;
    const row: SalaryComparisonChartRow = { year };
    if (isValidScore(parish)) row.parish = parish;
    if (isValidScore(state)) row.state = state;
    return row;
  }).filter((row): row is SalaryComparisonChartRow => row != null);
}

export function salaryYAxisDomain(
  rows: SalaryComparisonChartRow[],
): [number, number] | ["auto", "auto"] {
  const values = rows.flatMap((r) =>
    [r.parish, r.state].filter((v): v is number => isValidScore(v)),
  );
  if (values.length === 0) return ["auto", "auto"];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max(500, (max - min) * 0.08);
  return [Math.floor(min - padding), Math.ceil(max + padding)];
}

export type ParishSalaryRankingRow = {
  slug: string;
  name: string;
  salary2025: number;
  fill: string;
};

export function buildParishSalaryRankings2025(): ParishSalaryRankingRow[] {
  const state2025 = teacherSalary.state.salaries["2025"];
  if (!isValidScore(state2025)) return [];

  const rows: ParishSalaryRankingRow[] = [];
  for (const [slug, parish] of Object.entries(teacherSalary.bySlug)) {
    const salary = parish.salaries["2025"];
    if (!isValidScore(salary)) continue;
    rows.push({
      slug,
      name: parish.name,
      salary2025: salary,
      fill: salaryTierColor(salary, state2025),
    });
  }

  return rows.sort((a, b) => b.salary2025 - a.salary2025);
}

export function salaryVsStateDiff(
  parishVal: number | null | undefined,
  stateVal: number | null | undefined,
): number | null {
  if (!isValidScore(parishVal) || !isValidScore(stateVal)) return null;
  return parishVal - stateVal;
}

export { isValidScore };
