import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Wallet, Users, AlertTriangle, Package, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRows } from "@/lib/admin/api";
import { MAD, Panel, PageHeader, StatCard, StatusPill, shortDateTime, EmptyState } from "@/components/admin/AdminUI";

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
  const orders = useRows<Order>("orders", { orderBy: "created_at", limit: 250 });
  const products = useRows<{ id: string; name: string; stock: number; low_stock_threshold: number; status: string }>(
    "products",
    { select: "id, name, stock, low_stock_threshold, status", orderBy: "created_at" },
  );
  const customers = useRows<{ id: string }>("customers", { select: "id" });
  const reviews = useRows<{ id: string; status: string }>("reviews", { select: "id, status" });

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "admin" });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const rows = orders.data ?? [];
  const today = new Date().toDateString();
  const todayOrders = rows.filter((order) => new Date(order.created_at).toDateString() === today);
  const revenue = rows
    .filter((order) => ["delivered", "shipped", "confirmed", "packed"].includes(order.status))
    .reduce((sum, order) => sum + Number(order.total), 0);
  const pending = rows.filter((order) => ["new", "pending"].includes(order.status));
  const lowStock = (products.data ?? []).filter((product) => product.stock <= product.low_stock_threshold);
  const pendingReviews = (reviews.data ?? []).filter((review) => review.status === "pending");

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live overview of your store" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders today" value={todayOrders.length} hint={`${rows.length} total`} icon={<ShoppingBag className="h-4 w-4" />} />
        <StatCard label="Revenue" value={MAD(revenue)} hint="Confirmed and beyond" icon={<Wallet className="h-4 w-4" />} />
        <StatCard label="Customers" value={customers.data?.length ?? 0} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Pending orders" value={pending.length} hint="Awaiting confirmation" icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Latest orders</h2>
            <Link to="/admin/orders" className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          {rows.length === 0 ? (
            <EmptyState title="No orders yet" hint="Orders placed on the storefront appear here instantly." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 8).map((order) => (
                    <tr key={order.id} className="border-t border-border/60">
                      <td className="py-3">
                        <Link to="/admin/orders/$id" params={{ id: order.id }} className="font-medium hover:underline">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="py-3">{order.customer_name}</td>
                      <td className="py-3 text-muted-foreground">{order.city}</td>
                      <td className="py-3">{MAD(order.total)}</td>
                      <td className="py-3"><StatusPill status={order.status} /></td>
                      <td className="py-3 text-muted-foreground">{shortDateTime(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel>
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl">
              <Package className="h-4 w-4" /> Low stock
            </h2>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">Every product is comfortably stocked.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {lowStock.map((product) => (
                  <li key={product.id} className="flex items-center justify-between">
                    <span>{product.name}</span>
                    <span className="text-destructive">{product.stock} left</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel>
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl">
              <Star className="h-4 w-4" /> Waiting for you
            </h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <Link to="/admin/reviews" className="hover:underline">Reviews to moderate</Link>
                <span>{pendingReviews.length}</span>
              </li>
              <li className="flex justify-between">
                <Link to="/admin/orders" className="hover:underline">Orders to confirm</Link>
                <span>{pending.length}</span>
              </li>
              <li className="flex justify-between">
                <Link to="/admin/products" className="hover:underline">Active products</Link>
                <span>{(products.data ?? []).filter((p) => p.status === "active").length}</span>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}