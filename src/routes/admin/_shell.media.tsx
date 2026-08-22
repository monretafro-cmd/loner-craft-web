import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_shell/media")({
  component: MediaPage,
});

function MediaPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-serif text-[#241812]">Media Library</h1>
        <p className="text-stone-500 text-sm mt-1">Manage product images and brand assets</p>
      </div>
      <div className="bg-white p-12 rounded-lg border border-stone-200 text-center">
        <p className="text-stone-400 italic">Media library module coming soon.</p>
      </div>
    </div>
  );
}
