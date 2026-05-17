import lensData from "../../public/data/lens.json";
import enrollmentData from "../../public/data/enrollment_by_parish.json";
import cohortData from "../../public/data/cohort_by_parish.json";

type SignalKey =
  | "sped_gap"
  | "cred_gap"
  | "equity_gap"
  | "poverty"
  | "grad"
  | "ed_pct";

interface ScoredSignal {
  key: SignalKey;
  value: number;
  severity: number;
}

interface BriefCard {
  title: string;
  number: string;
  color: string;
  line1: string;
  line2: string;
  meaning: string;
}

const STATE_CRED_ADVANCED = 28.8;
const STATE_GRAD_OVERALL = 83.5;
const STATE_EQUITY_GAP = 7.4;
const STATE_POVERTY = 13.2;

const isReal = (v: unknown): v is number =>
  v !== null &&
  v !== undefined &&
  v !== "NR" &&
  v !== "~" &&
  typeof v === "number" &&
  !Number.isNaN(v);

const sevColor = (
  v: number,
  redThreshold: number,
  orangeThreshold: number,
  direction: "high-bad" | "low-bad",
) => {
  if (direction === "high-bad") {
    if (v >= redThreshold) return "#B71C1C";
    if (v >= orangeThreshold) return "#E65100";
    return "#2E7D32";
  }
  if (v <= redThreshold) return "#B71C1C";
  if (v <= orangeThreshold) return "#E65100";
  return "#2E7D32";
};

const healthColor = (s: number) =>
  s >= 70 ? "#2E7D32" : s >= 50 ? "#F57F17" : s >= 35 ? "#E65100" : "#B71C1C";

const esc = (s: string | number | undefined | null) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function buildCompositionBar(
  edPct: number | undefined,
  iepPct: number | null,
  credPct: number | undefined,
): string {
  const segments: { label: string; pct: number; color: string }[] = [];
  if (isReal(edPct)) segments.push({ label: "ED", pct: edPct, color: "#E65100" });
  if (iepPct !== null) segments.push({ label: "IEP", pct: iepPct, color: "#1F4E79" });
  if (isReal(credPct)) segments.push({ label: "Adv. credential", pct: credPct, color: "#2E7D32" });
  if (segments.length === 0) return "";

  const rows = segments
    .map(
      (s) => `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
          <span style="font-weight:600">${esc(s.label)}</span>
          <span style="font-family:monospace">${s.pct}%</span>
        </div>
        <div style="height:10px;background:#eee;border-radius:4px;overflow:hidden">
          <div style="width:${Math.min(100, s.pct)}%;height:100%;background:${s.color}"></div>
        </div>
      </div>`,
    )
    .join("");

  return `
    <section style="margin-top:28px">
      <h2 style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#555;margin:0 0 12px">Student composition</h2>
      ${rows}
      <p style="font-size:10px;color:#777;margin:8px 0 0;font-style:italic">Percentages reflect different populations — segments overlap.</p>
    </section>`;
}

export function generateFunderBrief(parishId: string): string {
  const lensParish = (
    lensData as {
      parishes: {
        name_slug: string;
        name?: string;
        school_count?: number;
        health_score?: number;
        signals?: Record<string, unknown>;
      }[];
    }
  ).parishes.find((p) => p.name_slug === parishId);

  const enrollParish = (
    enrollmentData as {
      parishes: {
        parish_slug: string;
        total_enrollment?: number;
        schools_reporting?: number;
        pct_economically_disadvantaged?: number;
        grades_k12?: Record<string, number>;
      }[];
    }
  ).parishes.find((p) => p.parish_slug === parishId);

  const cohortParish = (
    cohortData as {
      parishes: {
        parish_slug: string;
        grad_overall?: number;
        grad_white?: number;
        grad_black?: number;
        equity_gap_white_minus_black?: number | null;
        cred_advanced?: number;
        cred_no_credentials?: number;
      }[];
    }
  ).parishes.find((p) => p.parish_slug === parishId);

  const sig = (lensParish?.signals ?? {}) as Record<string, unknown>;

  if (!lensParish) {
    return `<!DOCTYPE html><html><body style="font-family:Arial;padding:40px"><h1>Parish not found</h1><p>No data for ${esc(parishId)}.</p></body></html>`;
  }

  const signals: ScoredSignal[] = [];

  if (isReal(sig.sped_teacher_gap_pct)) {
    signals.push({
      key: "sped_gap",
      value: sig.sped_teacher_gap_pct,
      severity: sig.sped_teacher_gap_pct > 40 ? 3 : sig.sped_teacher_gap_pct > 20 ? 2 : 1,
    });
  }

  if (isReal(cohortParish?.cred_advanced)) {
    signals.push({
      key: "cred_gap",
      value: cohortParish.cred_advanced,
      severity: cohortParish.cred_advanced < 15 ? 3 : cohortParish.cred_advanced < 28 ? 2 : 1,
    });
  }

  if (isReal(cohortParish?.equity_gap_white_minus_black)) {
    signals.push({
      key: "equity_gap",
      value: cohortParish.equity_gap_white_minus_black,
      severity:
        cohortParish.equity_gap_white_minus_black > 10
          ? 3
          : cohortParish.equity_gap_white_minus_black > 5
            ? 2
            : 1,
    });
  }

  if (isReal(sig.poverty_rate)) {
    signals.push({
      key: "poverty",
      value: sig.poverty_rate,
      severity: sig.poverty_rate > 20 ? 3 : sig.poverty_rate > 15 ? 2 : 1,
    });
  }

  if (isReal(cohortParish?.grad_overall)) {
    signals.push({
      key: "grad",
      value: cohortParish.grad_overall,
      severity: cohortParish.grad_overall < 80 ? 3 : cohortParish.grad_overall < 85 ? 2 : 1,
    });
  }

  if (isReal(enrollParish?.pct_economically_disadvantaged)) {
    signals.push({
      key: "ed_pct",
      value: enrollParish.pct_economically_disadvantaged,
      severity:
        enrollParish.pct_economically_disadvantaged > 70
          ? 3
          : enrollParish.pct_economically_disadvantaged > 50
            ? 2
            : 1,
    });
  }

  const top3 = signals.sort((a, b) => b.severity - a.severity).slice(0, 3);

  const buildCard = (signal: ScoredSignal): BriefCard | null => {
    switch (signal.key) {
      case "sped_gap":
        if (!isReal(sig.sped_teacher_gap_pct)) return null;
        return {
          title: "SpEd Teacher Gap",
          number: `${sig.sped_teacher_gap_pct}%`,
          color: sevColor(sig.sped_teacher_gap_pct, 40, 20, "high-bad"),
          line1: "of SpEd teachers not fully certified",
          line2: isReal(sig.sped_iep_count)
            ? `${sig.sped_iep_count.toLocaleString()} students with IEPs affected`
            : "Students with IEPs affected",
          meaning:
            sig.sped_teacher_gap_pct > 40
              ? "This is a crisis. Nearly half of special ed capacity is unqualified."
              : "More than 1 in 5 SpEd positions lacks full certification.",
        };
      case "cred_gap":
        if (!cohortParish || !isReal(cohortParish.cred_advanced)) return null;
        return {
          title: "Credential Attainment",
          number: `${cohortParish.cred_advanced}%`,
          color: sevColor(cohortParish.cred_advanced, 15, 28, "low-bad"),
          line1: "of graduates earned advanced credentials",
          line2: `State average: ${STATE_CRED_ADVANCED}% · ${isReal(cohortParish.cred_no_credentials) ? cohortParish.cred_no_credentials : "—"}% got diploma only`,
          meaning:
            cohortParish.cred_advanced < 15
              ? "Most graduates leave without credentials for Louisiana's job market."
              : "Credential attainment is below state average.",
        };
      case "equity_gap":
        if (!cohortParish || !isReal(cohortParish.equity_gap_white_minus_black)) return null;
        return {
          title: "Graduation Equity Gap",
          number: `${cohortParish.equity_gap_white_minus_black} pts`,
          color: sevColor(cohortParish.equity_gap_white_minus_black, 10, 5, "high-bad"),
          line1: "White vs Black graduation rate gap",
          line2: `White: ${cohortParish.grad_white ?? "—"}% · Black: ${cohortParish.grad_black ?? "—"}%`,
          meaning:
            cohortParish.equity_gap_white_minus_black > 10
              ? `This gap exceeds the state average of ${STATE_EQUITY_GAP} pts — a systemic issue.`
              : "Equity gap is present but near state average.",
        };
      case "poverty":
        if (!isReal(sig.poverty_rate)) return null;
        return {
          title: "Family Poverty Rate",
          number: `${sig.poverty_rate}%`,
          color: sevColor(sig.poverty_rate, 20, 15, "high-bad"),
          line1: "of families below poverty line",
          line2: `State average: ${STATE_POVERTY}% · Income: $${isReal(sig.median_household_income) ? sig.median_household_income.toLocaleString() : "—"}`,
          meaning:
            sig.poverty_rate > 20
              ? "Severe poverty is the dominant headwind for every outcome here."
              : "Above-average poverty compounds every other challenge.",
        };
      case "grad":
        if (!cohortParish || !isReal(cohortParish.grad_overall)) return null;
        return {
          title: "Graduation Rate",
          number: `${cohortParish.grad_overall}%`,
          color: sevColor(cohortParish.grad_overall, 80, 85, "low-bad"),
          line1: "cohort graduation rate",
          line2: `State average: ${STATE_GRAD_OVERALL}%`,
          meaning:
            cohortParish.grad_overall < 80
              ? "Below 80% — one in five students does not complete high school."
              : "Below state average — completion remains a challenge.",
        };
      case "ed_pct":
        if (!enrollParish || !isReal(enrollParish.pct_economically_disadvantaged)) return null;
        return {
          title: "Economic Disadvantage",
          number: `${enrollParish.pct_economically_disadvantaged}%`,
          color: sevColor(enrollParish.pct_economically_disadvantaged, 70, 50, "high-bad"),
          line1: "of students are economically disadvantaged",
          line2: enrollParish.total_enrollment
            ? `${enrollParish.total_enrollment.toLocaleString()} total students enrolled`
            : "Total students enrolled",
          meaning:
            enrollParish.pct_economically_disadvantaged > 70
              ? "Seven in ten students face economic barriers to learning daily."
              : "Majority of students face economic barriers.",
        };
      default:
        return null;
    }
  };

  const cards = top3.map(buildCard).filter((c): c is BriefCard => c !== null);

  const buildStory = () => {
    const name = lensParish.name ?? parishId;
    const enrollment = enrollParish?.total_enrollment;
    const schools = enrollParish?.schools_reporting ?? lensParish.school_count;
    const score = lensParish.health_score;

    const s1 =
      enrollment && schools && isReal(score)
        ? `${name} Parish serves ${enrollment.toLocaleString()} students across ${schools} schools with a LENS Health Score of ${score}/100.`
        : isReal(score)
          ? `${name} Parish holds a LENS Health Score of ${score}/100.`
          : `${name} Parish intelligence brief.`;

    const worst = top3[0];
    const s2map: Record<SignalKey, string> = {
      sped_gap: `One in three special education teaching positions is held by someone not fully certified to serve the parish's ${isReal(sig.sped_iep_count) ? sig.sped_iep_count.toLocaleString() : ""} students with disabilities.`,
      cred_gap: `Despite a ${cohortParish?.grad_overall ?? "—"}% graduation rate, only ${cohortParish?.cred_advanced ?? "—"}% of graduates earn credentials that signal real workforce readiness — well below the state average of ${STATE_CRED_ADVANCED}%.`,
      equity_gap: `White students graduate at ${cohortParish?.grad_white ?? "—"}% while Black students graduate at ${cohortParish?.grad_black ?? "—"}% — a ${cohortParish?.equity_gap_white_minus_black ?? "—"} point gap that exceeds the state average of ${STATE_EQUITY_GAP} points.`,
      poverty: `In a parish where ${sig.poverty_rate}% of families live below the poverty line — nearly double the state average — economic stress shapes every student outcome.`,
      grad: `Only ${cohortParish?.grad_overall}% of students complete high school — below the state average of ${STATE_GRAD_OVERALL}% — meaning one in five students enters adulthood without a diploma.`,
      ed_pct: `${enrollParish?.pct_economically_disadvantaged}% of students qualify as economically disadvantaged — making targeted investment not optional but essential.`,
    };
    const s2 = worst ? s2map[worst.key] ?? "" : "";

    const second = top3[1];
    const s3map: Record<SignalKey, string> = {
      sped_gap: `Compounding this, the SpEd teacher certification gap of ${sig.sped_teacher_gap_pct}% leaves vulnerable students without qualified support.`,
      cred_gap: `Only ${cohortParish?.cred_advanced}% of graduates earn advanced credentials — most leave without competitive workforce preparation.`,
      equity_gap: `The racial graduation gap of ${cohortParish?.equity_gap_white_minus_black} points signals unequal opportunity within the same system.`,
      poverty: `Poverty at ${sig.poverty_rate}% shapes attendance, engagement, and long-term outcomes.`,
      grad: `A graduation rate of ${cohortParish?.grad_overall}% leaves significant numbers of students without a path forward.`,
      ed_pct: `${enrollParish?.pct_economically_disadvantaged}% economic disadvantage means most families cannot fill the gaps that underfunded schools leave behind.`,
    };
    const s3 = second ? s3map[second.key] ?? "" : "";

    const s4 = "This brief surfaces the three highest-priority signals for funder consideration.";

    return [s1, s2, s3, s4].filter(Boolean).join(" ");
  };

  const decisionMap: Record<SignalKey, string> = {
    sped_gap: "Prioritize certified SpEd staffing and retention before expanding seat capacity.",
    cred_gap: "Fund credential-bearing pathways (CTE, dual enrollment, AP) tied to local employers.",
    equity_gap: "Target equity interventions where graduation gaps exceed the state average.",
    poverty: "Pair academic programs with family economic supports in high-poverty communities.",
    grad: "Invest in dropout prevention and re-engagement before celebrating headline graduation rates.",
    ed_pct: "Design interventions for economically disadvantaged students as the default, not the exception.",
  };

  const buildFinding = () => {
    if (cards.length === 0) {
      return {
        body: "Insufficient signal data to generate a composite finding for this parish.",
        decision: "Continue monitoring LENS indices and LDOE releases.",
      };
    }
    const titles = cards.map((c) => c.title).join(", ");
    const body = `Together, ${titles} describe a system under strain: ${cards.map((c) => c.meaning).join(" ")}`;
    const worst = top3[0];
    const decision = worst ? decisionMap[worst.key] : "Review parish-level data with LDOE and local leadership.";
    return { body, decision };
  };

  const g12 = enrollParish?.grades_k12;
  const kinder = g12?.kindergarten;
  const grade12 = g12?.grade_12;
  const retention = kinder && grade12 ? Math.round((grade12 / kinder) * 100) : null;
  const lost = kinder && grade12 ? kinder - grade12 : null;

  const gradeKeys = [
    "kindergarten",
    "grade_1",
    "grade_2",
    "grade_3",
    "grade_4",
    "grade_5",
    "grade_6",
    "grade_7",
    "grade_8",
    "grade_9",
    "grade_10",
    "grade_11",
    "grade_12",
  ] as const;
  const gradeLabels = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const hasFullGrades = g12 && gradeKeys.every((k) => isReal(g12[k]));

  const buildK12Funnel = () => {
    if (!hasFullGrades || !g12 || !kinder || !grade12 || retention === null || lost === null) return "";
    const values = gradeKeys.map((k) => g12[k] as number);
    const max = Math.max(...values);
    const segments = values
      .map((v, i) => {
        const t = i / (values.length - 1);
        const r = Math.round(46 + t * (183 - 46));
        const g = Math.round(125 - t * 100);
        const b = Math.round(50 - t * 30);
        const w = max > 0 ? Math.round((v / max) * 100) : 0;
        return `<rect x="${i * 52}" y="${100 - w}" width="44" height="${w}" fill="rgb(${r},${g},${b})" rx="2"><title>${gradeLabels[i]}: ${v.toLocaleString()}</title></rect>`;
      })
      .join("");
    return `
      <section style="margin-top:28px">
        <h2 style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#555;margin:0 0 12px">K–12 enrollment funnel</h2>
        <svg width="676" height="110" viewBox="0 0 676 110" style="display:block;max-width:100%">
          ${segments}
        </svg>
        <p style="font-size:12px;color:#444;margin:8px 0 0">
          ${kinder.toLocaleString()} kindergarteners → ${grade12.toLocaleString()} seniors · ${retention}% retention · ${lost.toLocaleString()} students lost across K–12
        </p>
      </section>`;
  };

  const edPct = enrollParish?.pct_economically_disadvantaged;
  const iepPct = isReal(sig.sped_iep_pct) ? sig.sped_iep_pct : null;
  const credPct = cohortParish?.cred_advanced;

  const sources: string[] = [];
  if (lensParish) sources.push("lens.json");
  if (enrollParish) sources.push("enrollment_by_parish.json");
  if (cohortParish) sources.push("cohort_by_parish.json");

  const parishName = lensParish.name ?? parishId;
  const score = lensParish.health_score ?? 0;
  const hColor = healthColor(score);
  const story = buildStory();
  const finding = buildFinding();

  const cardHtml = cards
    .map(
      (c) => `
      <div style="flex:1;min-width:200px;border:1px solid #ddd;border-radius:8px;padding:16px;background:#fafafa">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#666;margin-bottom:8px">${esc(c.title)}</div>
        <div style="font-size:36px;font-weight:700;color:${c.color};line-height:1">${esc(c.number)}</div>
        <p style="font-size:12px;color:#333;margin:8px 0 4px">${esc(c.line1)}</p>
        <p style="font-size:11px;color:#666;margin:0 0 10px">${esc(c.line2)}</p>
        <p style="font-size:11px;color:#444;margin:0;font-style:italic">${esc(c.meaning)}</p>
      </div>`,
    )
    .join("");

  const statBox = (label: string, value: string) => `
    <div style="border:1px solid #e0e0e0;border-radius:6px;padding:12px;background:#fff">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.12em;color:#888">${esc(label)}</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px;color:#1a1a1a">${esc(value)}</div>
    </div>`;

  const popStats: string[] = [];
  if (enrollParish?.total_enrollment)
    popStats.push(statBox("Students", enrollParish.total_enrollment.toLocaleString()));
  if (enrollParish?.schools_reporting ?? lensParish.school_count)
    popStats.push(
      statBox("Schools", String(enrollParish?.schools_reporting ?? lensParish.school_count)),
    );
  if (isReal(edPct)) popStats.push(statBox("ED %", `${edPct}%`));
  if (iepPct !== null) popStats.push(statBox("IEP %", `${iepPct}%`));
  if (isReal(cohortParish?.grad_overall))
    popStats.push(statBox("Grad rate", `${cohortParish.grad_overall}%`));
  if (isReal(score)) popStats.push(statBox("Health score", `${score}/100`));

  const scoreAccent =
    hColor === "#2E7D32" ? "#a5d6a7" : hColor === "#F57F17" ? "#ffe082" : "#ffab91";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>LENS Funder Brief · ${esc(parishName)} Parish</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px 24px 48px; font-family: Arial, Helvetica, sans-serif; background: #fff; color: #1a1a1a; }
    .wrap { max-width: 820px; margin: 0 auto; }
    @media print {
      body { padding: 16px; }
      .page-break { page-break-before: always; break-before: page; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header style="background:#1F4E79;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
      <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.85">LENS · Parish Intelligence Brief</p>
      <h1 style="margin:0;font-size:28px;font-weight:700">${esc(parishName)} Parish</h1>
      <p style="margin:8px 0 0;font-size:14px">Health Score: <strong style="color:${scoreAccent}">${score}/100</strong></p>
    </header>

    <main style="padding:24px 0">
      <p style="font-size:14px;line-height:1.65;color:#333;margin:0 0 28px">${esc(story)}</p>

      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:28px">
        ${cardHtml}
      </div>

      <div style="border-left:4px solid #F57F17;background:#fff8e1;padding:16px 20px;border-radius:0 6px 6px 0;margin-bottom:0">
        <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#E65100">The LENS Finding</p>
        <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#333">${esc(finding.body)}</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#1a1a1a"><strong>Decision signal:</strong> ${esc(finding.decision)}</p>
      </div>
    </main>

    <div class="page-break"></div>

    <section style="padding-top:8px">
      <h2 style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#555;margin:0 0 16px">Student population</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
        ${popStats.join("")}
      </div>

      ${buildK12Funnel()}
      ${buildCompositionBar(edPct, iepPct, credPct)}
    </section>

    <footer style="margin-top:40px;padding-top:16px;border-top:1px solid #ddd;font-size:10px;color:#777">
      <p style="margin:0 0 6px"><strong>Sources:</strong> ${sources.map(esc).join(" · ") || "—"}</p>
      <p style="margin:0">Generated by LENS · Not for public distribution · NR = not reported by LDOE (&lt;10 students)</p>
    </footer>
  </div>
</body>
</html>`;
}
