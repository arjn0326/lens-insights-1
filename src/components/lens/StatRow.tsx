import { PARISHES } from "@/lib/lens-data";

function avg(values: number[]) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function StatCard({
  label,
  value,
  valueColor = "var(--foreground)",
}: {
  label: string;
  value: string | number;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-[var(--surface-elevated)] p-4 shadow-card">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </div>
      <div
        className="mt-2 font-display text-2xl font-bold tabular-nums tracking-tight"
        style={{ color: valueColor }}
      >
        {value}
      </div>
    </div>
  );
}

export function StatRow() {
  const parishes = PARISHES;
  const scores = parishes.map((p) => p.scores.Health);
  const avgHealth = avg(scores).toFixed(1);
  const highNeed = parishes.filter((p) => p.scores.Need >= 70).length;
  const lowAccess = parishes.filter((p) => p.scores.Access >= 70).length;
  const criticalCount = parishes.filter((p) => p.scores.Health < 40).length;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
      <StatCard label="Parishes analyzed" value={parishes.length} />
      <StatCard label="Avg health score" value={avgHealth} valueColor="var(--blue)" />
      <StatCard label="High need (≥70)" value={highNeed} valueColor="var(--sev-red)" />
      <StatCard label="Access pressure (≥70)" value={lowAccess} valueColor="var(--sev-orange)" />
      <StatCard label="Critical health (<40)" value={criticalCount} valueColor="var(--ink)" />
    </div>
  );
}
