import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "./Logo";
import { BRAND, whatsappLink } from "@/lib/brand";

const COLUMNS = [
  {
    title: "Quick Links",
    links: [
      { to: "/shop", label: "Shop All" },
      { to: "/categories", label: "Categories" },
      { to: "/our-craft", label: "Our Craft" },
      { to: "/about", label: "About Us" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { to: "/contact", label: "Contact" },
      { to: "/track-order", label: "Track Order" },
      { to: "/faq", label: "FAQ" },
      { to: "/shipping", label: "Shipping" },
    ],
  },
  {
    title: "Policies",
    links: [
      { to: "/shipping", label: "Shipping & Returns" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms of Service" },
    ],
  },
] as const;

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="flex flex-col items-center text-center">
          <LogoMark variant="white" className="h-16 opacity-95" />
          <p className="font-display mt-6 text-2xl tracking-[0.14em] uppercase">Loner Leather</p>
          <p className="mt-3 text-sm tracking-[0.2em] text-ink-foreground/60 uppercase">
            Handmade Leather Goods
          </p>
          <p className="mt-1 text-sm tracking-[0.2em] text-ink-foreground/60 uppercase">
            Taroudant, Morocco
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
              href={whatsappLink(`Hello ${BRAND.name}, I would like to order a handmade piece.`)}
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
            <div key={col.title}>
              <h3 className="text-[0.7rem] font-semibold tracking-[0.2em] text-ink-foreground/50 uppercase">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-foreground/75 transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-5 rounded-xl border border-ink-foreground/12 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="font-display text-xl">Join the workshop letter</h3>
            <p className="mt-1 text-sm text-ink-foreground/70">
              New drops, restocks and care tips. Once a month, never more.
            </p>
          </div>
          <form
            className="flex w-full gap-2 md:w-auto"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                toast.error("Please enter a valid email address.");
                return;
              }
              toast.success("You're on the list. Welcome to Loner Leather.");
              setEmail("");
            }}
          >
            <Input
              type="email"
              value={email}
              maxLength={255}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              className="h-12 min-w-0 border-ink-foreground/20 bg-transparent text-ink-foreground placeholder:text-ink-foreground/40 md:w-72"
            />
            <Button type="submit" variant="gold" size="lg" className="shrink-0">
              Subscribe
            </Button>
          </form>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-ink-foreground/12 pt-6 text-xs text-ink-foreground/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Loner Leather. Handmade in Morocco.</p>
          <p>Cash on Delivery across all 12 regions · No online payment required</p>
        </div>
      </div>
    </footer>
  );
}