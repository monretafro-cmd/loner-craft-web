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
      // The user is the owner, ensure they have the role and are approved
      const hasSuperAdmin = roles?.some(r => r.role === 'super_admin');
      
      if (!adminProfile || adminProfile.status !== "approved" || !adminProfile.is_owner || !hasSuperAdmin) {
        console.log("Auto-approving owner...");
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
        
        await supabase
          .from("user_roles")
          .upsert({
            user_id: session.user.id,
            role: "super_admin"
          });

        const { data: finalRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        adminProfile = { ...(updatedProfile as any), user_roles: finalRoles || [{ role: "super_admin" }], status: "approved", is_owner: true };
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
    console.warn("Auth required: No session or error", error);
    throw redirect({ to: "/admin/login" });
  }

  if (profile?.status === "blocked") {
    console.warn("Auth denied: Profile blocked");
    await supabase.auth.signOut();
    throw redirect({ to: "/admin/login" });
  }

  if (profile?.status !== "approved") {
    console.warn("Auth pending: Status is", profile?.status);
    throw redirect({ to: "/admin/pending" });
  }

  const isAdmin = profile?.is_owner || profile?.user_roles?.some((r: any) => ["admin", "super_admin"].includes(r.role));
  
  if (!isAdmin) {
    console.warn("Auth denied: Not an admin");
    throw redirect({ to: "/" });
  }

  return { session, profile };
}
