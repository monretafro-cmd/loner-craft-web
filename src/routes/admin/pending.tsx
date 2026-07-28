import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { syncAdminAccess } from "@/lib/admin/access.functions";
import { Button } from "@/components/ui/button";
import { Loader2, Clock } from "lucide-react";

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
});

function PendingPage() {
  const navigate = useNavigate();
  const sync = useServerFn(syncAdminAccess);
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    sync({ data: undefined as never })
      .then(async (access) => {
        if (!active) return;
        await supabase.auth.refreshSession();
        if (access.status === "blocked" || access.status === "rejected") {
          await supabase.auth.signOut();
          return navigate({ to: "/admin/login", replace: true });
        }
        if (access.status === "approved" && access.role) {
          return navigate({ to: "/admin", replace: true });
        }
        setEmail(access.email);
        setChecking(false);
      })
      .catch(() => navigate({ to: "/admin/login", replace: true }));
    return () => {
      active = false;
    };
  }, [navigate, sync]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-white">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-12 text-ink-foreground">
      <div className="w-full max-w-[480px] rounded-2xl border border-white/10 bg-white/[0.04] p-7 text-center backdrop-blur sm:p-9">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5">
          <Clock className="h-5 w-5 text-cognac" />
        </div>
        <h1 className="mt-6 font-display text-3xl leading-tight">Access request pending</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/65">
          Your account was created successfully. Access to the Loner Leather administration panel
          requires approval from the owner.
        </p>
        {email ? <p className="mt-4 text-xs text-white/40">{email}</p> : null}
        <Button
          onClick={signOut}
          className="mt-8 h-11 w-full bg-cognac text-white hover:bg-cognac/90"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
