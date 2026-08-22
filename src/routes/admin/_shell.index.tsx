import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/api";
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  AlertTriangle,
  Clock,
  ChevronRight,
  Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/_shell/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.stats(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const lowStockCount = stats?.lowStockCount ?? 0;

  const statCards = [
    {
      title: "Sales Today",
      value: `${(stats?.salesToday ?? 0).toLocaleString()} MAD`,
      icon: TrendingUp,
      trend: "+12.5%",
      trendColor: "text-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Total Orders",
      value: stats?.orderCount ?? 0,
      icon: ShoppingCart,
      trend: "Recent activity",
      trendColor: "text-amber-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600"
    },
    {
      title: "Total Customers",
      value: stats?.customerCount ?? 0,
      icon: Users,
      trend: "New this week",
      trendColor: "text-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Active Products",
      value: stats?.productCount ?? 0,
      icon: Package,
      trend: lowStockCount > 0 ? `${lowStockCount} low stock` : "All in stock",
      trendColor: lowStockCount > 0 ? "text-red-600" : "text-stone-500",
      bgColor: "bg-stone-50",
      iconColor: "text-stone-600"
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#241812]">Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">Overview of your store's performance</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-stone-200 text-sm font-medium text-stone-600">
          <Clock size={16} />
          Last updated: {format(new Date(), "HH:mm")}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-[#241812]">{stat.value}</h3>
                  <p className={`text-xs mt-1 font-medium ${stat.trendColor}`}>
                    {stat.trend}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`${stat.iconColor}`} size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-stone-100 pb-4">
            <CardTitle className="text-lg font-serif">Recent Orders</CardTitle>
            <Link to="/admin" className="text-sm text-[#8A4D25] hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 text-xs uppercase font-semibold">
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {(stats?.recentOrders || []).map((order: any) => (
                    <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-[#241812]">
                        #{order.order_number || order.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#241812]">{order.customer_name}</div>
                        <div className="text-xs text-stone-500">{order.city}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {order.total} MAD
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-stone-400 italic text-sm">
                        No recent orders to show
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Store Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-stone-700">Storefront Online</span>
                </div>
                <Link to="/admin" className="text-xs text-[#8A4D25] hover:underline">Manage</Link>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Wallet className="text-stone-400" size={18} />
                  <span className="text-sm font-medium text-stone-700">COD Active</span>
                </div>
                <span className="text-xs text-green-600 font-bold uppercase">Ready</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-[#241812] text-white">
            <CardContent className="p-6 space-y-4">
              <div className="bg-[#8A4D25]/20 p-3 w-fit rounded-xl">
                <AlertTriangle className="text-[#8A4D25]" size={24} />
              </div>
              <div>
                <h4 className="font-serif text-lg">Inventory Check</h4>
                <p className="text-stone-400 text-xs mt-1">
                  {lowStockCount > 0 
                    ? `You have ${lowStockCount} items running low on stock. Time to restock!` 
                    : "All inventory levels are healthy. Great job!"}
                </p>
              </div>
              <Button 
                asChild
                variant="outline" 
                className="w-full border-stone-700 hover:bg-[#32241b] text-white"
              >
                <Link to="/admin">Manage Inventory</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
