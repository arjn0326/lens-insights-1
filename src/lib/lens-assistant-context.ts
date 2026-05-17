import lensData from "../../public/data/lens.json";
import enrollmentData from "../../public/data/enrollment_by_parish.json";
import cohortData from "../../public/data/cohort_by_parish.json";
import fundingData from "../../public/data/funding_by_parish.json";
import { INVESTMENTS } from "@/lib/lens-data";

type LensParish = {
  name: string;
  name_slug: string;
  health_score: number;
  priority_score: number;
  indices: Record<string, number>;
  signals: Record<string, number | string | null>;
  alerts?: { label: string }[];
  intervention?: { label: string };
};

type EnrollParish = {
  parish_slug: string;
  total_enrollment: number;
  schools_reporting: number;
  pct_economically_disadvantaged: number;
};

type CohortParish = {
  parish_slug: string;
  grad_overall: number | string;
  cred_advanced: number | string;
  cred_no_credentials: number | string;
  equity_gap_white_minus_black: number | null;
  grad_white?: number | string;
  grad_black?: number | string;
};

const STATE_GRAD = 83.5;
const STATE_CRED_ADV = 28.8;

function fmtVal(v: unknown): string {
  if (v === null || v === undefined || v === "NR" || v === "~") return "NR";
  return String(v);
}

function buildParishBlock(
  p: LensParish,
  enroll?: EnrollParish,
  cohort?: CohortParish,
  funding?: { spend_per_pupil: number; rank: number },
): string {
  const s = p.signals;
  const inv = INVESTMENTS.filter((i) => i.parish.toLowerCase() === p.name.toLowerCase());
  const lines = [
    `=== ${p.name.toUpperCase()} PARISH (slug: ${p.name_slug}) ===`,
    `Health: ${p.health_score}/100 | Priority: ${p.priority_score}`,
    `Indices — academic: ${p.indices.academic} | equity: ${p.indices.equity} | workforce: ${p.indices.workforce_alignment} | educator: ${p.indices.educator_capacity} | opportunity: ${p.indices.opportunity} | graduation: ${p.indices.graduation}`,
    `Schools: ${s.df_school_count} D/F (${s.pct_df_schools}%) | ${s.a_school_count} A-rated | ${s.aus_school_count} on AUS track | SPS avg ${s.avg_sps_2025}`,
    `Community: poverty ${s.poverty_rate}% | unemployment ${s.unemployment_rate_bls}% | median income $${Number(s.median_household_income).toLocaleString()} | pop ${Number(s.population_total).toLocaleString()}`,
    `SPED: ${s.sped_iep_pct}% IEP (${s.sped_iep_count} students) | teacher cert gap ${s.sped_teacher_gap_pct}%`,
  ];
  if (enroll) {
    lines.push(
      `Enrollment (LDOE): ${enroll.total_enrollment.toLocaleString()} students | ${enroll.schools_reporting} schools | ${enroll.pct_economically_disadvantaged}% economically disadvantaged`,
    );
  }
  if (cohort) {
    lines.push(
      `Cohort: grad ${fmtVal(cohort.grad_overall)}% | advanced cred ${fmtVal(cohort.cred_advanced)}% | diploma-only ${fmtVal(cohort.cred_no_credentials)}% | equity gap (W−B) ${fmtVal(cohort.equity_gap_white_minus_black)} pts`,
    );
  }
  if (funding) {
    lines.push(`Funding: $${funding.spend_per_pupil.toLocaleString()}/pupil (rank #${funding.rank} statewide)`);
  }
  if (inv.length) {
    lines.push(
      `Major investments: ${inv.map((i) => `${i.name} ${i.amount} (${i.sector}, ${i.status})`).join("; ")}`,
    );
  }
  if (p.alerts?.length) {
    lines.push(`Alerts: ${p.alerts.map((a) => a.label).join(" | ")}`);
  }
  if (p.intervention) {
    lines.push(`Intervention: ${p.intervention.label}`);
  }
  return lines.join("\n");
}

export function buildSystemPrompt(focusSlug?: string | null): string {
  const parishes = lensData.parishes as LensParish[];
  const enrollMap = new Map(
    (enrollmentData.parishes as EnrollParish[]).map((p) => [p.parish_slug, p]),
  );
  const cohortMap = new Map(
    (cohortData.parishes as CohortParish[]).map((p) => [p.parish_slug, p]),
  );
  const fundingMap = new Map(
    (fundingData.parishes as { parish_slug: string; spend_per_pupil: number; rank: number }[]).map(
      (p) => [p.parish_slug, p],
    ),
  );

  let focusBlock = "";
  if (focusSlug) {
    const p = parishes.find((x) => x.name_slug === focusSlug);
    if (p) {
      focusBlock = `\n\nFOCUS PARISH (user asked about this parish — prioritize it, cite its numbers first):\n${buildParishBlock(p, enrollMap.get(focusSlug), cohortMap.get(focusSlug), fundingMap.get(focusSlug))}\n`;
    }
  }

  const summaryLines = parishes
    .map((p) => {
      const e = enrollMap.get(p.name_slug);
      const c = cohortMap.get(p.name_slug);
      return `${p.name}(${p.name_slug}): health=${p.health_score} poverty=${p.signals.poverty_rate}% df=${p.signals.pct_df_schools}% aus=${p.signals.aus_school_count} grad=${fmtVal(c?.grad_overall ?? p.signals.grad_rate_parish_mean)}% cred_adv=${fmtVal(c?.cred_advanced)}% enroll=${e?.total_enrollment ?? "?"}`;
    })
    .join("\n");

  return `You are LENS AI, a Louisiana K-12 education intelligence analyst. You reason across multiple data sources (LDOE, ACS, BLS, Treasurer) and combine them into clear answers for funders and policymakers.

STATE BENCHMARKS: grad ${STATE_GRAD}% | advanced credentials ${STATE_CRED_ADV}%

ALL 64 PARISHES (compact):
${summaryLines}
${focusBlock}

ANSWER FORMAT (important):
1. Open with 2–3 sentences of reasoning that connect the relevant metrics (not just listing stats).
2. Include 1–2 short **Data snapshots** on their own lines, like:
   📊 Richland · Health 21/100 · 36% D/F schools · 48.6% diploma-only
   Keep each snapshot under 18 words — real numbers only.
3. Use bullets for comparisons when helpful.
4. End with exactly one line: **Decision signal:** [one actionable sentence for a funder]

RULES:
- Only cite numbers from the data above. If missing, say so briefly.
- Flag aus > 0, teacher_gap > 40%, poverty > 20%, grad < 80%, health < 35 as urgency signals.
- When user @mentions a parish, treat minor spelling errors as resolved (e.g. richlnd → Richland).
- Length: 120–220 words — substantive but not a wall of text.
- Tone: confident, plain English, no jargon without explanation.`;
}

export function getSuggestedQuestions(focusSlug?: string | null): string[] {
  if (focusSlug === "richland") {
    return [
      "What's driving Richland's health score of 21?",
      "How ready are Richland grads for the Meta workforce pipeline?",
      "Compare Richland poverty and school quality — what's the story?",
      "Which Richland outcomes should worry a funder most?",
    ];
  }
  if (focusSlug) {
    const name =
      (lensData.parishes as LensParish[]).find((p) => p.name_slug === focusSlug)?.name ?? focusSlug;
    return [
      `What is ${name}'s biggest systemic risk right now?`,
      `How does ${name} compare to the state on graduation and credentials?`,
      `Where should a funder intervene first in ${name}?`,
      `Summarize ${name} in three data-backed sentences.`,
    ];
  }
  return [
    "Which parishes have the lowest health scores?",
    "Where is the special ed teacher gap worst?",
    "Compare Orleans and East Baton Rouge on poverty and outcomes",
    "Which parishes have schools on AUS status?",
  ];
}

/** Best demo question for screen recording (Richland + Meta narrative) */
export const DEMO_RICHLAND_QUESTION =
  "@Richland Meta is investing $10B nearby — where is the biggest gap between student outcomes and workforce demand?";
