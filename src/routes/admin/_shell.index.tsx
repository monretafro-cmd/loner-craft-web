import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Package,
  MapPin
} from 'lucide-react';

export const Route = createFileRoute('/admin/_shell/')({
  component: AdminDashboard,
});

function StatCard({ title, value, icon: Icon, trend, description }: any) {
  return (
    <div className="bg-white p-6 rounded-lg border border-[#8A4D25]/10 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#241812]/60 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-[#241812]">{value}</h3>
          {description && <p className="text-xs text-[#241812]/40 mt-1">{description}</p>}
        </div>
        <div className="p-3 bg-[#F7F3EF] rounded-lg">
          <Icon className="w-5 h-5 text-[#8A4D25]" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs text-green-600">
          <TrendingUp className="w-3 h-3 mr-1" />
          <span>{trend} vs last month</span>
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // In a real app, we would fetch these from Supabase
      // For now, we simulate or fetch basic counts
      const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { count: customersCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
      
      return {
        revenue: '0 MAD',
        ordersToday: ordersCount || 0,
        customers: customersCount || 0,
        products: productsCount || 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        lowStock: 0
      };
    }
  });

  if (isLoading) {
    return <div className="p-8 animate-pulse text-[#8A4D25]">Loading dashboard stats...</div>;
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="font-cormorant text-3xl font-bold text-[#241812]">Dashboard</h1>
        <p className="text-[#241812]/60">Welcome back to Loner Leather administration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Revenue This Month" value={stats?.revenue} icon={TrendingUp} trend="+12%" />
        <StatCard title="Orders Today" value={stats?.ordersToday} icon={ShoppingBag} description="New orders awaiting confirmation" />
        <StatCard title="Total Customers" value={stats?.customers} icon={Users} />
        <StatCard title="Total Products" value={stats?.products} icon={Package} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#8A4D25]/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#8A4D25]/10 flex items-center justify-between">
            <h3 className="font-bold text-[#241812]">Recent Orders</h3>
            <button className="text-sm text-[#8A4D25] hover:underline">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F7F3EF]/50 border-b border-[#8A4D25]/10">
                  <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#241812]/40 tracking-wider">Order</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#241812]/40 tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#241812]/40 tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#241812]/40 tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8A4D25]/5">
                {/* Simulated recent orders */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-[#241812]">#ORD-1001</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-[#241812]/60">John Doe</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-100 text-blue-700">New</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-[#241812] text-right">300 MAD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-8">
          <div className="bg-[#241812] p-6 rounded-lg text-[#F7F3EF]">
            <h3 className="font-bold mb-4 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-[#8A4D25]" />
              Inventory Alerts
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded bg-white/5 border border-white/10 text-xs">
                <p className="font-medium">Alpha Wallet - Dark Brown</p>
                <p className="text-white/40 mt-1">Stock: 2 left</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#8A4D25]/10 shadow-sm">
            <h3 className="font-bold text-[#241812] mb-4">Orders by City</h3>
            <div className="space-y-4">
              {[
                { city: 'Casablanca', count: 45, percentage: 65 },
                { city: 'Rabat', count: 12, percentage: 18 },
                { city: 'Marrakech', count: 8, percentage: 12 },
              ].map((item) => (
                <div key={item.city}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#241812]">{item.city}</span>
                    <span className="text-[#241812]/40">{item.count} orders</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F7F3EF] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#8A4D25]" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
