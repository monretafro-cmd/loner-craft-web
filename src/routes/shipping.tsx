import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Prose } from "@/components/site/PageHero";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping & Returns — Free Delivery Over 500 MAD | Loner Leather" },
      {
        name: "description",
        content:
          "Delivery times across Morocco, our 35 MAD flat rate, free shipping over 500 MAD, and how 14-day exchanges work on handmade leather goods.",
      },
      { property: "og:title", content: "Shipping & Returns — Loner Leather" },
      { property: "og:description", content: "Delivery times, rates and our 14-day exchange policy." },
      { property: "og:url", content: "/shipping" },
    ],
    links: [{ rel: "canonical", href: "/shipping" }],
  }),
  component: ShippingPage,
});

type Section = { title: string; body: string };

function ShippingPage() {
  const { t, tList } = useI18n();
  const sections = tList<Section>("pages.shipping.sections");

  return (
    <>
      <PageHero
        eyebrow={t("pages.shipping.hero.eyebrow")}
        title={t("pages.shipping.hero.title")}
        intro={t("pages.shipping.hero.intro")}
      />
      <Prose>
        {sections.map((s) => (
          <div key={s.title}>
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </div>
        ))}
      </Prose>
    </>
  );
}
