import enrollmentData from "../../public/data/enrollment_by_parish.json";

export interface ParishEnrollmentRecord {
  parish_slug: string;
  parish_name: string;
  total_enrollment: number;
  schools_reporting: number;
  students_per_school: number;
  source_date: string;
  race_ethnicity_pct?: {
    american_indian?: number;
    asian?: number;
    black?: number;
    hispanic?: number;
    hawaiian_pacific?: number;
    white?: number;
    multiple_races?: number;
  };
}

const bySlug = new Map(
  (enrollmentData as { parishes: ParishEnrollmentRecord[] }).parishes.map((p) => [
    p.parish_slug,
    p,
  ]),
);

export function getParishEnrollment(slug: string): ParishEnrollmentRecord | undefined {
  return bySlug.get(slug);
}

export function formatStudentCount(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}
