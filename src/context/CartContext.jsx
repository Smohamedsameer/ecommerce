import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => load('cart', []));
  const [coupon, setCoupon] = useState(() => load('coupon', ''));

  useEffect(() => localStorage.setItem('cart', JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem('coupon', JSON.stringify(coupon)), [coupon]);

  const sameLine = (a, b) => a.productId === b.productId && (a.size || '') === (b.size || '');

  const add = (product, size, qty = 1) => {
    setItems((prev) => {
      const line = { productId: product.id, name: product.name, image: product.imageUrl, price: product.price,
        size: size || null, qty, stock: product.stock, brand: product.brand };
      const found = prev.find((l) => sameLine(l, line));
      if (found) {
        return prev.map((l) => (sameLine(l, line) ? { ...l, qty: Math.min(l.qty + qty, 20), price: product.price, stock: product.stock } : l));
      }
      return [...prev, line];
    });
  };
  const setQty = (line, qty) =>
    setItems((prev) => prev.map((l) => (sameLine(l, line) ? { ...l, qty: Math.max(1, Math.min(20, qty)) } : l)));
  const remove = (line) => setItems((prev) => prev.filter((l) => !sameLine(l, line)));
  const clear = () => { setItems([]); setCoupon(''); };

  const count = items.reduce((n, l) => n + l.qty, 0);
  // Display-only estimate. The server recalculates every price at checkout.
  const estimate = items.reduce((n, l) => n + l.price * l.qty, 0);
  // what the API needs
  const payloadItems = items.map((l) => ({ productId: l.productId, quantity: l.qty, size: l.size }));

  const value = useMemo(
    () => ({ items, add, setQty, remove, clear, count, estimate, payloadItems, coupon, setCoupon }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, coupon]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
