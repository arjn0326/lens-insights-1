import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  text: string;
  size?: number;
  className?: string;
  icon?: LucideIcon;
}

export function InfoTip({ text, size = 11, className = "", icon: Icon = Info }: Props) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:text-foreground ${className}`}
            aria-label="More info"
            onClick={(e) => e.stopPropagation()}
          >
            <Icon style={{ width: size, height: size }} strokeWidth={2.25} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[240px] border border-border bg-[var(--surface-elevated)] px-2.5 py-1.5 text-[11px] font-normal leading-relaxed text-foreground shadow-elevated"
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
