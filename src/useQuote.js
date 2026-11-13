import { useEffect, useState } from 'react';
import api, { errMsg } from './api/client';
import { useCart } from './context/CartContext';
import useDebounced from './useDebounced';

/** Asks the server for the price breakdown, so the browser never decides prices. */
export default function useQuote() {
  const { items, payloadItems, coupon } = useCart();
  const key = useDebounced(JSON.stringify({ items: payloadItems, coupon }), 250);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) { setQuote(null); setError(''); return undefined; }
    let cancelled = false;
    setLoading(true);
    const { items: lines, coupon: code } = JSON.parse(key);
    api.post('/api/orders/quote', { items: lines, couponCode: code || null })
      .then((r) => { if (!cancelled) { setQuote(r.data); setError(''); } })
      .catch((e) => { if (!cancelled) { setQuote(null); setError(errMsg(e)); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [key, items.length]);

  return { quote, error, loading };
}
