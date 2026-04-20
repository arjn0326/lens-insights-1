import { PARISHES, SEV_COLOR, severity, type LayerKey } from "@/lib/lens-data";

interface Props {
  layer: LayerKey;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function RankingsList({ layer, selectedId, onSelect }: Props) {
  const sorted = [...PARISHES].sort((a, b) =>
    layer === "Health" ? a.scores[layer] - b.scores[layer] : b.scores[layer] - a.scores[layer],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Parish Rankings
        </div>
        <div className="mt-0.5 font-display text-[14px] font-semibold tracking-tight text-foreground">
          By {layer}{" "}
          <span className="text-[10px] font-normal text-[var(--text-muted)]">
            ({layer === "Health" ? "lowest first" : "highest first"})
          </span>
        </div>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {sorted.map((p, i) => {
          const score = p.scores[layer];
          const sev = severity(layer, score);
          const color = SEV_COLOR[sev];
          const isSelected = p.id === selectedId;
          const dfPct = ((p.dfSchools / p.totalSchools) * 100).toFixed(0);
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`flex w-full items-center gap-3 border-b border-border/60 px-4 py-2.5 text-left transition-colors hover:bg-[var(--background)] ${
                isSelected ? "bg-[var(--background)]" : ""
              }`}
            >
              <span className="w-5 font-mono text-[11px] font-semibold tabular-nums text-[var(--text-muted)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[12px] font-semibold text-foreground">
                    {p.name}
                  </span>
                  {p.alert && (
                    <span
                      className="rounded-sm px-1 py-px text-[8px] font-semibold uppercase tracking-wider"
                      style={{
                        background: "color-mix(in oklab, var(--sev-orange) 14%, transparent)",
                        color: "var(--sev-orange)",
                      }}
                    >
                      {p.alert}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] tabular-nums text-[var(--text-muted)]">
                  <span>{p.totalSchools} schools</span>
                  <span>·</span>
                  <span style={{ color: "var(--sev-red)" }}>{dfPct}% D/F</span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${score}%`, background: color }}
                  />
                </div>
              </div>
              <span
                className="font-display text-[16px] font-bold tabular-nums"
                style={{ color }}
              >
                {score}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
