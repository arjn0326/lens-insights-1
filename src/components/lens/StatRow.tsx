import { School, Users, AlertTriangle, Activity, Bell } from "lucide-react";

const STATS = [
  { label: "Schools", value: "1,301", icon: School, tone: "default" as const },
  { label: "Students", value: "700K+", icon: Users, tone: "default" as const },
  { label: "D/F Schools", value: "142", icon: AlertTriangle, tone: "danger" as const },
  { label: "Avg Health", value: "56", icon: Activity, tone: "warn" as const },
  { label: "Active Alerts", value: "7", icon: Bell, tone: "danger" as const },
];

export function StatRow() {
  return (
    <div className="grid grid-cols-5 gap-3">
      {STATS.map((s) => {
        const Icon = s.icon;
        const accent =
          s.tone === "danger"
            ? "var(--sev-red)"
            : s.tone === "warn"
            ? "var(--sev-yellow)"
            : "var(--cyan)";
        return (
          <div
            key={s.label}
            className="rounded-lg border border-border bg-[var(--surface)] p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {s.label}
              </span>
              <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
            </div>
            <div
              className="mt-1.5 font-mono text-[22px] font-bold leading-none"
              style={{ color: s.tone === "default" ? "var(--foreground)" : accent }}
            >
              {s.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
