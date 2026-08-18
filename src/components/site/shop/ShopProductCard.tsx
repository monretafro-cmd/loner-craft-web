import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/i18n/format";
import { useWhatsapp } from "@/lib/i18n/whatsapp";
import type { ShopProduct } from "@/lib/shop/data";

function Price({ product }: { product: ShopProduct }) {
  const { lang } = useI18n();
  const sale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
  return (
    <p className="font-display text-xl text-foreground">
      {formatPrice(sale ? product.salePrice! : product.price, lang)}
      {sale && (
        <span className="ms-2 text-sm text-muted-foreground line-through">
          {formatPrice(product.price, lang)}
        </span>
      )}
    </p>
  );
}

export function ShopProductCard({
  product,
  priority = false,
  variant = "grid",
}: {
  product: ShopProduct;
  priority?: boolean;
  variant?: "grid" | "featured";
}) {
  const { t } = useI18n();
  const { orderLink } = useWhatsapp();
  const [quickView, setQuickView] = useState(false);

  return (
    <>
      <article
        className={`group flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-34px_rgba(36,24,18,0.6)] ${
          variant === "featured" ? "shadow-[0_18px_50px_-34px_rgba(36,24,18,0.5)]" : ""
        }`}
      >
        <div className="relative overflow-hidden bg-secondary">
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="block aspect-square"
            aria-label={product.name}
          >
            <img
              src={product.mainImage}
              alt={product.name}
              width={1000}
              height={1000}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
              className="h-full w-full object-contain p-4 transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]"
            />
          </Link>
          <div className="pointer-events-none absolute top-3 start-3 flex flex-wrap gap-1.5">
            {product.featured && (
              <span className="rounded-md bg-accent px-2 py-1 text-[0.6rem] font-semibold tracking-[0.14em] text-accent-foreground uppercase">
                {t("shop.card.featured")}
              </span>
            )}
            {!product.inStock && (
              <span className="rounded-md bg-foreground/85 px-2 py-1 text-[0.6rem] font-semibold tracking-[0.14em] text-background uppercase">
                {t("shop.card.soldOut")}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setQuickView(true)}
            className="absolute bottom-3 end-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card/95 px-4 text-xs font-medium tracking-[0.08em] uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Eye className="h-3.5 w-3.5" /> {t("shop.card.quickView")}
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="font-display text-xl leading-snug">
            <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-primary">
              {product.name}
            </Link>
          </h3>
          {product.short && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.short}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {product.cod && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[0.65rem] tracking-[0.06em] text-muted-foreground uppercase">
                <ShieldCheck className="h-3 w-3" /> {t("shop.card.cod")}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[0.65rem] tracking-[0.06em] text-muted-foreground uppercase">
              <Sparkles className="h-3 w-3" /> {t("shop.card.handmade")}
            </span>
          </div>
          <div className="mt-auto space-y-3 pt-2">
            <Price product={product} />
            <div className="grid gap-2 sm:grid-cols-2">
              <Button asChild variant="outline" className="min-h-11 w-full">
                <Link to="/product/$slug" params={{ slug: product.slug }}>
                  {t("shop.card.details")}
                </Link>
              </Button>
              <Button asChild className="min-h-11 w-full">
                <a href={orderLink({ product: product.name })} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> {t("shop.card.whatsapp")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </article>

      <Dialog open={quickView} onOpenChange={setQuickView}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <div className="grid gap-0 sm:grid-cols-2">
            <div className="aspect-square bg-secondary">
              <img
                src={product.mainImage}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-contain p-4"
              />
            </div>
            <div className="flex flex-col gap-4 p-6">
              <DialogTitle className="font-display text-2xl leading-snug">{product.name}</DialogTitle>
              {product.short && (
                <p className="text-sm leading-relaxed text-muted-foreground">{product.short}</p>
              )}
              <Price product={product} />
              <div className="mt-auto grid gap-2">
                <Button asChild className="min-h-11 w-full">
                  <a href={orderLink({ product: product.name })} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> {t("shop.card.whatsapp")}
                  </a>
                </Button>
                <Button asChild variant="outline" className="min-h-11 w-full">
                  <Link to="/product/$slug" params={{ slug: product.slug }}>
                    {t("shop.card.details")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}