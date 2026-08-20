import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/auth/callback")({
  component: AuthCallback,
  beforeLoad: async () => {
    // Basic server-side check to see if we have a session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      throw redirect({ to: "/admin" });
    }
  }
});

function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      // Supabase client handles the hash fragments automatically on initialization,
      // but we call getSession to ensure everything is hydrated.
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.error("Auth callback error:", error);
        window.location.href = "/admin/login?error=auth_callback_failed";
        return;
      }

      // Session established, redirect to dashboard
      window.location.href = "/admin";
    };

    handleCallback();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#241812]">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#8A4D25] border-t-transparent mx-auto"></div>
        <p className="font-serif text-white tracking-widest uppercase animate-pulse">
          Authenticating...
        </p>
      </div>
    </div>
  );
}
