import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarCheck, Heart, Lock, RotateCcw, Share2, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client';
import { Empty, Modal, ProductGrid, Reveal, Spinner, Stars } from '../components/ui';
import { scrollToEl } from '../components/SiteLayout';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStoreInfo } from '../context/StoreInfoContext';
import { useWishlist } from '../context/WishlistContext';
import { useT } from '../i18n/I18nContext';
import { addBusinessDays, dateOnly, dateShort, getRecent, imageUrl, money, pushRecent } from '../utils';
import { LOW_STOCK } from '../config';

const SIZE_ROWS = [['S', 38, 27, 17], ['M', 40, 28, 18], ['L', 42, 29, 19], ['XL', 44, 30, 20], ['XXL', 46, 31, 21]];

function SizeGuide({ onClose }) {
  const { t } = useT();
  return (
    <Modal title={t('sg.title')} onClose={onClose} narrow>
      <p className="muted small">{t('sg.note')}</p>
      <table className="size-table">
        <thead><tr><th>{t('p.size')}</th><th>{t('sg.chest')}</th><th>{t('sg.length')}</th><th>{t('sg.shoulder')}</th></tr></thead>
        <tbody>{SIZE_ROWS.map((r) => <tr key={r[0]}><th>{r[0]}</th><td>{r[1]}"</td><td>{r[2]}"</td><td>{r[3]}"</td></tr>)}</tbody>
      </table>
    </Modal>
  );
}

function Reviews({ productId, summary, reload }) {
  const { user } = useAuth();
  const { t } = useT();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const total = summary.count || 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error(t('r.choose'));
    setBusy(true);
    try {
      await api.post(`/api/products/${productId}/reviews`, { rating, comment });
      toast.success(t('r.thanks')); setRating(0); setComment(''); reload();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="reviews">
      <div>
        <div className="score">{total ? summary.average.toFixed(1) : '–'}</div>
        <div style={{ margin: '8px 0 4px' }}><Stars value={summary.average} size={20} /></div>
        <div className="muted small">{t('r.count', { n: total })}</div>
        <div className="bars">
          {[5, 4, 3, 2, 1].map((s) => {
            const n = summary.distribution?.[s] || 0;
            return (
              <div className="bar-row" key={s}>
                <span>{s}★</span><div className="bar-track"><div className="bar-fill" style={{ width: total ? `${(n / total) * 100}%` : 0 }} /></div><span className="muted">{n}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        {user ? (
          <form onSubmit={submit} className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 8 }}>{t('r.rate')}</h3>
            <div role="radiogroup" aria-label={t('r.rate')} style={{ marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button type="button" key={s} role="radio" aria-checked={rating === s} aria-label={`${s}`} className={`star-btn ${s <= rating ? 'on' : ''}`} onClick={() => setRating(s)}>
                  <Star fill={s <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <textarea className="input" placeholder={t('r.ph')} value={comment} maxLength={1000} onChange={(e) => setComment(e.target.value)} />
            <div className="row between wrap" style={{ marginTop: 12 }}><span className="hint">{t('r.hint')}</span><button className="btn forest" disabled={busy}>{busy ? t('r.posting') : t('r.post')}</button></div>
          </form>
        ) : <div className="card" style={{ marginBottom: 24 }}><Link to={`/login?next=/product/${productId}`}>{t('nav.signin')}</Link>. {t('r.signin')}</div>}
        {summary.reviews.length === 0 ? <p className="muted">{t('r.none')}</p> : summary.reviews.map((r) => (
          <div className="review" key={r.id}>
            <div className="row wrap"><Stars value={r.rating} /><b>{r.userName}</b>
              {r.verifiedPurchase ? <span className="badge ok"><ShieldCheck size={12} /> {t('r.verified')}</span> : null}
              <span className="muted small">{dateOnly(r.createdAt)}</span></div>
            {r.comment ? <p>{r.comment}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { t } = useT();
  const info = useStoreInfo();
  const { add } = useCart();
  const wish = useWishlist();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');
  const [related, setRelated] = useState([]);
  const [summary, setSummary] = useState({ average: 0, count: 0, distribution: {}, reviews: [] });
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('desc');
  const [guide, setGuide] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const [pin, setPin] = useState('');
  const [eta, setEta] = useState(null);
  const [pinErr, setPinErr] = useState(false);
  const [shake, setShake] = useState(false);
  const [stuck, setStuck] = useState(false);
  const buyRef = useRef(null);
  const tabsRef = useRef(null);

  const loadReviews = () => api.get(`/api/products/${id}/reviews`).then((r) => setSummary(r.data)).catch(() => {});

  useEffect(() => {
    setP(null); setError(''); setSize(''); setQty(1); setRelated([]); setTab('desc'); setEta(null); setZoom(false);
    api.get(`/api/products/${id}`).then((r) => { setP(r.data); pushRecent(r.data); }).catch((e) => setError(errMsg(e, t('p.unavailable'))));
    api.get(`/api/products/${id}/related`, { params: { limit: 4 } }).then((r) => setRelated(r.data)).catch(() => {});
    loadReviews();
    // eslint-disable-next-line
  }, [id]);

  // show the sticky buy bar on phones once the main buy buttons scroll away
  useEffect(() => {
    const el = buyRef.current; if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el); return () => io.disconnect();
  }, [p]);

  if (error) return <div className="container"><Empty title={t('p.unavailable')} action={<Link to="/shop" className="btn">{t('p.backShop')}</Link>}>{error}</Empty></div>;
  if (!p) return <Spinner />;

  const needsSize = p.sizes.length > 0;
  const out = p.stock <= 0;
  const recent = getRecent().filter((x) => x.id !== p.id).slice(0, 4);

  const addToCart = (go) => {
    if (needsSize && !size) { setShake(true); setTimeout(() => setShake(false), 450); return toast.error(t('p.pick')); }
    add(p, size || null, qty);
    if (go) nav('/cart'); else toast.success(t('p.added'));
  };
  const checkPin = () => {
    if (!/^[0-9]{6}$/.test(pin)) { setPinErr(true); setEta(null); return; }
    setPinErr(false); setEta(addBusinessDays(info.deliveryDays));
  };
  const share = async () => {
    const url = window.location.href;
    try { if (navigator.share) await navigator.share({ title: p.name, url }); else { await navigator.clipboard.writeText(url); toast.success(t('p.copied')); } } catch { /* cancelled */ }
  };
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };
  const goReviews = () => { setTab('reviews'); setTimeout(() => scrollToEl(tabsRef.current), 60); };
  const on = wish.has(p.id);

  return (
    <div className="container">
      <div className="crumbs"><Link to="/">{t('nav.home')}</Link> / <Link to="/shop">{t('nav.shop')}</Link> / <Link to={`/shop?category=${encodeURIComponent(p.category)}`}>{p.category}</Link></div>
      <div className="detail">
        <Reveal variant="left">
          <div className={`gallery ${zoom ? 'zoom' : ''}`} onClick={() => setZoom(!zoom)} onMouseMove={zoom ? onMove : undefined} onMouseLeave={() => setZoom(false)}>
            <img src={imageUrl(p.imageUrl)} alt={p.name} style={{ transformOrigin: origin }} />
          </div>
        </Reveal>
        <Reveal variant="right">
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <span className="muted" style={{ fontWeight: 600 }}>{p.brand || p.category}</span>
            <div className="row" style={{ gap: 8 }}>
              <button className={`icon-btn ${on ? 'danger' : ''}`} onClick={() => wish.toggle(p.id)} aria-pressed={on} aria-label={on ? t('p.unwish') : t('p.wish')} title={on ? t('p.unwish') : t('p.wish')}>
                <Heart size={18} fill={on ? '#D6403A' : 'none'} color={on ? '#D6403A' : 'currentColor'} />
              </button>
              <button className="icon-btn" onClick={share} aria-label={t('p.share')} title={t('p.share')}><Share2 size={18} /></button>
            </div>
          </div>
          <h1>{p.name}</h1>
          <button className="row link-btn" style={{ textDecoration: 'none', color: 'inherit' }} onClick={goReviews}>
            <Stars value={p.avgRating} size={19} />
            <span className="muted">{p.ratingCount ? `${p.avgRating.toFixed(1)} · ${t('r.count', { n: p.ratingCount })}` : t('p.noReviews')}</span>
          </button>
          <div className="price-row">
            <b>{money(p.price)}</b>
            {p.mrp && Number(p.mrp) > Number(p.price) ? <><s className="muted">{money(p.mrp)}</s><span className="badge brass">{t('c.off', { n: p.discountPercent })}</span></> : null}
          </div>
          <p className="muted small">{t('p.tax')}</p>

          {needsSize ? (
            <>
              <div className="size-head"><span className="label">{t('p.size')}</span><button className="link-btn small" onClick={() => setGuide(true)}>{t('p.guide')}</button></div>
              <div className={`size-grid ${shake ? 'shake' : ''}`} role="radiogroup" aria-label={t('p.size')}>
                {p.sizes.map((s) => <button key={s} role="radio" aria-checked={size === s} className={`size-btn ${size === s ? 'active' : ''}`} onClick={() => setSize(s)}>{s}</button>)}
              </div>
            </>
          ) : null}

          <div className="buy-row" ref={buyRef}>
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="−">−</button><span aria-live="polite">{qty}</span>
              <button onClick={() => setQty(Math.min(Math.min(20, p.stock || 1), qty + 1))} aria-label="+">+</button>
            </div>
            <button className="btn forest" disabled={out} onClick={() => addToCart(false)}><ShoppingBag size={18} /> {t('c.add')}</button>
            <button className="btn outline" disabled={out} onClick={() => addToCart(true)}>{t('c.buyNow')}</button>
          </div>
          {out ? <div className="stock-out">{t('c.outOfStock')}</div> : p.stock <= LOW_STOCK ? <div className="stock-low">{t('c.onlyLeft', { n: p.stock })}</div> : null}

          <div className="delivery-box" style={{ marginTop: 16 }}>
            <div className="row"><CalendarCheck size={18} color="var(--link)" /><b>{t('p.delivery')}</b></div>
            <div className="row">
              <input className="input" inputMode="numeric" maxLength={6} placeholder={t('p.pin')} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => e.key === 'Enter' && checkPin()} aria-invalid={pinErr} />
              <button className="btn ghost" onClick={checkPin}>{t('p.check')}</button>
            </div>
            {pinErr ? <span className="error-text">{t('p.badPin')}</span> : null}
            {eta ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>{t('p.deliverBy', { date: dateShort(eta) })}</span> : null}
          </div>

          <div className="perks">
            <div className="perk"><Truck size={20} />{t('p.perk1', { n: money(info.freeDeliveryAbove) })}</div>
            <div className="perk"><RotateCcw size={20} />{p.returnable ? t('p.perk2', { n: info.returnWindowDays }) : t('p.notReturnable')}</div>
            <div className="perk"><Lock size={20} />{t('p.perk3')}</div>
          </div>
        </Reveal>
      </div>

      <div ref={tabsRef} style={{ marginBottom: 56 }}>
        <div className="tabs" role="tablist">
          {[['desc', t('p.tab.desc')], ['details', t('p.tab.details')], ['reviews', t('p.tab.reviews', { n: p.ratingCount })], ['ship', t('p.tab.ship')]].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="tab-body" key={tab}>
          {tab === 'desc' && <p className="prose muted">{p.description || t('p.noDesc')}</p>}
          {tab === 'details' && (
            <dl className="spec">
              <dt>{t('p.brand')}</dt><dd>{p.brand || '–'}</dd>
              <dt>{t('p.category')}</dt><dd>{p.category}</dd>
              <dt>{t('p.material')}</dt><dd>{p.material || '–'}</dd>
              <dt>{t('p.fit')}</dt><dd>{p.fit || '–'}</dd>
              <dt>{t('p.care')}</dt><dd>{p.care || '–'}</dd>
              <dt>{t('p.returns')}</dt><dd>{p.returnable ? t('p.returnable', { n: info.returnWindowDays }) : t('p.notReturnable')}</dd>
              <dt>{t('p.seller')}</dt><dd>{p.sellerName}</dd>
            </dl>
          )}
          {tab === 'reviews' && <Reviews productId={id} summary={summary} reload={() => { loadReviews(); api.get(`/api/products/${id}`).then((r) => setP(r.data)); }} />}
          {tab === 'ship' && (
            <div className="prose">
              <ul><li>{t('p.ship.1')}</li><li>{t('p.ship.2', { n: info.deliveryDays })}</li><li>{t('p.ship.3', { n: info.returnWindowDays })}</li></ul>
              <Link to="/policy/returns" className="link-btn">{t('pol.returns')}</Link> · <Link to="/policy/refunds" className="link-btn">{t('pol.refunds')}</Link>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="section tight">
          <Reveal className="section-head"><div><h2>{t('p.related')}</h2><span className="rule" /></div></Reveal>
          <ProductGrid products={related} />
        </section>
      ) : null}
      {recent.length > 0 ? (
        <section className="section tight">
          <Reveal className="section-head"><div><h2>{t('p.recent')}</h2><span className="rule" /></div></Reveal>
          <ProductGrid products={recent} />
        </section>
      ) : null}

      <div className={`mobile-buy ${stuck && !out ? 'show' : ''}`}>
        <div><b style={{ fontSize: '1.15rem' }}>{money(p.price)}</b></div>
        <button className="btn forest" onClick={() => addToCart(false)}><ShoppingBag size={18} /> {t('c.add')}</button>
      </div>
      {guide ? <SizeGuide onClose={() => setGuide(false)} /> : null}
    </div>
  );
}
