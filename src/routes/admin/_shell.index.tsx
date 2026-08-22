import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAdminAuth } from '@/lib/admin/auth-context';

export const Route = createFileRoute('/admin/_shell/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { profile } = useAdminAuth();

  return (
    <div className="p-8">
      <h1 className="font-cormorant text-3xl font-bold text-[#241812]">
        Welcome, {profile?.full_name || 'Admin'}
      </h1>
      <p className="mt-2 text-[#241812]/60">
        Loner Leather Administration Dashboard
      </p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Placeholder cards */}
        {[
          { label: 'Revenue Today', value: '0 MAD' },
          { label: 'Orders Today', value: '0' },
          { label: 'Active Products', value: '...' },
          { label: 'Total Customers', value: '...' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-[#8A4D25]/10 p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-[#241812]/40 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-[#241812] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white border border-[#8A4D25]/10 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#8A4D25]/10">
          <h2 className="font-cormorant text-xl font-bold text-[#241812]">Recent Orders</h2>
        </div>
        <div className="p-12 text-center text-[#241812]/40">
          No orders found yet.
        </div>
      </div>
    </div>
  );
}
