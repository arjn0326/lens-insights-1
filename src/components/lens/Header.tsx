import { Download, Sparkles, SlidersHorizontal } from "lucide-react";

interface HeaderProps {
  simulatorOpen: boolean;
  onToggleSimulator: () => void;
}

export function Header({ simulatorOpen, onToggleSimulator }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-[var(--surface)] px-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-brand font-bold text-white shadow-glow">
          L
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[15px] font-bold tracking-wide text-foreground">LENS</span>
          <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Louisiana Education &amp; Needs Synthesis
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <HeaderButton active={simulatorOpen} onClick={onToggleSimulator} icon={<SlidersHorizontal className="h-3.5 w-3.5" />}>
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
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
        active
          ? "border-[var(--blue)] bg-[var(--blue)]/10 text-[var(--cyan)]"
          : accent
          ? "border-[var(--blue)]/40 text-[var(--cyan)] hover:bg-[var(--blue)]/10"
          : "border-border text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
