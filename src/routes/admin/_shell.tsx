import React, { useEffect } from 'react';
import { createFileRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/admin/_shell')({
  component: AdminShell,
});

function AdminShell() {
  const { status, loading } = useAdminAuth();
  const navigate = useNavigate();
  const { pathname } = useRouterState({ select: (s) => ({ pathname: s.location.pathname }) });

  useEffect(() => {
    if (!loading) {
      if (status === 'unauthenticated') {
        navigate({ to: '/admin/login', replace: true });
      } else if (status === 'pending' && pathname !== '/admin/pending') {
        navigate({ to: '/admin/pending', replace: true });
      } else if ((status === 'blocked' || status === 'rejected') && pathname !== '/admin/login') {
        navigate({ to: '/admin/login', replace: true });
      }
    }
  }, [status, loading, navigate, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#241812] text-[#F7F3EF]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#8A4D25]" />
          <p className="mt-4 font-cormorant text-xl tracking-widest uppercase">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on login page, we'll be redirected by useEffect
  // but we return null to avoid flashing content
  if (status !== 'authenticated' && pathname !== '/admin/pending' && pathname !== '/admin/login') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F7F3EF] font-inter">
      <Outlet />
    </div>
  );
}
