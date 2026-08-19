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
import { useI18n } from "@/lib/i18n";
import { useCatalog } from "@/lib/i18n/catalog";
import { useWhatsapp } from "@/lib/i18n/whatsapp";
import { LanguageSelector } from "./LanguageSelector";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "nav.home" },
  { to: "/shop", label: "nav.shop" },
  { to: "/about", label: "nav.about" },
  { to: "/contact", label: "nav.contact" },
] as const;

export function Navbar() {
  const { count, setCartOpen } = useStore();
  const { t, isRTL } = useI18n();
  const { productName, categoryName } = useCatalog();
  const { askLink } = useWhatsapp();
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
        {t("announcement")}
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-500 ease-out",
          scrolled
            ? "border-border/70 bg-background/80 shadow-soft backdrop-blur-md"
            : "border-border bg-background",
          "[[data-lightbox-open=true]_&]:pointer-events-none [[data-lightbox-open=true]_&]:opacity-0"
        )}
      >
        <nav
          className={cn(
            "mx-auto grid max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-3 px-5 transition-all duration-500 ease-out sm:px-6 lg:px-10",
            scrolled
              ? "h-[64px] md:h-[78px] lg:h-[88px]"
              : "h-[72px] md:h-[88px] lg:h-[104px]",
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("nav.openMenu")}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "right" : "left"} className="w-[85vw] max-w-xs p-0">
                <SheetTitle className="sr-only">{t("nav.menu")}</SheetTitle>
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
                      {t(item.label)}
                    </Link>
                  ))}
                  <div className="my-2 h-px bg-border" />
                  {[
                    { to: "/track-order", label: "nav.trackOrder" },
                    { to: "/faq", label: "nav.faq" },
                    { to: "/shipping", label: "nav.shipping" },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="rounded-lg px-4 py-3 text-sm text-muted-foreground hover:bg-secondary"
                    >
                      {t(item.label)}
                    </Link>
                  ))}
                  <div className="my-2 h-px bg-border" />
                  <LanguageSelector variant="inline" className="px-1 py-1" />
                </div>
              </SheetContent>
            </Sheet>
            <Logo
              className="py-1"
              markClassName={cn(
                "max-h-[56px] transition-all duration-500 ease-out md:max-h-[72px] lg:max-h-[88px]",
                scrolled
                  ? "w-[58px] md:w-[78px] lg:w-[94px]"
                  : "w-[66px] md:w-[90px] lg:w-[112px]",
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
                {t(item.label)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-0.5 justify-self-end">
            <LanguageSelector className="me-1 hidden lg:flex" />
            <Button variant="ghost" size="icon" aria-label={t("actions.search")} onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={t("cart.open", { count })}
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
        <CommandInput placeholder={t("search.placeholder")} />
        <CommandList>
          <CommandEmpty>{t("search.empty")}</CommandEmpty>
          <CommandGroup heading={t("search.products")}>
            {products.map((p) => (
              <CommandItem
                key={p.slug}
                value={`${p.name} ${productName(p)} ${p.category}`}
                onSelect={() => {
                  setSearchOpen(false);
                  navigate({ to: "/product/$slug", params: { slug: p.slug } });
                }}
              >
                {productName(p)}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={t("search.categories")}>
            {categories.map((c) => (
              <CommandItem
                key={c.slug}
                value={`${c.name} ${categoryName(c.slug)}`}
                onSelect={() => {
                  setSearchOpen(false);
                  navigate({ to: "/shop", search: { category: c.slug } });
                }}
              >
                {categoryName(c.slug)}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}