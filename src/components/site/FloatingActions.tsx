import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useWhatsapp } from "@/lib/i18n/whatsapp";
import { cn } from "@/lib/utils";

export function FloatingActions() {
  const [show, setShow] = useState(false);
  const { t, isRTL } = useI18n();
  const { askLink } = useWhatsapp();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={cn(
        "fixed bottom-4 z-40 flex flex-col gap-3 sm:bottom-6",
        isRTL ? "left-4 items-start sm:left-6" : "right-4 items-end sm:right-6",
      )>
      <button
        type="button"
        aria-label={t("actions.backToTop")}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "glass grid h-11 w-11 place-items-center rounded-full shadow-soft transition-all duration-500",
          show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <ArrowUp className="h-4 w-4" />
      </button>

      <a
        href={askLink()}
        target="_blank"
        rel="noreferrer"
        aria-label={t("actions.orderWhatsapp")}
        className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] shadow-lift transition-transform duration-300 hover:scale-105 sm:h-15 sm:w-15"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 fill-white" aria-hidden="true">
          <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.38-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 2C6.5 2 2 6.5 2 12.05c0 1.77.46 3.5 1.34 5.02L2 22l5.06-1.32a10 10 0 0 0 4.99 1.32h.01c5.55 0 10.05-4.5 10.05-10.05C22.1 6.5 17.6 2 12.05 2z" />
        </svg>
      </a>
    </div>
  );
}