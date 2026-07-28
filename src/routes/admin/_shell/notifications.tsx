import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRows, useSaveRow, useInvalidate } from "@/lib/admin/api";
import { PageHeader, Panel, EmptyState, shortDateTime } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/_shell/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const notifications = useRows<any>("notifications", { orderBy: "created_at", limit: 100 });
  const save = useSaveRow("notifications", "notifications");
  const invalidate = useInvalidate();

  async function markAllRead() {
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    invalidate();
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="New orders, low stock and customer activity"
        actions={<Button variant="outline" onClick={markAllRead}>Mark all read</Button>}
      />
      {(notifications.data ?? []).length === 0 ? (
        <EmptyState title="You are all caught up" hint="Alerts about new orders and low stock appear here." />
      ) : (
        <Panel>
          <ul className="divide-y divide-border/60">
            {(notifications.data ?? []).map((notification: any) => (
              <li key={notification.id} className="flex items-start gap-3 py-3">
                <span className={`mt-1 rounded-lg p-2 ${notification.read ? "bg-secondary" : "bg-cognac/15 text-cognac"}`}>
                  <Bell className="h-3.5 w-3.5" />
                </span>
                <div className="flex-1">
                  <p className={notification.read ? "text-muted-foreground" : "font-medium"}>{notification.title}</p>
                  {notification.body ? <p className="text-sm text-muted-foreground">{notification.body}</p> : null}
                  <p className="text-xs text-muted-foreground">{shortDateTime(notification.created_at)}</p>
                </div>
                {!notification.read ? (
                  <button className="text-xs text-muted-foreground hover:underline" onClick={() => save.mutate({ id: notification.id, read: true })}>
                    Mark read
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}