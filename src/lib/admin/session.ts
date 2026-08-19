import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AdminStatus = "pending" | "approved" | "rejected" | "blocked";

export type AdminSession = {
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  status: AdminStatus;
  role: "super_admin" | "admin" | null;
};

let cachedSession: AdminSession | null = null;
let sessionPromise: Promise<AdminSession | null> | null = null;

export async function loadAdminSession(forceRefresh = false): Promise<AdminSession | null> {
  if (!forceRefresh && cachedSession) return cachedSession;
  if (sessionPromise) return sessionPromise;

  sessionPromise = (async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        cachedSession = null;
        return null;
      }

      const [{ data: roles }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", data.user.id),
        supabase
          .from("profiles")
          .select("full_name, avatar_url, status")
          .eq("id", data.user.id)
          .maybeSingle(),
      ]);

      const status = ((profile as any)?.status ?? "pending") as AdminStatus;
      const rawRole = roles?.some((r) => r.role === "super_admin")
        ? "super_admin"
        : roles?.length
          ? "admin"
          : null;

      cachedSession = {
        userId: data.user.id,
        email: data.user.email ?? "",
        fullName: profile?.full_name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        status,
        role: status === "approved" ? (rawRole as "super_admin" | "admin" | null) : null,
      };
      return cachedSession;
    } catch (err) {
      console.error("Error loading admin profile:", err);
      return null;
    } finally {
      sessionPromise = null;
    }
  })();

  return sessionPromise;
}

export function clearAdminSession() {
  cachedSession = null;
  sessionPromise = null;
}

export function useAdminSession() {
  return useQuery({
    queryKey: ["admin", "session"],
    queryFn: loadAdminSession,
    staleTime: 60_000,
    gcTime: 60_000,
  });
}
