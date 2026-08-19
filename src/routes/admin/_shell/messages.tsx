import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { useRows, useSaveRow, useDeleteRow } from "@/lib/admin/api";
import { useAdminSession } from "@/lib/admin/session";
import { PageHeader, Panel, StatusPill, LoadingRows, EmptyState, shortDateTime } from "@/components/admin_new/AdminUI";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/_shell/messages")({
  head: () => ({ meta: [{ title: "Messages — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const sessionQuery = useAdminSession();
  const session = sessionQuery.data;
  const messages = useRows<any>("messages", { orderBy: "created_at" });
  const save = useSaveRow("messages", "messages");
  const remove = useDeleteRow("messages", "messages");

  return (
    <>
      <PageHeader title="Messages" subtitle="Contact form enquiries from the storefront" />
      {messages.isLoading ? (
        <LoadingRows />
      ) : (messages.data ?? []).length === 0 ? (
        <EmptyState title="Inbox is empty" hint="Messages sent from the contact page arrive here." />
      ) : (
        <div className="space-y-4">
          {(messages.data ?? []).map((message: any) => (
            <Panel key={message.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{message.name} {message.subject ? <span className="text-muted-foreground">· {message.subject}</span> : null}</p>
                  <p className="text-xs text-muted-foreground">
                    {message.phone ?? message.email ?? "—"} · {shortDateTime(message.created_at)} · {message.source}
                  </p>
                </div>
                <StatusPill status={message.status} />
              </div>
              <p className="text-sm text-muted-foreground">{message.message}</p>
              <div className="flex flex-wrap gap-2">
                {message.phone ? (
                  <Button asChild size="sm" className="bg-[#25D366] text-white hover:bg-[#25D366]/90">
                    <a href={`https://wa.me/${String(message.phone).replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">
                      <MessageCircle className="mr-2 h-3.5 w-3.5" /> Reply on WhatsApp
                    </a>
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={() => save.mutate({ id: message.id, status: "read" })}>Mark read</Button>
                <Button size="sm" variant="outline" onClick={() => save.mutate({ id: message.id, status: "replied" })}>Mark replied</Button>
                {session?.role === "super_admin" ? (
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove.mutate(message.id)}>Delete</Button>
                ) : null}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}