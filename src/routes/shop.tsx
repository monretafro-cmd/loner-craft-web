import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  MessageCircle,
  Search as SearchIcon,
  Star,
  Truck,
  Wallet,
  Sparkles,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reveal } from "@/components/site/Reveal";
import { ComingSoonCard } from "@/components/site/ShowcaseCard";
import { ShopProductCard } from "@/components/site/shop/ShopProductCard";
import { useI18n } from "@/lib/i18n";
import { useWhatsapp } from "@/lib/i18n/whatsapp";
import { PHOTOS, galleryImages } from "@/lib/photos";
import {
  featuredOf,
  pick,
  useShopCatalog,
  useShopReviews,
  useShopSections,
  type ShopProduct,
  type ShopSections,
} from "@/lib/shop/data";

const searchSchema = z.object({
  category: z.string().optional(),
  sort: z.enum(["featured", "newest", "price-asc", "price-desc"]).optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop Handmade Leather Goods — Loner Leather" },
      {
        name: "description",
        content:
          "Browse handmade Moroccan leather wallets and accessories. Hand-stitched in Taroudant, delivered across Morocco with Cash on Delivery.",
      },
      { property: "og:title", content: "Shop Handmade Leather Goods — Loner Leather" },
      {
        property: "og:description",
        content: "Full-grain leather goods handmade in Taroudant. Cash on Delivery across Morocco.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

const MARKETPLACE_THRESHOLD = 6;
const UPCOMING = ["cardHolder", "passportHolder", "moneyClip"] as const;

const heroFallback =
  PHOTOS.walletOpenCards.src ?? PHOTOS.walletWrappedThankYou.src ?? galleryImages()[0] ?? "";
const packagingFallback = PHOTOS.packagingBox.src ?? heroFallback;
const craftFallback = PHOTOS.stitchingCloseUp.src ?? PHOTOS.leatherTexture.src ?? heroFallback;

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
  tone = "light",
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  center?: boolean;
  tone?: "light" | "dark";
}) {
  if (!title && !eyebrow) return null;
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <p
          className={`flex items-center gap-3 text-[0.68rem] font-medium uppercase tracking-[0.34em] ${
            center ? "justify-center" : ""
          } ${tone === "dark" ? "text-accent" : "text-primary"}`}
        >
          <span
            className={`h-px w-8 ${tone === "dark" ? "bg-accent/50" : "bg-primary/40"}`}
            aria-hidden="true"
          />
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className="font-display mt-4 text-[2rem] leading-[1.08] tracking-[-0.01em] sm:text-[2.6rem] lg:text-[3rem]">
          {title}
        </h2>
      )}
      {subtitle && (
        <p
          className={`mt-5 text-base leading-relaxed ${
            tone === "dark" ? "text-ink-foreground/70" : "text-muted-foreground"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Shell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>
  );
}

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { t, lang } = useI18n();
  const { orderLink } = useWhatsapp();
  const catalog = useShopCatalog();
  const sectionsQuery = useShopSections();
  const reviewsQuery = useShopReviews();
  const [query, setQuery] = useState(search.q ?? "");

  const products = catalog.data?.products ?? [];
  const categories = catalog.data?.categories ?? [];
  const sections: ShopSections = sectionsQuery.data ?? {};
  const reviews = reviewsQuery.data ?? [];
  const isMarketplace = products.length >= MARKETPLACE_THRESHOLD;

  const visible = (key: string) => sections[key]?.active !== false;
  const content = (key: string) => (sections[key]?.content ?? {}) as any;
  const text = (key: string, field: string, fallback = "") =>
    (pick<string>(content(key)[field], lang) ?? fallback) as string;

  const activeCategory = search.category ?? "all";
  const sort = search.sort ?? "featured";

  const results = useMemo(() => {
    let list = products.filter((p) => {
      if (activeCategory !== "all" && p.categorySlug !== activeCategory) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!`${p.name} ${p.short}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    list = [...list];
    if (sort === "newest") list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "featured") list.sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, activeCategory, query, sort]);

  const featured = featuredOf(products, 3);
  const hiddenCategories: string[] = content("shop_categories").hidden ?? [];
  const shownCategories = categories.filter((c) => !hiddenCategories.includes(c.slug));
  const heroImage = text("shop_hero", "image") || featured[0]?.images[0] || heroFallback;
  const waLink = orderLink({ product: featured[0]?.name ?? "" });

  const ordered = Object.entries(sections)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key]) => key);
  const order = ordered.length
    ? ordered
    : [
        "shop_featured",
        "shop_categories",
        "shop_collection",
        "shop_craft",
        "shop_packaging",
        "shop_delivery",
        "shop_reviews",
        "shop_faq",
        "shop_cta",
      ];

  const blocks: Record<string, React.ReactNode> = {
    shop_featured: featured.length ? (
      <section key="featured" className="py-16 lg:py-24">
        <Shell>
          <Reveal>
            <SectionHeading
              eyebrow={text("shop_featured", "eyebrow", "Selected")}
              title={text("shop_featured", "title", "Featured pieces")}
              subtitle={text("shop_featured", "subtitle")}
            />
          </Reveal>
          <div
            className={`mt-10 -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 ${
              featured.length === 1
                ? "sm:mx-auto sm:max-w-[420px] sm:grid-cols-1"
                : featured.length === 2
                  ? "sm:mx-auto sm:max-w-[880px] sm:grid-cols-2"
                  : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {featured.map((product, i) => (
              <div key={product.id} className="w-[82vw] shrink-0 snap-center sm:w-auto">
                <Reveal delay={i * 80}>
                  <ShopProductCard product={product} variant="featured" priority={i === 0} />
                </Reveal>
              </div>
            ))}
          </div>
        </Shell>
      </section>
    ) : null,

    shop_categories: shownCategories.length ? (
      <section key="categories" className="border-y border-border bg-secondary/40 py-16 lg:py-20">
        <Shell>
          <Reveal>
            <SectionHeading
              eyebrow={text("shop_categories", "eyebrow", "Browse")}
              title={text("shop_categories", "title", "Shop by category")}
            />
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shownCategories.map((category, i) => (
              <Reveal key={category.id} delay={i * 70}>
                <Link
                  to="/shop"
                  search={{ category: category.slug }}
                  className="group flex items-center gap-4 overflow-hidden rounded-[18px] border border-border bg-card p-3 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-34px_rgba(36,24,18,0.55)]"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-secondary">
                    <img
                      src={category.image ?? heroFallback}
                      alt={category.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display truncate text-xl">
                      {(lang === "fr" && category.nameFr) || (lang === "ar" && category.nameAr) || category.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {category.count} {t(category.count === 1 ? "shop.landing.piece" : "shop.landing.pieces")}
                    </p>
                  </div>
                  <ArrowRight className="ms-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
                </Link>
              </Reveal>
            ))}
          </div>
        </Shell>
      </section>
    ) : null,

    shop_collection: (
      <section key="collection" id="collection" className="py-16 lg:py-24">
        <Shell>
          <Reveal>
            <SectionHeading
              eyebrow={text("shop_collection", "eyebrow", "All pieces")}
              title={text("shop_collection", "title", "The full collection")}
              subtitle={text("shop_collection", "subtitle")}
            />
          </Reveal>

          {isMarketplace && (
            <div className="mt-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
              <div className="relative min-w-0">
                <SearchIcon className="pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  maxLength={80}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("shop.toolbar.searchPlaceholder")}
                  aria-label={t("shop.toolbar.searchLabel")}
                  className="h-11 ps-9 sm:w-72"
                />
              </div>
              <Select
                value={sort}
                onValueChange={(value) =>
                  navigate({
                    search: { ...search, sort: value === "featured" ? undefined : (value as never) },
                  })
                }
              >
                <SelectTrigger className="h-11 w-[180px] shrink-0" aria-label={t("shop.toolbar.sortLabel")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">{t("shop.toolbar.sort.featured")}</SelectItem>
                  <SelectItem value="newest">{t("shop.toolbar.sort.newest")}</SelectItem>
                  <SelectItem value="price-asc">{t("shop.toolbar.sort.priceAsc")}</SelectItem>
                  <SelectItem value="price-desc">{t("shop.toolbar.sort.priceDesc")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {shownCategories.length > 1 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {[{ slug: "all", name: t("shop.filters.allPieces") }, ...shownCategories].map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() =>
                    navigate({ search: { ...search, category: c.slug === "all" ? undefined : c.slug } })
                  }
                  className={`min-h-11 rounded-full border px-5 text-sm transition-colors ${
                    activeCategory === c.slug
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {results.length ? (
            <div
              className={`mt-10 grid gap-6 ${
                results.length === 1
                  ? "mx-auto max-w-[520px]"
                  : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {results.map((product, i) => (
                <Reveal key={product.id} delay={Math.min(i, 6) * 60}>
                  <ShopProductCard product={product} priority={i === 0} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[20px] border border-border bg-secondary/40 p-10 text-center">
              <p className="text-base text-muted-foreground">{t("shop.landing.empty")}</p>
              <Button asChild className="mt-6 min-h-11">
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> {t("shop.card.whatsapp")}
                </a>
              </Button>
            </div>
          )}

          {!isMarketplace && (
            <div className="mt-20 border-t border-border pt-14">
              <Reveal>
                <SectionHeading
                  eyebrow={t("shop.showcase.comingSoonEyebrow")}
                  title={t("shop.showcase.comingSoonTitle")}
                  subtitle={t("shop.showcase.comingSoonIntro")}
                />
              </Reveal>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {UPCOMING.map((key, i) => (
                  <Reveal key={key} delay={i * 80}>
                    <ComingSoonCard
                      title={t(`shop.showcase.upcoming.${key}.title`)}
                      blurb={t(`shop.showcase.upcoming.${key}.blurb`)}
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </Shell>
      </section>
    ),

    shop_craft: (
      <section key="craft" className="border-y border-border bg-secondary/40 py-16 lg:py-24">
        <Shell>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div className="overflow-hidden rounded-[24px] bg-secondary">
                <img
                  src={craftFallback}
                  alt={text("shop_craft", "title", "Our craft")}
                  loading="lazy"
                  className="aspect-[4/3] h-full w-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div>
                <SectionHeading
                  center={false}
                  eyebrow={text("shop_craft", "eyebrow", "Our craft")}
                  title={text("shop_craft", "title")}
                  subtitle={text("shop_craft", "body")}
                />
                <ul className="mt-6 space-y-3">
                  {((pick<string[]>(content("shop_craft").points, lang) ?? []) as string[]).map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </Shell>
      </section>
    ),

    shop_packaging: (
      <section key="packaging" className="py-16 lg:py-24">
        <Shell>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div>
                <SectionHeading
                  center={false}
                  eyebrow={text("shop_packaging", "eyebrow", "Packaging")}
                  title={text("shop_packaging", "title")}
                  subtitle={text("shop_packaging", "body")}
                />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="overflow-hidden rounded-[24px] bg-secondary">
                <img
                  src={packagingFallback}
                  alt={text("shop_packaging", "title", "Packaging")}
                  loading="lazy"
                  className="aspect-[4/3] h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </Shell>
      </section>
    ),

    shop_delivery: (
      <section key="delivery" className="border-y border-border bg-secondary/40 py-16 lg:py-20">
        <Shell>
          <Reveal>
            <SectionHeading
              eyebrow={text("shop_delivery", "eyebrow", "Delivery")}
              title={text("shop_delivery", "title", "Simple, safe delivery")}
            />
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {((pick<{ title: string; text: string }[]>(content("shop_delivery").items, lang) ?? []) as {
              title: string;
              text: string;
            }[]).map((item, i) => {
              const Icon = [Wallet, Truck, MessageCircle, Sparkles][i % 4];
              return (
                <Reveal key={item.title} delay={i * 70}>
                  <div className="h-full rounded-[18px] border border-border bg-card p-6">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-display mt-4 text-lg">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Shell>
      </section>
    ),

    shop_reviews: reviews.length ? (
      <section key="reviews" className="py-16 lg:py-24">
        <Shell>
          <Reveal>
            <SectionHeading
              eyebrow={text("shop_reviews", "eyebrow", "Reviews")}
              title={text("shop_reviews", "title", "What customers say")}
              subtitle={t("shop.landing.reviewsCount", { count: reviews.length })}
            />
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <Reveal key={review.id} delay={i * 70}>
                <figure className="h-full rounded-[18px] border border-border bg-card p-6">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${index < review.rating ? "fill-accent text-accent" : "text-border"}`}
                      />
                    ))}
                  </div>
                  {review.text && (
                    <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      “{review.text}”
                    </blockquote>
                  )}
                  <figcaption className="mt-4 text-sm font-medium">
                    {review.name}
                    {review.city ? <span className="text-muted-foreground"> — {review.city}</span> : null}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Shell>
      </section>
    ) : null,

    shop_faq: (() => {
      const items = (content("shop_faq").items ?? []) as { q: any; a: any }[];
      if (!items.length) return null;
      return (
        <section key="faq" className="border-y border-border bg-secondary/40 py-16 lg:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Reveal>
              <SectionHeading
                eyebrow={text("shop_faq", "eyebrow", "FAQ")}
                title={text("shop_faq", "title", "Questions before you order")}
              />
            </Reveal>
            <Accordion type="single" collapsible className="mt-8">
              {items.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-start font-display text-lg">
                    {pick<string>(item.q, lang)}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {pick<string>(item.a, lang)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      );
    })(),

    shop_cta: (
      <section key="cta" className="py-16 lg:py-24">
        <Shell>
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] bg-ink px-6 py-14 text-center text-ink-foreground sm:px-12 lg:py-20">
              <h2 className="font-display mx-auto max-w-3xl text-3xl leading-tight sm:text-4xl lg:text-5xl">
                {text("shop_cta", "title", "Order your handmade leather goods today")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed opacity-80">
                {text("shop_cta", "subtitle")}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" variant="secondary" className="min-h-12 w-full sm:w-auto">
                  <a href="#collection">{text("shop_cta", "primaryLabel", "Shop Collection")}</a>
                </Button>
                <Button asChild size="lg" className="min-h-12 w-full sm:w-auto">
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    {text("shop_cta", "secondaryLabel", "Order on WhatsApp")}
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>
        </Shell>
      </section>
    ),
  };

  return (
    <>
      {visible("shop_hero") && (
        <>
          <section className="relative isolate overflow-hidden bg-ink text-ink-foreground">
            <img
              src={heroImage}
              alt={text("shop_hero", "title", "Loner Leather collection")}
              width={2000}
              height={1200}
              fetchPriority="high"
              className="absolute inset-0 -z-20 h-full w-full scale-105 object-cover opacity-70"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(20,13,9,0.96),rgba(20,13,9,0.72)_45%,rgba(20,13,9,0.35))]"
            />
            <div
              aria-hidden="true"
              className="leather-grain pointer-events-none absolute inset-0 -z-10 opacity-40"
            />
            <Shell className="relative flex min-h-[78vh] flex-col justify-end py-20 sm:min-h-[82vh] lg:py-28">
              <div className="max-w-3xl">
                <p className="flex items-center gap-3 text-[0.68rem] font-medium uppercase tracking-[0.38em] text-accent">
                  <span className="h-px w-10 bg-accent/60" aria-hidden="true" />
                  {text("shop_hero", "eyebrow", "The Collection")}
                </p>
                <h1 className="font-display mt-6 text-[2.75rem] leading-[0.98] tracking-[-0.015em] sm:text-6xl lg:text-[4.5rem]">
                  {text("shop_hero", "title", t("shop.hero.title"))}
                </h1>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-foreground/75 sm:text-lg">
                  {text("shop_hero", "subtitle", t("shop.hero.intro"))}
                </p>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" variant="secondary" className="min-h-12 w-full sm:w-auto">
                    <a href="#collection">{text("shop_hero", "primaryLabel", "Browse Collection")}</a>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="min-h-12 w-full border-ink-foreground/40 bg-transparent text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground sm:w-auto"
                  >
                    <a href={waLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      {text("shop_hero", "secondaryLabel", "Order on WhatsApp")}
                    </a>
                  </Button>
                </div>
              </div>
            </Shell>
          </section>

          <section className="border-y border-border bg-secondary/50">
            <Shell className="grid grid-cols-2 divide-x divide-border/70 rtl:divide-x-reverse sm:grid-cols-4">
              {[
                { Icon: BadgeCheck, label: t("shop.landing.trust.handmade") },
                { Icon: Sparkles, label: t("shop.landing.trust.leather") },
                { Icon: Wallet, label: t("shop.landing.trust.cod") },
                { Icon: Truck, label: t("shop.landing.trust.shipping") },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center justify-center gap-2 px-3 py-5 text-center">
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground sm:text-xs">
                    {label}
                  </span>
                </div>
              ))}
            </Shell>
          </section>
        </>
      )}

      {order
        .filter((key) => key !== "shop_hero" && visible(key))
        .map((key) => blocks[key] ?? null)}
    </>
  );
}

export type { ShopProduct };