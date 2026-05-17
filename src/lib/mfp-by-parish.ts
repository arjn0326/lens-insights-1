import data from "../../public/data/mfp_by_parish.json";

export interface MfpCategory {
  pct: number;
  allocation: number;
}

export interface MfpEd extends MfpCategory {
  count: number;
  per_pupil: number;
}

export interface MfpCte extends MfpCategory {
  units: number;
  per_unit: number;
}

export interface MfpSwd extends MfpCategory {
  count: number;
  per_pupil: number;
}

export interface MfpGifted extends MfpCategory {
  count: number;
  per_pupil: number;
}

export interface MfpParishRecord {
  parish_name: string;
  parish_slug: string;
  total_students: number;
  ed: MfpEd;
  cte: MfpCte;
  swd: MfpSwd;
  gifted: MfpGifted;
}

export const MFP_BY_PARISH = data as {
  meta: { fy: string; source: string; parish_count: number };
  parishes: MfpParishRecord[];
};

const bySlug = new Map(MFP_BY_PARISH.parishes.map((p) => [p.parish_slug, p]));

export function getMfpParish(slug: string): MfpParishRecord | undefined {
  return bySlug.get(slug);
}

export function formatMfpMillions(amount: number): string {
  return `$${(amount / 1_000_000).toFixed(2)}M`;
}
