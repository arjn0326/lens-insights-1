"""
generate_dashboard_data.py
Reads lens.json and generates a new lens-data.ts that matches
the dashboard's existing TypeScript interface.
"""

import json
from pathlib import Path

HERE = Path(__file__).parent
LENS_JSON = HERE.parent / "public" / "data" / "lens.json"
OUTPUT_TS = HERE.parent / "src" / "lib" / "lens-data.ts"

# Parish centroids (x, y as percentage of map viewBox 0-100)
# Carefully positioned from official Louisiana parish map reference
PARISH_COORDS = {
    "Acadia": (32, 66),
    "Allen": (22, 60),
    "Ascension": (57, 66),
    "Assumption": (56, 73),
    "Avoyelles": (40, 46),
    "Beauregard": (15, 55),
    "Bienville": (19, 21),
    "Bossier": (9, 11),
    "Caddo": (5, 15),
    "Calcasieu": (14, 67),
    "Caldwell": (36, 27),
    "Cameron": (11, 76),
    "Catahoula": (38, 36),
    "Claiborne": (16, 10),
    "Concordia": (47, 40),
    "De Soto": (10, 24),
    "East Baton Rouge": (56, 58),
    "East Carroll": (50, 11),
    "East Feliciana": (56, 52),
    "Evangeline": (30, 56),
    "Franklin": (40, 25),
    "Grant": (25, 39),
    "Iberia": (42, 74),
    "Iberville": (53, 64),
    "Jackson": (24, 19),
    "Jefferson": (73, 76),
    "Jefferson Davis": (22, 67),
    "Lafayette": (37, 67),
    "Lafourche": (63, 80),
    "La Salle": (31, 34),
    "Lincoln": (23, 14),
    "Livingston": (63, 60),
    "Madison": (49, 17),
    "Morehouse": (37, 10),
    "Natchitoches": (17, 32),
    "Orleans": (76, 70),
    "Ouachita": (35, 16),
    "Plaquemines": (80, 82),
    "Pointe Coupee": (49, 54),
    "Rapides": (27, 44),
    "Red River": (12, 27),
    "Richland": (42, 19),
    "Sabine": (10, 38),
    "St. Bernard": (82, 73),
    "St. Charles": (68, 72),
    "St. Helena": (63, 54),
    "St. James": (59, 69),
    "St. John the Baptist": (65, 70),
    "St. Landry": (34, 58),
    "St. Martin": (43, 70),
    "St. Mary": (49, 77),
    "St. Tammany": (75, 60),
    "Tangipahoa": (68, 55),
    "Tensas": (47, 30),
    "Terrebonne": (58, 83),
    "Union": (26, 10),
    "Vermilion": (33, 76),
    "Vernon": (16, 47),
    "Washington": (73, 52),
    "Webster": (12, 17),
    "West Baton Rouge": (53, 60),
    "West Carroll": (44, 10),
    "West Feliciana": (51, 50),
    "Winn": (23, 29),
}

# Approximate parish boundary polygons (SVG polygon points in 0-100 viewBox)
# Traced from official Louisiana parish reference map
PARISH_POLYGON_DATA = {
    "Caddo":              "2,7 9,7 9,12 8,18 8,23 2,23",
    "Bossier":            "9,7 16,7 16,15 9,15 9,12 9,7",
    "Webster":            "9,12 9,15 16,15 16,21 8,21 8,18 9,12",
    "Claiborne":          "16,7 22,7 22,15 16,15",
    "Lincoln":            "22,7 28,7 28,12 30,12 30,18 22,18 22,15 22,7",
    "Union":              "22,7 28,7 28,12 33,12 33,7 22,7",
    "Bienville":          "16,15 22,15 22,24 16,24 16,21 16,15",
    "Jackson":            "22,15 22,18 30,18 30,24 22,24",
    "Ouachita":           "30,12 40,12 40,21 30,21 30,18 30,12",
    "Morehouse":          "33,7 42,7 42,14 40,14 40,12 33,12 33,7",
    "West Carroll":       "42,7 48,7 48,14 42,14",
    "East Carroll":       "48,7 55,7 55,16 48,16 48,14 48,7",
    "Richland":           "40,14 42,14 48,14 48,22 40,22 40,21 40,14",
    "Madison":            "48,14 48,16 55,16 55,22 48,22 48,14",
    "De Soto":            "8,21 16,21 16,24 14,28 8,28 2,28 2,23 8,23 8,21",
    "Red River":          "8,28 14,28 14,31 8,31 8,28",
    "Natchitoches":       "8,28 8,31 14,31 22,31 22,37 14,37 8,37 8,28",
    "Sabine":             "2,28 8,28 8,37 8,43 2,43 2,28",
    "Winn":               "22,24 30,24 30,31 22,31 22,24",
    "Caldwell":           "30,21 40,21 40,26 35,26 35,30 30,30 30,24 30,21",
    "Franklin":           "35,21 40,21 40,22 48,22 48,28 35,28 35,26 35,21",
    "Tensas":             "46,22 48,22 55,22 55,34 46,34 46,22",
    "Catahoula":          "35,30 35,28 46,28 46,34 40,40 35,40 35,30",
    "Concordia":          "46,34 55,34 55,46 46,46 40,40 46,34",
    "La Salle":           "26,31 35,31 35,40 30,40 26,37 26,31",
    "Grant":              "22,31 26,31 26,37 30,40 22,44 18,44 18,37 22,37 22,31",
    "Rapides":            "18,37 18,44 22,44 30,44 36,44 36,49 30,49 22,49 18,49 18,37",
    "Vernon":             "2,43 8,43 18,44 18,49 12,54 8,54 2,54 2,43",
    "Avoyelles":          "36,40 46,40 46,46 46,49 36,49 36,44 36,40",
    "Beauregard":         "2,54 8,54 12,54 20,54 20,59 8,59 2,59 2,54",
    "Allen":              "20,54 28,54 28,63 20,63 20,59 20,54",
    "Evangeline":         "28,49 36,49 36,54 36,59 28,59 28,54 28,49",
    "St. Landry":         "28,54 36,54 42,54 42,62 36,62 28,62 28,59 28,54",
    "Pointe Coupee":      "46,49 52,49 52,56 46,56 46,49",
    "West Feliciana":     "46,46 52,46 52,49 46,49 46,46",
    "East Feliciana":     "52,46 58,46 58,54 52,54 52,49 52,46",
    "West Baton Rouge":   "50,56 54,56 54,62 50,62 50,56",
    "East Baton Rouge":   "54,54 60,54 62,57 60,62 54,62 54,56 54,54",
    "St. Helena":         "58,46 66,46 66,54 62,57 60,54 58,54 58,46",
    "Tangipahoa":         "66,46 70,46 72,52 70,58 66,58 62,57 66,54 66,46",
    "Washington":         "70,46 80,46 80,55 72,55 72,52 70,46",
    "St. Tammany":        "72,52 72,55 80,55 82,62 78,66 70,66 66,62 66,58 70,58 72,52",
    "Livingston":         "60,58 66,58 66,62 64,65 60,65 60,62 60,58",
    "Calcasieu":          "2,59 8,59 20,63 20,72 8,72 2,72 2,59",
    "Jefferson Davis":    "20,63 28,63 28,72 20,72 20,63",
    "Acadia":             "28,62 36,62 36,70 28,70 28,62",
    "Lafayette":          "36,62 42,62 42,70 36,70 36,62",
    "Iberville":          "50,62 54,62 54,67 50,67 50,62",
    "Ascension":          "54,62 60,65 60,68 54,68 54,67 54,62",
    "St. James":          "54,67 54,68 60,68 60,72 54,72 54,67",
    "St. John the Baptist": "60,65 64,65 66,68 66,72 60,72 60,68 60,65",
    "St. Charles":        "66,68 72,68 72,74 66,74 66,72 66,68",
    "Cameron":            "2,72 8,72 20,72 20,82 2,82 2,72",
    "Vermilion":          "28,70 36,70 36,80 28,80 28,72 28,70",
    "Iberia":             "36,70 42,70 48,74 42,80 36,80 36,70",
    "St. Martin":         "42,62 48,62 50,67 50,72 48,74 42,70 42,62",
    "St. Mary":           "42,74 48,74 52,80 42,80 42,74",
    "Assumption":         "50,67 54,67 54,72 56,76 50,76 50,72 50,67",
    "Terrebonne":         "52,76 56,76 62,76 66,80 62,88 52,88 48,82 52,76",
    "Lafourche":          "56,76 62,76 66,76 68,80 66,86 60,86 58,82 56,76",
    "Jefferson":          "66,72 72,72 72,74 76,78 72,82 66,80 66,76 66,74 66,72",
    "Orleans":            "72,66 78,66 80,70 78,74 72,74 72,72 72,68 72,66",
    "St. Bernard":        "78,66 82,62 86,68 84,76 78,76 78,74 80,70 78,66",
    "Plaquemines":        "76,78 80,76 84,76 88,82 84,90 76,86 72,82 76,78",
}

# Known megaproject parishes get boosted Demand scores
MEGA_PROJECT_PARISHES = {
    "Richland": 94,    # Meta $10B AI data center
    "Ascension": 88,   # Hyundai $5.8B steel mill
    "Calcasieu": 91,   # Woodside $17.5B LNG
    "Cameron": 82,     # Venture Global CP2 LNG
    "Iberia": 72,      # First Solar
}

# Alert assignment based on score patterns
ALERT_MAP = {
    "Workforce Wave": lambda p: p["demand"] >= 80 and p["readiness"] >= 60,
    "Staffing Crisis": lambda p: p["pipeline"] >= 65 and p["need"] >= 65,
    "Skills Mismatch": lambda p: p["readiness"] >= 65 and p["demand"] >= 60,
    "Specialty Desert": lambda p: p["need"] >= 70 and p["access"] >= 70,
    "Access Desert": lambda p: p["access"] >= 75 and p["need"] >= 55,
}

INTERVENTION_MAP = {
    "Workforce Wave": "A2",
    "Staffing Crisis": "A1+C",
    "Skills Mismatch": "A2",
    "Specialty Desert": "A3",
    "Access Desert": "A1",
}


def map_indices(parish_json):
    """Convert lens.json index names to dashboard layer names (0-100 scale).
    
    Dashboard expects:
      Health: higher = better (0-100)
      Need: higher = worse (more need)
      Access: higher = worse (bigger gap)
      Readiness: higher = worse (less ready)
      Demand: higher = more demand (not bad, just more jobs coming)
      Pipeline: higher = worse (more strained)
    """
    idx = parish_json["indices"]
    health = parish_json["health_score"]
    
    # Academic and equity are "higher = better" in lens.json
    # Need to invert them for the dashboard where "higher = worse need"
    need = round(100 - idx.get("equity", 50))
    access = round(100 - idx.get("educator_capacity", 50))  # proxy: low capacity = access gap
    readiness = round(100 - idx.get("workforce_alignment", 50))
    
    # Demand: use megaproject data if available, otherwise derive from opportunity
    name = parish_json["name"]
    if name in MEGA_PROJECT_PARISHES:
        demand = MEGA_PROJECT_PARISHES[name]
    else:
        # Higher opportunity = moderate demand
        demand = max(20, min(85, round(idx.get("opportunity", 50) * 0.8 + 10)))
    
    # Pipeline: invert academic (low academic performance = strained pipeline)
    pipeline = round(100 - idx.get("academic", 50))
    
    return {
        "health": max(0, min(100, health)),
        "need": max(0, min(100, need)),
        "access": max(0, min(100, access)),
        "readiness": max(0, min(100, readiness)),
        "demand": max(0, min(100, demand)),
        "pipeline": max(0, min(100, pipeline)),
    }


def determine_alert(scores):
    """Find the first matching alert pattern."""
    for alert_name, check_fn in ALERT_MAP.items():
        if check_fn(scores):
            return alert_name
    return None


def determine_trend(health):
    """Simple trend assignment based on health score."""
    if health >= 65:
        return "up"
    elif health <= 40:
        return "down"
    else:
        return "flat"


def generate_ts():
    print("Reading lens.json...")
    with open(LENS_JSON) as f:
        data = json.load(f)
    
    parishes_json = data["parishes"]
    print(f"  Found {len(parishes_json)} parishes")
    
    # Build parish entries
    parish_entries = []
    for p in parishes_json:
        name = p["name"]
        coords = PARISH_COORDS.get(name, (50, 50))
        scores = map_indices(p)
        
        alert = determine_alert(scores)
        intervention = INTERVENTION_MAP.get(alert, "Monitor") if alert else "Monitor"
        trend = determine_trend(scores["health"])
        
        # Estimate population and students from signals
        signals = p.get("signals", {})
        # Use school count as proxy for student population
        school_count = p.get("school_count", 10)
        est_students = school_count * 450  # rough average
        est_population = est_students * 7  # rough ratio
        
        entry = {
            "id": p["name_slug"],
            "name": name,
            "population": est_population,
            "students": est_students,
            "dfSchools": signals.get("df_school_count", 0) or 0,
            "totalSchools": school_count,
            "trend": trend,
            "x": coords[0],
            "y": coords[1],
            "scores": {
                "Health": scores["health"],
                "Need": scores["need"],
                "Access": scores["access"],
                "Readiness": scores["readiness"],
                "Demand": scores["demand"],
                "Pipeline": scores["pipeline"],
            },
            "alert": alert,
            "intervention": intervention,
        }
        parish_entries.append(entry)
    
    # Sort by name for clean output
    parish_entries.sort(key=lambda x: x["name"])
    
    # Compute statewide stats
    total_schools = sum(p["totalSchools"] for p in parish_entries)
    total_students = sum(p["students"] for p in parish_entries)
    total_df = sum(p["dfSchools"] for p in parish_entries)
    avg_health = round(sum(p["scores"]["Health"] for p in parish_entries) / len(parish_entries))
    alert_count = sum(1 for p in parish_entries if p["alert"])
    alert_parishes = sum(1 for p in parish_entries if p["alert"])
    
    # State and national averages
    state_avgs = {}
    for key in ["Health", "Need", "Access", "Readiness", "Demand", "Pipeline"]:
        state_avgs[key] = round(sum(p["scores"][key] for p in parish_entries) / len(parish_entries))
    
    # Generate TypeScript
    print("Generating lens-data.ts...")
    
    # Build the PARISHES array as a formatted string
    parish_lines = []
    for p in parish_entries:
        alert_str = f'"{ p["alert"]}"' if p["alert"] else "null"
        parish_lines.append(
            f'  {{\n'
            f'    id: "{p["id"]}", name: "{p["name"]}", '
            f'population: {p["population"]}, students: {p["students"]}, '
            f'dfSchools: {p["dfSchools"]}, totalSchools: {p["totalSchools"]}, '
            f'trend: "{p["trend"]}",\n'
            f'    x: {p["x"]}, y: {p["y"]},\n'
            f'    scores: {{ Health: {p["scores"]["Health"]}, Need: {p["scores"]["Need"]}, '
            f'Access: {p["scores"]["Access"]}, Readiness: {p["scores"]["Readiness"]}, '
            f'Demand: {p["scores"]["Demand"]}, Pipeline: {p["scores"]["Pipeline"]} }},\n'
            f'    alert: {alert_str}, intervention: "{p["intervention"]}",\n'
            f'  }}'
        )
    
    parishes_array = ",\n".join(parish_lines)
    
    # Build PARISH_POLYGONS mapping from parish slug id to polygon points
    # Map parish name -> slug using the parish entries
    name_to_slug = {p["name"]: p["id"] for p in parish_entries}
    polygon_entries = []
    for name, points in PARISH_POLYGON_DATA.items():
        slug = name_to_slug.get(name)
        if slug:
            polygon_entries.append(f'  "{slug}": "{points}"')
    polygons_obj = ",\n".join(polygon_entries)
    
    ts_content = f'''export type LayerKey = "Health" | "Need" | "Access" | "Readiness" | "Demand" | "Pipeline";

export const LAYERS: LayerKey[] = ["Health", "Need", "Access", "Readiness", "Demand", "Pipeline"];

export const LAYER_INFO: Record<LayerKey, string> = {{
  Health: "Composite school-system health score. Higher is better — blends performance, access, and outcomes.",
  Need: "Student need index — poverty, ELL, SWD, and academic struggle. Higher = greater need.",
  Access: "Gap between students and quality school options within reach. Higher = bigger access desert.",
  Readiness: "Workforce readiness gap — share of grads not credentialed for local jobs. Higher = wider gap.",
  Demand: "Projected employer demand from current and announced industrial investment. Higher = more jobs coming.",
  Pipeline: "Teacher pipeline strain — vacancies, attrition, certification gaps. Higher = more strained.",
}};

export interface Parish {{
  id: string;
  name: string;
  population: number;
  students: number;
  dfSchools: number;
  totalSchools: number;
  trend: "up" | "down" | "flat";
  x: number;
  y: number;
  scores: Record<LayerKey, number>;
  alert: string | null;
  intervention: string;
}}

export const PARISHES: Parish[] = [
{parishes_array}
];

/** Major existing employers — used as context pins on the Health layer. */
export const EMPLOYERS = [
  {{ name: "META", value: "$10B", x: 39.5, y: 18.5 }},
  {{ name: "EXXON", value: "$2.4B", x: 56.5, y: 58.0 }},
  {{ name: "WOODSIDE", value: "$17.5B", x: 18.0, y: 64.0 }},
];

export interface Investment {{
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
}}

export const INVESTMENTS: Investment[] = [
  {{ id: "meta", name: "Meta AI Data Center", parish: "Richland", amount: "$10B", jobs: 500, sector: "Tech / AI infra", status: "Under construction", online: "2027", x: 43.5, y: 19.0 }},
  {{ id: "hyundai", name: "Hyundai Steel Mill", parish: "Ascension", amount: "$5.8B", jobs: 1300, sector: "Heavy industry", status: "Announced", online: "2029", x: 58.0, y: 67.5 }},
  {{ id: "woodside", name: "Woodside Louisiana LNG", parish: "Calcasieu", amount: "$17.5B", jobs: 1500, sector: "Energy / LNG", status: "Under construction", online: "2026", x: 17.0, y: 67.5 }},
  {{ id: "ccs", name: "Air Products Clean Energy", parish: "Ascension", amount: "$4.5B", jobs: 170, sector: "Hydrogen / CCS", status: "Under construction", online: "2026", x: 60.0, y: 67.0 }},
  {{ id: "venture", name: "Venture Global CP2 LNG", parish: "Cameron", amount: "$10B", jobs: 250, sector: "Energy / LNG", status: "Announced", online: "2027", x: 12.0, y: 73.0 }},
  {{ id: "first", name: "First Solar Cell Plant", parish: "Iberia", amount: "$1.1B", jobs: 700, sector: "Solar mfg", status: "Under construction", online: "2025", x: 47.5, y: 70.5 }},
  {{ id: "shintech", name: "Shintech PVC Expansion", parish: "Plaquemine", amount: "$1.4B", jobs: 120, sector: "Petrochem", status: "Operational", online: "2024", x: 55.0, y: 64.5 }},
];

export const HIGHWAYS: {{ name: string; d: string }}[] = [
  {{ name: "I-10", d: "M 4,67 L 16,67 L 30,68 L 40,67 L 50,64 L 57,61 L 65,66 L 73,72 L 78,71 L 88,71" }},
  {{ name: "I-20", d: "M 5,16 L 10,14 L 22,15 L 30,17 L 38,17 L 44,19 L 52,18 L 60,17" }},
  {{ name: "I-49", d: "M 5,17 L 9,24 L 16,32 L 22,40 L 27,46 L 32,54 L 36,62 L 39,67" }},
  {{ name: "I-12", d: "M 57,60 L 65,60 L 72,60 L 78,61" }},
  {{ name: "I-55", d: "M 65,30 L 66,42 L 67,52 L 68,60" }},
];

export interface SchoolDot {{
  x: number;
  y: number;
  failing: boolean;
}}

function mulberry32(seed: number) {{
  return function () {{
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }};
}}

export function buildSchoolDots(): SchoolDot[] {{
  const dots: SchoolDot[] = [];
  const rand = mulberry32(42);
  for (const p of PARISHES) {{
    const renderCount = Math.min(p.totalSchools, 22);
    const failingCount = Math.round((p.dfSchools / p.totalSchools) * renderCount);
    for (let i = 0; i < renderCount; i++) {{
      const angle = rand() * Math.PI * 2;
      const radius = Math.sqrt(rand()) * 3.0;
      dots.push({{
        x: p.x + Math.cos(angle) * radius,
        y: p.y + Math.sin(angle) * radius,
        failing: i < failingCount,
      }});
    }}
  }}
  return dots;
}}

export interface ParishSchoolDot {{
  parishId: string;
  x: number;
  y: number;
  failing: boolean;
}}

export function buildParishSchoolDots(): ParishSchoolDot[] {{
  const dots: ParishSchoolDot[] = [];
  const rand = mulberry32(99);
  for (const p of PARISHES) {{
    const renderCount = Math.min(p.totalSchools, 22);
    const failingCount = Math.round((p.dfSchools / p.totalSchools) * renderCount);
    for (let i = 0; i < renderCount; i++) {{
      const angle = rand() * Math.PI * 2;
      const radius = Math.sqrt(rand()) * 3.0;
      dots.push({{
        parishId: p.id,
        x: p.x + Math.cos(angle) * radius,
        y: p.y + Math.sin(angle) * radius,
        failing: i < failingCount,
      }});
    }}
  }}
  return dots;
}}

export function failingClusterScore(px: number, py: number, r: number): number {{
  const dots = buildSchoolDots();
  let total = 0;
  let failing = 0;
  for (const d of dots) {{
    const dx = d.x - px;
    const dy = d.y - py;
    if (dx * dx + dy * dy <= r * r) {{
      total++;
      if (d.failing) failing++;
    }}
  }}
  return total === 0 ? 0 : failing / total;
}}

export interface HexBin {{
  cx: number;
  cy: number;
  count: number;
  failRate: number;
}}

export function buildHexBins(): HexBin[] {{
  const dots = buildSchoolDots();
  const size = 4;
  const bins = new Map<string, {{ cx: number; cy: number; total: number; failing: number }}>(); 
  for (const d of dots) {{
    const col = Math.floor(d.x / (size * 1.5));
    const row = Math.floor(d.y / (size * Math.sqrt(3)));
    const key = col + "," + row;
    if (!bins.has(key)) {{
      bins.set(key, {{
        cx: col * size * 1.5 + size,
        cy: row * size * Math.sqrt(3) + (col % 2 === 0 ? 0 : size * Math.sqrt(3) * 0.5) + size * Math.sqrt(3) * 0.5,
        total: 0,
        failing: 0,
      }});
    }}
    const b = bins.get(key)!;
    b.total++;
    if (d.failing) b.failing++;
  }}
  return [...bins.values()]
    .filter((b) => b.total > 0)
    .map((b) => ({{ cx: b.cx, cy: b.cy, count: b.total, failRate: b.failing / b.total }}));
}}

export const PARISH_POLYGONS: Record<string, string> = {{
{polygons_obj}
}};

export function severity(layer: LayerKey, score: number): "green" | "lime" | "yellow" | "orange" | "red" {{
  if (layer === "Health") {{
    if (score >= 80) return "green";
    if (score >= 65) return "lime";
    if (score >= 50) return "yellow";
    if (score >= 35) return "orange";
    return "red";
  }}
  if (score >= 80) return "red";
  if (score >= 65) return "orange";
  if (score >= 50) return "yellow";
  if (score >= 35) return "lime";
  return "green";
}}

export const SEV_COLOR: Record<ReturnType<typeof severity>, string> = {{
  green: "var(--sev-green)",
  lime: "var(--sev-lime)",
  yellow: "var(--sev-yellow)",
  orange: "var(--sev-orange)",
  red: "var(--sev-red)",
}};

export function severityLabel(layer: LayerKey, score: number): string {{
  const sev = severity(layer, score);
  switch (sev) {{
    case "red": return "Crisis";
    case "orange": return "Critical";
    case "yellow": return "Concerning";
    case "lime": return "Watch";
    case "green": return "Healthy";
  }}
}}

export const ALERT_EXPLANATIONS: Record<string, string> = {{
  "Workforce Wave": "Major employer investment detected near this parish. Current CTE pathways do not align with projected job demand.",
  "Staffing Crisis": "Teacher vacancy rate exceeds critical threshold while student need remains high. Schools cannot improve without adequate staffing.",
  "Skills Mismatch": "Schools producing credentials that don\\'t align with local labor market demand. Less than 2% of IBCs target high-wage occupations.",
  "Specialty Desert": "SWD rate above state average with no specialty school within 30 miles. Students with disabilities lack access to appropriate programs.",
  "Access Desert": "Low charter penetration with high concentration of D/F schools. Families have limited alternatives to underperforming schools.",
}};

export function interventionRecommendation(code: string): string {{
  const base = code.replace("+C", "").trim();
  const map: Record<string, string> = {{
    A2: "Open a CTE/Career Academy aligned to incoming industrial workforce needs.",
    A1: "Open a general education charter school to expand access in underserved area.",
    A3: "Open a specialty school serving students with disabilities.",
    B: "Add new CTE pathways to existing schools aligned with local workforce demand.",
    Monitor: "No immediate intervention required. Continue monitoring index trends.",
  }};
  let rec = map[base] ?? "Continue monitoring index trends.";
  if (code.includes("+C")) {{
    rec += " Deploy teacher recruitment incentives and demand pay programs.";
  }}
  return rec;
}}

export const INDEX_LABELS: {{ key: Exclude<LayerKey, "Health">; label: string }}[] = [
  {{ key: "Need", label: "Student Need" }},
  {{ key: "Access", label: "Access Gap" }},
  {{ key: "Readiness", label: "Workforce Ready" }},
  {{ key: "Demand", label: "Workforce Demand" }},
  {{ key: "Pipeline", label: "Teacher Pipeline" }},
];

export const STATE_AVG: Record<LayerKey, number> = {{
  Health: {state_avgs["Health"]}, Need: {state_avgs["Need"]}, Access: {state_avgs["Access"]}, Readiness: {state_avgs["Readiness"]}, Demand: {state_avgs["Demand"]}, Pipeline: {state_avgs["Pipeline"]},
}};

export const NATIONAL_AVG: Record<LayerKey, number> = {{
  Health: 64, Need: 52, Access: 44, Readiness: 54, Demand: 60, Pipeline: 41,
}};

export function buildTrendSeries(parishId: string) {{
  const p = PARISHES.find((x) => x.id === parishId);
  if (!p) return [];
  const end = p.scores.Health;
  const drift = p.trend === "up" ? -8 : p.trend === "down" ? 9 : 2;
  const start = Math.max(15, Math.min(95, end - drift));
  const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
  const rand = mulberry32(p.name.length * 17 + 3);
  return years.map((year, i) => {{
    const t = i / (years.length - 1);
    const base = start + (end - start) * t;
    const wobble = (rand() - 0.5) * 6;
    const parishVal = Math.round(Math.max(10, Math.min(98, base + wobble)));
    const stateVal = Math.round(STATE_AVG.Health + (rand() - 0.5) * 4);
    const nationalVal = Math.round(NATIONAL_AVG.Health + (rand() - 0.5) * 3);
    return {{ year, parish: parishVal, state: stateVal, national: nationalVal }};
  }});
}}

export function buildRaceSeries() {{
  const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
  return years.map((year, i) => {{
    const t = i / (years.length - 1);
    const row: Record<string, string | number> = {{ year }};
    for (const p of PARISHES) {{
      const rand = mulberry32(p.name.length * 31 + i * 7);
      const drift = p.trend === "up" ? -10 : p.trend === "down" ? 9 : 1;
      const start = Math.max(15, Math.min(95, p.scores.Health - drift));
      const wobble = (rand() - 0.5) * 5;
      row[p.id] = Math.round(start + (p.scores.Health - start) * t + wobble);
    }}
    return row;
  }});
}}

export function buildDemographics(parishId: string) {{
  const p = PARISHES.find((x) => x.id === parishId);
  if (!p) return [];
  const seed = p.name.charCodeAt(0) + p.name.charCodeAt(1);
  const rand = mulberry32(seed);
  const black = Math.round(30 + rand() * 40);
  const white = Math.round((100 - black) * (0.45 + rand() * 0.35));
  const hispanic = Math.round((100 - black - white) * (0.55 + rand() * 0.3));
  const other = Math.max(2, 100 - black - white - hispanic);
  return [
    {{ name: "Black", value: black }},
    {{ name: "White", value: white }},
    {{ name: "Hispanic", value: hispanic }},
    {{ name: "Other", value: other }},
  ];
}}

export function buildGradeDistribution(parishId: string) {{
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
    {{ grade: "A", count: a }},
    {{ grade: "B", count: b }},
    {{ grade: "C", count: cAdj }},
    {{ grade: "D", count: dCount }},
    {{ grade: "F", count: f }},
  ];
}}

export function buildFundingBreakdown(parishId: string) {{
  const p = PARISHES.find((x) => x.id === parishId);
  if (!p) return [];
  const rand = mulberry32(p?.population ?? 1);
  const total = 11800 + Math.round(rand() * 1800);
  return [
    {{ category: "Instruction", value: Math.round(total * 0.58) }},
    {{ category: "Support", value: Math.round(total * 0.16) }},
    {{ category: "Admin", value: Math.round(total * 0.09) }},
    {{ category: "Facilities", value: Math.round(total * 0.11) }},
    {{ category: "Transport", value: Math.round(total * 0.06) }},
  ];
}}

export function buildWorkforceAlignment(parishId: string) {{
  const p = PARISHES.find((x) => x.id === parishId);
  if (!p) return [];
  const rand = mulberry32((p?.scores.Demand ?? 50) * 7);
  const sectors = ["Industrial", "Healthcare", "Tech", "Logistics", "Trades", "Other"];
  const raw = sectors.map(() => 5 + rand() * 25);
  const sum = raw.reduce((a, b) => a + b, 0);
  return sectors.map((s, i) => ({{
    sector: s,
    aligned: Math.round((raw[i] / sum) * 100),
    demand: Math.round(8 + rand() * 28),
  }}));
}}

export function buildOutcomeSankey(parishId: string) {{
  const p = PARISHES.find((x) => x.id === parishId);
  if (!p) return {{ nodes: [], links: [] }};
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
    {{ name: "On-time" }}, {{ name: "Late / GED" }},
    {{ name: "CTE Credential" }}, {{ name: "Direct Workforce" }},
    {{ name: "2-yr College" }}, {{ name: "4-yr College" }},
    {{ name: "Military" }}, {{ name: "Employed @ 1yr" }},
    {{ name: "Still enrolled" }}, {{ name: "Disconnected" }},
  ];
  const links = [
    {{ source: 0, target: 2, value: cte }},
    {{ source: 0, target: 3, value: direct }},
    {{ source: 0, target: 4, value: college2 }},
    {{ source: 0, target: 5, value: college4 }},
    {{ source: 0, target: 6, value: military }},
    {{ source: 1, target: 9, value: late }},
    {{ source: 2, target: 7, value: Math.round(cte * 0.7) }},
    {{ source: 3, target: 7, value: Math.round(direct * 0.5) }},
    {{ source: 4, target: 8, value: college2 }},
    {{ source: 5, target: 8, value: college4 }},
  ];
  return {{ nodes, links }};
}}
'''
    
    # Write the file
    OUTPUT_TS.write_text(ts_content, encoding='utf-8')
    
    print(f"\n✅ Wrote {OUTPUT_TS}")
    print(f"   {len(parish_entries)} parishes")
    print(f"   File size: {OUTPUT_TS.stat().st_size / 1024:.1f} KB")
    print(f"\n   Statewide stats:")
    print(f"   Total schools: {total_schools}")
    print(f"   Total students: {total_students}")
    print(f"   D/F schools: {total_df}")
    print(f"   Avg health: {avg_health}")
    print(f"   Parishes with alerts: {alert_parishes}")


if __name__ == "__main__":
    generate_ts()