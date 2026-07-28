import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AccessState = {
  status: "pending" | "approved" | "rejected" | "blocked";
  role: "super_admin" | "admin" | null;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
};

/**
 * Runs after every login. Server-side source of truth for admin access:
 * only SUPER_ADMIN_EMAIL is auto-promoted, invited emails are auto-approved,
 * everyone else stays pending.
 */
export const syncAdminAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccessState> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    const claims = context.claims as Record<string, any>;
    const email: string = (claims?.email ?? "").toLowerCase();
    const meta = (claims?.user_metadata ?? {}) as Record<string, any>;
    const provider = (claims?.app_metadata?.provider ?? "email") as string;
    const ownerEmail = (process.env.SUPER_ADMIN_EMAIL ?? "").trim().toLowerCase();

    let { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      const { data: created } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          email,
          full_name: meta.full_name ?? meta.name ?? email.split("@")[0],
          avatar_url: meta.avatar_url ?? null,
          provider,
          status: "pending",
        })
        .select("*")
        .single();
      profile = created;
    }

    let status = (profile?.status ?? "pending") as AccessState["status"];
    let grantRole: "super_admin" | "admin" | null = null;

    if (ownerEmail && email === ownerEmail) {
      grantRole = "super_admin";
      status = "approved";
    } else if (status === "pending") {
      const { data: invite } = await supabaseAdmin
        .from("admin_invitations")
        .select("*")
        .ilike("email", email)
        .eq("revoked", false)
        .is("accepted_at", null)
        .maybeSingle();
      if (invite && (!invite.expires_at || new Date(invite.expires_at) > new Date())) {
        grantRole = invite.role as "super_admin" | "admin";
        status = "approved";
        await supabaseAdmin
          .from("admin_invitations")
          .update({ accepted_at: new Date().toISOString(), accepted_by: userId })
          .eq("id", invite.id);
      }
    }

    if (grantRole) {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: grantRole });
    }

    await supabaseAdmin
      .from("profiles")
      .update({
        status,
        provider,
        email,
        last_login_at: new Date().toISOString(),
        avatar_url: profile?.avatar_url ?? meta.avatar_url ?? null,
        full_name: profile?.full_name ?? meta.full_name ?? meta.name ?? null,
        ...(status === "approved" && !profile?.approved_at ? { approved_at: new Date().toISOString() } : {}),
      })
      .eq("id", userId);

    const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
    const role = roles?.some((r) => r.role === "super_admin")
      ? "super_admin"
      : roles?.length
        ? "admin"
        : null;

    await supabaseAdmin.from("audit_logs").insert({
      admin_id: userId,
      admin_name: email,
      action: "login_success",
      page: "admin/login",
      record_type: "auth",
      record_id: userId,
      new_value: { provider, status, role } as never,
    });

    return {
      status,
      role: status === "approved" ? role : null,
      email,
      fullName: profile?.full_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
    };
  });

/** Records a failed sign-in attempt (no session available at that point). */
export const logFailedLogin = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; provider?: string; reason?: string }) => ({
    email: String(input.email ?? "").slice(0, 200),
    provider: String(input.provider ?? "email").slice(0, 40),
    reason: String(input.reason ?? "").slice(0, 300),
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("audit_logs").insert({
      admin_name: data.email,
      action: "login_failed",
      page: "admin/login",
      record_type: "auth",
      new_value: { provider: data.provider, reason: data.reason } as never,
    });
    return { ok: true };
  });
