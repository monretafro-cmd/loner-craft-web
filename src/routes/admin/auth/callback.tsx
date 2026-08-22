import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const { status, profile, error: authError, refreshSession } = useAdminAuth();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange code for session if present (PKCE)
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        
        // The AdminAuthProvider handles the state update via onAuthStateChange
      } catch (err: any) {
        console.error("Callback error:", err);
        setLocalError(err.message || "Authentication failed during code exchange");
      }
    };

    handleCallback();
  }, []);

  useEffect(() => {
    if (status === 'approved') {
      navigate({ to: "/admin" });
    } else if (status === 'pending') {
      navigate({ to: "/admin/pending" });
    } else if (status === 'error' || localError) {
      // Stay on this page to show the error card
    }
  }, [status, navigate, localError]);

  const displayError = localError || authError;

  if (displayError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#241812] p-4">
        <Card className="w-full max-w-md bg-[#F7F3EF] border-none shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-serif text-[#241812]">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-stone-600">{displayError}</p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => {
                  setLocalError(null);
                  refreshSession();
                }}
                className="w-full bg-[#8A4D25] hover:bg-[#241812] text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Login
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate({ to: "/admin/login" })}
                className="w-full border-stone-300"
              >
                Return to Admin Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
