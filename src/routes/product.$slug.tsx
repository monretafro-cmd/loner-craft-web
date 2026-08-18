import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Gift,
  Hammer,
  Heart,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductGallery } from "@/components/site/ProductGallery";
import { formatMAD } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { useCatalog } from "@/lib/i18n/catalog";
import { useWhatsapp } from "@/lib/i18n/whatsapp";
import { PHOTOS } from "@/lib/photos";
import { getProduct, relatedProducts } from "@/lib/products";
import { useProductId } from "@/lib/shop/data";
import { useProductMedia } from "@/lib/shop/images";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const SEO_TITLE =
  "Leather Wallet for Men – Slim Bifold Wallet – Handmade Leather Gift for Him – Rustic Full Grain Leather – Vegetable Leather and Tanning";
const SEO_DESCRIPTION =
  "Discover the ALPHA WALLET by Loner Leather. Handmade minimalist leather wallet crafted from genuine Moroccan goat leather. Cash on Delivery across Morocco.";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ params }) => {
    const p = getProduct(params.slug);
    if (!p) {
      return {
        meta: [
          { title: "Product unavailable — Loner Leather" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = p.slug === "alpha-wallet" ? SEO_TITLE : `${p.name} — Loner Leather`;
    const description =
      p.slug === "alpha-wallet"
        ? SEO_DESCRIPTION
        : `${p.short} ${p.leather}. ${formatMAD(p.price)} with Cash on Delivery across Morocco.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/product/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/product/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            description: p.description,
            material: p.leather,
            brand: { "@type": "Brand", name: "Loner Leather" },
            offers: {
              "@type": "Offer",
              price: p.price,
              priceCurrency: "MAD",
              availability: p.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Shop", item: "/shop" },
              { "@type": "ListItem", position: 3, name: p.name, item: `/product/${params.slug}` },
            ],
          }),
        },
      ],
    };
  },
  component: ProductPage,
});

const HIGHLIGHT_ICONS = [BadgeCheck, Hammer, MapPin, Wallet, Truck, Gift];

function ProductPage() {
  const { slug } = Route.useParams();
  const product = getProduct(slug)!;
  const { addLine, setCartOpen, toggleWish, wishlist, pushRecent, recent } = useStore();
  const { t, tList, isRTL } = useI18n();
  const { productText, colorName, price, faqs } = useCatalog();
  const { orderLink } = useWhatsapp();
  const text = productText(product);
  const productId = useProductId(product.slug);
  const media = useProductMedia(productId);
  const [color, setColor] = useState(product.colors[0]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setColor(product.colors[0]);
    setQty(1);
    pushRecent(product.slug);
  }, [product.slug, product.colors, pushRecent]);

  const wished = wishlist.includes(product.slug);
  const recentlyViewed = recent
    .filter((s) => s !== product.slug)
    .map(getProduct)
    .filter(Boolean)
    .slice(0, 4);

  const subtitle = t(`catalog.products.${product.slug}.subtitle`);
  const features = tList<string>(`catalog.products.${product.slug}.features`);
  const materials = tList<string>(`catalog.products.${product.slug}.material`);
  const status = tList<string>("product.status.items");
  const highlights = tList<string>("product.highlights.items");
  const packagingItems = tList<string>("product.packaging.items");
  const craftParas = tList<string>("product.craft.paragraphs");
  const packagingPhotos = [PHOTOS.walletInPackaging, PHOTOS.packagingBox, PHOTOS.walletWrappedThankYou].filter(
    (p) => p.src,
  );

  const add = () => {
    addLine(
      {
        slug: product.slug,
        name: text.name,
        price: product.price,
        image: media.data?.find((m) => m.isMain)?.src ?? media.data?.[0]?.src ?? "",
        color,
      },
      qty,
    );
    setCartOpen(true);
    toast.success(t("product.toast.added", { name: text.name }));
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-10">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">{t("product.breadcrumb.home")}</Link>
          <ChevronIcon className="h-3 w-3" />
          <Link to="/shop" className="hover:text-foreground">{t("product.breadcrumb.shop")}</Link>
          <ChevronIcon className="h-3 w-3" />
          <span className="text-foreground">{text.name}</span>
        </nav>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-14">
          <div className="w-full lg:sticky lg:top-28 lg:w-[55%]">
            <ProductGallery name={text.name} items={media.data ?? []} />
          </div>

          <div className="w-full lg:w-[45%]">
            <div className="flex flex-col gap-6">
              {/* Top Product Area */}
              <div>
                <p className="eyebrow tracking-[0.2em] text-muted-foreground">LONER LEATHER</p>
                <h1 className="font-display mt-2 text-[34px] leading-tight sm:text-[42px] lg:text-[48px] xl:text-[56px]">
                  {text.name}
                </h1>
                {subtitle && (
                  <p className="mt-1 text-base text-muted-foreground sm:text-lg">{subtitle}</p>
                )}
                
                <div className="mt-6 flex flex-col gap-4">
                  <p className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                    {price(product.price)}
                  </p>
                  
                  {/* Compact Trust Row */}
                  <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] font-medium text-muted-foreground">
                    {status.map((s) => (
                      <li key={s} className="flex items-center gap-1.5 whitespace-nowrap">
                        <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Short Product Summary */}
                <p className="mt-6 text-[0.95rem] leading-relaxed text-muted-foreground md:text-base">
                  {t("product.summary")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-secondary/20 p-5 sm:grid-cols-3">
                {Object.entries((t("product.info") as any) || {}).map(([key, info]: [string, any]) => (
                  <div key={key}>
                    <dt className="eyebrow text-[10px] opacity-70">{info.label}</dt>
                    <dd className="mt-0.5 text-[13px] font-medium text-foreground">{info.value}</dd>
                  </div>
                ))}
              </div>

              {/* Purchase Area */}
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-xl border border-border bg-background">
                      <button
                        type="button"
                        aria-label={t("product.quantity.decrease")}
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="grid h-12 w-12 place-items-center rounded-s-xl hover:bg-secondary transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center font-medium tabular-nums">{qty}</span>
                      <button
                        type="button"
                        aria-label={t("product.quantity.increase")}
                        onClick={() => setQty((q) => Math.min(10, q + 1))}
                        className="grid h-12 w-12 place-items-center rounded-e-xl hover:bg-secondary transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("product.actions.wishlistAdd")}
                      className="h-12 w-12 rounded-xl border border-border hover:bg-secondary transition-colors"
                      onClick={() => {
                        const added = toggleWish(product.slug);
                        toast[added ? "success" : "message"](
                          added ? t("product.toast.wishAdded") : t("product.toast.wishRemoved"),
                        );
                      }}
                    >
                      <Heart className={cn("h-4 w-4", wished && "fill-accent text-accent")} />
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button 
                      variant="hero" 
                      size="xl" 
                      className="w-full text-base font-semibold shadow-lg shadow-primary/10" 
                      disabled={!product.inStock} 
                      onClick={add}
                    >
                      <ShoppingBag className="h-5 w-5" />
                      {product.inStock ? t("product.actions.buyNow") : t("product.actions.soldOut")}
                    </Button>
                    <Button variant="whatsapp" size="xl" className="w-full text-base font-semibold" asChild>
                      <a
                        href={orderLink({ product: text.name, color: colorName(color), quantity: qty })}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="h-5 w-5" />
                        {t("product.actions.whatsappOrder")}
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Delivery Trust Info */}
                <div className="flex flex-col gap-2 rounded-xl bg-accent/5 p-4 text-center sm:text-start">
                  <p className="flex items-center justify-center gap-2 text-sm font-medium text-foreground sm:justify-start">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    {t("product.trust.cod")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("product.trust.noPayment")}
                  </p>
                </div>
              </div>

              {/* Options (Color if applicable) */}
              {product.colors.length > 1 && (
                <div className="pt-2">
                  <p className="eyebrow">{t("product.colour.label", { color: colorName(color) })}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={cn(
                          "min-h-11 rounded-lg border px-4 text-sm transition-all",
                          color === c
                            ? "border-primary bg-primary text-primary-foreground shadow-md"
                            : "border-border hover:border-primary/50 bg-background",
                        )}
                      >
                        {colorName(c)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bar */}
        <div 
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 p-4 backdrop-blur-md lg:hidden transition-transform duration-300",
            "[[data-lightbox-open=true]_&]:translate-y-full"
          )}
        >
          <div className="mx-auto flex max-w-md items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{text.name}</span>
              <span className="text-lg font-bold text-foreground">{price(product.price)}</span>
            </div>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <Button size="lg" className="px-6 font-semibold" disabled={!product.inStock} onClick={add}>
                {t("product.actions.buyNow")}
              </Button>
              <Button size="icon" variant="whatsapp" className="h-11 w-11 rounded-full shrink-0" asChild>
                <a
                  href={orderLink({ product: text.name, color: colorName(color), quantity: qty })}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("product.actions.whatsappOrder")}
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {features.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl">{t("product.features.title")}</h2>
            <ul className="mt-4 grid gap-2.5 text-sm text-muted-foreground sm:grid-cols-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {materials.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 lg:px-10">
          <div className="rounded-2xl border border-border bg-secondary/40 p-6">
            <h2 className="font-display text-xl">{t("product.material.title")}</h2>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
              {materials.map((m) => (
                <li key={m} className="rounded-full border border-border bg-background px-3 py-1.5">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 lg:px-10">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="shipping">
            <AccordionTrigger className="font-display text-base">{t("product.tabs.shipping")}</AccordionTrigger>
            <AccordionContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>{t("product.tabs.shippingText1")}</p>
              <p>{t("product.tabs.shippingText2", { fee: price(35), freeThreshold: price(500) })}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq">
            <AccordionTrigger className="font-display text-base">{t("product.tabs.faq")}</AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              {faqs.slice(0, 3).map((f) => (
                <div key={f.q}>
                  <p className="text-foreground">{f.q}</p>
                  <p>{f.a}</p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Highlights */}
      <section className="mt-12 border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-16">
          <Reveal>
            <h2 className="font-display text-center text-3xl">{t("product.highlights.title")}</h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
            {highlights.map((h, i) => {
              const Icon = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length];
              return (
                <Reveal key={h} delay={i * 60}>
                  <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center transition-transform duration-500 hover:-translate-y-1">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-medium">{h}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Packaging */}
      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow">{t("product.packaging.eyebrow")}</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">{t("product.packaging.title")}</h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
              {t("product.packaging.text")}
            </p>
            <ul className="mt-5 grid gap-2.5 text-sm">
              {packagingItems.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          {packagingPhotos.length > 0 && (
            <Reveal delay={100}>
              <div className="grid grid-cols-2 gap-4">
                {packagingPhotos.slice(0, 3).map((photo, i) => (
                  <img
                    key={photo.src}
                    src={photo.src ?? ""}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 1024px) 50vw, 320px"
                    className={cn(
                      "h-full w-full rounded-2xl border border-border object-cover",
                      i === 0 && packagingPhotos.length > 1 ? "col-span-2 aspect-[16/10]" : "aspect-square",
                    )}
                  />
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-[900px] px-4 py-14 text-center sm:px-6 lg:py-20">
          <Reveal>
            <p className="eyebrow">{t("product.craft.eyebrow")}</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">{t("product.craft.title")}</h2>
            <div className="mt-5 space-y-3 text-[0.95rem] leading-relaxed text-muted-foreground">
              {craftParas.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {relatedProducts(product).length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <Reveal>
            <p className="eyebrow">{t("product.related.eyebrow")}</p>
            <h2 className="font-display mt-2 text-3xl">{t("product.related.title")}</h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
            {relatedProducts(product).map((p, i) => (
              <Reveal key={p.slug} delay={i * 70}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24">
          <h2 className="font-display text-2xl">{t("product.recentlyViewed.title")}</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
            {recentlyViewed.map((p) => p && <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}
    </>
  );
}

export default ProductPage;
