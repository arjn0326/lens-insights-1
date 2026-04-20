import { useMemo, useState } from "react";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";
import { ChevronDown, ChevronUp, GitBranch } from "lucide-react";
import { buildFundingFlowSankey } from "@/lib/lens-data";

/**
 * Statewide funding flow: Federal/State/Local sources → LDOE pool →
 * top parishes (by enrollment) + Other → school types (Traditional / Charter / CTE).
 */
export function FundingFlowPanel() {
  const data = useMemo(() => buildFundingFlowSankey(), []);
  const [open, setOpen] = useState(true);

  const totalFlow = data.links
    .filter((l) => l.target === data.nodes.findIndex((n) => n.name === "LDOE Pool"))
    .reduce((s, l) => s + l.value, 0);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-[var(--surface-elevated)] shadow-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-[var(--background)]"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-[var(--background)]">
            <GitBranch className="h-3.5 w-3.5 text-[var(--blue)]" />
          </span>
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Statewide Funding Flow
            </div>
            <div className="font-display text-[14px] font-semibold tracking-tight text-foreground">
              Federal · State · Local{" "}
              <span className="text-[var(--text-muted)]">→</span> Parishes{" "}
              <span className="text-[var(--text-muted)]">→</span> School type
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Pool
            </div>
            <div className="font-mono text-[14px] font-bold tabular-nums text-foreground">
              ${totalFlow.toLocaleString()}M
            </div>
          </div>
          {open ? (
            <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-3 pb-4 pt-3">
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={data}
                nodePadding={14}
                nodeWidth={9}
                margin={{ left: 6, right: 100, top: 8, bottom: 8 }}
                link={{ stroke: "var(--blue)", strokeOpacity: 0.18 }}
                node={<FundingNode />}
              >
                <Tooltip content={<FundingTooltip />} />
              </Sankey>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-[10px] text-[var(--text-muted)]">
            <Legend dot="var(--sev-green)">Federal</Legend>
            <Legend dot="var(--blue)">State / Local</Legend>
            <Legend dot="var(--ink)">Parish allocation</Legend>
            <Legend dot="var(--sev-orange)">School type</Legend>
            <span className="ml-auto font-mono tabular-nums text-[var(--text-muted)]">
              hover any band for $ flow
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

function FundingNode(props: any) {
  const { x, y, width, height, payload } = props;
  const name: string = payload?.name ?? "";
  let color = "var(--ink)";
  if (/Federal|IDEA|Title/.test(name)) color = "var(--sev-green)";
  else if (/State|MFP|Local|Pool/.test(name)) color = "var(--blue)";
  else if (/Traditional|Charter|CTE|Magnet/.test(name)) color = "var(--sev-orange)";
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} fillOpacity={0.85} rx={2} />
      <text
        x={x + width + 6}
        y={y + height / 2}
        dy={3}
        fontSize={10}
        fill="var(--foreground)"
        fontWeight={600}
      >
        {name}
      </text>
    </g>
  );
}

function FundingTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  const label = p.source && p.target
    ? `${p.source.name} → ${p.target.name}`
    : p.name;
  return (
    <div className="rounded-md border border-border bg-[var(--surface-elevated)] px-2.5 py-1.5 text-[11px] shadow-elevated">
      <div className="font-semibold text-foreground">{label}</div>
      <div className="font-mono tabular-nums text-[var(--text-secondary)]">
        ${(p.value ?? 0).toLocaleString()}M
      </div>
    </div>
  );
}

function Legend({ dot, children }: { dot: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
      {children}
    </span>
  );
}