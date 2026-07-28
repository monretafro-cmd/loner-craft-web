import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRows, useInvalidate, logAudit } from "@/lib/admin/api";
import { PageHeader, Panel, LoadingRows, EmptyState, shortDateTime } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/_shell/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: InventoryPage,
});

type Product = { id: string; name: string; sku: string | null; stock: number; low_stock_threshold: number; sold: number };

function InventoryPage() {
  const products = useRows<Product>("products", { select: "id, name, sku, stock, low_stock_threshold, sold", orderBy: "name", ascending: true });
  const history = useRows<any>("inventory_history", { orderBy: "created_at", limit: 40 });
  const invalidate = useInvalidate();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  async function adjust(product: Product) {
    const raw = drafts[product.id];
    const change = Number(raw);
    if (!raw || Number.isNaN(change) || change === 0) return;
    const stock = Math.max(0, product.stock + change);
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from("products").update({ stock }).eq("id", product.id);
    if (error) return toast.error(error.message);
    await supabase.from("inventory_history").insert({
      product_id: product.id,
      change,
      reason: change > 0 ? "Manual restock" : "Manual adjustment",
      resulting_stock: stock,
      admin_id: user.user?.id ?? null,
    });
    await logAudit({ action: "stock_adjust", page: "inventory", recordType: "products", recordId: product.id, newValue: { change, stock } });
    setDrafts({ ...drafts, [product.id]: "" });
    invalidate();
    toast.success(`${product.name} now at ${stock}`);
  }

  const names = new Map((products.data ?? []).map((p) => [p.id, p.name]));

  return (
    <>
      <PageHeader title="Inventory" subtitle="Stock levels and movement history" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h2 className="mb-4 font-display text-xl">Stock levels</h2>
          {products.isLoading ? (
            <LoadingRows />
          ) : (products.data ?? []).length === 0 ? (
            <EmptyState title="No products to track" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Sold</th>
                  <th className="pb-3">Adjust</th>
                </tr>
              </thead>
              <tbody>
                {(products.data ?? []).map((product) => (
                  <tr key={product.id} className="border-t border-border/60">
                    <td className="py-3">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku ?? "—"}</p>
                    </td>
                    <td className={`py-3 ${product.stock <= product.low_stock_threshold ? "text-destructive" : ""}`}>
                      {product.stock}
                    </td>
                    <td className="py-3 text-muted-foreground">{product.sold}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Input
                          className="w-24"
                          placeholder="+5 / -2"
                          value={drafts[product.id] ?? ""}
                          onChange={(event) => setDrafts({ ...drafts, [product.id]: event.target.value })}
                        />
                        <Button size="sm" variant="outline" onClick={() => adjust(product)}>Apply</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-xl">Movements</h2>
          {(history.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No stock movements recorded yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {(history.data ?? []).map((entry: any) => (
                <li key={entry.id} className="border-b border-border/50 pb-2 last:border-0">
                  <div className="flex justify-between">
                    <span>{names.get(entry.product_id) ?? "Product"}</span>
                    <span className={entry.change > 0 ? "text-emerald-600" : "text-destructive"}>
                      {entry.change > 0 ? "+" : ""}{entry.change}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{entry.reason} · {shortDateTime(entry.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}