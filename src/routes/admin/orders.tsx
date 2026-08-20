import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  return (
    <div>
      <h1 className="text-3xl font-serif text-[#241812] mb-6">Orders</h1>
      <p className="text-stone-600">Order tracking and management will be restored here.</p>
    </div>
  );
}
