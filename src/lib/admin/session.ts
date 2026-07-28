import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AdminSession = {
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: "super_admin" | "admin" | null;
};

export async function loadAdminSession(): Promise<AdminSession | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const [{ data: roles }, { data: profile }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", data.user.id),
    supabase.from("profiles").select("full_name, avatar_url").eq("id", data.user.id).maybeSingle(),
  ]);
  const role = roles?.some((r) => r.role === "super_admin")
    ? "super_admin"
    : roles?.length
      ? "admin"
      : null;
  return {
    userId: data.user.id,
    email: data.user.email ?? "",
    fullName: profile?.full_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    role,
  };
}

export function useAdminSession() {
  return useQuery({
    queryKey: ["admin", "session"],
    queryFn: loadAdminSession,
    staleTime: 60_000,
  });
}