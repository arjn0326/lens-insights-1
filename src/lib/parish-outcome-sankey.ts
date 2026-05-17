import cohortData from "../../public/data/cohort_by_parish.json";
import collegeData from "../../public/data/college_enrollment.json";
import { getParishEnrollment } from "@/lib/parish-enrollment";
import { PARISHES } from "@/lib/lens-data";

type CohortRow = {
  parish_slug: string;
  grad_overall: number | string;
  cred_advanced: number | string;
  cred_basic: number;
  cred_no_credentials: number;
};

function parsePct(v: number | string): number {
  if (typeof v === "number") return v;
  if (v === "<5") return 4;
  if (v.startsWith("<")) return 3;
  if (v.startsWith(">")) return 92;
  return 0;
}

function gradPct(v: number | string): number {
  if (typeof v === "number") return v;
  if (v === ">95") return 95;
  return 83.5;
}

export interface OutcomeSankey {
  nodes: { name: string }[];
  links: { source: number; target: number; value: number }[];
  /** Estimated graduating class size (denominator for pathway %) */
  gradClass: number;
}

/** Graduate outcome flow from LDOE cohort credential rates + college enrollment. */
export function buildOutcomeSankeyFromCohort(parishId: string): OutcomeSankey {
  const parish = PARISHES.find((p) => p.id === parishId);
  const enroll = getParishEnrollment(parishId);
  const cohort = (cohortData as { parishes: CohortRow[] }).parishes.find(
    (p) => p.parish_slug === parishId,
  );
  const college = (collegeData as { bySlug: Record<string, { avgRate: number }> }).bySlug[
    parishId
  ];

  if (!parish || !cohort) {
    return { nodes: [], links: [], gradClass: 0 };
  }

  const students = enroll?.total_enrollment ?? parish.students;
  const gradClass = Math.max(20, Math.round(students * 0.085));
  const gradRate = gradPct(cohort.grad_overall) / 100;
  const onTime = Math.max(1, Math.round(gradClass * gradRate * 0.94));
  const late = Math.max(0, gradClass - onTime);

  const advanced = parsePct(cohort.cred_advanced) / 100;
  const basic = cohort.cred_basic / 100;
  const noCred = cohort.cred_no_credentials / 100;
  const collegeRate = (college?.avgRate ?? 52) / 100;

  let collegeTotal = Math.round(onTime * collegeRate);
  let college4 = Math.round(collegeTotal * 0.58);
  let college2 = collegeTotal - college4;
  let cte = Math.round(onTime * advanced * 0.85);
  let direct = Math.round(onTime * basic * 0.55);
  let military = Math.max(0, Math.round(onTime * 0.015));

  let pathSum = collegeTotal + cte + direct + military;
  if (pathSum > onTime) {
    const scale = onTime / pathSum;
    collegeTotal = Math.round(collegeTotal * scale);
    college4 = Math.round(college4 * scale);
    college2 = collegeTotal - college4;
    cte = Math.round(cte * scale);
    direct = Math.round(direct * scale);
    military = Math.max(0, Math.round(military * scale));
  }

  const employed = Math.round(cte * 0.62 + direct * 0.48);
  const disconnected = Math.max(0, Math.round(onTime * noCred * 0.7) + late);

  const nodes = [
    { name: "On-time grads" },
    { name: "Late / GED" },
    { name: "CTE credential" },
    { name: "Direct workforce" },
    { name: "2-yr college" },
    { name: "4-yr college" },
    { name: "Military" },
    { name: "Employed @ 1yr" },
    { name: "Still enrolled" },
    { name: "Disconnected" },
  ];

  const links = [
    { source: 0, target: 2, value: Math.max(1, cte) },
    { source: 0, target: 3, value: Math.max(1, direct) },
    { source: 0, target: 4, value: Math.max(0, college2) },
    { source: 0, target: 5, value: Math.max(0, college4) },
    { source: 0, target: 6, value: Math.max(0, military) },
    { source: 1, target: 9, value: Math.max(1, disconnected) },
    { source: 2, target: 7, value: Math.max(1, Math.round(cte * 0.62)) },
    { source: 3, target: 7, value: Math.max(1, Math.round(direct * 0.48)) },
    { source: 4, target: 8, value: Math.max(0, college2) },
    { source: 5, target: 8, value: Math.max(0, college4) },
  ].filter((l) => l.value > 0);

  return { nodes, links, gradClass };
}
