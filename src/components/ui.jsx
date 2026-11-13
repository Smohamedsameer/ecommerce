import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Heart, Search, Star, X } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useT } from '../i18n/I18nContext';
import { imageUrl, money, reasonLabel, returnStatusLabel, statusLabel } from '../utils';

/** Wrap anything in <Reveal> to fade it in when it scrolls into view. */
export function Reveal({ as: Tag = 'div', variant = '', delay = 0, style, children, ...rest }) {
  return <Tag data-reveal={variant} style={{ '--d': `${delay}ms`, ...style }} {...rest}>{children}</Tag>;
}

/** Star rating with half-star precision. */
export function Stars({ value = 0, size = 15 }) {
  return (
    <span className="stars" aria-label={`${value} / 5`} role="img">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
            <Star size={size} color="var(--line-strong)" fill="var(--line-strong)" style={{ position: 'absolute', inset: 0 }} />
            <span style={{ position: 'absolute', inset: 0, width: `${fill * 100}%`, overflow: 'hidden' }}>
              <Star size={size} color="var(--brass)" fill="var(--brass)" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function WishHeart({ id }) {
  const { has, toggle } = useWishlist();
  const { t } = useT();
  const on = has(id);
  return (
    <button className={`heart ${on ? 'on' : ''}`} aria-pressed={on} aria-label={on ? t('p.unwish') : t('p.wish')}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); }}>
      <Heart size={18} />
    </button>
  );
}

export function ProductCard({ p, list }) {
  const { t } = useT();
  const out = p.stock <= 0;
  return (
    <Link to={`/product/${p.id}`} className={`pcard ${list ? 'list-mode' : ''}`}>
      {p.discountPercent ? <span className="badge brass tag">{t('c.off', { n: p.discountPercent })}</span> : null}
      <WishHeart id={p.id} />
      <div className="thumb"><img src={imageUrl(p.imageUrl)} alt={p.name} loading="lazy" /></div>
      <div className="body">
        <span className="brand">{p.brand || p.category}</span>
        <h3>{p.name}</h3>
        <div className="rate">
          {p.ratingCount > 0 ? (<><Stars value={p.avgRating} size={14} /><span>{p.avgRating.toFixed(1)} ({p.ratingCount})</span></>) : <span>{t('p.noReviews')}</span>}
        </div>
        <div className="price">
          <b>{money(p.price)}</b>
          {p.mrp && Number(p.mrp) > Number(p.price) ? <s>{money(p.mrp)}</s> : null}
          {out ? <span className="badge bad">{t('c.soldOut')}</span> : null}
        </div>
      </div>
    </Link>
  );
}

/** Product grid whose cards fade in one after another. */
export function ProductGrid({ products, cols, list }) {
  return (
    <div className={`grid ${cols === 3 ? 'cols-3' : ''} ${list ? 'list' : ''}`}>
      {products.map((p, i) => (
        <Reveal key={p.id} delay={(i % 4) * 70} style={{ display: 'flex', flexDirection: 'column' }}><ProductCard p={p} list={list} /></Reveal>
      ))}
    </div>
  );
}

export const SkeletonGrid = ({ n = 8, cols }) => (
  <div className={`grid ${cols === 3 ? 'cols-3' : ''}`} aria-busy="true">
    {Array.from({ length: n }).map((_, i) => (
      <div className="sk-card" key={i}>
        <div className="skeleton sk-img" />
        <div className="sk-body"><div className="skeleton" style={{ height: 12, width: '40%' }} /><div className="skeleton" style={{ height: 16 }} /><div className="skeleton" style={{ height: 16, width: '70%' }} /><div className="skeleton" style={{ height: 18, width: '35%' }} /></div>
      </div>
    ))}
  </div>
);

export function Pagination({ page, totalPages, onChange }) {
  const { t } = useT();
  if (!totalPages || totalPages <= 1) return null;
  const nums = [];
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  return (
    <nav className="pager" aria-label="Pagination">
      <button disabled={page === 0} onClick={() => onChange(page - 1)}>{t('c.prev')}</button>
      {nums.map((n, i) => n === '…' ? <span key={`e${i}`} className="muted">…</span> : (
        <button key={n} className={n === page ? 'active' : ''} onClick={() => onChange(n)} aria-current={n === page ? 'page' : undefined}>{n + 1}</button>
      ))}
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>{t('c.next')}</button>
    </nav>
  );
}

export function Modal({ title, onClose, children, footer, narrow }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const lenis = window.__lenis; lenis?.stop();
    return () => { document.removeEventListener('keydown', onKey); lenis?.start(); };
  }, [onClose]);
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${narrow ? 'narrow' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head"><h3>{title}</h3><button className="icon-btn sm" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        <div className="modal-body" data-lenis-prevent>{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

export const SearchInputLite = ({ value, onChange, placeholder }) => (
  <label className="search"><Search size={17} /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} /></label>
);

export const Spinner = () => <div className="spinner" role="status" aria-label="Loading" />;

export function Empty({ title, children, action }) {
  return <div className="empty"><h3>{title}</h3>{children ? <p>{children}</p> : null}{action}</div>;
}

export function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  return items.map((it, i) => (
    <Reveal key={i} delay={i * 60} className={`acc ${open === i ? 'open' : ''}`}>
      <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>{it.q}<ChevronDown size={20} /></button>
      <div className="panel"><div><p>{it.a}</p></div></div>
    </Reveal>
  ));
}

/** Counts up to a number when it scrolls into view. */
export function Countup({ to, suffix = '', prefix = '' }) {
  const ref = useRef(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    const reduce = document.documentElement.classList.contains('no-motion') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setV(to); return undefined; }
    let raf; let start;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const tick = (ts) => { start = start || ts; const p = Math.min(1, (ts - start) / 1400); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{prefix}{v.toLocaleString('en-IN')}{suffix}</span>;
}

// ---------- badges (storefront badges follow the language; pass `plain` for the English-only dashboards)
const STATUS_TONE = { PENDING_PAYMENT: 'warn', CONFIRMED: 'info', SHIPPED: 'brass', DELIVERED: 'ok', CANCELLED: 'bad' };
export function StatusBadge({ status, plain }) {
  const { t } = useT();
  return <span className={`badge ${STATUS_TONE[status] || ''}`}>{plain ? statusLabel(status) : t(`st.${status}`)}</span>;
}

const PAY_TONE = { PAID: 'ok', PENDING: 'warn', FAILED: 'bad', COD: 'info' };
export function PayBadge({ order, plain }) {
  const { t } = useT();
  const T = (k, en) => (plain ? en : t(k));
  const label = order.paymentMethod === 'COD'
    ? (order.paymentStatus === 'PAID' ? T('pay.codPaid', 'COD paid') : T('pay.cod', 'Cash on delivery'))
    : (order.paymentStatus === 'PAID' ? T('pay.paid', 'Paid online') : T('pay.pending', 'Payment pending'));
  return <span className={`badge ${PAY_TONE[order.paymentStatus] || ''}`}>{label}</span>;
}

const RET_TONE = { REQUESTED: 'warn', APPROVED: 'info', RECEIVED: 'brass', REFUNDED: 'ok', REJECTED: 'bad', CANCELLED: '' };
export function ReturnBadge({ status, plain }) {
  const { t } = useT();
  return <span className={`badge ${RET_TONE[status] || ''}`}>{plain ? returnStatusLabel(status) : t(`rs.${status}`)}</span>;
}
export const reasonText = (t, reason, plain) => (plain ? reasonLabel(reason) : t(`rr.${reason}`));

/** Redirects unless the signed-in user has one of the allowed roles. */
export function RequireRole({ roles, children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <Spinner />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
