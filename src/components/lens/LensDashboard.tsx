import { useState } from "react";
import { Header } from "@/components/lens/Header";
import { SimulatorPanel } from "@/components/lens/SimulatorPanel";
import { LayerToggle } from "@/components/lens/LayerToggle";
import { LouisianaMap } from "@/components/lens/LouisianaMap";
import { StatRow } from "@/components/lens/StatRow";
import { RankingsList } from "@/components/lens/RankingsList";
import { ParishDetail } from "@/components/lens/ParishDetail";
import type { LayerKey } from "@/lib/lens-data";

export function LensDashboard() {
  const [layer, setLayer] = useState<LayerKey>("Health");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <Header
        simulatorOpen={simulatorOpen}
        onToggleSimulator={() => setSimulatorOpen((v) => !v)}
      />
      {simulatorOpen && <SimulatorPanel />}

      <div className="flex flex-1 overflow-hidden">
        {/* Main */}
        <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <LayerToggle active={layer} onChange={setLayer} />
          <LouisianaMap
            layer={layer}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
          />
          <StatRow />
        </main>

        {/* Right sidebar */}
        <aside className="flex w-[320px] flex-shrink-0 flex-col border-l border-border bg-[var(--surface)]">
          {selectedId ? (
            <ParishDetail parishId={selectedId} onBack={() => setSelectedId(null)} />
          ) : (
            <RankingsList layer={layer} selectedId={selectedId} onSelect={setSelectedId} />
          )}
        </aside>
      </div>
    </div>
  );
}
