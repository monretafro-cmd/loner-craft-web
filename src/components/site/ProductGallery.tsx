import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Expand, Play, X, ZoomIn } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PLACEHOLDER_IMAGE, type ProductMedia } from "@/lib/shop/images";
import { cn } from "@/lib/utils";

const labelKey = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c: string) => c.toUpperCase());

export function ProductGallery({ name, items }: { name: string; items: ProductMedia[] }) {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const [light, setLight] = useState(false);
  const [scale, setScale] = useState(1);
  const railRef = useRef<HTMLDivElement>(null);

  const count = items.length;
  const go = useCallback(
    (dir: number) => setActive((i) => (count ? (i + dir + count) % count : 0)),
    [count],
  );

  useEffect(() => {
    if (!light) setScale(1);
  }, [light]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLight(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    if (light) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [light, go]);

  if (!count) return <div className="aspect-square w-full rounded-2xl bg-secondary" />;

  const current = items[Math.min(active, count - 1)];
  const label = current.label ? t(`product.gallery.labels.${labelKey(current.label)}`) : "";

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-start lg:gap-12">
      <div className="relative min-w-0 flex-1">
        <div
          className="relative aspect-square w-full touch-pan-y overflow-hidden rounded-3xl bg-cream p-2 lg:max-h-[760px]"
        >
          {items.map((item, i) => (
            <div
              key={item.src}
              className={cn(
                "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-500",
                i === active ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              {item.type === "video" ? (
                <video src={item.src} poster={item.poster} controls className="h-full w-full object-contain" />
              ) : (
                <img
                  src={item.src}
                  alt={item.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="h-full w-full object-contain"
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLight(true)}
            className="absolute end-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-background/80 backdrop-blur-md transition-transform hover:scale-105"
          >
            <Expand className="h-5 w-5" />
          </button>
        </div>
      </div>

      {count > 1 && (
        <div className="flex w-full gap-3 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible">
          {items.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border-2 transition-all lg:h-[80px] lg:w-[80px]",
                i === active ? "border-cognac" : "border-transparent",
              )}
            >
              <img src={item.type === "video" ? (item.poster ?? PLACEHOLDER_IMAGE) : item.src} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {light && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(20,15,12,0.96)] p-4 backdrop-blur-md">
          <button onClick={() => setLight(false)} className="absolute end-6 top-6 z-[201] text-white"><X /></button>
          <div className="flex h-full w-full max-w-[92vw] items-center justify-center">
            {current.type === "video" ? (
                <video src={current.src} controls autoPlay className="max-h-[90dvh] w-full" />
            ) : (
                <img src={current.src} className="max-h-[90dvh] w-full object-contain" />
            )}
          </div>
          <div className="absolute bottom-6 flex items-center gap-4 text-white">
            <button onClick={() => go(-1)}>{"<"}</button>
            <span>{active + 1} / {count}</span>
            <button onClick={() => go(1)}>{">"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
