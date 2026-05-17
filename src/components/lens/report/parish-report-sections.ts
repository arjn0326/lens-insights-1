import type { ReportNavSection } from "@/components/lens/report/ReportContentsNav";

export const PARISH_REPORT_SECTIONS: ReportNavSection[] = [
  { id: "at-a-glance", number: "01", title: "At a glance" },
  { id: "enrollment", number: "02", title: "Enrollment & demographics" },
  { id: "outcomes", number: "03", title: "Outcomes & trajectory" },
  { id: "deep-signals", number: "04", title: "Deep signals" },
  { id: "academic", number: "05", title: "Academic performance" },
  { id: "educators", number: "06", title: "Educator quality" },
  { id: "post-graduation", number: "07", title: "Post-graduation" },
  { id: "equity", number: "08", title: "Equity & access" },
  { id: "recommendations", number: "09", title: "Recommendations" },
];

export const PARISH_REPORT_META = {
  generated: new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  source: "LDOE + Louisiana Treasurer + LWC",
  version: "LENS v2.4",
};
