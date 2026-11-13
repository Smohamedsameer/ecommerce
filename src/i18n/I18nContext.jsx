import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from './en';
import ta from './ta';
import { setLocaleCode } from './locale';

const dicts = { en, ta };
export const LANGS = [{ code: 'en', label: 'English' }, { code: 'ta', label: 'தமிழ்' }];

const I18nContext = createContext(null);
export const useT = () => useContext(I18nContext);

const initial = () => {
  try {
    const saved = localStorage.getItem('lang');
    if (saved && dicts[saved]) return saved;
  } catch { /* ignore */ }
  return (navigator.language || '').toLowerCase().startsWith('ta') ? 'ta' : 'en';
};

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initial);

  useEffect(() => {
    setLocaleCode(lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const setLang = useCallback((l) => {
    if (!dicts[l]) return;
    try { localStorage.setItem('lang', l); } catch { /* ignore */ }
    setLocaleCode(l);
    setLangState(l);
  }, []);

  // t('key', { n: 7 }) replaces {n}. Missing keys fall back to English, then to the key itself.
  const t = useCallback((key, vars) => {
    let s = dicts[lang][key] ?? en[key] ?? key;
    if (vars) Object.keys(vars).forEach((k) => { s = s.split(`{${k}}`).join(vars[k]); });
    return s;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
