/** Louisiana LDOE statewide budget FY25 — sources and appropriations (billions USD). */

export interface BudgetFlowItem {
  id: string;
  label: string;
  shortLabel: string;
  amountB: number;
  pct: number;
  color: string;
  info: string;
}

export const STATE_BUDGET_FY = "FY25";
export const STATE_BUDGET_TOTAL_B = 7.3;

export const BUDGET_SOURCES: BudgetFlowItem[] = [
  {
    id: "sgf",
    label: "State General Fund",
    shortLabel: "SGF",
    amountB: 4.19,
    pct: 57.2,
    color: "#185FA5",
    info: "Louisiana's main state tax revenue — income tax, sales tax, and other general funds. This is the primary state contribution to public education.",
  },
  {
    id: "fed",
    label: "Federal Funds",
    shortLabel: "FED",
    amountB: 2.72,
    pct: 37.2,
    color: "#C68E17",
    info: "All federal education dollars flowing through LDOE — Title I, IDEA, ESEA, and related programs. Includes elevated COVID-era inflows in FY22–FY24.",
  },
  {
    id: "stat-ded",
    label: "Statutory Dedications",
    shortLabel: "STAT DED",
    amountB: 0.334,
    pct: 4.6,
    color: "#1B2A41",
    info: "Revenue legally dedicated to education by Louisiana statute — lottery proceeds and certain tax dedications. These flows are earmarked by law, not annual appropriation alone.",
  },
  {
    id: "iat",
    label: "Interagency Transfers",
    shortLabel: "IAT",
    amountB: 0.061,
    pct: 0.8,
    color: "#A32D2D",
    info: "Money transferred from other state agencies into LDOE. Example: Department of Health funds for school-based health services.",
  },
  {
    id: "fsgr",
    label: "Self-Generated Revenue",
    shortLabel: "FSGR",
    amountB: 0.019,
    pct: 0.3,
    color: "#9B7E54",
    info: "Fees, grants, and revenue LDOE generates directly — including competitive federal grants applied for by the state agency.",
  },
];

export const BUDGET_SPENDING: BudgetFlowItem[] = [
  {
    id: "mfp",
    label: "Minimum Foundation Program",
    shortLabel: "MFP",
    amountB: 4.2,
    pct: 57,
    color: "#185FA5",
    info: "Goes directly to the 64 parish school systems via the per-pupil formula. State General Fund covers about 95% of this allocation (~$4B).",
  },
  {
    id: "subgrantee",
    label: "Subgrantee Assistance",
    shortLabel: "Subgrantee",
    amountB: 2.85,
    pct: 39,
    color: "#0F6E56",
    info: "Federal grant money passed through LDOE to schools and programs — Title I, IDEA, Head Start, and similar. Federal Support Program funds about 90% (~$2.6B).",
  },
  {
    id: "state-activities",
    label: "State Activities",
    shortLabel: "State Activities",
    amountB: 0.228,
    pct: 3,
    color: "#5C6B7A",
    info: "LDOE operations: curriculum, teacher training, accountability, and the SPS scoring system. Kept at the agency rather than sent to parishes.",
  },
  {
    id: "rsd",
    label: "Recovery School District",
    shortLabel: "RSD",
    amountB: 0.027,
    pct: 0.4,
    color: "#D85A30",
    info: "Funds schools operated by the RSD in chronically failing districts. Historically centered on New Orleans post-Katrina; now used statewide where needed.",
  },
  {
    id: "non-public",
    label: "Non-Public Assistance",
    shortLabel: "Non-Public",
    amountB: 0.021,
    pct: 0.3,
    color: "#6B3FA0",
    info: "Textbooks, services, and support for private and religious schools as required by Louisiana law. Smallest share of the total budget.",
  },
];

export function formatBudgetAmount(amountB: number): string {
  if (amountB >= 1) return `$${amountB.toFixed(2)}B`;
  return `$${Math.round(amountB * 1000)}M`;
}
