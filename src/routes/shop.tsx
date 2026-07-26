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
import { Reveal } from "@/components/site/Reveal";
import { allColors, categories, products } from "@/lib/products";
import { formatMAD } from "@/lib/brand";

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
        content: "Full-grain leather goods handmade in Marrakech. Cash on Delivery across Morocco.",
      },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

const MAX_PRICE = 800;

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const [query, setQuery] = useState(search.q ?? "");
  const [price, setPrice] = useState<number[]>([MAX_PRICE]);
  const [colors, setColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

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

  const filters = (
    <div className="space-y-8">
      <div>
        <h3 className="eyebrow">Category</h3>
        <div className="mt-3 flex flex-col gap-1">
          {[{ slug: "all", name: "All pieces" }, ...categories].map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() =>
                navigate({
                  search: (prev) => ({ ...prev, category: c.slug === "all" ? undefined : c.slug }),
                })
              }
              className={`min-h-11 rounded-lg px-3 text-left text-sm transition-colors ${
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
        <h3 className="eyebrow">Max price</h3>
        <Slider
          value={price}
          onValueChange={setPrice}
          min={100}
          max={MAX_PRICE}
          step={10}
          className="mt-5"
          aria-label="Maximum price"
        />
        <p className="mt-3 text-sm text-muted-foreground">Up to {formatMAD(price[0])}</p>
      </div>

      <div>
        <h3 className="eyebrow">Colour</h3>
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
              {color}
            </label>
          ))}
        </div>
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-secondary">
        <Checkbox checked={inStockOnly} onCheckedChange={(c) => setInStockOnly(Boolean(c))} />
        In stock only
      </label>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setPrice([MAX_PRICE]);
          setColors([]);
          setInStockOnly(false);
          setQuery("");
          navigate({ search: {} });
        }}
      >
        <X className="h-4 w-4" /> Clear filters
      </Button>
    </div>
  );

  return (
    <>
      <PageHero
        eyebrow="The Collection"
        title="Shop"
        intro="Every piece below is cut, stitched and finished by hand in our Marrakech workshop. Pay cash on delivery, anywhere in Morocco."
      />

      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28">{filters}</div>
          </aside>

          <div className="min-w-0">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
              <div className="relative min-w-0">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  maxLength={80}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search the collection"
                  aria-label="Search products"
                  className="h-11 pl-9 sm:w-72"
                />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden" aria-label="Filters">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85vw] max-w-xs overflow-y-auto">
                    <SheetTitle className="font-display text-xl">Filters</SheetTitle>
                    <div className="mt-6">{filters}</div>
                  </SheetContent>
                </Sheet>
                <Select
                  value={sort}
                  onValueChange={(value) =>
                    navigate({
                      search: (prev) => ({
                        ...prev,
                        sort: value === "featured" ? undefined : (value as never),
                      }),
                    })
                  }
                >
                  <SelectTrigger className="h-11 w-[9.5rem]" aria-label="Sort products">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="best">Best selling</SelectItem>
                    <SelectItem value="price-asc">Price: low to high</SelectItem>
                    <SelectItem value="price-desc">Price: high to low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? "piece" : "pieces"}
            </p>

            {results.length === 0 ? (
              <div className="mt-16 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
                <SearchIcon className="h-7 w-7 text-muted-foreground" />
                <div>
                  <p className="font-display text-lg">Nothing matches those filters</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try widening the price range or clearing the colour selection.
                  </p>
                </div>
                <Button
                  variant="hero"
                  onClick={() => {
                    setPrice([MAX_PRICE]);
                    setColors([]);
                    setInStockOnly(false);
                    setQuery("");
                    navigate({ search: {} });
                  }}
                >
                  Clear filters
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
      <Label className="sr-only">Shop filters</Label>
    </>
  );
}