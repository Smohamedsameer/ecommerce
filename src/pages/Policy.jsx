import { Link, NavLink, Navigate, useParams } from 'react-router-dom';
import { Accordion, Reveal } from '../components/ui';
import { useStoreInfo } from '../context/StoreInfoContext';
import { useT } from '../i18n/I18nContext';
import policies from '../i18n/policies';
import { money } from '../utils';

const SLUGS = ['returns', 'refunds', 'shipping', 'privacy', 'terms'];

function SideNav() {
  const { t } = useT();
  return (
    <nav className="side-nav" aria-label={t('pol.title')}>
      {SLUGS.map((s) => <NavLink key={s} to={`/policy/${s}`}>{t(`pol.${s}`)}</NavLink>)}
      <NavLink to="/faq">{t('pol.faq')}</NavLink>
    </nav>
  );
}

export default function Policy() {
  const { slug } = useParams();
  const { t, lang } = useT();
  const info = useStoreInfo();
  const doc = (policies[lang] && policies[lang][slug]) || (policies.en && policies.en[slug]);
  if (!doc) return <Navigate to="/policy/returns" replace />;

  // fill in the live numbers from the server settings
  const fill = (s) => String(s)
    .split('{days}').join(info.returnWindowDays).split('{delivery}').join(info.deliveryDays)
    .split('{free}').join(money(info.freeDeliveryAbove)).split('{fee}').join(money(info.deliveryFee)).split('{handling}').join(money(info.handlingFee));

  return (
    <>
      <div className="page-head"><div className="container"><h1>{t(`pol.${slug}`)}</h1><p>{fill(doc.intro)}</p></div></div>
      <div className="container policy-layout">
        <SideNav />
        <div className="stack">
          {doc.callouts ? (
            <div className="policy-callout">
              {doc.callouts.map(([n, l], i) => <Reveal key={i} delay={i * 80}><b>{fill(n)}</b><span className="muted small">{fill(l)}</span></Reveal>)}
            </div>
          ) : null}
          {doc.sections.map((s, i) => (
            <Reveal key={i} className="policy-card" delay={40}>
              <h2 style={{ fontSize: '1.4rem' }}>{s.h}</h2>
              {s.p ? <p className="muted" style={{ margin: 0 }}>{fill(s.p)}</p> : null}
              {s.list ? <ul className="muted" style={{ margin: 0, paddingLeft: '1.2em' }}>{s.list.map((x, k) => <li key={k} style={{ marginBottom: 6 }}>{fill(x)}</li>)}</ul> : null}
              {s.steps ? <ol className="policy-steps">{s.steps.map((x, k) => <li key={k}><span>{fill(x)}</span></li>)}</ol> : null}
            </Reveal>
          ))}
          <p className="small muted">{t('pol.help')}: <Link to="/contact">{t('nav.contact')}</Link></p>
        </div>
      </div>
    </>
  );
}

export function Faq() {
  const { t } = useT();
  const info = useStoreInfo();
  const items = [1, 2, 3, 4, 5].map((i) => ({ q: t(`faq.${i}.q`), a: t(`faq.${i}.a`, { n: i === 1 ? info.deliveryDays : info.returnWindowDays }) }));
  return (
    <>
      <div className="page-head"><div className="container"><h1>{t('pol.faq')}</h1><p>{t('home.faq.s')}</p></div></div>
      <div className="container policy-layout"><SideNav /><div><Accordion items={items} /></div></div>
    </>
  );
}
