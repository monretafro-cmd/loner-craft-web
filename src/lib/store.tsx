import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BRAND } from "./brand";

export type CartLine = {
  slug: string;
  name: string;
  price: number;
  image: string;
  color: string;
  qty: number;
};

type StoreValue = {
  lines: CartLine[];
  wishlist: string[];
  recent: string[];
  cartOpen: boolean;
  coupon: string | null;
  setCartOpen: (open: boolean) => void;
  addLine: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (slug: string, color: string, qty: number) => void;
  removeLine: (slug: string, color: string) => void;
  clearCart: () => void;
  toggleWish: (slug: string) => boolean;
  pushRecent: (slug: string) => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  count: number;
};

const StoreContext = createContext<StoreValue | null>(null);

const COUPONS: Record<string, number> = { LONER10: 0.1, MEDINA15: 0.15 };

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(read<CartLine[]>("ll_cart", []));
    setWishlist(read<string[]>("ll_wish", []));
    setRecent(read<string[]>("ll_recent", []));
    setCoupon(read<string | null>("ll_coupon", null));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("ll_cart", JSON.stringify(lines));
    window.localStorage.setItem("ll_wish", JSON.stringify(wishlist));
    window.localStorage.setItem("ll_recent", JSON.stringify(recent));
    window.localStorage.setItem("ll_coupon", JSON.stringify(coupon));
  }, [hydrated, lines, wishlist, recent, coupon]);

  const addLine = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.slug === line.slug && l.color === line.color);
      if (i === -1) return [...prev, { ...line, qty }];
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + qty };
      return next;
    });
  }, []);

  const setQty = useCallback((slug: string, color: string, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.slug === slug && l.color === color ? { ...l, qty: Math.max(0, qty) } : l))
        .filter((l) => l.qty > 0),
    );
  }, []);

  const removeLine = useCallback((slug: string, color: string) => {
    setLines((prev) => prev.filter((l) => !(l.slug === slug && l.color === color)));
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
    setCoupon(null);
  }, []);

  const toggleWish = useCallback((slug: string) => {
    let added = false;
    setWishlist((prev) => {
      added = !prev.includes(slug);
      return added ? [...prev, slug] : prev.filter((s) => s !== slug);
    });
    return added;
  }, []);

  const pushRecent = useCallback((slug: string) => {
    setRecent((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, 6));
  }, []);

  const applyCoupon = useCallback((code: string) => {
    const key = code.trim().toUpperCase();
    if (!key) return { ok: false, message: "Enter a coupon code." };
    if (!(key in COUPONS)) return { ok: false, message: `"${key}" is not a valid code.` };
    setCoupon(key);
    return { ok: true, message: `${key} applied — ${COUPONS[key] * 100}% off.` };
  }, []);

  const value = useMemo<StoreValue>(() => {
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const discount = coupon ? Math.round(subtotal * (COUPONS[coupon] ?? 0)) : 0;
    const after = subtotal - discount;
    const shipping = after === 0 || after >= BRAND.freeShippingFrom ? 0 : BRAND.shippingFlat;
    return {
      lines,
      wishlist,
      recent,
      cartOpen,
      coupon,
      setCartOpen,
      addLine,
      setQty,
      removeLine,
      clearCart,
      toggleWish,
      pushRecent,
      applyCoupon,
      subtotal,
      discount,
      shipping,
      total: after + shipping,
      count: lines.reduce((sum, l) => sum + l.qty, 0),
    };
  }, [
    lines,
    wishlist,
    recent,
    cartOpen,
    coupon,
    addLine,
    setQty,
    removeLine,
    clearCart,
    toggleWish,
    pushRecent,
    applyCoupon,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}