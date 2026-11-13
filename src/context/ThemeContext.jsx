import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

const read = (k, d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => read('theme', 'system'));   // light | dark | system
  const [motion, setMotionState] = useState(() => read('motion', 'full'));  // full | reduced
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#0A1311' : '#0B4A44');
  }, [resolved]);
  useEffect(() => { document.documentElement.classList.toggle('no-motion', motion === 'reduced'); }, [motion]);

  const setTheme = useCallback((t) => { try { localStorage.setItem('theme', t); } catch { /* ignore */ } setThemeState(t); }, []);
  const setMotion = useCallback((m) => { try { localStorage.setItem('motion', m); } catch { /* ignore */ } setMotionState(m); }, []);
  const toggle = useCallback(() => setTheme(resolved === 'dark' ? 'light' : 'dark'), [resolved, setTheme]);

  const value = useMemo(() => ({ theme, resolved, setTheme, motion, setMotion, toggle }), [theme, resolved, setTheme, motion, setMotion, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
