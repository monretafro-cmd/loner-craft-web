import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { categories, products } from "@/lib/products";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Leather Categories — Wallets, Card Holders & More | Loner Leather" },
      {
        name: "description",
        content:
          "Explore Loner Leather categories: wallets, card holders, passport holders, money clips, key holders and custom handmade leather pieces.",
      },
      { property: "og:title", content: "Leather Categories — Loner Leather" },
      {
        property: "og:description",
        content: "Six families of handmade Moroccan leather goods, all made to last.",
      },
      { property: "og:url", content: "/categories" },
    ],
    links: [{ rel: "canonical", href: "/categories" }],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Browse"
        title="Categories"
        intro="Six families of leather goods, each made from the same full-grain hides and finished by the same hands."
      />
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => {
            const count = products.filter((p) => p.category === cat.slug).length;
            return (
              <Reveal key={cat.slug} delay={i * 70}>
                <Link
                  to="/shop"
                  search={{ category: cat.slug }}
                  className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow duration-500 hover:shadow-lift"
                >
                  <div className="aspect-4/3 overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      width={1200}
                      height={1200}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-107"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-display text-xl">{cat.name}</h2>
                      <span className="text-xs text-muted-foreground">
                        {count} {count === 1 ? "piece" : "pieces"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{cat.blurb}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary">
                      Shop {cat.name}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </>
  );
}