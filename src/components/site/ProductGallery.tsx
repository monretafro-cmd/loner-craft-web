import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Play, X, ZoomIn } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PLACEHOLDER_IMAGE, type ProductMedia } from "@/lib/shop/images";
import { cn } from "@/lib/utils";

const labelKey = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c: string) => c.toUpperCase());

export function ProductGallery({ name, items }: { name: string; items: ProductMedia[] }) {
  const { t, isRTL } = useI18n();
  const [active, setActive] = useState(0);
  const [light, setLight] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const railRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const count = items.length;
  const go = useCallback(
    (dir: number) => setActive((i) => (count ? (i + dir + count) % count : 0)),
    [count],
  );

  useEffect(() => {
    if (!light) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [light]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLight(false);
      if (e.key === "ArrowRight") isRTL ? go(-1) : go(1);
      if (e.key === "ArrowLeft") isRTL ? go(1) : go(-1);
    };
    if (light) {
      document.body.style.overflow = "hidden";
      document.documentElement.setAttribute("data-lightbox-open", "true");
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        document.documentElement.removeAttribute("data-lightbox-open");
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [light, go, isRTL]);

  useEffect(() => {
    const rail = railRef.current;
    if (rail) {
      const activeEl = rail.querySelector(`[data-index="${active}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [active]);

  if (!count) return <div className="aspect-square w-full rounded-[20px] bg-secondary" />;

  const current = items[Math.min(active, count - 1)];
  const label = current.label ? t(`product.gallery.labels.${labelKey(current.label)}`) : "";

  const handleWheel = (e: React.WheelEvent) => {
    if (!light || current.type === "video") return;
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setScale((s) => Math.min(3, Math.max(1, s + delta)));
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (scale <= 1) return;
    isDragging.current = true;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    lastPos.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - lastPos.current.x;
    const dy = clientY - lastPos.current.y;
    setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }));
    lastPos.current = { x: clientX, y: clientY };
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-start lg:gap-12">
      {/* Main Image View */}
      <div className="relative min-w-0 flex-1">
        <div
          className="relative aspect-square w-full touch-pan-y overflow-hidden rounded-[20px] bg-cream p-1 md:max-h-[620px] lg:max-h-[680px] xl:max-h-[760px]"
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
                <video
                  src={item.src}
                  poster={item.poster}
                  controls
                  className="h-full w-full object-contain"
                />
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

      {/* Thumbnails */}
      {count > 1 && (
        <div
          ref={railRef}
          className="flex w-full gap-3 overflow-x-auto pb-2 [scrollbar-width:none] lg:max-h-[680px] lg:w-20 lg:flex-col lg:overflow-y-auto lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, i) => (
            <button
              key={item.src}
              type="button"
              data-index={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                "h-[68px] w-[68px] sm:h-[76px] sm:w-[76px] lg:h-[80px] lg:w-[80px]",
                i === active ? "border-cognac" : "border-transparent",
              )}
            >
              <img
                src={item.type === "video" ? (item.poster ?? PLACEHOLDER_IMAGE) : item.src}
                alt=""
                className="h-full w-full object-cover"
              />
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                  <Play className="h-4 w-4 fill-current" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {light && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#140F0C]/96 p-4 backdrop-blur-lg"
          onWheel={handleWheel}
        >
          <button
            onClick={() => setLight(false)}
            className="absolute end-6 top-6 z-[10000] rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            ref={containerRef}
            className="relative flex h-full w-full items-center justify-center overflow-hidden"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {current.type === "video" ? (
              <video
                src={current.src}
                controls
                autoPlay
                className="max-h-[90dvh] max-w-[92vw] rounded-xl"
              />
            ) : (
              <img
                src={current.src}
                alt=""
                className={cn(
                  "max-h-[90dvh] max-w-[92vw] select-none object-contain transition-transform duration-200",
                  scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                )}
                style={{
                  transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
                }}
              />
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 left-0 right-0 z-[10000] flex items-center justify-center gap-8 text-white">
            <button
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              className="rounded-full bg-white/10 p-3 transition-colors hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <span className="min-w-[60px] text-center text-sm font-medium tabular-nums">
              {active + 1} / {count}
            </span>

            <button
              onClick={(e) => { e.stopPropagation(); go(1); }}
              className="rounded-full bg-white/10 p-3 transition-colors hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
