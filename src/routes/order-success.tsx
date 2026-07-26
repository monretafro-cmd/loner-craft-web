import { LogoMark } from "@/components/site/Logo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND, whatsappLink } from "@/lib/brand";

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

const STEPS = [
  { icon: Check, title: "Order received", text: "We've logged your order and reserved your piece." },
  { icon: Package, title: "Confirmation call", text: "A quick call within a few hours to confirm your address." },
  { icon: Truck, title: "Out for delivery", text: "24–48h in major cities, 2–4 days elsewhere. Pay the courier." },
];

function OrderSuccess() {
  const { order, total } = Route.useSearch();

  return (
    <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-6 lg:py-28">
      <LogoMark className="mx-auto mb-10 h-14 opacity-90" />
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/15 text-accent">
        <Check className="h-8 w-8" />
      </span>
      <h1 className="font-display mt-6 text-4xl leading-tight sm:text-5xl">Thank you — your order is confirmed</h1>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
        A maker in Taroudant is already wrapping your piece. You'll pay the courier in cash when it
        arrives — no card, no prepayment.
      </p>

      <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-[18px] border border-border bg-card px-8 py-6 text-left shadow-soft">
        <div>
          <p className="eyebrow">Order number</p>
          <p className="font-display mt-1 text-lg">{order ?? "LL-000000"}</p>
        </div>
        {total !== undefined && (
          <div>
            <p className="eyebrow">Amount due on delivery</p>
            <p className="font-display mt-1 text-lg">{total.toLocaleString("fr-MA")} MAD</p>
          </div>
        )}
      </div>

      <ol className="mt-12 grid gap-5 text-left sm:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <s.icon className="h-5 w-5 text-accent" />
            <p className="font-display mt-3 text-base">{s.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button variant="hero" size="lg" asChild>
          <Link to="/shop">Continue shopping</Link>
        </Button>
        <Button variant="whatsapp" size="lg" asChild>
          <a
            href={whatsappLink(`Hello ${BRAND.name}, I'd like an update on order ${order ?? ""}.`)}
            target="_blank"
            rel="noreferrer"
          >
            Ask about my order
          </a>
        </Button>
      </div>
    </section>
  );
}