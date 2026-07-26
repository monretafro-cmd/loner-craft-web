import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Logo } from "./Logo";
import { products, categories } from "@/lib/products";
import { useStore } from "@/lib/store";
import { BRAND, whatsappLink } from "@/lib/brand";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Products" },
  { to: "/our-craft", label: "Our Craft" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const { count, setCartOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="bg-ink px-4 py-2 text-center text-[0.7rem] tracking-[0.16em] text-ink-foreground uppercase">
        Cash on Delivery · Delivery across Morocco · Handmade in Taroudant
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-500 ease-out",
          scrolled
            ? "border-border/70 bg-background/80 shadow-soft backdrop-blur-md"
            : "border-border bg-background",
        )}
      >
        <nav
          className={cn(
            "mx-auto grid max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-3 px-5 transition-all duration-500 ease-out sm:px-6 lg:px-10",
            scrolled
              ? "h-[64px] md:h-[78px] lg:h-[88px]"
              : "h-[74px] md:h-[92px] lg:h-[110px]",
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-xs p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="border-b border-border p-5">
                  <Logo />
                </div>
                <div className="flex flex-col p-2">
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="font-display rounded-lg px-4 py-3.5 text-lg hover:bg-secondary"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-2 h-px bg-border" />
                  {[
                    { to: "/track-order", label: "Track Order" },
                    { to: "/faq", label: "FAQ" },
                    { to: "/shipping", label: "Shipping" },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="rounded-lg px-4 py-3 text-sm text-muted-foreground hover:bg-secondary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <Logo
              className="py-1"
              markClassName={cn(
                "transition-all duration-500 ease-out",
                scrolled
                  ? "w-[56px] md:w-[70px] lg:w-[78px]"
                  : "w-16 md:w-20 lg:w-[92px]",
              )}
            />
          </div>

          <div className="hidden items-center justify-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "text-primary" }}
                className="rounded-md px-3.5 py-2 text-sm tracking-wide text-foreground/75 transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-0.5 justify-self-end">
            <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Order on WhatsApp">
              <a
                href={whatsappLink(`Hello ${BRAND.name}, I would like to order a handmade wallet.`)}
                target="_blank"
                rel="noreferrer"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.38-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 2C6.5 2 2 6.5 2 12.05c0 1.77.46 3.5 1.34 5.02L2 22l5.06-1.32a10 10 0 0 0 4.99 1.32h.01c5.55 0 10.05-4.5 10.05-10.05C22.1 6.5 17.6 2 12.05 2z" />
                </svg>
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={`Open bag, ${count} items`}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[0.6rem] font-semibold text-accent-foreground">
                  {count}
                </span>
              )}
            </Button>
          </div>
        </nav>
      </header>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search wallets, card holders, custom pieces…" />
        <CommandList>
          <CommandEmpty>Nothing matched. Try &ldquo;wallet&rdquo; or &ldquo;custom&rdquo;.</CommandEmpty>
          <CommandGroup heading="Products">
            {products.map((p) => (
              <CommandItem
                key={p.slug}
                value={`${p.name} ${p.category}`}
                onSelect={() => {
                  setSearchOpen(false);
                  navigate({ to: "/product/$slug", params: { slug: p.slug } });
                }}
              >
                {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Categories">
            {categories.map((c) => (
              <CommandItem
                key={c.slug}
                value={c.name}
                onSelect={() => {
                  setSearchOpen(false);
                  navigate({ to: "/shop", search: { category: c.slug } });
                }}
              >
                {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}