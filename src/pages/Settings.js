/**
 * HANBIN — Settings Page
 *
 * Список сайтов для просмотра — персональный для каждого пользователя
 * (GET /api/v1/streaming-sites), тот же список, что и в дропдауне «Где смотреть» в AddDramaModal.
 *
 * Каждый сайт можно включить/выключить тогглом — выключенные сайты пропадают из дропдауна
 * «Где смотреть» при добавлении дорамы, но остаются здесь, чтобы их можно было включить обратно.
 * По умолчанию все сайты включены (и у новых пользователей, и у уже существующих).
 */

import { renderHeader } from '../components/Header.js';
import { loadStreamingSites } from '../components/AddDramaModal.js';
import { updateStreamingSite } from '../api/mock.js';
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
    display: flex; align-items: center; gap: 10px;
    padding: 14px 14px 14px 16px; border-radius: 14px;
    background: var(--color-surface); border: 1px solid var(--color-border);
    transition: var(--transition-fast), opacity 0.2s ease;
  }
  .settings-site-card:hover { border-color: rgba(201,123,138,0.35); }
  .settings-site-card--disabled { opacity: 0.5; }

  .settings-site-link {
    display: flex; align-items: center; gap: 12px;
    flex: 1; min-width: 0; text-decoration: none;
  }

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

  /* ── Тогл вкл/выкл ── */
  .hb-toggle { position: relative; display: inline-flex; flex-shrink: 0; cursor: pointer; }
  .hb-toggle input {
    position: absolute; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: pointer;
  }
  .hb-toggle-track {
    width: 38px; height: 22px; border-radius: 30px;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(232,196,184,0.2);
    display: inline-flex; align-items: center; padding: 2px;
    transition: background 0.2s ease, border-color 0.2s ease;
  }
  .hb-toggle-thumb {
    width: 16px; height: 16px; border-radius: 50%;
    background: rgba(245,230,211,0.55);
    transition: transform 0.2s ease, background 0.2s ease;
  }
  .hb-toggle input:checked + .hb-toggle-track {
    background: rgba(122,171,142,0.35); border-color: rgba(122,171,142,0.5);
  }
  .hb-toggle input:checked + .hb-toggle-track .hb-toggle-thumb {
    transform: translateX(16px); background: var(--color-jade);
  }
  .hb-toggle input:disabled + .hb-toggle-track { opacity: 0.4; cursor: not-allowed; }
  .hb-toggle input:focus-visible + .hb-toggle-track { box-shadow: 0 0 0 3px rgba(201,123,138,0.25); }

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
  const enabled = site.enabled !== false;
  return `
    <div class="settings-site-card ${enabled ? '' : 'settings-site-card--disabled'}" data-site-id="${site.id}">
      <a class="settings-site-link" href="${site.url}" target="_blank" rel="noopener noreferrer">
        <img class="settings-site-favicon" src="https://www.google.com/s2/favicons?domain=${site.url}&sz=32" alt="${site.name}">
        <div class="settings-site-info">
          <div class="settings-site-name">${site.name}</div>
          <div class="settings-site-url">${site.url}</div>
        </div>
      </a>
      <label class="hb-toggle" data-tooltip="${enabled ? t('settings.sites.disable_tooltip') : t('settings.sites.enable_tooltip')}">
        <input type="checkbox" class="hb-toggle-input" data-site-id="${site.id}" ${enabled ? 'checked' : ''}>
        <span class="hb-toggle-track"><span class="hb-toggle-thumb"></span></span>
      </label>
    </div>
  `;
}

function buildSitesSection(sites) {
  const ruSites    = sites.filter(s => s.language === 'ru');
  const intlSites  = sites.filter(s => s.language !== 'ru');

  return `
    <section class="settings-section">
      <div class="settings-section__head">
        <div class="settings-section__title">${t('settings.sites.title')}</div>
      </div>

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

/**
 * Навешивает обработчики на тогглы вкл/выкл. Оптимистично красит карточку сразу же,
 * пишет на бэк (PATCH /streaming-sites/{id}), откатывает состояние, если запрос не удался.
 * Гостю (нет токена) переключение недоступно — бэка для него нет, менять просто нечего.
 */
function attachToggleHandlers(container, sites) {
  const isGuest = !localStorage.getItem('hanbin_token');

  container.querySelectorAll('.hb-toggle-input').forEach(input => {
    if (isGuest) {
      input.disabled = true;
      return;
    }

    input.addEventListener('change', async () => {
      const siteId = input.dataset.siteId;
      const nextEnabled = input.checked;
      const card = input.closest('.settings-site-card');

      input.disabled = true;
      card?.classList.toggle('settings-site-card--disabled', !nextEnabled);

      const { error } = await updateStreamingSite(siteId, { enabled: nextEnabled });

      input.disabled = false;

      if (error) {
        // Откатываем — не удалось сохранить
        input.checked = !nextEnabled;
        card?.classList.toggle('settings-site-card--disabled', !!nextEnabled);
        console.warn('[Settings] toggle streaming site failed:', error);
        return;
      }

      // Обновляем локальный кэш sites, чтобы состояние пережило смену языка/повторный рендер
      const site = sites.find(s => String(s.id) === String(siteId));
      if (site) site.enabled = nextEnabled;
    });
  });
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
        <div id="settings-sections">
          <div class="loading-dots">${t('loading')}</div>
        </div>
      </div>
    `;
  }

  container.innerHTML = buildShell();

  const headerSlot = container.querySelector('#header-slot');
  renderHeader(headerSlot, {});

  container.querySelector('#settings-back-btn')?.addEventListener('click', () => {
    history.back();
  });

  // Тянем персональный список с бэка (или дефолтный для гостя) — обычно мгновенно из-за кэша,
  // но при первом открытии показываем индикатор загрузки выше, чтобы не показать пустоту.
  let sites = await loadStreamingSites();

  // Страница могла уйти, пока шёл запрос
  if (!container.isConnected) return;

  const sectionsSlot = container.querySelector('#settings-sections');
  sectionsSlot.innerHTML = buildSitesSection(sites);
  attachToggleHandlers(sectionsSlot, sites);

  onLangChange(() => {
    if (!container.isConnected) return;
    container.innerHTML = buildShell();
    renderHeader(container.querySelector('#header-slot'), {});
    const slot = container.querySelector('#settings-sections');
    slot.innerHTML = buildSitesSection(sites);
    attachToggleHandlers(slot, sites);
    container.querySelector('#settings-back-btn')?.addEventListener('click', () => history.back());
  });
}
