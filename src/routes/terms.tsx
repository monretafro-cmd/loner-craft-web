import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Prose } from "@/components/site/PageHero";
import { BRAND } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Ordering from Loner Leather" },
      {
        name: "description",
        content:
          "The terms that apply when you order handmade leather goods from Loner Leather: pricing in MAD, Cash on Delivery, guarantees and liability.",
      },
      { property: "og:title", content: "Terms of Service — Loner Leather" },
      { property: "og:description", content: "The terms that apply when you order from Loner Leather." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

type Section = { title: string };

function TermsPage() {
  const { t, tList } = useI18n();
  const sections = tList<Section>("pages.terms.sections");
  const vars = { name: BRAND.name, address: BRAND.address };

  return (
    <>
      <PageHero
        eyebrow={t("pages.terms.hero.eyebrow")}
        title={t("pages.terms.hero.title")}
        intro={t("pages.terms.hero.intro")}
      />
      <Prose>
        {sections.map((s, i) => (
          <div key={s.title}>
            <h2>{s.title}</h2>
            <p>{t(`pages.terms.sections.${i}.body`, vars)}</p>
          </div>
        ))}
      </Prose>
    </>
  );
}
