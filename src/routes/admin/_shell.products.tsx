import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_shell/products')({
  component: AdminProducts,
});

function AdminProducts() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-cormorant text-3xl font-bold text-[#241812]">Products</h1>
        <button className="bg-[#8A4D25] text-[#F7F3EF] px-4 py-2 rounded-md hover:bg-[#8A4D25]/90 transition-colors">
          Add Product
        </button>
      </div>
      
      <div className="bg-white border border-[#8A4D25]/10 rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F7F3EF]/50 border-b border-[#8A4D25]/10">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Product</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Stock</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#8A4D25]/5 hover:bg-[#F7F3EF]/20">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded bg-[#241812]/5 mr-3 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium text-[#241812]">ALPHA WALLET</div>
                      <div className="text-xs text-[#241812]/40">Bifold Wallet</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#241812]">300 MAD</td>
                <td className="px-6 py-4 text-[#241812]">In Stock</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                </td>
                <td className="px-6 py-4 text-[#8A4D25] hover:underline cursor-pointer">Edit</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
