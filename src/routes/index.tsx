import { createFileRoute } from "@tanstack/react-router";
import { LensDashboard } from "@/components/lens/LensDashboard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "LENS — Louisiana Education & Needs Synthesis" },
      {
        name: "description",
        content:
          "LENS is a decision intelligence platform for Louisiana education leaders — parish-level health, need, access, readiness, demand, and pipeline indices.",
      },
      { property: "og:title", content: "LENS — Louisiana Education & Needs Synthesis" },
      {
        property: "og:description",
        content: "Decision intelligence for Louisiana education leaders.",
      },
    ],
  }),
});

function Index() {
  return <LensDashboard />;
}
