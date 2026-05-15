import { createFileRoute } from "@tanstack/react-router";
import { FundingFlowPage } from "@/pages/FundingFlowPage";

export const Route = createFileRoute("/funding-flow")({
  component: FundingFlowPage,
});
