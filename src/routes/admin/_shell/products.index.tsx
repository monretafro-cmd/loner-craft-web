import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useRows, useDeleteRow } from "@/lib/admin/api";
import { useAdminSession } from "@/lib/admin/session";
import { MAD, PageHeader, Panel, StatusPill, LoadingRows, EmptyState, shortDate } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/_shell/products/")({
  head: () => ({ meta: [{ title: "Products — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: ProductsPage,
});

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  status: string;
  featured: boolean;
  created_at: string;
  category_id: string | null;
};

function ProductsPage() {
  const { data: session } = useAdminSession();
  const products = useRows<Product>("products", { orderBy: "created_at" });
  const categories = useRows<{ id: string; name: string }>("categories", { select: "id, name", orderBy: "display_order", ascending: true });
  const remove = useDeleteRow("products", "products");
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("all");

  const categoryName = useMemo(() => {
    const map = new Map((categories.data ?? []).map((c) => [c.id, c.name]));
    return (id: string | null) => (id ? (map.get(id) ?? "—") : "—");
  }, [categories.data]);

  const filtered = (products.data ?? []).filter(
    (product) =>
      (status === "all" || product.status === status) &&
      (product.name.toLowerCase().includes(term.toLowerCase()) ||
        (product.sku ?? "").toLowerCase().includes(term.toLowerCase())),
  );

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Everything the storefront sells"
        actions={
          <Button asChild className="bg-ink text-ink-foreground hover:bg-ink/90">
            <Link to="/admin/products/$id" params={{ id: "new" }}>
              <Plus className="mr-2 h-4 w-4" /> New product
            </Link>
          </Button>
        }
      />
      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search name or SKU" className="pl-9" />
          </div>
          {["all", "active", "draft", "archived"].map((value) => (
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

        {products.isLoading ? (
          <LoadingRows />
        ) : filtered.length === 0 ? (
          <EmptyState title="No products found" hint="Create your first product to publish it on the storefront." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Created</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-t border-border/60">
                    <td className="py-3">
                      <Link to="/admin/products/$id" params={{ id: product.id }} className="font-medium hover:underline">
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{product.sku ?? product.slug}</p>
                    </td>
                    <td className="py-3 text-muted-foreground">{categoryName(product.category_id)}</td>
                    <td className="py-3">
                      {MAD(product.sale_price ?? product.price)}
                      {product.sale_price ? (
                        <span className="ml-2 text-xs text-muted-foreground line-through">{MAD(product.price)}</span>
                      ) : null}
                    </td>
                    <td className={`py-3 ${product.stock <= 3 ? "text-destructive" : ""}`}>{product.stock}</td>
                    <td className="py-3"><StatusPill status={product.status} /></td>
                    <td className="py-3 text-muted-foreground">{shortDate(product.created_at)}</td>
                    <td className="py-3 text-right">
                      {session?.role === "super_admin" ? (
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${product.name}?`)) remove.mutate(product.id);
                          }}
                          className="text-xs text-destructive hover:underline"
                        >
                          Delete
                        </button>
                      ) : null}
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