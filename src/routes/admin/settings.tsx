import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-serif text-[#241812] mb-6">Site Settings</h1>
      <p className="text-stone-600">Global site configuration will be restored here.</p>
    </div>
  );
}
