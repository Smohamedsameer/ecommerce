import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Download, IndianRupee, Package, Pencil, RotateCcw, ShoppingBag, Store, Trash2, UserCheck, Users as UsersIcon, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client';
import { Empty, Modal, Pagination, PayBadge, ReturnBadge, Spinner, StatusBadge, Stars } from '../components/ui';
import { SalesChart, SearchInput, Stat, usePagedList } from '../components/dashkit';
import ProductManager from '../components/ProductManager';
import { dateOnly, dateTime, imageUrl, money, reasonLabel } from '../utils';

/* ------------------------------------------------------------ Dashboard */
export function AdminDashboard() {
  const [s, setS] = useState(null);
  useEffect(() => {
    const load = () => api.get('/api/admin/stats').then((r) => setS(r.data)).catch((e) => toast.error(errMsg(e)));
    load();
    window.addEventListener('orders:changed', load);
    return () => window.removeEventListener('orders:changed', load);
  }, []);
  if (!s) return <Spinner />;
  return (
    <>
      <div className="stats">
        <Stat icon={IndianRupee} label="Revenue" value={money(s.revenue)} />
        <Stat icon={ShoppingBag} label="Total orders" value={s.orders} />
        <Stat icon={Package} label="New orders to process" value={s.newOrders} tone="brass" />
        <Stat icon={RotateCcw} label="Returns awaiting review" value={s.pendingReturns} tone="warn" />
        <Stat icon={Wallet} label="Refunded so far" value={money(s.refundedTotal)} tone="bad" />
        <Stat icon={Store} label="Products" value={s.products} />
        <Stat icon={UsersIcon} label="Customers" value={s.customers} />
        <Stat icon={UserCheck} label="Sellers" value={s.sellers} tone="ok" />
      </div>
      <div className="panels">
        <div className="card"><div className="panel-title"><h3>Revenue, last 7 days</h3></div><SalesChart points={s.sales} /></div>
        <div className="card">
          <div className="panel-title"><h3>Top selling</h3></div>
          {s.topProducts.length === 0 ? <p className="muted">Sales will appear here.</p> : (
            <div className="mini-list">{s.topProducts.map((t) => <div className="it" key={t.name}><div><b>{t.name}</b><span className="muted small">{t.units} sold</span></div><b>{money(t.revenue)}</b></div>)}</div>
          )}
        </div>
      </div>
      <div className="panels even">
        <div className="card">
          <div className="panel-title"><h3>Recent orders</h3><Link to="/admin/orders" className="btn outline sm">View all</Link></div>
          {s.recentOrders.length === 0 ? <p className="muted">No orders yet.</p> : (
            <div className="mini-list">{s.recentOrders.map((o) => <div className="it" key={o.id}><div><b>#{o.id} {o.customerName}</b><span className="muted small">{dateTime(o.createdAt)}</span></div><div className="row"><StatusBadge status={o.status} plain /><b>{money(o.total)}</b></div></div>)}</div>
          )}
        </div>
        <div className="card">
          <div className="panel-title"><h3>Low stock</h3><Link to="/admin/products" className="btn outline sm">Manage</Link></div>
          {s.lowStock.length === 0 ? <p className="muted">All products are well stocked.</p> : (
            <div className="mini-list">{s.lowStock.map((p) => <div className="it" key={p.id}><div><b>{p.name}</b><span className="muted small">{p.sellerName}</span></div><span className={`badge ${p.stock === 0 ? 'bad' : 'warn'}`}>{p.stock === 0 ? 'Out of stock' : `${p.stock} left`}</span></div>)}</div>
          )}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------ Orders */
const TABS = [['', 'All'], ['CONFIRMED', 'New'], ['SHIPPED', 'Shipped'], ['DELIVERED', 'Delivered'], ['CANCELLED', 'Cancelled'], ['PENDING_PAYMENT', 'Awaiting payment']];
const NEXT = { CONFIRMED: ['SHIPPED', 'DELIVERED'], SHIPPED: ['DELIVERED'] };

function OrderModal({ order, onClose, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [courier, setCourier] = useState(order.courier || '');
  const [tracking, setTracking] = useState(order.trackingNumber || '');
  const move = async (status) => {
    if (status === 'CANCELLED' && !window.confirm(`Cancel order #${order.id}? Stock is returned.${order.paymentStatus === 'PAID' && order.paymentMethod === 'ONLINE' ? ' Refund the payment from your Razorpay dashboard.' : ''}`)) return;
    setBusy(true);
    try {
      const body = { status };
      if (status === 'SHIPPED' || status === 'DELIVERED') { body.courier = courier; body.trackingNumber = tracking; }
      const { data } = await api.patch(`/api/admin/orders/${order.id}/status`, body);
      toast.success(`Order marked ${status.toLowerCase()}`); onChanged(data);
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const open = !['DELIVERED', 'CANCELLED'].includes(order.status);
  const next = NEXT[order.status] || [];
  return (
    <Modal title={`Order #${order.id}`} onClose={onClose}
      footer={open ? <>
        {next.map((s) => <button key={s} className="btn forest" disabled={busy} onClick={() => move(s)}>Mark {s.toLowerCase()}</button>)}
        <button className="btn danger" disabled={busy} onClick={() => move('CANCELLED')}>Cancel order</button>
      </> : null}>
      <div className="row wrap" style={{ marginBottom: 16 }}><StatusBadge status={order.status} plain /><PayBadge order={order} plain /><span className="muted small">{dateTime(order.createdAt)}</span></div>
      <div className="kv" style={{ marginBottom: 18 }}>
        <div><div className="label">Customer</div>{order.customerName}<div className="muted small">{order.customerEmail}</div></div>
        <div><div className="label">Deliver to</div>{order.shipping.fullName}, {order.shipping.phone}<div className="muted small">{order.shipping.addressLine}, {order.shipping.city}, {order.shipping.state} {order.shipping.pincode}</div></div>
        {order.razorpayPaymentId ? <div><div className="label">Razorpay payment</div><span className="small">{order.razorpayPaymentId}</span></div> : null}
        {order.expectedDelivery ? <div><div className="label">Expected delivery</div>{dateOnly(order.expectedDelivery)}</div> : null}
        {order.shippedAt ? <div><div className="label">Shipped</div>{dateTime(order.shippedAt)}</div> : null}
        {order.deliveredAt ? <div><div className="label">Delivered</div>{dateTime(order.deliveredAt)}<div className="muted small">Return window ends {dateOnly(order.returnWindowEndsAt)}</div></div> : null}
        {order.courier || order.trackingNumber ? <div><div className="label">Courier</div>{order.courier || '–'}<div className="muted small">{order.trackingNumber}</div></div> : null}
      </div>
      {order.status === 'CONFIRMED' || order.status === 'SHIPPED' ? (
        <div className="card" style={{ marginBottom: 18, background: 'var(--surface-2)' }}>
          <div className="label" style={{ marginBottom: 8 }}>Shipping details (shown to the customer)</div>
          <div className="form-grid" style={{ marginBottom: -8 }}>
            <div className="field"><label htmlFor="cr">Courier</label><input id="cr" className="input" placeholder="e.g. Delhivery" value={courier} onChange={(e) => setCourier(e.target.value)} /></div>
            <div className="field"><label htmlFor="tn">Tracking number</label><input id="tn" className="input" value={tracking} onChange={(e) => setTracking(e.target.value)} /></div>
          </div>
        </div>
      ) : null}
      <div className="order-items">
        {order.items.map((it, i) => (
          <div className="order-item" key={i}><img src={imageUrl(it.imageUrl)} alt="" /><div className="grow"><b>{it.productName}</b><div className="muted small">{it.size ? `Size ${it.size} · ` : ''}Qty {it.quantity} × {money(it.price)}</div></div><b>{money(it.lineTotal)}</b></div>
        ))}
      </div>
      <hr className="divider" />
      <div className="detail-list">
        <div><span>Items</span><span>{money(order.itemsSubtotal)}</span></div>
        <div><span>Handling and delivery</span><span>{money(Number(order.handlingFee) + Number(order.deliveryFee))}</span></div>
        <div><span>GST</span><span>{money(order.tax)}</span></div>
        {Number(order.discount) > 0 ? <div><span>Coupon {order.couponCode}</span><span>− {money(order.discount)}</span></div> : null}
        <div><b>Total</b><b>{money(order.total)}</b></div>
        {Number(order.refundedAmount) > 0 ? <div style={{ color: 'var(--danger)' }}><span>Refunded (returns)</span><span>− {money(order.refundedAmount)}</span></div> : null}
      </div>
    </Modal>
  );
}

function exportOrdersCsv(status, q) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const load = async () => {
    let page = 0; let rows = []; let totalPages = 1;
    while (page < totalPages && page < 20) {
      // eslint-disable-next-line no-await-in-loop
      const { data } = await api.get('/api/admin/orders', { params: { status, q, page, size: 100 } });
      rows = rows.concat(data.content); totalPages = data.totalPages; page += 1;
    }
    const head = ['Order', 'Date', 'Customer', 'Email', 'Items', 'Total', 'Payment method', 'Payment status', 'Status', 'Courier', 'Tracking', 'Refunded'];
    const lines = rows.map((o) => [o.id, o.createdAt, o.customerName, o.customerEmail, o.items.reduce((n, i) => n + i.quantity, 0), o.total, o.paymentMethod, o.paymentStatus, o.status, o.courier, o.trackingNumber, o.refundedAmount].map(esc).join(','));
    const blob = new Blob([[head.map(esc).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
    toast.success(`Exported ${rows.length} orders`);
  };
  return load().catch((e) => toast.error(errMsg(e)));
}

export function AdminOrders() {
  const [status, setStatus] = useState('');
  const { data, q, setQ, setPage, reload } = usePagedList('/api/admin/orders', { status });
  const [sel, setSel] = useState(null);
  useEffect(() => { window.addEventListener('orders:changed', reload); return () => window.removeEventListener('orders:changed', reload); }, [reload]);

  return (
    <>
      <div className="card table-card">
        <div className="tabs">{TABS.map(([v, l]) => <button key={v} className={`tab ${status === v ? 'active' : ''}`} onClick={() => setStatus(v)}>{l}</button>)}</div>
        <div className="table-tools"><SearchInput value={q} onChange={setQ} placeholder="Search by order number, name or email" /><span className="grow" /><button className="btn ghost sm" onClick={() => exportOrdersCsv(status, q)}><Download size={15} /> Export CSV</button></div>
        {data === null ? <Spinner /> : data.content.length === 0 ? <Empty title="No orders here">Confirmed orders appear in this list as soon as they are placed.</Empty> : (
          <table className="tbl">
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th /></tr></thead>
            <tbody>
              {data.content.map((o) => (
                <tr key={o.id} className={o.status === 'CONFIRMED' ? 'fresh' : ''}>
                  <td className="cell-first"><b>#{o.id}</b></td>
                  <td data-label="Customer">{o.customerName}</td>
                  <td data-label="Date">{dateTime(o.createdAt)}</td>
                  <td data-label="Items">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td data-label="Total"><b>{money(o.total)}</b></td>
                  <td data-label="Payment"><PayBadge order={o} plain /></td>
                  <td data-label="Status"><StatusBadge status={o.status} plain /></td>
                  <td className="cell-actions"><div className="actions"><button className="btn sm outline" onClick={() => setSel(o)}>Manage</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data ? <div className="table-foot"><Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} /></div> : null}
      </div>
      {sel ? <OrderModal order={sel} onClose={() => setSel(null)} onChanged={(o) => { setSel(o); reload(); }} /> : null}
    </>
  );
}

/* ------------------------------------------------------------ Products */
export const AdminProducts = () => <ProductManager base="/api/admin" admin />;

/* ------------------------------------------------------------ Users */
const ROLE_TABS = [['', 'Everyone'], ['CUSTOMER', 'Customers'], ['SELLER', 'Sellers'], ['ADMIN', 'Admins']];
export function AdminUsers() {
  const [role, setRole] = useState('');
  const { data, q, setQ, setPage, reload } = usePagedList('/api/admin/users', { role });
  const setEnabled = async (u, enabled) => {
    if (!enabled && !window.confirm(`Block ${u.name}? They will be signed out and unable to log in.`)) return;
    try { await api.patch(`/api/admin/users/${u.id}/status`, { enabled }); toast.success(enabled ? 'Account unblocked' : 'Account blocked'); reload(); } catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <div className="card table-card">
      <div className="tabs">{ROLE_TABS.map(([v, l]) => <button key={v} className={`tab ${role === v ? 'active' : ''}`} onClick={() => setRole(v)}>{l}</button>)}</div>
      <div className="table-tools"><SearchInput value={q} onChange={setQ} placeholder="Search by name or email" /></div>
      {data === null ? <Spinner /> : data.content.length === 0 ? <Empty title="No users found" /> : (
        <table className="tbl">
          <thead><tr><th>Name</th><th>Role</th><th>Store</th><th>Phone</th><th>Joined</th><th>Status</th><th /></tr></thead>
          <tbody>
            {data.content.map((u) => (
              <tr key={u.id}>
                <td className="cell-first"><b>{u.name}</b><div className="muted small">{u.email}</div></td>
                <td data-label="Role"><span className={`badge ${u.role === 'ADMIN' ? 'brass' : u.role === 'SELLER' ? 'info' : ''}`}>{u.role.toLowerCase()}</span></td>
                <td data-label="Store">{u.storeName || '–'}</td>
                <td data-label="Phone">{u.phone || '–'}</td>
                <td data-label="Joined">{dateOnly(u.createdAt)}</td>
                <td data-label="Status"><span className={`badge ${u.enabled ? 'ok' : 'bad'}`}>{u.enabled ? 'Active' : 'Blocked'}</span></td>
                <td className="cell-actions"><div className="actions">
                  {u.role === 'ADMIN' ? null : u.enabled
                    ? <button className="btn sm ghost" onClick={() => setEnabled(u, false)}>Block</button>
                    : <button className="btn sm outline" onClick={() => setEnabled(u, true)}>Unblock</button>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data ? <div className="table-foot"><Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} /></div> : null}
    </div>
  );
}

/* ------------------------------------------------------------ Coupons */
function CouponForm({ coupon, onClose, onSaved }) {
  const [f, setF] = useState(coupon ? { ...coupon, minOrderAmount: coupon.minOrderAmount ?? '', expiresAt: coupon.expiresAt ?? '', description: coupon.description ?? '' }
    : { code: '', description: '', discountType: 'FLAT', discountValue: '', minOrderAmount: '', active: true, expiresAt: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    const body = { ...f, minOrderAmount: f.minOrderAmount === '' ? null : f.minOrderAmount, expiresAt: f.expiresAt || null };
    try {
      if (coupon) await api.put(`/api/admin/coupons/${coupon.id}`, body); else await api.post('/api/admin/coupons', body);
      toast.success('Coupon saved'); onSaved();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <Modal title={coupon ? 'Edit coupon' : 'New coupon'} narrow onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose} type="button">Cancel</button><button className="btn forest" form="cform" disabled={busy}>Save</button></>}>
      <form id="cform" onSubmit={save}>
        <div className="field"><label htmlFor="cc">Code</label><input id="cc" className="input" required maxLength={30} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} /></div>
        <div className="field"><label htmlFor="cd">Description</label><input id="cd" className="input" maxLength={200} value={f.description} onChange={set('description')} /></div>
        <div className="form-grid">
          <div className="field"><label htmlFor="ct">Type</label><select id="ct" className="input" value={f.discountType} onChange={set('discountType')}><option value="FLAT">Flat amount (₹)</option><option value="PERCENT">Percentage (%)</option></select></div>
          <div className="field"><label htmlFor="cv">Value</label><input id="cv" className="input" type="number" min="0.01" step="0.01" required value={f.discountValue} onChange={set('discountValue')} /></div>
          <div className="field"><label htmlFor="cm">Minimum order (₹)</label><input id="cm" className="input" type="number" min="0" value={f.minOrderAmount} onChange={set('minOrderAmount')} /></div>
          <div className="field"><label htmlFor="ce">Expires on</label><input id="ce" className="input" type="date" value={f.expiresAt} onChange={set('expiresAt')} /></div>
        </div>
        <label className="check"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Active</label>
      </form>
    </Modal>
  );
}

export function AdminCoupons() {
  const [list, setList] = useState(null);
  const [edit, setEdit] = useState(null);
  const load = useCallback(() => api.get('/api/admin/coupons').then((r) => setList(r.data)).catch((e) => toast.error(errMsg(e))), []);
  useEffect(() => { load(); }, [load]);
  const del = async (c) => { if (!window.confirm(`Delete coupon ${c.code}?`)) return; try { await api.delete(`/api/admin/coupons/${c.id}`); load(); } catch (e) { toast.error(errMsg(e)); } };
  return (
    <>
      <div className="card table-card">
        <div className="table-tools"><span className="grow" /><button className="btn forest" onClick={() => setEdit('new')}>New coupon</button></div>
        {list === null ? <Spinner /> : list.length === 0 ? <Empty title="No coupons yet" /> : (
          <table className="tbl">
            <thead><tr><th>Code</th><th>Discount</th><th>Minimum order</th><th>Expires</th><th>Status</th><th /></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td className="cell-first"><b>{c.code}</b><div className="muted small">{c.description}</div></td>
                  <td data-label="Discount">{c.discountType === 'PERCENT' ? `${Number(c.discountValue)}%` : money(c.discountValue)}</td>
                  <td data-label="Minimum order">{c.minOrderAmount ? money(c.minOrderAmount) : 'None'}</td>
                  <td data-label="Expires">{c.expiresAt ? dateOnly(c.expiresAt) : 'Never'}</td>
                  <td data-label="Status"><span className={`badge ${c.active ? 'ok' : ''}`}>{c.active ? 'Active' : 'Off'}</span></td>
                  <td className="cell-actions"><div className="actions">
                    <button className="icon-btn sm" onClick={() => setEdit(c)} aria-label="Edit coupon"><Pencil size={16} /></button>
                    <button className="icon-btn sm danger" onClick={() => del(c)} aria-label="Delete coupon"><Trash2 size={16} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {edit ? <CouponForm coupon={edit === 'new' ? null : edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} /> : null}
    </>
  );
}

/* ------------------------------------------------------------ Reviews */
export function AdminReviews() {
  const { data, q, setQ, setPage, reload } = usePagedList('/api/admin/reviews');
  const del = async (r) => { if (!window.confirm('Delete this review?')) return; try { await api.delete(`/api/admin/reviews/${r.id}`); toast.success('Review deleted'); reload(); } catch (e) { toast.error(errMsg(e)); } };
  return (
    <div className="card table-card">
      <div className="table-tools"><SearchInput value={q} onChange={setQ} placeholder="Search reviews, products or customers" /></div>
      {data === null ? <Spinner /> : data.content.length === 0 ? <Empty title="No reviews found" /> : (
        <table className="tbl">
          <thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Review</th><th>Date</th><th /></tr></thead>
          <tbody>
            {data.content.map((r) => (
              <tr key={r.id}>
                <td className="cell-first"><b>{r.productName}</b></td>
                <td data-label="Customer">{r.userName}{r.verifiedPurchase ? <span className="badge ok" style={{ marginLeft: 6 }}><Check size={11} /> verified</span> : null}</td>
                <td data-label="Rating"><Stars value={r.rating} size={13} /></td>
                <td data-label="Review" style={{ maxWidth: 320 }}>{r.comment || <span className="muted">No comment</span>}</td>
                <td data-label="Date">{dateOnly(r.createdAt)}</td>
                <td className="cell-actions"><div className="actions"><button className="icon-btn sm danger" onClick={() => del(r)} aria-label="Delete review"><Trash2 size={16} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data ? <div className="table-foot"><Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} /></div> : null}
    </div>
  );
}

/* ------------------------------------------------------------ Contact messages */
export function AdminMessages() {
  const [list, setList] = useState(null);
  const load = useCallback(() => api.get('/api/admin/messages').then((r) => setList(r.data)).catch((e) => toast.error(errMsg(e))), []);
  useEffect(() => { load(); }, [load]);
  const resolve = async (m) => { try { await api.patch(`/api/admin/messages/${m.id}/resolved`, null, { params: { value: !m.resolved } }); load(); } catch (e) { toast.error(errMsg(e)); } };
  const del = async (m) => { if (!window.confirm('Delete this message?')) return; try { await api.delete(`/api/admin/messages/${m.id}`); load(); } catch (e) { toast.error(errMsg(e)); } };
  if (list === null) return <Spinner />;
  if (list.length === 0) return <div className="card"><Empty title="No messages yet">Messages from the Contact page show up here.</Empty></div>;
  return (
    <div className="stack">
      {list.map((m) => (
        <div className="card" key={m.id} style={{ opacity: m.resolved ? .65 : 1 }}>
          <div className="row between wrap">
            <div><b>{m.subject || 'No subject'}</b><div className="muted small">{m.name} · <a href={`mailto:${m.email}`}>{m.email}</a> · {dateTime(m.createdAt)}</div></div>
            <div className="row"><button className="btn sm outline" onClick={() => resolve(m)}>{m.resolved ? 'Reopen' : 'Mark resolved'}</button><button className="icon-btn sm danger" onClick={() => del(m)} aria-label="Delete message"><Trash2 size={16} /></button></div>
          </div>
          <p style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap' }}>{m.message}</p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ Returns and refunds */
const RTABS = [['', 'All'], ['REQUESTED', 'Requested'], ['APPROVED', 'Approved'], ['RECEIVED', 'Received'], ['REFUNDED', 'Refunded'], ['REJECTED', 'Rejected'], ['CANCELLED', 'Cancelled']];
const FLOW = ['REQUESTED', 'APPROVED', 'RECEIVED', 'REFUNDED'];

function AdminReturnModal({ r, onClose, onChanged }) {
  const [note, setNote] = useState(r.adminNote || '');
  const [amount, setAmount] = useState(r.refundAmount);
  const [reference, setReference] = useState(r.refundReference || '');
  const [busy, setBusy] = useState(false);
  const online = r.paymentMethod === 'ONLINE';

  const act = async (action) => {
    if (action === 'REJECT' && !note.trim()) return toast.error('Add a reason so the customer knows why');
    if (action === 'REFUND' && !window.confirm(`Refund ${money(amount)} to ${r.customerName}?${online ? ' This is sent to their original payment method through Razorpay.' : ''}`)) return;
    setBusy(true);
    try {
      const { data } = await api.patch(`/api/admin/returns/${r.id}`, { action, note: note.trim() || null, refundAmount: action === 'REFUND' ? amount : null, refundReference: reference.trim() || null });
      toast.success({ APPROVE: 'Return approved', REJECT: 'Return rejected', RECEIVE: 'Marked as received', REFUND: 'Refund issued' }[action]);
      onChanged(data);
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const idx = FLOW.indexOf(r.status);
  const closed = ['REJECTED', 'CANCELLED'].includes(r.status);
  return (
    <Modal title={`Return #${r.id}`} onClose={onClose}
      footer={<>
        {r.status === 'REQUESTED' ? <button className="btn forest" disabled={busy} onClick={() => act('APPROVE')}>Approve return</button> : null}
        {r.status === 'APPROVED' ? <button className="btn ghost" disabled={busy} onClick={() => act('RECEIVE')}>Mark item received</button> : null}
        {r.status === 'APPROVED' || r.status === 'RECEIVED' ? <button className="btn forest" disabled={busy} onClick={() => act('REFUND')}>Refund {money(amount)}</button> : null}
        {r.status === 'REQUESTED' || r.status === 'APPROVED' ? <button className="btn danger" disabled={busy} onClick={() => act('REJECT')}>Reject</button> : null}
      </>}>
      <div className="flow" style={{ marginBottom: 16 }}>
        {closed ? <span className="f bad">{r.status.toLowerCase()}</span> : FLOW.map((f, i) => <span key={f} className={`f ${i < idx ? 'done' : i === idx ? 'now' : ''}`}>{f.toLowerCase()}</span>)}
      </div>
      <div className="order-item" style={{ marginBottom: 16 }}>
        <img src={imageUrl(r.imageUrl)} alt="" /><div className="grow"><b>{r.productName}</b><div className="muted small">{r.size ? `Size ${r.size} · ` : ''}Qty {r.quantity} · Order #{r.orderId}</div></div>
      </div>
      <div className="kv" style={{ marginBottom: 16 }}>
        <div><div className="label">Customer</div>{r.customerName}<div className="muted small">{r.customerEmail}</div></div>
        <div><div className="label">Requested</div>{dateTime(r.createdAt)}</div>
        <div><div className="label">Reason</div>{reasonLabel(r.reason)}</div>
        <div><div className="label">Order paid by</div>{online ? 'Online (Razorpay)' : 'Cash on delivery'}</div>
      </div>
      {r.comment ? <div className="card" style={{ background: 'var(--surface-2)', marginBottom: 16 }}><div className="label">Customer comment</div><p style={{ margin: '4px 0 0' }}>{r.comment}</p></div> : null}

      {r.status === 'REFUNDED' ? (
        <div className="alert ok"><Check size={18} /><div><b>Refunded {money(r.refundAmount)}</b> via {r.refundMode === 'RAZORPAY' ? 'Razorpay (original payment method)' : 'manual payout'}<br />{r.refundReference ? <>Reference: <b>{r.refundReference}</b></> : null}</div></div>
      ) : !closed ? (
        <>
          <div className="alert" style={{ marginBottom: 16 }}><Wallet size={18} /><div>
            {online ? 'Online order: pressing Refund sends the money back to the customer’s original payment method through Razorpay automatically.'
              : 'Cash on delivery order: pay the customer by UPI or bank transfer yourself, enter the reference below, then press Refund to record it.'}
          </div></div>
          {(r.status === 'APPROVED' || r.status === 'RECEIVED') ? (
            <div className="form-grid">
              <div className="field"><label htmlFor="ra">Refund amount (₹)</label><input id="ra" className="input" type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /><span className="hint">Calculated: price paid for the item plus GST, minus coupon share. Fees are not included.</span></div>
              {!online ? <div className="field"><label htmlFor="rf">Payout reference</label><input id="rf" className="input" placeholder="UPI or bank transaction id" value={reference} onChange={(e) => setReference(e.target.value)} /></div> : null}
            </div>
          ) : <p className="muted small">Estimated refund: <b>{money(r.refundAmount)}</b></p>}
          <div className="field"><label htmlFor="rn">Note to customer {r.status === 'REQUESTED' || r.status === 'APPROVED' ? '(required when rejecting)' : ''}</label><textarea id="rn" className="input" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></div>
        </>
      ) : r.adminNote ? <div className="alert bad"><Check size={18} /><div><b>Note to customer:</b> {r.adminNote}</div></div> : null}
    </Modal>
  );
}

export function AdminReturns() {
  const [status, setStatus] = useState('');
  const { data, q, setQ, setPage, reload } = usePagedList('/api/admin/returns', { status });
  const [stats, setStats] = useState(null);
  const [sel, setSel] = useState(null);
  const loadStats = useCallback(() => api.get('/api/admin/returns/stats').then((r) => setStats(r.data)).catch(() => {}), []);
  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { window.addEventListener('orders:changed', reload); return () => window.removeEventListener('orders:changed', reload); }, [reload]);
  const maxReason = stats ? Math.max(1, ...Object.values(stats.byReason)) : 1;

  return (
    <>
      {stats ? (
        <>
          <div className="stats">
            <Stat icon={RotateCcw} label="Awaiting review" value={stats.requested} tone="warn" />
            <Stat icon={Package} label="In progress (approved or received)" value={stats.approved + stats.received} tone="brass" />
            <Stat icon={Check} label="Refunded returns" value={stats.refunded} tone="ok" />
            <Stat icon={Wallet} label="Total refunded" value={money(stats.refundedAmount)} tone="bad" />
          </div>
          <div className="card">
            <div className="panel-title"><h3>Why customers return items</h3><span className="muted small">{stats.rejected} rejected</span></div>
            {Object.entries(stats.byReason).map(([k, n]) => (
              <div className="hbar" key={k}><span>{reasonLabel(k)}</span><div className="track"><i style={{ width: `${(n / maxReason) * 100}%` }} /></div><b>{n}</b></div>
            ))}
          </div>
        </>
      ) : null}
      <div className="card table-card">
        <div className="tabs-pills">{RTABS.map(([v, l]) => <button key={v} className={`tab ${status === v ? 'active' : ''}`} onClick={() => setStatus(v)}>{l}{v === 'REQUESTED' && stats?.requested ? <span className="n">{stats.requested}</span> : null}</button>)}</div>
        <div className="table-tools"><SearchInput value={q} onChange={setQ} placeholder="Search by product, customer or order number" /></div>
        {data === null ? <Spinner /> : data.content.length === 0 ? <Empty title="No returns here">Return requests from customers appear in this list.</Empty> : (
          <table className="tbl">
            <thead><tr><th>Item</th><th>Order</th><th>Customer</th><th>Reason</th><th>Refund</th><th>Requested</th><th>Status</th><th /></tr></thead>
            <tbody>
              {data.content.map((r) => (
                <tr key={r.id} className={r.status === 'REQUESTED' ? 'fresh' : ''}>
                  <td className="cell-first"><div className="cell-prod"><img src={imageUrl(r.imageUrl)} alt="" /><div><b>{r.productName}</b><span className="muted small">{r.size ? `Size ${r.size} · ` : ''}Qty {r.quantity}</span></div></div></td>
                  <td data-label="Order">#{r.orderId}</td>
                  <td data-label="Customer">{r.customerName}</td>
                  <td data-label="Reason">{reasonLabel(r.reason)}</td>
                  <td data-label="Refund"><b>{money(r.refundAmount)}</b></td>
                  <td data-label="Requested">{dateOnly(r.createdAt)}</td>
                  <td data-label="Status"><ReturnBadge status={r.status} plain /></td>
                  <td className="cell-actions"><div className="actions"><button className="btn sm outline" onClick={() => setSel(r)}>{['REQUESTED', 'APPROVED', 'RECEIVED'].includes(r.status) ? 'Review' : 'View'}</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data ? <div className="table-foot"><Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} /></div> : null}
      </div>
      {sel ? <AdminReturnModal r={sel} onClose={() => setSel(null)} onChanged={(r) => { setSel(r); reload(); loadStats(); }} /> : null}
    </>
  );
}
