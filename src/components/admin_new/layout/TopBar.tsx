import { Menu, Bell, User } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface TopBarProps {
  onOpenSidebar: () => void;
  profile: any;
}

export function TopBar({ onOpenSidebar, profile }: TopBarProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

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
        <button className="p-2 text-stone-400 hover:text-stone-600 relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#8A4D25] rounded-full border-2 border-white"></span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-9 w-9 border border-stone-200 cursor-pointer">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-[#8A4D25] text-white">
                {profile?.full_name?.charAt(0) || <User size={18} />}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Profile Settings</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">System Health</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
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
