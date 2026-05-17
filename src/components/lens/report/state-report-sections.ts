import type { ReportNavSection } from "@/components/lens/report/ReportContentsNav";

export const STATE_REPORT_SECTIONS: ReportNavSection[] = [
  { id: "at-a-glance", number: "01", title: "At a glance" },
  { id: "funding", number: "02", title: "Funding & investment" },
  { id: "graduation", number: "03", title: "Graduation & credentials" },
  { id: "school-performance", number: "04", title: "School performance" },
  { id: "workforce", number: "05", title: "Workforce & economy" },
  { id: "academic", number: "06", title: "Academic outcomes" },
  { id: "educators", number: "07", title: "Educator compensation" },
];

export const STATE_REPORT_META = {
  generated: new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  source: "LDOE + Louisiana Treasurer",
  version: "LENS v2.4",
};
