import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminApi.orders.list(),
  });

  if (isLoading) return <div>Loading orders...</div>;

  return (
    <div>
      <h1 className="text-3xl font-serif text-[#241812] mb-6">Orders</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                <TableCell>
                  <div className="font-medium">{order.customer_name}</div>
                  <div className="text-xs text-stone-500">{order.customer_email}</div>
                </TableCell>
                <TableCell className="text-sm">
                  {order.created_at ? format(new Date(order.created_at), "MMM d, yyyy") : "-"}
                </TableCell>
                <TableCell>{order.total_amount} MAD</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {order.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {!orders?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-stone-500">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
