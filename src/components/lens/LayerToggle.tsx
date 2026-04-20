import { LAYERS, type LayerKey } from "@/lib/lens-data";

interface Props {
  active: LayerKey;
  onChange: (l: LayerKey) => void;
}

export function LayerToggle({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        Layer
      </span>
      {LAYERS.map((layer) => {
        const isActive = layer === active;
        return (
          <button
            key={layer}
            onClick={() => onChange(layer)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium tracking-wide transition-all ${
              isActive
                ? "bg-gradient-brand text-white shadow-glow"
                : "border border-border bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--blue)]/40 hover:text-foreground"
            }`}
          >
            {layer}
          </button>
        );
      })}
    </div>
  );
}
