import { LANG_META, type Lang } from "./config";

/** Prices always stay in Moroccan Dirham — no currency conversion, ever. */
export function formatPrice(value: number, lang: Lang) {
  const amount = new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(value);
  return lang === "ar" ? `${amount} درهم` : `${amount} MAD`;
}

export function htmlLang(lang: Lang) {
  return LANG_META[lang].htmlLang;
}