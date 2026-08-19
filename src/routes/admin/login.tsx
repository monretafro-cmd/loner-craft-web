import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { syncAdminAccess, logFailedLogin, logAdminAccessEvent } from "@/lib/admin/access.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/admin/GoogleIcon";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Sign In — Loner Leather" },
      {
        name: "description",
        content: "Secure sign in for the Loner Leather store administration panel.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Sign In — Loner Leather" },
      {
        property: "og:description",
        content: "Secure sign in for the Loner Leather store administration panel.",
      },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const sync = useServerFn(syncAdminAccess);
  const logFailure = useServerFn(logFailedLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "email" | "google" | "reset">(null);
  const [checking, setChecking] = useState(true);

  async function routeByAccess() {
    const { clearAdminSession, loadAdminSession } = await import("@/lib/admin/session");
    clearAdminSession();
    
    // Attempt to sync access on the server
    const access = await sync({ data: undefined as never });
    if (access.status === "blocked" || access.status === "rejected") {
      await supabase.auth.signOut();
      throw new Error(access.status === "blocked" ? "Account blocked." : "Access rejected.");
    }
    
    // Force a fresh session load to verify current status
    const session = await loadAdminSession(true);
    
    if (session?.status === "approved" && session?.role) {
      navigate({ to: "/admin", replace: true });
    } else {
      navigate({ to: "/admin/pending", replace: true });
    }
  }

  useEffect(() => {
    let active = true;
    
    // Check for an existing session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      if (!session) return setChecking(false);
      
      try {
        await routeByAccess();
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Session error");
          setChecking(false);
        }
      }
    });

    // Listen for auth changes to handle successful OAuth redirects
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;
      if (event === 'SIGNED_IN' && session) {
        setChecking(true);
        try {
          await routeByAccess();
        } catch (caught) {
          if (active) {
            setError(caught instanceof Error ? caught.message : "Sign in failed");
            setChecking(false);
          }
        }
      }
    });

    return () => { 
      active = false; 
      subscription.unsubscribe();
    };
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy("email");
    setError(null);
    setNotice(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        await logFailure({ data: { email, provider: "email", reason: signInError.message } }).catch(
          () => {},
        );
        throw signInError;
      }
      await routeByAccess();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed");
    } finally {
      setBusy(null);
    }
  }

  async function signInWithGoogle() {
    setBusy("google");
    setError(null);
    setNotice(null);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/admin/login`,
      });
      if (result.error) throw result.error;
      if ((result as { redirected?: boolean }).redirected) return;
      await routeByAccess();
    } catch (caught) {
      await logFailure({
        data: {
          email,
          provider: "google",
          reason: caught instanceof Error ? caught.message : "unknown",
        },
      }).catch(() => {});
      setError(caught instanceof Error ? caught.message : "Google sign in failed");
    } finally {
      setBusy(null);
    }
  }

  async function forgotPassword() {
    if (!email) return setError("Enter your email first, then select Forgot password.");
    setBusy("reset");
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(null);
    if (resetError) return setError(resetError.message);
    setNotice("Password reset link sent. Check your inbox.");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-white">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-12 text-ink-foreground sm:py-16">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <img src="/favicon-brand.png" alt="Loner Leather" className="mx-auto h-14 w-14" />
          <h1 className="mt-4 font-display text-3xl">Loner Leather</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/50">Administration</p>
        </div>
        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-7"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 border-white/15 bg-white/5 text-white placeholder:text-white/40"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 border-white/15 bg-white/5 text-white placeholder:text-white/40"
              minLength={8}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}
          <Button
            type="submit"
            disabled={busy !== null}
            className="h-11 w-full bg-cognac text-white hover:bg-cognac/90"
          >
            {busy === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-white/15" />
            <span className="text-[11px] uppercase tracking-[0.28em] text-white/45">or</span>
            <span className="h-px flex-1 bg-white/15" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={busy !== null}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-white/20 bg-white text-sm font-medium text-[#1f1f1f] transition hover:bg-white/90 disabled:opacity-60"
          >
            {busy === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <GoogleIcon className="h-5 w-5" />
                Continue with Google
              </>
            )}
          </button>

          <button
            type="button"
            onClick={forgotPassword}
            disabled={busy !== null}
            className="block w-full py-2 text-center text-xs text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            Forgot password
          </button>
        </form>
        <p className="mt-6 text-center text-[11px] text-white/40">
          Admin access is invitation-only.
        </p>
      </div>
    </div>
  );
}
