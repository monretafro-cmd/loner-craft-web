export const BRAND = {
  name: "Loner Leather",
  tagline: "Handmade Leather That Lasts For Years.",
  phoneDisplay: "+212 6 61 24 88 03",
  whatsapp: "212661248803",
  email: "hello@lonerleather.ma",
  instagram: "https://instagram.com/lonerleather",
  facebook: "https://facebook.com/lonerleather",
  address: "142 Rue Dar El Bacha, Medina, Marrakech 40000, Morocco",
  hours: [
    { day: "Monday – Friday", time: "09:00 – 19:00" },
    { day: "Saturday", time: "10:00 – 18:00" },
    { day: "Sunday", time: "Closed" },
  ],
  freeShippingFrom: 500,
  shippingFlat: 35,
};

export const formatMAD = (value: number) =>
  `${new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(value)} MAD`;

export function whatsappLink(message: string) {
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function productOrderMessage(input: {
  product: string;
  color?: string;
  quantity?: number;
}) {
  return [
    "Hello, I would like to order:",
    `Product: ${input.product}`,
    `Color: ${input.color ?? ""}`,
    `Quantity: ${input.quantity ?? 1}`,
    "Name:",
    "Phone:",
    "Address:",
  ].join("\n");
}