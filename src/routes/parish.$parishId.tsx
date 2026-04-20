import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ParishReport } from "@/components/lens/ParishReport";
import { PARISHES } from "@/lib/lens-data";

export const Route = createFileRoute("/parish/$parishId")({
  component: ParishReportPage,
  head: ({ params }) => {
    const p = PARISHES.find((x) => x.id === params.parishId);
    const name = p?.name ?? "Parish";
    return {
      meta: [
        { title: `${name} — Full Report · LENS` },
        {
          name: "description",
          content: `Full education intelligence report for ${name} Parish — composite indices, comparisons to state and national averages, demographics, funding, and workforce alignment.`,
        },
        { property: "og:title", content: `${name} — Full Report · LENS` },
        {
          property: "og:description",
          content: `Decision intelligence report for ${name} Parish.`,
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold">Parish not found</h1>
        <Link to="/" className="mt-2 inline-block text-sm underline">
          Back to dashboard
        </Link>
      </div>
    </div>
  ),
});

function ParishReportPage() {
  const { parishId } = useParams({ from: "/parish/$parishId" });
  return <ParishReport parishId={parishId} />;
}
