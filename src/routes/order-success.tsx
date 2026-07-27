import { LogoMark } from "@/components/site/Logo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useCatalog } from "@/lib/i18n/catalog";
import { useWhatsapp } from "@/lib/i18n/whatsapp";

type Search = { order?: string; total?: number };

export const Route = createFileRoute("/order-success")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    order: typeof search.order === "string" ? search.order : undefined,
    total: Number.isFinite(Number(search.total)) ? Number(search.total) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Order Confirmed — Loner Leather" },
      {
        name: "description",
        content:
          "Your Loner Leather order is confirmed. We'll call to verify, then dispatch from Taroudant within 24–48 hours.",
      },
      { property: "og:title", content: "Order Confirmed — Loner Leather" },
      { property: "og:description", content: "Your handmade leather order is on its way." },
      { name: "robots", content: "noindex" },
      { property: "og:url", content: "/order-success" },
    ],
    links: [{ rel: "canonical", href: "/order-success" }],
  }),
  component: OrderSuccess,
});

const STEP_KEYS = ["received", "call", "delivery"] as const;
const STEP_ICONS = { received: Check, call: Package, delivery: Truck };

function OrderSuccess() {
  const { order, total } = Route.useSearch();
  const { t } = useI18n();
  const { price } = useCatalog();
  const { orderLink } = useWhatsapp();

  return (
    <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-6 lg:py-28">
      <LogoMark className="mx-auto mb-10 h-14 opacity-90" />
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/15 text-accent">
        <Check className="h-8 w-8" />
      </span>
      <h1 className="font-display mt-6 text-4xl leading-tight sm:text-5xl">{t("checkout.orderSuccess.title")}</h1>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
        {t("checkout.orderSuccess.text")}
      </p>

      <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-[18px] border border-border bg-card px-8 py-6 text-start shadow-soft">
        <div>
          <p className="eyebrow">{t("checkout.orderSuccess.orderNumber")}</p>
          <p className="font-display mt-1 text-lg">{order ?? t("checkout.orderSuccess.fallbackOrder")}</p>
        </div>
        {total !== undefined && (
          <div>
            <p className="eyebrow">{t("checkout.orderSuccess.amountDue")}</p>
            <p className="font-display mt-1 text-lg">{price(total)}</p>
          </div>
        )}
      </div>

      <ol className="mt-12 grid gap-5 text-start sm:grid-cols-3">
        {STEP_KEYS.map((key) => {
          const Icon = STEP_ICONS[key];
          return (
            <li key={key} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <Icon className="h-5 w-5 text-accent" />
              <p className="font-display mt-3 text-base">{t(`checkout.orderSuccess.steps.${key}.title`)}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {t(`checkout.orderSuccess.steps.${key}.text`)}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button variant="hero" size="lg" asChild>
          <Link to="/shop">{t("checkout.orderSuccess.continueShopping")}</Link>
        </Button>
        <Button variant="whatsapp" size="lg" asChild>
          <a
            href={orderLink({ note: t("checkout.orderSuccess.whatsappNote", { order: order ?? "" }) })}
            target="_blank"
            rel="noreferrer"
          >
            {t("checkout.orderSuccess.askOrder")}
          </a>
        </Button>
      </div>
    </section>
  );
}
