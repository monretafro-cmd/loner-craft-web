import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ShoppingBag, 
  Wallet, 
  Users, 
  AlertTriangle, 
  Package, 
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRows } from "@/lib/admin/api";
import { MAD, Panel, PageHeader, StatCard, StatusPill, shortDateTime, EmptyState, LoadingRows } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/_shell/")({
  head: () => ({ meta: [{ title: "Dashboard — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  city: string;
  total: number;
  status: string;
  created_at: string;
};

function Dashboard() {
  const queryClient = useQueryClient();
  const orders = useRows<Order>("orders", { orderBy: "created_at", limit: 500 });
  const products = useRows<{ id: string; name: string; stock: number; low_stock_threshold: number; status: string }>(
    "products",
    { select: "id, name, stock, low_stock_threshold, status", orderBy: "created_at" },
  );
  const customers = useRows<{ id: string }>("customers", { select: "id" });
  
  useEffect(() => {
    const channel = supabase
      .channel("admin-dashboard-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[1] === "orders" });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[1] === "products" });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const stats = useMemo(() => {
    const rows = orders.data ?? [];
    const now = new Date();
    const todayStr = now.toDateString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const todayOrders = rows.filter(o => new Date(o.created_at).toDateString() === todayStr);
    const monthOrders = rows.filter(o => new Date(o.created_at) >= monthStart);
    
    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const monthRevenue = monthOrders.reduce((sum, o) => sum + Number(o.total), 0);
    
    const pending = rows.filter(o => o.status === "new" || o.status === "pending");
    const confirmed = rows.filter(o => o.status === "confirmed" || o.status === "packed");
    const delivered = rows.filter(o => o.status === "delivered");
    
    const lowStock = (products.data ?? []).filter(p => p.stock <= (p.low_stock_threshold || 5));
    
    return {
      todayRevenue,
      monthRevenue,
      todayCount: todayOrders.length,
      pendingCount: pending.length,
      confirmedCount: confirmed.length,
      deliveredCount: delivered.length,
      customerCount: customers.data?.length ?? 0,
      lowStockCount: lowStock.length,
      lowStockItems: lowStock
    };
  }, [orders.data, products.data, customers.data]);

  if (orders.isLoading || products.isLoading || customers.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" subtitle="Loading your store overview..." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/60" />
          ))}
        </div>
        <LoadingRows rows={10} />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Professional store management" />
      
      {/* Primary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Revenue Today" 
          value={MAD(stats.todayRevenue)} 
          hint={`${stats.todayCount} orders today`}
          icon={<TrendingUp className="h-4 w-4" />} 
        />
        <StatCard 
          label="Revenue This Month" 
          value={MAD(stats.monthRevenue)} 
          icon={<Wallet className="h-4 w-4" />} 
        />
        <StatCard 
          label="Orders Today" 
          value={stats.todayCount} 
          icon={<ShoppingBag className="h-4 w-4" />} 
        />
        <StatCard 
          label="Total Customers" 
          value={stats.customerCount} 
          icon={<Users className="h-4 w-4" />} 
        />
      </div>

      {/* Order Status Cards */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="flex items-center gap-4 bg-[#8A4D25]/5 border-[#8A4D25]/10">
          <div className="rounded-full bg-[#8A4D25]/20 p-2.5 text-[#8A4D25]">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending</p>
            <p className="text-2xl font-display text-foreground">{stats.pendingCount}</p>
          </div>
        </Panel>
        <Panel className="flex items-center gap-4 bg-amber-500/5 border-amber-500/10">
          <div className="rounded-full bg-amber-500/20 p-2.5 text-amber-700">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirmed</p>
            <p className="text-2xl font-display text-foreground">{stats.confirmedCount}</p>
          </div>
        </Panel>
        <Panel className="flex items-center gap-4 bg-sky-500/5 border-sky-500/10">
          <div className="rounded-full bg-sky-500/20 p-2.5 text-sky-700">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shipped</p>
            <p className="text-2xl font-display text-foreground">{orders.data?.filter(o => o.status === "shipped").length ?? 0}</p>
          </div>
        </Panel>
        <Panel className="flex items-center gap-4 bg-emerald-500/5 border-emerald-500/10">
          <div className="rounded-full bg-emerald-500/20 p-2.5 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delivered</p>
            <p className="text-2xl font-display text-foreground">{stats.deliveredCount}</p>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Latest Orders Table */}
        <Panel className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl text-[#241812]">Recent Orders</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Manage your latest customer purchases</p>
            </div>
            <Link to="/admin/orders" className="group inline-flex items-center text-xs font-semibold uppercase tracking-widest text-[#8A4D25] hover:text-[#241812]">
              View All <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          
          {!orders.data?.length ? (
            <EmptyState title="No orders yet" hint="Customer orders will appear here automatically." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border/60">
                    <th className="pb-3 font-semibold">Order #</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">City</th>
                    <th className="pb-3 font-semibold text-right">Total</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                    <th className="pb-3 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {orders.data.slice(0, 10).map((order) => (
                    <tr key={order.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="py-4 font-medium text-[#241812]">
                        <Link to="/admin/orders/$id" params={{ id: order.id }} className="hover:underline decoration-[#8A4D25] underline-offset-4">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="py-4">{order.customer_name}</td>
                      <td className="py-4 text-muted-foreground">{order.city}</td>
                      <td className="py-4 text-right font-medium">{MAD(order.total)}</td>
                      <td className="py-4 text-center">
                        <StatusPill status={order.status} />
                      </td>
                      <td className="py-4 text-right text-[11px] text-muted-foreground">
                        {shortDateTime(order.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Sidebar Alerts & Quick Info */}
        <div className="space-y-6">
          {/* Stock Alerts Panel */}
          <Panel className={stats.lowStockCount > 0 ? "border-amber-200 bg-amber-50/30" : ""}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg text-[#241812]">
                <Package className="h-4 w-4 text-[#8A4D25]" /> Stock Alerts
              </h2>
              {stats.lowStockCount > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-tighter">
                  {stats.lowStockCount} items
                </span>
              )}
            </div>
            
            {!stats.lowStockCount ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600 mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">All products are well stocked.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.lowStockItems.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-lg border border-amber-200/50 bg-white p-2.5 text-sm shadow-sm">
                    <span className="font-medium truncate max-w-[140px] text-[#241812]">{product.name}</span>
                    <span className={cn(
                      "rounded px-2 py-0.5 text-xs font-bold",
                      product.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {product.stock} left
                    </span>
                  </div>
                ))}
                <Link to="/admin/inventory" className="block text-center text-xs font-bold uppercase tracking-widest text-[#8A4D25] hover:underline mt-4">
                  Manage Inventory
                </Link>
              </div>
            )}
          </Panel>

          {/* New Add Options Panel */}
          <Panel className="bg-[#241812] text-white">
            <h2 className="mb-4 font-display text-lg">Quick Actions</h2>
            <div className="space-y-2">
              <Link 
                to="/admin/products/$id" 
                params={{ id: "new" }}
                className="flex w-full items-center justify-between rounded-xl bg-white/10 p-3 text-sm transition hover:bg-white/20"
              >
                <span>Add New Product</span>
                <Plus className="h-4 w-4" />
              </Link>
              <Link 
                to="/admin/categories"
                className="flex w-full items-center justify-between rounded-xl bg-white/10 p-3 text-sm transition hover:bg-white/20"
              >
                <span>Manage Categories</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
