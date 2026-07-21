/**
 * HANBIN — Settings Page
 *
 * Шаг 1: показываем список сайтов для просмотра — тот же STREAMING_SITES,
 * что используется в дропдауне «Где смотреть» в AddDramaModal.
 */

import { renderHeader } from '../components/Header.js';
import { STREAMING_SITES } from '../components/AddDramaModal.js';
import { t, onLangChange } from '../i18n/index.js';

const SETTINGS_CSS = `
  .settings-page { animation: fadeUp 0.5s ease both; }

  .settings-back {
    display: inline-flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer;
    color: rgba(245,230,211,0.45); font-family: var(--font-body);
    font-size: 12px; letter-spacing: 0.05em; padding: 0; margin-bottom: 22px;
    transition: var(--transition-fast);
  }
  .settings-back:hover { color: var(--color-rose); }

  .settings-header { margin-bottom: 36px; }
  .settings-header__title {
    font-family: var(--font-display); font-size: 34px; font-weight: 300;
    color: var(--color-text); margin-bottom: 6px; letter-spacing: -0.01em;
  }
  .settings-header__sub { font-size: 13px; color: var(--color-text-muted); }

  .settings-section { margin-bottom: 40px; }
  .settings-section__head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 6px; }
  .settings-section__title {
    font-family: var(--font-display); font-size: 20px; font-weight: 400;
    color: var(--color-text); display: flex; align-items: center; gap: 10px;
  }
  .settings-section__title::before {
    content: ''; display: block; width: 3px; height: 20px;
    background: var(--color-rose); border-radius: 2px;
  }
  .settings-section__count {
    font-size: 11px; color: var(--color-text-muted);
    letter-spacing: 0.08em; text-transform: uppercase; flex-shrink: 0;
  }
  .settings-section__sub { font-size: 13px; color: var(--color-text-muted); margin: 8px 0 20px; max-width: 560px; line-height: 1.5; }

  .settings-sites-group { margin-bottom: 22px; }
  .settings-sites-group:last-child { margin-bottom: 0; }
  .settings-sites-group__label {
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(245,230,211,0.3); margin-bottom: 12px;
    display: flex; align-items: center; gap: 10px;
  }
  .settings-sites-group__label::after { content: ''; flex: 1; height: 1px; background: var(--color-border); }

  .settings-sites-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;
  }

  .settings-site-card {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px; border-radius: 14px;
    background: var(--color-surface); border: 1px solid var(--color-border);
    transition: var(--transition-fast); text-decoration: none;
  }
  .settings-site-card:hover { border-color: rgba(201,123,138,0.35); transform: translateY(-2px); }

  .settings-site-favicon {
    width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
    background: rgba(255,255,255,0.08); object-fit: contain; padding: 4px;
  }

  .settings-site-info { flex: 1; min-width: 0; }
  .settings-site-name {
    font-family: var(--font-display); font-size: 15px; color: var(--color-text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .settings-site-url {
    font-size: 11px; color: var(--color-text-muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;
  }

  .settings-site-lang { font-size: 9px; padding: 3px 8px; border-radius: 20px; flex-shrink: 0; letter-spacing: 0.06em; text-transform: uppercase; }
  .settings-site-lang--ru    { background: rgba(122,171,142,0.2); color: var(--color-jade); border: 1px solid rgba(122,171,142,0.3); }
  .settings-site-lang--en    { background: rgba(212,165,116,0.2); color: var(--color-gold); border: 1px solid rgba(212,165,116,0.3); }
  .settings-site-lang--multi { background: rgba(201,123,138,0.18); color: var(--color-rose); border: 1px solid rgba(201,123,138,0.3); }

  @media (max-width: 640px) {
    .settings-sites-grid { grid-template-columns: 1fr; }
    .settings-header__title { font-size: 28px; }
  }
`;

function injectSettingsCSS() {
  if (document.getElementById('hb-settings-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-settings-css';
  style.textContent = SETTINGS_CSS;
  document.head.appendChild(style);
}

function siteCard(site) {
  const langLabel = site.language === 'ru' ? 'RU' : site.language === 'en' ? 'EN' : 'Multi';
  return `
    <a class="settings-site-card" href="${site.url}" target="_blank" rel="noopener noreferrer">
      <img class="settings-site-favicon" src="https://www.google.com/s2/favicons?domain=${site.url}&sz=32" alt="${site.name}">
      <div class="settings-site-info">
        <div class="settings-site-name">${site.name}</div>
        <div class="settings-site-url">${site.url}</div>
      </div>
      <span class="settings-site-lang settings-site-lang--${site.language}">${langLabel}</span>
    </a>
  `;
}

function buildSitesSection() {
  const ruSites    = STREAMING_SITES.filter(s => s.language === 'ru');
  const intlSites  = STREAMING_SITES.filter(s => s.language !== 'ru');

  return `
    <section class="settings-section">
      <div class="settings-section__head">
        <div class="settings-section__title">${t('settings.sites.title')}</div>
        <div class="settings-section__count">${t('settings.sites.count', { n: STREAMING_SITES.length })}</div>
      </div>
      <div class="settings-section__sub">${t('settings.sites.sub')}</div>

      <div class="settings-sites-group">
        <div class="settings-sites-group__label">${t('settings.sites.ru_label')}</div>
        <div class="settings-sites-grid">
          ${ruSites.map(siteCard).join('')}
        </div>
      </div>

      <div class="settings-sites-group">
        <div class="settings-sites-group__label">${t('settings.sites.intl_label')}</div>
        <div class="settings-sites-grid">
          ${intlSites.map(siteCard).join('')}
        </div>
      </div>
    </section>
  `;
}

export async function renderSettings(container) {
  injectSettingsCSS();

  function buildShell() {
    return `
      <div id="header-slot"></div>
      <div class="container settings-page">
        <button class="settings-back" id="settings-back-btn">${t('settings.back')}</button>
        <div class="settings-header">
          <div class="settings-header__title">${t('settings.title')}</div>
          <div class="settings-header__sub">${t('settings.sub')}</div>
        </div>
        <div id="settings-sections"></div>
      </div>
    `;
  }

  container.innerHTML = buildShell();

  const headerSlot = container.querySelector('#header-slot');
  renderHeader(headerSlot, {});

  container.querySelector('#settings-sections').innerHTML = buildSitesSection();

  container.querySelector('#settings-back-btn')?.addEventListener('click', () => {
    history.back();
  });

  onLangChange(() => {
    if (!container.isConnected) return;
    container.innerHTML = buildShell();
    renderHeader(container.querySelector('#header-slot'), {});
    container.querySelector('#settings-sections').innerHTML = buildSitesSection();
    container.querySelector('#settings-back-btn')?.addEventListener('click', () => history.back());
  });
}
