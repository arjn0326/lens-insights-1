import { useCallback, useState } from "react";
import { DashboardTopBar } from "@/components/lens/Header";
import { LouisianaMap } from "@/components/lens/LouisianaMap";
import { RankingsList } from "@/components/lens/RankingsList";
import { ParishDetail } from "@/components/lens/ParishDetail";
import { StateDetail } from "@/components/lens/StateDetail";
import { STATE_SELECTION_ID } from "@/components/lens/RankingsList";
import type { LayerKey } from "@/lib/lens-data";

export function LensDashboard() {
  const [layer, setLayer] = useState<LayerKey>("Health");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
      <DashboardTopBar
        showBack={selectedId !== null}
        onBack={() => setSelectedId(null)}
      />

      <div className="flex flex-1 overflow-hidden">
        <main className="scrollbar-thin flex flex-1 flex-col overflow-y-auto px-3 pb-4 pt-3 md:px-4 md:pb-5">
          <LouisianaMap
            layer={layer}
            onLayerChange={setLayer}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
            focusIds={focusIds}
            onClearFocus={clearFocus}
          />
        </main>

        <aside className="flex w-[min(420px,38vw)] min-w-[380px] flex-shrink-0 flex-col border-l border-border/60 bg-[var(--background)]">
          {selectedId === STATE_SELECTION_ID ? (
            <StateDetail />
          ) : selectedId ? (
            <ParishDetail parishId={selectedId} />
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
