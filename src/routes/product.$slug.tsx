import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  Wallet,
  Clock,
  ShieldCheck,
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
import { ProductGallery } from "@/components/site/ProductGallery";
import { formatMAD } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { useCatalog } from "@/lib/i18n/catalog";
import { PHOTOS } from "@/lib/photos";
import { getProduct } from "@/lib/products";
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

function ProductPage() {
  const { slug } = Route.useParams();
  const product = getProduct(slug)!;
  const { addLine, setCartOpen, toggleWish, wishlist, pushRecent } = useStore();
  const { t, tList, isRTL } = useI18n();
  const { productText, price } = useCatalog();
  const text = productText(product);
  const productId = useProductId(product.slug);
  const media = useProductMedia(productId);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
    pushRecent(product.slug);
  }, [product.slug, pushRecent]);

  const wished = wishlist.includes(product.slug);

  const add = () => {
    addLine(
      {
        slug: product.slug,
        name: text.name,
        price: product.price,
        image: media.data?.find((m) => m.isMain)?.src ?? media.data?.[0]?.src ?? "",
        color: product.colors[0],
      },
      qty,
    );
    setCartOpen(true);
    toast.success(t("product.toast.added", { name: text.name }));
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 1. Header is handled by layout */}

      {/* 2. Breadcrumb */}
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 sm:px-6 lg:px-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground/70">
          <Link to="/" className="hover:text-foreground transition-colors">{t("product.breadcrumb.home")}</Link>
          <ChevronIcon className="h-3 w-3" />
          <Link to="/shop" className="hover:text-foreground transition-colors">{t("product.breadcrumb.shop")}</Link>
          <ChevronIcon className="h-3 w-3" />
          <span className="text-foreground font-medium">{text.name}</span>
        </nav>
      </div>

      {/* 3 & 4. Product Main Area (Gallery + Info) */}
      <section className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16 xl:gap-20">
          {/* Left Column: Product Gallery */}
          <div className="w-full lg:sticky lg:top-28 lg:w-[55%]">
            <ProductGallery name={text.name} items={media.data ?? []} />
          </div>

          {/* Right Column: Product Information */}
          <div className="w-full lg:w-[45%]">
            <div className="flex flex-col gap-8">
              {/* Product Identity */}
              <div>
                <span className="text-[11px] font-bold tracking-[0.25em] text-muted-foreground/60 uppercase">LONER LEATHER</span>
                <h1 className="font-display mt-2 text-4xl leading-[1.1] text-foreground sm:text-5xl xl:text-6xl">
                  {text.name}
                </h1>
                <p className="mt-2 text-lg text-muted-foreground/80 font-medium">{t(`catalog.products.${product.slug}.subtitle`)}</p>
                
                <div className="mt-6">
                  <span className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                    {price(product.price)}
                  </span>
                </div>

                {/* Trust Points */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  {tList<string>("product.status.items").map((s) => (
                    <div key={s} className="flex items-center gap-2.5 text-[13px] font-semibold text-muted-foreground/90">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </div>
                      {s}
                    </div>
                  ))}
                </div>

                {/* Short Description */}
                <div className="mt-10 border-t border-border pt-8">
                  <p className="text-[15px] leading-relaxed text-muted-foreground/90 max-w-[540px]">
                    {t("product_page:product.summary")}
                  </p>
                </div>
              </div>

              {/* 5. Purchase Area */}
              <div className="flex flex-col gap-5 pt-2">
                <div className="flex items-center gap-4">
                  {/* Quantity */}
                  <div className="flex items-center rounded-xl border border-border bg-card shadow-sm">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="grid h-14 w-14 place-items-center hover:bg-secondary/50 transition-colors rounded-l-xl"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-bold tabular-nums text-base">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(10, q + 1))}
                      className="grid h-14 w-14 place-items-center hover:bg-secondary/50 transition-colors rounded-r-xl"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Wishlist */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-xl border-border bg-card shadow-sm hover:bg-secondary/50"
                    onClick={() => {
                      const added = toggleWish(product.slug);
                      toast[added ? "success" : "message"](
                        added ? t("product.toast.wishAdded") : t("product.toast.wishRemoved"),
                      );
                    }}
                  >
                    <Heart className={cn("h-5 w-5 transition-colors", wished && "fill-accent text-accent")} />
                  </Button>
                </div>

                <Button 
                  variant="hero" 
                  className="w-full h-[60px] text-lg font-bold shadow-xl shadow-primary/5 rounded-xl uppercase tracking-widest" 
                  disabled={!product.inStock} 
                  onClick={add}
                >
                  <ShoppingBag className="mr-3 h-5 w-5" />
                  {product.inStock ? t("product.actions.buyNow") : t("product.actions.soldOut")}
                </Button>
              </div>

              {/* 6. New Trust Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-border">
                {[
                  { icon: Wallet, title: t("product_page:product.trust.cod"), sub: t("product_page:product.trust.codSub") },
                  { icon: Truck, title: t("product_page:product.trust.delivery"), sub: t("product_page:product.trust.deliverySub") },
                  { icon: BadgeCheck, title: t("product_page:product.trust.handmade"), sub: t("product_page:product.trust.handmadeSub") }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center sm:items-start text-center sm:text-start gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/5 text-accent border border-accent/10">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-foreground">{item.title}</h4>
                      <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 7. Key Product Details */}
              <div className="pt-8 border-t border-border">
                <h3 className="text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase mb-6">{t("product.details.title")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                  {[
                    "capacity", "pockets", "size", "material", "color", "madeIn"
                  ].map((key) => {
                    const d = t(`product_page:product.details.${key}`) as any;
                    return (
                      <div key={key} className="flex flex-col gap-1 border-b border-border/50 pb-3">
                        <span className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">{d.label}</span>
                        <span className="text-sm font-semibold text-foreground">{d.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Product Story */}
      <section className="bg-secondary/30 py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full lg:w-1/2 order-2 lg:order-1">
              <Reveal>
                <div className="max-w-[540px]">
                  <h2 className="font-display text-4xl lg:text-5xl text-foreground mb-8">
                    {t("product_page:product.story.title")}
                  </h2>
                  <div className="space-y-6">
                    {(tList<string>("product_page:product.story.features")).map((f) => (
                      <div key={f} className="flex items-start gap-4">
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </div>
                        <p className="text-lg font-medium text-muted-foreground/90">{f}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
            <div className="w-full lg:w-1/2 order-1 lg:order-2">
              <Reveal>
                <div className="aspect-[4/5] sm:aspect-square overflow-hidden rounded-[32px] bg-cream shadow-2xl">
                  <img 
                    src={PHOTOS.walletOpenCards.src || media.data?.[0]?.src || ""} 
                    alt={text.name} 
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" 
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Packaging */}
      <section className="py-20 lg:py-24 overflow-hidden">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl lg:text-5xl text-foreground mb-4">
                {t("product_page:product.packaging.title")}
              </h2>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-muted-foreground font-medium">
                {(tList<string>("product_page:product.packaging.items")).map(item => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-accent" strokeWidth={3} />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Reveal delay={100}>
              <div className="aspect-[16/10] overflow-hidden rounded-[32px] bg-cream">
                <img src={PHOTOS.packagingBox.src || ""} alt="Packaging Box" className="h-full w-full object-cover" />
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="aspect-[16/10] overflow-hidden rounded-[32px] bg-cream">
                <img src={PHOTOS.walletWrappedThankYou.src || ""} alt="Burlap Wrap" className="h-full w-full object-cover" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="py-20 lg:py-24 bg-cream/30">
        <div className="mx-auto w-full max-w-[800px] px-4 sm:px-6 lg:px-10">
          <Reveal>
            <h2 className="font-display text-center text-3xl lg:text-4xl text-foreground mb-12">
              {t("product.tabs.faq")}
            </h2>
          </Reveal>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border/60 rounded-2xl bg-background px-6">
                <AccordionTrigger className="font-display text-lg text-start hover:no-underline">
                  {t(`product_page:product.faq.q${i}`)}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground/90 pb-6">
                  {t(`product_page:product.faq.a${i}`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 11. Final Purchase CTA */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 z-0">
          <img src={PHOTOS.leatherTexture.src || ""} alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent" />
        </div>
        
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <Reveal>
            <div className="flex flex-col items-center text-center max-w-[600px] mx-auto">
              <h2 className="font-display text-5xl lg:text-6xl text-foreground mb-4">
                {t("product_page:product.finalCta.title")}
              </h2>
              <p className="text-3xl font-display font-semibold text-accent mb-8">
                {t("product_page:product.finalCta.price")}
              </p>
              
              <Button 
                variant="hero" 
                size="lg" 
                className="h-[64px] min-w-[280px] text-xl font-bold rounded-xl shadow-2xl uppercase tracking-widest mb-6"
                onClick={add}
              >
                {t("product.actions.buyNow")}
              </Button>
              
              <div className="flex items-center gap-3 text-muted-foreground font-semibold">
                <ShieldCheck className="h-5 w-5 text-accent" />
                {t("product_page:product.finalCta.cod")}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 12. Mobile Sticky CTA */}
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[100] border-t border-border bg-background/95 p-4 pb-safe-offset-4 backdrop-blur-md lg:hidden transition-transform duration-300",
          "[[data-lightbox-open=true]_&]:translate-y-full"
        )}
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-6">
          <div className="flex flex-col min-w-0">
            <span className="text-xl font-bold text-foreground">{price(product.price)}</span>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest truncate">{t("product_page:product.trust.cod")}</span>
          </div>
          <Button 
            size="lg" 
            className="flex-1 h-[54px] font-bold rounded-xl bg-primary text-primary-foreground shadow-lg" 
            disabled={!product.inStock} 
            onClick={add}
          >
            {t("product.actions.buyNow")}
          </Button>
        </div>
      </div>

      <div className="h-20 lg:h-0" />
    </div>
  );
}
