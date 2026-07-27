import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useCatalog } from "@/lib/i18n/catalog";
import type { Product } from "@/lib/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addLine, setCartOpen, toggleWish, wishlist } = useStore();
  const { t } = useI18n();
  const { productText, price } = useCatalog();
  const text = productText(product);
  const wished = wishlist.includes(product.slug);

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative overflow-hidden rounded-xl bg-secondary">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="block aspect-square"
          aria-label={text.name}
        >
          <img
            src={product.images[0]}
            alt={text.name}
            width={1200}
            height={1200}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
          />
        </Link>

        <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-md bg-accent px-2 py-1 text-[0.6rem] font-semibold tracking-[0.14em] text-accent-foreground uppercase">
              {t("badges.new")}
            </span>
          )}
          {product.bestSeller && (
            <span className="rounded-md bg-ink px-2 py-1 text-[0.6rem] font-semibold tracking-[0.14em] text-ink-foreground uppercase">
              {t("badges.bestSeller")}
            </span>
          )}
          {!product.inStock && (
            <span className="rounded-md bg-muted px-2 py-1 text-[0.6rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {t("badges.soldOut")}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            const added = toggleWish(product.slug);
            toast[added ? "success" : "message"](
              added ? t("toast.wishAdded") : t("toast.wishRemoved"),
            );
          }}
          aria-label={wished ? t("toast.wishRemoved") : t("toast.wishAdded")}
          className="glass absolute top-3 right-3 grid h-11 w-11 place-items-center rounded-full transition-transform duration-300 hover:scale-105"
        >
          <Heart className={cn("h-4 w-4", wished && "fill-accent text-accent")} />
        </button>

        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 max-sm:translate-y-0 max-sm:opacity-100">
          <Button
            variant="hero"
            className="w-full"
            disabled={!product.inStock}
            onClick={() => {
              addLine({
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0],
                color: product.colors[0],
              });
              setCartOpen(true);
              toast.success(t("cart.added", { name: text.name }));
            }}
          >
            <ShoppingBag className="h-4 w-4" />
            {product.inStock ? t("actions.addToBag") : t("badges.soldOut")}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="font-display text-lg leading-snug">
          <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-primary">
            {text.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{text.short}</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-base font-semibold">{price(product.price)}</span>
          {product.compareAt && (
            <span className="text-sm text-muted-foreground line-through">
              {price(product.compareAt)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}