import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
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
  icon: typeof LayoutDashboard;
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
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/whatsapp", label: "WhatsApp", icon: MessagesSquare },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/homepage", label: "Homepage", icon: Home },
  { to: "/admin/shop-page", label: "Shop Page", icon: Store },
  { to: "/admin/media", label: "Media Library", icon: Images },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/admins", label: "Admins and Access", icon: ShieldCheck, superOnly: true },
  { to: "/admin/audit", label: "Audit Log", icon: ScrollText, superOnly: true },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { data: session } = useAdminSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const { data: unread } = useRows<{ id: string }>("notifications", {
    select: "id",
    eq: { read: false },
    limit: 50,
  });

  useEffect(() => setOpen(false), [pathname]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  const items = NAV.filter((item) => !item.superOnly || session?.role === "super_admin");

  return (
    <div className="min-h-screen bg-secondary/30">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-ink text-ink-foreground transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6">
          <img src="/favicon-brand.png" alt="" className="h-8 w-8" />
          <div className="leading-tight">
            <p className="font-display text-lg">Loner Leather</p>
            <p className="text-[11px] uppercase tracking-[0.22em] opacity-60">Admin</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as never}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.label === "Notifications" && unread?.length ? (
                  <span className="ml-auto rounded-full bg-cognac px-2 py-0.5 text-[10px] text-white">
                    {unread.length}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/8 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" /> View store
          </a>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/8 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {open ? (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      ) : null}

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center gap-4 border-b border-border/60 bg-background/85 px-4 backdrop-blur lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/admin/notifications" className="relative rounded-full p-2 hover:bg-secondary">
              <Bell className="h-4 w-4" />
              {unread?.length ? (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-cognac" />
              ) : null}
            </Link>
            <div className="text-right leading-tight">
              <p className="text-sm font-medium text-foreground">{session?.fullName ?? session?.email}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {session?.role === "super_admin" ? "Super Admin" : "Admin"}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm text-ink-foreground">
              {(session?.fullName ?? session?.email ?? "A").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}