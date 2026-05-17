import { createFileRoute } from "@tanstack/react-router";
import { LensDashboard } from "@/components/lens/LensDashboard";
import { requireAuth } from "@/lib/route-auth";

export const Route = createFileRoute("/app")({
  beforeLoad: requireAuth,
  component: AppPage,
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

function AppPage() {
  return <LensDashboard />;
}
