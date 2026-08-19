import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { syncAdminAccess } from "@/lib/admin/access.functions";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, LogOut, Store, RefreshCcw } from "lucide-react";

export const Route = createFileRoute("/admin/pending")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Access Request Pending — Loner Leather" },
      {
        name: "description",
        content: "Your Loner Leather administration access request is awaiting approval.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Access Request Pending — Loner Leather" },
      {
        property: "og:description",
        content: "Your Loner Leather administration access request is awaiting approval.",
      },
    ],
  }),
  component: PendingPage,
  beforeLoad: async () => {
    const { loadAdminSession } = await import("@/lib/admin/session");
    const session = await loadAdminSession();
    
    // If not logged in, go to login
    if (!session) {
      throw redirect({ to: "/admin/login" });
    }
    
    // If already approved, go to admin
    if (session.status === "approved" && session.role) {
      throw redirect({ to: "/admin" });
    }
    
    // If blocked/rejected, go to login (sync will handle the actual signout if needed, but beforeLoad prevents flash)
    if (session.status === "blocked" || session.status === "rejected") {
      throw redirect({ to: "/admin/login" });
    }
  }
});

function PendingPage() {
  const navigate = useNavigate();
  const sync = useServerFn(syncAdminAccess);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async (isAuto = false) => {
    if (!isAuto) setChecking(true);
    setError(null);
    
    try {
      const access = await sync({ data: undefined as never });
      
      // Force a session refresh to pick up potential role changes
      await supabase.auth.refreshSession();
      
      if (access.status === "approved" && access.role) {
        // Use window.location for a hard reload to /admin to ensure shell layout re-runs beforeLoad
        window.location.href = "/admin";
        return;
      }
      
      if (access.status === "blocked" || access.status === "rejected") {
        await supabase.auth.signOut();
        return navigate({ to: "/admin/login", replace: true });
      }
      
      setEmail(access.email);
      // Try to get name from session
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setName(user.user_metadata.full_name);
      }
      
    } catch (err) {
      console.error("Status check failed:", err);
      if (!isAuto) setError("Unable to verify status. Please try again.");
    } finally {
      if (!isAuto) setChecking(false);
    }
  }, [navigate, sync]);

  useEffect(() => {
    checkStatus();
    
    // Auto check every 30 seconds
    const interval = setInterval(() => checkStatus(true), 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  if (checking && !email) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F3EF] p-4 text-[#241812]">
        <Loader2 className="h-8 w-8 animate-spin text-[#8A4D25]" />
        <p className="mt-4 text-sm font-medium animate-pulse">Verifying your account status...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F3EF] px-4 py-12 text-[#1C1815]">
      <div className="w-full max-w-[480px] rounded-2xl border border-[#241812]/10 bg-white p-8 text-center shadow-xl sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#8A4D25]/10">
          <Clock className="h-6 w-6 text-[#8A4D25]" />
        </div>
        
        <h1 className="mt-6 font-display text-3xl leading-tight text-[#241812]">Access Request Pending</h1>
        
        <div className="mt-6 space-y-4">
          <p className="text-base leading-relaxed text-[#1C1815]/80">
            Your account is waiting for approval from the Loner Leather owner.
          </p>
          
          {(name || email) && (
            <div className="rounded-xl bg-[#F7F3EF] p-4 text-left border border-[#241812]/5">
              {name && <p className="text-sm font-semibold text-[#241812]">{name}</p>}
              {email && <p className="text-xs text-[#1C1815]/60 mt-0.5">{email}</p>}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            onClick={() => checkStatus()}
            disabled={checking}
            className="h-11 w-full bg-[#8A4D25] text-white hover:bg-[#8A4D25]/90"
          >
            {checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Refresh Status
          </Button>
          
          <Button
            variant="outline"
            onClick={signOut}
            className="h-11 w-full border-[#241812]/20 text-[#241812] hover:bg-[#241812]/5"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
        
        <a
          href="/"
          className="mt-6 inline-flex items-center text-sm font-medium text-[#8A4D25] hover:underline"
        >
          <Store className="mr-2 h-4 w-4" />
          Return to Store
        </a>
      </div>
    </div>
  );
}
