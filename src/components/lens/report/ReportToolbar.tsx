import { useCallback, useState } from "react";
import { Check, Copy, FileText, Link2, Printer, SlidersHorizontal } from "lucide-react";
import { generateFunderBrief } from "@/lib/generateBrief";

interface Props {
  shareUrl: string;
  shareLabel?: string;
  parishId?: string;
}

export function ReportToolbar({ shareUrl, shareLabel = "Share", parishId }: Props) {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setShareOpen(true);
    window.setTimeout(() => setCopied(false), 2500);
  }, [shareUrl]);

  const handleShare = useCallback(async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: document.title, url: shareUrl });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    setShareOpen(true);
    await copyLink();
  }, [shareUrl, copyLink]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleFunderBrief = useCallback(() => {
    if (!parishId) return;
    const html = generateFunderBrief(parishId);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }, [parishId]);

  const handlePolicySimulator = useCallback(() => {
    const el = document.getElementById("policy-simulator");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.location.hash = "policy-simulator";
  }, []);

  return (
    <div className="relative flex flex-wrap items-center justify-end gap-1.5 print:hidden">
      {parishId && (
        <>
          <button
            type="button"
            onClick={handlePolicySimulator}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-[var(--background)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition-colors hover:border-[var(--blue)]/50 hover:text-[var(--blue)]"
          >
            <SlidersHorizontal className="h-3 w-3" />
            Policy Simulator
          </button>
          <button
            type="button"
            onClick={handleFunderBrief}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-[var(--background)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <FileText className="h-3 w-3" />
            Funder Brief
          </button>
        </>
      )}
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-[var(--background)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition-colors hover:border-foreground/40 hover:text-foreground"
      >
        <Link2 className="h-3 w-3" />
        {shareLabel}
      </button>
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-[var(--background)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition-colors hover:border-foreground/40 hover:text-foreground"
      >
        <Printer className="h-3 w-3" />
        Print / PDF
      </button>

      {shareOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-lg border border-border bg-card p-3 shadow-lg"
          role="dialog"
          aria-label="Share report link"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Copy link
          </p>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="min-w-0 flex-1 rounded-md border border-border bg-[var(--background)] px-2 py-1.5 font-mono text-[11px] text-foreground"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-foreground bg-foreground px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--background)]"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShareOpen(false)}
            className="mt-2 text-[10px] text-[var(--text-muted)] hover:text-foreground"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
