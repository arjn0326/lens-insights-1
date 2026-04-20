export type LayerKey = "Health" | "Need" | "Access" | "Readiness" | "Demand" | "Pipeline";

export const LAYERS: LayerKey[] = ["Health", "Need", "Access", "Readiness", "Demand", "Pipeline"];

export const LAYER_INFO: Record<LayerKey, string> = {
  Health: "Composite school-system health score. Higher is better — blends performance, access, and outcomes.",
  Need: "Student need index — poverty, ELL, SWD, and academic struggle. Higher = greater need.",
  Access: "Gap between students and quality school options within reach. Higher = bigger access desert.",
  Readiness: "Workforce readiness gap — share of grads not credentialed for local jobs. Higher = wider gap.",
  Demand: "Projected employer demand from current and announced industrial investment. Higher = more jobs coming.",
  Pipeline: "Teacher pipeline strain — vacancies, attrition, certification gaps. Higher = more strained.",
};

export interface Parish {
  id: string;
  name: string;
  population: number;
  students: number;
  dfSchools: number;
  totalSchools: number;
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
    id: "ouachita", name: "Ouachita", population: 153279, students: 28400, dfSchools: 11, totalSchools: 48, trend: "down",
    x: 37.7, y: 17.5,
    scores: { Health: 42, Need: 78, Access: 65, Readiness: 71, Demand: 82, Pipeline: 58 },
    alert: "Workforce Wave", intervention: "A2+C",
  },
  {
    id: "caddo", name: "Caddo", population: 237848, students: 38900, dfSchools: 19, totalSchools: 65, trend: "down",
    x: 5.4, y: 16.4,
    scores: { Health: 38, Need: 84, Access: 72, Readiness: 68, Demand: 61, Pipeline: 71 },
    alert: "Staffing Crisis", intervention: "A1+C",
  },
  {
    id: "ebr", name: "E. Baton Rouge", population: 456781, students: 41200, dfSchools: 22, totalSchools: 88, trend: "down",
    x: 57.2, y: 59.5,
    scores: { Health: 51, Need: 72, Access: 48, Readiness: 62, Demand: 74, Pipeline: 52 },
    alert: "Skills Mismatch", intervention: "A2",
  },
  {
    id: "calcasieu", name: "Calcasieu", population: 216785, students: 32100, dfSchools: 9, totalSchools: 56, trend: "up",
    x: 16.2, y: 66.7,
    scores: { Health: 55, Need: 61, Access: 58, Readiness: 65, Demand: 91, Pipeline: 44 },
    alert: "Workforce Wave", intervention: "B",
  },
  {
    id: "jefferson", name: "Jefferson", population: 440781, students: 49800, dfSchools: 14, totalSchools: 78, trend: "flat",
    x: 73, y: 75.6,
    scores: { Health: 58, Need: 64, Access: 42, Readiness: 59, Demand: 68, Pipeline: 41 },
    alert: "Access Desert", intervention: "A1",
  },
  {
    id: "orleans", name: "Orleans", population: 383997, students: 45600, dfSchools: 8, totalSchools: 82, trend: "up",
    x: 77.2, y: 70.1,
    scores: { Health: 64, Need: 58, Access: 22, Readiness: 55, Demand: 72, Pipeline: 48 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "sttammany", name: "St. Tammany", population: 264570, students: 38200, dfSchools: 4, totalSchools: 60, trend: "up",
    x: 76.5, y: 61.6,
    scores: { Health: 78, Need: 35, Access: 31, Readiness: 42, Demand: 55, Pipeline: 28 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "lafayette", name: "Lafayette", population: 244390, students: 31600, dfSchools: 7, totalSchools: 52, trend: "flat",
    x: 39.2, y: 67,
    scores: { Health: 68, Need: 48, Access: 39, Readiness: 51, Demand: 62, Pipeline: 36 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "rapides", name: "Rapides", population: 130023, students: 22400, dfSchools: 8, totalSchools: 44, trend: "down",
    x: 29.4, y: 46.4,
    scores: { Health: 52, Need: 69, Access: 62, Readiness: 58, Demand: 52, Pipeline: 55 },
    alert: "Specialty Desert", intervention: "A3",
  },
  {
    id: "ascension", name: "Ascension", population: 130158, students: 24300, dfSchools: 3, totalSchools: 32, trend: "up",
    x: 58.8, y: 67,
    scores: { Health: 61, Need: 44, Access: 52, Readiness: 56, Demand: 88, Pipeline: 32 },
    alert: "Workforce Wave", intervention: "B",
  },
  {
    id: "bossier", name: "Bossier", population: 128746, students: 23100, dfSchools: 6, totalSchools: 38, trend: "flat",
    x: 9.8, y: 13.3,
    scores: { Health: 62, Need: 52, Access: 45, Readiness: 54, Demand: 58, Pipeline: 42 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "richland", name: "Richland", population: 20122, students: 4200, dfSchools: 5, totalSchools: 14, trend: "down",
    x: 43.9, y: 19.4,
    scores: { Health: 44, Need: 76, Access: 81, Readiness: 74, Demand: 94, Pipeline: 62 },
    alert: "Workforce Wave", intervention: "A2",
  },
];

export const EMPLOYERS = [
  { name: "META", value: "$10B", x: 56, y: 20 },
  { name: "HYUNDAI", value: "$5.8B", x: 62, y: 71 },
  { name: "WOODSIDE", value: "$17.5B", x: 20, y: 76 },
];

/**
 * Major Louisiana interstates as polylines in 0-100 viewport coordinates.
 * Approximated routes for visual reference, not survey-accurate.
 */
export const HIGHWAYS: { name: string; d: string }[] = [
  { name: "I-10", d: "M 6,80 L 22,79 L 38,75 L 54,72 L 64,76 L 76,82 L 92,84" },
  { name: "I-20", d: "M 6,18 L 20,18 L 38,18 L 54,22 L 64,22 L 76,22" },
  { name: "I-49", d: "M 12,16 L 18,28 L 28,40 L 36,52 L 40,66 L 42,72" },
  { name: "I-12", d: "M 54,68 L 64,68 L 74,70 L 82,71" },
  { name: "I-55", d: "M 70,40 L 72,55 L 74,68 L 76,80" },
];

/**
 * Schools clustered around the parish center. Each parish's `totalSchools`
 * controls how many dots we render — emptier areas literally look emptier.
 */
export interface SchoolDot {
  x: number;
  y: number;
  failing: boolean;
}

// Deterministic pseudo-random scatter so dots don't reshuffle each render.
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
    // Cap rendered dots so dense parishes don't dominate visually
    const renderCount = Math.min(p.totalSchools, 18);
    const failingCount = Math.round((p.dfSchools / p.totalSchools) * renderCount);
    for (let i = 0; i < renderCount; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = Math.sqrt(rand()) * 4.2; // cluster radius (% of viewport)
      dots.push({
        x: p.x + Math.cos(angle) * radius,
        y: p.y + Math.sin(angle) * radius * 0.85,
        failing: i < failingCount,
      });
    }
  }
  return dots;
}

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

/** Benchmarks for comparison views. */
export const STATE_AVG: Record<LayerKey, number> = {
  Health: 56, Need: 60, Access: 51, Readiness: 58, Demand: 71, Pipeline: 47,
};
export const NATIONAL_AVG: Record<LayerKey, number> = {
  Health: 64, Need: 52, Access: 44, Readiness: 54, Demand: 60, Pipeline: 41,
};

/** 6-year historical trend for a parish's Health score (synthetic but coherent). */
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

/** Demographic breakdown for the parish — synthetic but plausible mix. */
export function buildDemographics(parishId: string) {
  const p = PARISHES.find((x) => x.id === parishId);
  if (!p) return [];
  const seed = p.name.charCodeAt(0) + p.name.charCodeAt(1);
  const rand = mulberry32(seed);
  const black = Math.round(30 + rand() * 40);
  const white = Math.round((100 - black) * (0.45 + rand() * 0.35));
  const hispanic = Math.round((100 - black - white) * (0.55 + rand() * 0.3));
  const other = Math.max(2, 100 - black - white - hispanic);
  return [
    { name: "Black", value: black },
    { name: "White", value: white },
    { name: "Hispanic", value: hispanic },
    { name: "Other", value: other },
  ];
}

/** School performance grade distribution (A–F). */
export function buildGradeDistribution(parishId: string) {
  const p = PARISHES.find((x) => x.id === parishId);
  if (!p) return [];
  const total = p.totalSchools;
  const df = p.dfSchools;
  const remaining = total - df;
  const a = Math.round(remaining * 0.18);
  const b = Math.round(remaining * 0.32);
  const c = Math.round(remaining * 0.34);
  const dCount = Math.round(df * 0.55);
  const f = df - dCount;
  const cAdj = remaining - a - b;
  return [
    { grade: "A", count: a },
    { grade: "B", count: b },
    { grade: "C", count: cAdj },
    { grade: "D", count: dCount },
    { grade: "F", count: f },
  ];
}

/** Funding allocation per pupil — split across categories. */
export function buildFundingBreakdown(parishId: string) {
  const p = PARISHES.find((x) => x.id === parishId);
  if (!p) return [];
  const rand = mulberry32(p?.population ?? 1);
  const total = 11800 + Math.round(rand() * 1800);
  return [
    { category: "Instruction", value: Math.round(total * 0.58) },
    { category: "Support", value: Math.round(total * 0.16) },
    { category: "Admin", value: Math.round(total * 0.09) },
    { category: "Facilities", value: Math.round(total * 0.11) },
    { category: "Transport", value: Math.round(total * 0.06) },
  ];
}

/** Workforce pathway alignment by sector (% of graduates). */
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
