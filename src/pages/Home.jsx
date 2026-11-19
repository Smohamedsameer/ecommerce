import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Lock, Pause, Play, RotateCcw, Shirt, Truck, Gift } from 'lucide-react';
import api from '../api/client';
import { Accordion, Countup, ProductGrid, Reveal, SkeletonGrid, Stars } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useStoreInfo } from '../context/StoreInfoContext';
import { useTheme } from '../context/ThemeContext';
import { useT } from '../i18n/I18nContext';
import { getRecent, imageUrl, money } from '../utils';

const TILES = [
  { name: 'Shirts', img: '/img/pro1.jpg' }, { name: 'T-Shirts', img: '/img/prod6.jpg' },
  { name: 'Jerseys', img: '/img/prod4.jpg' }, { name: 'Printed', img: '/img/prod9.jpg' },
];

/** Full-bleed looping hero film. Respects reduced-motion, pauses off-screen, and can be paused by the visitor. */
function HeroVideo() {
  const { t } = useT();
  const { motion } = useTheme();
  const ref = useRef(null);
  const reduce = motion === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [playing, setPlaying] = useState(!reduce);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (playing && visible && !reduce) v.play().catch(() => setPlaying(false));
    else v.pause();
  }, [playing, visible, reduce]);

  return (
    <>
      <div className="hero-media" aria-hidden="true">
        <video ref={ref} src="/video/hero.mp4" poster="/video/hero-poster.jpg" muted loop playsInline preload="auto" autoPlay={!reduce} disablePictureInPicture />
      </div>
      <div className="hero-shade" />
      {reduce ? null : (
        <button type="button" className="hero-ctl" onClick={() => setPlaying((p) => !p)} aria-label={playing ? t('home.pause') : t('home.play')}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
      )}
    </>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { t } = useT();
  const info = useStoreInfo();
  const [top, setTop] = useState(null);
  const [fresh, setFresh] = useState(null);
  const [total, setTotal] = useState(0);
  const [reviews, setReviews] = useState([]);
  const recent = useMemo(() => getRecent().slice(0, 4), []);

  useEffect(() => {
    api.get('/api/products', { params: { sort: 'rating', size: 8 } }).then((r) => {
      setTop(r.data.content);
      const best = r.data.content[0];
      if (best) api.get(`/api/products/${best.id}/reviews`).then((rv) => setReviews(rv.data.reviews.filter((x) => x.comment).slice(0, 3))).catch(() => {});
    }).catch(() => setTop([]));
    api.get('/api/products', { params: { sort: 'newest', size: 4 } }).then((r) => { setFresh(r.data.content); setTotal(r.data.totalElements); }).catch(() => setFresh([]));
  }, []);

  const feature = top && top[0];
  const free = money(info.freeDeliveryAbove);
  const faq = [1, 2, 3, 4, 5].map((i) => ({ q: t(`faq.${i}.q`), a: t(`faq.${i}.a`, { n: info.returnWindowDays === undefined ? 7 : (i === 1 ? info.deliveryDays : info.returnWindowDays) }) }));
  const marquee = [t('home.tr1.t'), 'Shirts', t('home.tr3.t'), 'Jerseys', t('home.tr2.t'), 'T-Shirts', t('home.tr4.t'), 'Printed'];

  return (
    <>
      <section className="hero">
        <HeroVideo />
        <div className="container hero-inner">
          <div>
            <Reveal><span className="eyebrow">{t('home.eyebrow')}</span></Reveal>
            <Reveal delay={80}><h1>{t('home.t1')} <em>{t('home.t2')}</em></h1></Reveal>
            <Reveal delay={200}><p className="lead">{t('home.lead')}</p></Reveal>
            <Reveal delay={300} className="hero-cta">
              <Link to="/shop" className="btn on-dark lg">{t('home.shop')}</Link>
              {user?.role === 'SELLER' ? <Link to="/seller" className="btn outline-light lg">{t('nav.seller')}</Link> : <Link to="/register?as=seller" className="btn outline-light lg">{t('home.sell')}</Link>}
            </Reveal>
            <Reveal delay={400} className="hero-note">
              <span><Truck size={18} /> {t('home.note1', { n: free })}</span>
              <span><Lock size={18} /> {t('home.note2')}</span>
            </Reveal>
          </div>
          {feature ? (
            <Link to={`/product/${feature.id}`} className="hero-feature">
              <img src={imageUrl(feature.imageUrl)} alt="" />
              <div><small>{t('home.fav.t')}</small><b>{feature.name}</b><span>{money(feature.price)}</span></div>
            </Link>
          ) : null}
        </div>
        <div className="marquee" aria-hidden="true">
          <div className="track">{[0, 1].map((k) => <span key={k}>{marquee.map((m, i) => <span key={i}>{m}</span>)}</span>)}</div>
        </div>
      </section>

      <section className="trust" aria-label="Why shop with us">
        <div className="container trust-grid">
          {[[Truck, 'home.tr1', { n: free }], [Lock, 'home.tr2'], [RotateCcw, 'home.tr3', { n: info.returnWindowDays }], [BadgeCheck, 'home.tr4']].map(([Icon, k, v], i) => (
            <Reveal className="trust-item" key={k} delay={i * 80}>
              <span className="ico-box"><Icon size={21} /></span>
              <div><b>{t(`${k}.t`)}</b><span className="sub">{t(`${k}.s`, v)}</span></div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head"><div><h2>{t('home.cat.t')}</h2><p>{t('home.cat.s')}</p><span className="rule" /></div></Reveal>
          <div className="cat-grid">
            {TILES.map((c, i) => (
              <Reveal key={c.name} delay={i * 80}>
                <Link to={`/shop?category=${encodeURIComponent(c.name)}`} className="cat-tile">
                  <img src={c.img} alt="" /><div><b>{c.name}</b><span>{t('home.cat.browse')}</span></div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <Reveal className="section-head">
            <div><h2>{t('home.fav.t')}</h2><p>{t('home.fav.s')}</p><span className="rule" /></div>
            <Link to="/shop?sort=rating" className="btn outline sm">{t('c.seeAll')}</Link>
          </Reveal>
          {top === null ? <SkeletonGrid n={8} /> : <ProductGrid products={top} />}
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="stats-band">
            <Reveal className="stats-head"><span className="eyebrow">{t('home.stats.eyebrow')}</span><h2>{t('home.stats.t')}</h2></Reveal>
            <div className="stats-grid">
              {[[RotateCcw, info.returnWindowDays, '', 'home.stat.returns'], [Truck, info.deliveryDays, '', 'home.stat.delivery'], [Gift, info.freeDeliveryAbove, '₹', 'home.stat.free'], [Shirt, total, '', 'home.stat.products']].map(([Icon, n, prefix, k], i) => (
                <Reveal key={k} variant="zoom" delay={i * 110} className="stat-cell">
                  <span className="stat-ico"><Icon size={22} /></span>
                  <b className="stat-num"><Countup to={Number(n) || 0} prefix={prefix} /></b>
                  <span className="stat-label">{t(k)}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <Reveal variant="zoom" className="promo">
            <div><h2>{t('home.promo.t')}</h2><p>{t('home.promo.s')}</p></div>
            <Link to="/shop" className="btn brass lg">{t('home.promo.cta')}</Link>
          </Reveal>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <Reveal className="section-head"><div><h2>{t('home.new.t')}</h2><p>{t('home.new.s')}</p><span className="rule" /></div></Reveal>
          {fresh === null ? <SkeletonGrid n={4} /> : <ProductGrid products={fresh} />}
        </div>
      </section>

      {reviews.length > 0 ? (
        <section className="section tight">
          <div className="container">
            <Reveal className="section-head"><div><h2>{t('home.say.t')}</h2><p>{t('home.say.s')}</p><span className="rule" /></div></Reveal>
            <div className="testi-grid">
              {reviews.map((r, i) => (
                <Reveal key={r.id} className="card testi" delay={i * 100}>
                  <Stars value={r.rating} size={17} />
                  <p>“{r.comment}”</p>
                  <div className="who"><span className="avatar-lg">{r.userName[0]}</span><div><b>{r.userName}</b>{r.verifiedPurchase ? <div className="small muted">{t('r.verified')}</div> : null}</div></div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section className="section tight">
          <div className="container">
            <Reveal className="section-head"><div><h2>{t('p.recent')}</h2><span className="rule" /></div></Reveal>
            <ProductGrid products={recent} />
          </div>
        </section>
      ) : null}

      <section className="section tight">
        <div className="container" style={{ maxWidth: 860 }}>
          <Reveal className="section-head"><div><h2>{t('home.faq.t')}</h2><p>{t('home.faq.s')}</p><span className="rule" /></div></Reveal>
          <Accordion items={faq} />
        </div>
      </section>
    </>
  );
}
