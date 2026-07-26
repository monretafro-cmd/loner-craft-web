import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHero } from "@/components/site/PageHero";
import { whatsappLink } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track Your Order — Loner Leather Delivery Status" },
      {
        name: "description",
        content:
          "Enter your Loner Leather order number to see where your handmade leather piece is between Marrakech and your door.",
      },
      { property: "og:title", content: "Track Your Order — Loner Leather" },
      { property: "og:description", content: "Check the delivery status of your handmade leather order." },
      { property: "og:url", content: "/track-order" },
    ],
    links: [{ rel: "canonical", href: "/track-order" }],
  }),
  component: TrackOrderPage,
});

const STAGES = [
  { title: "Order confirmed", text: "We received your order and called to verify the address." },
  { title: "In the workshop", text: "Your piece is being finished, buffed and boxed in Marrakech." },
  { title: "Handed to courier", text: "Collected by our delivery partner and on the road." },
  { title: "Out for delivery", text: "Arriving today — have the cash amount ready for the courier." },
];

function TrackOrderPage() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<{ order: string; stage: number } | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Delivery"
        title="Track Your Order"
        intro="Your order number looks like LL-482910 and is in your confirmation message."
      />

      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:py-20">
        <form
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-7 shadow-soft sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            const value = code.trim().toUpperCase();
            if (!/^LL-\d{6}$/.test(value)) {
              toast.error("Order numbers look like LL-482910.");
              return;
            }
            setLoading(true);
            window.setTimeout(() => {
              const stage = (Number(value.slice(3)) % 4) + 1;
              setStatus({ order: value, stage });
              setLoading(false);
            }, 600);
          }}
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="order">Order number</Label>
            <Input
              id="order"
              value={code}
              maxLength={12}
              onChange={(e) => setCode(e.target.value)}
              placeholder="LL-482910"
            />
          </div>
          <Button variant="hero" size="lg" type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Track
          </Button>
        </form>

        {status && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-7 shadow-soft">
            <p className="eyebrow">Order {status.order}</p>
            <h2 className="font-display mt-2 text-2xl">{STAGES[status.stage - 1].title}</h2>
            <ol className="mt-7 space-y-6">
              {STAGES.map((s, i) => {
                const done = i < status.stage;
                return (
                  <li key={s.title} className="flex gap-4">
                    {done ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    ) : (
                      <Circle className="mt-0.5 h-5 w-5 shrink-0 text-border" />
                    )}
                    <div>
                      <p className={cn("text-sm font-medium", !done && "text-muted-foreground")}>
                        {s.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Can't find your number?{" "}
          <a
            href={whatsappLink("Hello, I'd like to track my Loner Leather order.")}
            target="_blank"
            rel="noreferrer"
            className="story-link text-foreground"
          >
            Ask us on WhatsApp
          </a>
        </p>
      </section>
    </>
  );
}