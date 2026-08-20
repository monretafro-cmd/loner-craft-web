import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/api";
import { 
  Warehouse, 
  Search, 
  Filter, 
  Package, 
  ArrowRightLeft,
  AlertCircle,
  TrendingDown,
  ChevronDown
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/admin/_shell/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin", "products", "inventory"],
    queryFn: () => adminApi.products.list(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-full bg-stone-200 animate-pulse rounded"></div>
        <div className="h-[500px] w-full bg-stone-100 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#241812]">Inventory</h1>
          <p className="text-stone-500 text-sm mt-1">Track stock levels and replenishment</p>
        </div>
        <Button className="bg-[#8A4D25] hover:bg-[#241812] text-white gap-2">
          <ArrowRightLeft size={18} />
          Stock Adjustment
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Stock Value</p>
            <h3 className="text-2xl font-bold text-[#241812] mt-1">
              {(products?.reduce((acc, p) => acc + (p.stock * p.price), 0) || 0).toLocaleString()} MAD
            </h3>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <Warehouse size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Low Stock Items</p>
            <h3 className="text-2xl font-bold text-[#241812] mt-1">
              {products?.filter(p => p.stock < 5).length || 0}
            </h3>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
            <AlertCircle size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Out of Stock</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">
              {products?.filter(p => p.stock === 0).length || 0}
            </h3>
          </div>
          <div className="bg-red-50 p-3 rounded-xl text-red-600">
            <TrendingDown size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <Input 
              placeholder="Search by SKU or name..." 
              className="pl-10 border-stone-200 bg-white"
            />
          </div>
          <Button variant="outline" className="gap-2 border-stone-200">
            <Filter size={18} />
            Filter Status
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50">
              <TableHead>Product & SKU</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(products || []).map((product: any) => {
              const stockPercent = Math.min((product.stock / 20) * 100, 100);
              const isLow = product.stock < 5;
              const isOut = product.stock === 0;

              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#241812]">{product.name}</span>
                      <span className="text-[10px] text-stone-400 font-mono">{product.sku || 'SKU-0000'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-stone-700'}`}>
                      {product.stock} units
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        isOut ? 'bg-red-100 text-red-700 border-none' :
                        isLow ? 'bg-amber-100 text-amber-700 border-none' :
                        'bg-green-100 text-green-700 border-none'
                      }
                    >
                      {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[200px]">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-stone-400">
                        <span>{product.stock} / 20</span>
                        <span>{Math.round(stockPercent)}%</span>
                      </div>
                      <Progress 
                        value={stockPercent} 
                        className="h-1.5 bg-stone-100" 
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-[#8A4D25] hover:bg-stone-100">
                      Restock <ChevronDown size={14} className="ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
