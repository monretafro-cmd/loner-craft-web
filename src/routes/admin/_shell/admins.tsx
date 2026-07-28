import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, Mail, Ban, Check, X, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRows, useInvalidate, logAudit } from "@/lib/admin/api";
import { loadAdminSession, useAdminSession } from "@/lib/admin/session";
import { inviteAdminByEmail } from "@/lib/admin/access.functions";
import { PageHeader, Panel, EmptyState, LoadingRows, shortDate } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/_shell/admins")({
  beforeLoad: async () => {
    const session = await loadAdminSession();
    if (!session) throw redirect({ to: "/admin/login" });
    if (session.status !== "approved" || session.role !== "super_admin") {
      throw redirect({ to: "/admin" });
    }
  },
  head: () => ({
    meta: [
      { title: "Admins and Access — Loner Leather Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminsPage,
});

type Tab = "pending" | "approved" | "blocked";

const TABS: { key: Tab; label: string }[] = [
  { key: "pending", label: "Pending requests" },
  { key: "approved", label: "Approved users" },
  { key: "blocked", label: "Blocked users" },
];

function AdminsPage() {
  const { data: session } = useAdminSession();
  const sendInvitation = useServerFn(inviteAdminByEmail);
  const isSuper = session?.role === "super_admin";
  const profiles = useRows<any>("profiles", { orderBy: "created_at" });
  const roles = useRows<any>("user_roles", {});
  const invitations = useRows<any>("admin_invitations", {
    orderBy: "created_at",
    enabled: !!isSuper,
  });
  const invalidate = useInvalidate();
  const [tab, setTab] = useState<Tab>("pending");
  const [details, setDetails] = useState<any | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "super_admin">("admin");
  const [inviteExpiry, setInviteExpiry] = useState("");

  const roleOf = (userId: string) =>
    (roles.data ?? []).find((row: any) => row.user_id === userId)?.role ?? null;

  const rows = useMemo(() => {
    const all = profiles.data ?? [];
    if (tab === "pending") return all.filter((p: any) => p.status === "pending");
    if (tab === "approved") return all.filter((p: any) => p.status === "approved");
    return all.filter((p: any) => p.status === "blocked" || p.status === "rejected");
  }, [profiles.data, tab]);

  if (!isSuper) {
    return (
      <>
        <PageHeader
          title="Admins and Access"
          subtitle="Team access to the Loner Leather admin panel"
        />
        <Panel className="flex items-center gap-3 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" /> Only the Super Admin can manage admin access.
        </Panel>
      </>
    );
  }

  async function setAccess(profile: any, status: string, role: "admin" | "super_admin" | null) {
    const { error } = await supabase
      .from("profiles")
      .update({
        status,
        approved_by: status === "approved" ? (session?.userId ?? null) : null,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", profile.id);
    if (error) return toast.error(error.message);

    await supabase.from("user_roles").delete().eq("user_id", profile.id);
    if (role) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: profile.id, role: role as never });
      if (roleError) return toast.error(roleError.message);
    }
    if (status === "approved" && profile.email) {
      await supabase
        .from("admin_invitations")
        .update({
          accepted_at: new Date().toISOString(),
          accepted_by: profile.id,
        })
        .ilike("email", profile.email)
        .eq("revoked", false)
        .is("accepted_at", null);
    }
    await logAudit({
      action:
        status === "approved"
          ? "user_approved"
          : status === "blocked"
            ? "user_blocked"
            : "user_rejected",
      page: "admins",
      recordType: "profiles",
      recordId: profile.id,
      oldValue: { status: profile.status, role: roleOf(profile.id) },
      newValue: { status, role },
    });
    invalidate();
    toast.success("Access updated");
  }

  async function changeRole(profile: any, role: "admin" | "super_admin") {
    await supabase.from("user_roles").delete().eq("user_id", profile.id);
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: profile.id, role: role as never });
    if (error) return toast.error(error.message);
    await logAudit({
      action: "role_changed",
      page: "admins",
      recordType: "user_roles",
      recordId: profile.id,
      newValue: { role },
    });
    invalidate();
    toast.success("Role updated");
  }

  async function removeAdmin(profile: any) {
    await supabase.from("user_roles").delete().eq("user_id", profile.id);
    const { error } = await supabase
      .from("profiles")
      .update({ status: "rejected" })
      .eq("id", profile.id);
    if (error) return toast.error(error.message);
    await logAudit({
      action: "admin_removed",
      page: "admins",
      recordType: "profiles",
      recordId: profile.id,
    });
    invalidate();
    toast.success("Admin removed");
  }

  async function createInvitation(event: React.FormEvent) {
    event.preventDefault();
    try {
      await sendInvitation({
        data: {
          email: inviteEmail,
          requestedRole: inviteRole,
          expiresAt: inviteExpiry ? new Date(inviteExpiry).toISOString() : null,
        },
      });
      setInviteEmail("");
      setInviteExpiry("");
      invalidate();
      toast.success("Invitation email sent");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not send invitation");
    }
  }

  async function revokeInvitation(invitation: any) {
    const { error } = await supabase
      .from("admin_invitations")
      .update({ revoked: true })
      .eq("id", invitation.id);
    if (error) return toast.error(error.message);
    await logAudit({
      action: "invitation_revoked",
      page: "admins",
      recordType: "admin_invitations",
      recordId: invitation.id,
    });
    invalidate();
    toast.success("Invitation revoked");
  }

  return (
    <>
      <PageHeader
        title="Admins and Access"
        subtitle="Approve, invite and manage administration accounts"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`min-h-11 rounded-full border px-4 text-sm transition ${
              tab === item.key
                ? "border-transparent bg-ink text-ink-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Panel>
        {profiles.isLoading ? (
          <LoadingRows />
        ) : rows.length === 0 ? (
          <EmptyState title="Nothing here yet" />
        ) : (
          <>
            {/* Mobile / tablet cards */}
            <div className="grid gap-3 lg:hidden">
              {rows.map((profile: any) => (
                <div key={profile.id} className="rounded-xl border border-border/70 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar profile={profile} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{profile.full_name ?? "—"}</p>
                      <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Provider: {profile.provider ?? "email"}</span>
                    <span>Requested: {shortDate(profile.created_at)}</span>
                    <span>Status: {profile.status}</span>
                    <span>Role: {roleOf(profile.id) ?? "none"}</span>
                  </div>
                  <Actions
                    profile={profile}
                    role={roleOf(profile.id)}
                    onApprove={setAccess}
                    onRole={changeRole}
                    onRemove={removeAdmin}
                    onDetails={setDetails}
                  />
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Provider</th>
                    <th className="pb-3">Requested</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((profile: any) => (
                    <tr key={profile.id} className="border-t border-border/60 align-top">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar profile={profile} />
                          <span>{profile.full_name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{profile.email}</td>
                      <td className="py-3 text-muted-foreground">{profile.provider ?? "email"}</td>
                      <td className="py-3 text-muted-foreground">
                        {shortDate(profile.created_at)}
                      </td>
                      <td className="py-3">
                        <span className="rounded-full border border-border px-2 py-1 text-xs capitalize">
                          {profile.status}
                          {roleOf(profile.id) ? ` · ${roleOf(profile.id).replace("_", " ")}` : ""}
                        </span>
                      </td>
                      <td className="py-3">
                        <Actions
                          profile={profile}
                          role={roleOf(profile.id)}
                          onApprove={setAccess}
                          onRole={changeRole}
                          onRemove={removeAdmin}
                          onDetails={setDetails}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>

      {details ? (
        <Panel className="mt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-xl">{details.full_name ?? details.email}</h3>
              <dl className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                <div>Email: {details.email}</div>
                <div>Provider: {details.provider ?? "email"}</div>
                <div>Status: {details.status}</div>
                <div>Role: {roleOf(details.id) ?? "none"}</div>
                <div>Requested: {shortDate(details.created_at)}</div>
                <div>Approved: {details.approved_at ? shortDate(details.approved_at) : "—"}</div>
                <div>
                  Last login: {details.last_login_at ? shortDate(details.last_login_at) : "—"}
                </div>
              </dl>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setDetails(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Panel>
      ) : null}

      <Panel className="mt-6">
        <h3 className="font-display text-xl">Invitations</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Invited accounts start pending. A Super Admin must approve the account and role after sign
          in.
        </p>
        <form
          onSubmit={createInvitation}
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]"
        >
          <div className="space-y-1">
            <Label htmlFor="inviteEmail" className="text-xs">
              Email
            </Label>
            <Input
              id="inviteEmail"
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="inviteRole" className="text-xs">
              Role
            </Label>
            <select
              id="inviteRole"
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as "admin" | "super_admin")}
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="inviteExpiry" className="text-xs">
              Expires
            </Label>
            <Input
              id="inviteExpiry"
              type="date"
              value={inviteExpiry}
              onChange={(event) => setInviteExpiry(event.target.value)}
              className="h-11"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="h-11 w-full sm:w-auto">
              <Mail className="mr-2 h-4 w-4" /> Invite
            </Button>
          </div>
        </form>

        <div className="mt-5 grid gap-2">
          {(invitations.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No invitations yet.</p>
          ) : (
            (invitations.data ?? []).map((invitation: any) => (
              <div
                key={invitation.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{invitation.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {invitation.role.replace("_", " ")} ·{" "}
                    {invitation.revoked
                      ? "revoked"
                      : invitation.accepted_at
                        ? `accepted ${shortDate(invitation.accepted_at)}`
                        : invitation.expires_at
                          ? `expires ${shortDate(invitation.expires_at)}`
                          : "no expiry"}
                  </p>
                </div>
                {!invitation.revoked && !invitation.accepted_at ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-11"
                    onClick={() => revokeInvitation(invitation)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Revoke
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </Panel>
    </>
  );
}

function Avatar({ profile }: { profile: any }) {
  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.full_name ?? profile.email}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs uppercase">
      {(profile.full_name ?? profile.email ?? "?").slice(0, 2)}
    </span>
  );
}

function Actions({
  profile,
  role,
  onApprove,
  onRole,
  onRemove,
  onDetails,
}: {
  profile: any;
  role: string | null;
  onApprove: (profile: any, status: string, role: "admin" | "super_admin" | null) => void;
  onRole: (profile: any, role: "admin" | "super_admin") => void;
  onRemove: (profile: any) => void;
  onDetails: (profile: any) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2 lg:mt-0">
      {profile.status !== "approved" ? (
        <>
          <Button
            size="sm"
            className="min-h-11"
            onClick={() => onApprove(profile, "approved", "admin")}
          >
            <Check className="mr-2 h-4 w-4" /> Approve as Admin
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="min-h-11"
            onClick={() => onApprove(profile, "approved", "super_admin")}
          >
            <ShieldCheck className="mr-2 h-4 w-4" /> Approve as Super Admin
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="min-h-11"
          onClick={() => onRole(profile, role === "super_admin" ? "admin" : "super_admin")}
        >
          <UserCog className="mr-2 h-4 w-4" />
          {role === "super_admin" ? "Make Admin" : "Make Super Admin"}
        </Button>
      )}
      {profile.status !== "rejected" ? (
        <Button
          size="sm"
          variant="outline"
          className="min-h-11"
          onClick={() => onApprove(profile, "rejected", null)}
        >
          <X className="mr-2 h-4 w-4" /> Reject
        </Button>
      ) : null}
      {profile.status !== "blocked" ? (
        <Button
          size="sm"
          variant="outline"
          className="min-h-11"
          onClick={() => onApprove(profile, "blocked", null)}
        >
          <Ban className="mr-2 h-4 w-4" /> Block
        </Button>
      ) : null}
      {profile.status === "approved" ? (
        <Button size="sm" variant="ghost" className="min-h-11" onClick={() => onRemove(profile)}>
          <Trash2 className="mr-2 h-4 w-4" /> Remove
        </Button>
      ) : null}
      <Button size="sm" variant="ghost" className="min-h-11" onClick={() => onDetails(profile)}>
        View details
      </Button>
    </div>
  );
}
