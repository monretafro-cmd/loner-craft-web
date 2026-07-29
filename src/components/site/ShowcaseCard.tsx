import { Link } from "@tanstack/react-router";
import { BadgeCheck, Clock3, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useCatalog } from "@/lib/i18n/catalog";
import { useWhatsapp } from "@/lib/i18n/whatsapp";
import { useProductImage } from "@/lib/shop/data";
import type { Product } from "@/lib/products";

function Badge({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-[0.7rem] font-medium tracking-[0.06em] text-muted-foreground uppercase">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

/** Large single-product card used when the catalog is still small. */
export function ShowcaseCard({ product }: { product: Product }) {
  const { t } = useI18n();
  const { productText, price } = useCatalog();
  const { orderLink } = useWhatsapp();
  const text = productText(product);
  const image = useProductImage(product.slug);
  const subtitle = t(`catalog.products.${product.slug}.subtitle`);

  return (
    <article className="group mx-auto w-full max-w-[520px] overflow-hidden rounded-[22px] border border-border bg-card shadow-[0_18px_50px_-30px_rgba(36,24,18,0.55)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-32px_rgba(36,24,18,0.6)]">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="block aspect-square overflow-hidden bg-secondary"
        aria-label={text.name}
      >
        <img
          src={image}
          alt={text.name}
          width={1200}
          height={1200}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          sizes="(max-width: 640px) 100vw, 520px"
          className="h-full w-full object-contain transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
        />
      </Link>

      <div className="p-6 sm:p-7">
        <h2 className="font-display text-2xl leading-snug sm:text-[1.75rem]">
          <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-primary">
            {text.name}
          </Link>
        </h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text.short}</p>

        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="font-display text-2xl font-semibold">{price(product.price)}</span>
          {product.compareAt && (
            <span className="text-sm text-muted-foreground line-through">{price(product.compareAt)}</span>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge icon={BadgeCheck} label={t("shop.showcase.codBadge")} />
          <Badge icon={MapPin} label={t("shop.showcase.moroccoBadge")} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="hero" className="flex-1">
            <Link to="/product/$slug" params={{ slug: product.slug }}>
              {t("shop.showcase.viewDetails")}
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <a href={orderLink({ product: text.name })} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              {t("actions.orderWhatsapp")}
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}

/** Non-orderable teaser card for pieces that are not in the catalog yet. */
export function ComingSoonCard({ title, blurb }: { title: string; blurb: string }) {
  const { t } = useI18n();
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[22px] border border-dashed border-border bg-card/60 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40">
      <div className="grid aspect-square place-items-center bg-secondary/50">
        <Clock3 className="h-8 w-8 text-muted-foreground" aria-hidden />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="eyebrow">{t("shop.showcase.comingSoonLabel")}</span>
        <h3 className="font-display mt-2 text-lg leading-snug">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{blurb}</p>
      </div>
    </article>
  );
}