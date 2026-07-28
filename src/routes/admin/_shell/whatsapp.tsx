import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { useRows } from "@/lib/admin/api";
import { PageHeader, Panel, StatusPill, EmptyState, shortDateTime } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/_shell/whatsapp")({
  head: () => ({ meta: [{ title: "WhatsApp — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: WhatsAppPage,
});

const TEMPLATES = [
  { key: "confirm", label: "Order confirmation", text: "Hello {name}, this is Loner Leather. Your order {order} is confirmed for {total}, cash on delivery. We ship within 24-48h." },
  { key: "shipped", label: "Shipped", text: "Hello {name}, your Loner Leather order {order} has shipped. The courier will call you before delivery." },
  { key: "delivered", label: "Thank you", text: "Thank you {name} for choosing Loner Leather. We would love a short review of your piece." },
  { key: "abandoned", label: "Follow up", text: "Hello {name}, you left a piece in your bag at Loner Leather. Would you like us to reserve it for you?" },
];

function WhatsAppPage() {
  const logs = useRows<any>("whatsapp_logs", { orderBy: "created_at", limit: 60 });
  const orders = useRows<any>("orders", { select: "id, order_number, customer_name, phone, whatsapp_status, total, status", orderBy: "created_at", limit: 40 });
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(TEMPLATES[0].text);

  const pending = (orders.data ?? []).filter((order: any) => order.whatsapp_status === "not_sent");

  function send() {
    const digits = phone.replace(/[^0-9]/g, "");
    if (!digits) return toast.error("Add a phone number first");
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, "_blank");
  }

  return (
    <>
      <PageHeader title="WhatsApp" subtitle="Templates, quick send and message history" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="space-y-3 lg:col-span-2">
          <h2 className="font-display text-xl">Quick send</h2>
          <Input placeholder="Phone (e.g. 212661248803)" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <Textarea rows={5} value={message} onChange={(event) => setMessage(event.target.value)} />
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((template) => (
              <button
                key={template.key}
                onClick={() => setMessage(template.text)}
                className="rounded-full bg-secondary px-3 py-1.5 text-xs text-secondary-foreground hover:bg-secondary/70"
              >
                {template.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={send} className="bg-[#25D366] text-white hover:bg-[#25D366]/90">
              <MessageCircle className="mr-2 h-4 w-4" /> Open WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(message);
                toast.success("Message copied");
              }}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-3 font-display text-xl">Awaiting contact</h2>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">Every recent order has been contacted.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {pending.map((order: any) => (
                <li key={order.id} className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                  </div>
                  <StatusPill status={order.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel className="mt-6">
        <h2 className="mb-4 font-display text-xl">Message history</h2>
        {(logs.data ?? []).length === 0 ? (
          <EmptyState title="No messages logged yet" hint="Messages sent from an order are recorded automatically." />
        ) : (
          <ul className="space-y-3 text-sm">
            {(logs.data ?? []).map((log: any) => (
              <li key={log.id} className="border-b border-border/50 pb-3 last:border-0">
                <p className="whitespace-pre-line text-muted-foreground">{log.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{log.direction} · {log.status} · {shortDateTime(log.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}