import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAdminAuth } from "@/lib/admin/session";
import { Sidebar } from "@/components/admin_new/layout/Sidebar";
import { TopBar } from "@/components/admin_new/layout/TopBar";
import { useState } from "react";

export const Route = createFileRoute("/admin/_shell")({
  beforeLoad: async () => {
    return await requireAdminAuth();
  },
  component: AdminShell,
});

function AdminShell() {
  const { profile } = Route.useRouteContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F3EF] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar profile={profile} />
      </div>

      {/* Mobile Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-stone-600 bg-opacity-75" aria-hidden="true" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#241812] transition duration-300 ease-in-out">
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
