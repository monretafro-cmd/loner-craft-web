import { useCallback, useMemo } from "react";
import type { Product } from "@/lib/products";
import { useI18n } from "./index";
import { formatPrice } from "./format";

export const colorKey = (color: string) =>
  color.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Single source of truth for translated catalog copy.
 * products.ts keeps the structural data (slug, price, images);
 * every visible string comes from src/locales/<lang>/catalog.json.
 */
export function useCatalog() {
  const { t, tList, lang } = useI18n();

  const productText = useCallback(
    (product: Product) => ({
      name: t(`catalog.products.${product.slug}.name`) || product.name,
      short: t(`catalog.products.${product.slug}.short`) || product.short,
      description: t(`catalog.products.${product.slug}.description`) || product.description,
      leather: t(`catalog.products.${product.slug}.leather`) || product.leather,
      dimensions: t(`catalog.products.${product.slug}.dimensions`) || product.dimensions,
    }),
    [t],
  );

  const productName = useCallback(
    (product: Product) => t(`catalog.products.${product.slug}.name`) || product.name,
    [t],
  );

  const categoryName = useCallback((slug: string) => t(`catalog.categories.${slug}.name`) || slug, [t]);
  const categoryBlurb = useCallback((slug: string) => t(`catalog.categories.${slug}.blurb`), [t]);
  const colorName = useCallback((color: string) => t(`catalog.colors.${colorKey(color)}`) || color, [t]);
  const price = useCallback((value: number) => formatPrice(value, lang), [lang]);

  const faqs = useMemo(() => tList<{ q: string; a: string }>("catalog.faqs"), [tList]);
  const testimonials = useMemo(
    () => tList<{ name: string; city: string; text: string }>("catalog.testimonials"),
    [tList],
  );

  return { productText, productName, categoryName, categoryBlurb, colorName, price, faqs, testimonials };
}