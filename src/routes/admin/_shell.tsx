import { Outlet } from "@tanstack/react-router";

export default function AdminShell() {
  return (
    <div className="flex min-h-screen bg-[#F7F3EF]">
      <aside className="w-64 bg-[#241812] text-white p-4">
        <h1 className="text-xl font-bold mb-8">Loner Admin</h1>
        <nav className="space-y-2">
          <a href="/admin" className="block p-2 rounded hover:bg-[#8A4D25]">Dashboard</a>
          <a href="/admin/products" className="block p-2 rounded hover:bg-[#8A4D25]">Products</a>
          <a href="/admin/orders" className="block p-2 rounded hover:bg-[#8A4D25]">Orders</a>
          <a href="/admin/settings" className="block p-2 rounded hover:bg-[#8A4D25]">Settings</a>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
