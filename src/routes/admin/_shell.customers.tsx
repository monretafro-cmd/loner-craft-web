import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_shell/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-serif text-[#241812]">Customers</h1>
        <p className="text-stone-500 text-sm mt-1">View customer profiles and order history</p>
      </div>
      <div className="bg-white p-12 rounded-lg border border-stone-200 text-center">
        <p className="text-stone-400 italic">Customer management module coming soon.</p>
      </div>
    </div>
  );
}
