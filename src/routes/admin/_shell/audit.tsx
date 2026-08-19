import { createFileRoute } from "@tanstack/react-router";
import { useRows } from "@/lib/admin/api";
import { PageHeader, Panel, EmptyState, LoadingRows, shortDateTime } from "@/components/admin_new/AdminUI";

export const Route = createFileRoute("/admin/_shell/audit")({
  head: () => ({ meta: [{ title: "Audit Log — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: AuditPage,
});

function AuditPage() {
  const logs = useRows<any>("audit_logs", { orderBy: "created_at", limit: 200 });

  return (
    <>
      <PageHeader title="Audit Log" subtitle="Every change made inside the admin panel" />
      <Panel>
        {logs.isLoading ? (
          <LoadingRows />
        ) : (logs.data ?? []).length === 0 ? (
          <EmptyState title="No activity recorded yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="pb-3">When</th>
                  <th className="pb-3">Admin</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Section</th>
                  <th className="pb-3">Record</th>
                </tr>
              </thead>
              <tbody>
                {(logs.data ?? []).map((log: any) => (
                  <tr key={log.id} className="border-t border-border/60">
                    <td className="py-3 text-muted-foreground">{shortDateTime(log.created_at)}</td>
                    <td className="py-3">{log.admin_name ?? "—"}</td>
                    <td className="py-3">{log.action}</td>
                    <td className="py-3 text-muted-foreground">{log.page ?? log.record_type ?? "—"}</td>
                    <td className="py-3 text-xs text-muted-foreground">{log.record_id ?? "—"}</td>
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