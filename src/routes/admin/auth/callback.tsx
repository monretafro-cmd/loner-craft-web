import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAdminAuth } from "@/lib/admin/auth-context";

export const Route = createFileRoute("/admin/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const { status, refreshSession } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Session is handled by onAuthStateChange in AdminAuthProvider
    // but we can trigger a refresh if needed
    if (status === 'approved') {
      navigate({ to: "/admin" });
    } else if (status === 'pending') {
      navigate({ to: "/admin/pending" });
    } else if (status === 'unauthenticated' || status === 'error') {
      // Small delay to allow session to settle
      const timer = setTimeout(() => {
        if (status === 'unauthenticated' || status === 'error') {
          navigate({ to: "/admin/login" });
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

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
