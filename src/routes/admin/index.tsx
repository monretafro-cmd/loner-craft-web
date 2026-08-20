import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/api";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.stats(),
  });

  if (isLoading) return <div>Loading stats...</div>;

  return (
    <div>
      <h1 className="text-3xl font-serif text-[#241812] mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
          <p className="text-sm text-stone-500 uppercase tracking-wider">Total Sales</p>
          <p className="text-2xl font-bold text-[#241812]">{stats?.totalSales.toLocaleString()} MAD</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
          <p className="text-sm text-stone-500 uppercase tracking-wider">Total Orders</p>
          <p className="text-2xl font-bold text-[#241812]">{stats?.orderCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
          <p className="text-sm text-stone-500 uppercase tracking-wider">Total Products</p>
          <p className="text-2xl font-bold text-[#241812]">{stats?.productCount}</p>
        </div>
      </div>
    </div>
  );
}
