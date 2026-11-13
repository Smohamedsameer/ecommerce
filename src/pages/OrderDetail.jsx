import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarClock, FileText, Info, RotateCcw, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client';
import { Empty, PayBadge, ReturnBadge, Spinner, StatusBadge } from '../components/ui';
import { ReturnModal, Timeline, useOrderActions } from '../components/OrderBits';
import { useT } from '../i18n/I18nContext';
import { dateOnly, dateTime, imageUrl, money } from '../utils';

export default function OrderDetail() {
  const { id } = useParams();
  const { t } = useT();
  const [o, setO] = useState(null);
  const [error, setError] = useState('');
  const [returns, setReturns] = useState([]);
  const [modal, setModal] = useState(false);

  const load = useCallback(() => {
    api.get(`/api/orders/${id}`).then((r) => setO(r.data)).catch((e) => setError(errMsg(e, t('o.notFound'))));
    api.get('/api/returns/mine').then((r) => setReturns(r.data.filter((x) => String(x.orderId) === String(id)))).catch(() => {});
  }, [id, t]);
  useEffect(() => { load(); }, [load]);
  const { cancel, payNow, again } = useOrderActions(load);

  if (error) return <div className="container"><Empty title={t('o.notFound')} action={<Link to="/orders" className="btn">{t('o.view')}</Link>}>{error}</Empty></div>;
  if (!o) return <Spinner />;

  const canReturn = o.items.some((i) => i.returnableQty > 0);
  const windowOpen = o.returnWindowEndsAt && new Date(o.returnWindowEndsAt) > new Date();
  const hasRefund = Number(o.refundedAmount) > 0;

  return (
    <>
      <div className="page-head">
        <div className="container">
          <p style={{ marginBottom: 6 }}><Link to="/orders">← {t('o.h.title')}</Link></p>
          <div className="row between wrap"><h1 style={{ margin: 0 }}>{t('o.no', { n: o.id })}</h1><div className="row wrap"><StatusBadge status={o.status} /><PayBadge order={o} /></div></div>
          <p style={{ marginTop: 8 }}>{t('o.placed')}: {dateTime(o.createdAt)}</p>
        </div>
      </div>
      <div className="container" style={{ padding: '32px 0 72px', display: 'grid', gap: 24 }}>
        <div className="card"><Timeline order={o} /></div>

        <div className="two-col" style={{ gap: 24 }}>
          <div className="stack">
            {o.expectedDelivery && ['CONFIRMED', 'SHIPPED'].includes(o.status) ? <div className="alert ok"><CalendarClock size={20} /><b>{t('o.expected', { date: dateOnly(o.expectedDelivery) })}</b></div> : null}
            {o.courier || o.trackingNumber ? (
              <div className="alert"><Truck size={20} /><div>
                {o.courier ? <div><span className="muted">{t('o.courier')}: </span><b>{o.courier}</b></div> : null}
                {o.trackingNumber ? <div><span className="muted">{t('o.tracking')}: </span><b>{o.trackingNumber}</b> <button className="link-btn small" onClick={() => { navigator.clipboard?.writeText(o.trackingNumber); toast.success(t('p.copied')); }}>{t('c.copy')}</button></div> : null}
              </div></div>
            ) : null}
            {o.status === 'DELIVERED' ? (
              windowOpen ? <div className="alert"><Info size={20} /><span>{t('o.window', { date: dateOnly(o.returnWindowEndsAt) })}</span></div>
                : <div className="alert warn"><Info size={20} /><span>{t('o.windowClosed')}</span></div>
            ) : null}
            {hasRefund ? <div className="alert ok"><Info size={20} /><span>{t('o.refundedNote', { amount: money(o.refundedAmount) })}</span></div> : null}

            <div className="card">
              <h3>{t('o.itemsLabel')}</h3>
              <div className="order-items" style={{ marginTop: 16 }}>
                {o.items.map((it, i) => (
                  <div className="order-item" key={i}>
                    <img src={imageUrl(it.imageUrl)} alt="" />
                    <div className="grow">
                      {it.productId ? <Link to={`/product/${it.productId}`} style={{ color: 'inherit', fontWeight: 700 }}>{it.productName}</Link> : <b>{it.productName}</b>}
                      <div className="muted small">{it.size ? `${t('p.size')} ${it.size} · ` : ''}{t('c.qty')} {it.quantity} × {money(it.price)}</div>
                      {it.returnedQty > 0 ? <span className="badge warn" style={{ marginTop: 4 }}>{t('o.returnedQty', { n: it.returnedQty })}</span> : null}
                    </div>
                    <b>{money(it.lineTotal)}</b>
                  </div>
                ))}
              </div>
            </div>

            {returns.length > 0 ? (
              <div className="card">
                <h3>{t('nav.returns')}</h3>
                {returns.map((r) => (
                  <div className="ret-line" key={r.id}>
                    <img src={imageUrl(r.imageUrl)} alt="" />
                    <div><b>{r.productName}</b><div className="muted small">{t('c.qty')} {r.quantity} · {t(`rr.${r.reason}`)}</div></div>
                    <ReturnBadge status={r.status} />
                  </div>
                ))}
                <Link to="/returns" className="link-btn small">{t('nav.returns')}</Link>
              </div>
            ) : null}
          </div>

          <div className="stack">
            <div className="card">
              <h3>{t('o.pricing')}</h3>
              <div className="detail-list" style={{ marginTop: 12 }}>
                <div><span>{t('cart.items')}</span><span>{money(o.itemsSubtotal)}</span></div>
                <div><span>{t('cart.handling')}</span><span>{money(o.handlingFee)}</span></div>
                <div><span>{t('cart.delivery')}</span><span>{Number(o.deliveryFee) === 0 ? t('c.free') : money(o.deliveryFee)}</span></div>
                <div><span>GST</span><span>{money(o.tax)}</span></div>
                {Number(o.discount) > 0 ? <div style={{ color: 'var(--success)' }}><span>{t('cart.coupon')} {o.couponCode}</span><span>− {money(o.discount)}</span></div> : null}
                <hr className="divider" style={{ margin: '8px 0' }} />
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}><span>{t('c.total')}</span><span>{money(o.total)}</span></div>
                {hasRefund ? <div style={{ color: 'var(--success)' }}><span>{t('pay.refunded', { amount: '' })}</span><span>− {money(o.refundedAmount)}</span></div> : null}
              </div>
            </div>
            <div className="card">
              <h3>{t('o.address')}</h3>
              <p className="muted" style={{ margin: '8px 0 0' }}><b style={{ color: 'var(--ink)' }}>{o.shipping.fullName}</b><br />{o.shipping.addressLine}<br />{o.shipping.city}, {o.shipping.state} {o.shipping.pincode}<br />{o.shipping.phone}</p>
            </div>
            <div className="row wrap">
              {o.status !== 'PENDING_PAYMENT' && o.status !== 'CANCELLED' ? <Link to={`/orders/${o.id}/invoice`} className="btn ghost"><FileText size={16} /> {t('o.invoice')}</Link> : null}
              {canReturn ? <button className="btn forest" onClick={() => setModal(true)}><RotateCcw size={16} /> {t('o.return')}</button> : null}
              {o.status === 'PENDING_PAYMENT' && o.paymentMethod === 'ONLINE' ? <button className="btn" onClick={() => payNow(o)}>{t('o.payNow')}</button> : null}
              {['PENDING_PAYMENT', 'CONFIRMED'].includes(o.status) ? <button className="btn ghost" onClick={() => cancel(o)}>{t('o.cancel')}</button> : null}
              {o.status !== 'PENDING_PAYMENT' ? <button className="btn ghost" onClick={() => again(o)}>{t('o.again')}</button> : null}
            </div>
            <p className="small muted"><Link to="/policy/returns">{t('pol.returns')}</Link> · <Link to="/policy/refunds">{t('pol.refunds')}</Link></p>
          </div>
        </div>
      </div>
      {modal ? <ReturnModal order={o} onClose={() => setModal(false)} onDone={() => { setModal(false); load(); }} /> : null}
    </>
  );
}
