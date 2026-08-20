import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/api";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Mail, 
  Phone,
  ShoppingBag,
  MapPin
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
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/_shell/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
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
          <h1 className="text-3xl font-serif text-[#241812]">Customers</h1>
          <p className="text-stone-500 text-sm mt-1">Manage your relationship with Loner customers</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <Input 
              placeholder="Search by name, email or city..." 
              className="pl-10 border-stone-200 bg-white"
            />
          </div>
          <Button variant="outline" className="gap-2 border-stone-200">
            <Filter size={18} />
            Filter
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50">
              <TableHead>Customer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(customers || []).map((customer: any) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#241812]">{customer.name}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <a href={`mailto:${customer.email}`} className="text-[10px] text-stone-400 hover:text-[#8A4D25] flex items-center gap-1">
                        <Mail size={10} /> {customer.email}
                      </a>
                      <a href={`tel:${customer.phone}`} className="text-[10px] text-stone-400 hover:text-[#8A4D25] flex items-center gap-1">
                        <Phone size={10} /> {customer.phone}
                      </a>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-stone-600">
                    <MapPin size={12} className="text-stone-400" />
                    {customer.city}, Morocco
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-stone-600">
                    <ShoppingBag size={14} className="text-stone-400" />
                    {customer.orders_count || 0}
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-[#241812]">
                  {(customer.total_spent || 0).toLocaleString()} MAD
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
                        <Eye size={14} /> View History
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <Mail size={14} /> Send Email
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {(!customers || customers.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-stone-400 space-y-2">
                    <Users size={48} strokeWidth={1} />
                    <p>No customers found yet.</p>
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
