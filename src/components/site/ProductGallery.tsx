import { useEffect, useState } from "react";
import { Expand, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { productGallery } from "@/lib/photos";
import { cn } from "@/lib/utils";

/**
 * Alpha Wallet gallery — vertical thumbnails on desktop, horizontal slider on
 * mobile, hover zoom, fullscreen lightbox and cross-fade transitions.
 */
export function ProductGallery({ name }: { name: string }) {
  const { t } = useI18n();
  const items = productGallery();
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [light, setLight] = useState(false);

  useEffect(() => {
    if (!light) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLight(false);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % items.length);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [light, items.length]);

  if (!items.length) return null;
  const current = items[active];

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:items-start lg:gap-4">
      {/* Stage */}
      <div className="relative flex-1">
        <div
          className="group relative aspect-square overflow-hidden rounded-2xl bg-secondary"
          onMouseMove={(e) => {
            if (current.type !== "image") return;
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({
              x: ((e.clientX - r.left) / r.width) * 100,
              y: ((e.clientY - r.top) / r.height) * 100,
            });
          }}
          onMouseLeave={() => setZoom(null)}
        >
          {items.map((item, i) =>
            item.type === "video" ? (
              <video
                key={item.src}
                src={item.src}
                poster={item.poster}
                controls
                playsInline
                className={cn(
                  "absolute inset-0 h-full w-full object-contain transition-opacity duration-500",
                  i === active ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              />
            ) : (
              <img
                key={item.src}
                src={item.src}
                alt={item.alt}
                width={1400}
                height={1400}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding="async"
                sizes="(max-width: 1024px) 100vw, 640px"
                className={cn(
                  "absolute inset-0 h-full w-full object-contain transition-[opacity,transform] duration-500 ease-out",
                  i === active ? "opacity-100" : "pointer-events-none opacity-0",
                )}
                style={
                  i === active && zoom
                    ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                    : undefined
                }
              />
            ),
          )}

          <button
            type="button"
            onClick={() => setLight(true)}
            aria-label={t("product.gallery.fullscreen")}
            className="glass absolute end-3 top-3 grid h-10 w-10 place-items-center rounded-full text-foreground transition-opacity"
          >
            <Expand className="h-4 w-4" />
          </button>
          <span className="glass pointer-events-none absolute bottom-3 start-3 rounded-md px-2.5 py-1 text-[0.65rem] tracking-wide uppercase max-lg:hidden">
            {t("product.gallery.hoverZoom")}
          </span>
        </div>
      </div>

      {/* Thumbnails: horizontal on mobile, vertical on desktop */}
      {items.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 lg:w-20 lg:flex-col lg:overflow-visible lg:pb-0">
          {items.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={t("product.gallery.viewImage", { index: i + 1 })}
              aria-current={i === active}
              className={cn(
                "aspect-square w-[72px] shrink-0 overflow-hidden rounded-lg border-2 transition-colors lg:w-full",
                i === active ? "border-primary" : "border-transparent hover:border-border",
              )}
            >
              <img
                src={item.type === "video" ? (item.poster ?? "") : item.src}
                alt=""
                width={200}
                height={200}
                loading="lazy"
                decoding="async"
                className="h-full w-full bg-secondary object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {light && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={name}
          onClick={() => setLight(false)}
        >
          <button
            type="button"
            aria-label={t("product.gallery.close")}
            className="absolute end-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-background/90 text-foreground"
            onClick={() => setLight(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={current.type === "video" ? (current.poster ?? current.src) : current.src}
            alt={current.alt}
            className="max-h-[88vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
