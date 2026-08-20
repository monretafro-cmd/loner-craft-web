import { Link, useRouterState } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  Warehouse, 
  Image as ImageIcon, 
  Percent, 
  MessageSquare, 
  BarChart3, 
  Home, 
  Store, 
  Truck, 
  MessageCircle, 
  Bell, 
  ShieldCheck, 
  FileText, 
  Settings, 
  LogOut,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SidebarProps {
  profile: any;
  onMobileClose?: () => void;
}

export function Sidebar({ profile, onMobileClose }: SidebarProps) {
  const { pathname } = useRouterState({ select: (s) => ({ pathname: s.location.pathname }) });

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Inventory", href: "/admin/inventory", icon: Warehouse },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon },
    { name: "Discounts", href: "/admin/discounts", icon: Percent },
    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { type: "divider", label: "Site Management" },
    { name: "Homepage", href: "/admin/homepage", icon: Home },
    { name: "Shop Page", href: "/admin/shop-config", icon: Store },
    { name: "Delivery", href: "/admin/delivery", icon: Truck },
    { name: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { type: "divider", label: "System" },
    { name: "Admins & Access", href: "/admin/access", icon: ShieldCheck },
    { name: "Audit Log", href: "/admin/audit", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex flex-col w-64 h-full bg-[#241812] text-stone-200">
      <div className="flex items-center justify-between h-16 px-6 bg-[#1a120d]">
        <span className="text-xl font-serif font-bold text-white tracking-wider">LONER ADMIN</span>
        {onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden text-stone-400 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {navigation.map((item, idx) => {
          if (item.type === "divider") {
            return (
              <div key={idx} className="pt-4 pb-2 px-2">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  {item.label}
                </p>
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href as any}
              onClick={onMobileClose}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group",
                isActive 
                  ? "bg-[#8A4D25] text-white" 
                  : "text-stone-400 hover:bg-[#32241b] hover:text-white"
              )}
            >
              <Icon 
                className={cn(
                  "mr-3 h-5 w-5",
                  isActive ? "text-white" : "text-stone-500 group-hover:text-stone-300"
                )} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 bg-[#1a120d] border-t border-[#32241b]">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-stone-400 rounded-md hover:bg-red-900/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
