import { useEffect, useState } from "react";

export interface ReportNavSection {
  id: string;
  number: string;
  title: string;
}

interface Props {
  sections: ReportNavSection[];
  meta?: {
    generated?: string;
    source?: string;
    version?: string;
  };
}

const HEADER_OFFSET = 88;

export function ReportContentsNav({ sections, meta }: Props) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el != null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
          return;
        }
        const scrollY = window.scrollY + HEADER_OFFSET + 40;
        let current = sections[0]?.id ?? "";
        for (const el of elements) {
          if (el.offsetTop <= scrollY) current = el.id;
        }
        setActiveId(current);
      },
      { rootMargin: `-${HEADER_OFFSET}px 0px -55% 0px`, threshold: [0, 0.12, 0.35, 0.6] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);
  };

  return (
    <>
      <div className="mb-6 lg:hidden">
        <label className="sr-only" htmlFor="report-section-jump">
          Jump to section
        </label>
        <select
          id="report-section-jump"
          value={activeId}
          onChange={(e) => scrollTo(e.target.value)}
          className="w-full rounded-lg border border-border bg-[var(--surface-elevated)] px-3 py-2 text-[12px] font-medium text-foreground"
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.number} · {s.title}
            </option>
          ))}
        </select>
      </div>
    <nav
      className="sticky top-[72px] hidden max-h-[calc(100vh-96px)] flex-col lg:flex"
      aria-label="Report contents"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
        Contents
      </p>
      <ul className="mt-3 flex flex-col gap-0.5 overflow-y-auto pr-1">
        {sections.map((s) => {
          const active = activeId === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => scrollTo(s.id)}
                className={`group flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
                  active
                    ? "bg-[color-mix(in_oklab,var(--blue)_10%,transparent)]"
                    : "hover:bg-[var(--background)]"
                }`}
              >
                <span
                  className={`mt-0.5 font-mono text-[10px] font-semibold tabular-nums ${
                    active ? "text-[var(--blue)]" : "text-[var(--text-muted)]"
                  }`}
                >
                  {s.number}
                </span>
                <span
                  className={`text-[12px] font-medium leading-snug ${
                    active ? "text-foreground" : "text-[var(--text-secondary)] group-hover:text-foreground"
                  }`}
                >
                  {s.title}
                </span>
                {active && (
                  <span className="ml-auto mt-1.5 h-4 w-0.5 shrink-0 rounded-full bg-[var(--blue)]" />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {meta && (
        <div className="mt-6 rounded-lg border border-border bg-[var(--background)] p-3 text-[10px] leading-relaxed text-[var(--text-muted)]">
          {meta.generated && (
            <p>
              <span className="font-semibold text-[var(--text-secondary)]">Generated</span>{" "}
              {meta.generated}
            </p>
          )}
          {meta.source && (
            <p className="mt-1">
              <span className="font-semibold text-[var(--text-secondary)]">Source</span> {meta.source}
            </p>
          )}
          {meta.version && (
            <p className="mt-1">
              <span className="font-semibold text-[var(--text-secondary)]">Compiled by</span>{" "}
              {meta.version}
            </p>
          )}
        </div>
      )}
    </nav>
    </>
  );
}
