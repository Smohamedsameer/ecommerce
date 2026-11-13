import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LogOut, Menu, Moon, Store as StoreIcon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './SiteLayout';
import { useAuth } from '../context/AuthContext';

/** Shared shell for the admin panel and the seller dashboard. */
export default function DashLayout({ role, items, badges = {}, titles }) {
  const { user, logout } = useAuth();
  const { resolved, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const current = items.find((i) => (i.end ? loc.pathname === i.to : loc.pathname.startsWith(i.to)));
  const title = titles?.[loc.pathname] || current?.label || '';

  return (
    <div className="dash">
      <aside className={`side ${open ? 'open' : ''}`}>
        <Logo />
        <div className="role-tag">{role === 'ADMIN' ? 'Admin panel' : `Seller${user?.storeName ? ': ' + user.storeName : ''}`}</div>
        <nav aria-label="Dashboard">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}>
              <Icon size={19} /> {label}
              {badges[to] ? <span className="count">{badges[to]}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="foot">
          <Link to="/"><StoreIcon size={19} /> View storefront</Link>
          <button onClick={logout}><LogOut size={19} /> Sign out</button>
        </div>
      </aside>
      <div className={`scrim ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <div className="dash-main">
        <header className="topbar">
          <button className="icon-btn menu-toggle" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <h1>{title}</h1>
          <span className="spacer" />
          <button className="icon-btn" onClick={toggle} aria-label="Toggle dark mode">{resolved === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button>
          <div className="avatar" title={user?.name}>{user?.name?.[0]?.toUpperCase()}</div>
        </header>
        <div className="dash-content"><Outlet context={{ setOpen }} /></div>
      </div>
    </div>
  );
}
