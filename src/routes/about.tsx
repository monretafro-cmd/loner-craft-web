import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { LogoMark } from "@/components/site/Logo";
import { useI18n } from "@/lib/i18n";
import craft from "@/assets/craft.jpg";
import packaging from "@/assets/packaging.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Loner Leather — A Taroudant Leather Workshop" },
      {
        name: "description",
        content:
          "Loner Leather is a small Taroudant workshop making full-grain leather wallets and accessories by hand since 2016. Meet the makers behind the stitch.",
      },
      { property: "og:title", content: "About Loner Leather" },
      {
        property: "og:description",
        content: "A small Taroudant workshop making full-grain leather goods by hand since 2016.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t, tList } = useI18n();
  const stats = tList<{ value: string; label: string }>("pages.about.stats");

  return (
    <>
      <section className="bg-cream">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center px-5 py-20 text-center sm:px-6 lg:px-10">
          <LogoMark className="h-28 sm:h-36" />
          <p className="eyebrow mt-8">{t("pages.about.topEyebrow")}</p>
          <h2 className="font-display mt-4 max-w-2xl text-3xl leading-tight sm:text-4xl">
            {t("pages.about.topTitle")}
          </h2>
        </div>
      </section>
      <PageHero
        eyebrow={t("pages.about.hero.eyebrow")}
        title={t("pages.about.hero.title")}
        intro={t("pages.about.hero.intro")}
      />

      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <img
              src={craft}
              alt={t("pages.about.packagingImgAlt")}
              width={1408}
              height={1600}
              loading="lazy"
              className="aspect-4/5 w-full rounded-2xl object-cover shadow-lift"
            />
          </Reveal>
          <Reveal delay={120} className="space-y-5 text-[0.95rem] leading-relaxed text-muted-foreground">
            <LogoMark className="h-14 w-auto" />
            <h2 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
              {t("pages.about.storyTitle")}
            </h2>
            <p>{t("pages.about.storyP1")}</p>
            <p>{t("pages.about.storyP2")}</p>
            <p>{t("pages.about.storyP3")}</p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/shop">{t("pages.about.storyCta")}</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink py-14 text-ink-foreground lg:py-20">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-10">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 70}>
              <p className="font-display text-4xl text-accent sm:text-5xl">{s.value}</p>
              <p className="mt-2 text-sm text-ink-foreground/65">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">
              {t("pages.about.packagingTitle")}
            </h2>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">
              {t("pages.about.packagingText")}
            </p>
          </Reveal>
          <Reveal delay={120} className="order-1 lg:order-2">
            <img
              src={packaging}
              alt={t("pages.about.packagingCareImgAlt")}
              width={1600}
              height={1200}
              loading="lazy"
              className="aspect-4/3 w-full rounded-2xl object-cover shadow-lift"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
