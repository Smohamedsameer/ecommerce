import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useT } from '../i18n/I18nContext';
import useQuote from '../useQuote';
import { payWithRazorpay } from '../payment';
import { Summary, CouponBox, FreeShipBar } from './Cart';
import { money } from '../utils';

const EMPTY = { fullName: '', phone: '', addressLine: '', city: '', state: '', pincode: '' };

export default function Checkout() {
  const { t } = useT();
  const { user } = useAuth();
  const { items, payloadItems, coupon, clear } = useCart();
  const { quote, error, loading } = useQuote();
  const nav = useNavigate();
  const [ship, setShip] = useState(() => { try { return { ...EMPTY, ...(JSON.parse(localStorage.getItem(`addr:${user?.id}`)) || {}) }; } catch { return EMPTY; } });
  const [method, setMethod] = useState('ONLINE');
  const [onlineOk, setOnlineOk] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { api.get('/api/payments/config').then((r) => { setOnlineOk(r.data.enabled); if (!r.data.enabled) setMethod('COD'); }).catch(() => {}); }, []);
  useEffect(() => { setShip((s) => ({ ...s, fullName: s.fullName || user?.name || '', phone: s.phone || user?.phone || '' })); }, [user]);

  if (items.length === 0) return <Navigate to="/cart" replace />;
  const set = (k) => (e) => setShip({ ...ship, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (!ship.fullName.trim()) e.fullName = t('co.e.name');
    if (!/^[0-9+\- ]{7,15}$/.test(ship.phone)) e.phone = t('co.e.phone');
    if (!ship.addressLine.trim()) e.addressLine = t('co.e.line');
    if (!ship.city.trim()) e.city = t('co.e.city');
    if (!ship.state.trim()) e.state = t('co.e.state');
    if (!/^[0-9]{6}$/.test(ship.pincode)) e.pincode = t('co.e.pin');
    setErrors(e); return Object.keys(e).length === 0;
  };
  const done = (order) => { clear(); nav(`/order-success/${order.id}`, { replace: true, state: { order } }); };

  const place = async () => {
    if (!validate()) return toast.error(t('co.fix'));
    setBusy(true);
    try {
      localStorage.setItem(`addr:${user.id}`, JSON.stringify(ship));
      const { data } = await api.post('/api/orders', { items: payloadItems, couponCode: coupon || null, paymentMethod: method, shipping: ship });
      if (method === 'COD') return done(data.order);
      await payWithRazorpay({
        info: data.razorpay, user, onVerified: (order) => done(order),
        onDismiss: () => { toast(t('co.closed'), { icon: 'ℹ️' }); clear(); nav('/orders', { replace: true }); },
        onError: (m) => { toast.error(m); clear(); nav('/orders', { replace: true }); },
      });
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const F = ({ k, label, full, ...rest }) => (
    <div className={`field ${full ? 'full' : ''}`}>
      <label htmlFor={k}>{label}</label>
      <input id={k} className="input" value={ship[k]} onChange={set(k)} aria-invalid={!!errors[k]} {...rest} />
      {errors[k] ? <span className="error-text">{errors[k]}</span> : null}
    </div>
  );

  return (
    <>
      <div className="page-head">
        <div className="container">
          <h1>{t('co.title')}</h1>
          <div className="stepper">
            <span className="st done"><i>✓</i>{t('co.step1')}</span><span className="bar-line" />
            <span className="st on"><i>2</i>{t('co.step2')}</span><span className="bar-line" />
            <span className="st"><i>3</i>{t('co.step3')}</span>
          </div>
        </div>
      </div>
      <div className="container cart-layout">
        <div className="stack">
          <FreeShipBar itemsSubtotal={quote?.itemsSubtotal} />
          <section className="card">
            <h3>{t('co.address')}</h3>
            <div className="form-grid" style={{ marginTop: 16 }}>
              {F({ k: 'fullName', label: t('co.name'), autoComplete: 'name' })}
              {F({ k: 'phone', label: t('co.phone'), autoComplete: 'tel', inputMode: 'tel' })}
              {F({ k: 'addressLine', label: t('co.line'), full: true, autoComplete: 'street-address' })}
              {F({ k: 'city', label: t('co.city'), autoComplete: 'address-level2' })}
              {F({ k: 'state', label: t('co.state'), autoComplete: 'address-level1' })}
              {F({ k: 'pincode', label: t('co.pin'), inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code' })}
            </div>
          </section>
          <section className="card">
            <h3>{t('co.payment')}</h3>
            <label className={`pay-opt ${method === 'ONLINE' ? 'active' : ''} ${!onlineOk ? 'disabled' : ''}`}>
              <input type="radio" name="pay" checked={method === 'ONLINE'} disabled={!onlineOk} onChange={() => setMethod('ONLINE')} />
              <div><b>{t('co.online')}</b><div className="muted small">{t('co.online.s')}{!onlineOk ? t('co.off') : ''}</div></div>
            </label>
            <label className={`pay-opt ${method === 'COD' ? 'active' : ''}`}>
              <input type="radio" name="pay" checked={method === 'COD'} onChange={() => setMethod('COD')} />
              <div><b>{t('co.cod')}</b><div className="muted small">{t('co.cod.s')}</div></div>
            </label>
            <p className="small muted" style={{ margin: '4px 0 0' }}><Link to="/policy/returns">{t('pol.returns')}</Link> · <Link to="/policy/refunds">{t('pol.refunds')}</Link></p>
          </section>
        </div>
        <Summary quote={quote} error={error} loading={loading}>
          <CouponBox quote={quote} />
          <button className="btn forest block lg" disabled={busy || !quote} onClick={place}>
            {busy ? t('co.wait') : method === 'ONLINE' ? t('co.pay', { amount: quote ? money(quote.total) : '' }) : t('co.place')}
          </button>
        </Summary>
      </div>
    </>
  );
}
