import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_shell/orders')({
  component: AdminOrders,
});

function AdminOrders() {
  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-cormorant text-3xl font-bold text-[#241812]">Orders</h1>
        <div className="flex gap-2">
          <button className="bg-white border border-[#8A4D25]/20 text-[#241812] px-4 py-2 rounded-md hover:bg-[#F7F3EF] transition-colors text-sm">
            Export CSV
          </button>
        </div>
      </div>
      
      {/* Order Status Filters */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-none">
        {['All', 'New', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
          <button 
            key={status}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-colors",
              status === 'All' 
                ? "bg-[#8A4D25] text-[#F7F3EF] border-[#8A4D25]" 
                : "bg-white text-[#241812]/60 border-[#8A4D25]/10 hover:border-[#8A4D25]/30"
            )}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#8A4D25]/10 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F7F3EF]/50 border-b border-[#8A4D25]/10">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Order</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Customer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Total</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#8A4D25]/5 hover:bg-[#F7F3EF]/20 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono text-sm font-bold text-[#241812]">#ORD-1001</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-[#241812]">John Doe</div>
                  <div className="text-xs text-[#241812]/40">+212 600-000000</div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-[#241812]">300 MAD</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-tighter rounded">New</span>
                </td>
                <td className="px-6 py-4 text-xs text-[#241812]/60">Aug 22, 2026</td>
                <td className="px-6 py-4">
                  <button className="text-[#8A4D25] text-sm hover:underline font-medium">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
