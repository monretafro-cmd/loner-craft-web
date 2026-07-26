import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
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
import { formatMAD, whatsappLink, productOrderMessage } from "@/lib/brand";
import { faqs, getProduct, categoryName, relatedProducts } from "@/lib/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

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
    const title = `${p.name} — Handmade Leather | Loner Leather`;
    const description = `${p.short} ${p.leather}. ${formatMAD(p.price)} with Cash on Delivery across Morocco.`;
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
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: p.rating,
              reviewCount: p.reviews,
            },
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
  const { addLine, setCartOpen, toggleWish, wishlist, pushRecent, recent } = useStore();
  const [image, setImage] = useState(0);
  const [color, setColor] = useState(product.colors[0]);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setImage(0);
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

  const add = () => {
    addLine(
      {
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0],
        color,
      },
      qty,
    );
    setCartOpen(true);
    toast.success(`${product.name} added to your bag`);
  };

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-10">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" search={{ category: product.category }} className="hover:text-foreground">
            {categoryName(product.category)}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div>
            <div
              className="relative aspect-square overflow-hidden rounded-2xl bg-secondary"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setZoom({
                  x: ((e.clientX - r.left) / r.width) * 100,
                  y: ((e.clientY - r.top) / r.height) * 100,
                });
              }}
              onMouseLeave={() => setZoom(null)}
            >
              <img
                src={product.images[image]}
                alt={`${product.name} — view ${image + 1}`}
                width={1200}
                height={1200}
                className="h-full w-full object-cover transition-transform duration-300 ease-out"
                style={
                  zoom
                    ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                    : undefined
                }
              />
              <span className="glass pointer-events-none absolute bottom-3 left-3 rounded-md px-2.5 py-1 text-[0.65rem] tracking-wide uppercase max-lg:hidden">
                Hover to zoom
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "aspect-square overflow-hidden rounded-lg border-2 transition-colors",
                    image === i ? "border-primary" : "border-transparent hover:border-border",
                  )}
                >
                  <img
                    src={img}
                    alt=""
                    width={1200}
                    height={1200}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow">{categoryName(product.category)}</p>
            <h1 className="font-display mt-2 text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < Math.round(product.rating) ? "fill-accent text-accent" : "text-border",
                    )}
                  />
                ))}
                <span className="ml-1 text-foreground">{product.rating}</span>
              </span>
              <span>{product.reviews} reviews</span>
              <span>{product.sold.toLocaleString("fr-MA")} sold</span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-3xl font-semibold">{formatMAD(product.price)}</span>
              {product.compareAt && (
                <span className="text-base text-muted-foreground line-through">
                  {formatMAD(product.compareAt)}
                </span>
              )}
            </div>

            <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">{product.short}</p>

            <dl className="mt-6 grid gap-x-6 gap-y-3 border-y border-border py-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="eyebrow">Leather</dt>
                <dd className="mt-1">{product.leather}</dd>
              </div>
              <div>
                <dt className="eyebrow">Dimensions</dt>
                <dd className="mt-1">{product.dimensions}</dd>
              </div>
              <div>
                <dt className="eyebrow">Availability</dt>
                <dd className={cn("mt-1", product.inStock ? "text-foreground" : "text-destructive")}>
                  {product.inStock ? "In stock — ships in 24–48h" : "Sold out — back in 2 weeks"}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Made in</dt>
                <dd className="mt-1">Taroudant, Morocco</dd>
              </div>
            </dl>

            <div className="mt-6">
              <p className="eyebrow">Colour — {color}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "min-h-11 rounded-lg border px-4 text-sm transition-colors",
                      color === c
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-lg border border-border">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-12 w-12 place-items-center rounded-l-lg hover:bg-secondary"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center tabular-nums">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  className="grid h-12 w-12 place-items-center rounded-r-lg hover:bg-secondary"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Add to wishlist"
                className="h-12 w-12 border border-border"
                onClick={() => {
                  const added = toggleWish(product.slug);
                  toast[added ? "success" : "message"](
                    added ? "Saved to wishlist" : "Removed from wishlist",
                  );
                }}
              >
                <Heart className={cn("h-4 w-4", wished && "fill-accent text-accent")} />
              </Button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Button variant="hero" size="xl" disabled={!product.inStock} onClick={add}>
                <ShoppingBag className="h-4 w-4" />
                {product.inStock ? "Order Now" : "Sold out"}
              </Button>
              <Button variant="whatsapp" size="xl" asChild>
                <a
                  href={whatsappLink(
                    productOrderMessage({ product: product.name, color, quantity: qty }),
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp Order
                </a>
              </Button>
            </div>

            <div className="mt-5 grid gap-2.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 shrink-0 text-accent" />
                Free delivery over 500 MAD · 2–4 days nationwide
              </p>
              <p className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
                Cash on Delivery — inspect the piece before you pay
              </p>
            </div>

            <Accordion type="single" collapsible className="mt-8 w-full">
              <AccordionItem value="description">
                <AccordionTrigger className="font-display text-base">Description</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger className="font-display text-base">Shipping & Returns</AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    Dispatched from Taroudant within 24–48 hours. Delivery is 24–48h in Casablanca,
                    Rabat and Taroudant, and 2–4 working days elsewhere in Morocco.
                  </p>
                  <p>
                    Delivery is 35 MAD, free above 500 MAD. Exchanges accepted within 14 days on
                    unused pieces in their original box.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq">
                <AccordionTrigger className="font-display text-base">FAQ</AccordionTrigger>
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
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <Reveal>
          <p className="eyebrow">You may also like</p>
          <h2 className="font-display mt-2 text-3xl">Related pieces</h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
          {relatedProducts(product).map((p, i) => (
            <Reveal key={p.slug} delay={i * 70}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24">
          <h2 className="font-display text-2xl">Recently viewed</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
            {recentlyViewed.map((p) => p && <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}
    </>
  );
}