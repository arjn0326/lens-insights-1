import { getMfpParish, formatMfpMillions, type MfpParishRecord } from "@/lib/mfp-by-parish";

interface Props {
  parishSlug: string;
}

function edColor(pct: number): string {
  if (pct > 70) return "var(--sev-red)";
  if (pct >= 50) return "var(--sev-orange)";
  return "var(--sev-green)";
}

function swdColor(pct: number): string {
  if (pct > 15) return "var(--sev-orange)";
  if (pct >= 10) return "#C4A000";
  return "var(--sev-green)";
}

function formatPerPupil(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function MfpKpiCard({
  title,
  topValue,
  topColor,
  borderColor,
  lines,
}: {
  title: string;
  topValue: string;
  topColor: string;
  borderColor: string;
  lines: string[];
}) {
  return (
    <div
      className="rounded-xl border border-border bg-[var(--surface-elevated)] p-4 shadow-card"
      style={{ borderTopWidth: 4, borderTopColor: borderColor }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {title}
      </p>
      <p
        className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight"
        style={{ color: topColor }}
      >
        {topValue}
      </p>
      <div className="mt-2 space-y-0.5">
        {lines.map((line) => (
          <p key={line} className="text-[11px] text-[var(--text-secondary)]">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

export function MFPFundingPanel({ parishSlug }: Props) {
  const parish = getMfpParish(parishSlug);
  if (!parish) return null;

  return <MFPFundingContent parish={parish} />;
}

function MFPFundingContent({ parish }: { parish: MfpParishRecord }) {
  const edAccent = edColor(parish.ed.pct);
  const swdAccent = swdColor(parish.swd.pct);
  const hasGifted = parish.gifted.pct > 0 || parish.gifted.count > 0;

  const barSegments = [
    { pct: parish.ed.pct, color: edAccent, label: "ED" },
    { pct: parish.cte.pct, color: "var(--blue)", label: "CTE" },
    { pct: parish.swd.pct, color: swdAccent, label: "SWD" },
    ...(hasGifted
      ? [{ pct: parish.gifted.pct, color: "var(--sev-green)", label: "Gifted" }]
      : []),
  ];
  const barTotalPct = barSegments.reduce((s, seg) => s + seg.pct, 0);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-[var(--surface-elevated)] shadow-card">
      <div className="border-b border-border/80 px-5 py-4">
        <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
          MFP Weighted Funding Profile
        </h3>
        <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
          FY2025-26 · State allocations for weighted student populations · Source: Louisiana LDOE
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <MfpKpiCard
          title="Economically Disadvantaged"
          topValue={`${parish.ed.pct}%`}
          topColor={edAccent}
          borderColor={edAccent}
          lines={[
            `${parish.ed.count.toLocaleString()} students`,
            `$${formatPerPupil(parish.ed.per_pupil)} per pupil`,
            `${formatMfpMillions(parish.ed.allocation)} state allocation`,
          ]}
        />
        <MfpKpiCard
          title="Career & Technical Education"
          topValue={`${parish.cte.pct}%`}
          topColor="var(--blue)"
          borderColor="var(--blue)"
          lines={[
            `${parish.cte.units.toLocaleString()} CTE units`,
            `$${formatPerPupil(parish.cte.per_unit)} per unit`,
            `${formatMfpMillions(parish.cte.allocation)} state allocation`,
          ]}
        />
        <MfpKpiCard
          title="Students with Disabilities"
          topValue={`${parish.swd.pct}%`}
          topColor={swdAccent}
          borderColor={swdAccent}
          lines={[
            `${parish.swd.count.toLocaleString()} students`,
            `$${formatPerPupil(parish.swd.per_pupil)} per pupil`,
            `${formatMfpMillions(parish.swd.allocation)} state allocation`,
          ]}
        />
        <MfpKpiCard
          title="Gifted & Talented"
          topValue={hasGifted ? `${parish.gifted.pct}%` : "N/A"}
          topColor="var(--sev-green)"
          borderColor="var(--sev-green)"
          lines={
            hasGifted
              ? [
                  `${parish.gifted.count.toLocaleString()} students`,
                  `$${formatPerPupil(parish.gifted.per_pupil)} per pupil`,
                  `${formatMfpMillions(parish.gifted.allocation)} state allocation`,
                ]
              : ["Not included in current LDOE export"]
          }
        />
      </div>

      <div className="border-t border-border/80 px-5 pb-5 pt-1">
        <p className="mb-2 text-[11px] font-medium text-foreground">
          {parish.total_students.toLocaleString()} total MFP students
        </p>
        <div className="flex h-5 w-full overflow-hidden rounded-full bg-muted/40">
          <div className="flex h-full" style={{ width: `${Math.max(barTotalPct, 100)}%` }}>
            {barSegments.map((seg) => (
              <div
                key={seg.label}
                className="h-full min-w-[2px]"
                style={{ width: `${seg.pct}%`, background: seg.color }}
                title={`${seg.label}: ${seg.pct}%`}
              />
            ))}
          </div>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-[var(--text-muted)]">
          Percentages overlap — students may qualify for multiple categories
        </p>
        <p className="mt-1 text-[9px] text-[var(--text-muted)]">
          Source: LDOE FY2025-26 MFP Weighted Student Funding Table · Level 1 State Cost Allocations
        </p>
      </div>
    </section>
  );
}
