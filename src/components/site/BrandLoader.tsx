import { useEffect, useState } from "react";
import { LogoMark } from "./Logo";

const ENTRANCE = 500;
const HOLD = 350;
const ZOOM = 550;

/**
 * Premium entrance: the visitor passes through the Loner Leather roundel.
 * Shown only on first paint / full refresh — never on internal navigation.
 */
export function BrandLoader() {
  const [phase, setPhase] = useState<"in" | "zoom" | "gone">("in");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setReduced(prefersReduced);

    const zoomAt = prefersReduced ? 500 : ENTRANCE + HOLD;
    const endAt = zoomAt + (prefersReduced ? 400 : ZOOM);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t1 = window.setTimeout(() => setPhase("zoom"), zoomAt);
    const t2 = window.setTimeout(() => {
      setPhase("gone");
      document.body.style.overflow = prevOverflow;
    }, endAt);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (phase === "gone") return null;

  const zooming = phase === "zoom";

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] grid place-items-center bg-cream"
      style={{
        opacity: zooming ? 0 : 1,
        transition: `opacity ${reduced ? 400 : ZOOM}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        willChange: "opacity",
      }}
    >
      <LogoMark
        className="w-[110px] min-[380px]:w-[130px] md:w-[175px] lg:w-[220px] xl:w-[260px]"
        style={{
          transform: reduced ? "none" : zooming ? "scale(2.6)" : "scale(1)",
          opacity: 1,
          transition: reduced
            ? "none"
            : `transform ${zooming ? ZOOM : ENTRANCE}ms cubic-bezier(0.65, 0, 0.35, 1)`,
          willChange: "transform",
          animation: reduced
            ? `logo-fade-in ${ENTRANCE}ms ease-out both`
            : `logo-enter ${ENTRANCE}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
        }}
      />
    </div>
  );
}
