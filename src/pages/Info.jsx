import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client';
import { Reveal } from '../components/ui';
import { useStoreInfo } from '../context/StoreInfoContext';
import { useT } from '../i18n/I18nContext';
import { CONTACT, STORE_NAME } from '../config';

const Head = ({ title, sub }) => <div className="page-head"><div className="container"><h1>{title}</h1>{sub ? <p>{sub}</p> : null}</div></div>;

export function About() {
  const { t } = useT();
  const info = useStoreInfo();
  return (
    <>
      <Head title={t('ab.title')} sub={t('ab.sub')} />
      <div className="container section">
        <div className="two-col">
          <Reveal variant="left" className="prose">
            <h2>{t('ab.h')}</h2><span className="rule" style={{ marginBottom: 20 }} />
            <p>{t('ab.p1')}</p><p>{t('ab.p2')}</p>
            <Link to="/shop" className="btn forest lg">{t('home.shop')}</Link>
          </Reveal>
          <div className="stack">
            {[1, 2, 3, 4].map((i) => <Reveal key={i} variant="right" delay={i * 80} className="card"><h3>{t(`ab.c${i}.t`)}</h3><p className="muted" style={{ margin: 0 }}>{t(`ab.c${i}.s`, { n: info.returnWindowDays })}</p></Reveal>)}
          </div>
        </div>
      </div>
    </>
  );
}

export function Contact() {
  const { t } = useT();
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const { data } = await api.post('/api/contact', f); toast.success(data.message); setF({ name: '', email: '', subject: '', message: '' }); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <>
      <Head title={t('ct.title')} sub={t('ct.sub')} />
      <div className="container section">
        <div className="two-col">
          <Reveal as="form" variant="left" className="card" onSubmit={submit}>
            <div className="field"><label htmlFor="cn">{t('ct.name')}</label><input id="cn" className="input" required value={f.name} onChange={set('name')} /></div>
            <div className="field"><label htmlFor="ce">{t('ct.email')}</label><input id="ce" type="email" className="input" required value={f.email} onChange={set('email')} /></div>
            <div className="field"><label htmlFor="cs">{t('ct.subject')}</label><input id="cs" className="input" value={f.subject} onChange={set('subject')} /></div>
            <div className="field"><label htmlFor="cm">{t('ct.message')}</label><textarea id="cm" className="input" required maxLength={2000} value={f.message} onChange={set('message')} /></div>
            <button className="btn forest" disabled={busy}>{busy ? t('c.sending') : t('c.sendMsg')}</button>
          </Reveal>
          <div className="stack">
            {[[MapPin, 'ct.visit', CONTACT.address], [Mail, 'ct.mail', CONTACT.email], [Phone, 'ct.call', CONTACT.phone], [Clock, 'ct.hours', CONTACT.hours]].map(([Icon, k, v], i) => (
              <Reveal key={k} variant="right" delay={i * 80} className="card row"><span className="ico-box"><Icon size={20} /></span><div><b>{t(k)}</b><div className="muted">{v}</div></div></Reveal>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Journal articles are editorial content, kept in English.
const POSTS = [
  ['How a shirt should fit', 'Shoulders first: the seam should sit at the edge of your shoulder bone. Sleeves end at the wrist, and you should be able to pinch about two fingers of fabric at the chest. Everything else can be tailored, but shoulders cannot.', 'Style guide'],
  ['Caring for football jerseys', 'Wash inside out in cold water, skip the fabric softener and let it air dry. Heat and softener break down the moisture-wicking fibres and crack printed crests over time.', 'Care'],
  ['Printed shirts without the noise', 'Pick one statement piece and keep the rest quiet. A bold print in a muted palette pairs well with plain trousers and neutral footwear, and works day or night.', 'Style guide'],
  ['Reading fabric labels', 'Cotton breathes, viscose drapes, and blends add durability. Look for the percentage rather than the marketing name, and check the weight if the seller lists it.', 'Know your fabric'],
];
export function Blog() {
  const { t } = useT();
  const [open, setOpen] = useState(null);
  return (
    <>
      <Head title={t('bl.title')} sub={t('bl.sub')} />
      <div className="container section">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {POSTS.map(([title, body, tag], i) => (
            <Reveal key={title} delay={i * 80} className="card post">
              <span className="badge info">{tag}</span>
              <h3 style={{ margin: '12px 0 8px' }}>{title}</h3>
              <p className="muted">{open === i ? body : `${body.slice(0, 90)}…`}</p>
              <button className="link-btn" onClick={() => setOpen(open === i ? null : i)}>{open === i ? t('bl.less') : t('bl.more')}</button>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}

export const NotFound = () => {
  const { t } = useT();
  return <div className="container"><div className="empty"><h3>{t('nf.title')}</h3><p>{t('nf.text')}</p><Link to="/" className="btn">{t('nf.home')}</Link></div></div>;
};
