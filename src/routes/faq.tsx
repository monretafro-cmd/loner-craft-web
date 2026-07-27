import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { useI18n } from "@/lib/i18n";
import { useCatalog } from "@/lib/i18n/catalog";
import { whatsappHref } from "@/lib/i18n/whatsapp";
import { faqs as faqsData } from "@/lib/products";

// Static English copy for JSON-LD structured data only (head() cannot use hooks).
const EXTRA_FAQS_EN = [
  {
    q: "Do you offer engraving?",
    a: "Yes. Up to three initials can be hand-embossed on most pieces for 60 MAD. Mention it in the order notes at checkout or on WhatsApp.",
  },
  {
    q: "How do I track my order?",
    a: "Use the Track Order page with the order number in your confirmation, or send it to us on WhatsApp and we'll check with the courier.",
  },
  {
    q: "Do you ship outside Morocco?",
    a: "International shipping is available on request via WhatsApp, but Cash on Delivery is only available inside Morocco.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Shipping, Cash on Delivery & Leather Care | Loner Leather" },
      {
        name: "description",
        content:
          "Answers about delivery times across Morocco, Cash on Delivery, exchanges, engraving and whether our leather is genuine full-grain.",
      },
      { property: "og:title", content: "Frequently Asked Questions — Loner Leather" },
      {
        property: "og:description",
        content: "Shipping, Cash on Delivery, exchanges and leather care, answered.",
      },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [...faqsData, ...EXTRA_FAQS_EN].map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { t, tList } = useI18n();
  const { faqs } = useCatalog();
  const extra = tList<{ q: string; a: string }>("pages.faq.extra");
  const allFaqs = [...faqs, ...extra];

  return (
    <>
      <PageHero
        eyebrow={t("pages.faq.hero.eyebrow")}
        title={t("pages.faq.hero.title")}
        intro={t("pages.faq.hero.intro")}
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
        <Accordion type="single" collapsible className="w-full">
          {allFaqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-start font-display text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <h2 className="font-display text-2xl">{t("pages.faq.stillQuestion")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("pages.faq.stillQuestionText")}</p>
          <Button variant="hero" size="lg" className="mt-6" asChild>
            <a href={whatsappHref(t("pages.faq.whatsappMessage"))} target="_blank" rel="noreferrer">
              {t("pages.faq.whatsappCta")}
            </a>
          </Button>
        </div>
      </div>
    </>
  );
}
