/**
 * Original Loner Leather photography.
 *
 * Only real, brand-supplied photos belong here — no stock, no generated images.
 * Drop the uploaded files into `src/assets/uploads/` and import them below.
 */
export type BrandPhoto = { src: string | null; alt: string; label: string };

export const PHOTOS: Record<"heroPackaged" | "walletOpen" | "packagingBox", BrandPhoto> = {
  heroPackaged: {
    src: null,
    alt: "Loner Leather wallet packaged with burlap, rope and a thank-you card on a dark wooden table",
    label: "Hero — packaged wallet on dark wood",
  },
  walletOpen: {
    src: null,
    alt: "Open Loner Leather wallet showing card slots, cash compartment and white hand stitching",
    label: "Product — open wallet",
  },
  packagingBox: {
    src: null,
    alt: "Loner Leather white gift box with branded packaging",
    label: "Packaging — white box",
  },
};
