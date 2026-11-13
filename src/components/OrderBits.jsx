import { useMemo, useState } from 'react';
import { Check, Circle, Info, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { Modal } from './ui';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { payWithRazorpay } from '../payment';
import { useT } from '../i18n/I18nContext';
import { useStoreInfo } from '../context/StoreInfoContext';
import { dateOnly, imageUrl, money } from '../utils';

const RANK = { PENDING_PAYMENT: 0, CONFIRMED: 1, SHIPPED: 2, DELIVERED: 3 };

/** Order progress: Placed, Confirmed, Shipped, Delivered (or Placed, Cancelled). */
export function Timeline({ order, compact }) {
  const { t } = useT();
  const cancelled = order.status === 'CANCELLED';
  const rank = RANK[order.status] ?? 0;
  const steps = cancelled
    ? [{ k: 'tl.placed', d: order.createdAt, done: true }, { k: 'tl.cancelled', d: order.cancelledAt, done: true }]
    : [
      { k: 'tl.placed', d: order.createdAt, done: true },
      { k: 'tl.confirmed', d: rank >= 1 ? order.createdAt : null, done: rank >= 1 },
      { k: 'tl.shipped', d: order.shippedAt, done: rank >= 2 },
      { k: 'tl.delivered', d: order.deliveredAt, done: rank >= 3 },
    ];
  const current = cancelled ? steps.length - 1 : Math.max(0, steps.findLastIndex((s) => s.done));
  return (
    <div className={`timeline ${cancelled ? 'cancelled' : ''}`} style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((s, i) => (
        <div key={s.k} className={`step ${s.done ? 'done' : ''} ${i === current && !compact ? 'current' : ''}`}>
          <i>{cancelled && i === steps.length - 1 ? <X size={16} /> : s.done ? <Check size={16} /> : <Circle size={10} />}</i>
          {t(s.k)}
          {!compact && s.d ? <small>{dateOnly(s.d)}</small> : null}
        </div>
      ))}
    </div>
  );
}

/** Same maths as the server: price paid for the units, minus their coupon share, plus GST on the price. Fees are excluded. */
export function estimateRefund(order, item, qty) {
  const line = Number(item.price) * qty;
  const items = Number(order.itemsSubtotal) || 0;
  if (items <= 0) return line;
  const net = line - (Number(order.discount) * line) / items;
  const taxBase = items + Number(order.handlingFee) + Number(order.deliveryFee);
  const taxShare = taxBase > 0 ? (Number(order.tax) * line) / taxBase : 0;
  return Math.round((net + taxShare) * 100) / 100;
}

export function ReturnModal({ order, onClose, onDone }) {
  const { t } = useT();
  const info = useStoreInfo();
  const eligible = useMemo(() => order.items.filter((i) => i.returnableQty > 0), [order]);
  const [sel, setSel] = useState({});               // itemId -> qty
  const [reason, setReason] = useState('WRONG_SIZE');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const reasons = info.returnReasons?.length ? info.returnReasons : ['WRONG_SIZE', 'DEFECTIVE', 'NOT_AS_DESCRIBED', 'DAMAGED', 'CHANGED_MIND', 'OTHER'];

  const chosen = eligible.filter((i) => sel[i.itemId]);
  const estimate = chosen.reduce((n, i) => n + estimateRefund(order, i, sel[i.itemId]), 0);

  const toggle = (it) => setSel((s) => { const n = { ...s }; if (n[it.itemId]) delete n[it.itemId]; else n[it.itemId] = 1; return n; });

  const submit = async () => {
    if (chosen.length === 0) return toast.error(t('ret.noneSelected'));
    if (reason === 'OTHER' && !comment.trim()) return toast.error(t('ret.commentPh'));
    setBusy(true);
    try {
      for (const it of chosen) {
        // one request per item line
        // eslint-disable-next-line no-await-in-loop
        await api.post('/api/returns', { orderItemId: it.itemId, quantity: sel[it.itemId], reason, comment: comment.trim() || null });
      }
      toast.success(t('ret.submitted'));
      onDone();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <Modal title={t('ret.request')} onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>{t('c.cancel')}</button><button className="btn forest" onClick={submit} disabled={busy || chosen.length === 0}>{busy ? t('c.loading') : t('ret.submit')}</button></>}>
      <p className="muted" style={{ marginTop: 0 }}>{t('ret.choose')}</p>
      {eligible.map((it) => (
        <div className="ret-line" key={it.itemId}>
          <img src={imageUrl(it.imageUrl)} alt="" />
          <label className="check" style={{ alignItems: 'flex-start' }}>
            <input type="checkbox" checked={!!sel[it.itemId]} onChange={() => toggle(it)} style={{ marginTop: 4 }} />
            <span><b>{it.productName}</b><span className="muted small" style={{ display: 'block' }}>{it.size ? `${t('p.size')} ${it.size} · ` : ''}{money(it.price)}</span></span>
          </label>
          {sel[it.itemId] ? (
            <select className="input" style={{ width: 84 }} value={sel[it.itemId]} onChange={(e) => setSel({ ...sel, [it.itemId]: Number(e.target.value) })} aria-label={t('ret.qty')}>
              {Array.from({ length: it.returnableQty }, (_, k) => k + 1).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          ) : <span />}
        </div>
      ))}
      <div className="form-grid" style={{ marginTop: 18 }}>
        <div className="field full"><label htmlFor="rr">{t('ret.reason')}</label>
          <select id="rr" className="input" value={reason} onChange={(e) => setReason(e.target.value)}>{reasons.map((r) => <option key={r} value={r}>{t(`rr.${r}`)}</option>)}</select>
        </div>
        <div className="field full"><label htmlFor="rc">{t('ret.comment')}{reason === 'OTHER' ? '' : ` (${t('c.optional')})`}</label>
          <textarea id="rc" className="input" maxLength={1000} placeholder={t('ret.commentPh')} value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
      </div>
      <div className="alert"><Info size={18} /><div><div className="row between"><b>{t('ret.estimate')}</b><b>{money(estimate)}</b></div><span className="small muted">{t('ret.estimateNote')}</span></div></div>
    </Modal>
  );
}

/** Cancel, pay-now and buy-again actions shared by the history list and the order page. */
export function useOrderActions(reload) {
  const { t } = useT();
  const { user } = useAuth();
  const { add } = useCart();
  const nav = useNavigate();

  const cancel = async (o) => {
    if (!window.confirm(t('o.cancelConfirm', { id: o.id }))) return;
    try { await api.post(`/api/orders/${o.id}/cancel`); toast.success(t('o.cancelled')); reload(); } catch (e) { toast.error(errMsg(e)); }
  };
  const payNow = async (o) => {
    try {
      const { data } = await api.post(`/api/orders/${o.id}/pay`);
      await payWithRazorpay({ info: data, user, onVerified: () => { toast.success(t('o.paid')); reload(); }, onError: (m) => toast.error(m) });
    } catch (e) { toast.error(errMsg(e)); }
  };
  const again = (o) => {
    o.items.filter((i) => i.productId).forEach((i) =>
      add({ id: i.productId, name: i.productName, imageUrl: i.imageUrl, price: i.price, stock: 20, brand: '' }, i.size, i.quantity));
    toast.success(t('o.againDone'));
    nav('/cart');
  };
  return { cancel, payNow, again };
}
