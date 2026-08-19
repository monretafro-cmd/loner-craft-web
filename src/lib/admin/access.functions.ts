import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const INITIAL_OWNER_EMAIL = "valaverde05@gmail.com";

export type AccessState = {
  status: "pending" | "approved" | "rejected" | "blocked";
  role: "super_admin" | "admin" | null;
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
};

/**
 * Runs after every login. Server-side source of truth for admin access:
 * only INITIAL_OWNER_EMAIL is auto-promoted. Everyone else stays pending
 * until an approved Super Admin explicitly approves the account.
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
    const isInitialOwner = email === INITIAL_OWNER_EMAIL;
    const now = new Date().toISOString();

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
    const { data: existingRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const wasSuperAdmin = existingRoles?.some((row) => row.role === "super_admin") ?? false;
    const ownerNeedsPromotion =
      isInitialOwner &&
      (status !== "approved" || !wasSuperAdmin || profile?.approved_by !== userId);

    if (isInitialOwner) {
      status = "approved";
      await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "super_admin" });
    } else if (status !== "approved") {
      // Pending, rejected and blocked users never keep an authorization role.
      await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    }

    await supabaseAdmin
      .from("profiles")
      .update({
        status,
        provider,
        email,
        last_login_at: now,
        avatar_url: profile?.avatar_url ?? meta.avatar_url ?? null,
        full_name: profile?.full_name ?? meta.full_name ?? meta.name ?? null,
        ...(isInitialOwner
          ? { approved_at: now, approved_by: userId }
          : status === "approved" && !profile?.approved_at
            ? { approved_at: now }
            : {}),
      })
      .eq("id", userId);

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const role = roles?.some((r) => r.role === "super_admin")
      ? "super_admin"
      : roles?.length
        ? "admin"
        : null;

    if (ownerNeedsPromotion) {
      await supabaseAdmin.from("audit_logs").insert({
        admin_id: userId,
        admin_name: email,
        action: "initial_owner_promoted",
        page: "admin/access",
        record_type: "profiles",
        record_id: userId,
        old_value: {
          status: profile?.status ?? "pending",
          role: wasSuperAdmin ? "super_admin" : null,
        } as never,
        new_value: {
          email: INITIAL_OWNER_EMAIL,
          status: "approved",
          role: "super_admin",
          approved_by: userId,
          initialization: "self_owner_initialization",
        } as never,
      });
    }

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

/**
 * Sends an admin invitation. The invited account still starts pending with no
 * role; a Super Admin must approve it after the account signs in.
 */
export const inviteAdminByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      email: string;
      requestedRole?: "super_admin" | "admin";
      expiresAt?: string | null;
    }) => {
      const email = String(input.email ?? "")
        .trim()
        .toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new Error("Enter a valid email address.");
      const requestedRole: "super_admin" | "admin" =
        input.requestedRole === "super_admin" ? "super_admin" : "admin";
      const expiresAt = input.expiresAt ? new Date(input.expiresAt).toISOString() : null;
      return { email, requestedRole, expiresAt };
    },
  )
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("profiles").select("status, email").eq("id", userId).maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const isApprovedSuperAdmin =
      profile?.status === "approved" && roles?.some((row) => row.role === "super_admin");
    if (!isApprovedSuperAdmin) throw new Error("Only an approved Super Admin can invite admins.");

    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from("admin_invitations")
      .insert({
        email: data.email,
        role: data.requestedRole,
        expires_at: data.expiresAt,
        created_by: userId,
      })
      .select("id")
      .single();
    if (invitationError) throw invitationError;

    const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email);
    if (emailError) {
      await supabaseAdmin.from("admin_invitations").delete().eq("id", invitation.id);
      throw emailError;
    }

    await supabaseAdmin.from("audit_logs").insert({
      admin_id: userId,
      admin_name: profile?.email ?? null,
      action: "admin_invitation_sent",
      page: "admins",
      record_type: "admin_invitations",
      record_id: invitation.id,
      new_value: {
        email: data.email,
        requested_role: data.requestedRole,
        expires_at: data.expiresAt,
        approval_required: true,
      } as never,
    });

    return { ok: true };
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

/** Records access-related events such as redirects and sign-outs. */
export const logAdminAccessEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      action: "admin_redirect" | "admin_pending_redirect" | "admin_sign_out";
      path?: string;
      details?: Record<string, any>;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    const claims = context.claims as Record<string, any>;
    const email = (claims?.email ?? "").toLowerCase();

    await supabaseAdmin.from("audit_logs").insert({
      admin_id: userId,
      admin_name: email,
      action: data.action,
      page: data.path ?? "admin",
      record_type: "access",
      record_id: userId,
      new_value: (data.details ?? {}) as never,
    });
    return { ok: true };
  });
