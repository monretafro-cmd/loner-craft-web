import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { ProductCard } from "@/components/site/ProductCard";
import { useI18n } from "@/lib/i18n";
import { getProduct } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — Loner Leather" },
      {
        name: "description",
        content:
          "The handmade Moroccan leather pieces you've saved for later. Order any of them with Cash on Delivery.",
      },
      { property: "og:title", content: "Your Wishlist — Loner Leather" },
      { property: "og:description", content: "Handmade leather pieces you've saved for later." },
      { property: "og:url", content: "/wishlist" },
    ],
    links: [{ rel: "canonical", href: "/wishlist" }],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist } = useStore();
  const { t } = useI18n();
  const items = wishlist.map(getProduct).filter((p) => p !== undefined);

  return (
    <>
      <PageHero
        eyebrow={t("shop.wishlist.eyebrow")}
        title={t("shop.wishlist.title")}
        intro={t("shop.wishlist.intro")}
      />
      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        {items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
            <Heart className="mx-auto h-8 w-8 text-accent" />
            <h2 className="font-display mt-4 text-2xl">{t("shop.wishlist.emptyTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("shop.wishlist.emptyText")}</p>
            <Button variant="hero" size="lg" className="mt-6" asChild>
              <Link to="/shop">{t("shop.wishlist.browse")}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
