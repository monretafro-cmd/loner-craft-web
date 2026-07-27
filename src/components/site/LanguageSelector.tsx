import { Globe } from "lucide-react";
import { LANGS, LANG_META, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** AR / FR / EN switch with a globe icon. Manual choice always wins. */
export function LanguageSelector({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "lg";
}) {
  const { lang, setLang, t } = useI18n();
  const order = [...LANGS].reverse(); // AR · FR · EN

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="group"
      aria-label={t("lang.select")}
    >
      <Globe
        className={cn("shrink-0 text-muted-foreground", size === "lg" ? "h-5 w-5" : "h-4 w-4")}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div className="flex items-center">
        {order.map((code) => (
          <button
            key={code}
            type="button"
            lang={LANG_META[code].htmlLang}
            onClick={() => setLang(code)}
            aria-pressed={lang === code}
            aria-label={LANG_META[code].label}
            className={cn(
              "grid min-h-11 min-w-11 place-items-center rounded-md px-1.5 text-xs font-semibold tracking-[0.08em] transition-colors",
              size === "lg" && "text-sm",
              lang === code
                ? "text-primary"
                : "text-foreground/50 hover:text-foreground",
            )}
          >
            {LANG_META[code].code}
          </button>
        ))}
      </div>
    </div>
  );
}