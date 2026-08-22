import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_shell/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-serif text-[#241812]">Orders</h1>
        <p className="text-stone-500 text-sm mt-1">Manage Cash on Delivery orders and fulfillment</p>
      </div>
      <div className="bg-white p-12 rounded-lg border border-stone-200 text-center">
        <p className="text-stone-400 italic">Order management module coming soon.</p>
      </div>
    </div>
  );
}
