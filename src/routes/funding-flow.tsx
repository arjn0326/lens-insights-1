import { createFileRoute } from "@tanstack/react-router";
import { FundingFlowPage } from "@/pages/FundingFlowPage";
import { requireAuth } from "@/lib/route-auth";

export const Route = createFileRoute("/funding-flow")({
  beforeLoad: requireAuth,
  component: FundingFlowPage,
});
