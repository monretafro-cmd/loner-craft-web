import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, GripVertical, Loader2, Play, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  useRows,
  useSaveRow,
  useInvalidate,
  uploadFile,
  removeStorageFile,
  logAudit,
} from "@/lib/admin/api";
import { PageHeader, Panel } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/_shell/products/$id")({
  head: () => ({ meta: [{ title: "Edit product — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: ProductEditor,
});

type Form = Record<string, any>;

const MEDIA_LABELS = [
  "Main",
  "Front",
  "Back",
  "Inside",
  "Packaging",
  "Stitching",
  "Leather",
  "Logo",
  "Capacity",
  "Lifestyle",
  "Video",
];

type ImageRow = {
  id: string;
  url: string;
  storage_path: string | null;
  label: string | null;
  is_main: boolean;
  display_order: number;
  media_type: string | null;
};

const EMPTY: Form = {
  name: "",
  subtitle: "",
  slug: "",
  sku: "",
  short_description: "",
  description: "",
  price: 0,
  sale_price: null,
  stock: 0,
  low_stock_threshold: 3,
  category_id: null,
  status: "draft",
  featured: false,
  cod_available: true,
  whatsapp_ordering: true,
  material: "",
  leather_type: "",
  color: "",
  dimensions: "",
  weight: null,
  made_in: "Taroudant, Morocco",
  delivery_time: "2-4 days across Morocco",
  seo_title: "",
  seo_description: "",
  features: [],
  tags: [],
};

function ProductEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const save = useSaveRow("products", "products");
  const categories = useRows<{ id: string; name: string }>("categories", { select: "id, name", orderBy: "display_order", ascending: true });
  const images = useRows<ImageRow>("product_images", {
    select: "id, url, storage_path, label, is_main, display_order, media_type",
    eq: { product_id: isNew ? "" : id },
    orderBy: "display_order",
    ascending: true,
    enabled: !isNew,
  });
  const [form, setForm] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const dragFrom = useRef<number | null>(null);
  const rows = images.data ?? [];

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setForm(data as Form);
        setLoading(false);
      });
  }, [id, isNew]);

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const payload: Form = {
      ...form,
      slug: (form.slug || form.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      price: Number(form.price) || 0,
      sale_price: form.sale_price === "" || form.sale_price === null ? null : Number(form.sale_price),
      stock: Number(form.stock) || 0,
      low_stock_threshold: Number(form.low_stock_threshold) || 0,
      weight: form.weight === "" || form.weight === null ? null : Number(form.weight),
      features: Array.isArray(form.features) ? form.features : String(form.features ?? "").split("\n").filter(Boolean),
      tags: Array.isArray(form.tags) ? form.tags : String(form.tags ?? "").split(",").map((t: string) => t.trim()).filter(Boolean),
    };
    delete payload.created_at;
    delete payload.updated_at;
    const saved = await save.mutateAsync(payload);
    if (isNew && saved) navigate({ to: "/admin/products/$id", params: { id: (saved as any).id } });
  }

  async function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length || isNew) return;
    setUploading(true);
    try {
      const start = rows.length;
      for (const [index, file] of files.entries()) {
        const { url, path } = await uploadFile("product-images", file, `products/${id}`);
        const { error } = await supabase.from("product_images").insert({
          product_id: id,
          url,
          storage_path: path,
          alt_text: form.name,
          media_type: file.type.startsWith("video/") ? "video" : "image",
          display_order: start + index,
          is_main: start + index === 0,
        });
        if (error) throw error;
        await supabase.from("media").insert({ url, name: file.name, folder: "products", mime_type: file.type, size_bytes: file.size });
      }
      await logAudit({ action: "upload_images", page: "products", recordType: "products", recordId: id });
      await invalidate();
      toast.success(`${files.length} image${files.length > 1 ? "s" : ""} saved`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function removeImage(image: ImageRow) {
    setBusy(true);
    try {
      const { error } = await supabase.from("product_images").delete().eq("id", image.id);
      if (error) throw error;
      await removeStorageFile("product-images", image.storage_path);
      const remaining = rows.filter((row) => row.id !== image.id);
      // Re-sequence and guarantee exactly one main image.
      await Promise.all(
        remaining.map((row, index) =>
          supabase
            .from("product_images")
            .update({ display_order: index, is_main: image.is_main ? index === 0 : row.is_main })
            .eq("id", row.id),
        ),
      );
      await logAudit({ action: "delete_image", page: "products", recordType: "product_images", recordId: image.id });
      await invalidate();
      toast.success("Image deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function makeMain(imageId: string) {
    setBusy(true);
    try {
      await supabase.from("product_images").update({ is_main: false }).eq("product_id", id);
      const { error } = await supabase.from("product_images").update({ is_main: true }).eq("id", imageId);
      if (error) throw error;
      await invalidate();
      toast.success("Main image updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function setLabel(imageId: string, label: string) {
    await supabase.from("product_images").update({ label: label || null }).eq("id", imageId);
    await invalidate();
  }

  async function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setBusy(true);
    try {
      await Promise.all(
        next.map((row, index) =>
          supabase.from("product_images").update({ display_order: index }).eq("id", row.id),
        ),
      );
      await logAudit({ action: "reorder_images", page: "products", recordType: "products", recordId: id });
      await invalidate();
      toast.success("Gallery order saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reorder failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading product…</p>;

  return (
    <form onSubmit={submit}>
      <PageHeader
        title={isNew ? "New product" : form.name || "Product"}
        subtitle={isNew ? "Add a piece to the catalogue" : "Edit product details, media and stock"}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/admin/products"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
            </Button>
            <Button type="submit" disabled={save.isPending} className="bg-ink text-ink-foreground hover:bg-ink/90">
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save product"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel className="space-y-4">
            <h2 className="font-display text-xl">Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name"><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} required /></Field>
              <Field label="Subtitle"><Input value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} /></Field>
              <Field label="Slug"><Input value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} placeholder="auto from name" /></Field>
              <Field label="SKU"><Input value={form.sku ?? ""} onChange={(e) => set("sku", e.target.value)} /></Field>
            </div>
            <Field label="Short description">
              <Textarea rows={2} value={form.short_description ?? ""} onChange={(e) => set("short_description", e.target.value)} />
            </Field>
            <Field label="Description">
              <Textarea rows={6} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <Field label="Features (one per line)">
              <Textarea
                rows={5}
                value={Array.isArray(form.features) ? form.features.join("\n") : (form.features ?? "")}
                onChange={(e) => set("features", e.target.value.split("\n"))}
              />
            </Field>
          </Panel>

          <Panel className="space-y-4">
            <h2 className="font-display text-xl">Media</h2>
            <p className="text-xs text-muted-foreground">
              Drag to reorder — the public gallery uses this exact order. Every change saves immediately.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {rows.map((image, index) => (
                <div
                  key={image.id}
                  draggable
                  onDragStart={() => (dragFrom.current = index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    const from = dragFrom.current;
                    dragFrom.current = null;
                    if (from !== null) void reorder(from, index);
                  }}
                  className="group relative overflow-hidden rounded-xl border border-border bg-secondary/40"
                >
                  <div className="relative aspect-square">
                    {image.media_type === "video" ? (
                      <>
                        <video src={image.url} className="h-full w-full object-cover" muted />
                        <span className="absolute inset-0 grid place-items-center bg-ink/40 text-ink-foreground">
                          <Play className="h-5 w-5 fill-current" />
                        </span>
                      </>
                    ) : (
                      <img src={image.url} alt="" className="h-full w-full object-cover" />
                    )}
                    <span className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded bg-ink/70 text-ink-foreground">
                      <GripVertical className="h-3.5 w-3.5" />
                    </span>
                    {image.is_main ? (
                      <span className="absolute right-1 top-1 rounded bg-ink px-1.5 py-0.5 text-[10px] text-ink-foreground">
                        Main
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1 p-1.5">
                    <select
                      value={image.label ?? ""}
                      onChange={(e) => void setLabel(image.id, e.target.value)}
                      className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-1.5 text-xs"
                    >
                      <option value="">No label</option>
                      {MEDIA_LABELS.map((label) => (
                        <option key={label} value={label}>{label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={busy || image.is_main}
                      title="Set as main image"
                      onClick={() => void makeMain(image.id)}
                      className="grid h-8 w-8 place-items-center rounded-md border border-border disabled:opacity-40"
                    >
                      <Star className={image.is_main ? "h-3.5 w-3.5 fill-current" : "h-3.5 w-3.5"} />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      title="Delete image"
                      onClick={() => void removeImage(image)}
                      className="grid h-8 w-8 place-items-center rounded-md border border-border text-destructive disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:bg-secondary">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload
                <input type="file" accept="image/*,video/*" multiple hidden onChange={onUpload} disabled={isNew} />
              </label>
            </div>
            {isNew ? <p className="text-xs text-muted-foreground">Save the product first to upload images.</p> : null}
          </Panel>

          <Panel className="space-y-4">
            <h2 className="font-display text-xl">Specifications</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Material"><Input value={form.material ?? ""} onChange={(e) => set("material", e.target.value)} /></Field>
              <Field label="Leather type"><Input value={form.leather_type ?? ""} onChange={(e) => set("leather_type", e.target.value)} /></Field>
              <Field label="Colour"><Input value={form.color ?? ""} onChange={(e) => set("color", e.target.value)} /></Field>
              <Field label="Dimensions"><Input value={form.dimensions ?? ""} onChange={(e) => set("dimensions", e.target.value)} /></Field>
              <Field label="Weight (g)"><Input type="number" value={form.weight ?? ""} onChange={(e) => set("weight", e.target.value)} /></Field>
              <Field label="Made in"><Input value={form.made_in ?? ""} onChange={(e) => set("made_in", e.target.value)} /></Field>
              <Field label="Delivery time"><Input value={form.delivery_time ?? ""} onChange={(e) => set("delivery_time", e.target.value)} /></Field>
              <Field label="Tags (comma separated)">
                <Input
                  value={Array.isArray(form.tags) ? form.tags.join(", ") : (form.tags ?? "")}
                  onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()))}
                />
              </Field>
            </div>
          </Panel>

          <Panel className="space-y-4">
            <h2 className="font-display text-xl">SEO</h2>
            <Field label="SEO title"><Input value={form.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} /></Field>
            <Field label="Meta description">
              <Textarea rows={3} value={form.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value)} />
            </Field>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="space-y-4">
            <h2 className="font-display text-xl">Pricing & stock</h2>
            <Field label="Price (MAD)"><Input type="number" value={form.price ?? 0} onChange={(e) => set("price", e.target.value)} required /></Field>
            <Field label="Sale price (MAD)"><Input type="number" value={form.sale_price ?? ""} onChange={(e) => set("sale_price", e.target.value)} /></Field>
            <Field label="Stock"><Input type="number" value={form.stock ?? 0} onChange={(e) => set("stock", e.target.value)} /></Field>
            <Field label="Low stock alert"><Input type="number" value={form.low_stock_threshold ?? 3} onChange={(e) => set("low_stock_threshold", e.target.value)} /></Field>
          </Panel>

          <Panel className="space-y-4">
            <h2 className="font-display text-xl">Publishing</h2>
            <Field label="Status">
              <select
                value={form.status ?? "draft"}
                onChange={(e) => set("status", e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <Field label="Category">
              <select
                value={form.category_id ?? ""}
                onChange={(e) => set("category_id", e.target.value || null)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">No category</option>
                {(categories.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </Field>
            <Toggle label="Featured" checked={!!form.featured} onChange={(v) => set("featured", v)} />
            <Toggle label="Cash on delivery" checked={!!form.cod_available} onChange={(v) => set("cod_available", v)} />
            <Toggle label="WhatsApp ordering" checked={!!form.whatsapp_ordering} onChange={(v) => set("whatsapp_ordering", v)} />
          </Panel>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}