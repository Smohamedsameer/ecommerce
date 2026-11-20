import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { errMsg } from '../api/client';
import { homeFor, useAuth } from '../context/AuthContext';
import { useT } from '../i18n/I18nContext';
import { asset } from '../utils';

/** Splits a headline so its last two words can be styled as a gold italic accent (works for any language). */
function Headline({ text }) {
  const w = text.trim().split(/\s+/);
  if (w.length < 4) return text;
  return <>{w.slice(0, -2).join(' ')} <em>{w.slice(-2).join(' ')}</em></>;
}

/** Left panel: editorial photo (fills the panel edge to edge) behind the welcome copy (slow zoom, disabled for reduced-motion visitors). */
function Side({ seller }) {
  const { t } = useT();
  return (
    <div className="auth-side">
      <img className="auth-bg" src={asset('/img/login-bg.png')} alt="" width="1200" height="1610" fetchpriority="high" />
      <div className="auth-shade" aria-hidden="true" />
      <div className="auth-side-inner">
        <span className="eyebrow">{t('home.eyebrow')}</span>
        <h2><Headline text={seller ? t('au.side2') : t('au.side1')} /></h2>
        <p>{seller ? t('au.side2s') : t('au.side1s')}</p>
      </div>
    </div>
  );
}

export function Login() {
  const { t } = useT();
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [f, setF] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={params.get('next') || homeFor(user)} replace />;
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const u = await login(f.email, f.password);
      toast.success(t('au.welcome', { name: u.name.split(' ')[0] }));
      nav(u.role === 'CUSTOMER' ? params.get('next') || '/' : homeFor(u), { replace: true });
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <div className="auth-wrap">
      <Side />
      <div className="auth-form">
        <div>
          <h2>{t('au.signin')}</h2>
          <p className="muted">{t('au.new')} <Link to={`/register${params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''}`}>{t('au.create')}</Link></p>
          <form onSubmit={submit}>
            <div className="field"><label htmlFor="email">{t('au.email')}</label><input id="email" className="input" type="email" autoComplete="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div className="field"><label htmlFor="pw">{t('au.password')}</label><input id="pw" className="input" type="password" autoComplete="current-password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
            <button className="btn forest block lg" disabled={busy}>{busy ? t('au.signing') : t('au.signin')}</button>
          </form>
          <div className="demo-box">
            <b>{t('au.demo')}</b> ({t('au.demoNote')})<br />
            Admin: admin@store.com / Admin@123<br />Seller: seller@store.com / Seller@123<br />Customer: customer@store.com / Customer@123
          </div>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const { t } = useT();
  const { user, register } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('as') === 'seller' ? 'SELLER' : 'CUSTOMER');
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', storeName: '' });
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={homeFor(user)} replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const u = await register({ ...f, role, phone: f.phone || null, storeName: role === 'SELLER' ? f.storeName : null });
      toast.success(t('au.done'));
      nav(u.role === 'SELLER' ? '/seller' : params.get('next') || '/', { replace: true });
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <div className="auth-wrap">
      <Side seller={role === 'SELLER'} />
      <div className="auth-form">
        <div>
          <h2>{t('au.reg')}</h2>
          <p className="muted">{t('au.have')} <Link to="/login">{t('au.signin')}</Link></p>
          <div className="seg" role="tablist" style={{ marginBottom: 20 }}>
            <button type="button" className={role === 'CUSTOMER' ? 'active' : ''} onClick={() => setRole('CUSTOMER')}>{t('au.shop')}</button>
            <button type="button" className={role === 'SELLER' ? 'active' : ''} onClick={() => setRole('SELLER')}>{t('au.sellTab')}</button>
          </div>
          <form onSubmit={submit}>
            <div className="field"><label htmlFor="n">{t('au.name')}</label><input id="n" className="input" required value={f.name} onChange={set('name')} autoComplete="name" /></div>
            {role === 'SELLER' ? <div className="field"><label htmlFor="s">{t('au.store')}</label><input id="s" className="input" required value={f.storeName} onChange={set('storeName')} /></div> : null}
            <div className="field"><label htmlFor="e">{t('au.email')}</label><input id="e" className="input" type="email" required value={f.email} onChange={set('email')} autoComplete="email" /></div>
            <div className="field"><label htmlFor="p">{t('au.phone')}</label><input id="p" className="input" inputMode="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" /></div>
            <div className="field"><label htmlFor="pw">{t('au.password')}</label><input id="pw" className="input" type="password" minLength={6} required value={f.password} onChange={set('password')} autoComplete="new-password" /><span className="hint">{t('au.pwHint')}</span></div>
            <button className="btn forest block lg" disabled={busy}>{busy ? t('au.creating') : role === 'SELLER' ? t('au.open') : t('au.createBtn')}</button>
          </form>
        </div>
      </div>
    </div>
  );
}