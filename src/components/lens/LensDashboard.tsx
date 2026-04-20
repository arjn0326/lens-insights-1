import { useCallback, useState } from "react";
import { Header } from "@/components/lens/Header";
import { SimulatorPanel } from "@/components/lens/SimulatorPanel";
import { LayerToggle } from "@/components/lens/LayerToggle";
import { LouisianaMap } from "@/components/lens/LouisianaMap";
import { StatRow } from "@/components/lens/StatRow";
import { RankingsList } from "@/components/lens/RankingsList";
import { ParishDetail } from "@/components/lens/ParishDetail";
import { FundingFlowPanel } from "@/components/lens/FundingFlowPanel";
import type { LayerKey } from "@/lib/lens-data";

export function LensDashboard() {
  const [layer, setLayer] = useState<LayerKey>("Health");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [focusIds, setFocusIds] = useState<Set<string>>(new Set());

  const toggleFocus = useCallback((id: string) => {
    setFocusIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearFocus = useCallback(() => setFocusIds(new Set()), []);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <Header
        simulatorOpen={simulatorOpen}
        onToggleSimulator={() => setSimulatorOpen((v) => !v)}
      />
      {simulatorOpen && <SimulatorPanel />}

      <div className="flex flex-1 overflow-hidden">
        {/* Main */}
        <main className="scrollbar-thin flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <LayerToggle active={layer} onChange={setLayer} />
          <LouisianaMap
            layer={layer}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
            focusIds={focusIds}
            onClearFocus={clearFocus}
          />
          <StatRow />
          <FundingFlowPanel />
        </main>

        {/* Right sidebar */}
        <aside className="flex w-[320px] flex-shrink-0 flex-col border-l border-border bg-[var(--surface)]">
          {selectedId ? (
            <ParishDetail parishId={selectedId} onBack={() => setSelectedId(null)} />
          ) : (
            <RankingsList
              layer={layer}
              selectedId={selectedId}
              onSelect={setSelectedId}
              focusIds={focusIds}
              onToggleFocus={toggleFocus}
              onClearFocus={clearFocus}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
