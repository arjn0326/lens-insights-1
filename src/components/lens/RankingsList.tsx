import { PARISHES, SEV_COLOR, severity, type LayerKey } from "@/lib/lens-data";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Crosshair, X } from "lucide-react";

export const STATE_SELECTION_ID = "state";

interface Props {
  layer: LayerKey;
  selectedId: string | null;
  onSelect: (id: string) => void;
  focusIds: Set<string>;
  onToggleFocus: (id: string) => void;
  onClearFocus: () => void;
}

export function RankingsList({
  layer,
  selectedId,
  onSelect,
  focusIds,
  onToggleFocus,
  onClearFocus,
}: Props) {
  const sorted = [...PARISHES].sort((a, b) =>
    layer === "Health" ? a.scores[layer] - b.scores[layer] : b.scores[layer] - a.scores[layer],
  );

  const focusCount = focusIds.size;

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
        {focusCount > 0 && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-[var(--blue)]/40 bg-[color-mix(in_oklab,var(--blue)_8%,transparent)] px-2 py-1.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--blue)" }}>
              <Crosshair className="h-3 w-3" />
              {focusCount} on map
            </span>
            <button
              onClick={onClearFocus}
              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          </div>
        )}
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        <div
          className={`group flex w-full items-center gap-3 border-b-2 border-[var(--blue)]/25 bg-[color-mix(in_oklab,var(--blue)_5%,transparent)] px-4 py-3 transition-colors hover:bg-[color-mix(in_oklab,var(--blue)_9%,transparent)] ${
            selectedId === STATE_SELECTION_ID ? "bg-[color-mix(in_oklab,var(--blue)_10%,transparent)]" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => onSelect(STATE_SELECTION_ID)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <span className="w-5 font-mono text-[11px] font-semibold tabular-nums text-[var(--blue)]">
              00
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-[12px] font-semibold text-foreground">State</span>
              <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                Louisiana statewide overview
              </p>
            </div>
          </button>
          <Link
            to="/state"
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[var(--blue)]/35 bg-[var(--background)] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--blue)] transition-colors hover:border-[var(--blue)] hover:bg-[color-mix(in_oklab,var(--blue)_8%,transparent)]"
          >
            Full Report
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {sorted.map((p, i) => {
          const score = p.scores[layer];
          const sev = severity(layer, score);
          const color = SEV_COLOR[sev];
          const isSelected = p.id === selectedId;
          const isFocused = focusIds.has(p.id);
          const dfPct = ((p.dfSchools / p.totalSchools) * 100).toFixed(0);
          return (
            <div
              key={p.id}
              className={`group flex w-full items-center gap-3 border-b border-border/60 px-4 py-2.5 text-left transition-colors hover:bg-[var(--background)] ${
                isSelected ? "bg-[var(--background)]" : ""
              } ${
                isFocused ? "ring-1 ring-inset ring-[var(--blue)]/40" : ""
              }`}
            >
              <button
                onClick={() => onSelect(p.id)}
                className="flex flex-1 items-center gap-3 text-left"
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFocus(p.id);
                }}
                title={isFocused ? "Remove from map focus" : "Focus on map (show schools, zoom)"}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-all ${
                  isFocused
                    ? "border-[var(--blue)] bg-[var(--blue)] text-[var(--background)]"
                    : "border-border bg-[var(--background)] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:border-[var(--blue)]/60 hover:text-[var(--blue)]"
                }`}
                aria-label={isFocused ? "Unfocus" : "Focus on map"}
              >
                <Crosshair className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
