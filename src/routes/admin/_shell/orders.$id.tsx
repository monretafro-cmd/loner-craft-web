import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRows, useInvalidate, logAudit } from "@/lib/admin/api";
import { ORDER_STATUSES } from "./orders.index";
import { MAD, PageHeader, Panel, StatusPill, shortDateTime } from "@/components/admin_new/AdminUI";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/_shell/orders/$id")({
  head: () => ({ meta: [{ title: "Order — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: OrderDetail,
});

type Order = Record<string, any>;

function OrderDetail() {
  const { id } = Route.useParams();
  const invalidate = useInvalidate();
  const [order, setOrder] = useState<Order | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const items = useRows<any>("order_items", { eq: { order_id: id }, orderBy: "created_at", ascending: true });
  const history = useRows<any>("order_status_history", { eq: { order_id: id }, orderBy: "created_at" });

  useEffect(() => {
    supabase.from("orders").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setOrder(data);
      setNotes(data?.admin_notes ?? "");
    });
  }, [id]);

  async function changeStatus(status: string) {
    if (!order) return;
    setBusy(true);
    const previous = order.status;
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      setBusy(false);
      return;
    }
    await supabase.from("order_status_history").insert({
      order_id: id,
      from_status: previous,
      to_status: status,
      admin_id: user.user?.id ?? null,
    });
    if (status === "confirmed" && !order.stock_applied) {
      for (const item of items.data ?? []) {
        if (!item.product_id) continue;
        const { data: product } = await supabase.from("products").select("stock, sold").eq("id", item.product_id).maybeSingle();
        if (!product) continue;
        const stock = Math.max(0, product.stock - item.quantity);
        await supabase.from("products").update({ stock, sold: (product.sold ?? 0) + item.quantity }).eq("id", item.product_id);
        await supabase.from("inventory_history").insert({
          product_id: item.product_id,
          change: -item.quantity,
          reason: `Order ${order.order_number} confirmed`,
          order_id: id,
          resulting_stock: stock,
          admin_id: user.user?.id ?? null,
        });
      }
      await supabase.from("orders").update({ stock_applied: true }).eq("id", id);
    }
    await logAudit({ action: `order_status:${status}`, page: "orders", recordType: "orders", recordId: id, oldValue: { status: previous } });
    setOrder({ ...order, status });
    invalidate();
    setBusy(false);
    toast.success(`Order marked ${status}`);
  }

  async function saveNotes() {
    await supabase.from("orders").update({ admin_notes: notes }).eq("id", id);
    toast.success("Notes saved");
  }

  async function sendWhatsApp() {
    if (!order) return;
    const lines = [
      `Hello ${order.customer_name}, this is Loner Leather.`,
      `Your order ${order.order_number} is confirmed.`,
      ...(items.data ?? []).map((item: any) => `- ${item.product_name} x${item.quantity}`),
      `Total: ${MAD(order.total)} (cash on delivery)`,
      `Delivery to: ${order.address}, ${order.city}`,
    ];
    const message = encodeURIComponent(lines.join("\n"));
    const phone = (order.whatsapp || order.phone).replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    const { data: user } = await supabase.auth.getUser();
    await supabase.from("whatsapp_logs").insert({
      order_id: id,
      customer_id: order.customer_id,
      admin_id: user.user?.id ?? null,
      message: lines.join("\n"),
      language: order.language,
    });
    await supabase
      .from("orders")
      .update({
        whatsapp_status: "sent",
        whatsapp_attempts: (order.whatsapp_attempts ?? 0) + 1,
        last_whatsapp_at: new Date().toISOString(),
      })
      .eq("id", id);
    invalidate();
  }

  if (!order) return <p className="text-sm text-muted-foreground">Loading order…</p>;

  return (
    <>
      <PageHeader
        title={order.order_number}
        subtitle={`Placed ${shortDateTime(order.created_at)} · ${order.source}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/admin/orders"><ArrowLeft className="mr-2 h-4 w-4" /> Orders</Link>
            </Button>
            <Button onClick={sendWhatsApp} className="bg-[#25D366] text-white hover:bg-[#25D366]/90">
              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp customer
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel>
            <h2 className="mb-4 font-display text-xl">Items</h2>
            <table className="w-full text-sm">
              <tbody>
                {(items.data ?? []).map((item: any) => (
                  <tr key={item.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3">
                      {item.product_name}
                      {item.variant ? <span className="text-muted-foreground"> · {item.variant}</span> : null}
                    </td>
                    <td className="py-3 text-center text-muted-foreground">x{item.quantity}</td>
                    <td className="py-3 text-right">{MAD(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={MAD(order.subtotal)} />
              <Row label="Delivery" value={MAD(order.delivery_fee)} />
              {Number(order.discount) > 0 ? <Row label="Discount" value={`- ${MAD(order.discount)}`} /> : null}
              <div className="flex justify-between border-t border-border/60 pt-3 font-display text-xl text-ink">
                <span>Total</span>
                <span className="font-bold">{MAD(order.total)}</span>
              </div>
            </dl>

          </Panel>

          <Panel>
            <h2 className="mb-3 font-display text-xl">Internal notes</h2>
            <Textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
            <Button onClick={saveNotes} variant="outline" className="mt-3">Save notes</Button>
          </Panel>

          <Panel>
            <h2 className="mb-3 font-display text-xl">Timeline</h2>
            {(history.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No status changes yet.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {(history.data ?? []).map((entry: any) => (
                  <li key={entry.id} className="flex items-center gap-3">
                    <StatusPill status={entry.to_status} />
                    <span className="text-muted-foreground">
                      from {entry.from_status ?? "—"} · {shortDateTime(entry.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <h2 className="mb-3 font-display text-xl">Status</h2>
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status}
                  disabled={busy}
                  onClick={() => changeStatus(status)}
                  className={`rounded-full px-3 py-1.5 text-xs capitalize transition-colors ${
                    order.status === status ? "bg-ink text-ink-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            {busy ? <Loader2 className="mt-3 h-4 w-4 animate-spin text-muted-foreground" /> : null}
          </Panel>

          <Panel>
            <h2 className="mb-4 font-display text-xl">Customer</h2>
            <div className="space-y-1">
              <Row label="Name" value={order.customer_name} />
              <Row label="Phone" value={order.phone} />
              {order.email ? <Row label="Email" value={order.email} /> : null}
              <Row label="City" value={order.city} />
              <Row label="Address" value={order.address} />
              <Row label="Payment" value={order.payment_method.toUpperCase()} />
              <Row label="Language" value={String(order.language).toUpperCase()} />
              <Row label="WhatsApp" value={<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{String(order.whatsapp_status).replace("_", " ")}</span>} />
            </div>
            {order.customer_notes ? (
              <div className="mt-4 rounded-xl bg-cognac/5 border border-cognac/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-cognac mb-2">Customer Notes</p>
                <p className="text-sm text-ink/80 italic">{order.customer_notes}</p>
              </div>
            ) : null}
          </Panel>

        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-border/20 last:border-0">
      <dt className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
