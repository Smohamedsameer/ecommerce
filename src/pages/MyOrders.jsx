import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client';
import { Empty, PayBadge, Spinner, StatusBadge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { payWithRazorpay } from '../payment';
import { dateTime, imageUrl, money } from '../utils';

const FLOW = ['CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const load = useCallback(() => api.get('/api/orders/mine').then((r) => setOrders(r.data)).catch((e) => { toast.error(errMsg(e)); setOrders([]); }), []);
  useEffect(() => { load(); }, [load]);

  const cancel = async (o) => {
    if (!window.confirm(`Cancel order #${o.id}?${o.paymentStatus === 'PAID' ? ' Paid orders are refunded by our team to the original payment method.' : ''}`)) return;
    try { await api.post(`/api/orders/${o.id}/cancel`); toast.success('Order cancelled'); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  const payNow = async (o) => {
    try {
      const { data } = await api.post(`/api/orders/${o.id}/pay`);
      await payWithRazorpay({ info: data, user, onVerified: () => { toast.success('Payment received'); load(); }, onError: (m) => toast.error(m) });
    } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <>
      <div className="page-head"><div className="container"><h1>My orders</h1></div></div>
      <div className="container" style={{ padding: '28px 0 56px' }}>
        {orders === null ? <Spinner /> : orders.length === 0 ? (
          <Empty title="No orders yet" action={<Link to="/shop" className="btn">Browse the shop</Link>}>When you place an order it will appear here.</Empty>
        ) : orders.map((o) => {
          const idx = FLOW.indexOf(o.status);
          return (
            <div className="card order-card" key={o.id}>
              <div className="order-head">
                <div><b>Order #{o.id}</b><div className="muted small">{dateTime(o.createdAt)}</div></div>
                <div className="row wrap"><StatusBadge status={o.status} /><PayBadge order={o} /><b>{money(o.total)}</b></div>
              </div>
              <div className="order-items">
                {o.items.map((it, i) => (
                  <div className="order-item" key={i}>
                    <img src={imageUrl(it.imageUrl)} alt="" />
                    <div className="grow">
                      {it.productId ? <Link to={`/product/${it.productId}`} style={{ color: 'inherit', fontWeight: 700 }}>{it.productName}</Link> : <b>{it.productName}</b>}
                      <div className="muted small">{it.size ? `Size ${it.size} · ` : ''}Qty {it.quantity}</div>
                    </div>
                    <span>{money(it.lineTotal)}</span>
                  </div>
                ))}
              </div>
              {idx >= 0 ? <div className="steps" aria-hidden="true">{FLOW.map((s, i) => <i key={s} className={i <= idx ? 'done' : ''} />)}</div> : null}
              <div className="row wrap" style={{ marginTop: 12 }}>
                {o.status === 'PENDING_PAYMENT' && o.paymentMethod === 'ONLINE' ? <button className="btn sm" onClick={() => payNow(o)}>Pay now</button> : null}
                {['PENDING_PAYMENT', 'CONFIRMED'].includes(o.status) ? <button className="btn ghost sm" onClick={() => cancel(o)}>Cancel order</button> : null}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
