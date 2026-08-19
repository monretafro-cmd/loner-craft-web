import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin_new/AdminShell";
import { loadAdminSession } from "@/lib/admin/session";
import { logAdminAccessEvent } from "@/lib/admin/access.functions";

export const Route = createFileRoute("/admin/_shell")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const sessionPromise = loadAdminSession();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Verification timed out")), 8000)
    );

    try {
      const session = await Promise.race([sessionPromise, timeoutPromise]) as Awaited<ReturnType<typeof loadAdminSession>>;

      if (!session) {
        throw redirect({ to: "/admin/login", search: { redirect: location.href } });
      }
      
      if (session.status === "pending") {
        throw redirect({ to: "/admin/pending" });
      }
      
      if (session.status !== "approved" || !session.role) {
        throw redirect({ to: "/admin/login" });
      }

      return { session };
    } catch (error: any) {
      if (error?.status === 307 || error?.status === 302) throw error;
      
      // If unauthorized/invalid token, force redirect to login
      if (error?.message?.includes("Unauthorized") || error?.message?.includes("Invalid token")) {
        throw redirect({ to: "/admin/login" });
      }
      
      throw new Error(error?.message || "Unable to verify your admin session.");
    }
  },
  component: () => (
    <AdminShell>
      <Outlet />
    </AdminShell>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-10 text-center">
      <div className="max-w-md">
        <h2 className="text-xl font-semibold text-foreground">Verification Failed</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => {
              const { clearAdminSession } = require("@/lib/admin/session");
              clearAdminSession();
              reset();
            }}
            className="inline-flex h-10 items-center justify-center rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90"
          >
            Retry
          </button>
          <Link
            to="/admin/login"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Sign In
          </Link>
          <Link
            to="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Return to Store
          </Link>
        </div>
      </div>
    </div>
  ),
});