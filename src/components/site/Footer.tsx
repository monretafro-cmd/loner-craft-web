import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "./Logo";
import { BRAND } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { useWhatsapp } from "@/lib/i18n/whatsapp";

const COLUMNS = [
  {
    title: "footer.quickLinks",
    links: [
      { to: "/shop", label: "footer.shopAll" },
      { to: "/about", label: "footer.aboutUs" },
    ],
  },
  {
    title: "footer.customerService",
    links: [
      { to: "/contact", label: "nav.contact" },
      { to: "/track-order", label: "nav.trackOrder" },
      { to: "/faq", label: "nav.faq" },
      { to: "/shipping", label: "nav.shipping" },
    ],
  },
  {
    title: "footer.policies",
    links: [
      { to: "/shipping", label: "footer.shippingReturns" },
      { to: "/privacy", label: "footer.privacy" },
      { to: "/terms", label: "footer.terms" },
    ],
  },
] as const;

export function Footer() {
  const [email, setEmail] = useState("");
  const { t } = useI18n();
  const { askLink } = useWhatsapp();

  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="flex flex-col items-center text-center">
          <LogoMark variant="white" className="h-16 opacity-95" />
          <p className="font-display mt-6 text-2xl tracking-[0.14em] uppercase">Loner Leather</p>
          <p className="mt-3 text-sm tracking-[0.2em] text-ink-foreground/60 uppercase">
            {t("footer.handmadeGoods")}
          </p>
          <p className="mt-1 text-sm tracking-[0.2em] text-ink-foreground/60 uppercase">
            {t("footer.location")}
          </p>
          <div className="mt-8 flex gap-3">
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid h-11 w-11 place-items-center rounded-[14px] border border-ink-foreground/15 transition-colors hover:border-accent hover:text-accent"
            >
              <Instagram className="h-4 w-4" strokeWidth={1.5} />
            </a>
            <a
              href={askLink()}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="grid h-11 w-11 place-items-center rounded-[14px] border border-ink-foreground/15 transition-colors hover:border-accent hover:text-accent"
            >
              <Phone className="h-4 w-4" strokeWidth={1.5} />
            </a>
            <a
              href={`mailto:${BRAND.email}`}
              aria-label="Email"
              className="grid h-11 w-11 place-items-center rounded-[14px] border border-ink-foreground/15 transition-colors hover:border-accent hover:text-accent"
            >
              <Mail className="h-4 w-4" strokeWidth={1.5} />
            </a>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-ink-foreground/60">
            <MapPin className="h-4 w-4" strokeWidth={1.5} /> {BRAND.address}
          </p>
        </div>

        <div className="mt-16 grid gap-10 text-center sm:grid-cols-3 sm:text-left">

          {COLUMNS.map((col) => (
            <div key={t(col.title)}>
              <h3 className="text-[0.7rem] font-semibold tracking-[0.2em] text-ink-foreground/50 uppercase">
                {t(col.title)}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-foreground/75 transition-colors hover:text-accent"
                    >
                      {t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-5 rounded-xl border border-ink-foreground/12 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="font-display text-xl">{t("footer.newsletterTitle")}</h3>
            <p className="mt-1 text-sm text-ink-foreground/70">
              {t("footer.newsletterText")}
            </p>
          </div>
          <form
            className="flex w-full gap-2 md:w-auto"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                toast.error(t("toast.invalidEmail"));
                return;
              }
              toast.success(t("toast.subscribed"));
              setEmail("");
            }}
          >
            <Input
              type="email"
              value={email}
              maxLength={255}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("footer.emailPlaceholder")}
              aria-label={t("footer.emailLabel")}
              className="h-12 min-w-0 border-ink-foreground/20 bg-transparent text-ink-foreground placeholder:text-ink-foreground/40 md:w-72"
            />
            <Button type="submit" variant="gold" size="lg" className="shrink-0">
              {t("actions.subscribe")}
            </Button>
          </form>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-ink-foreground/12 pt-6 text-xs text-ink-foreground/55 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
          <p>{t("footer.codLine")}</p>
        </div>
      </div>
    </footer>
  );
}