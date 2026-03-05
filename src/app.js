/**
 * HANBIN — App Entry Point
 */

import { initRouter } from './router.js';
import { buildCSSVariables } from './styles/theme.js';
import { globalCSS } from './styles/global.js';

function injectStyles() {
  // CSS переменные из темы
  const rootStyle = document.createElement('style');
  rootStyle.id = 'hanbin-theme';
  rootStyle.textContent = `:root { ${buildCSSVariables()} }`;
  document.head.appendChild(rootStyle);

  // Глобальные стили
  const globalStyle = document.createElement('style');
  globalStyle.id = 'hanbin-global';
  globalStyle.textContent = globalCSS + componentCSS;
  document.head.appendChild(globalStyle);
}

// ─── Component-level CSS ─────────────────────
// Стили компонентов. При желании можно вынести в отдельные файлы.
const componentCSS = `

/* ── Header ── */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 28px 20px;
  max-width: 1280px;
  margin: 0 auto;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 40px;
  gap: 16px;
}

.logo-link { text-decoration: none; }
.logo-name {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 300;
  letter-spacing: 0.08em;
  color: var(--color-text);
}
.logo-name span { color: var(--color-rose); font-style: italic; }
.logo-tagline {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  font-weight: 300;
}

.header__nav { display: flex; align-items: center; gap: 6px; }
.nav-link {
  padding: 7px 14px;
  border-radius: 30px;
  font-size: 12px;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: var(--transition-fast);
}
.nav-link:hover { color: var(--color-text); background: var(--color-surface); }
.nav-link--active { color: var(--color-rose); background: var(--color-accentGlow); }

.header__right { display: flex; align-items: center; gap: 12px; }

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 40px;
  padding: 10px 18px;
  transition: var(--transition-normal);
  width: 240px;
}
.search-bar:hover, .search-bar:focus-within {
  background: rgba(255,255,255,0.1);
  border-color: var(--color-border-hover);
  width: 280px;
}
.search-bar svg { color: var(--color-rose); flex-shrink: 0; }
.search-bar input {
  background: none;
  border: none;
  outline: none;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 13px;
  width: 100%;
}
.search-bar input::placeholder { color: var(--color-text-muted); }

.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0; right: 0;
  background: #3d1a3a;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 16px 40px rgba(0,0,0,0.4);
}
.search-dropdown.hidden { display: none; }
.search-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  transition: var(--transition-fast);
  border-bottom: 1px solid var(--color-border);
}
.search-item:last-child { border-bottom: none; }
.search-item:hover { background: var(--color-surface); }
.search-item__thumb { width: 30px; height: 40px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.search-item__title { font-family: var(--font-display); font-size: 14px; color: var(--color-text); }
.search-item__meta { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; }
.search-empty { padding: 16px; text-align: center; color: var(--color-text-muted); font-size: 13px; }

.view-toggle {
  display: flex;
  background: var(--color-glass);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
}
.toggle-btn {
  padding: 9px 14px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
}
.toggle-btn.active { background: rgba(201,123,138,0.25); color: var(--color-rose); }
.toggle-btn:hover:not(.active) { color: var(--color-text); }

.add-btn {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: rgba(201,123,138,0.2);
  border: 1px solid var(--color-border);
  color: var(--color-rose);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
}
.add-btn:hover { background: rgba(201,123,138,0.35); }

.avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-rose), var(--color-plum));
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 500;
  border: 2px solid rgba(201,123,138,0.4);
  cursor: pointer;
  flex-shrink: 0;
  transition: var(--transition-fast);
}
.avatar:hover { transform: scale(1.05); }

/* ── Hero Stats ── */
.hero-section { margin-bottom: 48px; animation: fadeUp 0.7s ease both; }

.milestone-banner {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(201,123,138,0.2), rgba(122,171,142,0.15));
  border: 1px solid rgba(201,123,138,0.3);
  border-radius: 30px;
  padding: 8px 20px;
  margin-bottom: 28px;
  font-size: 13px;
  color: var(--color-text);
  letter-spacing: 0.02em;
}
.milestone-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--color-neon-rose);
  box-shadow: 0 0 8px var(--color-neon-rose);
  animation: pulse 2s infinite;
  flex-shrink: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1.6fr;
  gap: 16px;
  align-items: stretch;
}

.stat-card {
  padding: 28px 24px;
  position: relative;
  overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 120px; height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201,123,138,0.12), transparent 70%);
  pointer-events: none;
}
.stat-card:hover { transform: translateY(-4px); }
.stat-label {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 10px;
}
.stat-number {
  font-family: var(--font-display);
  font-size: 58px;
  font-weight: 300;
  line-height: 1;
  color: var(--color-text);
  letter-spacing: -0.02em;
  display: inline-block;
}
.stat-number--shimmer {
  background: var(--gradient-shimmer);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
}
.stat-unit { font-size: 14px; color: var(--color-text-muted); margin-top: 4px; }

.quote-card {
  background: linear-gradient(135deg, rgba(74,25,66,0.6), rgba(45,15,42,0.8));
  border: 1px solid rgba(201,123,138,0.2);
  border-radius: 20px;
  padding: 28px 32px;
  display: flex; flex-direction: column; justify-content: center;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}
.quote-card::after {
  content: '✦';
  position: absolute;
  bottom: 16px; right: 24px;
  font-size: 48px;
  color: rgba(201,123,138,0.1);
}
.quote-emoji { font-size: 28px; margin-bottom: 12px; }
.quote-text {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 400;
  font-style: italic;
  line-height: 1.4;
  color: var(--color-text);
  margin-bottom: 12px;
}
.quote-sub { font-size: 12px; color: var(--color-rose); letter-spacing: 0.15em; text-transform: uppercase; }

/* ── Filters ── */
.filters-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  animation: fadeUp 0.7s 0.1s ease both;
}
.filter-chip {
  padding: 7px 16px;
  border-radius: 30px;
  border: 1px solid var(--color-border);
  background: rgba(255,255,255,0.04);
  color: var(--color-text-muted);
  font-size: 12px;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: var(--transition-fast);
  font-family: var(--font-body);
}
.filter-chip:hover { border-color: rgba(201,123,138,0.4); color: var(--color-text); background: var(--color-accentGlow); }
.filter-chip.active { background: rgba(201,123,138,0.2); border-color: var(--color-rose); color: var(--color-text); }
.filter-chip.status-watching { border-color: rgba(122,171,142,0.5); color: var(--color-jade); }
.filter-chip.status-completed { border-color: rgba(212,165,116,0.5); color: var(--color-gold); }
.filter-chip.status-plan { border-color: rgba(232,196,184,0.3); }
.filter-chip.status-dropped { border-color: rgba(255,107,138,0.4); color: rgba(255,107,138,0.8); }
.filter-divider { width: 1px; height: 20px; background: var(--color-border); margin: 0 4px; flex-shrink: 0; }

/* ── Section ── */
.section { margin-bottom: 44px; animation: fadeUp 0.7s 0.2s ease both; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.see-all {
  font-size: 12px;
  color: var(--color-rose);
  cursor: pointer;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.8;
  transition: opacity 0.2s;
  background: none;
  border: none;
  font-family: var(--font-body);
}
.see-all:hover { opacity: 1; }

/* ── Drama Cards ── */
.watching-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

.watching-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  transition: var(--transition-normal);
  cursor: pointer;
  backdrop-filter: blur(8px);
}
.watching-card:hover {
  transform: translateY(-6px);
  border-color: rgba(201,123,138,0.35);
  box-shadow: var(--shadow-card);
}
.card-cover { position: relative; aspect-ratio: 2/3; overflow: hidden; }
.card-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
.watching-card:hover .card-cover img { transform: scale(1.04); }
.card-cover-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(45,15,42,0.95) 0%, transparent 55%);
}
.card-badges { position: absolute; top: 10px; left: 10px; right: 10px; display: flex; gap: 5px; flex-wrap: wrap; }
.card-watch-btn {
  position: absolute; bottom: 10px; right: 10px;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--color-rose);
  border: none;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transform: scale(0.7);
  transition: var(--transition-fast);
  cursor: pointer;
}
.watching-card:hover .card-watch-btn { opacity: 1; transform: scale(1); }
.card-info { padding: 14px 14px 16px; }
.card-title { font-family: var(--font-display); font-size: 16px; font-weight: 400; color: var(--color-text); margin-bottom: 6px; line-height: 1.3; }
.card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.card-year { font-size: 11px; color: var(--color-text-muted); }
.card-genre { font-size: 10px; padding: 2px 7px; border-radius: 20px; background: rgba(255,255,255,0.07); color: var(--color-text-muted); }
.card-stars { font-size: 11px; letter-spacing: 0.05em; }
.progress-wrap { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.progress-bar { flex: 1; height: 3px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--gradient-progress); border-radius: 3px; transition: width 0.5s ease; }
.progress-text { font-size: 10px; color: var(--color-text-muted); white-space: nowrap; }

/* ── Table view ── */
.drama-table-wrap { overflow-x: auto; }
.drama-table { width: 100%; border-collapse: collapse; }
.drama-table thead th {
  text-align: left;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  padding: 0 12px 12px;
  border-bottom: 1px solid var(--color-border);
}
.drama-table__row {
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: var(--transition-fast);
}
.drama-table__row:hover { background: var(--color-surface); }
.drama-table__row td { padding: 12px; vertical-align: middle; }
.table-drama-title { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-size: 15px; color: var(--color-text); }
.table-thumb { width: 28px; height: 38px; border-radius: 4px; object-fit: cover; flex-shrink: 0; }
.table-muted { font-size: 12px; color: var(--color-text-muted); }
.table-watch-btn { background: none; border: none; color: var(--color-rose); cursor: pointer; font-size: 14px; padding: 4px 8px; border-radius: 6px; transition: var(--transition-fast); }
.table-watch-btn:hover { background: var(--color-accentGlow); }

/* ── Activity ── */
.activity-list { display: flex; flex-direction: column; gap: 12px; }
.activity-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: var(--color-glass);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  transition: var(--transition-fast);
  cursor: pointer;
  backdrop-filter: blur(8px);
}
.activity-item:hover { background: rgba(255,255,255,0.09); border-color: var(--color-border-hover); transform: translateX(4px); }
.activity-thumb { width: 44px; height: 60px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.activity-info { flex: 1; min-width: 0; }
.activity-title { font-family: var(--font-display); font-size: 16px; font-weight: 400; color: var(--color-text); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.activity-detail { font-size: 12px; color: var(--color-text-muted); display: flex; gap: 8px; align-items: center; }
.activity-time { font-size: 11px; color: var(--color-text-muted); white-space: nowrap; flex-shrink: 0; }

/* ── Two col ── */
.two-col { display: grid; grid-template-columns: 1fr 380px; gap: 28px; animation: fadeUp 0.7s 0.3s ease both; }

/* ── Sidebar ── */
.sidebar-card {
  border-radius: 18px;
  padding: 22px;
  margin-bottom: 16px;
}
.sidebar-title { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 16px; }
.country-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.country-name { font-size: 13px; color: var(--color-text); width: 70px; flex-shrink: 0; }
.country-track { flex: 1; height: 4px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
.country-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }
.fill-korea { background: var(--gradient-korea, linear-gradient(90deg, #c97b8a, #ff6b8a)); }
.fill-china { background: var(--gradient-china, linear-gradient(90deg, #7aab8e, #a8d8be)); }
.fill-japan { background: var(--gradient-japan, linear-gradient(90deg, #d4a574, #e8c87a)); }
.country-count { font-size: 12px; color: var(--color-text-muted); width: 28px; text-align: right; }

.badges-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.badge-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 14px 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  text-align: center;
  transition: var(--transition-fast);
  cursor: pointer;
}
.badge-item:hover { border-color: rgba(201,123,138,0.3); background: rgba(201,123,138,0.08); }
.badge-item--locked { border-style: dashed; opacity: 0.4; }
.badge-icon { font-size: 26px; }
.badge-name { font-size: 10px; color: var(--color-text-muted); letter-spacing: 0.05em; line-height: 1.3; }

/* ── Empty & Loading ── */
.empty-state { text-align: center; padding: 60px 20px; color: var(--color-text-muted); }
.empty-state__icon { font-size: 48px; margin-bottom: 12px; }
.empty-state__text { font-family: var(--font-display); font-size: 18px; margin-bottom: 20px; }
.btn-add-empty {
  padding: 10px 24px;
  border-radius: 30px;
  border: 1px solid var(--color-rose);
  background: rgba(201,123,138,0.1);
  color: var(--color-rose);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
  transition: var(--transition-fast);
}
.btn-add-empty:hover { background: rgba(201,123,138,0.2); }

.loading-dots {
  padding: 40px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
  animation: pulse 1.5s infinite;
}

/* ── Responsive ── */
@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: 1fr 1fr 1fr; }
  .quote-card { grid-column: 1 / -1; }
  .watching-row { grid-template-columns: repeat(3, 1fr); }
  .two-col { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .watching-row { grid-template-columns: repeat(2, 1fr); }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .header { flex-wrap: wrap; padding: 20px 16px; }
  .search-bar { width: 180px !important; }
}
@media (max-width: 480px) {
  .watching-row { grid-template-columns: 1fr 1fr; }
  .stat-number { font-size: 40px; }
}
`;

// ─── Init ─────────────────────────────────────
function init() {
  injectStyles();

  const app = document.getElementById('app');
  if (!app) {
    console.error('[Hanbin] #app element not found');
    return;
  }

  initRouter(app);
}

init();
