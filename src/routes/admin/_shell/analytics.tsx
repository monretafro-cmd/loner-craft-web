import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useRows } from "@/lib/admin/api";
import { MAD, PageHeader, Panel, StatCard, EmptyState } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/_shell/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const orders = useRows<any>("orders", { orderBy: "created_at", limit: 500 });
  const items = useRows<any>("order_items", { orderBy: "created_at", limit: 1000 });

  const stats = useMemo(() => {
    const rows = orders.data ?? [];
    const paid = rows.filter((order: any) => ["confirmed", "packed", "shipped", "delivered"].includes(order.status));
    const revenue = paid.reduce((sum: number, order: any) => sum + Number(order.total), 0);
    const delivered = rows.filter((order: any) => order.status === "delivered").length;
    const cancelled = rows.filter((order: any) => ["cancelled", "returned"].includes(order.status)).length;

    const byCity = new Map<string, number>();
    const byDay = new Map<string, number>();
    for (const order of rows) {
      byCity.set(order.city, (byCity.get(order.city) ?? 0) + 1);
      const day = new Date(order.created_at).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + Number(order.total));
    }

    const byProduct = new Map<string, { quantity: number; revenue: number }>();
    for (const item of items.data ?? []) {
      const current = byProduct.get(item.product_name) ?? { quantity: 0, revenue: 0 };
      byProduct.set(item.product_name, {
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + Number(item.line_total),
      });
    }

    return {
      total: rows.length,
      revenue,
      average: paid.length ? revenue / paid.length : 0,
      delivered,
      cancelled,
      conversion: rows.length ? Math.round((delivered / rows.length) * 100) : 0,
      cities: [...byCity.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
      days: [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-14),
      products: [...byProduct.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 8),
    };
  }, [orders.data, items.data]);

  const maxDay = Math.max(1, ...stats.days.map(([, value]) => value));

  return (
    <>
      <PageHeader title="Analytics" subtitle="Sales performance across Morocco" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={MAD(stats.revenue)} hint={`${stats.total} orders`} />
        <StatCard label="Average order" value={MAD(Math.round(stats.average))} />
        <StatCard label="Delivered" value={stats.delivered} hint={`${stats.conversion}% of orders`} />
        <StatCard label="Cancelled / returned" value={stats.cancelled} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h2 className="mb-4 font-display text-xl">Revenue, last 14 days</h2>
          {stats.days.length === 0 ? (
            <EmptyState title="No sales data yet" />
          ) : (
            <div className="flex h-48 items-end gap-2">
              {stats.days.map(([day, value]) => (
                <div key={day} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-cognac/80"
                    style={{ height: `${Math.max(4, (value / maxDay) * 100)}%` }}
                    title={`${day}: ${MAD(value)}`}
                  />
                  <span className="text-[10px] text-muted-foreground">{day.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-xl">Top cities</h2>
          {stats.cities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {stats.cities.map(([city, count]) => (
                <li key={city} className="flex justify-between">
                  <span>{city}</span>
                  <span className="text-muted-foreground">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel className="mt-6">
        <h2 className="mb-4 font-display text-xl">Best sellers</h2>
        {stats.products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No product sales recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="pb-3">Product</th>
                <th className="pb-3">Units</th>
                <th className="pb-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.products.map(([name, value]) => (
                <tr key={name} className="border-t border-border/60">
                  <td className="py-3">{name}</td>
                  <td className="py-3">{value.quantity}</td>
                  <td className="py-3">{MAD(value.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}