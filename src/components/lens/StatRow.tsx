import { School, Users, AlertTriangle, Activity, Bell } from "lucide-react";
import { InfoTip } from "@/components/lens/InfoTip";

const STATS = [
  {
    label: "Schools",
    value: "1,301",
    sub: "across 64 parishes",
    icon: School,
    tone: "default" as const,
    info: "Total public, charter, and private schools tracked statewide.",
  },
  {
    label: "Students",
    value: "703K",
    sub: "≈14% of LA pop.",
    icon: Users,
    tone: "default" as const,
    info: "K–12 students enrolled across all tracked schools.",
  },
  {
    label: "D/F Schools",
    value: "142",
    sub: "10.9% of total",
    icon: AlertTriangle,
    tone: "danger" as const,
    info: "Schools rated D or F by LA DOE — concentrated in high-need parishes.",
  },
  {
    label: "Avg Health",
    value: "56",
    sub: "−3 vs. last yr",
    icon: Activity,
    tone: "warn" as const,
    info: "Statewide composite health score (0–100). Higher is healthier.",
  },
  {
    label: "Active Alerts",
    value: "7",
    sub: "5 parishes affected",
    icon: Bell,
    tone: "danger" as const,
    info: "Open intervention alerts that require leader attention.",
  },
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
            ? "var(--sev-orange)"
            : "var(--ink)";
        return (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-[var(--surface-elevated)] p-3 shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                {s.label}
                <InfoTip text={s.info} size={10} />
              </span>
              <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
            </div>
            <div
              className="mt-1.5 font-display text-[24px] font-bold leading-none tabular-nums"
              style={{ color: s.tone === "default" ? "var(--foreground)" : accent }}
            >
              {s.value}
            </div>
            <div className="mt-1 text-[10px] text-[var(--text-muted)]">{s.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
