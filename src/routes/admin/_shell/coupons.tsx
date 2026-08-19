import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRows, useSaveRow, useDeleteRow } from "@/lib/admin/api";
import { useAdminSession } from "@/lib/admin/session";
import { MAD, PageHeader, Panel, LoadingRows, EmptyState, shortDate } from "@/components/admin_new/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/_shell/coupons")({
  head: () => ({ meta: [{ title: "Coupons — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: CouponsPage,
});

const BLANK = { code: "", discount_type: "percentage", discount_value: 10, min_order: 0, max_uses: null, starts_at: null, ends_at: null, active: true };

function CouponsPage() {
  const { data: session } = useAdminSession();
  const coupons = useRows<any>("coupons", { orderBy: "created_at" });
  const save = useSaveRow("coupons", "coupons");
  const remove = useDeleteRow("coupons", "coupons");
  const [form, setForm] = useState<Record<string, any>>(BLANK);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await save.mutateAsync({
      ...form,
      code: String(form.code).toUpperCase().trim(),
      discount_value: Number(form.discount_value) || 0,
      min_order: Number(form.min_order) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    });
    setForm(BLANK);
  }

  return (
    <>
      <PageHeader title="Coupons" subtitle="Discount codes for campaigns and loyal customers" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          {coupons.isLoading ? (
            <LoadingRows />
          ) : (coupons.data ?? []).length === 0 ? (
            <EmptyState title="No coupons yet" hint="Create a code to run your first promotion." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Discount</th>
                  <th className="pb-3">Min order</th>
                  <th className="pb-3">Used</th>
                  <th className="pb-3">Ends</th>
                  <th className="pb-3">Active</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {(coupons.data ?? []).map((coupon: any) => (
                  <tr key={coupon.id} className="border-t border-border/60">
                    <td className="py-3">
                      <button className="font-medium hover:underline" onClick={() => setForm(coupon)}>{coupon.code}</button>
                    </td>
                    <td className="py-3">
                      {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : MAD(coupon.discount_value)}
                    </td>
                    <td className="py-3 text-muted-foreground">{MAD(coupon.min_order)}</td>
                    <td className="py-3">{coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ""}</td>
                    <td className="py-3 text-muted-foreground">{shortDate(coupon.ends_at)}</td>
                    <td className="py-3">
                      <Switch
                        checked={coupon.active}
                        onCheckedChange={(value) => save.mutate({ id: coupon.id, active: value })}
                      />
                    </td>
                    <td className="py-3 text-right">
                      {session?.role === "super_admin" ? (
                        <button className="text-xs text-destructive hover:underline" onClick={() => remove.mutate(coupon.id)}>
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
          <h2 className="mb-4 font-display text-xl">{form.id ? "Edit coupon" : "New coupon"}</h2>
          <form onSubmit={submit} className="space-y-3">
            <Input placeholder="CODE" value={form.code ?? ""} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            <select
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount (MAD)</option>
              <option value="free_shipping">Free shipping</option>
            </select>
            <Input type="number" placeholder="Value" value={form.discount_value ?? 0} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
            <Input type="number" placeholder="Minimum order" value={form.min_order ?? 0} onChange={(e) => setForm({ ...form, min_order: e.target.value })} />
            <Input type="number" placeholder="Max uses (optional)" value={form.max_uses ?? ""} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
            <Input type="date" value={form.starts_at?.slice(0, 10) ?? ""} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
            <Input type="date" value={form.ends_at?.slice(0, 10) ?? ""} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-ink text-ink-foreground hover:bg-ink/90">{form.id ? "Update" : "Create"}</Button>
              {form.id ? <Button type="button" variant="outline" onClick={() => setForm(BLANK)}>Cancel</Button> : null}
            </div>
          </form>
        </Panel>
      </div>
    </>
  );
}