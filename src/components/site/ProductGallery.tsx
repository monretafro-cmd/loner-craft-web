import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Expand, Play, X, ZoomIn } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PLACEHOLDER_IMAGE, type ProductMedia } from "@/lib/shop/images";
import { cn } from "@/lib/utils";

const labelKey = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c: string) => c.toUpperCase());

/**
 * Alpha Wallet gallery — scales from 5 to 50+ photos with no layout changes.
 * Vertical scrollable thumbnail rail on desktop, horizontal slider on mobile,
 * hover zoom, chapter labels, and a fullscreen lightbox with wheel/double-click
 * zoom, keyboard navigation, swipe and pinch support.
 */
export function ProductGallery({ name, items }: { name: string; items: ProductMedia[] }) {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [light, setLight] = useState(false);
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const railRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number; dist: number; scale: number } | null>(null);

  const count = items.length;
  const go = useCallback(
    (dir: number) => setActive((i) => (count ? (i + dir + count) % count : 0)),
    [count],
  );

  useEffect(() => {
    setScale(1);
    setOrigin({ x: 50, y: 50 });
  }, [active, light]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLight(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    if (!light) return;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [light, go]);

  // Keep the active thumbnail in view as the rail scrolls.
  useEffect(() => {
    const rail = railRef.current;
    const el = rail?.querySelector<HTMLElement>(`[data-thumb="${active}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [active]);

  if (!count) {
    return (
      <div className="aspect-square overflow-hidden rounded-2xl bg-secondary">
        <img src={PLACEHOLDER_IMAGE} alt={name} className="h-full w-full object-contain opacity-80" />
      </div>
    );
  }
  const current = items[Math.min(active, count - 1)];
  const translateLabel = (raw?: string) => {
    if (!raw) return "";
    const key = `product.gallery.labels.${labelKey(raw)}`;
    const translated = t(key);
    return !translated || translated === key ? raw : translated;
  };
  const label = translateLabel(current.label);
  const section = "";

  const scrollRail = (dir: number) =>
    railRef.current?.scrollBy({ top: dir * 260, behavior: "smooth" });

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:items-start lg:gap-4">
      {/* Stage */}
      <div className="relative min-w-0 flex-1">
        {section && (
          <p className="eyebrow mb-2 hidden lg:block">{section}</p>
        )}
        <div
          className="group relative aspect-square touch-pan-y overflow-hidden rounded-2xl bg-secondary select-none"
          onMouseMove={(e) => {
            if (current.type !== "image") return;
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({
              x: ((e.clientX - r.left) / r.width) * 100,
              y: ((e.clientY - r.top) / r.height) * 100,
            });
          }}
          onMouseLeave={() => setZoom(null)}
          onDoubleClick={() => setLight(true)}
          onTouchStart={(e) => {
            touch.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
              dist: 0,
              scale: 1,
            };
          }}
          onTouchEnd={(e) => {
            const start = touch.current;
            touch.current = null;
            if (!start) return;
            const dx = e.changedTouches[0].clientX - start.x;
            const dy = e.changedTouches[0].clientY - start.y;
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
          }}
        >
          {items.map((item, i) =>
            item.type === "video" ? (
              <video
                key={item.src}
                src={item.src}
                poster={item.poster}
                controls
                playsInline
                preload="none"
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
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 640px"
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

          {label && (
            <span className="glass pointer-events-none absolute start-3 top-3 rounded-full px-3 py-1 text-[0.65rem] font-medium tracking-[0.12em] uppercase">
              {label}
            </span>
          )}

          <button
            type="button"
            onClick={() => setLight(true)}
            aria-label={t("product.gallery.fullscreen")}
            className="glass absolute end-3 top-3 grid h-10 w-10 place-items-center rounded-full text-foreground transition-transform hover:scale-105"
          >
            <Expand className="h-4 w-4" />
          </button>

          <span className="glass pointer-events-none absolute bottom-3 start-3 rounded-md px-2.5 py-1 text-[0.65rem] tracking-wide uppercase max-lg:hidden">
            {t("product.gallery.hoverZoom")}
          </span>
          <span className="glass pointer-events-none absolute bottom-3 end-3 rounded-md px-2.5 py-1 text-[0.65rem] tracking-wide tabular-nums">
            {active + 1} / {count}
          </span>
        </div>
      </div>

      {/* Thumbnails: horizontal on mobile, vertical scrollable rail on desktop */}
      {count > 1 && (
        <div className="lg:flex lg:w-20 lg:flex-col lg:items-center lg:gap-1">
          {count > 8 && (
            <button
              type="button"
              onClick={() => scrollRail(-1)}
              aria-label={t("product.gallery.scrollUp")}
              className="hidden h-6 w-full place-items-center rounded-md text-muted-foreground hover:text-foreground lg:grid"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          )}
          <div
            ref={railRef}
            className="flex gap-3 overflow-x-auto pb-1 lg:max-h-[560px] lg:w-full lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item, i) => (
              <button
                key={item.src}
                type="button"
                data-thumb={i}
                onClick={() => setActive(i)}
                aria-label={t("product.gallery.viewImage", { index: i + 1 })}
                aria-current={i === active}
                className={cn(
                  "group/thumb relative aspect-square w-[72px] shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 lg:w-full",
                  i === active
                    ? "border-primary opacity-100"
                    : "border-transparent opacity-70 hover:border-border hover:opacity-100",
                )}
              >
                <img
                  src={item.type === "video" ? (item.poster ?? PLACEHOLDER_IMAGE) : item.src}
                  alt=""
                  width={200}
                  height={200}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full bg-secondary object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                />
                {item.type === "video" && (
                  <span className="pointer-events-none absolute inset-0 grid place-items-center bg-foreground/30 text-background">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                )}
              </button>
            ))}
          </div>
          {count > 8 && (
            <button
              type="button"
              onClick={() => scrollRail(1)}
              aria-label={t("product.gallery.scrollDown")}
              className="hidden h-6 w-full place-items-center rounded-md text-muted-foreground hover:text-foreground lg:grid"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {light && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-foreground/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={name}
          onClick={() => setLight(false)}
          onWheel={(e) => {
            setScale((s) => Math.min(4, Math.max(1, s - e.deltaY / 500)));
          }}
        >
          <button
            type="button"
            aria-label={t("product.gallery.close")}
            className="absolute end-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full bg-background/90 text-foreground"
            onClick={() => setLight(false)}
          >
            <X className="h-5 w-5" />
          </button>

          <span className="absolute bottom-5 start-1/2 z-10 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1.5 text-xs text-foreground tabular-nums">
            {active + 1} / {count} {label ? `· ${label}` : ""}
          </span>
          <span className="absolute bottom-5 end-5 z-10 hidden items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[0.65rem] tracking-wide text-foreground uppercase lg:flex">
            <ZoomIn className="h-3.5 w-3.5" /> {t("product.gallery.zoomHint")}
          </span>

          {current.type === "video" ? (
            <video
              src={current.src}
              poster={current.poster}
              controls
              autoPlay
              playsInline
              className="max-h-[88vh] max-w-full rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
          <img
            src={current.type === "video" ? (current.poster ?? current.src) : current.src}
            alt={current.alt}
            className="max-h-[88vh] max-w-full rounded-xl object-contain transition-transform duration-200"
            style={{ transform: `scale(${scale})`, transformOrigin: `${origin.x}% ${origin.y}%` }}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => {
              e.stopPropagation();
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
              setScale((s) => (s > 1 ? 1 : 2.5));
            }}
            onTouchStart={(e) => {
              if (e.touches.length === 2) {
                const [a, b] = [e.touches[0], e.touches[1]];
                touch.current = {
                  x: 0,
                  y: 0,
                  dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
                  scale,
                };
              } else {
                touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist: 0, scale };
              }
            }}
            onTouchMove={(e) => {
              const start = touch.current;
              if (!start || e.touches.length !== 2 || !start.dist) return;
              const [a, b] = [e.touches[0], e.touches[1]];
              const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
              setScale(Math.min(4, Math.max(1, (start.scale * dist) / start.dist)));
            }}
            onTouchEnd={(e) => {
              const start = touch.current;
              touch.current = null;
              if (!start || start.dist || scale > 1) return;
              const dx = e.changedTouches[0].clientX - start.x;
              if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
            }}
          />
          )}
        </div>
      )}
    </div>
  );
}
