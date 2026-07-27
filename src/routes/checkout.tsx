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
import { getProduct } from "@/lib/products";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { useCatalog } from "@/lib/i18n/catalog";
import { useWhatsapp } from "@/lib/i18n/whatsapp";

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

const CITY_VALUES = [
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
] as const;

const CITY_KEYS: Record<(typeof CITY_VALUES)[number], string> = {
  Casablanca: "casablanca",
  Rabat: "rabat",
  Taroudant: "taroudant",
  Tangier: "tangier",
  Fès: "fes",
  Agadir: "agadir",
  Meknès: "meknes",
  Oujda: "oujda",
  Kénitra: "kenitra",
  Tétouan: "tetouan",
  Essaouira: "essaouira",
  Other: "other",
};

function CheckoutPage() {
  const navigate = useNavigate();
  const { t, isRTL } = useI18n();
  const { price, productText, colorName } = useCatalog();
  const { orderLink } = useWhatsapp();
  const { lines, subtotal, discount, shipping, total, coupon, clearCart } = useStore();
  const [city, setCity] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);

  const schema = z.object({
    fullName: z.string().trim().min(3, t("checkout.errors.fullName")).max(80),
    phone: z
      .string()
      .trim()
      .regex(/^(?:\+212|0)[5-7]\d{8}$/, t("checkout.errors.phone")),
    email: z.union([z.string().trim().email(t("checkout.errors.email")).max(160), z.literal("")]),
    city: z.string().trim().min(2, t("checkout.errors.city")),
    address: z.string().trim().min(8, t("checkout.errors.address")).max(240),
    notes: z.string().trim().max(500).optional(),
  });

  if (lines.length === 0) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl">{t("checkout.empty.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("checkout.empty.text")}</p>
        <Button variant="hero" size="lg" className="mt-8" asChild>
          <Link to="/shop">{t("actions.browseCollection")}</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      <p className="eyebrow">{t("checkout.meta.eyebrow")}</p>
      <h1 className="font-display mt-2 text-4xl leading-tight sm:text-5xl">{t("checkout.meta.title")}</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t("checkout.meta.subtitle")}</p>

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
              toast.error(t("checkout.errors.toast"));
              return;
            }
            setErrors({});
            setPlacing(true);
            const order = `LL-${Math.floor(100000 + Math.random() * 900000)}`;
            const amount = total;
            window.setTimeout(() => {
              clearCart();
              toast.success(t("checkout.success.toast"));
              navigate({ to: "/order-success", search: { order, total: amount } });
            }, 700);
          }}
          className="space-y-8"
        >
          <fieldset className="rounded-2xl border border-border bg-card p-7 shadow-soft">
            <legend className="font-display px-2 text-xl">{t("checkout.delivery.legend")}</legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field id="fullName" label={t("checkout.delivery.fullName")} error={errors.fullName}>
                <Input
                  id="fullName"
                  name="fullName"
                  maxLength={80}
                  placeholder={t("checkout.delivery.fullNamePlaceholder")}
                  autoComplete="name"
                />
              </Field>
              <Field id="phone" label={t("checkout.delivery.phone")} error={errors.phone}>
                <Input
                  id="phone"
                  name="phone"
                  inputMode="tel"
                  placeholder={t("checkout.delivery.phonePlaceholder")}
                  autoComplete="tel"
                />
              </Field>
              <Field id="email" label={t("checkout.delivery.email")} error={errors.email}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  maxLength={160}
                  placeholder={t("checkout.delivery.emailPlaceholder")}
                  autoComplete="email"
                />
              </Field>
              <Field id="city" label={t("checkout.delivery.city")} error={errors.city}>
                <Select value={city} onValueChange={setCity} dir={isRTL ? "rtl" : "ltr"}>
                  <SelectTrigger id="city" className="w-full">
                    <SelectValue placeholder={t("checkout.delivery.cityPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {CITY_VALUES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {t(`checkout.cities.${CITY_KEYS[c]}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="mt-5 grid gap-5">
              <Field id="address" label={t("checkout.delivery.address")} error={errors.address}>
                <Textarea
                  id="address"
                  name="address"
                  rows={3}
                  maxLength={240}
                  placeholder={t("checkout.delivery.addressPlaceholder")}
                />
              </Field>
              <Field id="notes" label={t("checkout.delivery.notes")} error={errors.notes}>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  maxLength={500}
                  placeholder={t("checkout.delivery.notesPlaceholder")}
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-border bg-card p-7 shadow-soft">
            <legend className="font-display px-2 text-xl">{t("checkout.payment.legend")}</legend>
            <div className="mt-5 flex items-start gap-4 rounded-xl border border-accent/40 bg-accent/8 p-5">
              <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-medium">{t("checkout.payment.codTitle")}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t("checkout.payment.codText")}
                </p>
              </div>
            </div>
          </fieldset>

          <Button variant="hero" size="xl" type="submit" className="w-full" disabled={placing}>
            <Lock className="h-4 w-4" />
            {placing ? t("checkout.submit.placing") : t("checkout.submit.placeOrder", { price: price(total) })}
          </Button>
          <Button variant="whatsapp" size="lg" className="w-full" asChild>
            <a
              href={orderLink({
                name: undefined,
                product: lines
                  .map((l) => `${getProduct(l.slug) ? productText(getProduct(l.slug)!).name : l.name} (${colorName(l.color)}) x${l.qty}`)
                  .join(", "),
                note: `${t("checkout.summary.total")}: ${price(total)}`,
              })}
              target="_blank"
              rel="noreferrer"
            >
              {t("checkout.submit.whatsapp")}
            </a>
          </Button>
        </form>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-border bg-secondary/40 p-7">
            <h2 className="font-display text-xl">{t("checkout.summary.title")}</h2>
            <ul className="mt-5 space-y-4">
              {lines.map((l) => {
                const product = getProduct(l.slug);
                const name = product ? productText(product).name : l.name;
                return (
                  <li key={`${l.slug}-${l.color}`} className="flex gap-4">
                    <img
                      src={l.image}
                      alt={name}
                      width={160}
                      height={160}
                      loading="lazy"
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        {colorName(l.color)} · {t("checkout.summary.qty", { qty: l.qty })}
                      </p>
                    </div>
                    <span className="text-sm tabular-nums">{price(l.price * l.qty)}</span>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm">
              <Row label={t("checkout.summary.subtotal")} value={price(subtotal)} />
              {discount > 0 && (
                <Row
                  label={t("checkout.summary.discount", { coupon: coupon ?? "" })}
                  value={`− ${price(discount)}`}
                />
              )}
              <Row
                label={t("checkout.summary.delivery")}
                value={shipping === 0 ? t("checkout.summary.free") : price(shipping)}
              />
              <div className="flex items-baseline justify-between border-t border-border pt-4">
                <dt className="font-display text-lg">{t("checkout.summary.total")}</dt>
                <dd className="font-display text-lg">{price(total)}</dd>
              </div>
            </dl>

            <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" /> {t("checkout.summary.inspect")}
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-3.5 w-3.5 text-accent" /> {t("checkout.summary.exchange")}
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
