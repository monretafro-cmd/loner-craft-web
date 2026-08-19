import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useRows, useSaveRow, useDeleteRow } from "@/lib/admin/api";
import { useAdminSession } from "@/lib/admin/session";
import { PageHeader, Panel, StatusPill, LoadingRows, EmptyState } from "@/components/admin_new/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/_shell/categories")({
  head: () => ({ meta: [{ title: "Categories — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: CategoriesPage,
});

type Category = {
  id: string;
  name: string;
  name_fr: string | null;
  name_ar: string | null;
  slug: string;
  description: string | null;
  status: string;
  display_order: number;
};

const BLANK = { name: "", name_fr: "", name_ar: "", slug: "", description: "", status: "active", display_order: 0 };

function CategoriesPage() {
  const { data: session } = useAdminSession();
  const categories = useRows<Category>("categories", { orderBy: "display_order", ascending: true });
  const products = useRows<{ id: string; category_id: string | null }>("products", { select: "id, category_id" });
  const save = useSaveRow("categories", "categories");
  const remove = useDeleteRow("categories", "categories");
  const [form, setForm] = useState<Record<string, any>>(BLANK);

  const count = (categoryId: string) => (products.data ?? []).filter((p) => p.category_id === categoryId).length;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await save.mutateAsync({
      ...form,
      slug: (form.slug || form.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
      display_order: Number(form.display_order) || 0,
    });
    setForm(BLANK);
  }

  return (
    <>
      <PageHeader title="Categories" subtitle="Organise the catalogue in three languages" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          {categories.isLoading ? (
            <LoadingRows />
          ) : (categories.data ?? []).length === 0 ? (
            <EmptyState title="No categories yet" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border/60">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Slug</th>
                  <th className="pb-3 font-semibold text-center">Products</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3" />
                </tr>

              </thead>
              <tbody>
                {(categories.data ?? []).map((category) => (
                  <tr key={category.id} className="border-t border-border/60">
                    <td className="py-3">
                      <button className="font-medium hover:underline" onClick={() => setForm(category)}>{category.name}</button>
                      <p className="text-xs text-muted-foreground">{category.name_fr} · {category.name_ar}</p>
                    </td>
                    <td className="py-3 text-[11px] font-mono text-muted-foreground">{category.slug}</td>
                    <td className="py-3 text-center font-medium">{count(category.id)}</td>
                    <td className="py-3 text-center"><StatusPill status={category.status} /></td>

                    <td className="py-3 text-right">
                      {session?.role === "super_admin" ? (
                        <button
                          className="text-xs text-destructive hover:underline"
                          onClick={() => confirm(`Delete ${category.name}?`) && remove.mutate(category.id)}
                        >
                          Delete
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-xl">{form.id ? "Edit category" : "New category"}</h2>
          <form onSubmit={submit} className="space-y-3">
            <Input placeholder="Name (EN)" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Nom (FR)" value={form.name_fr ?? ""} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} />
            <Input placeholder="الاسم (AR)" value={form.name_ar ?? ""} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} />
            <Input placeholder="Slug" value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <Textarea placeholder="Description" rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-3">
              <select
                value={form.status ?? "active"}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
              <Input
                type="number"
                className="w-24"
                value={form.display_order ?? 0}
                onChange={(e) => setForm({ ...form, display_order: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-ink text-ink-foreground hover:bg-ink/90">
                <Plus className="mr-2 h-4 w-4" /> {form.id ? "Update" : "Create"}
              </Button>
              {form.id ? (
                <Button type="button" variant="outline" onClick={() => setForm(BLANK)}>Cancel</Button>
              ) : null}
            </div>
          </form>
        </Panel>
      </div>
    </>
  );
}