import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, Search as SearchIcon, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHero } from "@/components/site/PageHero";
import { ProductCard } from "@/components/site/ProductCard";
import { ComingSoonCard, ShowcaseCard } from "@/components/site/ShowcaseCard";
import { Reveal } from "@/components/site/Reveal";
import { useI18n } from "@/lib/i18n";
import { useCatalog } from "@/lib/i18n/catalog";
import { allColors, categories, products } from "@/lib/products";

const searchSchema = z.object({
  category: z.string().optional(),
  sort: z.enum(["featured", "newest", "best", "price-asc", "price-desc"]).optional(),
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
          "Browse hand-stitched wallets, card holders, passport holders, money clips and key holders. Prices in MAD with Cash on Delivery in Morocco.",
      },
      { property: "og:title", content: "Shop Handmade Leather Goods — Loner Leather" },
      {
        property: "og:description",
        content: "Full-grain leather goods handmade in Taroudant. Cash on Delivery across Morocco.",
      },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

const MAX_PRICE = 800;
/** Below this many products the marketplace chrome (sidebar, search, sort, counter) stays hidden. */
const MARKETPLACE_THRESHOLD = 6;

const UPCOMING = ["cardHolder", "passportHolder", "moneyClip"] as const;

function ShopShowcase() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
      <div className="flex justify-center">
        <Reveal>
          <ShowcaseCard product={products[0]} />
        </Reveal>
      </div>

      <div className="mt-20 border-t border-border pt-14 lg:mt-24 lg:pt-16">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">{t("shop.showcase.comingSoonEyebrow")}</p>
            <h2 className="font-display mt-3 text-3xl leading-tight sm:text-4xl">
              {t("shop.showcase.comingSoonTitle")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {t("shop.showcase.comingSoonIntro")}
            </p>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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
    </div>
  );
}

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { t, isRTL } = useI18n();
  const { categoryName, colorName, price: formatPrice } = useCatalog();
  const [query, setQuery] = useState(search.q ?? "");
  const [price, setPrice] = useState<number[]>([MAX_PRICE]);
  const [colors, setColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const isMarketplace = products.length >= MARKETPLACE_THRESHOLD;

  const activeCategory = search.category ?? "all";
  const sort = search.sort ?? "featured";

  const results = useMemo(() => {
    let list = products.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory) return false;
      if (p.price > price[0]) return false;
      if (colors.length && !p.colors.some((c) => colors.includes(c))) return false;
      if (inStockOnly && !p.inStock) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!`${p.name} ${p.short} ${p.category}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    list = [...list];
    if (sort === "newest") list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "best") list.sort((a, b) => b.sold - a.sold);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [activeCategory, price, colors, inStockOnly, query, sort]);

  const resetFilters = () => {
    setPrice([MAX_PRICE]);
    setColors([]);
    setInStockOnly(false);
    setQuery("");
    navigate({ search: {} });
  };

  const filters = (
    <div className="space-y-8">
      <div>
        <h3 className="eyebrow">{t("shop.filters.category")}</h3>
        <div className="mt-3 flex flex-col gap-1">
          {[{ slug: "all", name: t("shop.filters.allPieces") }, ...categories.map((c) => ({ slug: c.slug, name: categoryName(c.slug) }))].map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() =>
                navigate({
                  search: { ...search, category: c.slug === "all" ? undefined : c.slug },
                })
              }
              className={`min-h-11 rounded-lg px-3 text-start text-sm transition-colors ${
                activeCategory === c.slug
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="eyebrow">{t("shop.filters.maxPrice")}</h3>
        <Slider
          value={price}
          onValueChange={setPrice}
          min={100}
          max={MAX_PRICE}
          step={10}
          className="mt-5"
          aria-label={t("shop.filters.maxPriceLabel")}
        />
        <p className="mt-3 text-sm text-muted-foreground">
          {t("shop.filters.upTo", { amount: formatPrice(price[0]) })}
        </p>
      </div>

      <div>
        <h3 className="eyebrow">{t("shop.filters.colour")}</h3>
        <div className="mt-3 space-y-1">
          {allColors.map((color) => (
            <label
              key={color}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-secondary"
            >
              <Checkbox
                checked={colors.includes(color)}
                onCheckedChange={(checked) =>
                  setColors((prev) => (checked ? [...prev, color] : prev.filter((c) => c !== color)))
                }
              />
              {colorName(color)}
            </label>
          ))}
        </div>
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-secondary">
        <Checkbox checked={inStockOnly} onCheckedChange={(c) => setInStockOnly(Boolean(c))} />
        {t("shop.filters.inStockOnly")}
      </label>

      <Button variant="outline" className="w-full" onClick={resetFilters}>
        <X className="h-4 w-4" /> {t("shop.filters.clear")}
      </Button>
    </div>
  );

  return (
    <>
      <PageHero
        eyebrow={t("shop.hero.eyebrow")}
        title={t("shop.hero.title")}
        intro={isMarketplace ? t("shop.hero.intro") : t("shop.hero.introShort")}
      />

      {!isMarketplace && <ShopShowcase />}

      {isMarketplace && (
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28">{filters}</div>
          </aside>

          <div className="min-w-0">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
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
              <div className="flex shrink-0 items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden" aria-label={t("shop.filters.openFilters")}>
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side={isRTL ? "right" : "left"} className="w-[85vw] max-w-xs overflow-y-auto">
                    <SheetTitle className="font-display text-xl">{t("shop.filters.title")}</SheetTitle>
                    <div className="mt-6">{filters}</div>
                  </SheetContent>
                </Sheet>
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
                  <SelectTrigger className="h-11 w-[9.5rem]" aria-label={t("shop.toolbar.sortLabel")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">{t("shop.toolbar.sort.featured")}</SelectItem>
                    <SelectItem value="newest">{t("shop.toolbar.sort.newest")}</SelectItem>
                    <SelectItem value="best">{t("shop.toolbar.sort.best")}</SelectItem>
                    <SelectItem value="price-asc">{t("shop.toolbar.sort.priceAsc")}</SelectItem>
                    <SelectItem value="price-desc">{t("shop.toolbar.sort.priceDesc")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {t(results.length === 1 ? "shop.results.count_one" : "shop.results.count_other", {
                count: results.length,
              })}
            </p>

            {results.length === 0 ? (
              <div className="mt-16 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
                <SearchIcon className="h-7 w-7 text-muted-foreground" />
                <div>
                  <p className="font-display text-lg">{t("shop.empty.title")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t("shop.empty.text")}</p>
                </div>
                <Button variant="hero" onClick={resetFilters}>
                  {t("shop.empty.cta")}
                </Button>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-5 sm:gap-6 xl:grid-cols-3">
                {results.map((p, i) => (
                  <Reveal key={p.slug} delay={Math.min(i, 5) * 60}>
                    <ProductCard product={p} priority={i < 3} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}
      <Label className="sr-only">{t("shop.sr.shopFilters")}</Label>
    </>
  );
}
