import wallet from "@/assets/p-wallet.jpg";
import cardholder from "@/assets/p-cardholder.jpg";
import passport from "@/assets/p-passport.jpg";
import moneyclip from "@/assets/p-moneyclip.jpg";
import keyholder from "@/assets/p-keyholder.jpg";
import custom from "@/assets/p-custom.jpg";
import packaging from "@/assets/packaging.jpg";
import craft from "@/assets/craft.jpg";

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
    slug: "atlas-bifold-wallet",
    name: "Atlas Bifold Wallet",
    category: "wallets",
    price: 449,
    compareAt: 590,
    colors: ["Dark Brown", "Cognac", "Black"],
    leather: "Full-grain vegetable-tanned cowhide",
    dimensions: "11.5 × 9.5 × 1.4 cm",
    inStock: true,
    bestSeller: true,
    sold: 1240,
    rating: 4.9,
    reviews: 186,
    images: [wallet, packaging, craft],
    short: "Our signature bifold — eight card slots, two note compartments.",
    description:
      "Cut from a single panel of full-grain hide tanned in Taroudant, the Atlas bifold is saddle-stitched by hand with waxed linen thread. Edges are bevelled, sanded and burnished four times so they stay sealed for years. The leather starts firm and darkens into a deep, personal patina after a few months in the pocket.",
    createdAt: "2025-11-02",
  },
  {
    slug: "medina-slim-card-holder",
    name: "Medina Slim Card Holder",
    category: "card-holders",
    price: 269,
    colors: ["Tan", "Dark Brown", "Black"],
    leather: "Full-grain calfskin",
    dimensions: "10.2 × 7.4 × 0.5 cm",
    inStock: true,
    bestSeller: true,
    isNew: true,
    sold: 980,
    rating: 4.8,
    reviews: 143,
    images: [cardholder, packaging, craft],
    short: "Four slots and a centre pull-tab. Slimmer than your phone.",
    description:
      "Three external card slots plus a centre pocket for folded notes. Skived down to a whisper at the edges so it disappears in a front pocket, yet strong enough to keep its shape after years of daily use.",
    createdAt: "2026-05-18",
  },
  {
    slug: "voyager-passport-holder",
    name: "Voyager Passport Holder",
    category: "passport-holders",
    price: 389,
    colors: ["Cognac", "Dark Brown"],
    leather: "Full-grain vegetable-tanned cowhide",
    dimensions: "14 × 10 × 1 cm",
    inStock: true,
    isNew: true,
    sold: 412,
    rating: 4.9,
    reviews: 64,
    images: [passport, packaging, craft],
    short: "Passport, two cards and a boarding pass — nothing more.",
    description:
      "A travel cover embossed with a compass rose, lined in soft suede so your passport never scuffs. Sized for all standard passports with a slot for a spare card and folded documents.",
    createdAt: "2026-06-04",
  },
  {
    slug: "sahara-money-clip",
    name: "Sahara Money Clip Wallet",
    category: "money-clips",
    price: 299,
    colors: ["Black", "Dark Brown"],
    leather: "Full-grain calfskin",
    dimensions: "10.5 × 7 × 0.9 cm",
    inStock: true,
    sold: 605,
    rating: 4.7,
    reviews: 88,
    images: [moneyclip, packaging, craft],
    short: "Brushed stainless clip, riveted through reinforced leather.",
    description:
      "For those who carry light. A solid brushed-steel clip holds notes flat against the body while four rear slots keep your essential cards to hand. Riveted, not glued.",
    createdAt: "2026-02-11",
  },
  {
    slug: "riad-key-holder",
    name: "Riad Key Holder",
    category: "key-holders",
    price: 219,
    colors: ["Dark Brown", "Tan"],
    leather: "Full-grain vegetable-tanned cowhide",
    dimensions: "9 × 3.5 × 2 cm",
    inStock: true,
    bestSeller: true,
    sold: 720,
    rating: 4.8,
    reviews: 97,
    images: [keyholder, packaging, craft],
    short: "Keeps up to six keys silent and out of the way.",
    description:
      "Solid brass hardware and a snap closure wrap your keys into a quiet bundle. No jangling, no torn pocket linings. The brass develops a warm patina alongside the leather.",
    createdAt: "2026-01-22",
  },
  {
    slug: "custom-engraved-belt",
    name: "Custom Engraved Belt & Tag Set",
    category: "custom",
    price: 649,
    colors: ["Tan", "Dark Brown", "Black"],
    leather: "Full-grain bridle leather",
    dimensions: "Made to your waist measurement",
    inStock: true,
    sold: 188,
    rating: 5,
    reviews: 41,
    images: [custom, packaging, craft],
    short: "Your initials, hand-embossed. Cut to your exact size.",
    description:
      "A bridle-leather belt with a solid brass buckle and a matching luggage tag, both hand-embossed with up to three initials. Cut and finished to your measurement, so it sits right from the first day.",
    createdAt: "2026-04-09",
  },
  {
    slug: "fes-long-wallet",
    name: "Fès Long Wallet",
    category: "wallets",
    price: 529,
    colors: ["Dark Brown", "Cognac"],
    leather: "Full-grain vegetable-tanned cowhide",
    dimensions: "19 × 9.5 × 2 cm",
    inStock: true,
    sold: 340,
    rating: 4.8,
    reviews: 52,
    images: [wallet, craft, packaging],
    short: "Twelve slots, a zip coin pouch and room for full-size notes.",
    description:
      "Built for those who carry everything. Twelve card slots, a zipped coin pouch and a full-length note section, all saddle-stitched and edge-burnished by the same hands from start to finish.",
    createdAt: "2025-12-14",
  },
  {
    slug: "nomad-card-sleeve",
    name: "Nomad Card Sleeve",
    category: "card-holders",
    price: 179,
    colors: ["Tan", "Black"],
    leather: "Full-grain calfskin",
    dimensions: "9.8 × 6.8 × 0.3 cm",
    inStock: false,
    sold: 510,
    rating: 4.6,
    reviews: 73,
    images: [cardholder, craft, packaging],
    short: "One pocket. Three cards. The lightest thing we make.",
    description:
      "A single-pocket sleeve, hand-stitched on two edges and left open at the top. It moulds to your cards in a week and never loses grip.",
    createdAt: "2026-03-02",
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
    text: "I've carried the Atlas bifold for eight months. The colour has deepened beautifully and not one stitch has moved. Worth every dirham.",
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