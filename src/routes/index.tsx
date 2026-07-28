import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BadgeCheck, Banknote, Hammer, MapPin, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/site/Reveal";
import { useI18n } from "@/lib/i18n";
import { useCatalog } from "@/lib/i18n/catalog";
import { useWhatsapp } from "@/lib/i18n/whatsapp";
import { products } from "@/lib/products";
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

const WHY_ICONS = [Hammer, BadgeCheck, Truck, Banknote, MapPin];

const featuredProduct = products[0];

function Index() {
  const { t, tList, isRTL } = useI18n();
  const { productName, testimonials, faqs } = useCatalog();
  const { orderLink, askLink } = useWhatsapp();

  const ForwardArrow = isRTL ? ArrowLeft : ArrowRight;

  const heroTrust = tList<string>("home.hero.trust");
  const featuredFeatures = tList<string>("home.featured.features");
  const packagingFeatures = tList<string>("home.packaging.features");
  const craftParagraphs = tList<string>("home.craft.paragraphs");
  const whyItems = tList<{ title: string; text: string }>("home.why.items");
  const featuredName = productName(featuredProduct);

  return (
    <>
      {/* Hero */}
      <section className="leather-grain relative w-full overflow-hidden bg-background">
        <div className="relative mx-auto flex max-w-[1440px] flex-col gap-10 px-5 py-14 sm:px-6 lg:min-h-[680px] lg:flex-row lg:items-center lg:gap-0 lg:px-12 lg:py-0 xl:min-h-[720px] xl:px-16">
          <div className="animate-hero-in relative z-10 max-w-[620px] lg:w-[44%] lg:shrink-0 lg:py-24">
            <p className="eyebrow">{t("home.hero.eyebrow")}</p>
            <h1 className="font-display mt-4 text-[2.125rem] leading-[1.15] md:text-[2.75rem] lg:text-[3.5rem] lg:leading-[1.05] 2xl:text-[4rem]">
              {t("home.hero.title")}
            </h1>
            <p className="mt-5 max-w-[620px] text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("home.hero.subtitle")}
            </p>
            <div
              className="animate-fade-up mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
              style={{ animationDelay: "260ms" }}
            >
              <Button size="xl" className="w-full min-h-11 sm:w-auto" asChild>
                <Link to="/shop">
                  {t("actions.shopNow")} <ForwardArrow className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="w-full min-h-11 border-foreground/20 bg-white text-foreground hover:bg-white sm:w-auto"
                asChild
              >
                <a
                  href={orderLink({ product: featuredName })}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("actions.orderWhatsapp")}
                </a>
              </Button>
            </div>
            <ul
              className="animate-fade-up mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs tracking-wide text-muted-foreground uppercase"
              style={{ animationDelay: "380ms" }}
            >
              {heroTrust.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-slide-from-right relative lg:absolute lg:inset-y-0 lg:end-0 lg:w-[60%] xl:-me-[4vw] xl:w-[62%]">
            <BrandPhoto
              photo={PHOTOS.walletWrappedThankYou}
              priority
              className="hero-image-fade aspect-4/3 h-auto w-full rounded-[18px] object-cover object-center sm:aspect-video lg:aspect-auto lg:h-full lg:rounded-none"
            />
          </div>
        </div>
      </section>

      {/* Featured product */}
      <section className="border-y border-border bg-cream">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-20">
          {PHOTOS.walletOpenCards.src ? (
            <Reveal>
              <BrandPhoto
                photo={PHOTOS.walletOpenCards}
                className="aspect-4/3 w-full rounded-2xl bg-background"
              />
            </Reveal>
          ) : null}
          <Reveal delay={100}>
            <p className="eyebrow">{t("home.featured.eyebrow")}</p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl">{t("home.featured.title")}</h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
              {t("home.featured.description")}
            </p>
            <ul className="mt-6 grid gap-2.5 text-sm sm:grid-cols-2">
              {featuredFeatures.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="w-full min-h-11 sm:w-auto" asChild>
                <Link to="/shop">{t("home.featured.viewProduct")}</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full min-h-11 sm:w-auto" asChild>
                <a
                  href={orderLink({ product: featuredName })}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("home.featured.orderNow")}
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Packaging */}
      <section className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-20">
        <Reveal>
          <p className="eyebrow">{t("home.packaging.eyebrow")}</p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl">{t("home.packaging.title")}</h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
            {t("home.packaging.description")}
          </p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            {packagingFeatures.map((f) => (
              <div key={f} className="rounded-xl border border-border bg-card p-4 text-sm">
                <BadgeCheck className="h-4 w-4 text-primary" />
                <p className="mt-2 font-medium">{f}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="aspect-4/3 w-full overflow-hidden rounded-2xl bg-secondary">
            <BrandPhoto photo={PHOTOS.packagingBox} className="h-full w-full" />
          </div>
        </Reveal>
      </section>

      {/* Craftsmanship */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal delay={120}>
            <p className="eyebrow">{t("home.craft.eyebrow")}</p>
            <h2 className="font-display mt-3 text-3xl leading-tight sm:text-4xl lg:text-5xl">
              {t("home.craft.title")}
            </h2>
            <div className="mt-6 space-y-4 text-[0.95rem] leading-relaxed text-muted-foreground">
              {craftParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <Button variant="hero" size="lg" className="mt-8" asChild>
              <Link to="/our-craft">
                {t("home.craft.cta")} <ForwardArrow className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-ink py-16 text-ink-foreground lg:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <Reveal>
            <p className="text-[0.7rem] tracking-[0.22em] text-accent uppercase">{t("home.why.eyebrow")}</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">{t("home.why.title")}</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {whyItems.map((item, i) => {
              const Icon = WHY_ICONS[i] ?? Hammer;
              return (
                <Reveal key={item.title} delay={i * 70}>
                  <div className="h-full rounded-xl border border-ink-foreground/12 p-6 transition-colors duration-500 hover:border-accent/60">
                    <Icon className="h-6 w-6 text-accent" />
                    <h3 className="font-display mt-4 text-lg">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-foreground/65">{item.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary/40 py-16 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <Reveal>
            <p className="eyebrow">{t("home.testimonials.eyebrow")}</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">{t("home.testimonials.title")}</h2>
          </Reveal>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {testimonials.map((tItem, i) => (
              <Reveal key={tItem.name} delay={i * 90}>
                <figure className="h-full rounded-xl border border-border bg-card p-7 shadow-soft">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                  <blockquote className="font-display mt-5 text-lg leading-snug">
                    &ldquo;{tItem.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 text-sm text-muted-foreground">
                    {tItem.name} · {tItem.city}
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
            <p className="eyebrow">{t("home.faq.eyebrow")}</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">{t("home.faq.title")}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {t("home.faq.text")}
            </p>
            <Button variant="whatsapp" size="lg" className="mt-6" asChild>
              <a href={askLink()} target="_blank" rel="noreferrer">
                {t("home.faq.ask")}
              </a>
            </Button>
          </Reveal>
          <Reveal delay={100}>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-start font-display text-base">{f.q}</AccordionTrigger>
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
