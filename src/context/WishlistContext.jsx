import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client';
import { useAuth } from './AuthContext';
import { useT } from '../i18n/I18nContext';

const WishlistContext = createContext(null);
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const { t } = useT();
  const nav = useNavigate();
  const [ids, setIds] = useState([]);

  useEffect(() => {
    if (!user) { setIds([]); return; }
    api.get('/api/wishlist/ids').then((r) => setIds(r.data)).catch(() => {});
  }, [user]);

  const toggle = useCallback(async (productId) => {
    if (!user) { toast(t('w.signin'), { icon: '♡' }); nav('/login?next=' + encodeURIComponent(window.location.pathname.slice(import.meta.env.BASE_URL.length - 1) || '/')); return; }
    const has = ids.includes(productId);
    setIds((prev) => (has ? prev.filter((i) => i !== productId) : [...prev, productId])); // optimistic
    try {
      const { data } = has ? await api.delete(`/api/wishlist/${productId}`) : await api.post(`/api/wishlist/${productId}`);
      setIds(data);
      toast.success(has ? t('w.removed') : t('w.added'));
    } catch (e) {
      setIds((prev) => (has ? [...prev, productId] : prev.filter((i) => i !== productId)));
      toast.error(errMsg(e));
    }
  }, [ids, user, nav, t]);

  const value = useMemo(() => ({ ids, has: (id) => ids.includes(id), toggle, count: ids.length }), [ids, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
