import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api, { errMsg } from '../api/client';
import useDebounced from '../useDebounced';
import { money } from '../utils';
import toast from 'react-hot-toast';

export function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="stat">
      <span className={`ico ${tone || ''}`}><Icon size={22} /></span>
      <div><b>{value}</b><span>{label}</span></div>
    </div>
  );
}

export function SalesChart({ points }) {
  const max = Math.max(1, ...points.map((p) => Number(p.revenue)));
  return (
    <div className="chart" role="img" aria-label="Revenue for the last 7 days">
      {points.map((p) => (
        <div className="col" key={p.date}>
          <span className="val">{Number(p.revenue) > 0 ? money(p.revenue) : ''}</span>
          <div className="bar" style={{ height: `${(Number(p.revenue) / max) * 100}%` }} title={`${p.orders} orders`} />
          <span className="day">{new Date(p.date).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
        </div>
      ))}
    </div>
  );
}

export const SearchInput = ({ value, onChange, placeholder }) => (
  <label className="search">
    <Search size={17} />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
  </label>
);

/**
 * Loads a paged list from the API with debounced search.
 * Returns { data, loading, q, setQ, page, setPage, reload, params, setParam }.
 */
export function usePagedList(url, extra = {}, size = 10) {
  const [q, setQ] = useState('');
  const dq = useDebounced(q, 350);
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [tick, setTick] = useState(0);
  const extraKey = JSON.stringify(extra);

  useEffect(() => { setPage(0); }, [dq, extraKey]);
  useEffect(() => {
    let off = false;
    api.get(url, { params: { q: dq, page, size, ...JSON.parse(extraKey) } })
      .then((r) => { if (!off) setData(r.data); })
      .catch((e) => { if (!off) { toast.error(errMsg(e)); setData({ content: [], totalPages: 0, totalElements: 0, page: 0 }); } });
    return () => { off = true; };
  }, [url, dq, page, size, extraKey, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, q, setQ, page, setPage, reload };
}
