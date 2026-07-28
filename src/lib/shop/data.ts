/**
 * Public Shop page data layer.
 *
 * Everything on /shop is driven by the admin panel (Lovable Cloud tables).
 * Local catalog data is used only as an instant fallback so the page never
 * renders empty — during SSR, while the first fetch resolves, or if the
 * database has not been filled in yet.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { products as localProducts, categories as localCategories } from "@/lib/products";
import { galleryImages, PHOTOS } from "@/lib/photos";
import type { Lang } from "@/lib/i18n/config";

export type Localized<T = string> = T | Partial<Record<Lang, T>>;

/** Reads a `{ en, fr, ar }` bag (or a plain value) in the active language. */
export function pick<T>(value: Localized<T> | undefined | null, lang: Lang, fallback?: T): T | undefined {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "object" && !Array.isArray(value)) {
    const bag = value as Partial<Record<Lang, T>>;
    if ("en" in bag || "fr" in bag || "ar" in bag) return bag[lang] ?? bag.en ?? fallback;
  }
  return value as T;
}

export type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  subtitle?: string | null;
  short: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  featured: boolean;
  inStock: boolean;
  cod: boolean;
  categoryId: string | null;
  categorySlug: string | null;
  createdAt: string;
  translations?: Record<string, unknown> | null;
};

export type ShopCategory = {
  id: string;
  slug: string;
  name: string;
  nameFr?: string | null;
  nameAr?: string | null;
  description?: string | null;
  image?: string | null;
  count: number;
};

export type ShopReview = {
  id: string;
  name: string;
  city?: string | null;
  rating: number;
  text?: string | null;
};

export type ShopSections = Record<string, { id?: string; content: any; active: boolean; order: number }>;

const fallbackImage = PHOTOS.walletOpenCards.src ?? PHOTOS.walletWrappedThankYou.src ?? "";

/** Local catalog mapped into the shape the Shop page renders. */
export const localShopProducts = (): ShopProduct[] =>
  localProducts.map((p, index) => ({
    id: p.slug,
    slug: p.slug,
    short: p.short,
    name: p.name,
    price: p.price,
    salePrice: null,
    images: p.images.length ? p.images : galleryImages(),
    featured: Boolean(p.bestSeller) || index === 0,
    inStock: p.inStock,
    cod: true,
    categoryId: null,
    categorySlug: p.category,
    createdAt: p.createdAt,
  }));

export const localShopCategories = (): ShopCategory[] =>
  localCategories
    .filter((c) => localProducts.some((p) => p.category === c.slug))
    .map((c) => ({
      id: c.slug,
      slug: c.slug,
      name: c.name,
      description: c.blurb,
      image: c.image,
      count: localProducts.filter((p) => p.category === c.slug).length,
    }));

async function fetchShopCatalog(): Promise<{ products: ShopProduct[]; categories: ShopCategory[] }> {
  const [productsRes, categoriesRes, imagesRes] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, slug, name, subtitle, short_description, price, sale_price, stock, featured, cod_available, category_id, created_at, translations",
      )
      .eq("status", "active"),
    supabase.from("categories").select("id, slug, name, name_fr, name_ar, description, image_url, display_order").eq("status", "active"),
    supabase.from("product_images").select("product_id, url, is_main, display_order, media_type"),
  ]);

  if (productsRes.error) throw productsRes.error;

  const imagesByProduct = new Map<string, string[]>();
  for (const image of (imagesRes.data ?? []) as any[]) {
    if (image.media_type && image.media_type !== "image") continue;
    const list = imagesByProduct.get(image.product_id) ?? [];
    list.push(image.url);
    imagesByProduct.set(image.product_id, list);
  }

  const localBySlug = new Map(localShopProducts().map((p) => [p.slug, p]));
  const categoryRows = (categoriesRes.data ?? []) as any[];

  const products: ShopProduct[] = ((productsRes.data ?? []) as any[]).map((row) => {
    const local = localBySlug.get(row.slug);
    const dbImages = imagesByProduct.get(row.id) ?? [];
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      subtitle: row.subtitle,
      short: row.short_description ?? local?.short ?? "",
      price: Number(row.price ?? 0),
      salePrice: row.sale_price === null || row.sale_price === undefined ? null : Number(row.sale_price),
      images: dbImages.length ? dbImages : (local?.images ?? [fallbackImage].filter(Boolean)),
      featured: Boolean(row.featured),
      inStock: Number(row.stock ?? 0) > 0,
      cod: row.cod_available !== false,
      categoryId: row.category_id ?? null,
      categorySlug: categoryRows.find((c) => c.id === row.category_id)?.slug ?? local?.categorySlug ?? null,
      createdAt: row.created_at ?? "",
      translations: row.translations ?? null,
    };
  });

  const categories: ShopCategory[] = categoryRows
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      nameFr: row.name_fr,
      nameAr: row.name_ar,
      description: row.description,
      image:
        row.image_url ??
        products.find((p) => p.categoryId === row.id)?.images[0] ??
        fallbackImage,
      count: products.filter((p) => p.categoryId === row.id).length,
    }))
    .filter((c) => c.count > 0);

  if (!products.length) return { products: localShopProducts(), categories: localShopCategories() };
  return { products, categories };
}

export function useShopCatalog() {
  return useQuery({
    queryKey: ["shop", "catalog"],
    queryFn: fetchShopCatalog,
    staleTime: 30_000,
    placeholderData: { products: localShopProducts(), categories: localShopCategories() },
  });
}

export function useShopSections() {
  return useQuery({
    queryKey: ["shop", "sections"],
    queryFn: async (): Promise<ShopSections> => {
      const { data, error } = await supabase
        .from("homepage_content")
        .select("id, section, content, active, display_order")
        .like("section", "shop_%");
      if (error) throw error;
      const map: ShopSections = {};
      for (const row of (data ?? []) as any[]) {
        map[row.section] = { id: row.id, content: row.content ?? {}, active: row.active, order: row.display_order ?? 0 };
      }
      return map;
    },
    staleTime: 30_000,
  });
}

export function useShopReviews() {
  return useQuery({
    queryKey: ["shop", "reviews"],
    queryFn: async (): Promise<ShopReview[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, customer_name, city, rating, text, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(9);
      if (error) throw error;
      return ((data ?? []) as any[]).map((row) => ({
        id: row.id,
        name: row.customer_name,
        city: row.city,
        rating: Number(row.rating ?? 5),
        text: row.text,
      }));
    },
    staleTime: 60_000,
  });
}

/** Featured products, falling back to the newest pieces when nothing is flagged. */
export function featuredOf(products: ShopProduct[], limit = 3) {
  const featured = products.filter((p) => p.featured);
  const list = featured.length
    ? featured
    : [...products].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return list.slice(0, limit);
}