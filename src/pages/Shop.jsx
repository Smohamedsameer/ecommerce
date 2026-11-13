import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import api, { errMsg } from '../api/client';
import { Empty, Pagination, ProductGrid, Reveal, SkeletonGrid } from '../components/ui';
import { scrollToEl } from '../components/SiteLayout';
import { useT } from '../i18n/I18nContext';
import useDebounced from '../useDebounced';

const PRICES = [['', 'shop.anyPrice'], ['0-1000', 'shop.p1'], ['1000-2000', 'shop.p2'], ['2000-99999', 'shop.p3']];
const RATINGS = [['', 'shop.anyRating'], ['4', 'shop.r4'], ['3', 'shop.r3']];
const SORTS = ['newest', 'rating', 'price_asc', 'price_desc', 'name'];

export default function Shop() {
  const { t } = useT();
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const price = params.get('price') || '';
  const rating = params.get('rating') || '';
  const inStock = params.get('stock') === '1';
  const page = Number(params.get('page') || 0);
  const urlQ = params.get('q') || '';

  const [q, setQ] = useState(urlQ);
  const dq = useDebounced(q, 400);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState(() => localStorage.getItem('shopView') || 'grid');

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v === '' || v == null || v === false ? next.delete(k) : next.set(k, v)));
    if (!('page' in changes)) next.delete('page');
    setParams(next, { replace: true });
  };
  const clearAll = () => { setQ(''); setParams(new URLSearchParams(), { replace: true }); };

  useEffect(() => { setQ(urlQ); }, [urlQ]);
  useEffect(() => { if (dq !== urlQ) update({ q: dq.trim() }); /* eslint-disable-next-line */ }, [dq]);
  useEffect(() => { api.get('/api/products/categories').then((r) => setCategories(r.data)).catch(() => {}); }, []);
  useEffect(() => { localStorage.setItem('shopView', view); }, [view]);

  useEffect(() => {
    setData(null); setError('');
    const [min, max] = price ? price.split('-') : [];
    api.get('/api/products', { params: { q: urlQ, category, sort, page, size: 12, minPrice: min, maxPrice: max, minRating: rating || 0, inStock } })
      .then((r) => setData(r.data)).catch((e) => setError(errMsg(e)));
  }, [urlQ, category, sort, price, rating, inStock, page]);

  const active = [
    category && { k: 'category', label: category }, price && { k: 'price', label: t(PRICES.find((p) => p[0] === price)?.[1] || 'shop.price') },
    rating && { k: 'rating', label: t(RATINGS.find((p) => p[0] === rating)?.[1] || 'shop.rating') }, inStock && { k: 'stock', label: t('shop.inStock') },
  ].filter(Boolean);

  const Chip = ({ on, children, ...rest }) => <button className={`chip ${on ? 'active' : ''}`} {...rest}>{children}</button>;

  return (
    <>
      <div className="page-head">
        <div className="container">
          <h1>{category || t('shop.all')}</h1>
          <p>{urlQ ? t('shop.results', { q: urlQ }) : t('shop.sub')}</p>
        </div>
      </div>
      <div className="container shop-layout">
        <aside className={`filters ${showFilters ? 'open' : ''}`}>
          <div className="card">
            <h4>{t('shop.category')}</h4>
            <div className="chips">
              <Chip on={!category} onClick={() => update({ category: '' })}>{t('o.f.all')}</Chip>
              {categories.map((c) => <Chip key={c} on={category === c} onClick={() => update({ category: c })}>{c}</Chip>)}
            </div>
          </div>
          <div className="card">
            <h4>{t('shop.price')}</h4>
            <div className="chips">{PRICES.map(([v, k]) => <Chip key={v} on={price === v} onClick={() => update({ price: v })}>{t(k)}</Chip>)}</div>
          </div>
          <div className="card">
            <h4>{t('shop.rating')}</h4>
            <div className="chips">{RATINGS.map(([v, k]) => <Chip key={v} on={rating === v} onClick={() => update({ rating: v })}>{t(k)}</Chip>)}</div>
          </div>
          <div className="card">
            <h4>{t('shop.avail')}</h4>
            <label className="row" style={{ justifyContent: 'space-between', cursor: 'pointer' }}>
              <span style={{ fontWeight: 600 }}>{t('shop.inStock')}</span>
              <span className="switch"><input type="checkbox" checked={inStock} onChange={(e) => update({ stock: e.target.checked ? '1' : '' })} /><i /></span>
            </label>
          </div>
        </aside>

        <section>
          <div className="toolbar">
            <label className="search"><Search size={17} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('shop.search')} aria-label={t('shop.search')} /></label>
            <div className="row">
              <button className="btn ghost sm filter-toggle" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={16} /> {t('c.filters')}</button>
              <select className="input select" value={sort} onChange={(e) => update({ sort: e.target.value })} aria-label={t('shop.sort')}>
                {SORTS.map((v) => <option key={v} value={v}>{t(`sort.${v}`)}</option>)}
              </select>
              <div className="seg view-toggle" role="group">
                <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label={t('shop.grid')}><LayoutGrid size={16} /></button>
                <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label={t('shop.list')}><List size={16} /></button>
              </div>
            </div>
          </div>

          {active.length > 0 ? (
            <div className="active-filters">
              {active.map((a) => <button key={a.k} className="fchip" onClick={() => update({ [a.k]: '' })}>{a.label}<X size={14} /></button>)}
              <button className="link-btn small" onClick={clearAll}>{t('c.clear')}</button>
            </div>
          ) : null}

          {error ? <Empty title={t('shop.fail')}>{error}</Empty>
            : data === null ? <SkeletonGrid n={6} cols={3} />
            : data.content.length === 0 ? <Empty title={t('shop.none.t')}>{t('shop.none.s')}</Empty>
            : (
              <>
                <p className="muted small">{t('shop.count', { n: data.totalElements })}</p>
                <ProductGrid products={data.content} cols={3} list={view === 'list'} />
                <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => { update({ page: p }); scrollToEl(document.querySelector('.page-head'), 0); }} />
              </>
            )}
        </section>
      </div>
    </>
  );
}
