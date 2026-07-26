import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Prose } from "@/components/site/PageHero";
import { BRAND } from "@/lib/brand";

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

function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" intro="Last updated: 1 January 2026" />
      <Prose>
        <h2>What we collect</h2>
        <p>
          When you place an order we collect your name, phone number, delivery address, and — if you
          provide it — your email address and order notes. That is the minimum needed to make and
          deliver your piece.
        </p>

        <h2>How we use it</h2>
        <p>
          We use your details to confirm your order by phone, to hand the correct address to our
          delivery partner, and to contact you about that specific order. If you opt in to our
          newsletter, we use your email to send occasional notes about new collections. You can
          unsubscribe at any time from any email.
        </p>

        <h2>What stays in your browser</h2>
        <p>
          Your bag, wishlist and recently viewed items are stored locally in your own browser, not
          on our servers. Clearing your browser data removes them.
        </p>

        <h2>Who we share it with</h2>
        <p>
          Only our delivery partners, and only the details they need to bring your parcel to your
          door. We never sell your data, and we do not share it for advertising.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Order records are kept for three years so we can honour exchanges and the stitching
          guarantee. After that they are deleted.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask us for a copy of the data we hold about you, ask us to correct it, or ask us
          to delete it. Write to {BRAND.email} and we will respond within 30 days, in line with
          Moroccan law 09-08 on the protection of personal data.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy: {BRAND.email} · {BRAND.address}
        </p>
      </Prose>
    </>
  );
}