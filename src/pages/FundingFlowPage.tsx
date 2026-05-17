import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { FundingFlowPanel } from "@/components/lens/FundingFlowPanel";

export function FundingFlowPage() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-[var(--background)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3">
          <Link
            to="/app"
            className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)] transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to dashboard
          </Link>
          <div className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--blue)]" />
            LENS · Statewide Funding Flow
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <h1 className="mb-6 font-display text-[32px] font-bold tracking-tight text-foreground">
          Statewide Funding Flow
        </h1>
        <FundingFlowPanel />
      </div>
    </div>
  );
}
