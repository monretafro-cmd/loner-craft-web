import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_shell/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-serif text-[#241812]">Analytics</h1>
        <p className="text-stone-500 text-sm mt-1">Store performance and sales insights</p>
      </div>
      <div className="bg-white p-12 rounded-lg border border-stone-200 text-center">
        <p className="text-stone-400 italic">Analytics dashboard coming soon.</p>
      </div>
    </div>
  );
}
