import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadAdminSession } from "@/lib/admin/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Sign In — Loner Leather" },
      { name: "description", content: "Secure sign in for the Loner Leather store administration panel." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Sign In — Loner Leather" },
      { property: "og:description", content: "Secure sign in for the Loner Leather store administration panel." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadAdminSession().then((session) => {
      if (session?.role) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin`, data: { full_name: fullName } },
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      const session = await loadAdminSession();
      if (!session) {
        setNotice("Account created. Confirm your email, then sign in.");
        setMode("signin");
        return;
      }
      if (!session.role) {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access.");
      }
      await supabase.from("profiles").update({ last_login_at: new Date().toISOString() }).eq("id", session.userId);
      navigate({ to: "/admin", replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-16 text-ink-foreground">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <img src="/favicon-brand.png" alt="Loner Leather" className="mx-auto h-14 w-14" />
          <h1 className="mt-4 font-display text-3xl">Loner Leather</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/50">Administration</p>
        </div>
        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur"
        >
          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white/80">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
                required
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
              minLength={8}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}
          <Button type="submit" disabled={busy} className="w-full bg-cognac text-white hover:bg-cognac/90">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create admin account"}
          </Button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-center text-xs text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            {mode === "signin" ? "First time? Create the owner account" : "Already have an account? Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-[11px] text-white/40">
          The first account created becomes the Super Admin.
        </p>
      </div>
    </div>
  );
}