import fundingData from "../../public/data/funding_by_parish.json";
import { getParishFunding } from "@/lib/funding-by-parish";
import { getParishEnrollment } from "@/lib/parish-enrollment";
import { PARISHES, STATE_AVG, getGradeCounts } from "./lens-parishes";
import type { LayerKey } from "./lens-types";

export type { LayerKey, Parish } from "./lens-types";
export { PARISHES, STATE_AVG, getGradeCounts, getLensParish } from "./lens-parishes";
export type { GradeCounts } from "./lens-parishes";

export const LAYERS: LayerKey[] = ["Health", "Need", "Access", "Readiness", "Demand", "Pipeline"];

export const LENS_VERSION = "1.1.0";

export const DATA_VINTAGE = {
  ldoe_sps: "2024-2025",
  acs: "2023 5-year estimates",
  bls: "2024 annual",
} as const;

export const LAYER_INFO: Record<LayerKey, string> = {
  Health: "Weighted composite from lens.json pillars (SPS, poverty, unemployment, A-school share, opportunity). Higher = stronger overall resilience.",
  Need: "Blend of ACS child poverty (50%), MFP economically-disadvantaged share (35%), and SPED IEP rate (15%), scaled statewide. Higher = greater student need — not a simple invert.",
  Access: "Top-school gap from empirical-Bayes A-rated share vs peers. Higher = fewer high-quality seats relative to the state.",
  Readiness: "Labor stress: BLS/ACS unemployment (55%) plus inverted parish graduation rate (45%). Higher = more workforce completion pressure.",
  Demand: "Curated megaproject overlay for select parishes; elsewhere derived from opportunity signals. Higher = more incoming industrial workforce demand.",
  Pipeline: "Performance pressure: mean SPS gap (55%) plus D/F school concentration (45%). Higher = more systemic academic strain.",
};

/** Major existing employers — used as context pins on the Health layer. */
export const EMPLOYERS = [
  { name: "META", value: "$10B", x: 39.5, y: 18.5 },
  { name: "EXXON", value: "$2.4B", x: 56.5, y: 58.0 },
  { name: "WOODSIDE", value: "$17.5B", x: 18.0, y: 64.0 },
];

export interface Investment {
  id: string;
  name: string;
  parish: string;
  amount: string;
  jobs: number;
  sector: string;
  status: "Announced" | "Under construction" | "Operational";
  online: string;
  x: number;
  y: number;
}

export const INVESTMENTS: Investment[] = [
  { id: "meta", name: "Meta AI Data Center", parish: "Richland", amount: "$10B", jobs: 500, sector: "Tech / AI infra", status: "Under construction", online: "2027", x: 43.5, y: 19.0 },
  { id: "hyundai", name: "Hyundai Steel Mill", parish: "Ascension", amount: "$5.8B", jobs: 1300, sector: "Heavy industry", status: "Announced", online: "2029", x: 58.0, y: 67.5 },
  { id: "woodside", name: "Woodside Louisiana LNG", parish: "Calcasieu", amount: "$17.5B", jobs: 1500, sector: "Energy / LNG", status: "Under construction", online: "2026", x: 17.0, y: 67.5 },
  { id: "ccs", name: "Air Products Clean Energy", parish: "Ascension", amount: "$4.5B", jobs: 170, sector: "Hydrogen / CCS", status: "Under construction", online: "2026", x: 60.0, y: 67.0 },
  { id: "venture", name: "Venture Global CP2 LNG", parish: "Cameron", amount: "$10B", jobs: 250, sector: "Energy / LNG", status: "Announced", online: "2027", x: 12.0, y: 73.0 },
  { id: "first", name: "First Solar Cell Plant", parish: "Iberia", amount: "$1.1B", jobs: 700, sector: "Solar mfg", status: "Under construction", online: "2025", x: 47.5, y: 70.5 },
  { id: "shintech", name: "Shintech PVC Expansion", parish: "Plaquemine", amount: "$1.4B", jobs: 120, sector: "Petrochem", status: "Operational", online: "2024", x: 55.0, y: 64.5 },
];

export const HIGHWAYS: { name: string; d: string }[] = [
  { name: "I-10", d: "M 4,67 L 16,67 L 30,68 L 40,67 L 50,64 L 57,61 L 65,66 L 73,72 L 78,71 L 88,71" },
  { name: "I-20", d: "M 5,16 L 10,14 L 22,15 L 30,17 L 38,17 L 44,19 L 52,18 L 60,17" },
  { name: "I-49", d: "M 5,17 L 9,24 L 16,32 L 22,40 L 27,46 L 32,54 L 36,62 L 39,67" },
  { name: "I-12", d: "M 57,60 L 65,60 L 72,60 L 78,61" },
  { name: "I-55", d: "M 65,30 L 66,42 L 67,52 L 68,60" },
];

export interface SchoolDot {
  x: number;
  y: number;
  failing: boolean;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildSchoolDots(): SchoolDot[] {
  const dots: SchoolDot[] = [];
  const rand = mulberry32(42);
  for (const p of PARISHES) {
    const n = Math.max(1, p.totalSchools);
    const renderCount = Math.min(p.totalSchools, 22);
    const failingCount = Math.round((p.dfSchools / n) * renderCount);
    for (let i = 0; i < renderCount; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = Math.sqrt(rand()) * 3.0;
      dots.push({
        x: p.x + Math.cos(angle) * radius,
        y: p.y + Math.sin(angle) * radius,
        failing: i < failingCount,
      });
    }
  }
  return dots;
}

export interface ParishSchoolDot {
  parishId: string;
  x: number;
  y: number;
  failing: boolean;
}

export function buildParishSchoolDots(): ParishSchoolDot[] {
  const dots: ParishSchoolDot[] = [];
  const rand = mulberry32(99);
  for (const p of PARISHES) {
    const n = Math.max(1, p.totalSchools);
    const renderCount = Math.min(p.totalSchools, 22);
    const failingCount = Math.round((p.dfSchools / n) * renderCount);
    for (let i = 0; i < renderCount; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = Math.sqrt(rand()) * 3.0;
      dots.push({
        parishId: p.id,
        x: p.x + Math.cos(angle) * radius,
        y: p.y + Math.sin(angle) * radius,
        failing: i < failingCount,
      });
    }
  }
  return dots;
}

export function failingClusterScore(px: number, py: number, r: number): number {
  const dots = buildSchoolDots();
  let total = 0;
  let failing = 0;
  for (const d of dots) {
    const dx = d.x - px;
    const dy = d.y - py;
    if (dx * dx + dy * dy <= r * r) {
      total++;
      if (d.failing) failing++;
    }
  }
  return total === 0 ? 0 : failing / total;
}

export interface HexBin {
  cx: number;
  cy: number;
  count: number;
  failRate: number;
}

export function buildHexBins(): HexBin[] {
  const dots = buildSchoolDots();
  const size = 4;
  const bins = new Map<string, { cx: number; cy: number; total: number; failing: number }>(); 
  for (const d of dots) {
    const col = Math.floor(d.x / (size * 1.5));
    const row = Math.floor(d.y / (size * Math.sqrt(3)));
    const key = col + "," + row;
    if (!bins.has(key)) {
      bins.set(key, {
        cx: col * size * 1.5 + size,
        cy: row * size * Math.sqrt(3) + (col % 2 === 0 ? 0 : size * Math.sqrt(3) * 0.5) + size * Math.sqrt(3) * 0.5,
        total: 0,
        failing: 0,
      });
    }
    const b = bins.get(key)!;
    b.total++;
    if (d.failing) b.failing++;
  }
  return [...bins.values()]
    .filter((b) => b.total > 0)
    .map((b) => ({ cx: b.cx, cy: b.cy, count: b.total, failRate: b.failing / b.total }));
}

export { PARISH_POLYGONS } from "./la-parish-polygons";

export function severity(layer: LayerKey, score: number): "green" | "lime" | "yellow" | "orange" | "red" {
  if (layer === "Health") {
    if (score >= 80) return "green";
    if (score >= 65) return "lime";
    if (score >= 50) return "yellow";
    if (score >= 35) return "orange";
    return "red";
  }
  if (score >= 80) return "red";
  if (score >= 65) return "orange";
  if (score >= 50) return "yellow";
  if (score >= 35) return "lime";
  return "green";
}

export const SEV_COLOR: Record<ReturnType<typeof severity>, string> = {
  green: "var(--sev-green)",
  lime: "var(--sev-lime)",
  yellow: "var(--sev-yellow)",
  orange: "var(--sev-orange)",
  red: "var(--sev-red)",
};

export function severityLabel(layer: LayerKey, score: number): string {
  const sev = severity(layer, score);
  switch (sev) {
    case "red": return "Crisis";
    case "orange": return "Critical";
    case "yellow": return "Concerning";
    case "lime": return "Watch";
    case "green": return "Healthy";
  }
}

export const ALERT_EXPLANATIONS: Record<string, string> = {
  "Industrial demand + stress": "High megaproject / demand signal alongside elevated unemployment or graduation gap — prioritize workforce-aligned pathways.",
  "Deep need + weak outcomes": "High poverty-derived need plus weak mean school performance — intensive turnaround and student supports.",
  "Labor stress + jobs signal": "Unemployment or graduation stress with elevated demand proxy — align training with incoming capital investment.",
  "Few top schools + high need": "Need is elevated while few schools earn top letter grades — expand high-quality seats and targeted supports.",
  "Concentrated low ratings": "Many schools rate below top tiers while need is elevated — systemic improvement and choice architecture review.",
};

export const METHODOLOGY_NOTE =
  "Map scores and alerts come from lens.json (parishes_dashboard.json). Enrollment, funding, and grade counts use LDOE/Treasurer pipelines where available; trend and outcome charts remain illustrative until historical series are wired.";

export function interventionRecommendation(code: string): string {
  const base = code.replace("+C", "").trim();
  const map: Record<string, string> = {
    A2: "Open a CTE/Career Academy aligned to incoming industrial workforce needs.",
    A1: "Open a general education charter school to expand access in underserved area.",
    A3: "Open a specialty school serving students with disabilities.",
    E: "Coordinate with LDOE on AUS / intervention pathways — turnaround, restart, or replacement per state policy.",
    B: "Add new CTE pathways to existing schools aligned with local workforce demand.",
    Monitor: "No immediate intervention required. Continue monitoring index trends.",
  };
  let rec = map[base] ?? "Continue monitoring index trends.";
  if (code.includes("+C")) {
    rec += " Deploy teacher recruitment incentives and demand pay programs.";
  }
  return rec;
}

export const INDEX_LABELS: { key: Exclude<LayerKey, "Health">; label: string }[] = [
  { key: "Need", label: "Student Need" },
  { key: "Access", label: "Top-school gap" },
  { key: "Readiness", label: "Labor + grad stress" },
  { key: "Demand", label: "Workforce Demand" },
  { key: "Pipeline", label: "Perf. pressure" },
];

export const NATIONAL_AVG: Record<LayerKey, number> = {
  Health: 64, Need: 52, Access: 44, Readiness: 54, Demand: 60, Pipeline: 41,
};

export function buildTrendSeries(parishId: string) {
  const p = PARISHES.find((x) => x.id === parishId);
  if (!p) return [];
  const end = p.scores.Health;
  const drift = p.trend === "up" ? -8 : p.trend === "down" ? 9 : 2;
  const start = Math.max(15, Math.min(95, end - drift));
  const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
  const rand = mulberry32(p.name.length * 17 + 3);
  return years.map((year, i) => {
    const t = i / (years.length - 1);
    const base = start + (end - start) * t;
    const wobble = (rand() - 0.5) * 6;
    const parishVal = Math.round(Math.max(10, Math.min(98, base + wobble)));
    const stateVal = Math.round(STATE_AVG.Health + (rand() - 0.5) * 4);
    const nationalVal = Math.round(NATIONAL_AVG.Health + (rand() - 0.5) * 3);
    return { year, parish: parishVal, state: stateVal, national: nationalVal };
  });
}

export function buildRaceSeries() {
  const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
  return years.map((year, i) => {
    const t = i / (years.length - 1);
    const row: Record<string, string | number> = { year };
    for (const p of PARISHES) {
      const rand = mulberry32(p.name.length * 31 + i * 7);
      const drift = p.trend === "up" ? -10 : p.trend === "down" ? 9 : 1;
      const start = Math.max(15, Math.min(95, p.scores.Health - drift));
      const wobble = (rand() - 0.5) * 5;
      row[p.id] = Math.round(start + (p.scores.Health - start) * t + wobble);
    }
    return row;
  });
}

export function buildDemographics(parishId: string) {
  const enroll = getParishEnrollment(parishId);
  const pct = enroll?.race_ethnicity_pct;
  if (pct) {
    const other =
      (pct.american_indian ?? 0) +
      (pct.asian ?? 0) +
      (pct.hawaiian_pacific ?? 0) +
      (pct.multiple_races ?? 0);
    return [
      { name: "Black", value: Math.round(pct.black ?? 0) },
      { name: "White", value: Math.round(pct.white ?? 0) },
      { name: "Hispanic", value: Math.round(pct.hispanic ?? 0) },
      { name: "Other", value: Math.round(other) },
    ].filter((d) => d.value > 0);
  }
  return [];
}

export function buildGradeDistribution(parishId: string) {
  const grades = getGradeCounts(parishId);
  const p = PARISHES.find((x) => x.id === parishId);
  if (!grades || !p) return [];
  const a = grades.A;
  const df = grades.df;
  const total = Math.max(grades.total, p.totalSchools, a + df);
  const remaining = Math.max(0, total - a - df);
  const b = Math.round(remaining * 0.48);
  const c = remaining - b;
  const dCount = Math.round(df * 0.55);
  const f = df - dCount;
  return [
    { grade: "A", count: a },
    { grade: "B", count: b },
    { grade: "C", count: c },
    { grade: "D", count: dCount },
    { grade: "F", count: f },
  ].filter((g) => g.count > 0);
}

export function buildFundingBreakdown(parishId: string) {
  const parish = getParishFunding(parishId);
  const categories = (fundingData as { state: { spending_categories: { name: string; pct: number }[] } })
    .state.spending_categories;
  const perPupil = parish?.spend_per_pupil;
  if (!perPupil) return [];
  return categories.map((c) => ({
    category: c.name,
    value: Math.round(perPupil * (c.pct / 100)),
  }));
}

export function buildWorkforceAlignment(parishId: string) {
  const p = PARISHES.find((x) => x.id === parishId);
  if (!p) return [];
  const rand = mulberry32((p?.scores.Demand ?? 50) * 7);
  const sectors = ["Industrial", "Healthcare", "Tech", "Logistics", "Trades", "Other"];
  const raw = sectors.map(() => 5 + rand() * 25);
  const sum = raw.reduce((a, b) => a + b, 0);
  return sectors.map((s, i) => ({
    sector: s,
    aligned: Math.round((raw[i] / sum) * 100),
    demand: Math.round(8 + rand() * 28),
  }));
}

export function buildOutcomeSankey(parishId: string) {
  const p = PARISHES.find((x) => x.id === parishId);
  if (!p) return { nodes: [], links: [] };
  const rand = mulberry32(p.name.length * 13 + 7);
  const totalGrads = Math.round(p.students * 0.085);
  const onTime = Math.round(totalGrads * (0.72 + rand() * 0.18));
  const late = totalGrads - onTime;
  const cte = Math.round(onTime * (0.28 + rand() * 0.15));
  const college2 = Math.round(onTime * (0.15 + rand() * 0.1));
  const college4 = Math.round(onTime * (0.2 + rand() * 0.15));
  const military = Math.round(onTime * (0.04 + rand() * 0.04));
  const direct = onTime - cte - college2 - college4 - military;
  const employed1 = Math.round((cte + direct) * (0.55 + rand() * 0.2));
  const enrolled1 = college2 + college4;
  const disconnected = totalGrads - employed1 - enrolled1 - military;
  const nodes = [
    { name: "On-time" }, { name: "Late / GED" },
    { name: "CTE Credential" }, { name: "Direct Workforce" },
    { name: "2-yr College" }, { name: "4-yr College" },
    { name: "Military" }, { name: "Employed @ 1yr" },
    { name: "Still enrolled" }, { name: "Disconnected" },
  ];
  const links = [
    { source: 0, target: 2, value: cte },
    { source: 0, target: 3, value: direct },
    { source: 0, target: 4, value: college2 },
    { source: 0, target: 5, value: college4 },
    { source: 0, target: 6, value: military },
    { source: 1, target: 9, value: late },
    { source: 2, target: 7, value: Math.round(cte * 0.7) },
    { source: 3, target: 7, value: Math.round(direct * 0.5) },
    { source: 4, target: 8, value: college2 },
    { source: 5, target: 8, value: college4 },
  ];
  return { nodes, links };
}
