import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LANG,
  LANG_META,
  isLang,
  langForBrowser,
  langForCountry,
  type Lang,
} from "./config";
import { DICTIONARIES, type Dict } from "./dictionaries";

export { LANGS, LANG_META, DEFAULT_LANG, isLang } from "./config";
export type { Lang } from "./config";

const STORAGE_KEY = "ll-lang";

function readStored(): Lang | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    /* ignore */
  }
  const match = document.cookie.match(/(?:^|;\s*)ll-lang=([^;]+)/);
  if (match && isLang(match[1])) return match[1];
  return null;
}

function persist(lang: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
  document.cookie = `ll-lang=${lang};path=/;max-age=31536000;samesite=lax`;
}

function lookup(dict: Dict, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Dict)) return (acc as Dict)[part];
    return undefined;
  }, dict);
}

function interpolate(value: string, vars?: Record<string, string | number>) {
  if (!vars) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    vars[name] === undefined ? "" : String(vars[name]),
  );
}

export type Translate = {
  (key: string, vars?: Record<string, string | number>): string;
};

type I18nValue = {
  lang: Lang;
  dir: "ltr" | "rtl";
  isRTL: boolean;
  setLang: (lang: Lang) => void;
  t: Translate;
  /** Arrays / objects straight from the dictionary (with English fallback). */
  tList: <T = unknown>(key: string) => T[];
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // SSR always renders the default language, then the client applies the
  // stored / detected one on mount — keeps hydration stable.
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    let cancelled = false;

    const stored = readStored();
    if (stored) {
      setLangState(stored);
      return;
    }

    const fromBrowser = langForBrowser(navigator.languages ?? [navigator.language]);

    (async () => {
      let detected: Lang | null = null;
      try {
        const { getVisitorCountry } = await import("@/lib/geo.functions");
        const { country } = await getVisitorCountry();
        detected = langForCountry(country);
      } catch {
        detected = null;
      }
      if (cancelled) return;
      const next = detected ?? fromBrowser ?? DEFAULT_LANG;
      setLangState(next);
      persist(next);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = LANG_META[lang].htmlLang;
    root.dir = LANG_META[lang].dir;
    root.classList.toggle("lang-ar", lang === "ar");
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    persist(next);
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dict = DICTIONARIES[lang];
    const fallback = DICTIONARIES[DEFAULT_LANG];

    const t: Translate = (key, vars) => {
      const raw = lookup(dict, key) ?? lookup(fallback, key);
      if (typeof raw === "string") return interpolate(raw, vars);
      if (typeof raw === "number") return String(raw);
      // Never surface a raw key.
      return "";
    };

    const tList = <T,>(key: string): T[] => {
      const raw = lookup(dict, key) ?? lookup(fallback, key);
      return Array.isArray(raw) ? (raw as T[]) : [];
    };

    return { lang, dir: LANG_META[lang].dir, isRTL: lang === "ar", setLang, t, tList };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/** Shorthand: const { t } = useT(); */
export const useT = useI18n;