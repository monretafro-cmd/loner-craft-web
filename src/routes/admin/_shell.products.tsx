import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  Archive,
  Image as ImageIcon,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/_shell/products')({
  component: AdminProducts,
});

function AdminProducts() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(image_url, is_main)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Transform data to include the main image URL
      return data.map(product => ({
        ...product,
        main_image_url: product.product_images?.find((img: any) => img.is_main)?.image_url 
          || product.product_images?.[0]?.image_url 
          || null
      }));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error deleting product: ${error.message}`);
    }
  });

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-cormorant text-3xl font-bold text-[#241812]">Products</h1>
          <p className="text-[#241812]/60 text-sm">Manage your catalog, inventory and pricing.</p>
        </div>
        <button className="bg-[#8A4D25] text-[#F7F3EF] px-4 py-2 rounded-md hover:bg-[#241812] transition-colors text-sm font-medium flex items-center justify-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#241812]/30" />
          <input 
            type="text" 
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#8A4D25]/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A4D25]/20 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-[#8A4D25]/10 rounded-md text-sm text-[#241812]/60 hover:text-[#241812] transition-colors flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <select className="px-4 py-2 bg-white border border-[#8A4D25]/10 rounded-md text-sm text-[#241812]/60 focus:outline-none">
            <option>All Categories</option>
            <option>Wallets</option>
            <option>Belts</option>
            <option>Bags</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white border border-[#8A4D25]/10 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[#241812]/40 italic">Loading products...</div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F7F3EF]/50 border-b border-[#8A4D25]/10">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Product</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Inventory</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40">Price</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#241812]/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8A4D25]/5">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#F7F3EF]/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-[#F7F3EF] rounded border border-[#8A4D25]/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.main_image_url ? (
                            <img src={product.main_image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-[#241812]/10" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-[#241812]">{product.name}</div>
                          <div className="text-[10px] text-[#241812]/40 uppercase tracking-tight">{product.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                        product.status === 'active' 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-700"
                      )}>
                        {product.status || 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#241812]">
                        {product.stock > 0 ? (
                          <span>{product.stock} in stock</span>
                        ) : (
                          <span className="text-red-600 font-medium">Out of stock</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[#241812]">
                        {product.sale_price ? (
                          <div className="flex flex-col">
                            <span>{product.sale_price} MAD</span>
                            <span className="text-[10px] text-[#241812]/40 line-through">{product.price} MAD</span>
                          </div>
                        ) : (
                          <span>{product.price} MAD</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button className="p-2 text-[#241812]/40 hover:text-[#8A4D25] transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-[#241812]/40 hover:text-red-600 transition-colors"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this product?')) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="relative group">
                          <button className="p-2 text-[#241812]/40 hover:text-[#241812]">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-[#241812]/40 italic">
            No products found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
