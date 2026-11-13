import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import api from '../api/client';
import { PayBadge, Spinner } from '../components/ui';
import { useT } from '../i18n/I18nContext';
import { dateOnly, dateTime, imageUrl, money } from '../utils';

const COLORS = ['#19A99B', '#E8C987', '#0B4A44', '#D2A24F', '#46C98B', '#F07A6D'];

export default function OrderSuccess() {
  const { id } = useParams();
  const { state } = useLocation();
  const { t } = useT();
  const [order, setOrder] = useState(state?.order || null);
  useEffect(() => { if (!order) api.get(`/api/orders/${id}`).then((r) => setOrder(r.data)).catch(() => {}); }, [id, order]);
  const bits = useMemo(() => Array.from({ length: 36 }).map((_, i) => ({
    c: COLORS[i % COLORS.length], x: `${(Math.random() - 0.5) * 520}px`, r: `${Math.random() * 720 - 360}deg`, d: `${Math.random() * 0.5}s`,
  })), []);
  if (!order) return <Spinner />;
  return (
    <div className="container" style={{ maxWidth: 740, paddingBottom: 72 }}>
      <div className="success-hero">
        <div className="confetti" aria-hidden="true">{bits.map((b, i) => <i key={i} style={{ background: b.c, '--x': b.x, '--r': b.r, animationDelay: b.d }} />)}</div>
        <div className="success-ico"><Check size={44} strokeWidth={3} /></div>
        <h1 style={{ fontSize: '2.4rem' }}>{t('o.success.t')}</h1>
        <p className="muted">{t('o.success.s', { name: order.customerName, id: order.id })}</p>
        {order.expectedDelivery ? <p><span className="badge ok">{t('o.expected', { date: dateOnly(order.expectedDelivery) })}</span></p> : null}
      </div>
      <div className="card">
        <div className="row between wrap" style={{ marginBottom: 16 }}><span className="muted small">{dateTime(order.createdAt)}</span><PayBadge order={order} /></div>
        <div className="order-items">
          {order.items.map((it, i) => (
            <div className="order-item" key={i}>
              <img src={imageUrl(it.imageUrl)} alt="" />
              <div className="grow"><b>{it.productName}</b><div className="muted small">{it.size ? `${t('p.size')} ${it.size} · ` : ''}{t('c.qty')} {it.quantity}</div></div>
              <b>{money(it.lineTotal)}</b>
            </div>
          ))}
        </div>
        <hr className="divider" />
        <div className="row between"><b>{t('o.paidOrDue')}</b><b>{money(order.total)}</b></div>
        <hr className="divider" />
        <div className="small muted">{t('o.deliverTo')} <b style={{ color: 'var(--ink)' }}>{order.shipping.fullName}</b>, {order.shipping.addressLine}, {order.shipping.city}, {order.shipping.state} {order.shipping.pincode}</div>
      </div>
      <div className="row wrap" style={{ justifyContent: 'center', marginTop: 28 }}>
        <Link to={`/orders/${order.id}`} className="btn forest">{t('o.track')}</Link>
        <Link to="/orders" className="btn ghost">{t('o.view')}</Link>
        <Link to="/shop" className="btn ghost">{t('o.keep')}</Link>
      </div>
    </div>
  );
}
