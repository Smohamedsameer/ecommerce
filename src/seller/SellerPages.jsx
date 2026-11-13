import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, IndianRupee, LayoutDashboard, Package, RotateCcw, ShoppingCart, TriangleAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client';
import DashLayout from '../components/DashLayout';
import { Empty, Pagination, ReturnBadge, Spinner, StatusBadge } from '../components/ui';
import { SalesChart, Stat } from '../components/dashkit';
import ProductManager from '../components/ProductManager';
import { useAuth } from '../context/AuthContext';
import { dateTime, imageUrl, money, reasonLabel } from '../utils';

const ITEMS = [
  { to: '/seller', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/seller/products', label: 'My products', icon: Package },
  { to: '/seller/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/seller/returns', label: 'Returns', icon: RotateCcw },
];

export const SellerShell = () => <DashLayout role="SELLER" items={ITEMS} />;

export function SellerDashboard() {
  const { user } = useAuth();
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/api/seller/stats').then((r) => setS(r.data)).catch((e) => toast.error(errMsg(e))); }, []);
  if (!s) return <Spinner />;
  return (
    <>
      <div className="card row between wrap">
        <div><h3 style={{ marginBottom: 2 }}>Welcome, {user.name.split(' ')[0]}</h3><span className="muted">Products you upload go live in the shop immediately.</span></div>
        <Link to="/seller/products" className="btn forest">Manage products</Link>
      </div>
      <div className="stats">
        <Stat icon={IndianRupee} label="Earnings" value={money(s.earnings)} />
        <Stat icon={ShoppingCart} label="Orders" value={s.orders} />
        <Stat icon={Boxes} label="Units sold" value={s.unitsSold} />
        <Stat icon={Package} label={`Products (${s.activeProducts} live)`} value={s.products} tone="brass" />
      </div>
      <div className="panels">
        <div className="card"><div className="panel-title"><h3>Earnings, last 7 days</h3></div><SalesChart points={s.sales} /></div>
        <div className="card">
          <div className="panel-title"><h3>Best sellers</h3></div>
          {s.topProducts.length === 0 ? <p className="muted">Your best sellers will appear here.</p> : (
            <div className="mini-list">{s.topProducts.map((t) => <div className="it" key={t.name}><div><b>{t.name}</b><span className="muted small">{t.units} sold</span></div><b>{money(t.revenue)}</b></div>)}</div>
          )}
        </div>
      </div>
      {s.lowStockProducts.length > 0 ? (
        <div className="card">
          <div className="panel-title"><h3><TriangleAlert size={17} style={{ verticalAlign: '-3px', color: 'var(--warning)' }} /> Running low</h3></div>
          <div className="mini-list">{s.lowStockProducts.map((p) => <div className="it" key={p.id}><b>{p.name}</b><span className={`badge ${p.stock === 0 ? 'bad' : 'warn'}`}>{p.stock === 0 ? 'Out of stock' : `${p.stock} left`}</span></div>)}</div>
        </div>
      ) : null}
    </>
  );
}

export const SellerProducts = () => <ProductManager base="/api/seller" />;

export function SellerOrders() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  useEffect(() => { setData(null); api.get('/api/seller/orders', { params: { page, size: 10 } }).then((r) => setData(r.data)).catch((e) => { toast.error(errMsg(e)); setData({ content: [], totalPages: 0, page: 0 }); }); }, [page]);
  return (
    <div className="card table-card">
      {data === null ? <Spinner /> : data.content.length === 0 ? <Empty title="No orders yet">When customers buy your products, the orders show up here.</Empty> : (
        <table className="tbl">
          <thead><tr><th>Product</th><th>Order</th><th>Customer</th><th>Qty</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {data.content.map((r, i) => (
              <tr key={`${r.orderId}-${i}`}>
                <td className="cell-first"><div className="cell-prod"><img src={imageUrl(r.imageUrl)} alt="" /><div><b>{r.productName}</b><span className="muted small">{r.size ? `Size ${r.size}` : ''}</span></div></div></td>
                <td data-label="Order">#{r.orderId}<div className="muted small">{dateTime(r.createdAt)}</div></td>
                <td data-label="Customer">{r.customerName}<div className="muted small">{r.city}</div></td>
                <td data-label="Qty">{r.quantity}</td>
                <td data-label="Amount"><b>{money(r.amount)}</b></td>
                <td data-label="Status"><StatusBadge status={r.status} plain /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data ? <div className="table-foot"><Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} /></div> : null}
    </div>
  );
}

export function SellerReturns() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  useEffect(() => { setData(null); api.get('/api/seller/returns', { params: { page, size: 10 } }).then((r) => setData(r.data)).catch((e) => { toast.error(errMsg(e)); setData({ content: [], totalPages: 0, page: 0 }); }); }, [page]);
  return (
    <div className="card table-card">
      <div className="table-tools"><span className="muted small">Returns on your products. The store admin reviews and refunds them.</span></div>
      {data === null ? <Spinner /> : data.content.length === 0 ? <Empty title="No returns">Good news: no customer has returned your products.</Empty> : (
        <table className="tbl">
          <thead><tr><th>Item</th><th>Order</th><th>Reason</th><th>Qty</th><th>Requested</th><th>Status</th></tr></thead>
          <tbody>
            {data.content.map((r) => (
              <tr key={r.id}>
                <td className="cell-first"><div className="cell-prod"><img src={imageUrl(r.imageUrl)} alt="" /><div><b>{r.productName}</b><span className="muted small">{r.size ? `Size ${r.size}` : ''}</span></div></div></td>
                <td data-label="Order">#{r.orderId}</td>
                <td data-label="Reason">{reasonLabel(r.reason)}{r.comment ? <div className="muted small">{r.comment}</div> : null}</td>
                <td data-label="Qty">{r.quantity}</td>
                <td data-label="Requested">{dateTime(r.createdAt)}</td>
                <td data-label="Status"><ReturnBadge status={r.status} plain /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data ? <div className="table-foot"><Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} /></div> : null}
    </div>
  );
}
