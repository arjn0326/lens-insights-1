import { InfoTip } from "@/components/lens/InfoTip";

interface Props {
  iepPct: number | null;
  gapPct: number | null;
  iepCount: number | null;
  fteTotal: number | null;
  fteCertified: number | null;
  fteUncertified: number | null;
  parishName: string;
}

const SPED_INFO_TOOLTIP =
  "Special education access in this parish based on LDOE SpedBook data. Individualized Education Program (IEP) counts are students receiving special education services. Full-time equivalent (FTE) converts part-time and full-time special education teacher roles into comparable staffing units. The certification gap is the share of special education full-time equivalent positions not fully certified to serve students with disabilities.";

export function SpedAccessPanel({
  iepPct,
  gapPct,
  iepCount,
  fteTotal,
  fteCertified,
  fteUncertified,
  parishName: _parishName,
}: Props) {
  if (iepPct === null || gapPct === null) return null;

  const certPct = fteTotal && fteTotal > 0 ? Math.round(((fteCertified ?? 0) / fteTotal) * 100) : 0;
  const uncertPct = 100 - certPct;

  const gapSeverity = gapPct >= 40 ? "high" : gapPct >= 20 ? "medium" : "low";
  const gapColor =
    gapSeverity === "high"
      ? "var(--sev-red)"
      : gapSeverity === "medium"
        ? "var(--sev-orange)"
        : "var(--sev-green)";

  return (
    <div className="rounded-xl border border-border bg-[var(--surface-elevated)] p-5">
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Access Index · Special Education
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <h3 className="text-[15px] font-semibold text-foreground">
            Special Ed Teacher Certification Gap
          </h3>
          <InfoTip text={SPED_INFO_TOOLTIP} size={10} />
        </div>
        <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
          Share of special education teachers not fully certified to serve students with disabilities
        </p>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-[var(--surface)] p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Students with Individualized Education Programs
          </p>
          <p className="mt-1 text-[22px] font-semibold text-foreground">
            {iepCount?.toLocaleString() ?? "\u2014"}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">{iepPct}% of public enrollment</p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Special ed full-time equivalent teachers
          </p>
          <p className="mt-1 text-[22px] font-semibold text-foreground">{fteTotal?.toFixed(1) ?? "\u2014"}</p>
          <p className="text-[11px] text-[var(--text-secondary)]">full-time equivalent positions</p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Certification gap</p>
          <p className="mt-1 text-[22px] font-semibold" style={{ color: gapColor }}>
            {gapPct}%
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            of full-time equivalent not fully certified
          </p>
        </div>
      </div>

      <div className="mb-2">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Teacher certification breakdown
        </p>
        <div className="flex h-7 w-full overflow-hidden rounded-full">
          <div
            style={{ width: `${certPct}%`, background: "var(--sev-green)", transition: "width 0.6s ease" }}
            className="flex items-center justify-center text-[10px] font-semibold text-white"
          >
            {certPct > 10 ? `${certPct}%` : ""}
          </div>
          <div
            style={{ width: `${uncertPct}%`, background: "var(--sev-red)", transition: "width 0.6s ease" }}
            className="flex items-center justify-center text-[10px] font-semibold text-white"
          >
            {uncertPct > 10 ? `${uncertPct}%` : ""}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--sev-green)" }} />
            Fully certified ({fteCertified?.toFixed(1)} full-time equivalent)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--sev-red)" }} />
            Not fully certified ({fteUncertified?.toFixed(1)} full-time equivalent)
          </span>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-[var(--text-muted)]">
        Source: LDOE 2023-2024 SpedBook Profile, Tables 1 &amp; 20
      </p>
    </div>
  );
}
