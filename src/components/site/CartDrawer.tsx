import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { BRAND, formatMAD } from "@/lib/brand";
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

  const remaining = Math.max(0, BRAND.freeShippingFrom - subtotal);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <SheetTitle className="font-display text-xl">Your Bag</SheetTitle>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-lg">Your bag is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pieces you add will appear here, ready for cash on delivery.
              </p>
            </div>
            <Button variant="hero" asChild onClick={() => setCartOpen(false)}>
              <Link to="/shop">Browse the collection</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-border px-5 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="h-4 w-4 shrink-0" />
                {remaining > 0 ? (
                  <span>
                    Add <strong className="text-foreground">{formatMAD(remaining)}</strong> for free
                    delivery
                  </span>
                ) : (
                  <span className="text-foreground">Free delivery unlocked</span>
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
                          <p className="text-xs text-muted-foreground">{line.color}</p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${line.name}`}
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
                            aria-label="Decrease quantity"
                            onClick={() => setQty(line.slug, line.color, line.qty - 1)}
                            className="grid h-10 w-10 place-items-center rounded-l-lg hover:bg-secondary"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">{line.qty}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
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
                  placeholder="Coupon code"
                  aria-label="Coupon code"
                  className="h-11"
                />
                <Button type="submit" variant="outline" className="shrink-0">
                  Apply
                </Button>
              </form>
              {coupon && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Coupon <strong className="text-foreground">{coupon}</strong> applied.
                </p>
              )}
            </div>

            <div className="space-y-3 border-t border-border px-5 py-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatMAD(subtotal)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-accent">
                    <dt>Discount</dt>
                    <dd>−{formatMAD(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd>{shipping === 0 ? "Free" : formatMAD(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-display text-base font-semibold">
                  <dt>Total</dt>
                  <dd>{formatMAD(total)}</dd>
                </div>
              </dl>
              <p className="text-xs text-muted-foreground">
                Pay in cash when the courier hands you the parcel.
              </p>
              <Button variant="hero" size="lg" className="w-full" asChild onClick={() => setCartOpen(false)}>
                <Link to="/checkout">Checkout · Cash on Delivery</Link>
              </Button>
              <Button variant="quiet" className="w-full" onClick={() => setCartOpen(false)}>
                Continue shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}