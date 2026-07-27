import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { BRAND } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { useCatalog } from "@/lib/i18n/catalog";
import { useStore } from "@/lib/store";

export function CartDrawer() {
  const {
    lines,
    cartOpen,
    setCartOpen,
    setQty,
    removeLine,
    subtotal,
    discount,
    shipping,
    total,
    coupon,
    applyCoupon,
  } = useStore();
  const [code, setCode] = useState("");
  const { t } = useI18n();
  const { price: formatMAD, colorName } = useCatalog();

  const remaining = Math.max(0, BRAND.freeShippingFrom - subtotal);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <SheetTitle className="font-display text-xl">{t("cart.title")}</SheetTitle>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-lg">{t("cart.empty")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("cart.emptyHint")}
              </p>
            </div>
            <Button variant="hero" asChild onClick={() => setCartOpen(false)}>
              <Link to="/shop">{t("actions.browseCollection")}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-border px-5 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="h-4 w-4 shrink-0" />
                {remaining > 0 ? (
                  <span>
                    {t("cart.freeDeliveryProgress", { amount: formatMAD(remaining) })}
                  </span>
                ) : (
                  <span className="text-foreground">{t("cart.freeDeliveryUnlocked")}</span>
                )}
              </div>
              <Progress
                value={Math.min(100, (subtotal / BRAND.freeShippingFrom) * 100)}
                className="mt-2 h-1.5"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {lines.map((line) => (
                  <li key={`${line.slug}-${line.color}`} className="flex gap-3">
                    <img
                      src={line.image}
                      alt={line.name}
                      width={1200}
                      height={1200}
                      loading="lazy"
                      className="h-24 w-20 shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{line.name}</p>
                          <p className="text-xs text-muted-foreground">{colorName(line.color)}</p>
                        </div>
                        <button
                          type="button"
                          aria-label={t("cart.remove", { name: line.name })}
                          onClick={() => removeLine(line.slug, line.color)}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="flex items-center rounded-lg border border-border">
                          <button
                            type="button"
                            aria-label={t("cart.decrease")}
                            onClick={() => setQty(line.slug, line.color, line.qty - 1)}
                            className="grid h-10 w-10 place-items-center rounded-l-lg hover:bg-secondary"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">{line.qty}</span>
                          <button
                            type="button"
                            aria-label={t("cart.increase")}
                            onClick={() => setQty(line.slug, line.color, line.qty + 1)}
                            className="grid h-10 w-10 place-items-center rounded-r-lg hover:bg-secondary"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="font-display text-sm font-semibold">
                          {formatMAD(line.price * line.qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <form
                className="mt-6 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const res = applyCoupon(code);
                  toast[res.ok ? "success" : "error"](res.message);
                  if (res.ok) setCode("");
                }}
              >
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t("cart.coupon")}
                  aria-label={t("cart.coupon")}
                  className="h-11"
                />
                <Button type="submit" variant="outline" className="shrink-0">
                  {t("actions.apply")}
                </Button>
              </form>
              {coupon && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("cart.couponApplied", { code: coupon })}
                </p>
              )}
            </div>

            <div className="space-y-3 border-t border-border px-5 py-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("cart.subtotal")}</dt>
                  <dd>{formatMAD(subtotal)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-accent">
                    <dt>{t("cart.discount")}</dt>
                    <dd>−{formatMAD(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("cart.delivery")}</dt>
                  <dd>{shipping === 0 ? t("cart.free") : formatMAD(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-display text-base font-semibold">
                  <dt>{t("cart.total")}</dt>
                  <dd>{formatMAD(total)}</dd>
                </div>
              </dl>
              <p className="text-xs text-muted-foreground">
                {t("cart.codNote")}
              </p>
              <Button variant="hero" size="lg" className="w-full" asChild onClick={() => setCartOpen(false)}>
                <Link to="/checkout">{t("actions.checkout")}</Link>
              </Button>
              <Button variant="quiet" className="w-full" onClick={() => setCartOpen(false)}>
                {t("actions.continueShopping")}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}