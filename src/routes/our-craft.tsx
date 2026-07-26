import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
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

const STEPS = [
  {
    n: "01",
    title: "Choosing the hide",
    text: "We select full-grain hides at a family tannery in the Taroudant medina, tanned with oak bark and pomegranate rind over 30 days. We reject any panel with a scar we can't stand behind.",
  },
  {
    n: "02",
    title: "Cutting",
    text: "Panels are cut with a round knife against a marble slab — never a die press. Cutting by hand lets the maker read the grain and place the strongest fibres where the piece will flex.",
  },
  {
    n: "03",
    title: "Skiving & folding",
    text: "Every fold is skived down by hand so the leather bends without bulk. This is the step that separates a wallet that stays slim from one that swells after a month.",
  },
  {
    n: "04",
    title: "Saddle stitching",
    text: "Two needles, one thread, waxed linen. A saddle stitch locks on itself, so even a cut thread will not unravel the seam. Roughly 320 stitches go into a bifold.",
  },
  {
    n: "05",
    title: "Edge finishing",
    text: "Edges are bevelled, sanded through three grits, wet-slicked with gum tragacanth, then waxed and burnished four times until they shine like polished wood.",
  },
  {
    n: "06",
    title: "Final inspection",
    text: "The maker who started the piece buffs it, stamps their mark inside the fold and signs the certificate of origin that ships in the box.",
  },
];

function CraftPage() {
  return (
    <>
      <PageHero
        eyebrow="The Workshop"
        title="Our Craft"
        intro="Forty-one steps stand between a raw hide and a finished Loner piece. Here are the six that matter most."
      />

      <section className="relative isolate overflow-hidden">
        <img
          src={hero}
          alt="Hands saddle-stitching leather at a workbench"
          width={1920}
          height={1280}
          loading="lazy"
          className="h-[42svh] w-full object-cover lg:h-[55svh]"
        />
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, i) => (
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
              alt="Marking a leather panel before cutting"
              width={1408}
              height={1600}
              loading="lazy"
              className="aspect-4/5 w-full rounded-2xl object-cover shadow-lift"
            />
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow">Caring for it</p>
            <h2 className="font-display mt-3 text-3xl leading-tight sm:text-4xl">
              Leather that gets better with you.
            </h2>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">Let it breathe.</strong> Keep it out of sealed
                plastic. The dust bag in your box is all the storage it needs.
              </li>
              <li>
                <strong className="text-foreground">Condition twice a year.</strong> A pea-sized
                amount of neutral balm, worked in with a soft cloth, keeps the fibres supple.
              </li>
              <li>
                <strong className="text-foreground">Let water dry naturally.</strong> Never a hair
                dryer or radiator — heat cracks vegetable-tanned leather.
              </li>
              <li>
                <strong className="text-foreground">Embrace the patina.</strong> Scratches fade into
                the surface within weeks. That mottled shine is the leather doing its job.
              </li>
            </ul>
            <Button variant="hero" size="lg" className="mt-8" asChild>
              <Link to="/shop">Shop the collection</Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}