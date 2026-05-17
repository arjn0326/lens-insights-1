import lensData from "../../public/data/lens.json";
import parishesDashboard from "../../public/data/parishes_dashboard.json";
import type { LayerKey, Parish } from "./lens-types";

type RawDashboardParish = (typeof parishesDashboard.parishes)[number];

const lensParishes = (lensData as { parishes: { name_slug: string; signals?: Parish["signals"] }[] })
  .parishes;

const signalMap = new Map(lensParishes.map((p) => [p.name_slug, p.signals]));

export const PARISHES: Parish[] = (parishesDashboard.parishes as RawDashboardParish[]).map(
  (p) => {
    const parish: Parish = {
      id: p.id,
      name: p.name,
      population: p.population,
      students: p.students,
      dfSchools: p.dfSchools,
      totalSchools: p.totalSchools,
      trend: p.trend as Parish["trend"],
      x: p.x,
      y: p.y,
      priorityScore: p.priorityScore,
      uncertainty: p.uncertainty as Parish["uncertainty"],
      scores: p.scores,
      alert: p.alert,
      intervention: p.intervention,
    };
    const raw = signalMap.get(p.id);
    if (raw) {
      parish.signals = {
        sped_iep_pct: raw.sped_iep_pct ?? null,
        sped_teacher_gap_pct: raw.sped_teacher_gap_pct ?? null,
        sped_iep_count: raw.sped_iep_count ?? null,
        sped_teacher_fte_total: raw.sped_teacher_fte_total ?? null,
        sped_teacher_fte_certified: raw.sped_teacher_fte_certified ?? null,
        sped_teacher_fte_uncertified: raw.sped_teacher_fte_uncertified ?? null,
      };
    }
    return parish;
  },
);

export const STATE_AVG: Record<
  "Health" | "Need" | "Access" | "Readiness" | "Demand" | "Pipeline",
  number
> = parishesDashboard.meta.state_averages;

export type GradeCounts = { A: number; df: number; total: number };

const gradeMap = new Map(
  (parishesDashboard.parishes as RawDashboardParish[]).map((p) => [
    p.id,
    p.gradeCounts as GradeCounts,
  ]),
);

export function getGradeCounts(parishId: string): GradeCounts | undefined {
  return gradeMap.get(parishId);
}

const lensBySlug = new Map(lensParishes.map((p) => [p.name_slug, p]));

export function getLensParish(slug: string) {
  return lensBySlug.get(slug);
}
