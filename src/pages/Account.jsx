import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Heart, PackageSearch, RotateCcw, UserCog } from 'lucide-react';
import { Moon, Settings2, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client';
import { Reveal } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LANGS, useT } from '../i18n/I18nContext';

export default function Account() {
  const { t, lang, setLang } = useT();
  const { user, refresh } = useAuth();
  const { theme, setTheme, motion, setMotion } = useTheme();
  const [f, setF] = useState({ name: user.name, phone: user.phone || '', storeName: user.storeName || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [busy, setBusy] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault(); setBusy('p');
    try { await api.put('/api/auth/profile', f); await refresh(); toast.success(t('a.saved')); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(''); }
  };
  const savePw = async (e) => {
    e.preventDefault(); setBusy('w');
    try { await api.post('/api/auth/change-password', pw); toast.success(t('a.changed')); setPw({ currentPassword: '', newPassword: '' }); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(''); }
  };

  return (
    <>
      <div className="page-head"><div className="container"><h1>{t('a.title')}</h1><p>{user.name} · {user.email}</p></div></div>
      <div className="container account-grid">
        <nav className="side-nav" aria-label="Account">
          <NavLink to="/account"><UserCog size={18} />{t('a.title')}</NavLink>
          <NavLink to="/orders"><PackageSearch size={18} />{t('nav.orders')}</NavLink>
          <NavLink to="/returns"><RotateCcw size={18} />{t('nav.returns')}</NavLink>
          <NavLink to="/wishlist"><Heart size={18} />{t('nav.wishlist')}</NavLink>
        </nav>
        <div className="stack">
          <Reveal className="card">
            <h3>{t('a.prefs')}</h3>
            <div className="pref-row"><div><b>{t('pref.language')}</b><div className="muted small">{t('pref.langHint')}</div></div>
              <div className="seg">{LANGS.map((l) => <button key={l.code} className={lang === l.code ? 'active' : ''} onClick={() => setLang(l.code)}>{l.label}</button>)}</div></div>
            <div className="pref-row"><div><b>{t('pref.theme')}</b><div className="muted small">{t('pref.themeHint')}</div></div>
              <div className="seg">{[['light', Sun, 'pref.light'], ['dark', Moon, 'pref.dark'], ['system', Settings2, 'pref.system']].map(([v, Icon, k]) => (
                <button key={v} className={theme === v ? 'active' : ''} onClick={() => setTheme(v)}><Icon size={14} />{t(k)}</button>))}</div></div>
            <div className="pref-row"><div><b>{t('pref.motion')}</b><div className="muted small">{t('pref.motionHint')}</div></div>
              <label className="switch"><input type="checkbox" checked={motion === 'reduced'} onChange={(e) => setMotion(e.target.checked ? 'reduced' : 'full')} /><i /></label></div>
          </Reveal>

          <Reveal className="card" delay={80}>
            <h3>{t('a.profile')}</h3>
            <form onSubmit={saveProfile} style={{ marginTop: 16 }}>
              <div className="form-grid">
                <div className="field"><label htmlFor="an">{t('a.name')}</label><input id="an" className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
                <div className="field"><label htmlFor="ap">{t('a.phone')}</label><input id="ap" className="input" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
                <div className="field"><label htmlFor="ae">{t('a.email')}</label><input id="ae" className="input" value={user.email} disabled /><span className="hint">{t('a.emailLocked')}</span></div>
                {user.role === 'SELLER' ? <div className="field"><label htmlFor="as">{t('a.store')}</label><input id="as" className="input" value={f.storeName} onChange={(e) => setF({ ...f, storeName: e.target.value })} /></div> : null}
              </div>
              <button className="btn forest" disabled={busy === 'p'}>{t('c.save')}</button>
            </form>
          </Reveal>

          <Reveal className="card" delay={120}>
            <h3>{t('a.password')}</h3>
            <form onSubmit={savePw} style={{ marginTop: 16 }}>
              <div className="form-grid">
                <div className="field"><label htmlFor="cp">{t('a.current')}</label><input id="cp" type="password" className="input" required autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
                <div className="field"><label htmlFor="np">{t('a.new')}</label><input id="np" type="password" className="input" required minLength={6} autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></div>
              </div>
              <button className="btn forest" disabled={busy === 'w'}>{t('a.password')}</button>
            </form>
          </Reveal>
          {user.role !== 'CUSTOMER' ? <p className="small muted"><Link to={user.role === 'ADMIN' ? '/admin' : '/seller'}>{user.role === 'ADMIN' ? t('nav.admin') : t('nav.seller')}</Link></p> : null}
        </div>
      </div>
    </>
  );
}
