import { getParishEnrollment } from "@/lib/parish-enrollment";
import { getParishFunding } from "@/lib/funding-by-parish";
import { getMfpParish } from "@/lib/mfp-by-parish";

/** Canonical parish facts from LDOE / Treasurer pipelines (not lens-data mock counts). */
export interface ParishRealStats {
  slug: string;
  displayName: string;
  /** LDOE Feb 2026 public school enrollment */
  students: number | null;
  schools: number | null;
  enrollmentSourceDate: string | null;
  /** Louisiana Treasurer per-pupil expenditure */
  spendPerPupil: number | null;
  /** MFP funded membership FY2025-26 */
  mfpStudents: number | null;
}

const cache = new Map<string, ParishRealStats>();

export function getParishRealStats(slug: string): ParishRealStats {
  const cached = cache.get(slug);
  if (cached) return cached;

  const enrollment = getParishEnrollment(slug);
  const funding = getParishFunding(slug);
  const mfp = getMfpParish(slug);

  const stats: ParishRealStats = {
    slug,
    displayName:
      enrollment?.parish_name?.replace(/ Parish$/, "") ??
      funding?.parish_name?.replace(/ Parish$/, "") ??
      slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    students: enrollment?.total_enrollment ?? null,
    schools: enrollment?.schools_reporting ?? null,
    enrollmentSourceDate: enrollment?.source_date ?? null,
    spendPerPupil: funding?.spend_per_pupil ?? null,
    mfpStudents: mfp?.total_students ?? null,
  };
  cache.set(slug, stats);
  return stats;
}

export function formatParishStudents(stats: ParishRealStats): string {
  if (stats.students == null) return "—";
  return stats.students.toLocaleString();
}

export function formatParishSchools(stats: ParishRealStats): string {
  if (stats.schools == null) return "—";
  return String(stats.schools);
}
