import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { loadAdminSession } from "@/lib/admin/session";
import { logAdminAccessEvent } from "@/lib/admin/access.functions";
export const Route = createFileRoute("/admin/_shell")({
    ssr: false,
    beforeLoad: async () => {
        // 8-second timeout for session resolution
        const sessionPromise = loadAdminSession();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Unable to verify your admin session.")), 8000));
        const session = await Promise.race([sessionPromise, timeoutPromise]);
        if (!session) {
            throw redirect({ to: "/admin/login" });
        }
        if (session.status === "pending") {
            // Record redirect to pending
            await logAdminAccessEvent({
                data: {
                    action: "admin_pending_redirect",
                    path: "/admin",
                    details: { userId: session.userId, email: session.email }
                }
            }).catch(() => { });
            throw redirect({ to: "/admin/pending" });
        }
        if (session.status !== "approved" || !session.role) {
            throw redirect({ to: "/admin/login" });
        }
        // Record successful access to admin shell
        await logAdminAccessEvent({
            data: {
                action: "admin_redirect",
                path: "/admin",
                details: { userId: session.userId, email: session.email, role: session.role }
            }
        }).catch(() => { });
        return { session };
    },
    component: () => (_jsx(AdminShell, { children: _jsx(Outlet, {}) })),
    errorComponent: ({ error, reset }) => (_jsx("div", { className: "flex min-h-[400px] flex-col items-center justify-center p-10 text-center", children: _jsxs("div", { className: "max-w-md", children: [
                _jsx("h2", { className: "text-xl font-semibold text-foreground", children: "Verification Failed" }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: error.message }), _jsxs("div", { className: "mt-6 flex justify-center gap-3", children: [
                        _jsx("button", { onClick: () => reset(), className: "inline-flex h-10 items-center justify-center rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90", children: "Retry" }), _jsx(Link, { to: "/admin/login", className: "inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent", children: "Sign In" }), _jsx(Link, { to: "/", className: "inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent", children: "Return to Store" })
                    ] })
            ] }) })),
});
