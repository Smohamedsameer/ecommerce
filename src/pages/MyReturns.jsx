import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client';
import { Empty, Reveal, ReturnBadge, Spinner } from '../components/ui';
import { useT } from '../i18n/I18nContext';
import { dateOnly, imageUrl, money } from '../utils';

const FLOW = ['REQUESTED', 'APPROVED', 'RECEIVED', 'REFUNDED'];

export default function MyReturns() {
  const { t } = useT();
  const [list, setList] = useState(null);
  const load = useCallback(() => api.get('/api/returns/mine').then((r) => setList(r.data)).catch((e) => { toast.error(errMsg(e)); setList([]); }), []);
  useEffect(() => { load(); }, [load]);

  const cancel = async (r) => {
    try { await api.post(`/api/returns/${r.id}/cancel`); toast.success(t('ret.cancelled')); load(); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <>
      <div className="page-head"><div className="container"><h1>{t('ret.title')}</h1><p>{t('ret.sub')} <Link to="/policy/returns">{t('ret.policy')}</Link></p></div></div>
      <div className="container" style={{ padding: '32px 0 72px' }}>
        {list === null ? <Spinner /> : list.length === 0 ? (
          <Empty title={t('ret.none.t')} action={<Link to="/orders" className="btn">{t('o.h.title')}</Link>}>{t('ret.none.s')}</Empty>
        ) : list.map((r, idx) => {
          const stepIdx = FLOW.indexOf(r.status);
          const closed = ['REJECTED', 'CANCELLED'].includes(r.status);
          return (
            <Reveal key={r.id} className="card" style={{ marginBottom: 16 }} delay={Math.min(idx, 4) * 60}>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <img src={imageUrl(r.imageUrl)} alt="" style={{ width: 72, height: 72, objectFit: 'contain', background: 'var(--tile)', border: '1px solid var(--line)', borderRadius: 12, padding: 4 }} />
                <div className="grow">
                  <div className="row between wrap"><b>{r.productName}</b><ReturnBadge status={r.status} /></div>
                  <div className="muted small">{r.size ? `${t('p.size')} ${r.size} · ` : ''}{t('c.qty')} {r.quantity} · {t(`rr.${r.reason}`)}</div>
                  <div className="muted small"><Link to={`/orders/${r.orderId}`}>{t('ret.of', { n: r.orderId })}</Link> · {t('ret.created', { date: dateOnly(r.createdAt) })}</div>
                </div>
              </div>
              {!closed ? (
                <div className="timeline" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', margin: '20px 0 8px' }}>
                  {FLOW.map((s, i) => (
                    <div key={s} className={`step ${i <= stepIdx ? 'done' : ''} ${i === stepIdx ? 'current' : ''}`}><i>{i <= stepIdx ? <Check size={16} /> : null}</i>{t(`rs.${s}`)}</div>
                  ))}
                </div>
              ) : null}
              <div className={`alert ${r.status === 'REFUNDED' ? 'ok' : r.status === 'REJECTED' ? 'bad' : ''}`} style={{ marginTop: 12 }}>
                <Info size={18} />
                <div>
                  <div>{t(`rs.hint.${r.status}`)}</div>
                  {r.status === 'REFUNDED' ? (
                    <div className="small" style={{ marginTop: 4 }}>
                      <b>{t('ret.refunded', { amount: money(r.refundAmount) })}</b><br />
                      {r.refundMode ? t(`ret.via.${r.refundMode}`) : null}
                      {r.refundReference ? <><br />{t('ret.ref')}: <b>{r.refundReference}</b></> : null}
                    </div>
                  ) : r.status !== 'REJECTED' && r.status !== 'CANCELLED' ? <div className="small muted" style={{ marginTop: 4 }}>{t('ret.estimate')}: {money(r.refundAmount)}</div> : null}
                  {r.adminNote ? <div className="small" style={{ marginTop: 6 }}><b>{t('ret.note')}:</b> {r.adminNote}</div> : null}
                </div>
              </div>
              {r.status === 'REQUESTED' ? <div style={{ marginTop: 12 }}><button className="btn ghost sm" onClick={() => cancel(r)}>{t('ret.cancelReq')}</button></div> : null}
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
