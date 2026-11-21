import { useState } from 'react';
import { useI18n, LANGUAGES } from '../lib/i18n.jsx';

const DASHBOARD_ICON = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const INVOICES_ICON = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="14 3 14 9 20 9" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

const CUSTOMERS_ICON = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

const FORECAST_ICON = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="15 7 21 7 21 13" />
  </svg>
);

export default function Layout({ page, onNavigate, children }) {
  const { t, lang, setLang } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  const labels = {
    en: t('lang.en'),
    hi: t('lang.hi'),
    mr: t('lang.mr'),
  };

  const items = [
    { key: 'dashboard', label: t('nav.dashboard'), icon: DASHBOARD_ICON },
    { key: 'invoices', label: t('nav.invoices'), icon: INVOICES_ICON },
    { key: 'customers', label: t('nav.customers'), icon: CUSTOMERS_ICON },
    { key: 'forecast', label: t('nav.forecast'), icon: FORECAST_ICON },
  ];

  return (
    <div className="app-shell">
      <aside className={'sidebar' + (menuOpen ? ' open' : '')}>
        <div className="sidebar-brand">
          <img src="/favicon.svg" alt="" width="36" height="36" className="sidebar-logo" />
          <span className="sidebar-name">{t('app.name')}</span>
        </div>
        <nav className="nav" aria-label={t('nav.menu')}>
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              className={'nav-item' + (page === item.key ? ' active' : '')}
              aria-current={page === item.key ? 'page' : undefined}
              onClick={() => {
                onNavigate(item.key);
                setMenuOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-tagline">{t('app.tagline')}</div>
          <div className="lang-switch" role="group" aria-label={t('lang.label')}>
            {LANGUAGES.map((code) => (
              <button
                key={code}
                type="button"
                className={lang === code ? 'active' : ''}
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
              >
                {labels[code]}
              </button>
            ))}
          </div>
        </div>
      </aside>
      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}
      <div className="content-col">
        <header className="topbar">
          <button
            type="button"
            className="menu-toggle"
            aria-label={t('nav.menu')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </button>
          <div className="topbar-title">{t('nav.' + page)}</div>
        </header>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
