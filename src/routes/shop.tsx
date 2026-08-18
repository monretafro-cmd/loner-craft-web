import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  MessageCircle,
  Search as SearchIcon,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";
import { z } from "zod";
import heroWorkshop from "@/assets/hero.jpg";
import craftWorkshop from "@/assets/craft.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reveal } from "@/components/site/Reveal";
import { ShopProductCard } from "@/components/site/shop/ShopProductCard";
import { useI18n } from "@/lib/i18n";
import { useWhatsapp } from "@/lib/i18n/whatsapp";
import {
  pick,
  useShopCatalog,
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
          "Browse handmade Moroccan leather goods, crafted in Taroudant and delivered across Morocco.",
      },
      { property: "og:title", content: "Shop Handmade Leather Goods — Loner Leather" },
      {
        property: "og:description",
        content: "Handmade Moroccan leather goods, built slowly and made to last.",
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

const PAGE_COPY = {
  en: {
    collectionEyebrow: "The collection",
    collectionTitle: "Leather goods made for every day",
    collectionBody: "Small-batch essentials, cut and finished by hand in our Taroudant workshop.",
    craftEyebrow: "Made in Taroudant",
    craftTitle: "One pair of hands. A piece that lasts.",
    craftBody:
      "We work slowly with genuine Moroccan leather, shaping every edge and stitch with care. The result is a useful piece that gains character the more you carry it.",
    craftPoints: [
      "Genuine Moroccan leather",
      "Cut, stitched and finished by hand",
      "Made to develop a richer patina over time",
    ],
    serviceEyebrow: "Simple ordering",
    serviceTitle: "From our workshop to your door",
    services: [
      { title: "Cash on delivery", text: "Pay when your order arrives." },
      { title: "Morocco-wide shipping", text: "Reliable delivery across Morocco." },
      { title: "Direct assistance", text: "Order and ask questions on WhatsApp." },
    ],
    ctaTitle: "Ready to choose your Loner piece?",
    ctaBody: "See the collection or message us directly for availability.",
  },
  fr: {
    collectionEyebrow: "La collection",
    collectionTitle: "Des pièces en cuir pensées pour le quotidien",
    collectionBody:
      "Des essentiels en petite série, découpés et finis à la main dans notre atelier de Taroudant.",
    craftEyebrow: "Fabriqué à Taroudant",
    craftTitle: "Une paire de mains. Une pièce qui dure.",
    craftBody:
      "Nous travaillons lentement un cuir marocain véritable, en soignant chaque bord et chaque couture. Une pièce utile qui gagne en caractère avec le temps.",
    craftPoints: [
      "Cuir marocain véritable",
      "Découpé, cousu et fini à la main",
      "Une patine plus riche au fil du temps",
    ],
    serviceEyebrow: "Commande simple",
    serviceTitle: "De notre atelier jusqu’à votre porte",
    services: [
      { title: "Paiement à la livraison", text: "Payez lorsque votre commande arrive." },
      { title: "Livraison au Maroc", text: "Livraison fiable partout au Maroc." },
      { title: "Aide directe", text: "Commandez et posez vos questions sur WhatsApp." },
    ],
    ctaTitle: "Prêt à choisir votre pièce Loner ?",
    ctaBody: "Découvrez la collection ou contactez-nous pour connaître les disponibilités.",
  },
  ar: {
    collectionEyebrow: "المجموعة",
    collectionTitle: "قطع جلدية صُنعت للاستخدام اليومي",
    collectionBody: "قطع أساسية بكميات محدودة، تُقص وتُشطب يدوياً في ورشتنا بتارودانت.",
    craftEyebrow: "صُنع في تارودانت",
    craftTitle: "يد واحدة تصنع قطعة تدوم.",
    craftBody:
      "نعمل بتأنٍ على جلد مغربي أصلي، ونهتم بكل حافة وغرزة. والنتيجة قطعة عملية تزداد جمالاً مع الاستعمال.",
    craftPoints: ["جلد مغربي أصلي", "قص وخياطة وتشطيب يدوي", "تكتسب طابعاً أجمل مع مرور الوقت"],
    serviceEyebrow: "طلب بسيط",
    serviceTitle: "من ورشتنا إلى باب منزلك",
    services: [
      { title: "الدفع عند الاستلام", text: "تدفع عندما يصلك طلبك." },
      { title: "التوصيل داخل المغرب", text: "توصيل موثوق إلى مختلف مناطق المغرب." },
      { title: "مساعدة مباشرة", text: "اطلب واستفسر مباشرة عبر واتساب." },
    ],
    ctaTitle: "جاهز لاختيار قطعتك من لونر؟",
    ctaBody: "اكتشف المجموعة أو تواصل معنا مباشرة لمعرفة المتوفر.",
  },
} as const;

function Shell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={`flex items-center gap-3 text-[0.66rem] font-semibold uppercase tracking-[0.3em] ${
        dark ? "text-accent" : "text-primary"
      }`}
    >
      <span className={`h-px w-8 ${dark ? "bg-accent/60" : "bg-primary/45"}`} />
      {children}
    </p>
  );
}

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { t, lang } = useI18n();
  const { orderLink } = useWhatsapp();
  const catalog = useShopCatalog();
  const sectionsQuery = useShopSections();
  const [query, setQuery] = useState(search.q ?? "");

  const products = catalog.data?.products ?? [];
  const sections: ShopSections = sectionsQuery.data ?? {};
  const copy = PAGE_COPY[lang];
  const isMarketplace = products.length >= MARKETPLACE_THRESHOLD;
  const sort = search.sort ?? "featured";

  const content = (key: string) => (sections[key]?.content ?? {}) as any;
  const text = (key: string, field: string, fallback: string) =>
    (pick<string>(content(key)[field], lang) ?? fallback) as string;

  const results = useMemo(() => {
    let list = products.filter((product) => {
      if (!query.trim()) return true;
      const normalizedQuery = query.trim().toLowerCase();
      return `${product.name} ${product.short}`.toLowerCase().includes(normalizedQuery);
    });

    list = [...list];
    if (sort === "newest")
      list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "featured") list.sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, query, sort]);

  const waLink = orderLink({ product: products[0]?.name ?? "" });

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-ink-foreground">
        <img
          src={heroWorkshop}
          alt="Loner Leather artisan hand-stitching a leather wallet"
          width={2000}
          height={1200}
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[62%_center]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(20,13,9,0.94)_0%,rgba(20,13,9,0.75)_42%,rgba(20,13,9,0.3)_75%,rgba(20,13,9,0.5)_100%)]"
        />
        <div aria-hidden="true" className="leather-grain absolute inset-0 -z-10 opacity-25" />

        <Shell className="flex min-h-[68vh] items-end py-16 sm:min-h-[72vh] lg:py-20">
          <Reveal>
            <div className="max-w-2xl">
              <Eyebrow dark>{text("shop_hero", "eyebrow", "Handmade in Morocco")}</Eyebrow>
              <h1 className="font-display mt-5 text-[3rem] leading-[0.95] tracking-[-0.02em] sm:text-6xl lg:text-[4.6rem]">
                {text("shop_hero", "title", t("shop.hero.title"))}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-foreground/78 sm:text-lg">
                {text("shop_hero", "subtitle", t("shop.hero.intro"))}
              </p>
              <div className="mt-8 flex justify-start">
                <Button 
                  size="xl" 
                  className="w-full h-16 md:w-fit md:min-w-[240px] transition-transform hover:scale-[1.02] active:scale-[0.98]" 
                  asChild
                >
                  <Link to="/product/$slug" params={{ slug: "alpha-wallet" }}>
                    {t("actions.orderNow")}
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </Shell>
      </section>

      <section className="border-b border-border bg-card">
        <Shell className="grid grid-cols-3 divide-x divide-border/70 rtl:divide-x-reverse">
          {[
            { Icon: BadgeCheck, label: t("shop.landing.trust.handmade") },
            { Icon: Wallet, label: t("shop.landing.trust.cod") },
            { Icon: Truck, label: t("shop.landing.trust.shipping") },
          ].map(({ Icon, label }) => (
            <div
              key={label}
              className="flex min-h-16 items-center justify-center gap-2 px-2 py-3 text-center sm:min-h-20"
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-[0.62rem] uppercase tracking-[0.11em] text-muted-foreground sm:text-xs sm:tracking-[0.16em]">
                {label}
              </span>
            </div>
          ))}
        </Shell>
      </section>

      <section id="collection" className="py-16 sm:py-20 lg:py-24">
        <Shell>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow>{text("shop_collection", "eyebrow", copy.collectionEyebrow)}</Eyebrow>
              <h2 className="font-display mt-4 text-[2.3rem] leading-[1.05] sm:text-5xl">
                {text("shop_collection", "title", copy.collectionTitle)}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {text("shop_collection", "subtitle", copy.collectionBody)}
              </p>
            </div>
          </Reveal>

          {isMarketplace && (
            <div className="mx-auto mt-9 flex max-w-3xl flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <SearchIcon className="pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  maxLength={80}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("shop.toolbar.searchPlaceholder")}
                  aria-label={t("shop.toolbar.searchLabel")}
                  className="h-11 ps-9"
                />
              </div>
              <Select
                value={sort}
                onValueChange={(value) =>
                  navigate({
                    search: {
                      ...search,
                      sort: value === "featured" ? undefined : (value as never),
                    },
                  })
                }
              >
                <SelectTrigger
                  className="h-11 w-full shrink-0 sm:w-[190px]"
                  aria-label={t("shop.toolbar.sortLabel")}
                >
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

          {results.length ? (
            <div
              className={`mt-10 grid gap-6 ${
                results.length === 1
                  ? "mx-auto max-w-[430px]"
                  : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {results.map((product, index) => (
                <Reveal key={product.id} delay={Math.min(index, 6) * 60}>
                  <ShopProductCard
                    product={product}
                    priority={index === 0}
                    variant={results.length === 1 ? "featured" : "grid"}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-border bg-secondary/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">{t("shop.landing.empty")}</p>
              <Button asChild className="mt-5 min-h-11">
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  {t("shop.card.whatsapp")}
                </a>
              </Button>
            </div>
          )}
        </Shell>
      </section>

      <section className="overflow-hidden bg-ink text-ink-foreground">
        <Shell className="grid items-center gap-10 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:py-20">
          <Reveal>
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
              <img
                src={craftWorkshop}
                alt="Leather artisan working by hand in a Moroccan workshop"
                loading="lazy"
                width={1365}
                height={2048}
                className="aspect-[4/3] w-full object-cover object-[center_48%] lg:aspect-[4/4.2]"
              />
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="max-w-xl">
              <Eyebrow dark>{text("shop_craft", "eyebrow", copy.craftEyebrow)}</Eyebrow>
              <h2 className="font-display mt-5 text-[2.35rem] leading-[1.02] sm:text-5xl">
                {text("shop_craft", "title", copy.craftTitle)}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-foreground/70">
                {text("shop_craft", "body", copy.craftBody)}
              </p>
              <ul className="mt-7 divide-y divide-white/10 border-y border-white/10">
                {copy.craftPoints.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-3 py-4 text-sm text-ink-foreground/78"
                  >
                    <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </Shell>
      </section>

      <section className="border-b border-border bg-secondary/35 py-14 sm:py-16">
        <Shell>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow>{copy.serviceEyebrow}</Eyebrow>
              <h2 className="font-display mt-4 text-[2.1rem] leading-tight sm:text-4xl">
                {copy.serviceTitle}
              </h2>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {copy.services.map((item, index) => {
              const Icon = [Wallet, Truck, MessageCircle][index];
              return (
                <Reveal key={item.title} delay={index * 70}>
                  <div className="flex h-full gap-4 rounded-2xl border border-border bg-card p-5 sm:block sm:text-center">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-auto">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg sm:mt-3">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Shell>
      </section>

      <section className="py-14 sm:py-16 lg:py-20">
        <Shell>
          <Reveal>
            <div className="leather-grain relative isolate overflow-hidden rounded-[26px] bg-ink px-5 py-12 text-center text-ink-foreground sm:px-10 sm:py-14">
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--accent)_16%,transparent),transparent_70%)]"
              />
              <Sparkles className="mx-auto h-5 w-5 text-accent" />
              <h2 className="font-display mx-auto mt-4 max-w-2xl text-[2.15rem] leading-[1.04] sm:text-5xl">
                {text("shop_cta", "title", copy.ctaTitle)}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-foreground/70 sm:text-base">
                {text("shop_cta", "subtitle", copy.ctaBody)}
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="min-h-12 w-full md:w-fit tablet:min-w-[220px]">
                  <Link to="/product/$slug" params={{ slug: "alpha-wallet" }}>
                    {t("actions.commander")}
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </Shell>
      </section>
    </>
  );
}

export type { ShopProduct };
