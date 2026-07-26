/**
 * Original Loner Leather photography.
 *
 * Only real, brand-supplied photos belong here — no stock, no generated images.
 * Drop the uploaded files into `src/assets/uploads/` and import them below.
 */
import heroAsset from "@/assets/hero-packaged-wallet.png.asset.json";
import packagingAsset from "@/assets/packaging-box.png.asset.json";

export type BrandPhoto = { src: string | null; alt: string; label: string };

export const PHOTOS: Record<"heroPackaged" | "walletOpen" | "packagingBox", BrandPhoto> = {
  heroPackaged: {
    src: heroAsset.url,
    alt: "Loner Leather wallet packaged with burlap, rope and a thank-you card on a dark wooden table",
    label: "Hero — packaged wallet on dark wood",
  },
  walletOpen: {
    src: null,
    alt: "Open Loner Leather wallet showing card slots, cash compartment and white hand stitching",
    label: "Product — open wallet",
  },
  packagingBox: {
    src: packagingAsset.url,
    alt: "Loner Leather white gift box with branded packaging",
    label: "Packaging — white box",
  },
};
