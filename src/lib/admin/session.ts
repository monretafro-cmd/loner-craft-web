import { supabase } from "@/integrations/supabase/client";

export async function getAdminSession() {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Admin session check timed out")), 8000)
  );

  const check = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { session: null, error: "No active session" };

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*, user_roles(role)")
      .eq("id", session.user.id)
      .single();

    if (profileError) return { session: null, error: "Profile lookup failed" };
    return { session, profile };
  };

  try {
    return await Promise.race([check(), timeout]);
  } catch (err) {
    return { session: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
