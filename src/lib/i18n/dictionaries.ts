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

// common.json sits at the root (nav.*, actions.*, cart.*); every other file is
// nested under its own namespace so page keys can never shadow shared ones.
const build = (
  common: Dict,
  home: Dict,
  shop: Dict,
  product: Dict,
  pages: Dict,
  checkout: Dict,
  catalog: Dict,
): Dict => ({ ...common, home, shop, product, pages, checkout, catalog });

export const DICTIONARIES: Record<Lang, Dict> = {
  en: build(enCommon, enHome, enShop, enProduct, enPages, enCheckout, enCatalog),
  fr: build(frCommon, frHome, frShop, frProduct, frPages, frCheckout, frCatalog),
  ar: build(arCommon, arHome, arShop, arProduct, arPages, arCheckout, arCatalog),
};