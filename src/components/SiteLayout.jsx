import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Lenis from 'lenis';
import { ArrowUp, Globe, Heart, LayoutDashboard, LogOut, Menu, Moon, PackageSearch, RotateCcw, Search, Settings2, ShoppingBag, Store, Sun, User, UserCog, X, Shirt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { LANGS, useT } from '../i18n/I18nContext';
import { STORE_NAME } from '../config';
import { asset } from '../utils';

/** Brand logo. Light/dark artwork swaps with the theme; pass `dark` where the background is always dark (footer, sidebars). */
export const Logo = ({ to = '/', dark = false, full = false }) => (
  <Link to={to} className={`logo ${full ? 'logo-full' : ''}`} aria-label={STORE_NAME}>
    {dark ? (
      <img className="logo-img" src={asset(full ? '/img/logo-full-dark.png' : '/img/logo-dark.png')} alt={STORE_NAME} width="560" height="172" />
    ) : (
      <>
        <img className="logo-img logo-for-light" src={asset('/img/logo-light.png')} alt={STORE_NAME} width="560" height="172" />
        <img className="logo-img logo-for-dark" src={asset('/img/logo-dark.png')} alt="" aria-hidden="true" width="560" height="172" />
      </>
    )}
  </Link>
);

/** Scrolls to an element, using the smooth scroller when it is active. */
export function scrollToEl(el, offset = -90) {
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset, duration: 1.1 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function SearchBox({ className = '', onDone }) {
  const nav = useNavigate();
  const { t } = useT();
  const [q, setQ] = useState('');
  const submit = (e) => {
    e.preventDefault();
    nav(`/shop${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
    setQ(''); onDone?.();
  };
  return (
    <form className={`search ${className}`} onSubmit={submit} role="search">
      <Search size={17} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('nav.search')} aria-label={t('nav.search')} />
    </form>
  );
}

function useOutside(open, close, selector) {
  useEffect(() => {
    if (!open) return undefined;
    const fn = (e) => { if (!e.target.closest(selector)) close(); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open, close, selector]);
}

function PrefsMenu() {
  const { t, lang, setLang } = useT();
  const { theme, setTheme, motion, setMotion } = useTheme();
  const [open, setOpen] = useState(false);
  useOutside(open, () => setOpen(false), '.prefs');
  return (
    <div className="pop-wrap prefs">
      <button className="icon-btn" onClick={() => setOpen(!open)} aria-label={t('nav.prefs')} aria-expanded={open}><Settings2 size={19} /></button>
      {open ? (
        <div className="pop" style={{ minWidth: 290 }}>
          <div className="group-label"><Globe size={13} style={{ verticalAlign: '-2px' }} /> {t('pref.language')}</div>
          <div className="seg">{LANGS.map((l) => <button key={l.code} className={lang === l.code ? 'active' : ''} onClick={() => setLang(l.code)}>{l.label}</button>)}</div>
          <div className="group-label">{t('pref.theme')}</div>
          <div className="seg">
            {[['light', Sun, 'pref.light'], ['dark', Moon, 'pref.dark'], ['system', Settings2, 'pref.system']].map(([v, Icon, k]) => (
              <button key={v} className={theme === v ? 'active' : ''} onClick={() => setTheme(v)}><Icon size={14} />{t(k)}</button>
            ))}
          </div>
          <label className="item" style={{ justifyContent: 'space-between', cursor: 'pointer' }}>
            <span><b style={{ fontWeight: 600 }}>{t('pref.motion')}</b><span className="muted small" style={{ display: 'block' }}>{t('pref.motionHint')}</span></span>
            <span className="switch"><input type="checkbox" checked={motion === 'reduced'} onChange={(e) => setMotion(e.target.checked ? 'reduced' : 'full')} /><i /></span>
          </label>
        </div>
      ) : null}
    </div>
  );
}

function Header({ scrolled }) {
  const { user, logout } = useAuth();
  const { t } = useT();
  const { count } = useCart();
  const { resolved, toggle } = useTheme();
  const wish = useWishlist();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [bump, setBump] = useState(false);
  const prev = useRef(count);
  const loc = useLocation();

  useEffect(() => { setOpen(false); setMenu(false); }, [loc.pathname]);
  useOutside(menu, () => setMenu(false), '.account');
  useEffect(() => {
    if (count > prev.current) { setBump(true); const id = setTimeout(() => setBump(false), 500); return () => clearTimeout(id); }
    prev.current = count; return undefined;
  }, [count]);
  useEffect(() => { prev.current = count; }, [count]);

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container bar">
        <button className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label={t('nav.menu')} aria-expanded={open}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        <Logo />
        <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main">
          <SearchBox className="mobile-search" onDone={() => setOpen(false)} />
          <NavLink to="/" end>{t('nav.home')}</NavLink>
          <NavLink to="/shop">{t('nav.shop')}</NavLink>
          <NavLink to="/blog">{t('nav.journal')}</NavLink>
          <NavLink to="/about">{t('nav.about')}</NavLink>
          <NavLink to="/contact">{t('nav.contact')}</NavLink>
        </nav>
        <SearchBox className="header-search" />
        <div className="header-actions">
          <button className="icon-btn theme-toggle hide-sm" onClick={toggle} aria-label={resolved === 'dark' ? t('pref.light') : t('pref.dark')}>
            {resolved === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <PrefsMenu />
          <Link to="/wishlist" className="icon-btn hide-sm" aria-label={t('nav.wishlist')}>
            <Heart size={19} />{wish.count > 0 ? <span className="cart-count">{wish.count}</span> : null}
          </Link>
          <Link to="/cart" className="icon-btn" aria-label={`${t('nav.cart')} (${count})`}>
            <ShoppingBag size={19} />{count > 0 ? <span className={`cart-count ${bump ? 'bump' : ''}`}>{count}</span> : null}
          </Link>
          {user ? (
            <div className="pop-wrap account">
              <button className="icon-btn" onClick={() => setMenu(!menu)} aria-label={t('nav.account')} aria-expanded={menu}><User size={19} /></button>
              {menu ? (
                <div className="pop">
                  <div className="who"><b>{user.name}</b><span className="muted small">{user.email}</span><br /><span className="badge info" style={{ marginTop: 6 }}>{user.role.toLowerCase()}</span></div>
                  {user.role === 'ADMIN' && <Link to="/admin"><LayoutDashboard size={17} /> {t('nav.admin')}</Link>}
                  {user.role === 'SELLER' && <Link to="/seller"><Store size={17} /> {t('nav.seller')}</Link>}
                  <Link to="/orders"><PackageSearch size={17} /> {t('nav.orders')}</Link>
                  <Link to="/returns"><RotateCcw size={17} /> {t('nav.returns')}</Link>
                  <Link to="/wishlist"><Heart size={17} /> {t('nav.wishlist')}</Link>
                  <Link to="/account"><UserCog size={17} /> {t('nav.account')}</Link>
                  <button className="item" onClick={() => { logout(); setMenu(false); }}><LogOut size={17} /> {t('nav.signout')}</button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link to="/login" className="btn sm">{t('nav.signin')}</Link>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { user } = useAuth();
  const { t } = useT();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div><Logo dark full /><p>{t('foot.tag')}</p><p className="small">Chennai, Tamil Nadu</p></div>
          <div>
            <h4>{t('foot.shop')}</h4>
            <Link to="/shop?category=Shirts">Shirts</Link><Link to="/shop?category=T-Shirts">T-Shirts</Link>
            <Link to="/shop?category=Jerseys">Jerseys</Link><Link to="/shop?category=Printed">Printed</Link>
          </div>
          <div>
            <h4>{t('foot.company')}</h4>
            <Link to="/about">{t('nav.about')}</Link><Link to="/blog">{t('nav.journal')}</Link><Link to="/contact">{t('nav.contact')}</Link>
            {user?.role === 'SELLER' ? <Link to="/seller">{t('nav.seller')}</Link> : <Link to="/register?as=seller">{t('nav.sell')}</Link>}
          </div>
          <div>
            <h4>{t('foot.policies')}</h4>
            <Link to="/policy/returns">{t('pol.returns')}</Link><Link to="/policy/refunds">{t('pol.refunds')}</Link>
            <Link to="/policy/shipping">{t('pol.shipping')}</Link><Link to="/policy/privacy">{t('pol.privacy')}</Link>
            <Link to="/policy/terms">{t('pol.terms')}</Link>
          </div>
          <div><h4>{t('foot.pay')}</h4><p className="small">{t('foot.pay.p')}</p></div>
        </div>
        <div className="copyright"><span>© {new Date().getFullYear()} {STORE_NAME}. {t('foot.rights')}</span><span>{t('foot.prices')}</span></div>
      </div>
    </footer>
  );
}

export default function SiteLayout() {
  const loc = useLocation();
  const { motion } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [top, setTop] = useState(false);
  const bar = useRef(null);

  // Smooth, inertial scrolling (skipped when the visitor prefers reduced motion)
  useEffect(() => {
    if (motion === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    window.__lenis = lenis;
    let raf;
    const loop = (time) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); window.__lenis = null; };
  }, [motion]);

  // scroll progress bar, sticky-header shadow, back-to-top
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const y = window.scrollY; const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      setScrolled(y > 8); setTop(y > 700); ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // reveal-on-scroll for every [data-reveal] element, including ones that load later.
  // Watched elements are tracked in a local WeakSet (not a DOM attribute) so that React StrictMode's
  // double-run of effects, or any re-mount of this layout, can never leave an element un-watched and hidden.
  useEffect(() => {
    const watched = new WeakSet();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-in', '1'); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    const scan = () => document.querySelectorAll('[data-reveal]:not([data-in])').forEach((el) => {
      if (watched.has(el)) return;
      watched.add(el); io.observe(el);
    });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    // safety net: anything still hidden after a moment that is already on screen gets revealed
    const safety = setTimeout(() => {
      document.querySelectorAll('[data-reveal]:not([data-in])').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.setAttribute('data-in', '1');
      });
    }, 1200);
    return () => { clearTimeout(safety); io.disconnect(); mo.disconnect(); };
  }, []);

  useEffect(() => {
    if (loc.hash) { setTimeout(() => scrollToEl(document.getElementById(loc.hash.slice(1))), 80); return; }
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true }); else window.scrollTo(0, 0);
  }, [loc.pathname, loc.hash]);

  return (
    <>
      <div className="progress" ref={bar} aria-hidden="true" />
      <Header scrolled={scrolled} />
      <main key={loc.pathname} className="page"><Outlet /></main>
      <Footer />
      <button className={`btn icon-btn to-top ${top ? 'show' : ''}`} aria-label="Back to top" onClick={() => (window.__lenis ? window.__lenis.scrollTo(0, { duration: 1.2 }) : window.scrollTo({ top: 0, behavior: 'smooth' }))}>
        <ArrowUp size={20} />
      </button>
    </>
  );
}