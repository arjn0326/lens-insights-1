import type { ReactNode } from "react";
import { ReportContentsNav, type ReportNavSection } from "@/components/lens/report/ReportContentsNav";

interface Props {
  sections: ReportNavSection[];
  meta?: {
    generated?: string;
    source?: string;
    version?: string;
  };
  /** Full-width block above the sidebar (e.g. parish title hero). */
  hero?: ReactNode;
  children: ReactNode;
}

export function ReportLayout({ sections, meta, hero, children }: Props) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6 lg:px-8">
      {hero}
      <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <aside className="hidden w-[200px] shrink-0 lg:block xl:w-[220px]">
          <ReportContentsNav sections={sections} meta={meta} />
        </aside>
        <div className="min-w-0 flex-1 space-y-14">{children}</div>
      </div>
    </div>
  );
}
