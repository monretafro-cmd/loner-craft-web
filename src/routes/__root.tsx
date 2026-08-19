import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { BrandLoader } from "@/components/site/BrandLoader";
import { StoreProvider } from "@/lib/store";
import { I18nProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Loner Leather — Handmade Moroccan Leather Goods" },
      {
        name: "description",
        content:
          "Hand-stitched full-grain leather wallets, card holders and custom pieces made in Taroudant. Cash on Delivery, free shipping over 500 MAD.",
      },
      { name: "author", content: "Loner Leather" },
      { property: "og:site_name", content: "Loner Leather" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Loner Leather — Handmade Moroccan Leather Goods" },
      { name: "twitter:title", content: "Loner Leather — Handmade Moroccan Leather Goods" },
      { property: "og:description", content: "Hand-stitched full-grain leather wallets, card holders and custom pieces made in Taroudant. Cash on Delivery, free shipping over 500 MAD." },
      { name: "twitter:description", content: "Hand-stitched full-grain leather wallets, card holders and custom pieces made in Taroudant. Cash on Delivery, free shipping over 500 MAD." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/h4v9ljNWM2TOhPL7cECb4lgUCqQ2/social-images/social-1785095770004-3.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/h4v9ljNWM2TOhPL7cECb4lgUCqQ2/social-images/social-1785095770004-3.webp" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..600&family=Inter:wght@300..700&family=Noto+Kufi+Arabic:wght@300..700&family=Noto+Sans+Arabic:wght@300..700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/favicon-brand.png" },
      { rel: "apple-touch-icon", href: "/favicon-brand.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Loner Leather",
          description: "Handmade Moroccan leather goods, made in Taroudant.",
          address: {
            "@type": "PostalAddress",
            streetAddress: "142 Rue Dar El Bacha, Medina",
            addressLocality: "Taroudant",
            postalCode: "40000",
            addressCountry: "MA",
          },
          telephone: "+212661248803",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <InnerComponent />
      </I18nProvider>
    </QueryClientProvider>
  );
}

function InnerComponent() {
  const { pathname } = useRouterState({ select: (state) => ({ pathname: state.location.pathname }) });
  const isAdmin = pathname.startsWith("/admin");

  return (
    <StoreProvider>
      <div className="site-reveal flex min-h-screen flex-col overflow-x-clip">
        {!isAdmin && <Navbar />}
        <main className="flex-1">
          <Outlet />
        </main>
        {!isAdmin && <Footer />}
      </div>
      {!isAdmin && (
        <>
          <BrandLoader />
          <CartDrawer />
          <FloatingActions />
        </>
      )}
      <Toaster position="bottom-left" />
    </StoreProvider>
  );
}
