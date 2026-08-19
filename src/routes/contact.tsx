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
import { BRAND } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { whatsappHref } from "@/lib/i18n/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Loner Leather — Taroudant Workshop & WhatsApp" },
      {
        name: "description",
        content:
          "Reach the Loner Leather workshop in Taroudant by WhatsApp, phone or email. Open Monday to Saturday, 9:00–19:00.",
      },
      { property: "og:title", content: "Contact Loner Leather" },
      {
        property: "og:description",
        content: "WhatsApp, call or email our Taroudant leather workshop.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useI18n();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const schema = z.object({
    name: z.string().trim().min(2, t("pages.contact.errors.name")).max(80),
    email: z.string().trim().email(t("pages.contact.errors.email")).max(160),
    subject: z.string().trim().min(2, t("pages.contact.errors.subject")).max(120),
    message: z.string().trim().min(10, t("pages.contact.errors.message")).max(1000),
  });

  return (
    <>
      <PageHero
        eyebrow={t("pages.contact.hero.eyebrow")}
        title={t("pages.contact.hero.title")}
        intro={t("pages.contact.hero.intro")}
      />

      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-7 shadow-soft">
              <h2 className="font-display text-xl">{t("pages.contact.workshopTitle")}</h2>
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
                  <span>{t("pages.contact.hours")}</span>
                </li>
              </ul>
              <Button variant="whatsapp" size="lg" className="mt-6 w-full" asChild>
                <a
                  href={whatsappHref(t("pages.contact.whatsappMessage"))}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("pages.contact.whatsappCta")}
                </a>
              </Button>
            </div>

          </div>

          <div className="rounded-2xl border border-border bg-card p-7 shadow-soft sm:p-9">
            <h2 className="font-display text-2xl">{t("pages.contact.formTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("pages.contact.formSubtitle")}</p>
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
                  toast.error(t("pages.contact.toastError"));
                  return;
                }
                setErrors({});
                setSent(true);
                e.currentTarget.reset();
                toast.success(t("pages.contact.toastSuccess"));
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="name" label={t("pages.contact.fields.name")} error={errors.name}>
                  <Input
                    id="name"
                    name="name"
                    maxLength={80}
                    placeholder={t("pages.contact.fields.namePlaceholder")}
                  />
                </Field>
                <Field id="email" label={t("pages.contact.fields.email")} error={errors.email}>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    maxLength={160}
                    placeholder={t("pages.contact.fields.emailPlaceholder")}
                  />
                </Field>
              </div>
              <Field id="subject" label={t("pages.contact.fields.subject")} error={errors.subject}>
                <Input
                  id="subject"
                  name="subject"
                  maxLength={120}
                  placeholder={t("pages.contact.fields.subjectPlaceholder")}
                />
              </Field>
              <Field id="message" label={t("pages.contact.fields.message")} error={errors.message}>
                <Textarea
                  id="message"
                  name="message"
                  rows={6}
                  maxLength={1000}
                  placeholder={t("pages.contact.fields.messagePlaceholder")}
                />
              </Field>
              <Button variant="hero" size="xl" type="submit" className="w-full">
                {t("pages.contact.submit")}
              </Button>
              {sent && (
                <p className="text-center text-sm text-muted-foreground">
                  {t("pages.contact.sentNote")}
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
