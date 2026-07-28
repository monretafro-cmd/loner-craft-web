import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRows } from "@/lib/admin/api";
import { MAD, PageHeader, Panel, StatusPill, LoadingRows, EmptyState, shortDateTime } from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/_shell/orders/")({
  head: () => ({ meta: [{ title: "Orders — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: OrdersPage,
});

export const ORDER_STATUSES = [
  "new",
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  city: string;
  total: number;
  status: string;
  whatsapp_status: string;
  payment_method: string;
  created_at: string;
};

function OrdersPage() {
  const queryClient = useQueryClient();
  const orders = useRows<Order>("orders", { orderBy: "created_at" });
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const channel = supabase
      .channel("orders-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[1] === "orders" });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const rows = (orders.data ?? []).filter(
    (order) =>
      (status === "all" || order.status === status) &&
      [order.order_number, order.customer_name, order.phone, order.city]
        .join(" ")
        .toLowerCase()
        .includes(term.toLowerCase()),
  );

  return (
    <>
      <PageHeader title="Orders" subtitle="Cash on delivery orders, updated live" />
      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search order, name, phone or city" className="pl-9" />
          </div>
          {["all", ...ORDER_STATUSES].map((value) => (
            <button
              key={value}
              onClick={() => setStatus(value)}
              className={`rounded-full px-3 py-1.5 text-xs capitalize transition-colors ${
                status === value ? "bg-ink text-ink-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {orders.isLoading ? (
          <LoadingRows />
        ) : rows.length === 0 ? (
          <EmptyState title="No orders here" hint="New storefront orders land in this list instantly." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">City</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">WhatsApp</th>
                  <th className="pb-3">Placed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => (
                  <tr key={order.id} className="border-t border-border/60">
                    <td className="py-3">
                      <Link to="/admin/orders/$id" params={{ id: order.id }} className="font-medium hover:underline">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-3">{order.customer_name}</td>
                    <td className="py-3 text-muted-foreground">{order.phone}</td>
                    <td className="py-3 text-muted-foreground">{order.city}</td>
                    <td className="py-3">{MAD(order.total)}</td>
                    <td className="py-3"><StatusPill status={order.status} /></td>
                    <td className="py-3 text-xs text-muted-foreground">{order.whatsapp_status.replace("_", " ")}</td>
                    <td className="py-3 text-muted-foreground">{shortDateTime(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}