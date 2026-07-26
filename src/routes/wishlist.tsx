import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { ProductCard } from "@/components/site/ProductCard";
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
  const items = wishlist.map(getProduct).filter((p) => p !== undefined);

  return (
    <>
      <PageHero
        eyebrow="Saved pieces"
        title="Your Wishlist"
        intro="Keep an eye on the pieces you love. Nothing is reserved until you order."
      />
      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        {items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
            <Heart className="mx-auto h-8 w-8 text-accent" />
            <h2 className="font-display mt-4 text-2xl">Nothing saved yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tap the heart on any piece to keep it here for later.
            </p>
            <Button variant="hero" size="lg" className="mt-6" asChild>
              <Link to="/shop">Browse the collection</Link>
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