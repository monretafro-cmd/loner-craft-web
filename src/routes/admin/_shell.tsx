import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { loadAdminSession } from "@/lib/admin/session";

export const Route = createFileRoute("/admin/_shell")({
  ssr: false,
  beforeLoad: async () => {
    const session = await loadAdminSession();
    if (!session?.role) throw redirect({ to: "/admin/login" });
    return { session };
  },
  component: () => (
    <AdminShell>
      <Outlet />
    </AdminShell>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground">{error.message}</div>
  ),
});