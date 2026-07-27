import type { Lang } from "./config";

import enCommon from "@/locales/en/common.json";
import enHome from "@/locales/en/home.json";
import enShop from "@/locales/en/shop.json";
import enProduct from "@/locales/en/product.json";
import enPages from "@/locales/en/pages.json";
import enCheckout from "@/locales/en/checkout.json";
import enCatalog from "@/locales/en/catalog.json";

import frCommon from "@/locales/fr/common.json";
import frHome from "@/locales/fr/home.json";
import frShop from "@/locales/fr/shop.json";
import frProduct from "@/locales/fr/product.json";
import frPages from "@/locales/fr/pages.json";
import frCheckout from "@/locales/fr/checkout.json";
import frCatalog from "@/locales/fr/catalog.json";

import arCommon from "@/locales/ar/common.json";
import arHome from "@/locales/ar/home.json";
import arShop from "@/locales/ar/shop.json";
import arProduct from "@/locales/ar/product.json";
import arPages from "@/locales/ar/pages.json";
import arCheckout from "@/locales/ar/checkout.json";
import arCatalog from "@/locales/ar/catalog.json";

export type Dict = Record<string, unknown>;

const merge = (...parts: Dict[]): Dict => Object.assign({}, ...parts);

export const DICTIONARIES: Record<Lang, Dict> = {
  en: merge(enCommon, enHome, enShop, enProduct, enPages, enCheckout, enCatalog),
  fr: merge(frCommon, frHome, frShop, frProduct, frPages, frCheckout, frCatalog),
  ar: merge(arCommon, arHome, arShop, arProduct, arPages, arCheckout, arCatalog),
};