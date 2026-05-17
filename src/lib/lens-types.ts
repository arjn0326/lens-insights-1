export type LayerKey = "Health" | "Need" | "Access" | "Readiness" | "Demand" | "Pipeline";

export interface Parish {
  id: string;
  name: string;
  population: number;
  students: number;
  dfSchools: number;
  totalSchools: number;
  trend: "up" | "down" | "flat";
  x: number;
  y: number;
  priorityScore: number;
  uncertainty: "high" | "medium" | "low";
  scores: Record<LayerKey, number>;
  alert: string | null;
  intervention: string;
  signals?: {
    sped_iep_pct?: number | null;
    sped_teacher_gap_pct?: number | null;
    sped_iep_count?: number | null;
    sped_teacher_fte_total?: number | null;
    sped_teacher_fte_certified?: number | null;
    sped_teacher_fte_uncertified?: number | null;
  };
}
