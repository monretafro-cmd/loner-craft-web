import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Moon, Search, ShoppingBag, Sun } from "lucide-react";
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
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/our-craft", label: "Our Craft" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const isDark = window.localStorage.getItem("ll_theme") === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("ll_theme", next ? "dark" : "light");
      return next;
    });
  };
  return { dark, toggle };
}

export function Navbar() {
  const { count, setCartOpen, wishlist } = useStore();
  const { dark, toggle } = useDarkMode();
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
        Free delivery over 500 MAD · Cash on Delivery
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled ? "glass shadow-soft" : "bg-background",
        )}
      >
        <nav className="mx-auto grid max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
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
                    { to: "/wishlist", label: "Wishlist" },
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
            <Logo />
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
            <Button variant="ghost" size="icon" aria-label="Toggle dark mode" onClick={toggle}>
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" asChild className="relative hidden sm:inline-flex">
              <Link to="/wishlist" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
                )}
              </Link>
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