import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MessageCircle } from "lucide-react";
import { useRows } from "@/lib/admin/api";
import { MAD, PageHeader, Panel, StatusPill, LoadingRows, EmptyState, shortDate } from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/_shell/customers")({
  head: () => ({ meta: [{ title: "Customers — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: CustomersPage,
});

type Customer = {
  id: string;
  name: string;
  phone: string;
  city: string | null;
  status: string;
  orders_count: number;
  total_spent: number;
  last_order_at: string | null;
  language: string | null;
};

function CustomersPage() {
  const customers = useRows<Customer>("customers", { orderBy: "created_at" });
  const [term, setTerm] = useState("");
  const rows = (customers.data ?? []).filter((customer) =>
    [customer.name, customer.phone, customer.city ?? ""].join(" ").toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <>
      <PageHeader title="Customers" subtitle="Everyone who has ordered from the workshop" />
      <Panel>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search name, phone or city" className="pl-9" />
        </div>
        {customers.isLoading ? (
          <LoadingRows />
        ) : rows.length === 0 ? (
          <EmptyState title="No customers yet" hint="Customer records are created automatically with each order." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">City</th>
                  <th className="pb-3">Orders</th>
                  <th className="pb-3">Spent</th>
                  <th className="pb-3">Last order</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((customer) => (
                  <tr key={customer.id} className="border-t border-border/60">
                    <td className="py-3">
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                    </td>
                    <td className="py-3 text-muted-foreground">{customer.city ?? "—"}</td>
                    <td className="py-3">{customer.orders_count}</td>
                    <td className="py-3">{MAD(customer.total_spent)}</td>
                    <td className="py-3 text-muted-foreground">{shortDate(customer.last_order_at)}</td>
                    <td className="py-3"><StatusPill status={customer.status} /></td>
                    <td className="py-3 text-right">
                      <a
                        href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#128C7E] hover:underline"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    </td>
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