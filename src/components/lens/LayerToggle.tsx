import { LAYERS, LAYER_INFO, type LayerKey } from "@/lib/lens-data";
import { InfoTip } from "@/components/lens/InfoTip";

interface Props {
  active: LayerKey;
  onChange: (l: LayerKey) => void;
}

export function LayerToggle({ active, onChange }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-[var(--surface)] p-2 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <span className="shrink-0 px-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Layer
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {LAYERS.map((layer) => {
            const isActive = layer === active;
            return (
              <div
                key={layer}
                className={`group inline-flex items-center gap-0.5 rounded-full border px-2 py-1 transition-all ${
                  isActive
                    ? "border-foreground bg-foreground text-[var(--background)] shadow-sm"
                    : "border-transparent bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-border hover:text-foreground"
                }`}
              >
                <button
                  onClick={() => onChange(layer)}
                  className="text-[11px] font-semibold tracking-tight"
                >
                  {layer}
                </button>
                <InfoTip
                  text={LAYER_INFO[layer]}
                  size={10}
                  className={isActive ? "text-[var(--background)]/70 hover:text-[var(--background)]" : ""}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
