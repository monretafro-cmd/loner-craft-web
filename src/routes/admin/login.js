import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);
    const [busy, setBusy] = useState(null);
    const [checking, setChecking] = useState(true);
    async function routeByAccess() {
        const access = await sync({ data: undefined });
        await supabase.auth.refreshSession();
        if (access.status === "blocked" || access.status === "rejected") {
            await supabase.auth.signOut();
            throw new Error(access.status === "blocked"
                ? "This account has been blocked."
                : "This access request was rejected.");
        }
        if (access.status === "approved" && access.role) {
            await logAdminAccessEvent({
                data: {
                    action: "admin_redirect",
                    path: "/admin/login",
                    details: { userId: access.userId, email: access.email, role: access.role }
                }
            }).catch(() => { });
            navigate({ to: "/admin", replace: true });
        }
        else {
            await logAdminAccessEvent({
                data: {
                    action: "admin_pending_redirect",
                    path: "/admin/login",
                    details: { userId: access.userId, email: access.email }
                }
            }).catch(() => { });
            navigate({ to: "/admin/pending", replace: true });
        }
    }
    useEffect(() => {
        let active = true;
        supabase.auth.getUser().then(async ({ data }) => {
            if (!active)
                return;
            if (!data.user)
                return setChecking(false);
            try {
                await routeByAccess();
            }
            catch (caught) {
                setError(caught instanceof Error ? caught.message : "Sign in failed");
                setChecking(false);
            }
        });
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    async function submit(event) {
        event.preventDefault();
        setBusy("email");
        setError(null);
        setNotice(null);
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) {
                await logFailure({ data: { email, provider: "email", reason: signInError.message } }).catch(() => { });
                throw signInError;
            }
            await routeByAccess();
        }
        catch (caught) {
            setError(caught instanceof Error ? caught.message : "Sign in failed");
        }
        finally {
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
            if (result.error)
                throw result.error;
            if (result.redirected)
                return;
            await routeByAccess();
        }
        catch (caught) {
            await logFailure({
                data: {
                    email,
                    provider: "google",
                    reason: caught instanceof Error ? caught.message : "unknown",
                },
            }).catch(() => { });
            setError(caught instanceof Error ? caught.message : "Google sign in failed");
        }
        finally {
            setBusy(null);
        }
    }
    async function forgotPassword() {
        if (!email)
            return setError("Enter your email first, then select Forgot password.");
        setBusy("reset");
        setError(null);
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        setBusy(null);
        if (resetError)
            return setError(resetError.message);
        setNotice("Password reset link sent. Check your inbox.");
    }
    if (checking) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-ink text-white", children: _jsx(Loader2, { className: "h-5 w-5 animate-spin" }) }));
    }
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-ink px-4 py-12 text-ink-foreground sm:py-16", children: _jsxs("div", { className: "w-full max-w-[420px]", children: [
                _jsxs("div", { className: "mb-8 text-center", children: [
                        _jsx("img", { src: "/favicon-brand.png", alt: "Loner Leather", className: "mx-auto h-14 w-14" }), _jsx("h1", { className: "mt-4 font-display text-3xl", children: "Loner Leather" }), _jsx("p", { className: "mt-1 text-xs uppercase tracking-[0.28em] text-white/50", children: "Administration" })
                    ] }), _jsxs("form", { onSubmit: submit, className: "space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-7", children: [
                        _jsxs("div", { className: "space-y-2", children: [
                                _jsx(Label, { htmlFor: "email", className: "text-white/80", children: "Email" }), _jsx(Input, { id: "email", type: "email", autoComplete: "email", value: email, onChange: (event) => setEmail(event.target.value), className: "h-11 border-white/15 bg-white/5 text-white placeholder:text-white/40", required: true })
                            ] }), _jsxs("div", { className: "space-y-2", children: [
                                _jsx(Label, { htmlFor: "password", className: "text-white/80", children: "Password" }), _jsx(Input, { id: "password", type: "password", autoComplete: "current-password", value: password, onChange: (event) => setPassword(event.target.value), className: "h-11 border-white/15 bg-white/5 text-white placeholder:text-white/40", minLength: 8, required: true })
                            ] }), error ? _jsx("p", { className: "text-sm text-red-300", children: error }) : null, notice ? _jsx("p", { className: "text-sm text-emerald-300", children: notice }) : null, _jsx(Button, { type: "submit", disabled: busy !== null, className: "h-11 w-full bg-cognac text-white hover:bg-cognac/90", children: busy === "email" ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : "Sign in" }), _jsxs("div", { className: "flex items-center gap-3 py-1", children: [
                                _jsx("span", { className: "h-px flex-1 bg-white/15" }), _jsx("span", { className: "text-[11px] uppercase tracking-[0.28em] text-white/45", children: "or" }), _jsx("span", { className: "h-px flex-1 bg-white/15" })
                            ] }), _jsx("button", { type: "button", onClick: signInWithGoogle, disabled: busy !== null, className: "flex h-12 w-full items-center justify-center gap-3 rounded-md border border-white/20 bg-white text-sm font-medium text-[#1f1f1f] transition hover:bg-white/90 disabled:opacity-60", children: busy === "google" ? (_jsx(Loader2, { className: "h-4 w-4 animate-spin" })) : (_jsxs(_Fragment, { children: [
                                    _jsx(GoogleIcon, { className: "h-5 w-5" }),
                                    "Continue with Google"] })) }), _jsx("button", { type: "button", onClick: forgotPassword, disabled: busy !== null, className: "block w-full py-2 text-center text-xs text-white/60 underline-offset-4 hover:text-white hover:underline", children: "Forgot password" })
                    ] }), _jsx("p", { className: "mt-6 text-center text-[11px] text-white/40", children: "Admin access is invitation-only." })
            ] }) }));
}
