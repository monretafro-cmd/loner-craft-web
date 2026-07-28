import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRows, useSaveRow, useInvalidate, uploadFile, logAudit } from "@/lib/admin/api";
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
  const images = useRows<{ id: string; url: string; label: string | null; is_main: boolean; display_order: number }>(
    "product_images",
    { eq: { product_id: isNew ? "" : id }, orderBy: "display_order", ascending: true, enabled: !isNew },
  );
  const [form, setForm] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(false);

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
      for (const [index, file] of files.entries()) {
        const { url } = await uploadFile("product-images", file, `products/${id}`);
        await supabase.from("product_images").insert({
          product_id: id,
          url,
          alt_text: form.name,
          display_order: (images.data?.length ?? 0) + index,
          is_main: (images.data?.length ?? 0) + index === 0,
        });
        await supabase.from("media").insert({ url, name: file.name, folder: "products", mime_type: file.type, size_bytes: file.size });
      }
      await logAudit({ action: "upload_images", page: "products", recordType: "products", recordId: id });
      invalidate();
      toast.success("Images uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function removeImage(imageId: string) {
    await supabase.from("product_images").delete().eq("id", imageId);
    invalidate();
  }

  async function makeMain(imageId: string) {
    await supabase.from("product_images").update({ is_main: false }).eq("product_id", id);
    await supabase.from("product_images").update({ is_main: true }).eq("id", imageId);
    invalidate();
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
            <div className="flex flex-wrap gap-3">
              {(images.data ?? []).map((image) => (
                <div key={image.id} className="group relative h-28 w-28 overflow-hidden rounded-xl border border-border">
                  <img src={image.url} alt="" className="h-full w-full object-cover" />
                  {image.is_main ? (
                    <span className="absolute left-1 top-1 rounded bg-ink px-1.5 py-0.5 text-[10px] text-ink-foreground">Main</span>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 px-1.5 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <button type="button" onClick={() => makeMain(image.id)}>Main</button>
                    <button type="button" onClick={() => removeImage(image.id)}><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
              <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:bg-secondary">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload
                <input type="file" accept="image/*" multiple hidden onChange={onUpload} disabled={isNew} />
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