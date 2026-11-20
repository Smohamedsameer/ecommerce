import { API_URL } from './config';
import { getLocale } from './i18n/locale';

const inr0 = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const money = (n) => {
  const v = Number(n || 0);
  return Number.isInteger(v) ? inr0.format(v) : inr2.format(v);
};

/** Path to a file in /public that stays correct under any base path (root, or /repo-name/ on GitHub Pages). */
export const asset = (p) => import.meta.env.BASE_URL + String(p).replace(/^\//, '');

export const imageUrl = (u) => {
  if (!u) return asset('/img/placeholder.svg');
  if (u.startsWith('/uploads')) return API_URL + u;
  if (u.startsWith('/img/')) return asset(u);   // demo products ship their pictures in /public/img
  return u;
};

export const dateTime = (d) =>
  d ? new Date(d).toLocaleString(getLocale(), { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
export const dateOnly = (d) =>
  d ? new Date(d).toLocaleDateString(getLocale(), { day: '2-digit', month: 'short', year: 'numeric' }) : '';
export const dateShort = (d) =>
  d ? new Date(d).toLocaleDateString(getLocale(), { weekday: 'short', day: 'numeric', month: 'short' }) : '';

// English labels for dashboards (the admin and seller screens are English only).
export const statusLabel = (s) =>
  ({ PENDING_PAYMENT: 'Awaiting payment', CONFIRMED: 'Confirmed', SHIPPED: 'Shipped', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' }[s] || s);
export const returnStatusLabel = (s) =>
  ({ REQUESTED: 'Requested', APPROVED: 'Approved', RECEIVED: 'Received', REFUNDED: 'Refunded', REJECTED: 'Rejected', CANCELLED: 'Cancelled' }[s] || s);
export const reasonLabel = (s) =>
  ({ WRONG_SIZE: 'Wrong size or fit', DEFECTIVE: 'Defective', NOT_AS_DESCRIBED: 'Not as described', DAMAGED: 'Damaged in transit', CHANGED_MIND: 'Changed mind', OTHER: 'Other' }[s] || s);

export function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error('Failed to load ' + src));
    document.body.appendChild(s);
  });
}

/** Recently viewed products, kept in the browser. */
export const getRecent = () => { try { return JSON.parse(localStorage.getItem('recent')) || []; } catch { return []; } };
export const pushRecent = (p) => {
  try {
    const slim = { id: p.id, name: p.name, brand: p.brand, category: p.category, imageUrl: p.imageUrl, price: p.price, mrp: p.mrp,
      discountPercent: p.discountPercent, stock: p.stock, avgRating: p.avgRating, ratingCount: p.ratingCount };
    const list = [slim, ...getRecent().filter((x) => x.id !== p.id)].slice(0, 8);
    localStorage.setItem('recent', JSON.stringify(list));
  } catch { /* ignore */ }
};

/** Estimated delivery date: today + n days (skipping Sundays). */
export function addBusinessDays(n) {
  const d = new Date();
  let left = n;
  while (left > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) left -= 1; }
  return d;
}
