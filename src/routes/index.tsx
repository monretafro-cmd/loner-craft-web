import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Banknote, Hammer, MapPin, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { whatsappLink, productOrderMessage } from "@/lib/brand";
import { products, categories, faqs, testimonials } from "@/lib/products";
import { BrandPhoto } from "@/components/site/BrandPhoto";
import { PHOTOS } from "@/lib/photos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Loner Leather — Handmade Moroccan Leather Goods" },
      {
        name: "description",
        content:
          "Hand-stitched full-grain leather wallets, card holders and custom pieces made in Taroudant. Cash on Delivery, free shipping over 500 MAD.",
      },
      { property: "og:title", content: "Loner Leather — Handmade Moroccan Leather Goods" },
      {
        property: "og:description",
        content: "Hand-stitched full-grain leather wallets, card holders and custom pieces made in Taroudant. Cash on Delivery, free shipping over 500 MAD.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const WHY = [
  { icon: Hammer, title: "100% Handmade", text: "Cut, stitched and burnished by one maker, start to finish." },
  { icon: BadgeCheck, title: "Premium Genuine Leather", text: "Full-grain hides, vegetable-tanned in Morocco." },
  { icon: Truck, title: "Fast Shipping", text: "Dispatched in 24–48h, delivered anywhere in Morocco." },
  { icon: Banknote, title: "Cash On Delivery", text: "Pay the courier in cash. Nothing upfront, ever." },
  { icon: MapPin, title: "Made In Morocco", text: "A small workshop in the Taroudant medina." },
];

function Index() {
  const featured = products.filter((p) => p.bestSeller || p.isNew).slice(0, 4);
  const newest = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);
  const best = [...products].sort((a, b) => b.sold - a.sold).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="bg-background">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-20">
          <div className="animate-fade-up max-w-[650px]">
            <p className="eyebrow">Handmade in Taroudant</p>
            <h1 className="font-display mt-4 text-[2.25rem] leading-[1.1] md:text-[3rem] lg:text-[4rem] lg:leading-[1.05]">
              Handmade Leather Wallets, Made to Last.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Genuine leather wallets, stitched by hand and packed with care in Taroudant, Morocco.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button size="xl" className="w-full min-h-11 sm:w-auto" asChild>
                <Link to="/shop">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="w-full min-h-11 sm:w-auto" asChild>
                <a
                  href={whatsappLink(productOrderMessage({ product: "Loner Leather Wallet" }))}
                  target="_blank"
                  rel="noreferrer"
                >
                  Order on WhatsApp
                </a>
              </Button>
            </div>
            <p className="mt-8 text-xs tracking-wide text-muted-foreground">
              Cash on Delivery • Delivery Across Morocco • Handmade in Taroudant
            </p>
          </div>

          <div className="rounded-2xl bg-secondary p-4 sm:p-6">
            <BrandPhoto
              photo={PHOTOS.heroPackaged}
              priority
              className="aspect-4/3 w-full rounded-xl"
              imgClassName="object-contain"
            />
          </div>
        </div>
      </section>

      {/* Featured product */}
      <section className="border-y border-border bg-cream">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-20">
          <Reveal>
            <BrandPhoto
              photo={PHOTOS.walletOpen}
              className="aspect-4/3 w-full rounded-2xl bg-background"
              imgClassName="object-contain"
            />
          </Reveal>
          <Reveal delay={100}>
            <p className="eyebrow">The Product</p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl">The Loner Leather Wallet</h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
              A slim handmade wallet with multiple card slots, a cash compartment, genuine leather,
              and white hand stitching.
            </p>
            <ul className="mt-6 grid gap-2.5 text-sm sm:grid-cols-2">
              {[
                "Genuine leather",
                "Handmade stitching",
                "Multiple card slots",
                "Cash compartment",
                "Slim everyday design",
                "Made in Taroudant",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="w-full min-h-11 sm:w-auto" asChild>
                <Link to="/shop">View Product</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full min-h-11 sm:w-auto" asChild>
                <a
                  href={whatsappLink(productOrderMessage({ product: "The Loner Leather Wallet" }))}
                  target="_blank"
                  rel="noreferrer"
                >
                  Order Now
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Packaging */}
      <section className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-20">
        <Reveal>
          <p className="eyebrow">Packaging</p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl">Packed by Hand</h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
            Every wallet is wrapped with burlap fabric, natural rope, a thank-you card, and Loner
            Leather branding.
          </p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            {["Hand-packed", "Gift-ready", "Brand card included", "Cash on Delivery"].map((f) => (
              <div key={f} className="rounded-xl border border-border bg-card p-4 text-sm">
                <BadgeCheck className="h-4 w-4 text-primary" />
                <p className="mt-2 font-medium">{f}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={100}>
          <BrandPhoto
            photo={PHOTOS.packagingBox}
            className="aspect-4/3 w-full rounded-2xl bg-secondary"
            imgClassName="object-contain"
          />
        </Reveal>
      </section>

      {/* Categories strip */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The Collection</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">Shop by category</h2>
          </div>
          <Link
            to="/categories"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            View all categories
          </Link>
        </Reveal>
        <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat, i) => (
            <Reveal key={cat.slug} delay={i * 60}>
              <Link
                to="/shop"
                search={{ category: cat.slug }}
                className="group block overflow-hidden rounded-xl bg-secondary"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    width={1200}
                    height={1200}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                  />
                </div>
                <p className="px-3 py-3 text-center text-sm font-medium">{cat.name}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-secondary/40 py-16 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <Reveal>
            <p className="eyebrow">Featured</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">Pieces we're proud of</h2>
          </Reveal>
          <div className="mt-9 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <ProductCard product={p} priority={i < 2} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal delay={120}>
            <p className="eyebrow">Our Craft</p>
            <h2 className="font-display mt-3 text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Forty-one steps. Two hands. No machines.
            </h2>
            <div className="mt-6 space-y-4 text-[0.95rem] leading-relaxed text-muted-foreground">
              <p>
                Every Loner piece begins as a full hide, tanned with oak bark and pomegranate in a
                tannery three streets from our workshop. We choose the panels ourselves, rejecting
                anything with a scar we can't stand behind.
              </p>
              <p>
                The leather is cut with a round knife, skived at the folds, then saddle-stitched with
                waxed linen thread — a stitch that will not unravel even if a thread breaks. Edges
                are bevelled, sanded, wet-slicked and waxed four times.
              </p>
              <p>
                A wallet takes six hours. It leaves the bench only when the maker who started it
                signs off on it.
              </p>
            </div>
            <Button variant="hero" size="lg" className="mt-8" asChild>
              <Link to="/our-craft">
                Read the full story <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-ink py-16 text-ink-foreground lg:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <Reveal>
            <p className="text-[0.7rem] tracking-[0.22em] text-accent uppercase">Why Loner Leather</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">Five reasons customers stay</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {WHY.map((item, i) => (
              <Reveal key={item.title} delay={i * 70}>
                <div className="h-full rounded-xl border border-ink-foreground/12 p-6 transition-colors duration-500 hover:border-accent/60">
                  <item.icon className="h-6 w-6 text-accent" />
                  <h3 className="font-display mt-4 text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-foreground/65">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* New collection */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Just Released</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">The new collection</h2>
          </div>
          <Link to="/shop" search={{ sort: "newest" }} className="text-sm text-primary underline-offset-4 hover:underline">
            See everything new
          </Link>
        </Reveal>
        <div className="mt-9 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-3">
          {newest.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <Reveal>
          <p className="eyebrow">Best Sellers</p>
          <h2 className="font-display mt-2 text-3xl sm:text-4xl">What Morocco is carrying</h2>
        </Reveal>
        <div className="mt-9 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
          {best.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary/40 py-16 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <Reveal>
            <p className="eyebrow">Testimonials</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">In their own words</h2>
          </Reveal>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 90}>
                <figure className="h-full rounded-xl border border-border bg-card p-7 shadow-soft">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                  <blockquote className="font-display mt-5 text-lg leading-snug">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 text-sm text-muted-foreground">
                    {t.name} · {t.city}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary/40 py-16 lg:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <Reveal>
            <p className="eyebrow">Questions</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">Before you order</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Still unsure? Message us on WhatsApp — we usually reply within the hour.
            </p>
            <Button variant="whatsapp" size="lg" className="mt-6" asChild>
              <a href={whatsappLink("Hello, I have a question about your leather goods.")} target="_blank" rel="noreferrer">
                Ask on WhatsApp
              </a>
            </Button>
          </Reveal>
          <Reveal delay={100}>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left font-display text-base">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>
    </>
  );
}
