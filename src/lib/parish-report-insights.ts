import cohortData from "../../public/data/cohort_by_parish.json";
import { getParishFunding } from "@/lib/funding-by-parish";
import { getParishEnrollment } from "@/lib/parish-enrollment";
import { getLensParish, PARISHES } from "@/lib/lens-data";
import { ALERT_EXPLANATIONS, interventionRecommendation } from "@/lib/lens-data";

export function getParishRecommendationCopy(parishId: string): {
  alertDetail: string | null;
  interventionDetail: string;
} {
  const parish = PARISHES.find((p) => p.id === parishId);
  const lens = getLensParish(parishId);
  const signals = lens?.signals as Record<string, number | undefined> | undefined;
  const funding = getParishFunding(parishId);
  const enroll = getParishEnrollment(parishId);
  const cohort = (
    cohortData as {
      parishes: { parish_slug: string; grad_overall: number; cred_no_credentials: number }[];
    }
  ).parishes.find((p) => p.parish_slug === parishId);

  let alertDetail: string | null = null;
  if (parish?.alert) {
    const base = ALERT_EXPLANATIONS[parish.alert] ?? "";
    const parts: string[] = [base];
    if (signals?.poverty_rate != null) {
      parts.push(
        `ACS poverty among families is ${signals.poverty_rate}% in this parish.`,
      );
    }
    if (signals?.pct_df_schools != null && signals.pct_df_schools > 0) {
      parts.push(
        `${signals.pct_df_schools.toFixed(0)}% of schools rate D/F on the latest LDOE accountability cycle.`,
      );
    }
    alertDetail = parts.filter(Boolean).join(" ");
  }

  const intervention = parish?.intervention ?? "Monitor";
  const interventionBase = interventionRecommendation(intervention);
  const interventionParts: string[] = [interventionBase];

  if (funding) {
    interventionParts.push(
      `Treasurer data puts per-pupil spend at ${funding.spend_per_pupil.toLocaleString()} (rank #${funding.rank} statewide) — align any new seats or pathways with existing MFP weighted populations.`,
    );
  }
  if (cohort) {
    interventionParts.push(
      `LDOE cohort data: ${cohort.grad_overall}% graduation with ${cohort.cred_no_credentials}% leaving with diploma only and no workforce credential — credential depth should be part of the response.`,
    );
  }
  if (enroll && signals?.sped_iep_pct != null) {
    interventionParts.push(
      `${enroll.total_enrollment.toLocaleString()} students enrolled (${signals.sped_iep_pct}% IEP) — specialty staffing and SPED-certified FTE gaps should be tracked alongside any expansion plan.`,
    );
  }

  return {
    alertDetail,
    interventionDetail: interventionParts.join(" "),
  };
}
