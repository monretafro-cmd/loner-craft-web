import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/api";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Printer, 
  Download, 
  MessageCircle,
  Phone,
  Calendar,
  CreditCard,
  Truck
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
import { format } from "date-fns";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminApi.orders.list(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-full bg-stone-200 animate-pulse rounded"></div>
        <div className="h-[500px] w-full bg-stone-100 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { className: string }> = {
      new: { className: "bg-blue-100 text-blue-700 border-none" },
      pending_confirmation: { className: "bg-amber-100 text-amber-700 border-none" },
      confirmed: { className: "bg-green-100 text-green-700 border-none" },
      preparing: { className: "bg-indigo-100 text-indigo-700 border-none" },
      shipped: { className: "bg-purple-100 text-purple-700 border-none" },
      delivered: { className: "bg-emerald-100 text-emerald-700 border-none" },
      cancelled: { className: "bg-red-100 text-red-700 border-none" },
      returned: { className: "bg-stone-100 text-stone-700 border-none" },
    };

    return (
      <Badge variant="outline" className={statuses[status]?.className || "bg-stone-100 text-stone-600"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#241812]">Orders</h1>
          <p className="text-stone-500 text-sm mt-1">Process and track customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-stone-200 gap-2">
            <Printer size={18} />
            Print Daily List
          </Button>
          <Button variant="outline" className="border-stone-200 gap-2">
            <Download size={18} />
            Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-stone-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <Input 
              placeholder="Search by name, phone or order #..." 
              className="pl-10 border-stone-200 focus:ring-[#8A4D25]"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" className="gap-2 text-stone-600 border-stone-200">
              <Filter size={18} />
              Filter
            </Button>
            <div className="h-6 w-px bg-stone-200 mx-2 hidden md:block"></div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="bg-[#8A4D25] text-white cursor-pointer">All</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-stone-100">Pending</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-stone-100">Shipped</Badge>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50">
              <TableHead>Order Info</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(orders || []).map((order: any) => (
              <TableRow key={order.id} className="group">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-bold text-[#241812]">
                      #{order.order_number || order.id.slice(0, 8)}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-1">
                      <Calendar size={10} />
                      {format(new Date(order.created_at), "MMM d, yyyy HH:mm")}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#241812]">{order.customer_name}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <a href={`tel:${order.phone}`} className="text-[10px] text-stone-500 hover:text-[#8A4D25] flex items-center gap-1">
                        <Phone size={10} /> {order.phone}
                      </a>
                      <a href={`https://wa.me/${order.whatsapp?.replace(/\D/g, '')}`} target="_blank" className="text-[10px] text-green-600 hover:underline flex items-center gap-1">
                        <MessageCircle size={10} /> WhatsApp
                      </a>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(order.status)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-stone-600">
                    <CreditCard size={12} className="text-stone-400" />
                    {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-1">
                    <Truck size={10} /> {order.city}
                  </div>
                </TableCell>
                <TableCell className="font-bold text-[#241812]">
                  {order.total} MAD
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-[#8A4D25]">
                      Manage
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="cursor-pointer gap-2">
                          <Eye size={14} /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2">
                          <MessageCircle size={14} className="text-green-600" /> WhatsApp Update
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2">
                          <Printer size={14} /> Print Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!orders || orders.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-stone-400 space-y-2">
                    <ShoppingCart size={48} strokeWidth={1} />
                    <p>No orders found yet.</p>
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
