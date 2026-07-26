import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "./Logo";
import { BRAND } from "@/lib/brand";

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
      { to: "/wishlist", label: "Wishlist" },
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
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark className="h-11 w-11" />
              <span className="font-display text-lg tracking-[0.18em] uppercase">Loner Leather</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-foreground/70">
              Hand-cut, saddle-stitched leather goods made in a small Marrakech workshop. One maker
              per piece, from hide to box.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-ink-foreground/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{BRAND.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:+${BRAND.whatsapp}`} className="hover:text-ink-foreground">
                  {BRAND.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${BRAND.email}`} className="hover:text-ink-foreground">
                  {BRAND.email}
                </a>
              </li>
            </ul>
            <div className="mt-6 flex gap-2">
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="grid h-11 w-11 place-items-center rounded-lg border border-ink-foreground/15 transition-colors hover:border-accent hover:text-accent"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={BRAND.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="grid h-11 w-11 place-items-center rounded-lg border border-ink-foreground/15 transition-colors hover:border-accent hover:text-accent"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

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