import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_shell/access')({
  component: AdminAccess,
});

function AdminAccess() {
  return (
    <div className="p-8">
      <h1 className="font-cormorant text-3xl font-bold text-[#241812] mb-8">Admins & Access</h1>
      
      <div className="bg-white border border-[#8A4D25]/10 rounded-lg shadow-sm">
        <div className="p-6 border-b border-[#8A4D25]/10">
          <h2 className="font-medium text-[#241812]">Approved Admins</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F7F3EF]/50 border-b border-[#8A4D25]/10">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#8A4D25]/5">
                <td className="px-6 py-4">
                  <div className="font-medium text-[#241812]">valaverde05@gmail.com</div>
                  <div className="text-xs text-[#241812]/40 text-leather-brown font-semibold">Owner</div>
                </td>
                <td className="px-6 py-4 text-[#241812]">super_admin</td>
                <td className="px-6 py-4 text-[#241812]">approved</td>
                <td className="px-6 py-4 text-[#241812]/20 italic">Protected</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
