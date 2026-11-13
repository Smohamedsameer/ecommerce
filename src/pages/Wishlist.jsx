import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Empty, ProductGrid, SkeletonGrid } from '../components/ui';
import { useWishlist } from '../context/WishlistContext';
import { useT } from '../i18n/I18nContext';

export default function Wishlist() {
  const { t } = useT();
  const { ids } = useWishlist();
  const [list, setList] = useState(null);
  useEffect(() => { api.get('/api/wishlist').then((r) => setList(r.data)).catch(() => setList([])); }, []);
  // items disappear as soon as the heart is un-ticked
  const shown = (list || []).filter((p) => ids.includes(p.id));
  return (
    <>
      <div className="page-head"><div className="container"><h1>{t('w.title')}</h1><p>{t('w.sub')}</p></div></div>
      <div className="container" style={{ padding: '32px 0 72px' }}>
        {list === null ? <SkeletonGrid n={4} /> : shown.length === 0
          ? <Empty title={t('w.empty.t')} action={<Link to="/shop" className="btn">{t('o.browse')}</Link>}>{t('w.empty.s')}</Empty>
          : <ProductGrid products={shown} />}
      </div>
    </>
  );
}
