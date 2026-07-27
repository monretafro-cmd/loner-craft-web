export const LANGS = ["en", "fr", "ar"] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "en";

export const LANG_META: Record<Lang, { code: string; label: string; native: string; dir: "ltr" | "rtl"; htmlLang: string }> = {
  en: { code: "EN", label: "English", native: "English", dir: "ltr", htmlLang: "en" },
  fr: { code: "FR", label: "French", native: "Français", dir: "ltr", htmlLang: "fr" },
  ar: { code: "AR", label: "Arabic", native: "العربية", dir: "rtl", htmlLang: "ar" },
};

export const isLang = (value: unknown): value is Lang =>
  typeof value === "string" && (LANGS as readonly string[]).includes(value);

export const dirFor = (lang: Lang) => LANG_META[lang].dir;

/** Country-level (approximate) mapping. Everything unmatched falls back to English. */
const ARABIC_COUNTRIES = [
  "MA", "DZ", "TN", "LY", "EG", "MR", "SA", "AE", "QA", "KW", "BH", "OM",
  "JO", "LB", "IQ", "PS", "YE", "SD", "SY", "SO", "DJ", "KM", "EH",
];

const FRENCH_COUNTRIES = [
  "FR", "BE", "CH", "LU", "MC", "SN", "CI", "ML", "BF", "NE", "TG", "BJ",
  "GA", "CG", "CD", "CM", "CF", "TD", "GN", "MG", "HT", "GP", "MQ", "RE",
  "GF", "NC", "PF", "YT",
];

export function langForCountry(country?: string | null): Lang | null {
  if (!country) return null;
  const code = country.toUpperCase();
  if (ARABIC_COUNTRIES.includes(code)) return "ar";
  if (FRENCH_COUNTRIES.includes(code)) return "fr";
  return "en";
}

export function langForBrowser(languages: readonly string[]): Lang | null {
  for (const raw of languages) {
    const base = raw.toLowerCase().split("-")[0];
    if (isLang(base)) return base;
  }
  return null;
}