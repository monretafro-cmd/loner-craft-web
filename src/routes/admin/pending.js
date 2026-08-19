import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { syncAdminAccess, logAdminAccessEvent } from "@/lib/admin/access.functions";
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
    const [email, setEmail] = useState(null);
    const [name, setName] = useState(null);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState(null);
    const checkStatus = useCallback(async (isAuto = false) => {
        if (!isAuto)
            setChecking(true);
        setError(null);
        try {
            const access = await sync({ data: undefined });
            // Force a session refresh to pick up potential role changes
            await supabase.auth.refreshSession();
            if (access.status === "approved" && access.role) {
                // Use window.location for a hard reload to /admin to ensure shell layout re-runs beforeLoad
                // Record redirect to admin from pending
                await logAdminAccessEvent({
                    data: {
                        action: "admin_redirect",
                        path: "/admin/pending",
                        details: { userId: access.userId, email: access.email, role: access.role }
                    }
                }).catch(() => { });
                window.location.href = "/admin";
                return;
            }
            if (access.status === "blocked" || access.status === "rejected") {
                await logAdminAccessEvent({
                    data: {
                        action: "admin_sign_out",
                        path: "/admin/pending",
                        details: { status: access.status, reason: "blocked_or_rejected" }
                    }
                }).catch(() => { });
                await supabase.auth.signOut();
                return navigate({ to: "/admin/login", replace: true });
            }
            setEmail(access.email);
            // Try to get name from session
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.full_name) {
                setName(user.user_metadata.full_name);
            }
        }
        catch (err) {
            console.error("Status check failed:", err);
            if (!isAuto)
                setError("Unable to verify status. Please try again.");
        }
        finally {
            if (!isAuto)
                setChecking(false);
        }
    }, [navigate, sync]);
    useEffect(() => {
        checkStatus();
        // Auto check every 30 seconds
        const interval = setInterval(() => checkStatus(true), 30000);
        return () => clearInterval(interval);
    }, [checkStatus]);
    async function signOut() {
        // Try to get user ID for logging before signing out
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await logAdminAccessEvent({
                data: {
                    action: "admin_sign_out",
                    path: "/admin/pending",
                    details: { userId: user.id, email: user.email }
                }
            }).catch(() => { });
        }
        await supabase.auth.signOut();
        navigate({ to: "/admin/login", replace: true });
    }
    if (checking && !email) {
        return (_jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center bg-[#F7F3EF] p-4 text-[#241812]", children: [
                _jsx(Loader2, { className: "h-8 w-8 animate-spin text-[#8A4D25]" }), _jsx("p", { className: "mt-4 text-sm font-medium animate-pulse", children: "Verifying your account status..." })
            ] }));
    }
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-[#F7F3EF] px-4 py-12 text-[#1C1815]", children: _jsxs("div", { className: "w-full max-w-[480px] rounded-2xl border border-[#241812]/10 bg-white p-8 text-center shadow-xl sm:p-10", children: [
                _jsx("div", { className: "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#8A4D25]/10", children: _jsx(Clock, { className: "h-6 w-6 text-[#8A4D25]" }) }), _jsx("h1", { className: "mt-6 font-display text-3xl leading-tight text-[#241812]", children: "Access Request Pending" }), _jsxs("div", { className: "mt-6 space-y-4", children: [
                        _jsx("p", { className: "text-base leading-relaxed text-[#1C1815]/80", children: "Your account is waiting for approval from the Loner Leather owner." }), (name || email) && (_jsxs("div", { className: "rounded-xl bg-[#F7F3EF] p-4 text-left border border-[#241812]/5", children: [name && _jsx("p", { className: "text-sm font-semibold text-[#241812]", children: name }), email && _jsx("p", { className: "text-xs text-[#1C1815]/60 mt-0.5", children: email })] }))] }), error && (_jsx("p", { className: "mt-4 text-sm text-red-600 font-medium", children: error })), _jsxs("div", { className: "mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
                        _jsxs(Button, { onClick: () => checkStatus(), disabled: checking, className: "h-11 w-full bg-[#8A4D25] text-white hover:bg-[#8A4D25]/90", children: [checking ? _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : _jsx(RefreshCcw, { className: "mr-2 h-4 w-4" }), "Refresh Status"] }), _jsxs(Button, { variant: "outline", onClick: signOut, className: "h-11 w-full border-[#241812]/20 text-[#241812] hover:bg-[#241812]/5", children: [
                                _jsx(LogOut, { className: "mr-2 h-4 w-4" }),
                                "Sign Out"] })
                    ] }), _jsxs("a", { href: "/", className: "mt-6 inline-flex items-center text-sm font-medium text-[#8A4D25] hover:underline", children: [
                        _jsx(Store, { className: "mr-2 h-4 w-4" }),
                        "Return to Store"] })
            ] }) }));
}
