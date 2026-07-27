import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHero } from "@/components/site/PageHero";
import { useI18n } from "@/lib/i18n";
import { useWhatsapp } from "@/lib/i18n/whatsapp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track Your Order — Loner Leather Delivery Status" },
      {
        name: "description",
        content:
          "Enter your Loner Leather order number to see where your handmade leather piece is between Taroudant and your door.",
      },
      { property: "og:title", content: "Track Your Order — Loner Leather" },
      { property: "og:description", content: "Check the delivery status of your handmade leather order." },
      { property: "og:url", content: "/track-order" },
    ],
    links: [{ rel: "canonical", href: "/track-order" }],
  }),
  component: TrackOrderPage,
});

type Stage = { title: string; text: string };

function TrackOrderPage() {
  const { t, tList } = useI18n();
  const { askLink } = useWhatsapp();
  const STAGES = tList<Stage>("pages.track.stages");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<{ order: string; stage: number } | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <PageHero
        eyebrow={t("pages.track.hero.eyebrow")}
        title={t("pages.track.hero.title")}
        intro={t("pages.track.hero.intro")}
      />

      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:py-20">
        <form
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-7 shadow-soft sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            const value = code.trim().toUpperCase();
            if (!/^LL-\d{6}$/.test(value)) {
              toast.error(t("pages.track.invalid"));
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
            <Label htmlFor="order">{t("pages.track.label")}</Label>
            <Input
              id="order"
              value={code}
              maxLength={12}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("pages.track.placeholder")}
            />
          </div>
          <Button variant="hero" size="lg" type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("pages.track.submit")}
          </Button>
        </form>

        {status && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-7 shadow-soft">
            <p className="eyebrow">{t("pages.track.orderPrefix", { order: status.order })}</p>
            <h2 className="font-display mt-2 text-2xl">{STAGES[status.stage - 1]?.title}</h2>
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
          {t("pages.track.cantFind")}{" "}
          <a
            href={askLink()}
            target="_blank"
            rel="noreferrer"
            className="story-link text-foreground"
          >
            {t("pages.track.askWhatsapp")}
          </a>
        </p>
      </section>
    </>
  );
}
