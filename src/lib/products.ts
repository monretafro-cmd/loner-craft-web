import { galleryImages, PHOTOS } from "@/lib/photos";

const wallet = PHOTOS.walletOpenCards.src ?? PHOTOS.walletWrappedThankYou.src ?? "";
const cardholder = wallet;
const passport = wallet;
const moneyclip = wallet;
const keyholder = wallet;
const custom = wallet;

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  image: string;
};

export const categories: Category[] = [
  { slug: "wallets", name: "Wallets", blurb: "Everyday bifolds cut from full-grain hides.", image: wallet },
  { slug: "card-holders", name: "Card Holders", blurb: "Slim carry, hand-burnished edges.", image: cardholder },
  { slug: "passport-holders", name: "Passport Holders", blurb: "Travel companions built to age well.", image: passport },
  { slug: "money-clips", name: "Money Clips", blurb: "Minimal cash carry with brushed steel.", image: moneyclip },
  { slug: "key-holders", name: "Key Holders", blurb: "Quiet keys, solid brass hardware.", image: keyholder },
  { slug: "custom", name: "Custom Leather", blurb: "Made to your initials and measurements.", image: custom },
];

export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  colors: string[];
  leather: string;
  dimensions: string;
  inStock: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  sold: number;
  rating: number;
  reviews: number;
  images: string[];
  short: string;
  description: string;
  createdAt: string;
};

export const products: Product[] = [
  {
    slug: "alpha-wallet",
    name: "ALPHA WALLET",
    category: "wallets",
    price: 300,
    colors: ["Dark Brown"],
    leather: "100% genuine Moroccan goat leather",
    dimensions: "Approx. 12 × 7.5 cm",
    inStock: true,
    bestSeller: true,
    sold: 0,
    rating: 5,
    reviews: 0,
    images: galleryImages(),
    short:
      "A slim handmade leather wallet designed for everyday carry, made from genuine Moroccan goat leather.",
    description:
      "Discover the Alpha Wallet by Loner Leather. A slim handmade leather wallet designed for everyday carry. Made from genuine Moroccan goat leather using traditional craftsmanship. Compact, elegant, durable, and built to age beautifully.",
    createdAt: "2026-07-01",
  },
];

export const allColors = Array.from(new Set(products.flatMap((p) => p.colors))).sort();

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const categoryName = (slug: string) =>
  categories.find((c) => c.slug === slug)?.name ?? slug;

export const relatedProducts = (product: Product) =>
  products
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => (b.category === product.category ? 1 : 0) - (a.category === product.category ? 1 : 0))
    .slice(0, 4);

export const faqs = [
  {
    q: "How long does shipping take?",
    a: "Orders leave our Taroudant workshop within 24–48 hours. Delivery takes 24–48 hours in Casablanca, Rabat and Taroudant, and 2–4 working days everywhere else in Morocco.",
  },
  {
    q: "Do you deliver all over Morocco?",
    a: "Yes. We deliver to all 12 regions, including rural communes, through our courier partners. Free delivery on every order above 500 MAD.",
  },
  {
    q: "Can I pay cash on delivery?",
    a: "Cash on Delivery is our only payment method. You pay the courier in cash when the parcel reaches your hands — nothing upfront, no card details.",
  },
  {
    q: "Can I exchange products?",
    a: "You have 14 days from delivery to exchange any unused piece in its original box. Custom-engraved items are excluded because they are made to your initials.",
  },
  {
    q: "Is the leather genuine?",
    a: "Every piece is full-grain leather, vegetable-tanned in Morocco. No bonded leather, no PU coating. Each item ships with a certificate of origin from the tannery.",
  },
];

export const testimonials = [
  {
    name: "Youssef B.",
    city: "Casablanca",
    text: "I've carried the Alpha Wallet for eight months. The colour has deepened beautifully and not one stitch has moved. Worth every dirham.",
  },
  {
    name: "Amine T.",
    city: "Rabat",
    text: "Ordered by WhatsApp on a Tuesday, paid the courier cash on Thursday morning. The packaging alone made it feel like a gift to myself.",
  },
  {
    name: "Sara El M.",
    city: "Taroudant",
    text: "I bought the engraved belt set for my husband's birthday. The initials were perfect and the leather smells incredible.",
  },
];