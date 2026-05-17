import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";
import { redirectIfAuthenticated } from "@/lib/route-auth";

export const Route = createFileRoute("/")({
  beforeLoad: redirectIfAuthenticated,
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "LENS — Sign in" },
      {
        name: "description",
        content:
          "Louisiana Education & Needs Synthesis — secure access to parish intelligence, maps, and statewide reports.",
      },
      { property: "og:title", content: "LENS — Louisiana Education & Needs Synthesis" },
      {
        property: "og:description",
        content: "Decision intelligence for Louisiana education leaders.",
      },
    ],
  }),
});
