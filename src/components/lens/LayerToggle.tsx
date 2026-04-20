import { LAYERS, LAYER_INFO, type LayerKey } from "@/lib/lens-data";
import { InfoTip } from "@/components/lens/InfoTip";

interface Props {
  active: LayerKey;
  onChange: (l: LayerKey) => void;
}

export function LayerToggle({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        Layer
      </span>
      {LAYERS.map((layer) => {
        const isActive = layer === active;
        return (
          <div
            key={layer}
            className={`group inline-flex items-center gap-1 rounded-full border px-2.5 py-1 transition-all ${
              isActive
                ? "border-foreground bg-foreground text-[var(--background)]"
                : "border-border bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            <button
              onClick={() => onChange(layer)}
              className="text-[11px] font-medium tracking-tight"
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
  );
}
