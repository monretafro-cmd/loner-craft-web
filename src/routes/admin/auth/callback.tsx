import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      // Small delay to ensure session is persisted
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
