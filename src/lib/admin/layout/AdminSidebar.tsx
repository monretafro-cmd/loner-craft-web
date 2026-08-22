import React, { useState } from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingCart, 
  Users, 
  Warehouse, 
  Image as ImageIcon, 
  Home, 
  ShoppingBag, 
  BarChart3, 
  Star, 
  MessageSquare, 
  Truck, 
  ShieldCheck, 
  History, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, icon: Icon, label, active, onClick }: NavItemProps) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group",
      active 
        ? "bg-[#8A4D25] text-[#F7F3EF]" 
        : "text-[#F7F3EF]/60 hover:text-[#F7F3EF] hover:bg-white/5"
    )}
  >
    <Icon className={cn("h-5 w-5 shrink-0", active ? "text-[#F7F3EF]" : "text-[#F7F3EF]/40 group-hover:text-[#F7F3EF]/70")} />
    <span className="font-medium">{label}</span>
    {active && <ChevronRight className="ml-auto h-4 w-4" />}
  </Link>
);

export const AdminSidebar = () => {
  const { pathname } = useRouterState({ select: (s) => ({ pathname: s.location.pathname }) });
  const { profile, signOut } = useAdminAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/categories', icon: Layers, label: 'Categories' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/admin/customers', icon: Users, label: 'Customers' },
    { to: '/admin/inventory', icon: Warehouse, label: 'Inventory' },
    { to: '/admin/media', icon: ImageIcon, label: 'Media Library' },
    { to: '/admin/homepage', icon: Home, label: 'Homepage' },
    { to: '/admin/shop-page', icon: ShoppingBag, label: 'Shop Page' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/reviews', icon: Star, label: 'Reviews' },
    { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/admin/delivery', icon: Truck, label: 'Delivery' },
    { to: '/admin/access', icon: ShieldCheck, label: 'Admins & Access' },
    { to: '/admin/audit', icon: History, label: 'Audit Log' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-[#241812] px-4 py-3 border-b border-[#8A4D25]/20 sticky top-0 z-50">
        <img src="/logo.png" alt="Loner Leather" className="h-8 w-auto" />
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-[#F7F3EF]">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#241812] border-r border-[#8A4D25]/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-8 border-b border-[#8A4D25]/10 hidden lg:block">
          <img src="/logo.png" alt="Loner Leather" className="h-12 w-auto mx-auto" />
          <div className="mt-4 text-center">
            <h2 className="font-cormorant text-xl font-bold text-[#F7F3EF] tracking-widest uppercase">Portal</h2>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-6 border-b border-[#8A4D25]/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#8A4D25] flex items-center justify-center text-[#F7F3EF] font-bold text-lg border border-white/10">
              {profile?.full_name?.charAt(0) || profile?.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[#F7F3EF] font-medium truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-[#F7F3EF]/40 text-xs truncate uppercase tracking-tighter">{profile?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-thin scrollbar-thumb-[#8A4D25]/20">
          {menuItems.map((item) => (
            <NavItem 
              key={item.to}
              {...item}
              active={pathname === item.to || (item.to !== '/admin' && pathname.startsWith(item.to))}
              onClick={() => setIsOpen(false)}
            />
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#8A4D25]/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-[#F7F3EF]/60 hover:text-red-400 hover:bg-red-500/10 gap-3"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>
    </>
  );
};
