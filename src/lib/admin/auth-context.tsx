import { supabase } from "@/integrations/supabase/client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "@tanstack/react-router";

export type AdminStatus = 'pending' | 'approved' | 'blocked' | 'unauthenticated' | 'loading' | 'error';
export type AdminRole = 'admin' | 'super_admin' | null;

export interface AdminProfile {
  id: string;
  email: string;
  status: AdminStatus;
  role: AdminRole;
  is_owner: boolean;
  full_name?: string;
  avatar_url?: string;
}

interface AdminAuthContextType {
  user: User | null;
  profile: AdminProfile | null;
  status: AdminStatus;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const OWNER_EMAIL = "valaverde05@gmail.com";
const SESSION_TIMEOUT_MS = 8000;

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [status, setStatus] = useState<AdminStatus>('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refreshSession = async () => {
    setIsLoading(true);
    setStatus('loading');
    setError(null);

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Admin session check timed out")), SESSION_TIMEOUT_MS)
    );

    try {
      const fetchSession = async () => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session) {
          setUser(null);
          setProfile(null);
          setStatus('unauthenticated');
          return;
        }

        setUser(session.user);
        
        // Fetch profile and roles
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*, user_roles(role)")
          .eq("id", session.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") throw profileError;

        let currentProfile: AdminProfile | null = null;
        
        if (session.user.email === OWNER_EMAIL) {
          // Auto-approve owner
          const { data: ownerProfile, error: ownerUpsertError } = await supabase
            .from("profiles")
            .upsert({
              id: session.user.id,
              email: OWNER_EMAIL,
              status: "approved",
              is_owner: true,
              full_name: session.user.user_metadata?.full_name || "Owner",
            })
            .select("*, user_roles(role)")
            .single();

          if (ownerUpsertError) throw ownerUpsertError;

          // Ensure super_admin role
          const hasSuperAdmin = (ownerProfile as any).user_roles?.some((r: any) => r.role === 'super_admin');
          if (!hasSuperAdmin) {
            await supabase.from("user_roles").upsert({
              user_id: session.user.id,
              role: "super_admin"
            });
          }

          currentProfile = {
            id: ownerProfile.id,
            email: ownerProfile.email || "",
            status: 'approved',
            role: 'super_admin',
            is_owner: true,
            full_name: ownerProfile.full_name || undefined,
            avatar_url: ownerProfile.avatar_url || undefined
          };
        } else if (profileData) {
          currentProfile = {
            id: profileData.id,
            email: profileData.email || "",
            status: profileData.status as AdminStatus,
            role: (profileData as any).user_roles?.[0]?.role as AdminRole,
            is_owner: profileData.is_owner || false,
            full_name: profileData.full_name || undefined,
            avatar_url: profileData.avatar_url || undefined
          };
        } else {
          // New admin signup - create pending profile
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: session.user.id,
              email: session.user.email || "",
              status: "pending",
              is_owner: false,
              full_name: session.user.user_metadata?.full_name || "",
            })
            .select("*")
            .single();
          
          if (insertError) throw insertError;
          
          currentProfile = {
            id: newProfile.id,
            email: newProfile.email || "",
            status: 'pending',
            role: null,
            is_owner: false,
            full_name: newProfile.full_name || undefined
          };
        }

        if (currentProfile) {
          setProfile(currentProfile);
          setStatus(currentProfile.status);
        }

      };

      await Promise.race([fetchSession(), timeoutPromise]);
    } catch (err: any) {
      console.error("Admin Auth Error:", err);
      setError(err.message || "Failed to verify admin session");
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refreshSession();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setStatus('unauthenticated');
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <AdminAuthContext.Provider value={{ user, profile, status, isLoading, error, signOut, refreshSession }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
