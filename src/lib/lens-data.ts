export type LayerKey = "Health" | "Need" | "Access" | "Readiness" | "Demand" | "Pipeline";

export const LAYERS: LayerKey[] = ["Health", "Need", "Access", "Readiness", "Demand", "Pipeline"];

export const LENS_VERSION = "1.1.0";

export const DATA_VINTAGE = {
  ldoe_sps: "2024-2025",
  acs: "2023 5-year estimates",
  bls: "2024 annual",
} as const;

export const LAYER_INFO: Record<LayerKey, string> = {
  Health: "Weighted composite of LDOE accountability, ACS economic context, and graduation where available. Higher = stronger cross-signal resilience.",
  Need: "Inverted ACS family poverty rate (smoothed in scoring). Higher = greater economic need among families.",
  Access: "Inverted share of A-rated schools (empirical-Bayes smoothed for small parishes). Measures top-seat concentration — not drive time or charter geography.",
  Readiness: "Blend of inverted parish unemployment (BLS preferred, else ACS) and graduation gap. Higher = more labor-market / completion stress — not CTE credential match (data TBD).",
  Demand: "Curated megaproject overlay for select parishes; elsewhere a weak placeholder from opportunity signals. Replace with BLS OEWS / LED for production.",
  Pipeline: "Inverted mean school SPS — systemic performance pressure. Not teacher vacancy or certification data (add LDOE HR when available).",
};

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
}

export const PARISHES: Parish[] = [
  {
    id: "acadia", name: "Acadia", population: 56264, students: 12378, dfSchools: 4, totalSchools: 26, trend: "down",
    x: 32, y: 66,
    priorityScore: 60, uncertainty: "low",
    scores: { Health: 40, Need: 72, Access: 75, Readiness: 39, Demand: 24, Pipeline: 52 },
    alert: "Few top schools + high need", intervention: "A1",
  },
  {
    id: "allen", name: "Allen", population: 21135, students: 4649, dfSchools: 0, totalSchools: 11, trend: "flat",
    x: 22, y: 60,
    priorityScore: 41, uncertainty: "medium",
    scores: { Health: 59, Need: 82, Access: 0, Readiness: 41, Demand: 21, Pipeline: 11 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "ascension", name: "Ascension", population: 123913, students: 25600, dfSchools: 1, totalSchools: 32, trend: "up",
    x: 57, y: 66,
    priorityScore: 5, uncertainty: "low",
    scores: { Health: 95, Need: 0, Access: 0, Readiness: 10, Demand: 88, Pipeline: 3 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "assumption", name: "Assumption", population: 19993, students: 4398, dfSchools: 1, totalSchools: 6, trend: "flat",
    x: 56, y: 73,
    priorityScore: 46, uncertainty: "high",
    scores: { Health: 54, Need: 3, Access: 65, Readiness: 32, Demand: 28, Pipeline: 72 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "avoyelles", name: "Avoyelles", population: 38371, students: 8000, dfSchools: 2, totalSchools: 10, trend: "flat",
    x: 40, y: 46,
    priorityScore: 59, uncertainty: "medium",
    scores: { Health: 41, Need: 92, Access: 61, Readiness: 19, Demand: 20, Pipeline: 54 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "beauregard", name: "Beauregard", population: 36277, students: 7980, dfSchools: 1, totalSchools: 12, trend: "flat",
    x: 15, y: 55,
    priorityScore: 45, uncertainty: "medium",
    scores: { Health: 55, Need: 26, Access: 100, Readiness: 13, Demand: 45, Pipeline: 52 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "bienville", name: "Bienville", population: 12595, students: 2770, dfSchools: 0, totalSchools: 7, trend: "down",
    x: 19, y: 21,
    priorityScore: 62, uncertainty: "high",
    scores: { Health: 38, Need: 90, Access: 69, Readiness: 42, Demand: 20, Pipeline: 37 },
    alert: "Few top schools + high need", intervention: "A1",
  },
  {
    id: "bossier", name: "Bossier", population: 124180, students: 26400, dfSchools: 5, totalSchools: 33, trend: "up",
    x: 9, y: 11,
    priorityScore: 27, uncertainty: "low",
    scores: { Health: 73, Need: 13, Access: 41, Readiness: 19, Demand: 66, Pipeline: 38 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "caddo", name: "Caddo", population: 224462, students: 40800, dfSchools: 20, totalSchools: 51, trend: "flat",
    x: 5, y: 15,
    priorityScore: 59, uncertainty: "low",
    scores: { Health: 41, Need: 60, Access: 71, Readiness: 44, Demand: 46, Pipeline: 74 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "calcasieu", name: "Calcasieu", population: 199653, students: 43200, dfSchools: 6, totalSchools: 54, trend: "up",
    x: 14, y: 67,
    priorityScore: 33, uncertainty: "low",
    scores: { Health: 67, Need: 28, Access: 44, Readiness: 26, Demand: 91, Pipeline: 37 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "caldwell", name: "Caldwell", population: 9422, students: 2072, dfSchools: 2, totalSchools: 5, trend: "down",
    x: 36, y: 27,
    priorityScore: 72, uncertainty: "high",
    scores: { Health: 28, Need: 89, Access: 60, Readiness: 55, Demand: 21, Pipeline: 81 },
    alert: "Deep need + weak outcomes", intervention: "A1+C",
  },
  {
    id: "cameron", name: "Cameron", population: 4996, students: 1099, dfSchools: 0, totalSchools: 5, trend: "up",
    x: 11, y: 76,
    priorityScore: 18, uncertainty: "high",
    scores: { Health: 82, Need: 0, Access: 37, Readiness: 23, Demand: 82, Pipeline: 0 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "catahoula", name: "Catahoula", population: 8545, students: 1879, dfSchools: 0, totalSchools: 3, trend: "down",
    x: 38, y: 36,
    priorityScore: 63, uncertainty: "high",
    scores: { Health: 37, Need: 76, Access: 49, Readiness: 70, Demand: 31, Pipeline: 52 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "claiborne", name: "Claiborne", population: 13725, students: 3019, dfSchools: 3, totalSchools: 6, trend: "down",
    x: 16, y: 10,
    priorityScore: 80, uncertainty: "high",
    scores: { Health: 20, Need: 86, Access: 88, Readiness: 51, Demand: 20, Pipeline: 91 },
    alert: "Deep need + weak outcomes", intervention: "A1+C",
  },
  {
    id: "concordia", name: "Concordia", population: 17814, students: 3919, dfSchools: 3, totalSchools: 9, trend: "down",
    x: 47, y: 40,
    priorityScore: 79, uncertainty: "medium",
    scores: { Health: 21, Need: 100, Access: 76, Readiness: 65, Demand: 24, Pipeline: 75 },
    alert: "Deep need + weak outcomes", intervention: "A1+C",
  },
  {
    id: "desoto", name: "De Soto", population: 26730, students: 5880, dfSchools: 0, totalSchools: 9, trend: "up",
    x: 10, y: 24,
    priorityScore: 29, uncertainty: "medium",
    scores: { Health: 71, Need: 41, Access: 0, Readiness: 41, Demand: 29, Pipeline: 0 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "east-baton-rouge", name: "East Baton Rouge", population: 420931, students: 56000, dfSchools: 25, totalSchools: 70, trend: "flat",
    x: 56, y: 58,
    priorityScore: 57, uncertainty: "low",
    scores: { Health: 43, Need: 35, Access: 98, Readiness: 49, Demand: 72, Pipeline: 78 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "east-carroll", name: "East Carroll", population: 7037, students: 1548, dfSchools: 1, totalSchools: 2, trend: "down",
    x: 50, y: 11,
    priorityScore: 72, uncertainty: "high",
    scores: { Health: 28, Need: 100, Access: 42, Readiness: 60, Demand: 20, Pipeline: 65 },
    alert: "Deep need + weak outcomes", intervention: "A1+C",
  },
  {
    id: "east-feliciana", name: "East Feliciana", population: 19183, students: 4220, dfSchools: 1, totalSchools: 6, trend: "flat",
    x: 56, y: 52,
    priorityScore: 44, uncertainty: "high",
    scores: { Health: 56, Need: 9, Access: 65, Readiness: 36, Demand: 55, Pipeline: 72 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "evangeline", name: "Evangeline", population: 31155, students: 6854, dfSchools: 2, totalSchools: 13, trend: "down",
    x: 30, y: 56,
    priorityScore: 66, uncertainty: "medium",
    scores: { Health: 34, Need: 68, Access: 100, Readiness: 39, Demand: 20, Pipeline: 57 },
    alert: "Few top schools + high need", intervention: "A1",
  },
  {
    id: "franklin", name: "Franklin", population: 19352, students: 4257, dfSchools: 2, totalSchools: 6, trend: "down",
    x: 40, y: 25,
    priorityScore: 68, uncertainty: "high",
    scores: { Health: 32, Need: 52, Access: 88, Readiness: 35, Demand: 30, Pipeline: 100 },
    alert: "Concentrated low ratings", intervention: "A1",
  },
  {
    id: "grant", name: "Grant", population: 21285, students: 4682, dfSchools: 1, totalSchools: 7, trend: "flat",
    x: 25, y: 39,
    priorityScore: 45, uncertainty: "high",
    scores: { Health: 55, Need: 27, Access: 69, Readiness: 32, Demand: 41, Pipeline: 49 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "iberia", name: "Iberia", population: 66826, students: 14701, dfSchools: 0, totalSchools: 22, trend: "flat",
    x: 42, y: 74,
    priorityScore: 54, uncertainty: "low",
    scores: { Health: 46, Need: 50, Access: 79, Readiness: 36, Demand: 72, Pipeline: 51 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "iberville", name: "Iberville", population: 28789, students: 6333, dfSchools: 0, totalSchools: 8, trend: "flat",
    x: 53, y: 64,
    priorityScore: 59, uncertainty: "medium",
    scores: { Health: 41, Need: 51, Access: 93, Readiness: 36, Demand: 38, Pipeline: 62 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "jackson", name: "Jackson", population: 14391, students: 3166, dfSchools: 2, totalSchools: 5, trend: "down",
    x: 24, y: 19,
    priorityScore: 61, uncertainty: "high",
    scores: { Health: 39, Need: 66, Access: 60, Readiness: 35, Demand: 24, Pipeline: 75 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "jefferson", name: "Jefferson", population: 368149, students: 56800, dfSchools: 13, totalSchools: 71, trend: "flat",
    x: 73, y: 76,
    priorityScore: 45, uncertainty: "low",
    scores: { Health: 55, Need: 30, Access: 74, Readiness: 41, Demand: 65, Pipeline: 55 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "jefferson-davis", name: "Jefferson Davis", population: 31666, students: 6966, dfSchools: 0, totalSchools: 12, trend: "flat",
    x: 22, y: 67,
    priorityScore: 46, uncertainty: "medium",
    scores: { Health: 54, Need: 28, Access: 85, Readiness: 39, Demand: 36, Pipeline: 27 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "lasalle", name: "La Salle", population: 14658, students: 3224, dfSchools: 0, totalSchools: 9, trend: "up",
    x: 31, y: 34,
    priorityScore: 25, uncertainty: "medium",
    scores: { Health: 75, Need: 14, Access: 38, Readiness: 20, Demand: 41, Pipeline: 15 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "lafayette", name: "Lafayette", population: 235117, students: 33600, dfSchools: 4, totalSchools: 42, trend: "up",
    x: 37, y: 67,
    priorityScore: 25, uncertainty: "low",
    scores: { Health: 75, Need: 28, Access: 28, Readiness: 28, Demand: 75, Pipeline: 26 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "lafourche", name: "Lafourche", population: 94018, students: 20683, dfSchools: 0, totalSchools: 29, trend: "up",
    x: 63, y: 80,
    priorityScore: 21, uncertainty: "low",
    scores: { Health: 79, Need: 25, Access: 21, Readiness: 10, Demand: 49, Pipeline: 15 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "lincoln", name: "Lincoln", population: 46653, students: 9600, dfSchools: 0, totalSchools: 12, trend: "flat",
    x: 23, y: 14,
    priorityScore: 41, uncertainty: "medium",
    scores: { Health: 59, Need: 79, Access: 34, Readiness: 37, Demand: 52, Pipeline: 16 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "livingston", name: "Livingston", population: 142130, students: 31268, dfSchools: 0, totalSchools: 42, trend: "up",
    x: 63, y: 60,
    priorityScore: 18, uncertainty: "low",
    scores: { Health: 82, Need: 13, Access: 36, Readiness: 10, Demand: 62, Pipeline: 13 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "madison", name: "Madison", population: 9430, students: 2074, dfSchools: 2, totalSchools: 3, trend: "down",
    x: 49, y: 17,
    priorityScore: 90, uncertainty: "high",
    scores: { Health: 10, Need: 88, Access: 76, Readiness: 90, Demand: 20, Pipeline: 100 },
    alert: "Deep need + weak outcomes", intervention: "A1+C",
  },
  {
    id: "morehouse", name: "Morehouse", population: 24371, students: 4000, dfSchools: 2, totalSchools: 5, trend: "down",
    x: 37, y: 10,
    priorityScore: 81, uncertainty: "high",
    scores: { Health: 19, Need: 89, Access: 60, Readiness: 69, Demand: 20, Pipeline: 98 },
    alert: "Deep need + weak outcomes", intervention: "A1+C",
  },
  {
    id: "natchitoches", name: "Natchitoches", population: 36119, students: 7946, dfSchools: 0, totalSchools: 10, trend: "up",
    x: 17, y: 32,
    priorityScore: 34, uncertainty: "medium",
    scores: { Health: 66, Need: 59, Access: 6, Readiness: 35, Demand: 43, Pipeline: 17 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "orleans", name: "Orleans", population: 347213, students: 48000, dfSchools: 8, totalSchools: 60, trend: "flat",
    x: 76, y: 70,
    priorityScore: 57, uncertainty: "low",
    scores: { Health: 43, Need: 53, Access: 80, Readiness: 53, Demand: 67, Pipeline: 66 },
    alert: "Concentrated low ratings", intervention: "A1",
  },
  {
    id: "ouachita", name: "Ouachita", population: 155061, students: 28800, dfSchools: 6, totalSchools: 36, trend: "flat",
    x: 35, y: 16,
    priorityScore: 50, uncertainty: "low",
    scores: { Health: 50, Need: 65, Access: 56, Readiness: 36, Demand: 54, Pipeline: 52 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "plaquemines", name: "Plaquemines", population: 21449, students: 4718, dfSchools: 0, totalSchools: 8, trend: "up",
    x: 80, y: 82,
    priorityScore: 8, uncertainty: "medium",
    scores: { Health: 92, Need: 2, Access: 12, Readiness: 5, Demand: 65, Pipeline: 0 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "pointe-coupee", name: "Pointe Coupee", population: 19990, students: 4000, dfSchools: 1, totalSchools: 5, trend: "down",
    x: 49, y: 54,
    priorityScore: 60, uncertainty: "high",
    scores: { Health: 40, Need: 23, Access: 84, Readiness: 56, Demand: 47, Pipeline: 89 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "rapides", name: "Rapides", population: 123951, students: 27269, dfSchools: 7, totalSchools: 41, trend: "flat",
    x: 27, y: 44,
    priorityScore: 38, uncertainty: "low",
    scores: { Health: 62, Need: 44, Access: 42, Readiness: 22, Demand: 46, Pipeline: 41 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "red-river", name: "Red River", population: 7352, students: 1617, dfSchools: 1, totalSchools: 3, trend: "flat",
    x: 12, y: 27,
    priorityScore: 47, uncertainty: "high",
    scores: { Health: 53, Need: 41, Access: 49, Readiness: 45, Demand: 27, Pipeline: 36 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "richland", name: "Richland", population: 19708, students: 4335, dfSchools: 4, totalSchools: 11, trend: "down",
    x: 42, y: 19,
    priorityScore: 79, uncertainty: "medium",
    scores: { Health: 21, Need: 68, Access: 100, Readiness: 62, Demand: 94, Pipeline: 100 },
    alert: "Industrial demand + stress", intervention: "A2",
  },
  {
    id: "sabine", name: "Sabine", population: 21794, students: 4794, dfSchools: 0, totalSchools: 10, trend: "flat",
    x: 10, y: 38,
    priorityScore: 41, uncertainty: "medium",
    scores: { Health: 59, Need: 59, Access: 24, Readiness: 45, Demand: 27, Pipeline: 12 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "st-bernard", name: "St. Bernard", population: 41900, students: 8800, dfSchools: 0, totalSchools: 11, trend: "flat",
    x: 82, y: 73,
    priorityScore: 57, uncertainty: "medium",
    scores: { Health: 43, Need: 64, Access: 100, Readiness: 23, Demand: 40, Pipeline: 56 },
    alert: "Few top schools + high need", intervention: "A1",
  },
  {
    id: "st-charles", name: "St. Charles", population: 48904, students: 10758, dfSchools: 0, totalSchools: 15, trend: "up",
    x: 68, y: 72,
    priorityScore: 19, uncertainty: "low",
    scores: { Health: 81, Need: 0, Access: 62, Readiness: 8, Demand: 73, Pipeline: 14 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "st-helena", name: "St. Helena", population: 10797, students: 2375, dfSchools: 2, totalSchools: 3, trend: "down",
    x: 63, y: 54,
    priorityScore: 89, uncertainty: "high",
    scores: { Health: 11, Need: 100, Access: 76, Readiness: 78, Demand: 20, Pipeline: 100 },
    alert: "Deep need + weak outcomes", intervention: "A1+C",
  },
  {
    id: "st-james", name: "St. James", population: 19181, students: 4219, dfSchools: 0, totalSchools: 6, trend: "flat",
    x: 59, y: 69,
    priorityScore: 46, uncertainty: "high",
    scores: { Health: 54, Need: 0, Access: 88, Readiness: 37, Demand: 49, Pipeline: 64 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "st-john-the-baptist", name: "St. John the Baptist", population: 38570, students: 7200, dfSchools: 1, totalSchools: 9, trend: "flat",
    x: 65, y: 70,
    priorityScore: 57, uncertainty: "medium",
    scores: { Health: 43, Need: 3, Access: 96, Readiness: 61, Demand: 48, Pipeline: 76 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "st-landry", name: "St. Landry", population: 80344, students: 17675, dfSchools: 4, totalSchools: 29, trend: "down",
    x: 34, y: 58,
    priorityScore: 77, uncertainty: "low",
    scores: { Health: 23, Need: 88, Access: 100, Readiness: 60, Demand: 24, Pipeline: 69 },
    alert: "Deep need + weak outcomes", intervention: "A1+C",
  },
  {
    id: "st-martin", name: "St. Martin", population: 50413, students: 11090, dfSchools: 2, totalSchools: 15, trend: "flat",
    x: 43, y: 70,
    priorityScore: 50, uncertainty: "low",
    scores: { Health: 50, Need: 13, Access: 77, Readiness: 38, Demand: 37, Pipeline: 72 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "st-mary", name: "St. Mary", population: 45459, students: 10000, dfSchools: 2, totalSchools: 21, trend: "flat",
    x: 49, y: 77,
    priorityScore: 49, uncertainty: "low",
    scores: { Health: 51, Need: 65, Access: 52, Readiness: 29, Demand: 29, Pipeline: 39 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "st-tammany", name: "St. Tammany", population: 260193, students: 44000, dfSchools: 3, totalSchools: 55, trend: "up",
    x: 75, y: 60,
    priorityScore: 26, uncertainty: "low",
    scores: { Health: 74, Need: 4, Access: 51, Readiness: 34, Demand: 85, Pipeline: 32 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "tangipahoa", name: "Tangipahoa", population: 133210, students: 24800, dfSchools: 6, totalSchools: 31, trend: "down",
    x: 68, y: 55,
    priorityScore: 65, uncertainty: "low",
    scores: { Health: 35, Need: 37, Access: 100, Readiness: 49, Demand: 44, Pipeline: 88 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "tensas", name: "Tensas", population: 3899, students: 857, dfSchools: 0, totalSchools: 2, trend: "down",
    x: 47, y: 30,
    priorityScore: 81, uncertainty: "high",
    scores: { Health: 19, Need: 100, Access: 71, Readiness: 66, Demand: 20, Pipeline: 80 },
    alert: "Deep need + weak outcomes", intervention: "A1+C",
  },
  {
    id: "terrebonne", name: "Terrebonne", population: 102748, students: 20800, dfSchools: 0, totalSchools: 26, trend: "up",
    x: 58, y: 83,
    priorityScore: 34, uncertainty: "low",
    scores: { Health: 66, Need: 25, Access: 43, Readiness: 34, Demand: 47, Pipeline: 30 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "union", name: "Union", population: 20126, students: 2400, dfSchools: 2, totalSchools: 3, trend: "down",
    x: 26, y: 10,
    priorityScore: 81, uncertainty: "high",
    scores: { Health: 19, Need: 92, Access: 76, Readiness: 66, Demand: 23, Pipeline: 92 },
    alert: "Deep need + weak outcomes", intervention: "A1+C",
  },
  {
    id: "vermilion", name: "Vermilion", population: 55390, students: 12185, dfSchools: 0, totalSchools: 20, trend: "up",
    x: 33, y: 76,
    priorityScore: 29, uncertainty: "low",
    scores: { Health: 71, Need: 53, Access: 0, Readiness: 32, Demand: 38, Pipeline: 10 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "vernon", name: "Vernon", population: 45585, students: 10028, dfSchools: 0, totalSchools: 18, trend: "up",
    x: 16, y: 47,
    priorityScore: 27, uncertainty: "low",
    scores: { Health: 73, Need: 48, Access: 3, Readiness: 26, Demand: 42, Pipeline: 10 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "washington", name: "Washington", population: 44827, students: 8000, dfSchools: 0, totalSchools: 10, trend: "down",
    x: 73, y: 52,
    priorityScore: 70, uncertainty: "medium",
    scores: { Health: 30, Need: 69, Access: 98, Readiness: 49, Demand: 22, Pipeline: 67 },
    alert: "Deep need + weak outcomes", intervention: "A1+C",
  },
  {
    id: "webster", name: "Webster", population: 35457, students: 7800, dfSchools: 4, totalSchools: 14, trend: "down",
    x: 12, y: 17,
    priorityScore: 73, uncertainty: "medium",
    scores: { Health: 27, Need: 65, Access: 90, Readiness: 49, Demand: 20, Pipeline: 86 },
    alert: "Few top schools + high need", intervention: "A1",
  },
  {
    id: "west-baton-rouge", name: "West Baton Rouge", population: 27558, students: 6062, dfSchools: 0, totalSchools: 10, trend: "up",
    x: 53, y: 60,
    priorityScore: 26, uncertainty: "medium",
    scores: { Health: 74, Need: 0, Access: 61, Readiness: 16, Demand: 68, Pipeline: 36 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "west-carroll", name: "West Carroll", population: 9389, students: 2065, dfSchools: 0, totalSchools: 3, trend: "flat",
    x: 44, y: 10,
    priorityScore: 49, uncertainty: "high",
    scores: { Health: 51, Need: 9, Access: 49, Readiness: 66, Demand: 29, Pipeline: 43 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "west-feliciana", name: "West Feliciana", population: 15085, students: 3200, dfSchools: 0, totalSchools: 4, trend: "up",
    x: 51, y: 50,
    priorityScore: 6, uncertainty: "high",
    scores: { Health: 94, Need: 5, Access: 5, Readiness: 0, Demand: 62, Pipeline: 0 },
    alert: null, intervention: "Monitor",
  },
  {
    id: "winn", name: "Winn", population: 12536, students: 2757, dfSchools: 1, totalSchools: 5, trend: "down",
    x: 23, y: 29,
    priorityScore: 61, uncertainty: "high",
    scores: { Health: 39, Need: 49, Access: 84, Readiness: 50, Demand: 27, Pipeline: 55 },
    alert: null, intervention: "Monitor",
  }
];

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

export const PARISH_POLYGONS: Record<string, string> = {
  "caddo": "2,7 9,7 9,12 8,18 8,23 2,23",
  "bossier": "9,7 16,7 16,15 9,15 9,12 9,7",
  "webster": "9,12 9,15 16,15 16,21 8,21 8,18 9,12",
  "claiborne": "16,7 22,7 22,15 16,15",
  "lincoln": "22,7 28,7 28,12 30,12 30,18 22,18 22,15 22,7",
  "union": "22,7 28,7 28,12 33,12 33,7 22,7",
  "bienville": "16,15 22,15 22,24 16,24 16,21 16,15",
  "jackson": "22,15 22,18 30,18 30,24 22,24",
  "ouachita": "30,12 40,12 40,21 30,21 30,18 30,12",
  "morehouse": "33,7 42,7 42,14 40,14 40,12 33,12 33,7",
  "west-carroll": "42,7 48,7 48,14 42,14",
  "east-carroll": "48,7 55,7 55,16 48,16 48,14 48,7",
  "richland": "40,14 42,14 48,14 48,22 40,22 40,21 40,14",
  "madison": "48,14 48,16 55,16 55,22 48,22 48,14",
  "desoto": "8,21 16,21 16,24 14,28 8,28 2,28 2,23 8,23 8,21",
  "red-river": "8,28 14,28 14,31 8,31 8,28",
  "natchitoches": "8,28 8,31 14,31 22,31 22,37 14,37 8,37 8,28",
  "sabine": "2,28 8,28 8,37 8,43 2,43 2,28",
  "winn": "22,24 30,24 30,31 22,31 22,24",
  "caldwell": "30,21 40,21 40,26 35,26 35,30 30,30 30,24 30,21",
  "franklin": "35,21 40,21 40,22 48,22 48,28 35,28 35,26 35,21",
  "tensas": "46,22 48,22 55,22 55,34 46,34 46,22",
  "catahoula": "35,30 35,28 46,28 46,34 40,40 35,40 35,30",
  "concordia": "46,34 55,34 55,46 46,46 40,40 46,34",
  "lasalle": "26,31 35,31 35,40 30,40 26,37 26,31",
  "grant": "22,31 26,31 26,37 30,40 22,44 18,44 18,37 22,37 22,31",
  "rapides": "18,37 18,44 22,44 30,44 36,44 36,49 30,49 22,49 18,49 18,37",
  "vernon": "2,43 8,43 18,44 18,49 12,54 8,54 2,54 2,43",
  "avoyelles": "36,40 46,40 46,46 46,49 36,49 36,44 36,40",
  "beauregard": "2,54 8,54 12,54 20,54 20,59 8,59 2,59 2,54",
  "allen": "20,54 28,54 28,63 20,63 20,59 20,54",
  "evangeline": "28,49 36,49 36,54 36,59 28,59 28,54 28,49",
  "st-landry": "28,54 36,54 42,54 42,62 36,62 28,62 28,59 28,54",
  "pointe-coupee": "46,49 52,49 52,56 46,56 46,49",
  "west-feliciana": "46,46 52,46 52,49 46,49 46,46",
  "east-feliciana": "52,46 58,46 58,54 52,54 52,49 52,46",
  "west-baton-rouge": "50,56 54,56 54,62 50,62 50,56",
  "east-baton-rouge": "54,54 60,54 62,57 60,62 54,62 54,56 54,54",
  "st-helena": "58,46 66,46 66,54 62,57 60,54 58,54 58,46",
  "tangipahoa": "66,46 70,46 72,52 70,58 66,58 62,57 66,54 66,46",
  "washington": "70,46 80,46 80,55 72,55 72,52 70,46",
  "st-tammany": "72,52 72,55 80,55 82,62 78,66 70,66 66,62 66,58 70,58 72,52",
  "livingston": "60,58 66,58 66,62 64,65 60,65 60,62 60,58",
  "calcasieu": "2,59 8,59 20,63 20,72 8,72 2,72 2,59",
  "jefferson-davis": "20,63 28,63 28,72 20,72 20,63",
  "acadia": "28,62 36,62 36,70 28,70 28,62",
  "lafayette": "36,62 42,62 42,70 36,70 36,62",
  "iberville": "50,62 54,62 54,67 50,67 50,62",
  "ascension": "54,62 60,65 60,68 54,68 54,67 54,62",
  "st-james": "54,67 54,68 60,68 60,72 54,72 54,67",
  "st-john-the-baptist": "60,65 64,65 66,68 66,72 60,72 60,68 60,65",
  "st-charles": "66,68 72,68 72,74 66,74 66,72 66,68",
  "cameron": "2,72 8,72 20,72 20,82 2,82 2,72",
  "vermilion": "28,70 36,70 36,80 28,80 28,72 28,70",
  "iberia": "36,70 42,70 48,74 42,80 36,80 36,70",
  "st-martin": "42,62 48,62 50,67 50,72 48,74 42,70 42,62",
  "st-mary": "42,74 48,74 52,80 42,80 42,74",
  "assumption": "50,67 54,67 54,72 56,76 50,76 50,72 50,67",
  "terrebonne": "52,76 56,76 62,76 66,80 62,88 52,88 48,82 52,76",
  "lafourche": "56,76 62,76 66,76 68,80 66,86 60,86 58,82 56,76",
  "jefferson": "66,72 72,72 72,74 76,78 72,82 66,80 66,76 66,74 66,72",
  "orleans": "72,66 78,66 80,70 78,74 72,74 72,72 72,68 72,66",
  "st-bernard": "78,66 82,62 86,68 84,76 78,76 78,74 80,70 78,66",
  "plaquemines": "76,78 80,76 84,76 88,82 84,90 76,86 72,82 76,78"
};

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
  "Charts labeled illustrative use seeded synthetic series for demo storytelling only. Parish scores and D/F counts come from the LENS pipeline (lens.json).";

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

export const STATE_AVG: Record<LayerKey, number> = {
  Health: 50, Need: 47, Access: 60, Readiness: 39, Demand: 43, Pipeline: 51,
};

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
