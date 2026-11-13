import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { Empty, Reveal } from '../components/ui';
import { useCart } from '../context/CartContext';
import { useStoreInfo } from '../context/StoreInfoContext';
import { useT } from '../i18n/I18nContext';
import useQuote from '../useQuote';
import { imageUrl, money } from '../utils';

export function Summary({ quote, error, loading, children }) {
  const { t } = useT();
  return (
    <aside className="card summary">
      <h3>{t('cart.summary')}</h3>
      {error ? <p className="error-text">{error}</p> : null}
      {quote ? (
        <div style={{ opacity: loading ? .6 : 1, transition: 'opacity .2s' }}>
          <div className="line"><span>{t('cart.items')}</span><span>{money(quote.itemsSubtotal)}</span></div>
          <div className="line"><span>{t('cart.handling')}</span><span>{money(quote.handlingFee)}</span></div>
          <div className="line"><span>{t('cart.delivery')}</span><span>{Number(quote.deliveryFee) === 0 ? t('c.free') : money(quote.deliveryFee)}</span></div>
          <div className="line"><span>{t('cart.gst')}</span><span>{money(quote.tax)}</span></div>
          {Number(quote.discount) > 0 ? <div className="line" style={{ color: 'var(--success)' }}><span>{t('cart.coupon')} {quote.couponCode}</span><span>− {money(quote.discount)}</span></div> : null}
          <hr className="divider" />
          <div className="line total"><span>{t('c.total')}</span><span>{money(quote.total)}</span></div>
        </div>
      ) : !error ? <p className="muted">{t('cart.calc')}</p> : null}
      {children}
    </aside>
  );
}

export function CouponBox({ quote }) {
  const { t } = useT();
  const { coupon, setCoupon } = useCart();
  const [input, setInput] = useState(coupon);
  const [list, setList] = useState([]);
  useEffect(() => { api.get('/api/coupons/available').then((r) => setList(r.data)).catch(() => {}); }, []);
  const apply = (code) => { const c = (code ?? input).trim().toUpperCase(); setInput(c); setCoupon(c); };
  return (
    <div style={{ margin: '16px 0' }}>
      <div className="coupon-row">
        <input className="input" placeholder={t('cart.couponPh')} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apply()} aria-label={t('cart.couponPh')} />
        <button className="btn ghost" onClick={() => apply()}>{t('c.apply')}</button>
      </div>
      {coupon && quote?.couponMessage ? <p className={quote.couponCode ? 'small' : 'error-text'} style={{ margin: '8px 0 0', color: quote.couponCode ? 'var(--success)' : undefined }}>{quote.couponMessage}</p> : null}
      {list.length > 0 ? <div className="row wrap" style={{ marginTop: 12 }}>{list.map((c) => <button key={c.id} className="coupon-chip" onClick={() => apply(c.code)}><b>{c.code}</b>{c.description}</button>)}</div> : null}
    </div>
  );
}

export function FreeShipBar({ itemsSubtotal }) {
  const { t } = useT();
  const info = useStoreInfo();
  const target = Number(info.freeDeliveryAbove);
  const have = Number(itemsSubtotal || 0);
  const done = have >= target;
  return (
    <div className="ship-progress">
      <div className="row" style={{ gap: 8 }}><Truck size={18} color="var(--link)" /><b>{done ? t('cart.ship.done') : t('cart.ship.more', { amount: money(target - have) })}</b></div>
      <div className="bar"><i style={{ width: `${Math.min(100, (have / target) * 100)}%` }} /></div>
    </div>
  );
}

export default function Cart() {
  const { t } = useT();
  const { items, setQty, remove, estimate } = useCart();
  const { quote, error, loading } = useQuote();
  const nav = useNavigate();

  if (items.length === 0) {
    return <div className="container"><Empty title={t('cart.empty.t')} action={<Link to="/shop" className="btn">{t('cart.start')}</Link>}>{t('cart.empty.s')}</Empty></div>;
  }
  return (
    <>
      <div className="page-head"><div className="container"><h1>{t('cart.title')}</h1></div></div>
      <div className="container cart-layout">
        <section>
          <FreeShipBar itemsSubtotal={quote ? quote.itemsSubtotal : estimate} />
          <div className="card">
            {items.map((l) => (
              <div className="cart-line" key={`${l.productId}-${l.size}`}>
                <Link to={`/product/${l.productId}`} className="im"><img src={imageUrl(l.image)} alt="" /></Link>
                <div>
                  <h3><Link to={`/product/${l.productId}`} style={{ color: 'inherit' }}>{l.name}</Link></h3>
                  <div className="muted small">{l.brand}{l.size ? ` · ${t('p.size')} ${l.size}` : ''}</div>
                  <div style={{ fontWeight: 700, marginTop: 4 }}>{money(l.price)}</div>
                </div>
                <div className="line-end right row" style={{ justifyContent: 'flex-end' }}>
                  <div className="qty">
                    <button onClick={() => setQty(l, l.qty - 1)} aria-label="−">−</button><span>{l.qty}</span><button onClick={() => setQty(l, l.qty + 1)} aria-label="+">+</button>
                  </div>
                  <button className="icon-btn sm danger" onClick={() => { remove(l); toast(t('cart.removed')); }} aria-label={`${t('c.remove')} ${l.name}`}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <Summary quote={quote} error={error} loading={loading}>
          <CouponBox quote={quote} />
          <button className="btn forest block lg" disabled={!quote} onClick={() => nav('/checkout')}>{t('cart.proceed')}</button>
          <p className="small muted center" style={{ margin: '12px 0 0' }}>{t('cart.note')}</p>
        </Summary>
      </div>
    </>
  );
}
