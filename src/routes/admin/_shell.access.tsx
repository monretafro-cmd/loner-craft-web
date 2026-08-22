import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/api";
import { useAdminAuth } from "@/lib/admin/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShieldCheck, 
  UserPlus, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ShieldAlert,
  Shield,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_shell/access")({
  component: AccessPage,
});

function AccessPage() {
  const { profile: currentAdmin } = useAdminAuth();
  const queryClient = useQueryClient();
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin", "access"],
    queryFn: () => adminApi.access.listProfiles(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.access.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "access"] });
      toast.success("User access updated");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update access");
    }
  });

  const handleStatusChange = (id: string, status: string, userEmail: string) => {
    if (userEmail === "valaverde05@gmail.com") {
      toast.error("The owner account cannot be modified");
      return;
    }
    updateStatusMutation.mutate({ id, status });
  };

  const isSuperAdmin = currentAdmin?.role === 'super_admin' || currentAdmin?.is_owner;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#241812]">Admins & Access</h1>
          <p className="text-stone-500 text-sm mt-1">Manage administrative roles and permissions</p>
        </div>
        {isSuperAdmin && (
          <Button className="bg-[#8A4D25] hover:bg-[#241812] text-white">
            <UserPlus size={18} className="mr-2" />
            Invite Admin
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-none shadow-sm bg-[#241812] text-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-[#8A4D25]/20 rounded-xl">
              <ShieldCheck className="text-[#8A4D25]" size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Super Admins</p>
              <h3 className="text-2xl font-bold">{profiles?.filter((p: any) => p.user_roles?.some((r: any) => r.role === 'super_admin')).length || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-stone-100 rounded-xl">
              <Shield className="text-stone-600" size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Admins</p>
              <h3 className="text-2xl font-bold text-[#241812]">{profiles?.filter((p: any) => p.status === 'approved').length || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <Clock className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Pending Requests</p>
              <h3 className="text-2xl font-bold text-[#241812]">{profiles?.filter((p: any) => p.status === 'pending').length || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-xs uppercase font-semibold">
                  <th className="px-6 py-4">Administrator</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4 h-16 bg-stone-50/50"></td>
                    </tr>
                  ))
                ) : profiles?.map((profile: any) => (
                  <tr key={profile.id} className="hover:bg-stone-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${profile.is_owner ? 'bg-[#8A4D25]' : 'bg-stone-300'}`}>
                          {profile.full_name?.charAt(0) || profile.email?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#241812] flex items-center gap-1.5">
                            {profile.email}
                            {profile.is_owner && (
                              <Badge className="bg-[#8A4D25]/10 text-[#8A4D25] hover:bg-[#8A4D25]/10 border-none text-[10px] py-0">Owner</Badge>
                            )}
                          </div>
                          <div className="text-xs text-stone-500">{profile.full_name || "No name set"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={
                        profile.status === 'approved' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' 
                          : profile.status === 'blocked'
                          ? 'bg-red-100 text-red-700 hover:bg-red-100 border-none'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-none'
                      }>
                        {profile.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {profile.user_roles?.[0]?.role || "None"}
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-500">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!profile.is_owner && isSuperAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-stone-100">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {profile.status === 'pending' && (
                              <DropdownMenuItem 
                                className="cursor-pointer gap-2 text-green-600"
                                onClick={() => handleStatusChange(profile.id, 'approved', profile.email)}
                              >
                                <CheckCircle size={14} /> Approve Access
                              </DropdownMenuItem>
                            )}
                            {profile.status === 'approved' && (
                              <DropdownMenuItem 
                                className="cursor-pointer gap-2 text-red-600"
                                onClick={() => handleStatusChange(profile.id, 'blocked', profile.email)}
                              >
                                <ShieldAlert size={14} /> Block Admin
                              </DropdownMenuItem>
                            )}
                            {profile.status === 'blocked' && (
                              <DropdownMenuItem 
                                className="cursor-pointer gap-2 text-green-600"
                                onClick={() => handleStatusChange(profile.id, 'approved', profile.email)}
                              >
                                <CheckCircle size={14} /> Restore Access
                              </DropdownMenuItem>
                            )}
                            {profile.status === 'pending' && (
                              <DropdownMenuItem 
                                className="cursor-pointer gap-2 text-stone-600"
                                onClick={() => handleStatusChange(profile.id, 'blocked', profile.email)}
                              >
                                <XCircle size={14} /> Reject Request
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {!isSuperAdmin && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            Only Super Admins can manage administrative access and roles.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
