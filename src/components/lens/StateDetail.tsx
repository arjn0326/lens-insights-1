import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import stateReportData from "../../../public/data/state_report_data.json";

const { gradeConfig, spsTrend, districtTrend } = stateReportData;

const latestSps = spsTrend.at(-1);
const totalSchools = gradeConfig.k8.reduce((a, b) => a + b, 0)
  + gradeConfig.combination.reduce((a, b) => a + b, 0)
  + gradeConfig.highSchool.reduce((a, b) => a + b, 0);
const latestDistricts = districtTrend.years.length
  ? districtTrend.A.at(-1)! +
    districtTrend.B.at(-1)! +
    districtTrend.C.at(-1)! +
    districtTrend.D.at(-1)! +
    districtTrend.F.at(-1)!
  : 0;

export function StateDetail() {
  return (
    <div className="flex h-full flex-col">
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        <div className="border-b border-border bg-[color-mix(in_oklab,var(--blue)_6%,var(--surface))] px-4 py-5">
          <p className="font-mono text-[10px] font-semibold tabular-nums tracking-wider text-[var(--blue)]">
            00 · STATEWIDE
          </p>
          <h2 className="mt-1 font-display text-[22px] font-bold leading-tight tracking-tight text-foreground">
            Louisiana
          </h2>
          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
            Department of Education accountability &amp; performance
          </p>

          {latestSps && (
            <div className="mt-4 flex items-end gap-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Latest SPS
                </p>
                <p className="font-display text-[34px] font-bold leading-none tabular-nums text-[var(--blue)]">
                  {latestSps.sps}
                </p>
              </div>
              {latestSps.grade && (
                <span className="mb-1 rounded-md border border-[var(--blue)]/30 bg-[color-mix(in_oklab,var(--blue)_12%,transparent)] px-2 py-1 font-display text-lg font-bold text-[var(--blue)]">
                  Grade {latestSps.grade}
                </span>
              )}
              <span className="mb-1 ml-auto text-[10px] tabular-nums text-[var(--text-muted)]">
                {latestSps.year}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 border-b border-border px-4 py-4">
          <Stat label="Schools" value={totalSchools.toLocaleString()} />
          <Stat label="Districts" value={String(latestDistricts)} />
        </div>

        <div className="px-4 py-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Full report includes
          </p>
          <ul className="mt-2 flex flex-col gap-2 text-[11px] leading-relaxed text-[var(--text-secondary)]">
            <li>Schools by letter grade and school type</li>
            <li>Statewide SPS score trend with letter grades</li>
            <li>District counts by letter grade over time</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border bg-[var(--surface)] p-4">
        <Link
          to="/state"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-foreground px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--background)] transition-transform hover:scale-[1.01]"
        >
          See Full Report <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-[var(--background)] p-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 font-display text-[18px] font-bold leading-none tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
