import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { LogoMark } from "@/components/site/Logo";
import craft from "@/assets/craft.jpg";
import packaging from "@/assets/packaging.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Loner Leather — A Marrakech Leather Workshop" },
      {
        name: "description",
        content:
          "Loner Leather is a small Marrakech workshop making full-grain leather wallets and accessories by hand since 2016. Meet the makers behind the stitch.",
      },
      { property: "og:title", content: "About Loner Leather" },
      {
        property: "og:description",
        content: "A small Marrakech workshop making full-grain leather goods by hand since 2016.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const STATS = [
  { value: "2016", label: "Workshop founded" },
  { value: "9", label: "Makers on the bench" },
  { value: "12", label: "Regions delivered" },
  { value: "18k+", label: "Pieces stitched" },
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title="About Loner Leather"
        intro="We started with one bench, one round knife and a stubborn belief that a wallet should outlive the trousers you keep it in."
      />

      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <img
              src={craft}
              alt="A Loner Leather maker working a hide at the bench"
              width={1408}
              height={1600}
              loading="lazy"
              className="aspect-4/5 w-full rounded-2xl object-cover shadow-lift"
            />
          </Reveal>
          <Reveal delay={120} className="space-y-5 text-[0.95rem] leading-relaxed text-muted-foreground">
            <LogoMark className="h-14 w-14" />
            <h2 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
              One maker, one piece, start to finish.
            </h2>
            <p>
              Loner Leather began in 2016 in a two-room riad off Rue Dar El Bacha. Our founder, Reda,
              had spent nine years repairing other people's leather and grew tired of glued edges and
              hidden staples. He bought a hide, a knife and a spool of waxed linen, and made a wallet
              he would be happy to hand down.
            </p>
            <p>
              Today nine makers share the bench. Nobody works on an assembly line — each person owns
              a piece from the first cut to the final buff, then stamps it with their own mark inside
              the fold.
            </p>
            <p>
              We buy our hides from a family tannery three streets away, we finish every edge by
              hand, and we ship cash on delivery because trust should go both ways.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/our-craft">See how a wallet is made</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink py-14 text-ink-foreground lg:py-20">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-10">
          {STATS.map((s, i) => (
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
              Packed the way we would want to receive it.
            </h2>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">
              Kraft box, cotton dust bag, care card, handwritten note. Nothing plastic, nothing
              wasted. If it's a gift, tell us at checkout and we'll wrap it and leave the price off.
            </p>
          </Reveal>
          <Reveal delay={120} className="order-1 lg:order-2">
            <img
              src={packaging}
              alt="Loner Leather packaging: kraft gift box, dust bag and care card"
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