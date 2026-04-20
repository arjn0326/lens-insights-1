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

/** Major existing employers — used as context pins on the Health layer. */
export const EMPLOYERS = [
  { name: "META", value: "$10B", x: 39.5, y: 18.5 },     // Richland
  { name: "EXXON", value: "$2.4B", x: 56.5, y: 58.0 },   // Baton Rouge
  { name: "WOODSIDE", value: "$17.5B", x: 18.0, y: 64.0 }, // Calcasieu LNG
];

/**
 * Major announced industrial investments — green $ markers on the map.
 * Hover reveals: amount, jobs, sector, and which parish demand it lifts.
 */
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

/**
 * Major Louisiana interstates as polylines in the projected 0-100 viewBox.
 * Approximate routes — visual reference, not survey-accurate.
 */
export const HIGHWAYS: { name: string; d: string }[] = [
  { name: "I-10", d: "M 4,67 L 16,67 L 30,68 L 40,67 L 50,64 L 57,61 L 65,66 L 73,72 L 78,71 L 88,71" },
  { name: "I-20", d: "M 5,16 L 10,14 L 22,15 L 30,17 L 38,17 L 44,19 L 52,18 L 60,17" },
  { name: "I-49", d: "M 5,17 L 9,24 L 16,32 L 22,40 L 27,46 L 32,54 L 36,62 L 39,67" },
  { name: "I-12", d: "M 57,60 L 65,60 L 72,60 L 78,61" },
  { name: "I-55", d: "M 65,30 L 66,42 L 67,52 L 68,60" },
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
    const renderCount = Math.min(p.totalSchools, 22);
    const failingCount = Math.round((p.dfSchools / p.totalSchools) * renderCount);
    for (let i = 0; i < renderCount; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = Math.sqrt(rand()) * 3.0; // tighter cluster, fits within parish
      dots.push({
        x: p.x + Math.cos(angle) * radius,
        y: p.y + Math.sin(angle) * radius * 0.9,
        failing: i < failingCount,
      });
    }
  }
  return dots;
}

export interface ParishSchoolDot extends SchoolDot {
  parishId: string;
  id: string;
  name: string;
  grade: "A" | "B" | "C" | "D" | "F";
}

/**
 * Per-parish school dots — used when focusing on specific parishes so we can
 * show ONLY their schools (and color D/F red with a glow halo for clusters).
 */
export function buildParishSchoolDots(parishId: string): ParishSchoolDot[] {
  const p = PARISHES.find((x) => x.id === parishId);
  if (!p) return [];
  const rand = mulberry32(p.name.length * 131 + p.totalSchools);
  const out: ParishSchoolDot[] = [];
  const failingCount = p.dfSchools;
  // Spread a bit wider so individual schools are scannable.
  for (let i = 0; i < p.totalSchools; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = Math.sqrt(rand()) * 3.6;
    const failing = i < failingCount;
    const grade: ParishSchoolDot["grade"] = failing
      ? rand() > 0.55
        ? "F"
        : "D"
      : rand() > 0.7
      ? "A"
      : rand() > 0.4
      ? "B"
      : "C";
    out.push({
      x: p.x + Math.cos(angle) * radius,
      y: p.y + Math.sin(angle) * radius * 0.9,
      failing,
      parishId: p.id,
      id: `${p.id}-${i}`,
      name: `${p.name} School ${i + 1}`,
      grade,
    });
  }
  return out;
}

/**
 * For each school dot, count how many other failing schools are within `radius`.
 * Used to render a glow halo around D/F clusters.
 */
export function failingClusterScore(
  dots: ParishSchoolDot[],
  cx: number,
  cy: number,
  radius = 4,
): number {
  let n = 0;
  for (const d of dots) {
    if (!d.failing) continue;
    const dx = d.x - cx;
    const dy = d.y - cy;
    if (dx * dx + dy * dy <= radius * radius) n++;
  }
  return n;
}

/* ------------------------- Synthetic parish polygons --------------------- */

/**
 * Build a stylized convex polygon around each parish point so we can render
 * boundaries on the map (real GeoJSON for all 64 parishes is heavy; this is a
 * Voronoi-flavored stand-in good enough for choropleth visuals).
 */
function parishPolygonPoints(seed: number, cx: number, cy: number, baseR: number): string {
  const rand = mulberry32(seed);
  const sides = 8;
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (Math.PI * 2 * i) / sides + rand() * 0.25;
    const r = baseR * (0.78 + rand() * 0.55);
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r * 0.88;
    pts.push(`${px.toFixed(2)},${py.toFixed(2)}`);
  }
  return pts.join(" ");
}

export const PARISH_POLYGONS: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  for (const p of PARISHES) {
    // Larger parishes get bigger polygons.
    const r = 5.5 + Math.sqrt(p.totalSchools) * 0.85;
    out[p.id] = parishPolygonPoints(p.name.length * 17 + p.totalSchools * 3, p.x, p.y, r);
  }
  return out;
})();

/* ------------------------- Funding flow Sankey (statewide) --------------- */

/** Federal → State → Parish → School type. Synthetic but coherent. */
export function buildFundingFlowSankey(): SankeyData {
  const sources = [
    { name: "Federal Title I", val: 480 },
    { name: "State MFP", val: 1850 },
    { name: "Local Property Tax", val: 920 },
    { name: "Federal IDEA", val: 210 },
    { name: "Federal Other", val: 140 },
  ];
  const buckets = [
    { name: "LDOE Pool", id: "pool" },
  ];
  // Top parishes by students get explicit nodes; rest aggregated.
  const top = [...PARISHES].sort((a, b) => b.students - a.students).slice(0, 6);
  const totals = sources.reduce((s, x) => s + x.val, 0);
  const studentTotal = PARISHES.reduce((s, p) => s + p.students, 0);

  const nodes: { name: string }[] = [
    ...sources.map((s) => ({ name: s.name })),
    ...buckets.map((b) => ({ name: b.name })),
    ...top.map((p) => ({ name: p.name })),
    { name: "Other parishes" },
    { name: "Traditional schools" },
    { name: "Charter schools" },
    { name: "CTE / Magnet" },
  ];

  const idx = {
    poolNode: sources.length, // first bucket
    parishStart: sources.length + buckets.length,
    other: sources.length + buckets.length + top.length,
    trad: sources.length + buckets.length + top.length + 1,
    charter: sources.length + buckets.length + top.length + 2,
    cte: sources.length + buckets.length + top.length + 3,
  };

  const links: { source: number; target: number; value: number }[] = [];
  // Sources → Pool
  sources.forEach((s, i) => links.push({ source: i, target: idx.poolNode, value: s.val }));

  // Pool → top parishes (proportional to students)
  let allocated = 0;
  top.forEach((p, i) => {
    const v = Math.round((p.students / studentTotal) * totals);
    allocated += v;
    links.push({ source: idx.poolNode, target: idx.parishStart + i, value: v });
  });
  links.push({ source: idx.poolNode, target: idx.other, value: Math.max(50, totals - allocated) });

  // Each parish (and "other") → school types
  const parishNodeIdxs = [...top.map((_, i) => idx.parishStart + i), idx.other];
  const parishVals = [...top.map((p) => Math.round((p.students / studentTotal) * totals)), Math.max(50, totals - allocated)];
  parishNodeIdxs.forEach((nIdx, i) => {
    const v = parishVals[i];
    links.push({ source: nIdx, target: idx.trad, value: Math.round(v * 0.74) });
    links.push({ source: nIdx, target: idx.charter, value: Math.round(v * 0.18) });
    links.push({ source: nIdx, target: idx.cte, value: Math.round(v * 0.08) });
  });

  return { nodes, links: links.filter((l) => l.value > 0) };
}

/* ------------------------- Hex-bin school density ------------------------ */

export interface HexBin {
  x: number;
  y: number;
  count: number;
  failing: number;
}

/**
 * Bins school dots into a hex grid. Used for the report-page density map and
 * (optionally) the dashboard heatmap mode.
 */
export function buildHexBins(size = 4.2): HexBin[] {
  const dots = buildSchoolDots();
  const w = size;
  const h = size * Math.sqrt(3) / 2;
  const bins = new Map<string, HexBin>();
  for (const d of dots) {
    const row = Math.round(d.y / h);
    const offset = row % 2 === 0 ? 0 : w / 2;
    const col = Math.round((d.x - offset) / w);
    const cx = col * w + offset;
    const cy = row * h;
    const key = `${col}_${row}`;
    const b = bins.get(key);
    if (b) {
      b.count++;
      if (d.failing) b.failing++;
    } else {
      bins.set(key, { x: cx, y: cy, count: 1, failing: d.failing ? 1 : 0 });
    }
  }
  return [...bins.values()];
}

/* ------------------------- Sankey: graduate outcomes --------------------- */

export interface SankeyData {
  nodes: { name: string }[];
  links: { source: number; target: number; value: number }[];
}

export function buildOutcomeSankey(parishId: string): SankeyData {
  const p = PARISHES.find((x) => x.id === parishId);
  if (!p) return { nodes: [], links: [] };
  const rand = mulberry32(p.population);
  const grads = Math.round(p.students / 13); // ~ one grade
  const onTime = Math.round(grads * (0.78 + rand() * 0.12));
  const late = grads - onTime;

  const fourYear = Math.round(onTime * (0.28 + rand() * 0.10));
  const twoYear = Math.round(onTime * (0.22 + rand() * 0.08));
  const cte = Math.round(onTime * (0.18 + rand() * 0.08));
  const workforce = Math.round(onTime * (0.18 + rand() * 0.06));
  const military = Math.round(onTime * 0.04);
  const unknown = Math.max(0, onTime - fourYear - twoYear - cte - workforce - military);

  // Outcomes from each pathway
  const indices = {
    grads: 0, onTime: 1, late: 2,
    fourYear: 3, twoYear: 4, cte: 5, workforce: 6, military: 7, unknown: 8,
    employed: 9, enrolled: 10, disconnected: 11,
  };
  const nodes = [
    { name: "Graduates" },
    { name: "On-time" },
    { name: "Late / GED" },
    { name: "4-yr College" },
    { name: "2-yr College" },
    { name: "CTE Credential" },
    { name: "Direct Workforce" },
    { name: "Military" },
    { name: "Unknown" },
    { name: "Employed @ 1yr" },
    { name: "Still enrolled" },
    { name: "Disconnected" },
  ];

  const links = [
    { source: indices.grads, target: indices.onTime, value: onTime },
    { source: indices.grads, target: indices.late, value: late },
    { source: indices.onTime, target: indices.fourYear, value: fourYear },
    { source: indices.onTime, target: indices.twoYear, value: twoYear },
    { source: indices.onTime, target: indices.cte, value: cte },
    { source: indices.onTime, target: indices.workforce, value: workforce },
    { source: indices.onTime, target: indices.military, value: military },
    { source: indices.onTime, target: indices.unknown, value: unknown },
    { source: indices.late, target: indices.workforce, value: Math.round(late * 0.45) },
    { source: indices.late, target: indices.cte, value: Math.round(late * 0.18) },
    { source: indices.late, target: indices.unknown, value: Math.round(late * 0.37) },
    // 1-year outcomes
    { source: indices.fourYear, target: indices.enrolled, value: Math.round(fourYear * 0.85) },
    { source: indices.fourYear, target: indices.disconnected, value: Math.round(fourYear * 0.15) },
    { source: indices.twoYear, target: indices.enrolled, value: Math.round(twoYear * 0.65) },
    { source: indices.twoYear, target: indices.employed, value: Math.round(twoYear * 0.25) },
    { source: indices.twoYear, target: indices.disconnected, value: Math.round(twoYear * 0.10) },
    { source: indices.cte, target: indices.employed, value: Math.round(cte * 0.75) },
    { source: indices.cte, target: indices.enrolled, value: Math.round(cte * 0.15) },
    { source: indices.cte, target: indices.disconnected, value: Math.round(cte * 0.10) },
    { source: indices.workforce, target: indices.employed, value: Math.round((workforce + late * 0.45) * 0.78) },
    { source: indices.workforce, target: indices.disconnected, value: Math.round((workforce + late * 0.45) * 0.22) },
    { source: indices.military, target: indices.employed, value: military },
    { source: indices.unknown, target: indices.disconnected, value: Math.round((unknown + late * 0.37) * 0.7) },
    { source: indices.unknown, target: indices.employed, value: Math.round((unknown + late * 0.37) * 0.3) },
  ].filter(l => l.value > 0);

  return { nodes, links };
}

/* ------------------------- Trajectory race ------------------------------- */

/** 6-year rank race across all parishes for the active layer (Health). */
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
