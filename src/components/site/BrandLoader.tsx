import { useEffect, useState } from "react";
import { LogoMark } from "./Logo";

/** Elegant first-paint loading veil showing only the brand mark. */
export function BrandLoader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), 700);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      aria-hidden={done}
      className={`fixed inset-0 z-[100] grid place-items-center bg-background transition-opacity duration-700 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <LogoMark className="animate-fade-up h-20 opacity-90" />
    </div>
  );
}
