import { Download, Sparkles, SlidersHorizontal } from "lucide-react";

interface HeaderProps {
  simulatorOpen: boolean;
  onToggleSimulator: () => void;
}

export function Header({ simulatorOpen, onToggleSimulator }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-[var(--surface)] px-5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground font-display text-[15px] font-bold text-[var(--background)]">
          L
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-[15px] font-semibold tracking-tight text-foreground">
            LENS
          </span>
          <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Louisiana Education &amp; Needs Synthesis
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <HeaderButton
          active={simulatorOpen}
          onClick={onToggleSimulator}
          icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
        >
          Simulator
        </HeaderButton>
        <HeaderButton icon={<Download className="h-3.5 w-3.5" />}>Export</HeaderButton>
        <HeaderButton icon={<Sparkles className="h-3.5 w-3.5" />} accent>
          Ask LENS
        </HeaderButton>
      </div>
    </header>
  );
}

function HeaderButton({
  children,
  onClick,
  active,
  accent,
  icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  accent?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
        active
          ? "border-foreground bg-foreground text-[var(--background)]"
          : accent
          ? "border-foreground/80 bg-foreground text-[var(--background)] hover:bg-foreground/90"
          : "border-border bg-[var(--surface-elevated)] text-foreground hover:border-foreground/40"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
