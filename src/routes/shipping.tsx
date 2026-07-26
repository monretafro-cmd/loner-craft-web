import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Prose } from "@/components/site/PageHero";

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

function ShippingPage() {
  return (
    <>
      <PageHero
        eyebrow="Policies"
        title="Shipping & Returns"
        intro="Everything about how your piece travels from our bench in Taroudant to your hands."
      />
      <Prose>
        <h2>Delivery times</h2>
        <p>
          Orders are dispatched from our Taroudant workshop within 24–48 hours of the confirmation
          call. Delivery takes 24–48 hours in Casablanca, Rabat and Taroudant, and 2–4 working days
          everywhere else in Morocco. Remote rural addresses may take one extra day.
        </p>

        <h2>Delivery cost</h2>
        <p>
          A flat rate of 35 MAD applies to every order. Delivery is free on orders of 500 MAD or
          more, after any discount is applied.
        </p>

        <h2>Cash on Delivery</h2>
        <p>
          We only accept Cash on Delivery. You pay the courier in cash when the parcel arrives — no
          card, no bank transfer, no prepayment. Please have the exact amount ready where possible,
          and open the box in front of the courier if you want to inspect the piece first.
        </p>

        <h2>Failed deliveries</h2>
        <p>
          The courier attempts delivery twice and will call before each attempt. If both attempts
          fail, the parcel returns to our workshop and we'll contact you to arrange a new date. We
          may ask for confirmation before re-sending after two failed deliveries.
        </p>

        <h2>Exchanges</h2>
        <p>
          You can exchange any unused piece within 14 days of delivery, provided it is in its
          original box with the dust bag and care card. Message us on WhatsApp with your order
          number and we'll arrange collection. Return shipping is 35 MAD, waived if the piece was
          faulty or we sent the wrong item.
        </p>

        <h2>What we cannot exchange</h2>
        <p>
          Personalised pieces — anything embossed with initials or made to a custom pattern — cannot
          be exchanged unless there is a fault in the workmanship.
        </p>

        <h2>Faults and repairs</h2>
        <p>
          Every piece is hand-stitched and guaranteed against stitching failure for two years. Send
          us a photo and we'll repair or replace it. Normal patina, softening and small surface
          marks are characteristics of full-grain leather, not faults.
        </p>
      </Prose>
    </>
  );
}