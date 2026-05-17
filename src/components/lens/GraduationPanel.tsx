import cohortData from "../../../public/data/cohort_by_parish.json";

type GradValue = number | string | null;

interface CohortRecord {
  parish_name: string;
  parish_slug: string;
  grad_overall: GradValue;
  grad_black: GradValue;
  grad_hispanic: GradValue;
  grad_white: GradValue;
  grad_econ_disadvantaged: GradValue;
  grad_students_w_disabilities: GradValue;
  grad_english_learner: GradValue;
  equity_gap_white_minus_black: number | null;
  cred_advanced: number;
  cred_basic: number;
  cred_combined: number;
  cred_no_credentials: number;
}

interface Props {
  /** Parish slug from the route; omit when `variant="state"`. */
  parishSlug?: string;
  /** Statewide aggregate uses the `state` row in cohort_by_parish.json. */
  variant?: "parish" | "state";
}

const STATE = (cohortData as { state: CohortRecord }).state;

function isSpecialGrad(v: GradValue): boolean {
  return typeof v === "string" && (v === "NR" || v === "~" || v.startsWith(">") || v.startsWith("<"));
}

function gradNumeric(v: GradValue): number | null {
  if (typeof v === "number") return v;
  if (v === ">95") return 95;
  if (v === "<5") return 5;
  return null;
}

function gradDisplay(v: GradValue): string {
  if (typeof v === "number") return `${v % 1 === 0 ? v : v.toFixed(1)}%`;
  if (v === null) return "—";
  return String(v);
}

function gradRateColor(v: GradValue): string {
  const n = gradNumeric(v);
  if (n === null) return "var(--text-muted)";
  if (n > 90) return "var(--sev-green)";
  if (n >= 80) return "var(--sev-yellow)";
  if (n >= 70) return "var(--sev-orange)";
  return "var(--sev-red)";
}

function advancedCredColor(n: number): string {
  if (n > 40) return "var(--sev-green)";
  if (n >= 25) return "var(--sev-yellow)";
  return "var(--sev-orange)";
}

function noCredColor(n: number): string {
  if (n < 15) return "var(--sev-green)";
  if (n <= 25) return "var(--sev-orange)";
  return "var(--sev-red)";
}

function equityGapColor(n: number): string {
  if (n < 5) return "var(--sev-green)";
  if (n <= 10) return "var(--sev-orange)";
  return "var(--sev-red)";
}

function equityGapInsufficient(parish: CohortRecord): boolean {
  if (parish.equity_gap_white_minus_black === null) return true;
  return isSpecialGrad(parish.grad_white) || isSpecialGrad(parish.grad_black);
}

function buildInsights(parish: CohortRecord, isState: boolean): string[] {
  const insights: string[] = [];
  const gap = parish.equity_gap_white_minus_black;
  if (gap !== null && gap > 10) {
    insights.push(
      isState
        ? `⚠ Significant statewide equity gap: White students graduate ${gap.toFixed(1)} points higher than Black students.`
        : `⚠ Significant equity gap: White students graduate ${gap.toFixed(1)} points higher than Black students in this parish.`,
    );
  }
  if (!isState && parish.cred_advanced < 15) {
    insights.push(
      `⚠ Only ${parish.cred_advanced}% of graduates earned advanced credentials — below the state average of ${STATE.cred_advanced}%.`,
    );
  }
  if (isState && parish.cred_advanced < 30) {
    insights.push(
      `⚠ ${parish.cred_advanced}% of graduates earned advanced credentials statewide — credential depth remains a system-wide priority.`,
    );
  }
  if (parish.cred_no_credentials > 25) {
    insights.push(
      isState
        ? `⚠ ${parish.cred_no_credentials}% of graduates statewide received a diploma with no advanced or basic credentials.`
        : `⚠ ${parish.cred_no_credentials}% of graduates received a diploma with no advanced or basic credentials.`,
    );
  }
  const overall = gradNumeric(parish.grad_overall);
  if (overall !== null && overall > 90 && parish.cred_advanced > 35) {
    insights.push(
      isState
        ? "✓ Strong statewide graduation pipeline with above-average credential attainment."
        : "✓ Strong graduation pipeline with above-average credential attainment.",
    );
  }
  return insights;
}

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-[var(--surface)] p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-[22px] font-semibold tabular-nums" style={{ color }}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">{sub}</p>
    </div>
  );
}

export function GraduationPanel({ parishSlug, variant = "parish" }: Props) {
  const isState = variant === "state";
  const parish = isState
    ? STATE
    : (cohortData as { parishes: CohortRecord[] }).parishes.find((p) => p.parish_slug === parishSlug);

  if (!parish) return null;

  const insights = buildInsights(parish, isState);
  const equityInsufficient = equityGapInsufficient(parish);

  const subgroups: { label: string; key: keyof CohortRecord; stateKey: keyof CohortRecord }[] = [
    { label: "Overall", key: "grad_overall", stateKey: "grad_overall" },
    { label: "White", key: "grad_white", stateKey: "grad_white" },
    { label: "Black/African American", key: "grad_black", stateKey: "grad_black" },
    { label: "Hispanic", key: "grad_hispanic", stateKey: "grad_hispanic" },
    {
      label: "Economically Disadvantaged",
      key: "grad_econ_disadvantaged",
      stateKey: "grad_econ_disadvantaged",
    },
    {
      label: "Students w/ Disabilities",
      key: "grad_students_w_disabilities",
      stateKey: "grad_students_w_disabilities",
    },
    { label: "English Learners", key: "grad_english_learner", stateKey: "grad_english_learner" },
  ];

  const credSegments = [
    {
      label: "Advanced credentials",
      pct: parish.cred_advanced,
      color: "var(--sev-green)",
      stateAvg: STATE.cred_advanced,
    },
    {
      label: "Basic credentials",
      pct: parish.cred_basic,
      color: "var(--sev-yellow)",
      stateAvg: STATE.cred_basic,
    },
    {
      label: "No credentials",
      pct: parish.cred_no_credentials,
      color: "var(--sev-red)",
      stateAvg: STATE.cred_no_credentials,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-[var(--surface-elevated)] p-6">
      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          LDOE · 2023–2024 & 2024–2025 cohorts · Real graduation data
        </p>
        <h2 className="mt-0.5 text-[17px] font-semibold text-foreground">
          {isState ? "Louisiana Graduation & Credential Pipeline" : "Graduation & Credential Pipeline"}
        </h2>
      </div>

      {/* Section A — KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          label="Overall Grad Rate"
          value={gradDisplay(parish.grad_overall).replace("%", "")}
          sub={isState ? "Louisiana public schools · all parishes" : `LA avg: ${STATE.grad_overall}%`}
          color={gradRateColor(parish.grad_overall)}
        />
        <KpiCard
          label="Advanced Credentials"
          value={`${parish.cred_advanced}%`}
          sub={isState ? "Workforce / college ready" : `LA avg: ${STATE.cred_advanced}%`}
          color={advancedCredColor(parish.cred_advanced)}
        />
        <KpiCard
          label="No Credentials"
          value={`${parish.cred_no_credentials}%`}
          sub={isState ? "Diploma only · not credentialed" : `LA avg: ${STATE.cred_no_credentials}%`}
          color={noCredColor(parish.cred_no_credentials)}
        />
        <KpiCard
          label="Equity Gap (White minus Black)"
          value={
            equityInsufficient
              ? "Insufficient data"
              : `+${parish.equity_gap_white_minus_black!.toFixed(1)} pts`
          }
          sub="White vs Black graduation gap"
          color={
            equityInsufficient
              ? "var(--text-muted)"
              : equityGapColor(parish.equity_gap_white_minus_black!)
          }
        />
      </div>

      {/* Section B — credential stacked bar */}
      <div className="mb-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Credential breakdown
        </p>
        <div className="flex h-8 w-full overflow-hidden rounded-full">
          {credSegments.map((seg) => (
            <div
              key={seg.label}
              style={{ width: `${seg.pct}%`, background: seg.color }}
              className="flex min-w-0 items-center justify-center text-[10px] font-semibold text-white"
              title={`${seg.label}: ${seg.pct}%`}
            >
              {seg.pct >= 12 ? `${seg.pct}%` : ""}
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--text-secondary)]">
          {credSegments.map((seg) => (
            <span key={seg.label} className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: seg.color }} />
              {isState ? seg.label : `${seg.label} · LA avg ${seg.stateAvg}%`}
            </span>
          ))}
        </div>
      </div>

      {/* Section C — subgroup bars */}
      <div className="mb-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Graduation rate by subgroup
        </p>
        <div className="flex flex-col gap-3">
          {subgroups.map(({ label, key, stateKey }) => {
            const value = parish[key] as GradValue;
            const stateVal = STATE[stateKey] as GradValue;
            const stateNum = gradNumeric(stateVal) ?? 0;
            const special = isSpecialGrad(value);
            const specialLabel = typeof value === "string" ? value : "";
            const num = gradNumeric(value);

            return (
              <div key={label} className="grid grid-cols-[minmax(0,9.5rem)_1fr_3rem] items-center gap-2 sm:grid-cols-[11rem_1fr_3.5rem]">
                <span className="text-[11px] leading-tight text-[var(--text-secondary)]">{label}</span>
                <div className="relative h-6 rounded-md bg-[var(--surface)]">
                  {special ? (
                    <div className="flex h-full w-14 items-center justify-center rounded-md bg-[#888780]/35 text-[11px] font-semibold text-[var(--text-secondary)]">
                      {specialLabel}
                    </div>
                  ) : (
                    <>
                      <div
                        className="absolute inset-y-0 left-0 rounded-md"
                        style={{
                          width: `${Math.min(100, num ?? 0)}%`,
                          background: gradRateColor(value),
                          opacity: 0.85,
                        }}
                      />
                      {!isState && stateNum > 0 && (
                        <div
                          className="absolute inset-y-0 w-0 border-l-2 border-dashed border-[var(--text-muted)]"
                          style={{ left: `${Math.min(100, stateNum)}%` }}
                          title={`LA avg: ${gradDisplay(stateVal)}`}
                        />
                      )}
                    </>
                  )}
                </div>
                <span
                  className="text-right font-mono text-[11px] tabular-nums text-foreground"
                  style={special ? { color: "var(--text-muted)" } : undefined}
                >
                  {special ? specialLabel : gradDisplay(value).replace("%", "")}
                </span>
              </div>
            );
          })}
        </div>
        {!isState && (
          <p className="mt-2 text-[10px] text-[var(--text-muted)]">
            Dashed line = Louisiana statewide average for that subgroup
          </p>
        )}
      </div>

      {/* Section D — insights */}
      {insights.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {insights.map((text) => (
            <p key={text} className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
              {text}
            </p>
          ))}
        </div>
      )}

      <p className="text-[11px] text-[var(--text-muted)]">
        Sources: LDOE 2023-2024 Cohort Graduation Rates · LDOE 2024-2025 Cohort Credential Rates · NR =
        not reported · ~ = fewer than 10 students · &gt;95 = suppressed for privacy
      </p>
    </div>
  );
}
