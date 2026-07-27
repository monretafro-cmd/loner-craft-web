import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { useI18n } from "@/lib/i18n";
import craft from "@/assets/craft.jpg";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/our-craft")({
  head: () => ({
    meta: [
      { title: "Our Craft — How We Make Leather Goods by Hand | Loner Leather" },
      {
        name: "description",
        content:
          "From vegetable-tanned hide to saddle stitch and burnished edge — the six stages behind every Loner Leather piece, made by hand in Taroudant.",
      },
      { property: "og:title", content: "Our Craft — Loner Leather" },
      {
        property: "og:description",
        content: "The six stages behind every hand-stitched Loner Leather piece.",
      },
      { property: "og:url", content: "/our-craft" },
    ],
    links: [{ rel: "canonical", href: "/our-craft" }],
  }),
  component: CraftPage,
});

function CraftPage() {
  const { t, tList } = useI18n();
  const steps = tList<{ n: string; title: string; text: string }>("pages.craft.steps");
  const careItems = tList<{ title: string; text: string }>("pages.craft.careItems");

  return (
    <>
      <PageHero
        eyebrow={t("pages.craft.hero.eyebrow")}
        title={t("pages.craft.hero.title")}
        intro={t("pages.craft.hero.intro")}
      />

      <section className="relative isolate overflow-hidden">
        <img
          src={hero}
          alt={t("pages.craft.heroImgAlt")}
          width={1920}
          height={1280}
          loading="lazy"
          className="h-[42svh] w-full object-cover lg:h-[55svh]"
        />
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 70}>
              <article className="h-full rounded-2xl border border-border bg-card p-7 shadow-soft transition-shadow duration-500 hover:shadow-lift">
                <span className="font-display text-3xl text-accent">{step.n}</span>
                <h2 className="font-display mt-3 text-xl">{step.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-14 lg:py-20">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <Reveal>
            <img
              src={craft}
              alt={t("pages.craft.markingImgAlt")}
              width={1408}
              height={1600}
              loading="lazy"
              className="aspect-4/5 w-full rounded-2xl object-cover shadow-lift"
            />
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow">{t("pages.craft.careEyebrow")}</p>
            <h2 className="font-display mt-3 text-3xl leading-tight sm:text-4xl">
              {t("pages.craft.careTitle")}
            </h2>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              {careItems.map((item) => (
                <li key={item.title}>
                  <strong className="text-foreground">{item.title}</strong> {item.text}
                </li>
              ))}
            </ul>
            <Button variant="hero" size="lg" className="mt-8" asChild>
              <Link to="/shop">{t("pages.craft.shopCta")}</Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
