import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function SimulatorPanel() {
  const [seats, setSeats] = useState(400);
  const [salary, setSalary] = useState(5000);

  return (
    <div className="border-b border-border bg-[var(--surface-elevated)] px-5 py-3">
      <div className="flex items-center gap-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
          Scenario Simulator
        </div>

        <SliderField
          label="Open a new school"
          value={seats}
          min={100}
          max={800}
          step={50}
          format={(v) => `${v} seats`}
          onChange={setSeats}
        />

        <SliderField
          label="Increase teacher salary"
          value={salary}
          min={0}
          max={10000}
          step={250}
          format={(v) => `+$${v.toLocaleString()}`}
          onChange={setSalary}
        />

        <button className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--background)] transition-transform hover:scale-[1.02]">
          Run Scenario <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex min-w-[240px] flex-1 flex-col gap-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
          {label}
        </span>
        <span className="font-mono font-semibold text-foreground tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lens-slider h-1 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right, var(--ink) 0%, var(--ink) ${pct}%, var(--color-border) ${pct}%, var(--color-border) 100%)`,
        }}
      />
      <style>{`
        .lens-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: var(--background);
          border: 2px solid var(--ink);
          cursor: pointer;
        }
        .lens-slider::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: var(--background); border: 2px solid var(--ink);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
