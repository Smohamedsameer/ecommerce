import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import api from '../api/client';
import { Spinner } from '../components/ui';
import { useT } from '../i18n/I18nContext';
import { CONTACT, STORE_NAME } from '../config';
import { dateOnly, money } from '../utils';

/** Printable tax invoice (English on purpose, so it can be used for records). */
export default function Invoice() {
  const { id } = useParams();
  const { t } = useT();
  const [o, setO] = useState(null);
  useEffect(() => { api.get(`/api/orders/${id}`).then((r) => setO(r.data)).catch(() => setO(false)); }, [id]);
  if (o === null) return <Spinner />;
  if (o === false) return <div className="container"><p className="empty">{t('o.notFound')}</p></div>;
  return (
    <div className="container">
      <div className="row between no-print" style={{ marginTop: 24 }}>
        <Link to={`/orders/${o.id}`}>← {t('o.no', { n: o.id })}</Link>
        <button className="btn forest" onClick={() => window.print()}><Printer size={17} /> {t('c.print')}</button>
      </div>
      <div className="invoice">
        <div className="row between wrap" style={{ alignItems: 'flex-start' }}>
          <div><h2 style={{ margin: 0 }}>{STORE_NAME}</h2><div style={{ color: '#555' }}>{CONTACT.address}<br />{CONTACT.email}</div></div>
          <div style={{ textAlign: 'right' }}><h3 style={{ margin: 0 }}>Tax invoice</h3><div>Invoice no. INV-{String(o.id).padStart(6, '0')}</div><div>Date: {dateOnly(o.createdAt)}</div></div>
        </div>
        <hr className="divider" />
        <div className="row between wrap" style={{ alignItems: 'flex-start' }}>
          <div><b>Billed and shipped to</b><br />{o.shipping.fullName}<br />{o.shipping.addressLine}<br />{o.shipping.city}, {o.shipping.state} {o.shipping.pincode}<br />{o.shipping.phone}</div>
          <div style={{ textAlign: 'right' }}><b>Payment</b><br />{o.paymentMethod === 'COD' ? 'Cash on delivery' : 'Online (Razorpay)'}<br />{o.razorpayPaymentId ? <>Ref: {o.razorpayPaymentId}<br /></> : null}Order #{o.id}</div>
        </div>
        <table>
          <thead><tr><th>Item</th><th>Size</th><th className="num">Qty</th><th className="num">Price</th><th className="num">Amount</th></tr></thead>
          <tbody>{o.items.map((i, k) => <tr key={k}><td>{i.productName}</td><td>{i.size || '–'}</td><td className="num">{i.quantity}</td><td className="num">{money(i.price)}</td><td className="num">{money(i.lineTotal)}</td></tr>)}</tbody>
        </table>
        <div className="totals">
          <div><span>Items</span><span>{money(o.itemsSubtotal)}</span></div>
          <div><span>Handling</span><span>{money(o.handlingFee)}</span></div>
          <div><span>Delivery</span><span>{Number(o.deliveryFee) === 0 ? 'Free' : money(o.deliveryFee)}</span></div>
          <div><span>GST (5%)</span><span>{money(o.tax)}</span></div>
          {Number(o.discount) > 0 ? <div><span>Discount ({o.couponCode})</span><span>− {money(o.discount)}</span></div> : null}
          <div style={{ fontWeight: 800, borderTop: '1px solid #ccc', marginTop: 6, paddingTop: 6 }}><span>Total</span><span>{money(o.total)}</span></div>
          {Number(o.refundedAmount) > 0 ? <div><span>Refunded</span><span>− {money(o.refundedAmount)}</span></div> : null}
        </div>
        <p style={{ color: '#666', fontSize: '.8rem', marginTop: 28 }}>This is a computer generated invoice and does not need a signature. Returns are accepted as per our return policy.</p>
      </div>
    </div>
  );
}
