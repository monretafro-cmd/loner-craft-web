import { createFileRoute } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
import { Upload, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRows, useInvalidate, uploadFile, useDeleteRow } from "@/lib/admin/api";
import { useAdminSession } from "@/lib/admin/session";
import { PageHeader, Panel, EmptyState, shortDate } from "@/components/admin/AdminUI";

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
              <div key={asset.id} className="overflow-hidden rounded-xl border border-border">
                <img src={asset.url} alt={asset.alt_text ?? asset.name} className="h-32 w-full object-cover" loading="lazy" />
                <div className="space-y-1 p-2 text-xs">
                  <p className="truncate font-medium">{asset.name}</p>
                  <p className="text-muted-foreground">{asset.folder} · {shortDate(asset.created_at)}</p>
                  <div className="flex justify-between pt-1">
                    <button
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        navigator.clipboard.writeText(asset.url);
                        toast.success("Link copied");
                      }}
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                    {session?.role === "super_admin" ? (
                      <button className="text-destructive" onClick={() => remove.mutate(asset.id)}>Delete</button>
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