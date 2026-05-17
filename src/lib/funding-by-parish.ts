import fundingData from "../../public/data/funding_by_parish.json";

export interface SpendingCategory {
  id: string;
  name: string;
  amount: number;
  pct: number;
  description?: string | null;
}

export interface FundingSource {
  id: string;
  name: string;
  amount: number;
  pct: number;
  notes?: string | null;
}

export interface ParishFundingRecord {
  parish_slug: string;
  parish_name: string;
  spend_per_pupil: number;
  vs_state_avg_dollars: number;
  vs_state_avg_pct: number;
  rank: number;
  signal?: string | null;
}

export interface FundingByParishData {
  meta: {
    source: string;
    description: string;
    state_avg_per_pupil: number;
    parish_count: number;
  };
  state: {
    spend_per_pupil: number;
    spending_categories: SpendingCategory[];
    funding_sources: FundingSource[];
  };
  parishes: ParishFundingRecord[];
}

export const FUNDING_BY_PARISH = fundingData as FundingByParishData;

const parishMap = new Map(FUNDING_BY_PARISH.parishes.map((p) => [p.parish_slug, p]));

export function getParishFunding(slug: string): ParishFundingRecord | null {
  return parishMap.get(slug) ?? null;
}

export function formatFundingDollars(n: number, signed = false): string {
  const abs = Math.abs(n);
  const formatted = `$${abs.toLocaleString()}`;
  if (!signed || n === 0) return formatted;
  return n < 0 ? `(${formatted})` : `+${formatted}`;
}

export function formatFundingPct(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

export const CATEGORY_COLORS: Record<string, string> = {
  instruction: "#185FA5",
  "other-support": "#5C6B7A",
  "student-support": "#0F6E56",
  administration: "#B07D00",
  transportation: "#6B3FA0",
};

export const SOURCE_COLORS: Record<string, string> = {
  state: "#185FA5",
  federal: "#C05C00",
};
