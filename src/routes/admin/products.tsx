import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/products")({
  component: AdminProductsPage,
});

function AdminProductsPage() {
  return (
    <div>
      <h1 className="text-3xl font-serif text-[#241812] mb-6">Inventory</h1>
      <p className="text-stone-600">Product management functionality will be restored here.</p>
    </div>
  );
}
