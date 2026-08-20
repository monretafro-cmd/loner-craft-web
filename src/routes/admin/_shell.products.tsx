import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/api";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ExternalLink,
  Package,
  Eye,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => adminApi.products.list(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 bg-stone-200 animate-pulse rounded"></div>
          <div className="h-10 w-32 bg-stone-200 animate-pulse rounded"></div>
        </div>
        <div className="h-[500px] w-full bg-stone-100 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#241812]">Products</h1>
          <p className="text-stone-500 text-sm mt-1">Manage your storefront inventory</p>
        </div>
        <Button className="bg-[#8A4D25] hover:bg-[#241812] text-white gap-2">
          <Plus size={18} />
          Add Product
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-stone-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <Input 
              placeholder="Search products..." 
              className="pl-10 border-stone-200 focus:ring-[#8A4D25]"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" className="gap-2 text-stone-600 border-stone-200">
              <Filter size={18} />
              Filter
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50">
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(products || []).map((product: any) => (
              <TableRow key={product.id} className="group">
                <TableCell>
                  <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden border border-stone-200">
                    {product.images?.[0]?.url ? (
                      <img 
                        src={product.images[0].url} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <Package size={20} />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-[#241812]">{product.name}</div>
                    <div className="text-xs text-stone-500">{product.category?.name || 'Uncategorized'}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={product.status === 'active' ? 'default' : 'secondary'}
                    className={product.status === 'active' ? 'bg-green-100 text-green-700 border-none' : 'bg-stone-100 text-stone-600 border-none'}
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {product.sale_price ? (
                    <div className="flex flex-col">
                      <span className="text-[#8A4D25]">{product.sale_price} MAD</span>
                      <span className="text-[10px] text-stone-400 line-through">{product.price} MAD</span>
                    </div>
                  ) : (
                    <span>{product.price} MAD</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${product.stock < 5 ? 'text-red-600 font-bold' : 'text-stone-700'}`}>
                      {product.stock}
                    </span>
                    {product.stock < 5 && <AlertTriangle size={14} className="text-red-500" />}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <Edit size={14} /> Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <Eye size={14} /> Preview Store
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <ExternalLink size={14} /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 cursor-pointer gap-2 focus:bg-red-50 focus:text-red-600">
                        <Trash2 size={14} /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {(!products || products.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-stone-400 space-y-2">
                    <Package size={48} strokeWidth={1} />
                    <p>No products found. Start by adding one!</p>
                    <Button variant="outline" className="mt-4 border-stone-200">
                      Add First Product
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
