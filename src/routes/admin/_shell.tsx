import React, { useEffect } from 'react';
import { createFileRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { Loader2 } from 'lucide-react';
import { AdminSidebar } from '@/lib/admin/layout/AdminSidebar';

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
    <div className="min-h-screen bg-[#F7F3EF] font-inter flex flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="hidden lg:flex h-16 bg-white border-b border-[#8A4D25]/10 items-center justify-between px-8 shrink-0">
          <div className="text-sm text-[#241812]/40">
            Loner Leather Administration / <span className="text-[#241812] font-medium uppercase tracking-wider">{pathname.split('/').pop() || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-[#241812] leading-none">Market: Morocco</p>
              <p className="text-[10px] text-[#8A4D25] uppercase tracking-widest font-bold mt-1">Live Store</p>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto bg-[#F9F7F5]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
