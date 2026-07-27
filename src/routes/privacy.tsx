import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Prose } from "@/components/site/PageHero";
import { BRAND } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — How We Handle Your Data | Loner Leather" },
      {
        name: "description",
        content:
          "What personal data Loner Leather collects when you order, how we use it for delivery, and how to ask us to delete it.",
      },
      { property: "og:title", content: "Privacy Policy — Loner Leather" },
      { property: "og:description", content: "How Loner Leather collects, uses and protects your data." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

type Section = { title: string; body: string };

function PrivacyPage() {
  const { t, tList } = useI18n();
  const sections = tList<Section>("pages.privacy.sections");

  return (
    <>
      <PageHero
        eyebrow={t("pages.privacy.hero.eyebrow")}
        title={t("pages.privacy.hero.title")}
        intro={t("pages.privacy.hero.intro")}
      />
      <Prose>
        {sections.map((s) => (
          <div key={s.title}>
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </div>
        ))}

        <h2>{t("pages.privacy.rightsTitle")}</h2>
        <p>{t("pages.privacy.rightsBody", { email: BRAND.email })}</p>

        <h2>{t("pages.privacy.contactTitle")}</h2>
        <p>{t("pages.privacy.contactBody", { email: BRAND.email, address: BRAND.address })}</p>
      </Prose>
    </>
  );
}
