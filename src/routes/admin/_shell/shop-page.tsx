import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { useRows, useSaveRow } from "@/lib/admin/api";
import { PageHeader, Panel, LoadingRows } from "@/components/admin_new/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/_shell/shop-page")({
  head: () => ({
    meta: [{ title: "Shop Page — Loner Leather Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: ShopPageManager,
});

const LANGS = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
] as const;

const LABELS: Record<string, string> = {
  shop_hero: "Hero",
  shop_featured: "Featured products",
  shop_categories: "Categories",
  shop_collection: "Collection grid",
  
  shop_packaging: "Packaging",
  shop_delivery: "Delivery",
  shop_reviews: "Customer reviews",
  shop_faq: "FAQ",
  shop_cta: "Final CTA",
};

/** Plain-text fields we expose as friendly per-language inputs. */
const TEXT_FIELDS: Record<string, { key: string; label: string; long?: boolean }[]> = {
  shop_hero: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Hero title" },
    { key: "subtitle", label: "Hero subtitle", long: true },
    { key: "primaryLabel", label: "Primary button" },
    { key: "secondaryLabel", label: "WhatsApp button (Optional)" },
  ],
  shop_featured: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Title" },
    { key: "subtitle", label: "Subtitle", long: true },
  ],
  shop_categories: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Title" },
  ],
  shop_collection: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Title" },
    { key: "subtitle", label: "Subtitle", long: true },
  ],
  shop_packaging: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Title" },
    { key: "body", label: "Text", long: true },
  ],
  shop_delivery: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Title" },
  ],
  shop_reviews: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Title" },
  ],
  shop_faq: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Title" },
  ],
  shop_cta: [
    { key: "title", label: "Title" },
    { key: "subtitle", label: "Subtitle", long: true },
    { key: "primaryLabel", label: "Primary button" },
    { key: "secondaryLabel", label: "WhatsApp button (Optional)" },
  ],
};

/** Structured blocks that stay editable as raw content. */
const RICH_FIELDS: Record<string, { key: string; label: string; hint: string }[]> = {
  shop_craft: [{ key: "points", label: "Craft points", hint: 'Per language list, e.g. {"en":["Hand-stitched"],"fr":[...],"ar":[...]}' }],
  shop_delivery: [
    { key: "items", label: "Delivery promises", hint: 'Per language list of {"title","text"} objects' },
  ],
  shop_faq: [{ key: "items", label: "FAQ items", hint: 'List of {"q":{"en","fr","ar"},"a":{"en","fr","ar"}}' }],
  shop_hero: [{ key: "image", label: "Hero image URL", hint: "Leave empty to use the first featured product photo" }],
  shop_categories: [{ key: "hidden", label: "Hidden category slugs", hint: 'e.g. ["belts","custom"]' }],
};

type Section = { id: string; section: string; content: any; active: boolean; display_order: number };

function ShopPageManager() {
  const sections = useRows<Section>("homepage_content", { orderBy: "display_order", ascending: true });
  const products = useRows<any>("products", { orderBy: "created_at", ascending: false });
  const categories = useRows<any>("categories", { orderBy: "display_order", ascending: true });
  const saveSection = useSaveRow("homepage_content", "shop-page");
  const saveProduct = useSaveRow("products", "shop-page");

  const [drafts, setDrafts] = useState<Record<string, any>>({});
  const shopSections = (sections.data ?? []).filter((s) => s.section.startsWith("shop_") && s.section !== "shop_craft");

  useEffect(() => {
    if (!sections.data) return;
    setDrafts(Object.fromEntries(sections.data.map((s) => [s.id, s.content ?? {}])));
  }, [sections.data]);

  const setField = (id: string, path: string[], value: unknown) => {
    setDrafts((prev) => {
      const next = { ...prev, [id]: { ...(prev[id] ?? {}) } };
      let node: any = next[id];
      for (let i = 0; i < path.length - 1; i += 1) {
        node[path[i]] = { ...(node[path[i]] ?? {}) };
        node = node[path[i]];
      }
      node[path[path.length - 1]] = value;
      return next;
    });
  };

  const move = (section: Section, direction: -1 | 1) => {
    const index = shopSections.findIndex((s) => s.id === section.id);
    const swap = shopSections[index + direction];
    if (!swap) return;
    saveSection.mutate({ id: section.id, display_order: swap.display_order });
    saveSection.mutate({ id: swap.id, display_order: section.display_order });
  };

  return (
    <>
      <PageHeader
        title="Shop Page"
        subtitle="Everything on the public Shop page — hero, sections, order and content, in all three languages"
      />

      {sections.isLoading ? (
        <LoadingRows />
      ) : (
        <div className="space-y-6">
          <Panel className="space-y-4">
            <h2 className="font-display text-xl">Featured products</h2>
            <p className="text-sm text-muted-foreground">
              Featured pieces lead the Shop page. With nothing featured, the newest products are shown instead.
            </p>
            <div className="space-y-2">
              {(products.data ?? []).map((product: any) => (
                <label
                  key={product.id}
                  className="group flex min-h-12 items-center justify-between gap-4 rounded-xl border border-border/60 px-4 py-2 transition-all hover:border-cognac/40 hover:bg-secondary/10"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center font-display text-xs font-bold shrink-0">
                      {product.name.slice(0, 1)}
                    </div>
                    <span className="min-w-0 truncate text-sm font-medium text-ink">
                      {product.name}
                      <span className="ms-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{product.status}</span>
                    </span>
                  </div>
                  <Switch
                    checked={Boolean(product.featured)}
                    onCheckedChange={(value) => saveProduct.mutate({ id: product.id, featured: value })}
                  />
                </label>
              ))}

            </div>
          </Panel>

          <Panel className="space-y-4">
            <h2 className="font-display text-xl">Category visibility</h2>
            <p className="text-sm text-muted-foreground">
              Empty categories hide themselves automatically. Switch one off to hide it even when it has products.
            </p>
            {(() => {
              const catSection = shopSections.find((s) => s.section === "shop_categories");
              if (!catSection) return null;
              const hidden: string[] = drafts[catSection.id]?.hidden ?? [];
              return (
                <div className="space-y-2">
                  {(categories.data ?? []).map((category: any) => (
                    <label
                      key={category.id}
                      className="group flex min-h-12 items-center justify-between gap-4 rounded-xl border border-border/60 px-4 py-2 transition-all hover:border-cognac/40 hover:bg-secondary/10"
                    >
                      <span className="min-w-0 truncate text-sm font-medium text-ink">{category.name}</span>
                      <Switch
                        checked={!hidden.includes(category.slug)}
                        onCheckedChange={(value) => {
                          const next = value
                            ? hidden.filter((slug) => slug !== category.slug)
                            : [...hidden, category.slug];
                          setField(catSection.id, ["hidden"], next);
                          saveSection.mutate({
                            id: catSection.id,
                            content: { ...(drafts[catSection.id] ?? {}), hidden: next },
                          });
                        }}
                      />
                    </label>
                  ))}

                </div>
              );
            })()}
          </Panel>

          {shopSections.map((section) => {
            const draft = drafts[section.id] ?? {};
            return (
              <Panel key={section.id} className="flex flex-col border-l-4 border-l-cognac">
                <div className="mb-6 flex items-center justify-between border-b border-border/40 pb-6">
                  <div>
                    <h2 className="font-display text-2xl text-ink">
                      {LABELS[section.section] ?? section.section.replace(/_/g, " ")}
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">Section Settings & Content</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 rounded-full bg-secondary/40 p-1.5 ring-1 ring-border/40">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white" aria-label="Move up" onClick={() => move(section, -1)}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white" aria-label="Move down" onClick={() => move(section, 1)}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <div className="h-6 w-px bg-border/40 mx-1" />
                    <div className="flex items-center gap-2 px-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active</span>
                      <Switch
                        checked={section.active}
                        onCheckedChange={(value) => saveSection.mutate({ id: section.id, active: value })}
                      />
                    </div>
                  </div>
                </div>


                {(TEXT_FIELDS[section.section] ?? []).map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <div className="grid gap-2 lg:grid-cols-3">
                      {LANGS.map((lang) => {
                        const value = draft[field.key]?.[lang.code] ?? "";
                        const props = {
                          value,
                          placeholder: lang.label,
                          dir: lang.code === "ar" ? ("rtl" as const) : undefined,
                          onChange: (event: { target: { value: string } }) =>
                            setField(section.id, [field.key, lang.code], event.target.value),
                        };
                        return field.long ? (
                          <Textarea key={lang.code} rows={4} {...props} />
                        ) : (
                          <Input key={lang.code} {...props} />
                        );
                      })}
                    </div>
                  </div>
                ))}

                {(RICH_FIELDS[section.section] ?? []).map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <p className="text-xs text-muted-foreground">{field.hint}</p>
                    <Textarea
                      rows={field.key === "image" ? 2 : 8}
                      className="font-mono text-xs"
                      value={
                        typeof draft[field.key] === "string"
                          ? draft[field.key]
                          : JSON.stringify(draft[field.key] ?? (field.key === "image" ? "" : []), null, 2)
                      }
                      onChange={(event) => {
                        const raw = event.target.value;
                        if (field.key === "image") {
                          setField(section.id, [field.key], raw);
                          return;
                        }
                        try {
                          setField(section.id, [field.key], JSON.parse(raw));
                        } catch {
                          setField(section.id, [`${field.key}__invalid`], raw);
                          setDrafts((prev) => ({
                            ...prev,
                            [section.id]: { ...(prev[section.id] ?? {}), [`${field.key}__raw`]: raw },
                          }));
                        }
                      }}
                    />
                  </div>
                ))}

                <div className="mt-8 pt-6 border-t border-border/40">
                  <Button
                    className="w-full bg-ink text-ink-foreground hover:bg-ink/90 font-bold uppercase tracking-[0.2em] text-[10px] h-12 shadow-xl"
                    onClick={() => {
                      const clean = Object.fromEntries(
                        Object.entries(draft).filter(([key]) => !key.endsWith("__invalid") && !key.endsWith("__raw")),
                      );
                      saveSection.mutate({ id: section.id, content: clean });
                      toast.success(`${LABELS[section.section]} updated`);
                    }}
                  >
                    Save {LABELS[section.section]} Configuration
                  </Button>
                </div>

              </Panel>
            );
          })}
        </div>
      )}
    </>
  );
}