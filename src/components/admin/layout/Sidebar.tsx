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
import { useAdminAuth } from "@/lib/admin/auth-context";
import { cn } from "@/lib/utils";

interface SidebarProps {
  profile: any;
  onMobileClose?: () => void;
}

export function Sidebar({ profile, onMobileClose }: SidebarProps) {
  const { pathname } = useRouterState({ select: (s) => ({ pathname: s.location.pathname }) });
  const { signOut } = useAdminAuth();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Inventory", href: "/admin/inventory", icon: Warehouse },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { type: "divider", label: "Site Management" },
    { name: "Delivery", href: "/admin/delivery", icon: Truck },
    { name: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
    { type: "divider", label: "System" },
    { name: "Admins & Access", href: "/admin/access", icon: ShieldCheck },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col w-64 h-full bg-[#241812] text-stone-200">
      <div className="flex items-center justify-between h-16 px-6 bg-[#1a120d]">
        <span className="text-xl font-serif font-bold text-white tracking-wider uppercase">Loner Admin</span>
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
                  ? "bg-[#8A4D25] text-white shadow-lg" 
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
        <div className="flex items-center gap-3 px-3 py-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#8A4D25] flex items-center justify-center text-white text-xs font-bold">
            {profile?.full_name?.charAt(0) || "A"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{profile?.full_name || "Admin"}</p>
            <p className="text-xs text-stone-500 truncate">{profile?.role || "Manager"}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-stone-400 rounded-md hover:bg-red-900/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
