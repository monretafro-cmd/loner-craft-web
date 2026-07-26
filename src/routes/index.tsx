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
import { BRAND, whatsappLink, productOrderMessage } from "@/lib/brand";
import { products, categories, faqs, testimonials } from "@/lib/products";
import hero from "@/assets/hero.jpg";
import craft from "@/assets/craft.jpg";
import packaging from "@/assets/packaging.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Loner Leather — Handmade Moroccan Leather Goods" },
      {
        name: "description",
        content:
          "Hand-stitched full-grain leather wallets, card holders and custom pieces made in Marrakech. Cash on Delivery, free shipping over 500 MAD.",
      },
      { property: "og:title", content: "Loner Leather — Handmade Moroccan Leather Goods" },
      {
        property: "og:description",
        content: "Full-grain leather, saddle-stitched by hand in Marrakech. Cash on Delivery across Morocco.",
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
  { icon: MapPin, title: "Made In Morocco", text: "A small workshop in the Marrakech medina." },
];

function Index() {
  const featured = products.filter((p) => p.bestSeller || p.isNew).slice(0, 4);
  const newest = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);
  const best = [...products].sort((a, b) => b.sold - a.sold).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={hero}
          alt="Artisan hand-stitching a leather wallet in a sunlit Marrakech workshop"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/92 via-ink/70 to-ink/25" />
        <div className="relative mx-auto flex min-h-[78svh] max-w-[1400px] flex-col justify-center px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <div className="max-w-2xl animate-fade-up">
            <p className="text-[0.7rem] font-medium tracking-[0.28em] text-accent uppercase">
              Marrakech · Est. 2016
            </p>
            <h1 className="font-display mt-5 text-[2.6rem] leading-[1.03] text-ink-foreground sm:text-6xl lg:text-7xl">
              Handmade Leather
              <br />
              That Lasts For Years.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-foreground/75 sm:text-lg">
              Crafted by hand in Morocco using genuine full-grain leather. One maker, one piece, no
              shortcuts.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="xl" variant="gold" asChild>
                <Link to="/shop">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="xl"
                asChild
                className="border border-ink-foreground/30 bg-transparent text-ink-foreground hover:-translate-y-0.5 hover:bg-ink-foreground/10"
              >
                <a
                  href={whatsappLink(productOrderMessage({ product: "" }))}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp Order
                </a>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-foreground/60">
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" /> 4.9 from 640+ Moroccan
                customers
              </span>
              <span>Free delivery over 500 MAD</span>
            </div>
          </div>
        </div>
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
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <img
              src={craft}
              alt="Moroccan leather craftsman marking a hide in his workshop"
              width={1408}
              height={1600}
              loading="lazy"
              className="aspect-4/5 w-full rounded-2xl object-cover shadow-lift"
            />
          </Reveal>
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

      {/* Packaging */}
      <section className="bg-secondary/40 py-16 lg:py-24">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <Reveal>
            <p className="eyebrow">Packaging</p>
            <h2 className="font-display mt-3 text-3xl leading-tight sm:text-4xl">
              It arrives ready to be given.
            </h2>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">
              Every order ships in a rigid kraft box lined with cream tissue, a cotton dust bag
              stamped with our monogram, a leather-care card and a handwritten thank-you note. No
              plastic, nothing to throw away.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
              {["Rigid gift box", "Cotton dust bag", "Care card & certificate of origin", "Free gift wrap on request"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <img
              src={packaging}
              alt="Loner Leather gift box with dust bag, care card and a brown leather wallet"
              width={1600}
              height={1200}
              loading="lazy"
              className="aspect-4/3 w-full rounded-2xl object-cover shadow-lift"
            />
          </Reveal>
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

      {/* Instagram */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <Reveal className="text-center">
          <p className="eyebrow">@lonerleather</p>
          <h2 className="font-display mt-2 text-3xl sm:text-4xl">From the workshop floor</h2>
        </Reveal>
        <div className="mt-9 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
          {[...products, ...products].slice(0, 6).map((p, i) => (
            <Reveal key={`${p.slug}-${i}`} delay={i * 50}>
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noreferrer"
                className="group block aspect-square overflow-hidden rounded-lg bg-secondary"
              >
                <img
                  src={p.images[i % p.images.length]}
                  alt={`Loner Leather on Instagram — ${p.name}`}
                  width={1200}
                  height={1200}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                />
              </a>
            </Reveal>
          ))}
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
