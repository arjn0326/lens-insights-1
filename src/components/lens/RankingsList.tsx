import { useMemo, useState } from "react";
import { PARISHES, ALERT_EXPLANATIONS, SEV_COLOR, severity, type LayerKey } from "@/lib/lens-data";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Crosshair, Search, TriangleAlert, X } from "lucide-react";
import { InfoTip } from "@/components/lens/InfoTip";

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
  const [query, setQuery] = useState("");

  const sorted = useMemo(
    () =>
      [...PARISHES].sort((a, b) =>
        layer === "Health" ? a.scores[layer] - b.scores[layer] : b.scores[layer] - a.scores[layer],
      ),
    [layer],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((p) => p.name.toLowerCase().includes(q) || p.id.includes(q));
  }, [sorted, query]);

  const focusCount = focusIds.size;
  const sortHint =
    layer === "Health" ? "Lowest score first" : "Highest stress first";

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      <div className="shrink-0 px-3 pt-3.5 pb-3">
        <h2 className="font-display text-[19px] leading-tight tracking-tight">
          <span className="font-bold text-foreground">Parish Rankings</span>{" "}
          <span className="font-bold text-[var(--text-secondary)]">(By {layer})</span>
        </h2>
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">{sortHint}</p>
      </div>

      {focusCount > 0 && (
        <div className="shrink-0 px-3 pb-2">
          <div className="flex items-center justify-between gap-2 rounded-lg bg-[color-mix(in_oklab,var(--blue)_10%,transparent)] px-2.5 py-2">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: "var(--blue)" }}
            >
              <Crosshair className="h-3 w-3" />
              {focusCount} on map
            </span>
            <button
              type="button"
              onClick={onClearFocus}
              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          </div>
        </div>
      )}

      <div className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-3">
        <div
          className={`mb-2 flex items-center gap-2.5 rounded-xl px-3 py-3 transition-colors ${
            selectedId === STATE_SELECTION_ID
              ? "bg-[color-mix(in_oklab,var(--blue)_14%,var(--surface-elevated))] ring-1 ring-[var(--blue)]/35"
              : "bg-[var(--surface-elevated)] hover:bg-[color-mix(in_oklab,var(--blue)_6%,var(--surface-elevated))]"
          }`}
        >
          <button
            type="button"
            onClick={() => onSelect(STATE_SELECTION_ID)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--blue)]/12 font-mono text-[11px] font-bold tabular-nums text-[var(--blue)]">
              00
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-[13px] font-bold text-foreground">State</span>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Louisiana statewide overview</p>
            </div>
          </button>
          <Link
            to="/state"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[var(--blue)] px-2.5 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
          >
            Full Report
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <label className="relative mb-2 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parish name…"
            className="w-full rounded-xl border-0 bg-[var(--surface-elevated)] py-2.5 pl-9 pr-3 text-[13px] text-foreground shadow-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--blue)]/25"
          />
        </label>

        <ul className="space-y-1.5">
          {filtered.map((p, i) => {
            const score = p.scores[layer];
            const sev = severity(layer, score);
            const color = SEV_COLOR[sev];
            const isSelected = p.id === selectedId;
            const isFocused = focusIds.has(p.id);
            const dfPct = ((p.dfSchools / p.totalSchools) * 100).toFixed(0);
            const alertText = p.alert ? (ALERT_EXPLANATIONS[p.alert] ?? p.alert) : null;

            return (
              <li key={p.id}>
                <div
                  className={`group flex items-center gap-2 rounded-xl px-3 py-3 transition-all ${
                    isSelected
                      ? "bg-[var(--surface-elevated)] ring-2 ring-[var(--blue)]/40 shadow-sm"
                      : isFocused
                        ? "bg-[var(--surface-elevated)] ring-1 ring-[var(--blue)]/30"
                        : "bg-[var(--surface-elevated)] hover:shadow-sm"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(p.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface)] font-mono text-[11px] font-bold tabular-nums text-[var(--text-muted)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-bold text-foreground">{p.name}</span>
                        {p.alert && (
                          <InfoTip
                            text={alertText ?? p.alert}
                            icon={TriangleAlert}
                            size={13}
                            className="shrink-0 text-[var(--sev-orange)] hover:text-[var(--sev-red)]"
                          />
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] tabular-nums text-[var(--text-muted)]">
                        <span>{p.totalSchools} schools</span>
                        <span className="opacity-40">·</span>
                        <span className="font-medium" style={{ color }}>
                          {dfPct}% D/F
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--border)_80%,transparent)]">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${score}%`,
                            background: color,
                          }}
                        />
                      </div>
                    </div>
                    <span
                      className="flex h-10 min-w-[2.5rem] shrink-0 items-center justify-center rounded-lg px-1.5 font-display text-[18px] font-bold tabular-nums"
                      style={{
                        color,
                        background: `color-mix(in oklab, ${color} 14%, transparent)`,
                      }}
                    >
                      {score}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFocus(p.id);
                    }}
                    title={isFocused ? "Remove from map focus" : "Focus on map"}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                      isFocused
                        ? "bg-[var(--blue)] text-[var(--primary-foreground)]"
                        : "bg-[var(--surface)] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--blue)]"
                    }`}
                    aria-label={isFocused ? "Unfocus" : "Focus on map"}
                  >
                    <Crosshair className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {filtered.length === 0 && (
          <p className="py-8 text-center text-[12px] text-[var(--text-muted)]">
            No parishes match your search.
          </p>
        )}
      </div>
    </div>
  );
}
