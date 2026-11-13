import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, IndianRupee, Package, RotateCcw, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client';
import { Empty, PayBadge, Reveal, SearchInputLite, Spinner, StatusBadge } from '../components/ui';
import { ReturnModal, Timeline, useOrderActions } from '../components/OrderBits';
import { useT } from '../i18n/I18nContext';
import { dateOnly, imageUrl, money } from '../utils';

const TABS = ['', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'PENDING_PAYMENT'];
const RANGES = [['any', 'o.f.any', 0], ['30', 'o.f.30', 30], ['180', 'o.f.180', 180], ['year', 'o.f.year', -1]];

export default function Orders() {
  const { t } = useT();
  const [orders, setOrders] = useState(null);
  const [returns, setReturns] = useState([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [range, setRange] = useState('any');
  const [retOrder, setRetOrder] = useState(null);

  const load = useCallback(() => {
    api.get('/api/orders/mine').then((r) => setOrders(r.data)).catch((e) => { toast.error(errMsg(e)); setOrders([]); });
    api.get('/api/returns/mine').then((r) => setReturns(r.data)).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);
  const { cancel, payNow, again } = useOrderActions(load);

  const stats = useMemo(() => {
    const list = orders || [];
    const sales = list.filter((o) => ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(o.status));
    return {
      orders: list.filter((o) => o.status !== 'PENDING_PAYMENT').length,
      spent: sales.reduce((n, o) => n + Number(o.total) - Number(o.refundedAmount || 0), 0),
      items: sales.reduce((n, o) => n + o.items.reduce((m, i) => m + i.quantity, 0), 0),
    };
  }, [orders]);

  const shown = useMemo(() => {
    const now = new Date();
    const r = RANGES.find((x) => x[0] === range);
    return (orders || []).filter((o) => {
      if (status && o.status !== status) return false;
      if (r && r[2] > 0 && now - new Date(o.createdAt) > r[2] * 86400000) return false;
      if (r && r[2] === -1 && new Date(o.createdAt).getFullYear() !== now.getFullYear()) return false;
      const needle = q.trim().toLowerCase().replace('#', '');
      if (needle && !(String(o.id).includes(needle) || o.items.some((i) => i.productName.toLowerCase().includes(needle)))) return false;
      return true;
    });
  }, [orders, status, q, range]);

  return (
    <>
      <div className="page-head"><div className="container"><h1>{t('o.h.title')}</h1><p>{t('o.h.sub')}</p></div></div>
      <div className="container" style={{ padding: '32px 0 72px' }}>
        {orders === null ? <Spinner /> : (
          <>
            <div className="kpis">
              {[[ShoppingBag, t('o.k.orders'), stats.orders], [IndianRupee, t('o.k.spent'), money(stats.spent)], [Package, t('o.k.items'), stats.items], [RotateCcw, t('o.k.returns'), returns.length]].map(([Icon, l, v], i) => (
                <Reveal key={l} className="card kpi" delay={i * 70}><span className="ico-box"><Icon size={21} /></span><div><b>{v}</b><span className="sub">{l}</span></div></Reveal>
              ))}
            </div>

            <div className="tabs-pills" style={{ padding: 0, marginBottom: 16 }}>
              {TABS.map((s) => <button key={s} className={`tab ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>{s ? t(`st.${s}`) : t('o.f.all')}</button>)}
            </div>
            <div className="filters-bar">
              <SearchInputLite value={q} onChange={setQ} placeholder={t('o.f.search')} />
              <select className="input" style={{ width: 'auto', minWidth: 170 }} value={range} onChange={(e) => setRange(e.target.value)} aria-label={t('o.f.range')}>
                {RANGES.map(([v, k]) => <option key={v} value={v}>{t(k)}</option>)}
              </select>
              <Link to="/returns" className="btn ghost sm"><RotateCcw size={15} /> {t('nav.returns')}</Link>
            </div>

            {shown.length === 0 ? <Empty title={t('o.none.t')} action={<Link to="/shop" className="btn">{t('o.browse')}</Link>}>{t('o.none.s')}</Empty>
              : shown.map((o, idx) => {
                const canReturn = o.items.some((i) => i.returnableQty > 0);
                return (
                  <Reveal key={o.id} className="card order-card" delay={Math.min(idx, 4) * 60}>
                    <div className="order-top">
                      <div className="meta">
                        <div><span>{t('o.placed')}</span><b>{dateOnly(o.createdAt)}</b></div>
                        <div><span>{t('o.total')}</span><b>{money(o.total)}</b></div>
                        <div><span>{t('o.shipTo')}</span><b>{o.shipping.fullName}</b></div>
                      </div>
                      <div className="row wrap"><b>{t('o.no', { n: o.id })}</b><StatusBadge status={o.status} /><PayBadge order={o} /></div>
                    </div>
                    <div className="order-body">
                      <Timeline order={o} compact />
                      {o.expectedDelivery && ['CONFIRMED', 'SHIPPED'].includes(o.status) ? <div className="small" style={{ color: 'var(--success)', fontWeight: 700 }}>{t('o.expected', { date: dateOnly(o.expectedDelivery) })}</div> : null}
                      <div className="order-items">
                        {o.items.map((it, i) => (
                          <div className="order-item" key={i}>
                            <img src={imageUrl(it.imageUrl)} alt="" />
                            <div className="grow">
                              {it.productId ? <Link to={`/product/${it.productId}`} style={{ color: 'inherit', fontWeight: 700 }}>{it.productName}</Link> : <b>{it.productName}</b>}
                              <div className="muted small">{it.size ? `${t('p.size')} ${it.size} · ` : ''}{t('c.qty')} {it.quantity}{it.returnedQty > 0 ? <span className="badge warn" style={{ marginLeft: 8 }}>{t('o.returnedQty', { n: it.returnedQty })}</span> : null}</div>
                            </div>
                            <span>{money(it.lineTotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="order-foot">
                      <Link to={`/orders/${o.id}`} className="btn forest sm">{o.status === 'SHIPPED' ? t('o.track') : t('o.details')}</Link>
                      {o.status !== 'PENDING_PAYMENT' && o.status !== 'CANCELLED' ? <Link to={`/orders/${o.id}/invoice`} className="btn ghost sm"><FileText size={15} /> {t('o.invoice')}</Link> : null}
                      {o.status === 'PENDING_PAYMENT' && o.paymentMethod === 'ONLINE' ? <button className="btn sm" onClick={() => payNow(o)}>{t('o.payNow')}</button> : null}
                      {canReturn ? <button className="btn outline sm" onClick={() => setRetOrder(o)}><RotateCcw size={15} /> {t('o.return')}</button> : null}
                      {['PENDING_PAYMENT', 'CONFIRMED'].includes(o.status) ? <button className="btn ghost sm" onClick={() => cancel(o)}>{t('o.cancel')}</button> : null}
                      {o.status !== 'PENDING_PAYMENT' ? <button className="btn ghost sm" onClick={() => again(o)}>{t('o.again')}</button> : null}
                    </div>
                  </Reveal>
                );
              })}
          </>
        )}
      </div>
      {retOrder ? <ReturnModal order={retOrder} onClose={() => setRetOrder(null)} onDone={() => { setRetOrder(null); load(); }} /> : null}
    </>
  );
}
