import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { logAdminAccessEvent } from "@/lib/admin/access.functions";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Users,
  Boxes,
  Ticket,
  Star,
  MessageSquare,
  MessagesSquare,
  BarChart3,
  Home,
  Store,
  Images,
  Bell,
  Settings,
  ShieldCheck,
  ScrollText,
  LogOut,
  Menu,
  ExternalLink,
  X,
  ChevronRight,
  Search,
  BellRing
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/lib/admin/session";
import { useRows } from "@/lib/admin/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: any;
  exact?: boolean;
  superOnly?: boolean;
};

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/media", label: "Media Library", icon: Images },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/homepage", label: "Homepage", icon: Home },
  { to: "/admin/shop-page", label: "Shop Page", icon: Store },
  { to: "/admin/admins", label: "Admins & Access", icon: ShieldCheck, superOnly: true },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const sessionQuery = useAdminSession();
  const session = sessionQuery.data;
  const navigate = useNavigate();
  const logAccess = useServerFn(logAdminAccessEvent);
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: unreadCount } = useRows<{ id: string }>("notifications", {
    select: "id",
    eq: { read: false },
    limit: 10,
  });

  useEffect(() => setMobileMenuOpen(false), [pathname]);

  async function handleSignOut() {
    if (session) {
      await logAccess({ 
        data: { 
          action: "admin_sign_out", 
          path: pathname,
          details: { userId: session.userId, email: session.email }
        } 
      }).catch(() => {});
    }
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  const navItems = NAV.filter((item) => !item.superOnly || session?.role === "super_admin");

  return (
    <div className="flex min-h-screen bg-[#FDFCFB]">
      {/* Sidebar for Desktop */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-ink text-ink-foreground transition-transform duration-300 lg:static lg:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-20 items-center gap-3 border-b border-white/5 px-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <img src="/favicon-brand.png" alt="" className="h-6 w-6 brightness-0 invert" />
            </div>
            <div>
              <p className="font-display text-xl font-medium tracking-wide">Loner Leather</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Management</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-4 py-8">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to as any}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                      isActive 
                        ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10" 
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className={cn(
                      "h-4.5 w-4.5 transition-colors",
                      isActive ? "text-white" : "text-white/40 group-hover:text-white"
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-white/40" />}
                    {item.label === "Notifications" && unreadCount && unreadCount.length > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cognac text-[10px] font-bold text-white">
                        {unreadCount.length}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-white/5 p-4 space-y-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-all"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Visit Storefront</span>
            </a>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border/40 bg-white/80 px-6 backdrop-blur-md sm:px-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            {/* Desktop Search Bar */}
            <div className="hidden relative md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Search orders, products..."
                className="h-10 w-72 rounded-full bg-secondary/30 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ink/5 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Notification Bell */}
            <Link to="/admin/notifications" className="relative group p-2.5 rounded-full hover:bg-secondary/50 transition-all">
              <BellRing className="h-5 w-5 text-muted-foreground group-hover:text-ink" />
              {unreadCount && unreadCount.length > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-cognac" />
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-4 pl-4 border-l border-border/60">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-ink leading-tight">
                  {session?.fullName || session?.email?.split('@')[0]}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mt-0.5">
                  {session?.role === "super_admin" ? "Owner" : "Admin"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-ink font-display text-lg font-medium ring-2 ring-border/20 overflow-hidden">
                {session?.avatarUrl ? (
                  <img src={session.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  (session?.fullName ?? session?.email ?? "A").slice(0, 1).toUpperCase()
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth px-6 py-10 sm:px-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
