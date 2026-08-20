import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/api";
import { 
  Search, 
  UserPlus, 
  Shield, 
  ShieldAlert, 
  MoreVertical, 
  CheckCircle2, 
  Ban, 
  UserMinus,
  Mail,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_shell/access")({
  component: AccessPage,
});

function AccessPage() {
  const queryClient = useQueryClient();
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: () => adminApi.access.listProfiles(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      adminApi.access.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "profiles"] });
      toast.success("User status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user status");
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-full bg-stone-200 animate-pulse rounded"></div>
        <div className="h-[500px] w-full bg-stone-100 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  const pendingUsers = profiles?.filter(p => p.status === 'pending') || [];
  const approvedUsers = profiles?.filter(p => p.status === 'approved') || [];
  const blockedUsers = profiles?.filter(p => p.status === 'blocked') || [];

  const UserTable = ({ users }: { users: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow className="bg-stone-50 hover:bg-stone-50">
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user: any) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-stone-200">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-stone-200 text-stone-600">
                    {user.full_name?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#241812]">
                    {user.full_name || "New User"}
                    {user.is_owner && (
                      <Badge className="ml-2 bg-[#8A4D25] hover:bg-[#8A4D25] text-[9px] h-4">OWNER</Badge>
                    )}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-stone-400">
                    <Mail size={10} />
                    {user.email}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {user.user_roles?.map((r: any) => (
                <Badge key={r.role} variant="outline" className="capitalize bg-stone-50 border-stone-200 text-stone-600">
                  {r.role.replace('_', ' ')}
                </Badge>
              )) || <span className="text-xs text-stone-400 italic">No role</span>}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-xs text-stone-500">
                <Calendar size={12} />
                {format(new Date(user.created_at), "MMM d, yyyy")}
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                className={
                  user.status === 'approved' ? 'bg-green-100 text-green-700 border-none' :
                  user.status === 'blocked' ? 'bg-red-100 text-red-700 border-none' :
                  'bg-amber-100 text-amber-700 border-none'
                }
              >
                {user.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {user.is_owner ? (
                <Button variant="ghost" disabled size="sm">
                  <Shield size={16} className="text-stone-300" />
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {user.status !== 'approved' && (
                      <DropdownMenuItem 
                        onClick={() => updateStatusMutation.mutate({ id: user.id, status: 'approved' })}
                        className="cursor-pointer gap-2 text-green-600"
                      >
                        <CheckCircle2 size={14} /> Approve Access
                      </DropdownMenuItem>
                    )}
                    {user.status !== 'blocked' && (
                      <DropdownMenuItem 
                        onClick={() => updateStatusMutation.mutate({ id: user.id, status: 'blocked' })}
                        className="cursor-pointer gap-2 text-red-600"
                      >
                        <Ban size={14} /> Block User
                      </DropdownMenuItem>
                    )}
                    {user.status === 'blocked' && (
                      <DropdownMenuItem 
                        onClick={() => updateStatusMutation.mutate({ id: user.id, status: 'approved' })}
                        className="cursor-pointer gap-2"
                      >
                        <CheckCircle2 size={14} /> Unblock
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="cursor-pointer gap-2">
                      <ShieldAlert size={14} /> Change Role
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-600">
                      <UserMinus size={14} /> Remove Access
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TableCell>
          </TableRow>
        ))}
        {users.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="h-32 text-center text-stone-400 italic">
              No users in this list
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#241812]">Admins & Access</h1>
          <p className="text-stone-500 text-sm mt-1">Manage team members and permissions</p>
        </div>
        <Button className="bg-[#8A4D25] hover:bg-[#241812] text-white gap-2">
          <UserPlus size={18} />
          Invite Admin
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-100 bg-stone-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-10 border-stone-200"
            />
          </div>
        </div>

        <Tabs defaultValue="approved" className="w-full">
          <div className="px-4 border-b border-stone-100">
            <TabsList className="bg-transparent border-none gap-6 h-12">
              <TabsTrigger 
                value="pending" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8A4D25] data-[state=active]:bg-transparent px-0 text-stone-500 data-[state=active]:text-[#8A4D25]"
              >
                Pending 
                {pendingUsers.length > 0 && (
                  <Badge className="ml-2 bg-amber-500 hover:bg-amber-500 h-5 w-5 p-0 flex items-center justify-center">
                    {pendingUsers.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="approved" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8A4D25] data-[state=active]:bg-transparent px-0 text-stone-500 data-[state=active]:text-[#8A4D25]"
              >
                Approved
              </TabsTrigger>
              <TabsTrigger 
                value="blocked" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8A4D25] data-[state=active]:bg-transparent px-0 text-stone-500 data-[state=active]:text-[#8A4D25]"
              >
                Blocked
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pending" className="m-0">
            <UserTable users={pendingUsers} />
          </TabsContent>
          <TabsContent value="approved" className="m-0">
            <UserTable users={approvedUsers} />
          </TabsContent>
          <TabsContent value="blocked" className="m-0">
            <UserTable users={blockedUsers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
