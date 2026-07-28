import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRows, useInvalidate, logAudit } from "@/lib/admin/api";
import { useAdminSession } from "@/lib/admin/session";
import { PageHeader, Panel, EmptyState, LoadingRows, shortDate } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/_shell/admins")({
  head: () => ({ meta: [{ title: "Admins — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminsPage,
});

const ROLES = ["super_admin", "admin"] as const;

function AdminsPage() {
  const { data: session } = useAdminSession();
  const profiles = useRows<any>("profiles", { orderBy: "created_at" });
  const roles = useRows<any>("user_roles", {});
  const invalidate = useInvalidate();
  const isSuper = session?.role === "super_admin";

  const roleOf = (userId: string) =>
    (roles.data ?? []).find((row: any) => row.user_id === userId)?.role ?? null;

  async function setRole(userId: string, role: string | null) {
    if (!isSuper) return;
    await supabase.from("user_roles").delete().eq("user_id", userId);
    if (role) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as never });
      if (error) return toast.error(error.message);
    }
    await logAudit({ action: "update", page: "admins", recordType: "user_roles", recordId: userId, newValue: { role } });
    invalidate();
    toast.success("Access updated");
  }

  return (
    <>
      <PageHeader title="Admins" subtitle="Team access to the Loner Leather admin panel" />
      {!isSuper ? (
        <Panel className="mb-6 flex items-center gap-3 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" /> Only a Super Admin can change team access.
        </Panel>
      ) : null}
      <Panel>
        {profiles.isLoading ? (
          <LoadingRows />
        ) : (profiles.data ?? []).length === 0 ? (
          <EmptyState title="No team members yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Joined</th>
                  <th className="pb-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {(profiles.data ?? []).map((profile: any) => (
                  <tr key={profile.id} className="border-t border-border/60">
                    <td className="py-3">{profile.full_name ?? "—"}</td>
                    <td className="py-3 text-muted-foreground">{profile.email}</td>
                    <td className="py-3 text-muted-foreground">{shortDate(profile.created_at)}</td>
                    <td className="py-3">
                      <select
                        disabled={!isSuper}
                        value={roleOf(profile.id) ?? ""}
                        onChange={(event) => setRole(profile.id, event.target.value || null)}
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-60"
                      >
                        <option value="">No access</option>
                        {ROLES.map((role) => (
                          <option key={role} value={role}>{role.replace("_", " ")}</option>
                        ))}
                      </select>
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