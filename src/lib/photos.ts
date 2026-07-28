/**
 * Original Loner Leather photography.
 *
 * Only real, brand-supplied photos belong here — no stock, no generated images.
 * Upload the file, create an asset pointer, then fill the matching slot below.
 * Slots left as `null` are simply skipped everywhere they are used.
 *
 * The gallery scales automatically from a handful of photos to 50+: fill slots
 * here, or append anything extra to `EXTRA_PHOTOS`. No layout work required.
 */
import heroAsset from "@/assets/hero-packaged-wallet.png.asset.json";
import packagingAsset from "@/assets/packaging-box.png.asset.json";

/** Editorial groups shown as chapter headings inside the gallery. */
export type GallerySection =
  | "overview"
  | "capacity"
  | "leather"
  | "stitching"
  | "embossing"
  | "inUse"
  | "packaging"
  | "craft"
  | "workshop";

export type BrandPhoto = {
  src: string | null;
  alt: string;
  /** Short premium chip shown on the image, e.g. "Front", "Stitching". */
  label: string;
  section?: GallerySection;
};

/** Ordered gallery slots for the Alpha Wallet, in the exact display order. */
export type GallerySlot =
  | "walletOpenCards"
  | "walletFront"
  | "walletBack"
  | "openInterior"
  | "holdingCards"
  | "withCash"
  | "stitchingCloseUp"
  | "leatherTexture"
  | "logoEmbossing"
  | "cornerFinishing"
  | "sideProfile"
  | "slimThickness"
  | "walletInHand"
  | "packagingBox"
  | "walletWrappedThankYou"
  | "thankYouCard"
  | "fullPackageContents"
  | "lifestyle"
  | "craftsmanshipDetail"
  | "workshop"
  /** kept for older references */
  | "walletInPackaging"
  | "walletDetails";

export const GALLERY_ORDER: GallerySlot[] = [
  "walletOpenCards",
  "walletFront",
  "walletBack",
  "openInterior",
  "holdingCards",
  "withCash",
  "stitchingCloseUp",
  "leatherTexture",
  "logoEmbossing",
  "cornerFinishing",
  "sideProfile",
  "slimThickness",
  "walletInHand",
  "walletInPackaging",
  "packagingBox",
  "walletWrappedThankYou",
  "thankYouCard",
  "fullPackageContents",
  "lifestyle",
  "walletDetails",
  "craftsmanshipDetail",
  "workshop",
];

export const PHOTOS: Record<GallerySlot, BrandPhoto> = {
  walletOpenCards: {
    src: null,
    alt: "Alpha Wallet open with cards — handmade leather wallet Morocco",
    label: "Overview",
    section: "overview",
  },
  walletFront: {
    src: null,
    alt: "Alpha Wallet front, closed — handmade Moroccan goat leather wallet",
    label: "Front",
    section: "overview",
  },
  walletBack: {
    src: null,
    alt: "Alpha Wallet back view — slim handmade leather wallet",
    label: "Back",
    section: "overview",
  },
  openInterior: {
    src: null,
    alt: "Alpha Wallet open interior — card slots and note compartment",
    label: "Inside",
    section: "overview",
  },
  holdingCards: {
    src: null,
    alt: "Alpha Wallet holding cards in its slots",
    label: "Capacity",
    section: "capacity",
  },
  withCash: {
    src: null,
    alt: "Alpha Wallet holding banknotes in the note compartment",
    label: "Capacity",
    section: "capacity",
  },
  stitchingCloseUp: {
    src: null,
    alt: "Hand stitching close-up on the Alpha Wallet by Loner Leather",
    label: "Stitching",
    section: "stitching",
  },
  leatherTexture: {
    src: null,
    alt: "Genuine Moroccan goat leather texture used for the Alpha Wallet",
    label: "Leather",
    section: "leather",
  },
  logoEmbossing: {
    src: null,
    alt: "Loner Leather logo embossed into the Alpha Wallet leather",
    label: "Embossing",
    section: "embossing",
  },
  cornerFinishing: {
    src: null,
    alt: "Hand-burnished corner finishing on the Alpha Wallet",
    label: "Details",
    section: "craft",
  },
  sideProfile: {
    src: null,
    alt: "Alpha Wallet side profile — slim handmade leather bifold",
    label: "Profile",
    section: "overview",
  },
  slimThickness: {
    src: null,
    alt: "Alpha Wallet slim thickness shown edge-on",
    label: "Slim",
    section: "overview",
  },
  walletInHand: {
    src: null,
    alt: "Alpha Wallet held in hand for scale",
    label: "In use",
    section: "inUse",
  },
  walletInPackaging: {
    src: null,
    alt: "Alpha Wallet packaging — wallet inside its Loner Leather box",
    label: "Packaging",
    section: "packaging",
  },
  packagingBox: {
    src: packagingAsset.url,
    alt: "Alpha Wallet packaging — Loner Leather gift-ready box",
    label: "Packaging",
    section: "packaging",
  },
  walletWrappedThankYou: {
    src: heroAsset.url,
    alt: "Alpha Wallet wrapped in burlap and twine with a Loner Leather thank-you card",
    label: "Gift Ready",
    section: "packaging",
  },
  thankYouCard: {
    src: null,
    alt: "Loner Leather thank-you card included with every Alpha Wallet",
    label: "Gift Ready",
    section: "packaging",
  },
  fullPackageContents: {
    src: null,
    alt: "Full Alpha Wallet package contents — wallet, box, wrap and thank-you card",
    label: "Package",
    section: "packaging",
  },
  lifestyle: {
    src: null,
    alt: "Alpha Wallet in everyday carry — handmade leather wallet Morocco",
    label: "In use",
    section: "inUse",
  },
  walletDetails: {
    src: null,
    alt: "Alpha Wallet detail — hand-finished edges and card slots",
    label: "Details",
    section: "craft",
  },
  craftsmanshipDetail: {
    src: null,
    alt: "Craftsmanship detail on the Alpha Wallet — hand-finished edge work",
    label: "Craftsmanship",
    section: "craft",
  },
  workshop: {
    src: null,
    alt: "Loner Leather workshop in Taroudant, Morocco",
    label: "Workshop",
    section: "workshop",
  },
};

/**
 * Anything uploaded later that does not match a named slot above.
 * Appended to the end of the gallery automatically — no layout changes needed.
 */
export const EXTRA_PHOTOS: BrandPhoto[] = [];

/** Optional product videos — rendered right after the first gallery image. */
export const PRODUCT_VIDEOS: { src: string; poster?: string; label: string }[] = [];

export type GalleryItem = {
  type: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  label?: string;
  section?: GallerySection;
};

/** Real photos only, in slot order, with any uploaded video placed after the first image. */
export const productGallery = (): GalleryItem[] => {
  const images = [...GALLERY_ORDER.map((slot) => PHOTOS[slot]), ...EXTRA_PHOTOS]
    .filter((p): p is BrandPhoto & { src: string } => Boolean(p.src))
    .map<GalleryItem>((p) => ({
      type: "image",
      src: p.src,
      alt: p.alt,
      label: p.label,
      section: p.section,
    }));

  const videos = PRODUCT_VIDEOS.map<GalleryItem>((v) => ({
    type: "video",
    src: v.src,
    poster: v.poster,
    alt: v.label,
    label: v.label,
  }));

  return images.length ? [images[0], ...videos, ...images.slice(1)] : videos;
};

export const galleryImages = () => productGallery().map((i) => i.src);
