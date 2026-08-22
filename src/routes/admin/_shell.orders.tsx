import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Search, Filter, Download, ExternalLink } from 'lucide-react';

export const Route = createFileRoute('/admin/_shell/orders')({
  component: AdminOrders,
});

function AdminOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers(name, phone, whatsapp)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-cormorant text-3xl font-bold text-[#241812]">Orders</h1>
          <p className="text-[#241812]/60 text-sm">Manage customer orders and fulfillment.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-[#8A4D25]/20 text-[#241812] px-4 py-2 rounded-md hover:bg-[#F7F3EF] transition-colors text-sm font-medium flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#241812]/30" />
          <input 
            type="text" 
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#8A4D25]/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A4D25]/20 text-sm"
          />
        </div>
        <div className="flex overflow-x-auto gap-2 scrollbar-none">
          {['All', 'New', 'Pending', 'Confirmed', 'Shipped', 'Delivered'].map((status) => (
            <button 
              key={status}
              className={cn(
                "px-4 py-2 rounded-md text-xs font-medium whitespace-nowrap border transition-colors",
                status === 'All' 
                  ? "bg-[#8A4D25] text-[#F7F3EF] border-[#8A4D25]" 
                  : "bg-white text-[#241812]/60 border-[#8A4D25]/10 hover:border-[#8A4D25]/30"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#8A4D25]/10 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[#241812]/40 italic">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F7F3EF]/50 border-b border-[#8A4D25]/10">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Order</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40 text-right">Total</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8A4D25]/5">
                {orders?.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F7F3EF]/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold text-[#241812]">#{order.order_number || order.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[#241812]">{order.customers?.name || 'Guest Customer'}</div>
                      <div className="text-[10px] text-[#241812]/40">{order.customers?.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#241812] text-right">
                      {order.total_amount} MAD
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                        getStatusColor(order.status)
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#241812]/60">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#8A4D25] hover:text-[#241812] transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!orders || orders.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#241812]/40 italic">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
