import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/index")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-serif text-[#241812] mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
          <p className="text-sm text-stone-500 uppercase tracking-wider">Total Sales</p>
          <p className="text-2xl font-bold text-[#241812]">0 MAD</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
          <p className="text-sm text-stone-500 uppercase tracking-wider">Active Orders</p>
          <p className="text-2xl font-bold text-[#241812]">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
          <p className="text-sm text-stone-500 uppercase tracking-wider">Total Products</p>
          <p className="text-2xl font-bold text-[#241812]">0</p>
        </div>
      </div>
    </div>
  );
}
