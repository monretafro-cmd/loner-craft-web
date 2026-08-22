import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Archive, 
  Copy,
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_shell/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => adminApi.products.list(),
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await adminApi.products.delete(id);
        toast.success("Product deleted successfully");
        refetch();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete product");
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#241812]">Products</h1>
          <p className="text-stone-500 text-sm mt-1">Manage your store catalog and inventory</p>
        </div>
        <Button className="bg-[#8A4D25] hover:bg-[#241812] text-white">
          <Plus size={18} className="mr-2" />
          Create Product
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-stone-100 p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <Input 
                placeholder="Search products..." 
                className="pl-10 border-stone-200 focus:ring-[#8A4D25]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="text-stone-600 border-stone-200">Filter</Button>
              <Button variant="outline" className="text-stone-600 border-stone-200">Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-xs uppercase font-semibold">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4 h-16 bg-stone-50/50"></td>
                    </tr>
                  ))
                ) : products?.map((product: any) => (
                  <tr key={product.id} className="hover:bg-stone-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-stone-100 flex-shrink-0 overflow-hidden border border-stone-200">
                          {product.images?.[0] ? (
                            <img 
                              src={product.images[0].url} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-full h-full p-2 text-stone-300" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#241812]">{product.name}</div>
                          <div className="text-xs text-stone-500">{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-stone-50 text-stone-600 border-stone-200 font-normal">
                        {product.category?.name || "Uncategorized"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {product.price} MAD
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${product.stock < 5 ? 'text-red-600 font-bold' : 'text-stone-600'}`}>
                          {product.stock}
                        </span>
                        {product.stock < 5 && (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none text-[10px] px-1.5 py-0">Low</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={
                        product.status === 'published' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' 
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-100 border-none'
                      }>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-stone-100">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="cursor-pointer gap-2">
                            <Edit size={14} /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer gap-2">
                            <Copy size={14} /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 focus:text-red-600" onClick={() => handleDelete(product.id)}>
                            <Trash2 size={14} /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {!isLoading && products?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-stone-400 italic">
                      No products found. Start by creating one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-white border-t border-stone-100 p-4 flex items-center justify-between">
            <p className="text-xs text-stone-500">
              Showing <span className="font-medium text-stone-700">{products?.length || 0}</span> products
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 border-stone-200" disabled>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-stone-200" disabled>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
