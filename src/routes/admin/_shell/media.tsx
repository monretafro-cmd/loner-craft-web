import { createFileRoute } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
import { Upload, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRows, useInvalidate, uploadFile, useDeleteRow } from "@/lib/admin/api";
import { useAdminSession } from "@/lib/admin/session";
import { PageHeader, Panel, EmptyState, shortDate } from "@/components/admin_new/AdminUI";

export const Route = createFileRoute("/admin/_shell/media")({
  head: () => ({ meta: [{ title: "Media Library — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: MediaPage,
});

function MediaPage() {
  const { data: session } = useAdminSession();
  const media = useRows<any>("media", { orderBy: "created_at" });
  const invalidate = useInvalidate();
  const remove = useDeleteRow("media", "media");
  const [uploading, setUploading] = useState(false);
  const [folder, setFolder] = useState("other");

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      for (const file of files) {
        const { url } = await uploadFile("media", file, folder);
        await supabase.from("media").insert({
          url,
          name: file.name,
          folder,
          mime_type: file.type,
          size_bytes: file.size,
          uploaded_by: user.user?.id ?? null,
        });
      }
      invalidate();
      toast.success("Uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <>
      <PageHeader
        title="Media Library"
        subtitle="All product photos, banners and brand assets"
        actions={
          <>
            <select
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {["products", "banners", "brand", "other"].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            <label className="inline-flex h-10 cursor-pointer items-center rounded-md bg-ink px-4 text-sm text-ink-foreground hover:bg-ink/90">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload
              <input type="file" accept="image/*,video/*" multiple hidden onChange={onUpload} />
            </label>
          </>
        }
      />
      {(media.data ?? []).length === 0 ? (
        <EmptyState title="Nothing uploaded yet" hint="Upload photos here and reuse them across products and the homepage." />
      ) : (
        <Panel>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {(media.data ?? []).map((asset: any) => (
              <div key={asset.id} className="overflow-hidden rounded-xl border border-border/60 bg-secondary/10 transition-all hover:border-cognac/40 hover:shadow-md group">
                <div className="relative aspect-square">
                  <img src={asset.url} alt={asset.alt_text ?? asset.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  <div className="absolute top-1 right-1 rounded bg-ink/60 px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-widest">{asset.folder}</div>
                </div>
                <div className="space-y-1 p-3 text-[10px] bg-white">
                  <p className="truncate font-bold text-ink">{asset.name}</p>
                  <p className="text-muted-foreground font-medium">{shortDate(asset.created_at)}</p>

                  <div className="flex justify-between pt-2 border-t border-border/40 mt-2">
                    <button
                      className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-muted-foreground hover:text-cognac transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(asset.url);
                        toast.success("Link copied");
                      }}
                    >
                      <Copy className="h-2.5 w-2.5" /> Copy
                    </button>
                    {session?.role === "super_admin" ? (
                      <button className="text-rose-600 font-bold uppercase tracking-wider hover:underline" onClick={() => confirm("Delete this asset permanently?") && remove.mutate(asset.id)}>Delete</button>
                    ) : null}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </>
  );
}