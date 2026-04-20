export type LayerKey = "Health" | "Need" | "Access" | "Readiness" | "Demand" | "Pipeline";

export const LAYERS: LayerKey[] = ["Health", "Need", "Access", "Readiness", "Demand", "Pipeline"];

export interface Parish {
  id: string;
  name: string;
  population: number;
  students: number;
  dfSchools: number;
  trend: "up" | "down" | "flat";
  // x,y are percentages within the map container (0-100)
  x: number;
  y: number;
  scores: Record<LayerKey, number>;
  alert: string | null;
  intervention: string;
}

export const PARISHES: Parish[] = [
  {
    id: "ouachita", name: "Ouachita", population: 153279, students: 28400, dfSchools: 11, trend: "down",
    x: 62, y: 18,
    scores: { Health: 42, Need: 78, Access: 65, Readiness: 71, Demand: 82, Pipeline: 58 },
    alert: "Workforce Wave", intervention: "A2+C",
  },
  {
    id: "caddo", name: "Caddo", population: 237848, students: 38900, dfSchools: 19, trend: "down",
    x: 12, y: 14,
    scores: { Health: 38, Need: 84, Access: 72, Readiness: 68, Demand: 61, Pipeline: 71 },
    alert: "Staffing Crisis", intervention: "A1+C",
  },
  {
    id: "ebr", name: "E. Baton Rouge", population: 456781, students: 41200, dfSchools: 22, trend: "down",
    x: 50, y: 64,
    scores: { Health: 51, Need: 72, Access: 48, Readiness: 62, Demand: 74, Pipeline: 52 },
    alert: "Skills Mismatch", intervention: "A2",
  },
  {
    id: "calcasieu", name: "Calcasieu", population: 216785, students: 32100, dfSchools: 9, trend: "up",
    x: 22, y: 78,
    scores: { Health: 55, Need: 61, Access: 58, Readiness: 65, Demand: 91, Pipeline: 44 },
    alert: "Workforce Wave", intervention: "B",
  },
  {
    id: "jefferson", name: "Jefferson", population: 440781, students: 49800, dfSchools: 14, trend: "flat",
    x: 70, y: 82,
    scores: { Health: 58, Need: 64, Access: 42, Readiness: 59, Demand: 68, Pipeline: 41 },
    alert: "Access Desert", intervention: "A1",
  },
  {
    id: "orleans", name: "Orleans", population: 383997, students: 45600, dfSchools: 8, trend: "up",
    x: 80, y: 80,
    scores: { Health: 64, Need: 58, Access: 22, Readiness: 55, Demand: 72, Pipeline: 48 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "sttammany", name: "St. Tammany", population: 264570, students: 38200, dfSchools: 4, trend: "up",
    x: 78, y: 70,
    scores: { Health: 78, Need: 35, Access: 31, Readiness: 42, Demand: 55, Pipeline: 28 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "lafayette", name: "Lafayette", population: 244390, students: 31600, dfSchools: 7, trend: "flat",
    x: 38, y: 70,
    scores: { Health: 68, Need: 48, Access: 39, Readiness: 51, Demand: 62, Pipeline: 36 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "rapides", name: "Rapides", population: 130023, students: 22400, dfSchools: 8, trend: "down",
    x: 38, y: 46,
    scores: { Health: 52, Need: 69, Access: 62, Readiness: 58, Demand: 52, Pipeline: 55 },
    alert: "Specialty Desert", intervention: "A3",
  },
  {
    id: "ascension", name: "Ascension", population: 130158, students: 24300, dfSchools: 3, trend: "up",
    x: 56, y: 72,
    scores: { Health: 61, Need: 44, Access: 52, Readiness: 56, Demand: 88, Pipeline: 32 },
    alert: "Workforce Wave", intervention: "B",
  },
  {
    id: "bossier", name: "Bossier", population: 128746, students: 23100, dfSchools: 6, trend: "flat",
    x: 22, y: 18,
    scores: { Health: 62, Need: 52, Access: 45, Readiness: 54, Demand: 58, Pipeline: 42 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "richland", name: "Richland", population: 20122, students: 4200, dfSchools: 5, trend: "down",
    x: 54, y: 22,
    scores: { Health: 44, Need: 76, Access: 81, Readiness: 74, Demand: 94, Pipeline: 62 },
    alert: "Workforce Wave", intervention: "A2",
  },
];

export const EMPLOYERS = [
  { name: "META", value: "$10B", x: 56, y: 18 },
  { name: "HYUNDAI", value: "$5.8B", x: 58, y: 70 },
  { name: "WOODSIDE", value: "$17.5B", x: 20, y: 76 },
];

/**
 * For Health: higher is better (green). For all other layers: higher is worse (red).
 */
export function severity(layer: LayerKey, score: number): "green" | "lime" | "yellow" | "orange" | "red" {
  if (layer === "Health") {
    if (score >= 80) return "green";
    if (score >= 65) return "lime";
    if (score >= 50) return "yellow";
    if (score >= 35) return "orange";
    return "red";
  }
  // Inverted scale
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
  "Workforce Wave": "Major employer investment detected near this parish. Current CTE pathways do not align with projected job demand.",
  "Staffing Crisis": "Teacher vacancy rate exceeds critical threshold while student need remains high. Schools cannot improve without adequate staffing.",
  "Skills Mismatch": "Schools producing credentials that don't align with local labor market demand. Less than 2% of IBCs target high-wage occupations.",
  "Specialty Desert": "SWD rate above state average with no specialty school within 30 miles. Students with disabilities lack access to appropriate programs.",
  "Access Desert": "Low charter penetration with high concentration of D/F schools. Families have limited alternatives to underperforming schools.",
};

export function interventionRecommendation(code: string): string {
  const base = code.replace("+C", "").trim();
  const map: Record<string, string> = {
    A2: "Open a CTE/Career Academy aligned to incoming industrial workforce needs.",
    A1: "Open a general education charter school to expand access in underserved area.",
    A3: "Open a specialty school serving students with disabilities.",
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
  { key: "Access", label: "Access Gap" },
  { key: "Readiness", label: "Workforce Ready" },
  { key: "Demand", label: "Workforce Demand" },
  { key: "Pipeline", label: "Teacher Pipeline" },
];
