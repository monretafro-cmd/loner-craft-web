import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_shell/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-serif text-[#241812]">Inventory</h1>
        <p className="text-stone-500 text-sm mt-1">Track stock levels and stock alerts</p>
      </div>
      <div className="bg-white p-12 rounded-lg border border-stone-200 text-center">
        <p className="text-stone-400 italic">Inventory tracking module coming soon.</p>
      </div>
    </div>
  );
}
