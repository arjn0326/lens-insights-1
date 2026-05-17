import { generateFunderBrief } from "@/lib/generateBrief";

interface Props {
  parishId: string;
  className?: string;
}

export function FunderBriefButton({ parishId, className }: Props) {
  return (
    <button
      type="button"
      onClick={() => {
        const html = generateFunderBrief(parishId);
        const win = window.open("", "_blank");
        if (win) {
          win.document.write(html);
          win.document.close();
        }
      }}
      className={
        className ??
        "mt-2 w-full rounded-lg border border-border bg-[var(--surface)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent)] hover:text-foreground"
      }
    >
      Funder Brief
    </button>
  );
}
