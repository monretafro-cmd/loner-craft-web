import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Banknote, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMAD, whatsappLink } from "@/lib/brand";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Cash on Delivery Across Morocco | Loner Leather" },
      {
        name: "description",
        content:
          "Complete your Loner Leather order with Cash on Delivery. No card needed — inspect your handmade piece before you pay the courier.",
      },
      { property: "og:title", content: "Checkout — Loner Leather" },
      { property: "og:description", content: "Cash on Delivery checkout for handmade Moroccan leather goods." },
      { name: "robots", content: "noindex" },
      { property: "og:url", content: "/checkout" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: CheckoutPage,
});

const CITIES = [
  "Casablanca",
  "Rabat",
  "Taroudant",
  "Tangier",
  "Fès",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Essaouira",
  "Other",
];

const schema = z.object({
  fullName: z.string().trim().min(3, "Please enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+212|0)[5-7]\d{8}$/, "Enter a valid Moroccan number, e.g. 0612345678"),
  email: z.union([z.string().trim().email("Enter a valid email").max(160), z.literal("")]),
  city: z.string().trim().min(2, "Select your city"),
  address: z.string().trim().min(8, "Please give a full street address").max(240),
  notes: z.string().trim().max(500).optional(),
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { lines, subtotal, discount, shipping, total, coupon, clearCart } = useStore();
  const [city, setCity] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);

  if (lines.length === 0) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl">Your bag is empty</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Add a piece to your bag and it will show up here, ready for Cash on Delivery.
        </p>
        <Button variant="hero" size="lg" className="mt-8" asChild>
          <Link to="/shop">Browse the collection</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      <p className="eyebrow">Secure checkout</p>
      <h1 className="font-display mt-2 text-4xl leading-tight sm:text-5xl">Checkout</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Cash on Delivery only. We call to confirm every order before it leaves the workshop.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const data = { ...Object.fromEntries(new FormData(e.currentTarget)), city };
            const parsed = schema.safeParse(data);
            if (!parsed.success) {
              const next: Record<string, string> = {};
              for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
              setErrors(next);
              toast.error("Please check the highlighted fields.");
              return;
            }
            setErrors({});
            setPlacing(true);
            const order = `LL-${Math.floor(100000 + Math.random() * 900000)}`;
            const amount = total;
            window.setTimeout(() => {
              clearCart();
              toast.success("Order placed — we'll call you shortly.");
              navigate({ to: "/order-success", search: { order, total: amount } });
            }, 700);
          }}
          className="space-y-8"
        >
          <fieldset className="rounded-2xl border border-border bg-card p-7 shadow-soft">
            <legend className="font-display px-2 text-xl">Delivery details</legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field id="fullName" label="Full name" error={errors.fullName}>
                <Input id="fullName" name="fullName" maxLength={80} placeholder="Yassine Bennani" autoComplete="name" />
              </Field>
              <Field id="phone" label="Phone number" error={errors.phone}>
                <Input id="phone" name="phone" inputMode="tel" placeholder="0612345678" autoComplete="tel" />
              </Field>
              <Field id="email" label="Email (optional)" error={errors.email}>
                <Input id="email" name="email" type="email" maxLength={160} placeholder="you@email.com" autoComplete="email" />
              </Field>
              <Field id="city" label="City" error={errors.city}>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger id="city" className="w-full">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="mt-5 grid gap-5">
              <Field id="address" label="Street address" error={errors.address}>
                <Textarea id="address" name="address" rows={3} maxLength={240} placeholder="Building, street, neighbourhood, landmark…" />
              </Field>
              <Field id="notes" label="Order notes (optional)" error={errors.notes}>
                <Textarea id="notes" name="notes" rows={3} maxLength={500} placeholder="Engraving initials, gift wrapping, delivery timing…" />
              </Field>
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-border bg-card p-7 shadow-soft">
            <legend className="font-display px-2 text-xl">Payment</legend>
            <div className="mt-5 flex items-start gap-4 rounded-xl border border-accent/40 bg-accent/8 p-5">
              <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-medium">Cash on Delivery</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Pay the courier in cash when your parcel arrives. Open the box, check the stitching
                  and the colour, then hand over the money. It's the only payment method we offer.
                </p>
              </div>
            </div>
          </fieldset>

          <Button variant="hero" size="xl" type="submit" className="w-full" disabled={placing}>
            <Lock className="h-4 w-4" />
            {placing ? "Placing your order…" : `Place order · ${formatMAD(total)}`}
          </Button>
          <Button variant="whatsapp" size="lg" className="w-full" asChild>
            <a
              href={whatsappLink(
                `Hello Loner Leather, I'd like to order:\n${lines
                  .map((l) => `• ${l.name} (${l.color}) x${l.qty}`)
                  .join("\n")}\nTotal: ${formatMAD(total)}`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              Prefer WhatsApp? Send this order
            </a>
          </Button>
        </form>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-border bg-secondary/40 p-7">
            <h2 className="font-display text-xl">Order summary</h2>
            <ul className="mt-5 space-y-4">
              {lines.map((l) => (
                <li key={`${l.slug}-${l.color}`} className="flex gap-4">
                  <img
                    src={l.image}
                    alt={l.name}
                    width={160}
                    height={160}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.color} · Qty {l.qty}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums">{formatMAD(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm">
              <Row label="Subtotal" value={formatMAD(subtotal)} />
              {discount > 0 && (
                <Row label={`Discount (${coupon})`} value={`− ${formatMAD(discount)}`} />
              )}
              <Row label="Delivery" value={shipping === 0 ? "Free" : formatMAD(shipping)} />
              <div className="flex items-baseline justify-between border-t border-border pt-4">
                <dt className="font-display text-lg">Total</dt>
                <dd className="font-display text-lg">{formatMAD(total)}</dd>
              </div>
            </dl>

            <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Inspect before you pay
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-3.5 w-3.5 text-accent" /> 14-day exchange on unused pieces
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}