import { supabase } from "@/integrations/supabase/client";
import { redirect } from "@tanstack/react-router";

const OWNER_EMAIL = "valaverde05@gmail.com";

export async function getAdminSession() {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Admin session check timed out")), 8000)
  );

  const check = async () => {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) return { session: null, profile: null, error: "No active session" };

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      return { session: null, profile: null, error: "Profile lookup failed" };
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    let adminProfile = profile ? { ...profile, user_roles: roles || [] } : null;

    if (session.user.email === OWNER_EMAIL) {
      if (!adminProfile || adminProfile.status !== "approved" || !adminProfile.is_owner) {
        const { data: updatedProfile } = await supabase
          .from("profiles")
          .upsert({
            id: session.user.id,
            email: OWNER_EMAIL,
            status: "approved",
            is_owner: true,
            full_name: session.user.user_metadata?.full_name || "Owner",
            avatar_url: session.user.user_metadata?.avatar_url,
          })
          .select("*")
          .single();
        
        const { data: updatedRoles } = await supabase
          .from("user_roles")
          .upsert({
            user_id: session.user.id,
            role: "super_admin"
          })
          .select("role");

        adminProfile = { ...(updatedProfile as any), user_roles: updatedRoles || [{ role: "super_admin" }], status: "approved", is_owner: true };
      }
    }

    if (!adminProfile) {
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({
          id: session.user.id,
          email: session.user.email || "",
          status: "pending",
          is_owner: false,
          full_name: session.user.user_metadata?.full_name || "",
          avatar_url: session.user.user_metadata?.avatar_url || "",
        })
        .select("*")
        .single();
      adminProfile = newProfile ? { ...newProfile, user_roles: [] } : null;
    }

    return { session, profile: adminProfile };
  };

  try {
    const result = await Promise.race([check(), timeout]) as any;
    return result;
  } catch (err) {
    console.error("Session error:", err);
    return { session: null, profile: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function requireAdminAuth() {
  const { session, profile, error } = await getAdminSession();
  
  if (!session || error) {
    throw redirect({ to: "/admin/login" });
  }

  if (profile?.status === "blocked") {
    await supabase.auth.signOut();
    throw redirect({ to: "/admin/login" });
  }

  if (profile?.status !== "approved") {
    throw redirect({ to: "/admin/pending" });
  }

  const isAdmin = profile?.is_owner || profile?.user_roles?.some((r: any) => ["admin", "super_admin"].includes(r.role));
  
  if (!isAdmin) {
    throw redirect({ to: "/" });
  }

  return { session, profile };
}
