import { createFileRoute } from "@tanstack/react-router";
import { StateReport } from "@/components/StateReport";

export const Route = createFileRoute("/state")({
  component: StateReportPage,
  head: () => ({
    meta: [
      { title: "Louisiana — State Overview · LENS" },
      {
        name: "description",
        content:
          "Louisiana statewide education overview — school performance by grade, SPS trends, and district letter-grade distribution.",
      },
      { property: "og:title", content: "Louisiana — State Overview · LENS" },
      {
        property: "og:description",
        content: "Statewide school performance and accountability trends for Louisiana.",
      },
    ],
  }),
});

function StateReportPage() {
  return <StateReport />;
}
