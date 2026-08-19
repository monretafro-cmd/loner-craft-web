import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRows, useInvalidate, logAudit } from "@/lib/admin/api";
import { PageHeader, Panel, LoadingRows, EmptyState, shortDateTime } from "@/components/admin_new/AdminUI";
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
          <h2 className="mb-6 font-display text-2xl text-ink">Stock levels</h2>

          {products.isLoading ? (
            <LoadingRows />
          ) : (products.data ?? []).length === 0 ? (
            <EmptyState title="No products to track" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border/60">
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold text-center">Stock</th>
                  <th className="pb-3 font-semibold text-center">Sold</th>
                  <th className="pb-3 font-semibold text-right">Adjust</th>
                </tr>

              </thead>
              <tbody>
                {(products.data ?? []).map((product) => (
                  <tr key={product.id} className="border-t border-border/40 hover:bg-secondary/5 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-ink text-sm">{product.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{product.sku ?? "NO SKU"}</p>
                    </td>
                    <td className="py-4 text-center">
                      <span className={cn(
                        "inline-flex min-w-[3rem] justify-center rounded-lg px-2 py-1 text-xs font-bold",
                        product.stock <= product.low_stock_threshold 
                          ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200 animate-pulse" 
                          : "bg-secondary/20 text-ink"
                      )}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 text-center text-muted-foreground font-semibold text-xs">{product.sold}</td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <Input
                          className="h-9 w-20 text-center font-bold text-ink border-border/40 focus-visible:ring-cognac"
                          placeholder="±"
                          value={drafts[product.id] ?? ""}
                          onChange={(event) => setDrafts({ ...drafts, [product.id]: event.target.value })}
                        />
                        <Button 
                          className="h-9 bg-ink text-white hover:bg-ink/90 font-bold uppercase tracking-widest text-[10px] px-4"
                          onClick={() => adjust(product)}
                        >
                          Apply
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          )}
        </Panel>

        <Panel>
          <h2 className="mb-6 font-display text-2xl text-ink">Movements</h2>
          {(history.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center italic">No stock movements recorded.</p>
          ) : (
            <div className="space-y-3">
              {(history.data ?? []).map((entry: any) => (
                <div key={entry.id} className="rounded-xl bg-secondary/10 p-3 border border-border/20">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="font-bold text-xs text-ink truncate">{names.get(entry.product_id) ?? "Unknown Product"}</span>
                    <span className={cn(
                      "text-xs font-black",
                      entry.change > 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {entry.change > 0 ? "+" : ""}{entry.change}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-bold">
                    <span className="text-muted-foreground">{entry.reason}</span>
                    <span className="text-muted-foreground/60">{shortDateTime(entry.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </Panel>
      </div>
    </>
  );
}