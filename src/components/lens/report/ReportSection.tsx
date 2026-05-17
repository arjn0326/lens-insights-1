import type { ReactNode } from "react";

interface Props {
  id: string;
  number: string;
  title: string;
  badge?: string;
  className?: string;
  children: ReactNode;
}

export function ReportSection({ id, number, title, badge, className = "", children }: Props) {
  return (
    <section id={id} className={`scroll-mt-[88px] ${className}`}>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Intelligence suite · {number}
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground md:text-[26px]">
            {title}
          </h2>
        </div>
        {badge && (
          <span className="rounded-full border border-border bg-[var(--surface-elevated)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {badge}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}
