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
  Package,
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
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    setQty(1);
    pushRecent(product.slug);
    
    const handleScroll = () => {
      const buyButton = document.getElementById("main-buy-button");
      if (buyButton) {
        const rect = buyButton.getBoundingClientRect();
        setShowSticky(rect.bottom < 0);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    toast.success(t("cart.added", { name: text.name }));
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="mx-auto w-full max-w-[1320px] px-4 pt-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/60">
          <Link to="/" className="hover:text-foreground transition-colors">{t("product.breadcrumb.home")}</Link>
          <ChevronIcon className="h-2.5 w-2.5" />
          <Link to="/shop" className="hover:text-foreground transition-colors">{t("product.breadcrumb.shop")}</Link>
          <ChevronIcon className="h-2.5 w-2.5" />
          <span className="text-foreground font-medium">{text.name}</span>
        </nav>
      </div>

      {/* Main Product Section */}
      <section className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:py-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          {/* Left Column: Product Gallery */}
          <div className="w-full lg:sticky lg:top-24 lg:w-[55%]">
            <ProductGallery name={text.name} items={media.data ?? []} />
          </div>

          {/* Right Column: Product Information */}
          <div className="w-full lg:w-[45%]">
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/50 uppercase">LONER LEATHER</span>
                <h1 className="font-display mt-1 text-3xl leading-tight text-foreground sm:text-4xl xl:text-5xl">
                  {text.name}
                </h1>
                <p className="mt-1 text-base text-muted-foreground/70 font-medium">{t(`catalog.products.${product.slug}.subtitle`)}</p>
                
                <div className="mt-4">
                  <span className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {price(product.price)}
                  </span>
                </div>

                {/* Trust Highlights Grid */}
                <div className="mt-6 grid grid-cols-2 gap-y-2.5 gap-x-4">
                  {tList<string>("product.status.items").map((s) => (
                    <div key={s} className="flex items-center gap-2 text-[12px] font-semibold text-muted-foreground/80">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </div>
                      {s}
                    </div>
                  ))}
                </div>

                {/* Short Description */}
                <div className="mt-6 border-t border-border/60 pt-6">
                  <p className="text-sm leading-relaxed text-muted-foreground/90 line-clamp-3">
                    {t("product.summary")}
                  </p>
                </div>
              </div>

              {/* Purchase Area */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-border/80 bg-card overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="grid h-11 w-11 place-items-center hover:bg-secondary/50 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(10, q + 1))}
                      className="grid h-11 w-11 place-items-center hover:bg-secondary/50 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-lg border-border/80 bg-card hover:bg-secondary/50"
                    onClick={() => {
                      const added = toggleWish(product.slug);
                      toast[added ? "success" : "message"](
                        added ? t("product.toast.wishAdded") : t("product.toast.wishRemoved"),
                      );
                    }}
                  >
                    <Heart className={cn("h-4 w-4 transition-colors", wished && "fill-accent text-accent")} />
                  </Button>
                </div>

                <Button 
                  id="main-buy-button"
                  variant="hero" 
                  className="w-full h-14 text-base font-bold rounded-lg uppercase tracking-widest" 
                  disabled={!product.inStock} 
                  onClick={add}
                >
                  <ShoppingBag className="mr-2.5 h-4 w-4" />
                  {product.inStock ? t("product.actions.buyNow") : t("product.actions.soldOut")}
                </Button>

                {/* Compact Trust Row */}
                <div className="grid grid-cols-3 gap-2 py-4 border-t border-border/60 mt-2">
                  {[
                    { icon: Wallet, label: t("product.trust.cod") },
                    { icon: Truck, label: t("product.trust.delivery") },
                    { icon: BadgeCheck, label: t("product.trust.handmade") }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center gap-1.5">
                      <item.icon className="h-4 w-4 text-accent/80" strokeWidth={1.5} />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase leading-tight">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Section: Why You'll Like It */}
      <section className="py-8 sm:py-12 lg:py-16 bg-secondary/20">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="font-display text-2xl sm:text-3xl text-foreground">
                {t("product.highlights.title")}
              </h2>
            </div>
          </Reveal>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 max-w-4xl mx-auto">
            {tList<string>("product.highlights.items").map((f, idx) => (
              <Reveal key={f} delay={idx * 50}>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border/40 shadow-sm">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground/90">{f}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Packaging Section */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-2">
                {t("product.packaging.title")}
              </h2>
              <p className="text-sm text-muted-foreground/70 font-medium">
                {t("product.packaging.subtitle")}
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto mb-6">
            <Reveal delay={100}>
              <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-cream shadow-sm">
                <img src={PHOTOS.packagingBox.src || ""} alt="Packaging Box" className="h-full w-full object-cover" />
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-cream shadow-sm">
                <img src={PHOTOS.walletWrappedThankYou.src || ""} alt="Burlap Wrap" className="h-full w-full object-cover" />
              </div>
            </Reveal>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-muted-foreground/80 font-semibold text-[11px] uppercase tracking-wider">
            {(tList<string>("product.packaging.items")).map(item => (
              <span key={item} className="flex items-center gap-2">
                <Check className="h-3 w-3 text-accent" strokeWidth={3} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-8 sm:py-12 lg:py-16 bg-cream/20">
        <div className="mx-auto w-full max-w-[800px] px-4 sm:px-6">
          <Reveal>
            <h2 className="font-display text-center text-2xl sm:text-3xl text-foreground mb-8">
              {t("product.tabs.faq")}
            </h2>
          </Reveal>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {tList<{q: string, a: string}>("product.faq.items").map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border/50 rounded-xl bg-background px-5">
                <AccordionTrigger className="font-display text-base text-start hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground/90 pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final Purchase CTA */}
      <section className="relative overflow-hidden bg-ink py-12 sm:py-16 lg:py-20 text-ink-foreground">
        <div className="absolute inset-0 z-0">
          <img src={PHOTOS.leatherTexture.src || ""} alt="" className="h-full w-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-ink/40" />
        </div>
        
        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-4 sm:px-6 text-center">
          <Reveal>
            <div className="flex flex-col items-center max-w-[500px] mx-auto">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white mb-2 tracking-tight">
                {text.name}
              </h2>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl sm:text-3xl font-display font-semibold text-accent">
                  {price(product.price)}
                </span>
                <span className="h-4 w-px bg-white/20" />
                <span className="text-xs font-bold text-white/60 tracking-widest uppercase">{t("product.trust.cod")}</span>
              </div>
              
              <Button 
                variant="hero" 
                size="lg" 
                className="h-14 w-full sm:w-[280px] text-base font-bold rounded-lg shadow-2xl uppercase tracking-widest"
                onClick={add}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                {t("product.actions.buyNow")}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mobile Sticky Bottom Bar */}
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[40] bg-background/95 backdrop-blur-md border-t border-border p-3 transition-transform duration-300 lg:hidden",
          showSticky ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase leading-none mb-1">{text.name}</span>
            <span className="text-lg font-display font-bold text-foreground">{price(product.price)}</span>
          </div>
          <Button 
            variant="hero" 
            className="flex-1 h-12 text-sm font-bold rounded-lg uppercase tracking-wider"
            onClick={add}
          >
            {t("product.actions.buyNow")}
          </Button>
        </div>
      </div>
    </div>
  );
}