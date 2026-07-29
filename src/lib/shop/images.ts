/**
 * Single source of truth for product media.
 *
 * Every public gallery / card image comes from the `product_images` table —
 * there are no hardcoded product photos anywhere in the public site.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PLACEHOLDER_IMAGE = "/placeholder.svg";

export type ProductMedia = {
  id: string;
  productId: string;
  type: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  label?: string;
  order: number;
  isMain: boolean;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  url: string;
  storage_path: string | null;
  alt_text: string | null;
  label: string | null;
  display_order: number | null;
  is_main: boolean | null;
  media_type: string | null;
};

export const mapMedia = (row: ProductImageRow): ProductMedia => ({
  id: row.id,
  productId: row.product_id,
  type: row.media_type === "video" ? "video" : "image",
  src: row.url,
  alt: row.alt_text ?? "",
  label: row.label ?? undefined,
  order: row.display_order ?? 0,
  isMain: Boolean(row.is_main),
});

/** Gallery order: sort_order ascending, main image first when orders tie. */
export const byGalleryOrder = (a: ProductMedia, b: ProductMedia) =>
  a.order - b.order || Number(b.isMain) - Number(a.isMain);

/** Card image: `is_main`, else the first image by sort order, else placeholder. */
export function mainImageOf(media: ProductMedia[]): string {
  const images = media.filter((m) => m.type === "image").sort(byGalleryOrder);
  return images.find((m) => m.isMain)?.src ?? images[0]?.src ?? PLACEHOLDER_IMAGE;
}

export const productMediaKey = (productId?: string | null) => ["product_images", productId ?? "none"];

export async function fetchProductMedia(productId: string): Promise<ProductMedia[]> {
  const { data, error } = await supabase
    .from("product_images")
    .select("id, product_id, url, storage_path, alt_text, label, display_order, is_main, media_type")
    .eq("product_id", productId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as ProductImageRow[]).map(mapMedia).sort(byGalleryOrder);
}

/** Every media record for a product, in saved order. No limit, no slicing. */
export function useProductMedia(productId?: string | null) {
  return useQuery({
    queryKey: productMediaKey(productId),
    queryFn: () => fetchProductMedia(productId as string),
    enabled: Boolean(productId),
    staleTime: 0,
  });
}
