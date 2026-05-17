import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LogOut } from "lucide-react";
import { clearAuth } from "@/lib/demo-auth";

export function DashboardBrand() {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <img
        src="/images/lens-logo.png"
        alt="LENS"
        className="h-9 w-9 shrink-0 rounded-lg object-cover shadow-sm sm:h-10 sm:w-10"
        width={40}
        height={40}
      />
      <div className="flex min-w-0 flex-col items-center leading-tight sm:flex-row sm:items-baseline sm:gap-2">
        <span className="font-display text-[12px] font-semibold tracking-[0.22em] text-[var(--text-muted)] sm:text-[13px]">
          LENS
        </span>
        <span className="hidden text-[var(--border)] sm:inline" aria-hidden>
          ·
        </span>
        <h1 className="text-center font-display text-[13px] font-bold tracking-tight text-foreground sm:text-left sm:text-[15px]">
          Louisiana Education &amp; Needs Synthesis
        </h1>
      </div>
    </div>
  );
}

interface DashboardTopBarProps {
  showBack?: boolean;
  onBack?: () => void;
}

export function DashboardTopBar({ showBack, onBack }: DashboardTopBarProps) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    clearAuth();
    navigate({ to: "/" });
  };

  return (
    <header className="flex h-[52px] shrink-0 items-stretch border-b border-border bg-[var(--surface)]">
      <div className="flex min-w-0 flex-1 items-center justify-center px-4 py-2">
        <DashboardBrand />
      </div>

      <div className="flex w-[min(420px,38vw)] min-w-[380px] shrink-0 items-stretch border-l border-border/60">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-full min-h-[52px] flex-1 items-center gap-1.5 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition-colors hover:bg-[var(--background)] hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            Back to rankings
          </button>
        ) : (
          <div className="flex h-full flex-1 items-center justify-end px-4">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-[var(--background)] px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              <LogOut className="h-3 w-3" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
