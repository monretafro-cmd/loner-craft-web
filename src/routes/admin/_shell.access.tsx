import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  UserCheck, 
  UserX, 
  Shield, 
  ShieldCheck, 
  MoreVertical,
  Mail,
  Calendar,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/_shell/access')({
  component: AdminAccess,
});

function AdminAccess() {
  const queryClient = useQueryClient();
  
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from('admin_profiles')
        .update({ status } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      toast.success('Admin status updated');
    },
    onError: (error) => {
      toast.error(`Error updating status: ${error.message}`);
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string, role: string }) => {
      const { error } = await supabase
        .from('admin_profiles')
        .update({ role } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      toast.success('Admin role updated');
    },
    onError: (error) => {
      toast.error(`Error updating role: ${error.message}`);
    }
  });

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-cormorant text-3xl font-bold text-[#241812]">Admins & Access</h1>
          <p className="text-[#241812]/60 text-sm">Manage administrative personnel and permissions.</p>
        </div>
        <button className="bg-[#8A4D25] text-[#F7F3EF] px-4 py-2 rounded-md hover:bg-[#241812] transition-colors text-sm font-medium flex items-center justify-center">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Admin
        </button>
      </div>

      <div className="bg-white border border-[#8A4D25]/10 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[#241812]/40 italic">Loading admins...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F7F3EF]/50 border-b border-[#8A4D25]/10">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Admin</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8A4D25]/5">
                {profiles?.map((profile) => (
                  <tr key={profile.id} className="hover:bg-[#F7F3EF]/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#8A4D25]/10 flex items-center justify-center text-[#8A4D25] font-bold">
                          {profile.full_name?.[0] || profile.email[0].toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-[#241812]">
                            {profile.full_name || 'Unnamed Admin'}
                            {profile.is_owner && (
                              <span className="ml-2 text-[10px] bg-[#8A4D25] text-[#F7F3EF] px-1.5 py-0.5 rounded uppercase tracking-tighter">Owner</span>
                            )}
                          </div>
                          <div className="text-xs text-[#241812]/40 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {profile.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-[#241812]">
                        {profile.role === 'super_admin' ? (
                          <ShieldCheck className="w-4 h-4 mr-2 text-[#8A4D25]" />
                        ) : (
                          <Shield className="w-4 h-4 mr-2 text-[#241812]/40" />
                        )}
                        <span className="capitalize">{profile.role.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                        profile.status === 'approved' ? "bg-green-100 text-green-700" :
                        profile.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {profile.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-[#241812]/60 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(profile.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!profile.is_owner && (
                        <div className="flex justify-end items-center gap-2">
                          {profile.status === 'pending' && (
                            <button 
                              onClick={() => updateStatusMutation.mutate({ id: profile.id, status: 'approved' })}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                              title="Approve"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          {profile.status !== 'blocked' && (
                            <button 
                              onClick={() => updateStatusMutation.mutate({ id: profile.id, status: 'blocked' })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Block"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          <div className="relative group">
                            <button className="p-2 text-[#241812]/40 hover:text-[#241812]">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
