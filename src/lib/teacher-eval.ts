import teacherData from "../../public/data/teacher_eval.json";
import { formatSigned, isValidScore } from "@/lib/academic-scores";

export const TEACHER_EVAL_YEARS = ["2021", "2022", "2023", "2024"] as const;
export type TeacherEvalYearKey = (typeof TEACHER_EVAL_YEARS)[number];

export type TeacherRatingSeries = Partial<Record<TeacherEvalYearKey, number | null>>;

export interface TeacherEvalParishRecord {
  code: string;
  name: string;
  highlyEffective: TeacherRatingSeries;
  highlyEffectiveAvg: number | null;
  proficient: TeacherRatingSeries;
  proficientAvg: number | null;
  emerging: TeacherRatingSeries;
  emergingAvg: number | null;
}

export interface TeacherEvalDataset {
  state: TeacherEvalParishRecord;
  bySlug: Record<string, TeacherEvalParishRecord>;
}

export const teacherEval = teacherData as TeacherEvalDataset;

export const TEACHER_RATING_COLORS = {
  highlyEffective: "var(--sev-green)",
  proficient: "#378ADD",
  emerging: "#D85A30",
} as const;

export const TEACHER_RATING_LABELS = {
  highlyEffective: "Highly Effective",
  proficient: "Effective: Proficient",
  emerging: "Effective: Emerging",
  stateHighlyEffective: "LA State Avg (Highly Effective)",
} as const;

export function getTeacherEvalParish(slug: string): TeacherEvalParishRecord | undefined {
  return teacherEval.bySlug[slug];
}

export type ParishRatingsChartRow = {
  year: string;
  highlyEffective?: number;
  proficient?: number;
  emerging?: number;
  stateHighlyEffective?: number;
};

export function buildParishRatingsChartData(
  parish: TeacherEvalParishRecord,
  state: TeacherEvalParishRecord,
): ParishRatingsChartRow[] {
  return TEACHER_EVAL_YEARS.map((year) => {
    const highlyEffective = parish.highlyEffective[year];
    const proficient = parish.proficient[year];
    const emerging = parish.emerging[year];
    const stateHighlyEffective = state.highlyEffective[year];

    if (
      !isValidScore(highlyEffective) &&
      !isValidScore(proficient) &&
      !isValidScore(emerging) &&
      !isValidScore(stateHighlyEffective)
    ) {
      return null;
    }

    const row: ParishRatingsChartRow = { year };
    if (isValidScore(highlyEffective)) row.highlyEffective = highlyEffective;
    if (isValidScore(proficient)) row.proficient = proficient;
    if (isValidScore(emerging)) row.emerging = emerging;
    if (isValidScore(stateHighlyEffective)) row.stateHighlyEffective = stateHighlyEffective;
    return row;
  }).filter((row): row is ParishRatingsChartRow => row != null);
}

export type StateRatingsChartRow = {
  year: string;
  highlyEffective?: number;
  proficient?: number;
  emerging?: number;
};

export function buildStateRatingsChartData(
  state: TeacherEvalParishRecord,
): StateRatingsChartRow[] {
  return TEACHER_EVAL_YEARS.map((year) => {
    const highlyEffective = state.highlyEffective[year];
    const proficient = state.proficient[year];
    const emerging = state.emerging[year];

    if (!isValidScore(highlyEffective) && !isValidScore(proficient) && !isValidScore(emerging)) {
      return null;
    }

    const row: StateRatingsChartRow = { year };
    if (isValidScore(highlyEffective)) row.highlyEffective = highlyEffective;
    if (isValidScore(proficient)) row.proficient = proficient;
    if (isValidScore(emerging)) row.emerging = emerging;
    return row;
  }).filter((row): row is StateRatingsChartRow => row != null);
}

export function teacherEvalVsStateDiff(
  parishVal: number | null | undefined,
  stateVal: number | null | undefined,
): number | null {
  if (!isValidScore(parishVal) || !isValidScore(stateVal)) return null;
  return parishVal - stateVal;
}

export { formatSigned, isValidScore };
