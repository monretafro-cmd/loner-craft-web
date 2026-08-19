import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Loader2, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n";
import { type ProductMedia } from "@/lib/shop/images";
import { cn } from "@/lib/utils";

const labelKey = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c: string) => c.toUpperCase());

export function ProductGallery({ name, items }: { name: string; items: ProductMedia[] }) {
  const { t, isRTL } = useI18n();
  const [active, setActive] = useState(0);
  const [light, setLight] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const count = items.length;
  const go = useCallback(
    (dir: number) => {
      if (count <= 1) return;
      setActive((i) => (i + dir + count) % count);
      setIsLoading(true);
      setLoadError(false);
    },
    [count],
  );

  useEffect(() => {
    if (light) {
      document.body.style.overflow = "hidden";
      document.documentElement.setAttribute("data-lightbox-open", "true");
      
      const img = new Image();
      img.src = items[active].src;
      img.onload = () => setIsLoading(false);
      img.onerror = () => { setIsLoading(false); setLoadError(true); };
      
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setLight(false);
        if (e.key === "ArrowRight") isRTL ? go(-1) : go(1);
        if (e.key === "ArrowLeft") isRTL ? go(1) : go(-1);
      };
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        document.documentElement.removeAttribute("data-lightbox-open");
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [light, active, items, go, isRTL]);

  if (!count) return <div className="aspect-square w-full rounded-[20px] bg-secondary" />;

  const current = items[Math.min(active, count - 1)];
  const label = current.label ? t(`product.gallery.labels.${labelKey(current.label)}`) : "";

  const Lightbox = () => createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#120C09]/96 p-4 backdrop-blur-lg">
      <button
        onClick={() => setLight(false)}
        className="absolute end-6 top-6 z-[10000] rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      )}

      {loadError ? (
        <div className="flex flex-col items-center gap-4 text-white">
          <p>Unable to load this image.</p>
          <button onClick={() => { setIsLoading(true); setLoadError(false); }} className="rounded-full bg-white/20 px-4 py-2">Retry</button>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center overflow-hidden">
          <img
            src={current.src}
            alt=""
            onLoad={() => setIsLoading(false)}
            onError={() => { setIsLoading(false); setLoadError(true); }}
            className="max-h-[90dvh] max-w-[94vw] select-none object-contain"
          />
        </div>
      )}

      <div className="absolute bottom-8 left-0 right-0 z-[10000] flex items-center justify-center gap-8 text-white">
        <button onClick={(e) => { e.stopPropagation(); go(-1); }} className="rounded-full bg-white/10 p-3 hover:bg-white/20">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <span className="min-w-[60px] text-center text-sm font-medium tabular-nums">{active + 1} / {count}</span>
        <button onClick={(e) => { e.stopPropagation(); go(1); }} className="rounded-full bg-white/10 p-3 hover:bg-white/20">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6 xl:gap-8">
      {/* Thumbnails list - Desktop (Vertical Left), Mobile/Tablet (Horizontal/Vertical) */}
      {count > 1 && (
        <div className={cn(
          "order-2 lg:order-1 flex w-full gap-3 overflow-x-auto pb-2 [scrollbar-width:none] lg:max-h-[680px] lg:w-20 lg:flex-col lg:overflow-y-auto lg:pb-0 [&::-webkit-scrollbar]:hidden shrink-0",
          isRTL ? "lg:order-1" : "lg:order-1" // Always on the far side based on layout
        )}>
          {items.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                "h-[68px] w-[68px] sm:h-[76px] sm:w-[76px] lg:h-[80px] lg:w-[80px]",
                i === active ? "border-cognac" : "border-transparent",
              )}
            >
              <img src={item.src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image View */}
      <div className="relative min-w-0 flex-1 order-1 lg:order-2">
        <div className="relative aspect-square w-full touch-pan-y overflow-hidden rounded-[20px] bg-cream p-1 md:max-h-[620px] lg:max-h-[680px] xl:max-h-[760px]">
          {items.map((item, i) => (
            <div
              key={item.src}
              className={cn("absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-500", i === active ? "opacity-100" : "pointer-events-none opacity-0")}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading={i === 0 ? "eager" : "lazy"}
                className="h-full w-full object-contain"
              />
            </div>
          ))}

          {label && (
            <span className="absolute start-4 top-4 z-10 rounded-full bg-background/80 px-3 py-1 text-[10px] font-medium tracking-wider uppercase backdrop-blur-md">
              {label}
            </span>
          )}

          <button
            type="button"
            onClick={() => setLight(true)}
            className="absolute end-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-background/80 backdrop-blur-md transition-transform hover:scale-105"
          >
            <Expand className="h-4 w-4" />
          </button>

          <div className="absolute bottom-4 end-4 z-10 rounded-full bg-background/80 px-3 py-1 text-[10px] font-medium tabular-nums backdrop-blur-md">
            {active + 1} / {count}
          </div>
        </div>
      </div>

      {light && <Lightbox />}
    </div>
  );
}
