import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/site/PageHero";
import { BRAND, whatsappLink } from "@/lib/brand";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Loner Leather — Marrakech Workshop & WhatsApp" },
      {
        name: "description",
        content:
          "Reach the Loner Leather workshop in Marrakech by WhatsApp, phone or email. Open Monday to Saturday, 9:00–19:00.",
      },
      { property: "og:title", content: "Contact Loner Leather" },
      {
        property: "og:description",
        content: "WhatsApp, call or email our Marrakech leather workshop.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Enter a valid email address").max(160),
  subject: z.string().trim().min(2, "Please add a subject").max(120),
  message: z.string().trim().min(10, "Tell us a little more").max(1000),
});

function ContactPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Contact Us"
        intro="Questions about a piece, a custom order or an existing delivery? We answer every message ourselves."
      />

      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-7 shadow-soft">
              <h2 className="font-display text-xl">Workshop</h2>
              <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{BRAND.address}</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <a href={`tel:${BRAND.phoneDisplay.replace(/\s/g, "")}`} className="hover:text-foreground">
                    {BRAND.phoneDisplay}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <a href={`mailto:${BRAND.email}`} className="hover:text-foreground">
                    {BRAND.email}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>Monday–Saturday, 9:00–19:00 (GMT+1)</span>
                </li>
              </ul>
              <Button variant="whatsapp" size="lg" className="mt-6 w-full" asChild>
                <a
                  href={whatsappLink("Hello Loner Leather, I'd like some help.")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Chat on WhatsApp
                </a>
              </Button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border shadow-soft">
              <iframe
                title="Loner Leather workshop location in Marrakech"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-8.0130%2C31.6220%2C-7.9770%2C31.6420&layer=mapnik&marker=31.6320%2C-7.9950"
                loading="lazy"
                className="h-64 w-full border-0"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-7 shadow-soft sm:p-9">
            <h2 className="font-display text-2xl">Send a message</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We reply within one working day, usually much sooner.
            </p>
            <form
              noValidate
              className="mt-7 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.currentTarget));
                const parsed = schema.safeParse(data);
                if (!parsed.success) {
                  const next: Record<string, string> = {};
                  for (const issue of parsed.error.issues) {
                    next[String(issue.path[0])] = issue.message;
                  }
                  setErrors(next);
                  toast.error("Please check the highlighted fields.");
                  return;
                }
                setErrors({});
                setSent(true);
                e.currentTarget.reset();
                toast.success("Message sent — we'll be in touch shortly.");
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="name" label="Full name" error={errors.name}>
                  <Input id="name" name="name" maxLength={80} placeholder="Yasmine Alaoui" />
                </Field>
                <Field id="email" label="Email" error={errors.email}>
                  <Input id="email" name="email" type="email" maxLength={160} placeholder="you@email.com" />
                </Field>
              </div>
              <Field id="subject" label="Subject" error={errors.subject}>
                <Input id="subject" name="subject" maxLength={120} placeholder="Custom wallet enquiry" />
              </Field>
              <Field id="message" label="Message" error={errors.message}>
                <Textarea id="message" name="message" rows={6} maxLength={1000} placeholder="Tell us what you have in mind…" />
              </Field>
              <Button variant="hero" size="xl" type="submit" className="w-full">
                Send message
              </Button>
              {sent && (
                <p className="text-center text-sm text-muted-foreground">
                  Thanks — your message is with the workshop.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}