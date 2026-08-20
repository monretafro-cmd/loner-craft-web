import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Password — Loner Leather" },
      { name: "description", content: "Choose a new password for your Loner Leather account." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Reset Password — Loner Leather" },
      { property: "og:description", content: "Choose a new password for your Loner Leather account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) return setError(updateError.message);
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-12 text-ink-foreground">
      <form
        onSubmit={submit}
        className="w-full max-w-[420px] space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur"
      >
        <h1 className="font-display text-2xl">Set a new password</h1>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/80">New password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 border-white/15 bg-white/5 text-white"
            minLength={8}
            required
          />
        </div>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <Button type="submit" disabled={busy} className="h-11 w-full bg-cognac text-white hover:bg-cognac/90">
          Update password
        </Button>
      </form>
    </div>
  );
}
