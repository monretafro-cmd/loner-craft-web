import { Menu, Bell, User, ExternalLink } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminAuth } from "@/lib/admin/auth-context";
import { Link } from "@tanstack/react-router";

interface TopBarProps {
  onOpenSidebar: () => void;
  profile: any;
}

export function TopBar({ onOpenSidebar, profile }: TopBarProps) {
  const { signOut } = useAdminAuth();

  return (
    <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
      <button
        onClick={onOpenSidebar}
        className="lg:hidden p-2 rounded-md text-stone-500 hover:bg-stone-100"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1 lg:ml-0 px-4">
        <h2 className="text-sm font-medium text-stone-500 hidden sm:block">
          Welcome back, <span className="text-[#241812] font-semibold">{profile?.full_name || "Admin"}</span>
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <Link 
          to="/" 
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-[#8A4D25] transition-colors bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200"
        >
          View Store <ExternalLink size={12} />
        </Link>

        <button className="p-2 text-stone-400 hover:text-stone-600 relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#8A4D25] rounded-full border-2 border-white"></span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-9 w-9 border border-stone-200 cursor-pointer hover:ring-2 hover:ring-[#8A4D25]/20 transition-all">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-[#8A4D25] text-white">
                {profile?.full_name?.charAt(0) || <User size={18} />}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin" className="cursor-pointer">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
