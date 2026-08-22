import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin/auth-context";
import { ReactNode } from "react";
import { Sidebar } from "@/components/admin/layout/Sidebar";
import { TopBar } from "@/components/admin/layout/TopBar";
import { useState } from "react";

export const Route = createFileRoute("/admin/_shell")({
  beforeLoad: async ({ location }) => {
    // Basic structural check - real session check happens in the provider + layout
    return {};
  },
  component: AdminShellGuard,
});

function AdminShellGuard() {
  const { status, isLoading, profile } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#241812]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#8A4D25] border-t-transparent mx-auto"></div>
          <p className="font-serif text-white tracking-widest uppercase animate-pulse">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || status === 'error') {
    throw redirect({ to: "/admin/login" });
  }

  if (status === 'pending') {
    throw redirect({ to: "/admin/pending" });
  }

  if (status === 'blocked') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#241812] p-4 text-center">
        <div className="bg-[#F7F3EF] p-8 rounded-lg max-w-md">
          <h1 className="text-2xl font-serif text-red-600 mb-4">Access Blocked</h1>
          <p className="text-stone-600">Your administrative access has been revoked. Please contact the owner.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F7F3EF] overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar profile={profile} />
      </div>

      {/* Sidebar - Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#241812] h-full transition-transform">
            <Sidebar profile={profile} onMobileClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <TopBar onOpenSidebar={() => setIsSidebarOpen(true)} profile={profile} />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
