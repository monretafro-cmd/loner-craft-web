import { useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGS, LANG_META, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ORDER = [...LANGS].reverse() as typeof LANGS[number][]; // AR · FR · EN

/**
 * Single compact language control: globe + current language name.
 * Desktop renders a dropdown; the mobile drawer renders an expanding row.
 */
export function LanguageSelector({
  className,
  variant = "dropdown",
}: {
  className?: string;
  variant?: "dropdown" | "inline";
}) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANG_META[lang];

  if (variant === "inline") {
    return (
      <div className={cn("w-full", className)}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={t("lang.select") || "Language"}
          className="flex min-h-11 w-full items-center gap-2 rounded-xl px-4 text-sm hover:bg-secondary"
        >
          <Globe className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
          <span className="truncate">{current.native}</span>
          <ChevronDown
            className={cn("ms-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        {open && (
          <div className="mt-1 overflow-hidden rounded-xl border border-accent/50 bg-card shadow-soft">
            {ORDER.map((code) => (
              <button
                key={code}
                type="button"
                lang={LANG_META[code].htmlLang}
                onClick={() => {
                  setLang(code);
                  setOpen(false);
                }}
                className="flex min-h-11 w-full items-center gap-2 px-4 text-sm hover:bg-secondary"
              >
                <span>{LANG_META[code].native}</span>
                {lang === code && <Check className="ms-auto h-4 w-4 text-primary" aria-hidden="true" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("lang.select") || "Language"}
          className={cn(
            "flex min-h-11 items-center gap-1.5 rounded-xl px-2.5 text-sm text-foreground/80 transition-colors hover:text-primary",
            className,
          )}
        >
          <Globe className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <span className="whitespace-nowrap">{current.native}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-[150px] rounded-xl border border-accent/60 bg-card p-1 shadow-lift"
      >
        {ORDER.map((code) => (
          <DropdownMenuItem
            key={code}
            lang={LANG_META[code].htmlLang}
            onSelect={() => setLang(code)}
            className="min-h-11 cursor-pointer rounded-lg px-3 text-sm"
          >
            <span>{LANG_META[code].native}</span>
            {lang === code && <Check className="ms-auto h-4 w-4 text-primary" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}