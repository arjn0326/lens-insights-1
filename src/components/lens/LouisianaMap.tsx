import { EMPLOYERS, PARISHES, SEV_COLOR, severity, type LayerKey } from "@/lib/lens-data";

interface Props {
  layer: LayerKey;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function LouisianaMap({ layer, selectedId, onSelect }: Props) {
  return (
    <div className="relative flex-1 overflow-hidden rounded-xl border border-border bg-[var(--surface)] p-4">
      {/* Grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Compass / label */}
      <div className="absolute left-4 top-4 z-10 flex flex-col">
        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Geographic View
        </span>
        <span className="text-[13px] font-bold text-foreground">Louisiana · {layer}</span>
      </div>
      <div className="absolute right-4 top-4 z-10 flex items-center gap-3 text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
        <LegendDot color="var(--sev-green)" /> Healthy
        <LegendDot color="var(--sev-yellow)" /> Concerning
        <LegendDot color="var(--sev-red)" /> Crisis
      </div>

      {/* Map container */}
      <div className="relative mx-auto mt-12 aspect-[4/3] w-full max-w-[720px]">
        {/* Simplified Louisiana SVG silhouette */}
        <svg
          viewBox="0 0 400 300"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="laFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.06" />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <path
            d="M 30 30 L 370 30 L 370 200 L 340 215 L 320 230 L 300 220 L 280 235 L 260 225 L 250 250 L 230 260 L 210 255 L 190 270 L 170 265 L 150 275 L 130 270 L 110 280 L 95 265 L 80 270 L 70 250 L 50 245 L 40 220 L 30 200 Z"
            fill="url(#laFill)"
            stroke="var(--blue)"
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
        </svg>

        {/* Employer markers (Health layer only) */}
        {layer === "Health" &&
          EMPLOYERS.map((emp) => (
            <div
              key={emp.name}
              className="absolute z-20 flex flex-col items-center"
              style={{ left: `${emp.x}%`, top: `${emp.y}%`, transform: "translate(-50%, -100%)" }}
            >
              <div
                className="h-0 w-0"
                style={{
                  borderLeft: "7px solid transparent",
                  borderRight: "7px solid transparent",
                  borderBottom: "12px solid var(--cyan)",
                  filter: "drop-shadow(0 0 6px var(--cyan))",
                }}
              />
              <div className="mt-1 rounded bg-[var(--background)]/90 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-wider text-[var(--cyan)]">
                {emp.name} {emp.value}
              </div>
            </div>
          ))}

        {/* Parishes */}
        {PARISHES.map((p) => {
          const score = p.scores[layer];
          const sev = severity(layer, score);
          const color = SEV_COLOR[sev];
          const isSelected = selectedId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`absolute z-10 flex min-w-[78px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 rounded-md border bg-[var(--background)]/85 px-2 py-1.5 backdrop-blur-sm transition-all hover:scale-110 hover:z-30 ${
                isSelected
                  ? "ring-2 ring-[var(--cyan)] shadow-glow border-[var(--cyan)]"
                  : "border-border hover:border-[var(--cyan)]/60"
              }`}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                borderLeftColor: color,
                borderLeftWidth: 3,
              }}
            >
              {p.alert && (
                <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                  <span
                    className="alert-dot absolute inline-flex h-full w-full rounded-full"
                    style={{ background: "var(--sev-red)" }}
                  />
                  <span
                    className="relative inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--sev-red)" }}
                  />
                </span>
              )}
              <span className="text-[9px] font-medium leading-none text-foreground">{p.name}</span>
              <span className="font-mono text-[14px] font-bold leading-none" style={{ color }}>
                {score}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LegendDot({ color }: { color: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
    </span>
  );
}
