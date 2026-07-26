import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Prose } from "@/components/site/PageHero";
import { BRAND } from "@/lib/brand";

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

function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of Service" intro="Last updated: 1 January 2026" />
      <Prose>
        <h2>1. Who we are</h2>
        <p>
          {BRAND.name} is a leather workshop based at {BRAND.address}. These terms apply to every
          order placed through this website or via WhatsApp.
        </p>

        <h2>2. Orders</h2>
        <p>
          Placing an order is an offer to buy. The contract is formed when we confirm your order by
          phone or WhatsApp. We may decline an order if a piece is out of stock, the address is
          outside our delivery network, or we cannot reach you to confirm.
        </p>

        <h2>3. Prices and payment</h2>
        <p>
          All prices are in Moroccan Dirham (MAD) and include applicable taxes. Payment is Cash on
          Delivery only, paid to the courier at the moment of delivery. Prices may change at any
          time, but never after your order is confirmed.
        </p>

        <h2>4. Handmade variation</h2>
        <p>
          Every piece is cut and stitched by hand from natural full-grain leather. Grain, tone and
          markings vary between hides, so your piece will not be identical to the photographs. This
          is a feature of the material, not a defect.
        </p>

        <h2>5. Delivery</h2>
        <p>
          Delivery timeframes are estimates given in good faith. We are not liable for delays caused
          by our courier partners, weather, or incorrect address details provided at checkout.
        </p>

        <h2>6. Exchanges and guarantee</h2>
        <p>
          Unused pieces may be exchanged within 14 days as described in our Shipping &amp; Returns
          policy. Stitching is guaranteed for two years from delivery. Personalised pieces are
          excluded from exchanges.
        </p>

        <h2>7. Intellectual property</h2>
        <p>
          All photography, text, patterns and the {BRAND.name} name and mark belong to us and may
          not be reproduced without written permission.
        </p>

        <h2>8. Liability</h2>
        <p>
          Our liability for any order is limited to the amount you paid for that order. Nothing in
          these terms limits rights you have under Moroccan consumer protection law 31-08.
        </p>

        <h2>9. Governing law</h2>
        <p>
          These terms are governed by Moroccan law, and any dispute falls to the competent courts of
          Marrakech.
        </p>
      </Prose>
    </>
  );
}