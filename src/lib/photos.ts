/**
 * Original Loner Leather photography.
 *
 * Only real, brand-supplied photos belong here — no stock, no generated images.
 * Upload the file, create an asset pointer, then fill the matching slot below.
 * Slots left as `null` are simply skipped everywhere they are used.
 */
import heroAsset from "@/assets/hero-packaged-wallet.png.asset.json";
import packagingAsset from "@/assets/packaging-box.png.asset.json";

export type BrandPhoto = { src: string | null; alt: string; label: string };

/** Ordered gallery slots for the Alpha Wallet, in the exact display order. */
export type GallerySlot =
  | "walletOpenCards"
  | "walletFront"
  | "walletBack"
  | "walletInPackaging"
  | "walletWrappedThankYou"
  | "walletDetails"
  | "stitchingCloseUp"
  | "leatherTexture"
  | "packagingBox"
  | "lifestyle";

export const GALLERY_ORDER: GallerySlot[] = [
  "walletOpenCards",
  "walletFront",
  "walletBack",
  "walletInPackaging",
  "walletWrappedThankYou",
  "walletDetails",
  "stitchingCloseUp",
  "leatherTexture",
  "packagingBox",
  "lifestyle",
];

export const PHOTOS: Record<GallerySlot, BrandPhoto> = {
  walletOpenCards: {
    src: null,
    alt: "Alpha Wallet open with cards — handmade leather wallet Morocco",
    label: "Open wallet showing cards",
  },
  walletFront: {
    src: null,
    alt: "Alpha Wallet front, closed — handmade Moroccan goat leather wallet",
    label: "Front closed wallet",
  },
  walletBack: {
    src: null,
    alt: "Alpha Wallet back view — slim handmade leather wallet",
    label: "Back view",
  },
  walletInPackaging: {
    src: null,
    alt: "Alpha Wallet packaging — wallet inside its Loner Leather box",
    label: "Wallet inside packaging",
  },
  walletWrappedThankYou: {
    src: heroAsset.url,
    alt: "Alpha Wallet wrapped in burlap and twine with a Loner Leather thank-you card",
    label: "Wrapped with Thank You card",
  },
  walletDetails: {
    src: null,
    alt: "Alpha Wallet detail — hand-finished edges and card slots",
    label: "Wallet details",
  },
  stitchingCloseUp: {
    src: null,
    alt: "Hand stitching close-up on the Alpha Wallet by Loner Leather",
    label: "Stitching close-up",
  },
  leatherTexture: {
    src: null,
    alt: "Genuine Moroccan goat leather texture used for the Alpha Wallet",
    label: "Leather texture",
  },
  packagingBox: {
    src: packagingAsset.url,
    alt: "Alpha Wallet packaging — Loner Leather gift-ready box",
    label: "Packaging box",
  },
  lifestyle: {
    src: null,
    alt: "Alpha Wallet in everyday carry — handmade leather wallet Morocco",
    label: "Lifestyle photo",
  },
};

/** Optional product videos — rendered right after the first gallery image. */
export const PRODUCT_VIDEOS: { src: string; poster?: string; label: string }[] = [];

export type GalleryItem = { type: "image" | "video"; src: string; poster?: string; alt: string };

/** Real photos only, in slot order, with any uploaded video placed after the first image. */
export const productGallery = (): GalleryItem[] => {
  const images = GALLERY_ORDER.map((slot) => PHOTOS[slot])
    .filter((p): p is BrandPhoto & { src: string } => Boolean(p.src))
    .map<GalleryItem>((p) => ({ type: "image", src: p.src, alt: p.alt }));

  const videos = PRODUCT_VIDEOS.map<GalleryItem>((v) => ({
    type: "video",
    src: v.src,
    poster: v.poster,
    alt: v.label,
  }));

  return images.length ? [images[0], ...videos, ...images.slice(1)] : videos;
};

export const galleryImages = () => productGallery().map((i) => i.src);
