/**
 * HANBIN — Add Drama Modal Component
 *
 * Флоу:
 *  Фаза 1 «search»  — видны только название + сайт
 *  → оба заполнены → скрейп → 200: показываем детали + баннер «найдено»
 *                           → 404: показываем баннер «не найдено» + кнопка «заполнить вручную»
 *  Фаза 2 «details» — все поля видны, можно редактировать и сабмитить
 *  → выбор нового сайта в фазе «details» → возврат в фазу «search»
 */

import { closeModal, injectModalCSS } from './LoginModal.js';
import { addDrama, getDramas, invalidateUserCache, scrapeDrama, getStreamingSites } from '../api/mock.js';
import { API_BASE } from '../api/client.js';
import { debounce, VOICEOVER_OPTIONS } from '../utils/helpers.js';
import { t, onLangChange } from '../i18n/index.js';
import { DEFAULT_STREAMING_SITES } from '../data/streamingSites.js';
import { navigate } from '../router.js';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const LOGO_SVG = `
  <svg class="hb-modal-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <defs>
      <linearGradient id="hb-add-logo-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d1238"/>
        <stop offset="100%" stop-color="#2d0f2a"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="7" fill="url(#hb-add-logo-bg)"/>
    <rect x="4" y="6" width="2.5" height="20" rx="1" fill="#f5e6d3"/>
    <path d="M6.5 14 Q10 10 13.5 14 L13.5 26 L11 26 L11 15.5 Q10 13.5 6.5 15.5Z" fill="#f5e6d3"/>
    <rect x="17" y="6" width="2.5" height="20" rx="1" fill="#c97b8a" transform="skewX(-4)"/>
    <path d="M19.5 15.5 Q25 14 25 19 Q25 24.5 19.5 24.5 L19.5 22.5 Q23 22.5 23 19 Q23 16.5 19.5 17Z" fill="#c97b8a" transform="skewX(-4)"/>
  </svg>
`;

export let STREAMING_SITES = DEFAULT_STREAMING_SITES;

let sitesLoaded = false;
let sitesLoadingPromise = null;

/**
 * Загружает персональный список сайтов пользователя с бэка (или дефолтный для гостя)
 * и обновляет STREAMING_SITES. Раньше этот массив был захардкожен и одинаков для всех пользователей —
 * теперь он тянется с GET /api/v1/streaming-sites. Кэшируется на время жизни вкладки —
 * повторные открытия модалки/страницы настроек переиспользуют уже загруженный список, а не бьют по бэку заново.
 */
export async function loadStreamingSites({ forceRefresh = false } = {}) {
  if (sitesLoaded && !forceRefresh) return STREAMING_SITES;
  if (sitesLoadingPromise && !forceRefresh) return sitesLoadingPromise;

  sitesLoadingPromise = (async () => {
    const { data } = await getStreamingSites();
    STREAMING_SITES = (data && data.length) ? data : DEFAULT_STREAMING_SITES;
    sitesLoaded = true;
    sitesLoadingPromise = null;
    return STREAMING_SITES;
  })();

  return sitesLoadingPromise;
}

const GENRE_KEYS = [
  { key: 'modal.add.genres.romance',     value: 'Romance' },
  { key: 'modal.add.genres.thriller',    value: 'Thriller' },
  { key: 'modal.add.genres.historical',  value: 'Historical' },
  { key: 'modal.add.genres.fantasy',     value: 'Fantasy' },
  { key: 'modal.add.genres.comedy',      value: 'Comedy' },
  { key: 'modal.add.genres.drama',       value: 'Drama' },
  { key: 'modal.add.genres.action',      value: 'Action' },
  { key: 'modal.add.genres.mystery',     value: 'Mystery' },
  { key: 'modal.add.genres.horror',      value: 'Horror' },
  { key: 'modal.add.genres.documentary', value: 'Documentary' },
];

const COUNTRY_KEYS = [
  { code: 'kr',    key: 'modal.add.country.kr' },
  { code: 'cn',    key: 'modal.add.country.cn' },
  { code: 'jp',    key: 'modal.add.country.jp' },
  { code: 'other', key: 'modal.add.country.other' },
];

const COUNTRY_SCRAPE_MAP = {
  'Корея': 'kr', 'Korea': 'kr', 'South Korea': 'kr', 'Южная Корея': 'kr',
  'Китай': 'cn', 'China': 'cn', 'Китайская': 'cn',
  'Япония': 'jp', 'Japan': 'jp',
};

const GENRE_SCRAPE_MAP = {
  'romance': 'Romance',     'романтика': 'Romance',     'мелодрама': 'Romance',
  'thriller': 'Thriller',   'триллер': 'Thriller',
  'historical': 'Historical','исторические': 'Historical','исторический': 'Historical',
  'fantasy': 'Fantasy',     'фэнтези': 'Fantasy',
  'comedy': 'Comedy',       'комедия': 'Comedy',
  'drama': 'Drama',         'драма': 'Drama',
  'action': 'Action',       'боевик': 'Action',
  'mystery': 'Mystery',     'мистика': 'Mystery',       'детектив': 'Mystery',
  'horror': 'Horror',       'ужасы': 'Horror',
  'documentary': 'Documentary','документальный': 'Documentary',
};

// Фиксированный список озвучек импортируется из utils/helpers.js — общий с табличным видом.

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────

const ADD_DRAMA_CSS = `
  #hb-modal-box.hb-add-drama-box {
    width: 560px; max-height: 90vh; overflow: hidden;
    display: flex; flex-direction: column;
  }
  #hb-modal-box.hb-add-drama-box #hb-modal-content {
    padding: 36px 40px 32px; overflow-y: auto; flex: 1;
    scrollbar-width: thin; scrollbar-color: rgba(201,123,138,0.3) transparent;
  }
  #hb-modal-box.hb-add-drama-box #hb-modal-content::-webkit-scrollbar { width: 4px; }
  #hb-modal-box.hb-add-drama-box #hb-modal-content::-webkit-scrollbar-thumb {
    background: rgba(201,123,138,0.3); border-radius: 4px;
  }

  /* Блок деталей — скрыт/показан */
  .hb-details-block {
    transition: opacity 0.3s ease;
  }
  .hb-details-block.hb-hidden {
    display: none;
  }

  .hb-add-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  .hb-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 2px; }
  .hb-chip {
    padding: 6px 13px; border-radius: 30px;
    border: 1px solid rgba(232,196,184,0.2);
    background: rgba(255,255,255,0.04);
    color: rgba(245,230,211,0.55); font-size: 12px;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.2s ease; user-select: none;
  }
  .hb-chip:hover { border-color: rgba(201,123,138,0.4); color: #f5e6d3; background: rgba(201,123,138,0.08); }
  .hb-chip.hb-chip--active { background: rgba(201,123,138,0.2); border-color: rgba(201,123,138,0.6); color: #f5e6d3; }
  .hb-chip.hb-chip--country { font-size: 13px; }

  .hb-stars-wrap { display: flex; gap: 6px; margin-top: 4px; }
  .hb-star {
    font-size: 24px; cursor: pointer; color: rgba(212,165,116,0.25);
    transition: color 0.15s ease, transform 0.12s ease; line-height: 1; user-select: none;
  }
  .hb-star:hover, .hb-star.hb-star--active { color: #d4a574; }
  .hb-star:hover { transform: scale(1.15); }
  .hb-stars-hint { font-size: 11px; color: rgba(245,230,211,0.3); margin-top: 6px; font-style: italic; }

  .hb-status-badge {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 14px; border-radius: 30px;
    background: rgba(232,196,184,0.1); border: 1px solid rgba(232,196,184,0.25);
    color: #e8c4b8; font-size: 12px; font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.05em; margin-top: 4px;
  }
  .hb-status-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(232,196,184,0.6); }

  /* ── Баннеры ── */
  .hb-toast, .hb-scrape-banner, .hb-scrape-not-found, .hb-scrape-error {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 18px; border-radius: 14px; margin-bottom: 16px;
    animation: hb-slideUp 0.3s ease;
  }
  .hb-toast         { background: rgba(255,107,138,0.12); border: 1px solid rgba(255,107,138,0.35); }
  .hb-scrape-banner { background: rgba(122,171,142,0.12); border: 1px solid rgba(122,171,142,0.35); }
  .hb-scrape-not-found { background: rgba(212,165,116,0.1);  border: 1px solid rgba(212,165,116,0.3); }
  .hb-scrape-error  { background: rgba(255,107,138,0.08);  border: 1px solid rgba(255,107,138,0.28); }

  .hb-toast-icon, .hb-scrape-banner-icon,
  .hb-scrape-not-found-icon, .hb-scrape-error-icon {
    font-size: 18px; flex-shrink: 0; line-height: 1.2;
  }
  .hb-toast-body, .hb-scrape-banner-body,
  .hb-scrape-not-found-body, .hb-scrape-error-body { flex: 1; min-width: 0; }

  .hb-toast-title    { font-size: 13px; font-weight: 500; color: #ff6b8a; margin-bottom: 3px; }
  .hb-toast-text     { font-size: 12px; color: rgba(245,230,211,0.55); line-height: 1.4; }

  .hb-scrape-banner-title    { font-size: 13px; font-weight: 500; color: #7aab8e; margin-bottom: 2px; }
  .hb-scrape-banner-text     { font-size: 12px; color: rgba(245,230,211,0.45); line-height: 1.4; }

  .hb-scrape-not-found-title { font-size: 13px; font-weight: 500; color: #d4a574; margin-bottom: 4px; }
  .hb-scrape-not-found-text  { font-size: 12px; color: rgba(245,230,211,0.45); line-height: 1.4; margin-bottom: 10px; }

  .hb-scrape-error-title { font-size: 13px; font-weight: 500; color: rgba(255,107,138,0.9); margin-bottom: 2px; }
  .hb-scrape-error-text  { font-size: 12px; color: rgba(245,230,211,0.45); line-height: 1.4; }

  /* Кнопка «заполнить вручную» внутри баннера не-найдено */
  .hb-btn-manual {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 30px; cursor: pointer;
    border: 1px solid rgba(212,165,116,0.5);
    background: rgba(212,165,116,0.12); color: #d4a574;
    font-size: 12px; font-family: 'DM Sans', sans-serif;
    transition: all 0.2s ease; user-select: none;
  }
  .hb-btn-manual:hover { background: rgba(212,165,116,0.22); border-color: rgba(212,165,116,0.7); }

  /* Лоадер */
  .hb-scrape-loader {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 0 4px; font-size: 12px;
    color: rgba(245,230,211,0.4); font-style: italic;
  }
  @keyframes hb-spin { to { transform: rotate(360deg); } }
  .hb-scrape-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(201,123,138,0.2);
    border-top-color: rgba(201,123,138,0.7);
    border-radius: 50%; animation: hb-spin 0.7s linear infinite; flex-shrink: 0;
  }

  .hb-section-label {
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(245,230,211,0.3); margin: 20px 0 12px;
    display: flex; align-items: center; gap: 10px;
  }
  .hb-section-label::after { content: ''; flex: 1; height: 1px; background: rgba(232,196,184,0.08); }

  /* Дропдаун */
  .hb-site-dropdown { position: relative; }
  .hb-site-trigger {
    width: 100%; padding: 11px 16px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(232,196,184,0.18);
    border-radius: 12px; color: #f5e6d3; font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box; display: flex; align-items: center;
    justify-content: space-between; gap: 10px; user-select: none;
  }
  .hb-site-trigger:hover, .hb-site-trigger.hb-site-trigger--open {
    border-color: rgba(201,123,138,0.55); box-shadow: 0 0 0 3px rgba(201,123,138,0.08);
  }
  .hb-site-trigger-left { display: flex; align-items: center; gap: 9px; min-width: 0; flex: 1; }
  .hb-site-favicon { width: 16px; height: 16px; border-radius: 3px; flex-shrink: 0; object-fit: contain; background: rgba(255,255,255,0.08); }
  .hb-site-trigger-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
  .hb-site-trigger-label.hb-site-trigger--placeholder { color: rgba(245,230,211,0.22); }
  .hb-site-trigger-url { font-size: 11px; color: rgba(245,230,211,0.3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
  .hb-site-chevron { flex-shrink: 0; color: rgba(245,230,211,0.35); transition: transform 0.2s ease; }
  .hb-site-trigger--open .hb-site-chevron { transform: rotate(180deg); }

  .hb-site-list {
    position: fixed;
    background: linear-gradient(145deg, rgba(74,25,66,0.98), rgba(45,15,42,0.99));
    border: 1px solid rgba(201,123,138,0.25); border-radius: 14px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5); z-index: 10000;
    overflow: hidden; max-height: 240px; overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: rgba(201,123,138,0.3) transparent;
    animation: hb-slideUp 0.18s ease;
  }
  .hb-site-list::-webkit-scrollbar { width: 4px; }
  .hb-site-list::-webkit-scrollbar-thumb { background: rgba(201,123,138,0.3); border-radius: 4px; }

  .hb-site-option {
    display: flex; align-items: center; gap: 10px; padding: 11px 14px;
    cursor: pointer; transition: background 0.15s;
    border-bottom: 1px solid rgba(232,196,184,0.05);
  }
  .hb-site-option:last-child { border-bottom: none; }
  .hb-site-option:hover { background: rgba(201,123,138,0.1); }
  .hb-site-option--active { background: rgba(201,123,138,0.15); }
  .hb-site-option-info { flex: 1; min-width: 0; }
  .hb-site-option-name { font-size: 13px; color: #f5e6d3; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hb-site-option-url  { font-size: 11px; color: rgba(245,230,211,0.35); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }

  .hb-site-lang { font-size: 10px; padding: 2px 7px; border-radius: 20px; flex-shrink: 0; letter-spacing: 0.05em; text-transform: uppercase; }
  .hb-site-lang--ru    { background: rgba(122,171,142,0.2); color: #7aab8e; border: 1px solid rgba(122,171,142,0.3); }
  .hb-site-lang--en    { background: rgba(212,165,116,0.2); color: #d4a574; border: 1px solid rgba(212,165,116,0.3); }
  .hb-site-lang--multi { background: rgba(201,123,138,0.18); color: #c97b8a; border: 1px solid rgba(201,123,138,0.3); }

  .hb-site-divider {
    padding: 6px 14px 4px; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(245,230,211,0.25); background: rgba(0,0,0,0.15);
    border-bottom: 1px solid rgba(232,196,184,0.06);
  }

  .hb-field-select {
    width: 100%; padding: 13px 16px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(232,196,184,0.18);
    border-radius: 12px; color: #f5e6d3; font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(245,230,211,0.35)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
    padding-right: 36px; box-sizing: border-box;
  }
  .hb-field-select:focus { border-color: rgba(201,123,138,0.55); box-shadow: 0 0 0 3px rgba(201,123,138,0.08); }
  .hb-field-select option { background: #2d0f2a; color: #f5e6d3; }

  .hb-btn-add {
    background: linear-gradient(135deg, #7aab8e, #5d9478) !important;
    opacity: 1; transition: opacity 0.25s ease, transform 0.15s ease;
  }
  .hb-btn-add:not(:disabled):hover { opacity: 0.88 !important; transform: translateY(-1px); }
  .hb-btn-add:disabled { opacity: 0.35 !important; cursor: not-allowed !important; transform: none !important; }

  /* ── Постер + поле «где смотреть» бок о бок ── */
  .hb-add-top-row {
    display: flex; gap: 18px; align-items: flex-start;
    margin-bottom: 4px;
  }

  .hb-poster-col { width: 44%; flex-shrink: 0; transition: opacity 0.25s ease; }
  .hb-poster-col.hb-hidden { display: none; }

  .hb-poster-frame {
    position: relative; width: 100%;
    border-radius: 16px; overflow: hidden;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(232,196,184,0.15);
    animation: hb-slideUp 0.3s ease;
    transition: aspect-ratio 0.25s ease;
  }
  .hb-poster-frame__img {
    width: 100%; height: 100%; object-fit: contain; display: block;
    transition: opacity 0.35s ease;
  }
  .hb-poster-frame__img--loading { opacity: 0.5; }
  .hb-poster-frame__label {
    position: absolute; left: 0; right: 0; bottom: 0;
    padding: 18px 12px 10px; text-align: center;
    font-size: 11px; color: rgba(245,230,211,0.55);
    background: linear-gradient(to top, rgba(45,15,42,0.92), transparent);
  }
  .hb-poster-frame__label--missing { color: rgba(212,165,116,0.8); }

  .hb-form-col { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .hb-form-col .hb-field { margin-bottom: 0; }

  .hb-site-edit-hint {
    font-size: 11px; color: rgba(245,230,211,0.3); margin-top: 8px; line-height: 1.4;
  }
  .hb-site-edit-hint a { color: rgba(201,123,138,0.85); text-decoration: none; border-bottom: 1px dashed rgba(201,123,138,0.4); }
  .hb-site-edit-hint a:hover { color: var(--color-rose, #c97b8a); border-bottom-color: currentColor; }
`;

// ─────────────────────────────────────────────
// HTML
// ─────────────────────────────────────────────

function buildSiteDropdown(savedSiteUrl, savedSiteName) {
  const ruSites   = STREAMING_SITES.filter(s => s.language === 'ru' && s.enabled !== false);
  const intlSites = STREAMING_SITES.filter(s => s.language !== 'ru' && s.enabled !== false);

  const siteOptionHTML = (s, langLabel) => `
    <div class="hb-site-option ${savedSiteUrl === s.url ? 'hb-site-option--active' : ''}"
      role="option" data-url="${s.url}" data-name="${s.name}" data-lang="${s.language}">
      <img class="hb-site-favicon" src="https://www.google.com/s2/favicons?domain=${s.url}&sz=32" alt="${s.name}">
      <div class="hb-site-option-info">
        <div class="hb-site-option-name">${s.name}</div>
        <div class="hb-site-option-url">${s.url}</div>
      </div>
      <span class="hb-site-lang hb-site-lang--${s.language}">${langLabel}</span>
    </div>`;

  return `
    <div class="hb-site-dropdown" id="hb-site-dropdown">
      <div class="hb-site-trigger" id="hb-site-trigger" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox">
        <div class="hb-site-trigger-left">
          <img class="hb-site-favicon" id="hb-site-favicon"
            src="${savedSiteUrl ? `https://www.google.com/s2/favicons?domain=${savedSiteUrl}&sz=32` : ''}"
            alt="" style="display:${savedSiteUrl ? 'block' : 'none'}">
          <span class="hb-site-trigger-label ${savedSiteUrl ? '' : 'hb-site-trigger--placeholder'}" id="hb-site-trigger-label">
            ${savedSiteName ?? t('modal.add.field.where_ph')}
          </span>
        </div>
        <span class="hb-site-trigger-url" id="hb-site-trigger-url">${savedSiteUrl ?? ''}</span>
        <svg class="hb-site-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <div class="hb-site-list" id="hb-site-list" role="listbox" style="display:none">
        ${ruSites.length ? `<div class="hb-site-divider">${t('modal.add.sites.ru_label')}</div>${ruSites.map(s => siteOptionHTML(s, 'RU')).join('')}` : ''}
        ${intlSites.length ? `<div class="hb-site-divider">${t('modal.add.sites.intl_label')}</div>${intlSites.map(s => siteOptionHTML(s, s.language === 'en' ? 'EN' : 'Multi')).join('')}` : ''}
      </div>
    </div>
    <div class="hb-site-edit-hint">${t('modal.add.field.where_edit_hint')} <a href="#/settings" id="hb-goto-settings-link">${t('modal.add.field.where_edit_link')}</a></div>
  `;
}

function buildHTML(savedState = {}) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1989 }, (_, i) => {
    const y = currentYear + 1 - i;
    return `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`;
  }).join('');

  const {
    selectedGenres = [], selectedCountry = 'kr',
    releaseTag = 'released', subTag = 'translated',
    showDetails = false,
  } = savedState;

  return `
    ${LOGO_SVG}
    <div class="hb-modal-title">${t('modal.add.title')}</div>
    <div class="hb-modal-sub">${t('modal.add.sub')}</div>

    <!-- Дубликат -->
    <div id="hb-add-duplicate-toast" class="hb-toast" style="display:none">
      <div class="hb-toast-icon">🌸</div>
      <div class="hb-toast-body">
        <div class="hb-toast-title">${t('modal.add.duplicate.title')}</div>
        <div class="hb-toast-text" id="hb-add-duplicate-text">${t('modal.add.duplicate.text')}</div>
      </div>
    </div>

    <!-- ── ФАЗА 1: название + сайт ─────────────────────────────── -->

    <!-- Название -->
    <div class="hb-field">
      <div class="hb-field-label">
        <span>${t('modal.add.field.title')} <span class="hb-required">*</span></span>
        <span class="hb-counter" id="hb-add-title-counter">${(savedState.title ?? '').length} / 120</span>
      </div>
      <input class="hb-field-input" id="hb-add-title" type="text"
        placeholder="${t('modal.add.field.title_ph')}" maxlength="120" autocomplete="off"
        value="${savedState.title ?? ''}">
      <div class="hb-field-error" id="hb-add-title-error"></div>
    </div>

    <!-- Постер (слева, ~половина модалки) + поле «где смотреть» (справа) — бок о бок. Постер скрыт, пока нет ни названия, ни выбранного сайта -->
    <div class="hb-add-top-row">
      <div class="hb-poster-col ${(savedState.title && savedState.selectedSiteUrl) ? '' : 'hb-hidden'}" id="hb-poster-col">
        <div class="hb-poster-frame" id="hb-poster-frame" style="aspect-ratio: 2 / 3;">
          <img class="hb-poster-frame__img" id="hb-poster-img" src="" alt="">
          <div class="hb-poster-frame__label" id="hb-poster-source">Нет постера</div>
        </div>
      </div>
      <div class="hb-form-col">
        <div class="hb-field">
          <div class="hb-field-label"><span>${t('modal.add.field.where')}</span></div>
          ${buildSiteDropdown(savedState.selectedSiteUrl ?? null, savedState.selectedSiteName ?? null)}
          <div id="hb-scrape-loader" class="hb-scrape-loader" style="display:none">
            <div class="hb-scrape-spinner"></div>
            <span>Ищем информацию о дораме…</span>
          </div>
          <div class="hb-field-error" id="hb-add-url-error"></div>
        </div>
      </div>
    </div>

    <!-- Баннер «найдено» -->
    <div id="hb-scrape-banner" class="hb-scrape-banner" style="display:none">
      <div class="hb-scrape-banner-icon">✦</div>
      <div class="hb-scrape-banner-body">
        <div class="hb-scrape-banner-title">Данные найдены</div>
        <div class="hb-scrape-banner-text" id="hb-scrape-banner-text">Поля заполнены автоматически — проверь и при необходимости скорректируй.</div>
      </div>
    </div>

    <!-- Баннер «не найдено» — с кнопкой -->
    <div id="hb-scrape-not-found" class="hb-scrape-not-found" style="display:none">
      <div class="hb-scrape-not-found-icon">🔍</div>
      <div class="hb-scrape-not-found-body">
        <div class="hb-scrape-not-found-title">Дорама не найдена на этом сайте</div>
        <div class="hb-scrape-not-found-text" id="hb-scrape-not-found-text">Попробуй выбрать другой сайт или заполни данные вручную.</div>
        <div class="hb-btn-manual" id="hb-btn-fill-manual">
          ✎ Заполнить вручную
        </div>
      </div>
    </div>

    <!-- Баннер «ошибка» -->
    <div id="hb-scrape-error" class="hb-scrape-error" style="display:none">
      <div class="hb-scrape-error-icon">⚠️</div>
      <div class="hb-scrape-error-body">
        <div class="hb-scrape-error-title">Не удалось получить данные</div>
        <div class="hb-scrape-error-text" id="hb-scrape-error-text">Не удалось получить данные с сайта. Заполни поля вручную.</div>
      </div>
    </div>

    <!-- ── ФАЗА 2: детали (скрыты до скрейпа или ручного заполнения) ── -->
    <div id="hb-details-block" class="hb-details-block ${showDetails ? '' : 'hb-hidden'}">

      <div class="hb-section-label">${t('modal.add.section.details')}</div>

      <div class="hb-add-row">
        <div class="hb-field" style="margin-bottom:0">
          <div class="hb-field-label"><span>${t('modal.add.field.year')}</span></div>
          <select class="hb-field-select" id="hb-add-year">${yearOptions}</select>
        </div>
        <div class="hb-field" style="margin-bottom:0">
          <div class="hb-field-label"><span>${t('modal.add.field.country')}</span></div>
          <div class="hb-chips" id="hb-add-country-chips">
            ${COUNTRY_KEYS.map(c => `
              <div class="hb-chip hb-chip--country ${c.code === selectedCountry ? 'hb-chip--active' : ''}" data-value="${c.code}">${t(c.key)}</div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="hb-field" style="margin-top:16px">
        <div class="hb-field-label"><span>${t('modal.add.field.genre')}</span></div>
        <div class="hb-chips" id="hb-add-genre-chips">
          ${GENRE_KEYS.map(g => `
            <div class="hb-chip ${selectedGenres.includes(g.value) ? 'hb-chip--active' : ''}" data-value="${g.value}">${t(g.key)}</div>
          `).join('')}
        </div>
      </div>

      <div class="hb-field" style="margin-top:16px">
        <div class="hb-field-label"><span>${t('modal.add.field.voiceover')}</span></div>
        <select class="hb-field-select" id="hb-add-voiceover">
          <option value="" ${!savedState.voiceover ? 'selected' : ''}>${t('modal.add.field.voiceover_ph')}</option>
          ${VOICEOVER_OPTIONS.map(v => `<option value="${v}" ${savedState.voiceover === v ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </div>

      <div class="hb-section-label">${t('modal.add.section.tags')}</div>

      <div class="hb-add-row" style="margin-bottom:14px">
        <div>
          <div class="hb-field-label" style="margin-bottom:8px">${t('modal.add.tag.release')}</div>
          <div class="hb-chips" id="hb-add-release-chips">
            <div class="hb-chip ${releaseTag === 'released' ? 'hb-chip--active' : ''}" data-value="released">${t('modal.add.tag.released')}</div>
            <div class="hb-chip ${releaseTag === 'ongoing'  ? 'hb-chip--active' : ''}" data-value="ongoing">${t('modal.add.tag.ongoing')}</div>
          </div>
        </div>
        <div>
          <div class="hb-field-label" style="margin-bottom:8px">${t('modal.add.tag.translation')}</div>
          <div class="hb-chips" id="hb-add-sub-chips">
            <div class="hb-chip ${subTag === 'translated'  ? 'hb-chip--active' : ''}" data-value="translated">${t('modal.add.tag.translated')}</div>
            <div class="hb-chip ${subTag === 'translating' ? 'hb-chip--active' : ''}" data-value="translating">${t('modal.add.tag.translating')}</div>
          </div>
        </div>
      </div>

      <div class="hb-field">
        <div class="hb-field-label"><span>${t('modal.add.status.label')}</span></div>
        <div class="hb-status-badge">
          <div class="hb-status-dot"></div>
          ${t('modal.add.status.value')}
        </div>
        <div style="font-size:11px;color:rgba(245,230,211,0.28);margin-top:6px;font-style:italic">
          ${t('modal.add.status.hint')}
        </div>
      </div>

      <div class="hb-section-label">${t('modal.add.section.rating')}</div>

      <div class="hb-field">
        <div class="hb-field-label">
          <span>${t('modal.add.section.rating')}
            <span style="color:rgba(245,230,211,0.3);font-size:10px;letter-spacing:0">(${t('modal.add.rating.optional')})</span>
          </span>
        </div>
        <div class="hb-stars-wrap" id="hb-add-stars">
          ${[1,2,3,4,5].map(v => `
            <span class="hb-star ${(savedState.selectedRating ?? 0) >= v ? 'hb-star--active' : ''}" data-value="${v}">★</span>
          `).join('')}
        </div>
        <div class="hb-stars-hint" id="hb-add-stars-hint">
          ${savedState.selectedRating ? t(`modal.add.rating.${savedState.selectedRating}`) : t('modal.add.rating.hint')}
        </div>
      </div>

      <div class="hb-field-error" id="hb-add-global-error" style="text-align:center;margin-bottom:4px"></div>

      <button class="hb-btn-primary hb-btn-add" id="hb-btn-add-submit" disabled>
        ${t('modal.add.btn')}
      </button>
    </div>
  `;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const ratingHint = (val) => val ? t(`modal.add.rating.${val}`) : t('modal.add.rating.hint');

function hideBanners() {
  ['hb-scrape-banner', 'hb-scrape-not-found', 'hb-scrape-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function showBannerFound(scraped, originalTitle) {
  hideBanners();
  const banner = document.getElementById('hb-scrape-banner');
  if (!banner) return;

  const parts = [];
  if (scraped.release_year)   parts.push(`${scraped.release_year} г.`);
  if (scraped.country)        parts.push(scraped.country);
  if (scraped.genres?.length) parts.push(scraped.genres.slice(0, 2).join(', '));

  // Если название изменилось — упоминаем об этом
  const titleChanged = scraped.title &&
    originalTitle &&
    scraped.title.trim().toLowerCase() !== originalTitle.trim().toLowerCase();

  let text = parts.length
    ? `Нашли: ${parts.join(' · ')}.`
    : 'Поля заполнены автоматически.';

  if (titleChanged) {
    text += ` Название обновлено на «${scraped.title}».`;
  }

  text += ' Проверь и при необходимости скорректируй.';

  document.getElementById('hb-scrape-banner-text').textContent = text;
  banner.style.display = 'flex';
}

function showBannerNotFound(siteName) {
  hideBanners();
  const banner = document.getElementById('hb-scrape-not-found');
  if (!banner) return;
  document.getElementById('hb-scrape-not-found-text').textContent =
    `«${siteName}» не знает эту дораму. Попробуй выбрать другой сайт или заполни данные вручную.`;
  banner.style.display = 'flex';
}

function showBannerError(msg) {
  hideBanners();
  const banner = document.getElementById('hb-scrape-error');
  if (!banner) return;
  document.getElementById('hb-scrape-error-text').textContent =
    msg || 'Не удалось получить данные с сайта. Заполни поля вручную.';
  banner.style.display = 'flex';
}

// ── Постер ─────────────────────────────────────────────────────────────────

const POSTER_PROXY = (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

// Строит URL для загрузки картинки через бэкенд вместо напрямого запроса в чужой CDN.
// Многие сайты-источники защищают картинки hotlink-защитой (проверяют Referer) —
// прямой <img src> из браузера на localhost получит 403, хотя тот же URL открывается с самого сайта.
// Бэкенд уже умеет ходить на эти сайты (спуфит заголовки для HTML-скрейпа),
// поэтому картинку тоже тянем через него — см. GET /dramas/poster-proxy.
function posterProxyURL(imgUrl) {
  return `${API_BASE}/dramas/poster-proxy?url=${encodeURIComponent(imgUrl)}`;
}

// Генеративный SVG-плейсхолдер: инициал названия на градиентном фоне
function defaultPosterURI(title = '') {
  const label = t('poster.no_poster');
  const initial = (title || '?').trim().charAt(0).toUpperCase() || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="96" viewBox="0 0 64 96">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="#4a1942"/><stop offset="100%" stop-color="#2d0f2a"/>` +
    `</linearGradient></defs>` +
    `<rect width="64" height="96" rx="8" fill="url(#g)"/>` +
    `<text x="32" y="50" font-family="Georgia, serif" font-size="26" fill="rgba(245,230,211,0.4)" text-anchor="middle">${initial}</text>` +
    `<text x="32" y="80" font-family="sans-serif" font-size="6.5" letter-spacing="0.5" fill="rgba(245,230,211,0.3)" text-anchor="middle">${label}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Устанавливает соотношение сторон рамки под реальные размеры картинки: горизонтальный
// og:image-баннер больше не втискивается в портретный бокс 2:3 с безжалостной обрезкой/сжатием.
function setPosterAspectRatio(width, height) {
  const frame = document.getElementById('hb-poster-frame');
  if (!frame || !width || !height) return;
  frame.style.aspectRatio = `${width} / ${height}`;
}

function resetPosterAspectRatio() {
  const frame = document.getElementById('hb-poster-frame');
  if (frame) frame.style.aspectRatio = '2 / 3';
}

// Обновляет плейсхолдер постера (пока нет реального изображения — например, при вводе названия)
function updatePosterPlaceholder(title) {
  const img = document.getElementById('hb-poster-img');
  const sourceEl = document.getElementById('hb-poster-source');
  if (!img) return;
  resetPosterAspectRatio(); // плейсхолдер всегда портретный
  img.src = defaultPosterURI(title);
  img.classList.remove('hb-poster-frame__img--loading');
  if (sourceEl) {
    sourceEl.textContent = t('poster.no_poster');
    sourceEl.classList.remove('hb-poster-frame__label--missing');
  }
}

// Показывает/скрывает колонку с постером целиком — она скрыта, пока нет ни названия, ни выбранного сайта
function togglePosterColumn(show) {
  const col = document.getElementById('hb-poster-col');
  if (col) col.classList.toggle('hb-hidden', !show);
}

// Ставит плейсхолдер в состояние «загружаем» сразу после успешного скрейпа
function showPosterPreview(title, siteName) {
  const img  = document.getElementById('hb-poster-img');
  const sourceEl = document.getElementById('hb-poster-source');
  if (!img) return;

  resetPosterAspectRatio(); // до прихода реального изображения показываем портретный плейсхолдер
  img.src = defaultPosterURI(title);
  img.classList.add('hb-poster-frame__img--loading');
  if (sourceEl) {
    sourceEl.textContent = 'Подгружаем…';
    sourceEl.classList.remove('hb-poster-frame__label--missing');
  }
}

// Сбрасывает постер обратно к плейсхолдеру (например, при смене сайта или сбросе деталей)
function hidePosterPreview() {
  const titleInput = document.getElementById('hb-add-title');
  updatePosterPlaceholder(titleInput?.value.trim() ?? '');
}

// Тянет og:image со страницы источника через CORS-прокси и подменяет плейсхолдер.
// Fallback-путь на случай, если бэкенд не смог вытащить poster_url сам — в большинстве случаев
// этот путь больше не нужен, т.к. бэкенд сам вытаскивает картинку из og:image при скрейпе.
async function fetchPoster(pageUrl, siteName, isStale = () => false) {
  const img = document.getElementById('hb-poster-img');
  const sourceEl = document.getElementById('hb-poster-source');
  if (!img || !pageUrl) {
    if (!isStale() && sourceEl) {
      sourceEl.textContent = t('poster.no_poster');
      sourceEl.classList.add('hb-poster-frame__label--missing');
    }
    return false;
  }

  try {
    const res = await fetch(POSTER_PROXY(pageUrl), { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const html = json.contents || '';

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const ogImage = doc.querySelector('meta[property="og:image"]')?.content
      || doc.querySelector('meta[name="twitter:image"]')?.content
      || doc.querySelector('.film-poster img, .poster img, .short-poster img')?.src
      || null;

    if (!ogImage) throw new Error('no image found');

    // Плавно подменяем плейсхолдер на реальный постер — тоже через бэкенд-прокси (hotlink-защита сайтов)
    await new Promise((resolve, reject) => {
      const real = new Image();
      real.onload = () => {
        // Пока шёл этот fallback-запрос пользователь мог запустить новый скрейп —
        // если он устарел, не трогаем DOM, чтобы не перетереть более свежее состояние.
        if (isStale()) { resolve(); return; }
        setPosterAspectRatio(real.naturalWidth, real.naturalHeight);
        img.src = posterProxyURL(ogImage);
        img.classList.remove('hb-poster-frame__img--loading');
        if (sourceEl) {
          sourceEl.textContent = siteName || 'Найдено';
          sourceEl.classList.remove('hb-poster-frame__label--missing');
        }
        resolve();
      };
      real.onerror = () => reject(new Error('image failed to load'));
      real.src = posterProxyURL(ogImage);
    });
    return true;
  } catch (err) {
    console.warn('[AddDramaModal] fetchPoster failed:', err.message);
    if (!isStale()) {
      img.classList.remove('hb-poster-frame__img--loading');
      if (sourceEl) {
        sourceEl.textContent = t('poster.no_poster');
        sourceEl.classList.add('hb-poster-frame__label--missing');
      }
    }
    return false;
  }
}

function applyScrapeData(scraped, { setCountry, setGenres, setReleaseTag, setSubTag, syncSubmit }) {
  // ── Название ──────────────────────────────────────────────────────────────
  // Если сай႐ вернул другое название — обновляем поле
  if (scraped.title) {
    const titleInput = document.getElementById('hb-add-title');
    const titleCounter = document.getElementById('hb-add-title-counter');
    if (titleInput) {
      titleInput.value = scraped.title.slice(0, 120);
      if (titleCounter) titleCounter.textContent = `${titleInput.value.length} / 120`;
    }
  }

  // ── Год ──────────────────────────────────────────────────────────────
  if (scraped.release_year) {
    const yearSelect = document.getElementById('hb-add-year');
    if (yearSelect) yearSelect.value = String(scraped.release_year);
  }
  if (scraped.country) {
    const code = COUNTRY_SCRAPE_MAP[scraped.country.trim()] ?? null;
    if (code) {
      document.querySelectorAll('#hb-add-country-chips .hb-chip').forEach(c =>
        c.classList.toggle('hb-chip--active', c.dataset.value === code));
      setCountry(code);
    }
  }
  if (scraped.genres?.length) {
    const mapped = scraped.genres.map(g => GENRE_SCRAPE_MAP[g.toLowerCase().trim()]).filter(Boolean);
    if (mapped.length) {
      document.querySelectorAll('#hb-add-genre-chips .hb-chip').forEach(c =>
        c.classList.toggle('hb-chip--active', mapped.includes(c.dataset.value)));
      setGenres(mapped);
    }
  }
  if (scraped.release_tag === 'ongoing' || scraped.release_tag === 'released') {
    document.querySelectorAll('#hb-add-release-chips .hb-chip').forEach(c =>
      c.classList.toggle('hb-chip--active', c.dataset.value === scraped.release_tag));
    setReleaseTag(scraped.release_tag);
  }
  if (scraped.translation_tag === 'translated' || scraped.translation_tag === 'translating') {
    document.querySelectorAll('#hb-add-sub-chips .hb-chip').forEach(c =>
      c.classList.toggle('hb-chip--active', c.dataset.value === scraped.translation_tag));
    setSubTag(scraped.translation_tag);
  }
  if (scraped.voiceover) {
    const voiceoverSelect = document.getElementById('hb-add-voiceover');
    if (voiceoverSelect) {
      // Селект — фиксированный список, произвольный текст со скрейпа в него не подставить —
      // выбираем совпадение по имени, если есть; иначе оставляем текущий выбор как есть.
      const match = VOICEOVER_OPTIONS.find(v => v.toLowerCase() === scraped.voiceover.trim().toLowerCase());
      if (match) voiceoverSelect.value = match;
    }
  }
  syncSubmit();
}

// ─────────────────────────────────────────────
// MAIN LOGIC
// ─────────────────────────────────────────────

function injectAddDramaCSS() {
  if (document.getElementById('hb-add-drama-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-add-drama-css';
  style.textContent = ADD_DRAMA_CSS;
  document.head.appendChild(style);
}

export function mountAddDramaContent(content, savedState = {}) {
  content.innerHTML = buildHTML(savedState);

  // ── Состояние ────────────────────────────────────────────────────────────
  let selectedRating   = savedState.selectedRating  ?? null;
  let selectedCountry  = savedState.selectedCountry ?? 'kr';
  let selectedGenres   = savedState.selectedGenres  ? [...savedState.selectedGenres] : [];
  let releaseTag       = savedState.releaseTag      ?? 'released';
  let subTag           = savedState.subTag          ?? 'translated';
  let selectedSiteUrl  = savedState.selectedSiteUrl  ?? null;
  let selectedSiteName = savedState.selectedSiteName ?? null;
  let showDetails      = savedState.showDetails     ?? false;
  let lastScraped      = null; // последний успешный результат скрейпера
  let hasRealPoster    = false; // true, когда в hb-poster-img загружено реальное изображение, а не плейсхолдер
  // Увеличивается на каждый новый вызов scrapeDrama() — позволяет игнорировать устаревшие ответы,
  // если пока ожидали ответ пользователь успел поменять сайт/название и запустил новый скрейп.
  // Раньше этого не было — два параллельных запроса могли завершиться в любом порядке,
  // и более старый/медленный ответ мог перетереть данные от более нового запроса —
  // именно так при вводе одной дорамы и переключении между сайтами могла вылезть совершенно другая дорама.
  let scrapeToken      = 0;

  // Плейсхолдер постера виден сразу, ещё до любого скрейпа — но сама колонка скрыта, пока не заполнено и название, и сайт (только тогда запускается скрейп)
  updatePosterPlaceholder(savedState.title ?? '');
  togglePosterColumn(!!(savedState.title && selectedSiteUrl));

  // ── Фаза деталей ─────────────────────────────────────────────────────────
  function openDetails() {
    showDetails = true;
    const block = document.getElementById('hb-details-block');
    if (block) block.classList.remove('hb-hidden');
    syncSubmit();
    persistState();
  }

  function closeDetails() {
    showDetails = false;
    const block = document.getElementById('hb-details-block');
    if (block) block.classList.add('hb-hidden');
    hideBanners();
    hasRealPoster = false;
    hidePosterPreview();
    // Сбрасываем поля деталей к дефолту
    selectedGenres = [];
    selectedCountry = 'kr';
    releaseTag = 'released';
    subTag = 'translated';
    selectedRating = null;
    lastScraped = null;
    const voiceoverInput = document.getElementById('hb-add-voiceover');
    if (voiceoverInput) voiceoverInput.value = '';
    persistState();
  }

  // ── syncSubmit ───────────────────────────────────────────────────────────
  function syncSubmit() {
    const title  = document.getElementById('hb-add-title')?.value.trim() ?? '';
    const hasUrl = !!selectedSiteUrl;
    const hasGenre = selectedGenres.length > 0;
    const btn = document.getElementById('hb-btn-add-submit');
    if (btn) btn.disabled = !(title.length > 0 && hasUrl && hasGenre);
  }

  // ── Название ─────────────────────────────────────────────────────────────
  const titleInput   = document.getElementById('hb-add-title');
  const titleCounter = document.getElementById('hb-add-title-counter');

  // Повторный скрейп при изменении названия, если сайт уже выбран — иначе после смены названия
  // данные (год, страна, жанры и т.д.) оставались от прежней дорамы. debounce, чтобы не дергать
  // запрос на каждое нажатие клавиши; токен в runScrape() гасит устаревшие ответы, если пока ждали
  // пользователь успел переключиться на другой сайт или снова поменять название.
  const debouncedTitleRescrape = debounce(() => {
    const currentTitle = titleInput.value.trim();
    if (currentTitle && selectedSiteUrl) {
      runScrape(currentTitle, selectedSiteUrl, selectedSiteName);
    }
  }, 600);

  titleInput.addEventListener('input', () => {
    titleCounter.textContent = `${titleInput.value.length} / 120`;
    titleCounter.classList.toggle('warn', titleInput.value.length > 105);
    titleInput.classList.remove('hb-error');
    document.getElementById('hb-add-title-error').textContent = '';
    document.getElementById('hb-add-duplicate-toast').style.display = 'none';
    if (!hasRealPoster) updatePosterPlaceholder(titleInput.value.trim());
    togglePosterColumn(!!(titleInput.value.trim() && selectedSiteUrl));
    syncSubmit();
    debouncedTitleRescrape();
  });

  // ── Дропдаун сайтов ──────────────────────────────────────────────────────
  const trigger    = document.getElementById('hb-site-trigger');
  const list       = document.getElementById('hb-site-list');
  const trigLabel  = document.getElementById('hb-site-trigger-label');
  const trigUrl    = document.getElementById('hb-site-trigger-url');
  const trigFavico = document.getElementById('hb-site-favicon');
  const loader     = document.getElementById('hb-scrape-loader');

  function openSiteList() {
    // Фиксированный расчёт координат ОДИН раз, в момент открытия — без пересчёта при скролле и без флипа вверх/вниз.
    // position:fixed нужен, чтобы список не обрезался внутренним скроллом #hb-modal-content.
    // Ширина и левый край — по всей строке (постер + поле), а не только по тригеру —
    // открытый список ложится поверх постера, как и просили.
    const rect = trigger.getBoundingClientRect();
    const rowEl = document.querySelector('.hb-add-top-row');
    const rowRect = rowEl ? rowEl.getBoundingClientRect() : rect;

    list.style.left   = rowRect.left + 'px';
    list.style.width  = rowRect.width + 'px';
    list.style.top    = (rect.bottom + 6) + 'px';
    list.style.bottom = '';
    list.style.maxHeight = '240px';

    list.style.display = 'block';
    trigger.setAttribute('aria-expanded', 'true');
    trigger.classList.add('hb-site-trigger--open');
  }
  function closeSiteList() {
    list.style.display = 'none';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.classList.remove('hb-site-trigger--open');
  }

  // Если пользователь скроллит контент модалки пока список открыт — просто закрываем его,
  // вместо того чтобы пересчитывать позицию и «таскать» его за триггером.
  document.getElementById('hb-modal-content')?.addEventListener('scroll', () => {
    if (list.style.display !== 'none') closeSiteList();
  });

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    list.style.display === 'none' ? openSiteList() : closeSiteList();
  });
  trigger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); list.style.display === 'none' ? openSiteList() : closeSiteList(); }
    if (e.key === 'Escape') closeSiteList();
  });

  async function runScrape(title, url, name) {
    if (!title || !url) return;

    const myToken = ++scrapeToken;

    loader.style.display = 'flex';
    try {
      const { data: scraped, error, notFound } = await scrapeDrama(title, url);

      if (myToken !== scrapeToken) return;

      if (notFound || error) {
        showBannerNotFound(name);
      } else if (scraped) {
        const originalTitle = titleInput.value.trim();
        lastScraped = scraped;

        openDetails();
        applyScrapeData(scraped, {
          setCountry:    v => { selectedCountry = v; },
          setGenres:     v => { selectedGenres  = v; },
          setReleaseTag: v => { releaseTag = v; },
          setSubTag:     v => { subTag = v; },
          syncSubmit,
        });
        showBannerFound(scraped, originalTitle);

        const finalTitle = scraped.title || originalTitle;
        hasRealPoster = false;
        showPosterPreview(finalTitle, name);
        if (scraped.poster_url) {
          const img = document.getElementById('hb-poster-img');
          const sourceEl = document.getElementById('hb-poster-source');
          const real = new Image();
          real.onload = () => {
            if (myToken !== scrapeToken) return;
            setPosterAspectRatio(real.naturalWidth, real.naturalHeight);
            img.src = posterProxyURL(scraped.poster_url);
            img.classList.remove('hb-poster-frame__img--loading');
            if (sourceEl) {
              sourceEl.textContent = name || 'Найдено';
              sourceEl.classList.remove('hb-poster-frame__label--missing');
            }
            hasRealPoster = true;
          };
          real.onerror = () => {
            fetchPoster(scraped.source_url, name, () => myToken !== scrapeToken).then(ok => {
              if (myToken === scrapeToken) hasRealPoster = ok;
            });
          };
          real.src = posterProxyURL(scraped.poster_url);
        } else {
          fetchPoster(scraped.source_url, name, () => myToken !== scrapeToken).then(ok => {
            if (myToken === scrapeToken) hasRealPoster = ok;
          });
        }

        persistState();
      }
    } catch (e) {
      console.warn('[AddDramaModal] scrapeDrama error:', e);
    } finally {
      if (myToken === scrapeToken) loader.style.display = 'none';
    }
  }

  list.querySelectorAll('.hb-site-option').forEach(opt => {
    opt.addEventListener('click', async () => {
      const url  = opt.dataset.url;
      const name = opt.dataset.name;

      // Если уже был показан результат — возвращаемся в начало
      if (showDetails) {
        closeDetails();
      }
      hasRealPoster = false;
      hidePosterPreview();

      selectedSiteUrl  = url;
      selectedSiteName = name;

      togglePosterColumn(!!(titleInput.value.trim() && selectedSiteUrl));

      trigLabel.textContent = name;
      trigLabel.classList.remove('hb-site-trigger--placeholder');
      trigUrl.textContent = url;
      trigFavico.src = `https://www.google.com/s2/favicons?domain=${url}&sz=32`;
      trigFavico.style.display = 'block';

      list.querySelectorAll('.hb-site-option').forEach(o => o.classList.remove('hb-site-option--active'));
      opt.classList.add('hb-site-option--active');
      closeSiteList();
      document.getElementById('hb-add-url-error').textContent = '';
      syncSubmit();

      // Скрейп запускается только если название уже есть. Логика самого скрейпа — в runScrape() выше,
      // она же используется для повторного скрейпа при изменении названия.
      const title = titleInput.value.trim();
      if (!title) return;

      await runScrape(title, url, name);
    });
  });

  document.addEventListener('click', e => {
    if (!document.getElementById('hb-site-dropdown')?.contains(e.target)) closeSiteList();
  });

  // Ссылка «Настройки» под дропдауном — закрывает модалку и ведёт на страницу настроек,
  // где можно включить/выключить конкретные сайты.
  document.getElementById('hb-goto-settings-link')?.addEventListener('click', e => {
    e.preventDefault();
    closeModal();
    navigate('#/settings');
  });

  // ── Кнопка «заполнить вручную» ───────────────────────────────────────────
  document.getElementById('hb-btn-fill-manual')?.addEventListener('click', () => {
    hideBanners();
    openDetails();
  });

  // ── Чипы деталей ─────────────────────────────────────────────────────────
  document.getElementById('hb-add-country-chips')?.addEventListener('click', e => {
    const chip = e.target.closest('.hb-chip');
    if (!chip) return;
    document.querySelectorAll('#hb-add-country-chips .hb-chip').forEach(c => c.classList.remove('hb-chip--active'));
    chip.classList.add('hb-chip--active');
    selectedCountry = chip.dataset.value;
    requestAnimationFrame(persistState);
  });

  document.getElementById('hb-add-genre-chips')?.addEventListener('click', e => {
    const chip = e.target.closest('.hb-chip');
    if (!chip) return;
    chip.classList.toggle('hb-chip--active');
    const val = chip.dataset.value;
    if (chip.classList.contains('hb-chip--active')) {
      if (!selectedGenres.includes(val)) selectedGenres.push(val);
    } else {
      selectedGenres = selectedGenres.filter(g => g !== val);
    }
    syncSubmit();
    requestAnimationFrame(persistState);
  });

  document.getElementById('hb-add-release-chips')?.addEventListener('click', e => {
    const chip = e.target.closest('.hb-chip');
    if (!chip) return;
    document.querySelectorAll('#hb-add-release-chips .hb-chip').forEach(c => c.classList.remove('hb-chip--active'));
    chip.classList.add('hb-chip--active');
    releaseTag = chip.dataset.value;
    requestAnimationFrame(persistState);
  });

  document.getElementById('hb-add-sub-chips')?.addEventListener('click', e => {
    const chip = e.target.closest('.hb-chip');
    if (!chip) return;
    document.querySelectorAll('#hb-add-sub-chips .hb-chip').forEach(c => c.classList.remove('hb-chip--active'));
    chip.classList.add('hb-chip--active');
    subTag = chip.dataset.value;
    requestAnimationFrame(persistState);
  });

  // ── Звёзды ───────────────────────────────────────────────────────────────
  const starsWrap = document.getElementById('hb-add-stars');
  const starsHint = document.getElementById('hb-add-stars-hint');

  if (starsWrap) {
    const stars = starsWrap.querySelectorAll('.hb-star');
    function renderStars(hov) {
      const active = hov ?? selectedRating ?? 0;
      stars.forEach(s => s.classList.toggle('hb-star--active', parseInt(s.dataset.value, 10) <= active));
    }
    starsWrap.addEventListener('mouseover', e => {
      const s = e.target.closest('.hb-star');
      if (!s) return;
      renderStars(parseInt(s.dataset.value, 10));
      starsHint.textContent = ratingHint(parseInt(s.dataset.value, 10));
    });
    starsWrap.addEventListener('mouseleave', () => {
      renderStars(null);
      starsHint.textContent = ratingHint(selectedRating);
    });
    starsWrap.addEventListener('click', e => {
      const s = e.target.closest('.hb-star');
      if (!s) return;
      const val = parseInt(s.dataset.value, 10);
      selectedRating = (selectedRating === val) ? null : val;
      starsHint.textContent = ratingHint(selectedRating);
      renderStars(null);
      requestAnimationFrame(persistState);
    });
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const submitBtn = document.getElementById('hb-btn-add-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const title = titleInput.value.trim();
      const year  = parseInt(document.getElementById('hb-add-year')?.value ?? '', 10);

      if (!title) {
        titleInput.classList.add('hb-error');
        document.getElementById('hb-add-title-error').textContent = t('modal.add.field.title_err');
        return;
      }

      const token = localStorage.getItem('hanbin_token');
      if (!token) {
        try {
          const { data: existing } = await getDramas();
          const dup = Array.isArray(existing) && existing.find(d =>
            d.title.toLowerCase().trim() === title.toLowerCase()
          );
          if (dup) {
            const toast = document.getElementById('hb-add-duplicate-toast');
            document.getElementById('hb-add-duplicate-text').textContent = `«${dup.title}» — ${statusLabel(dup.status)}.`;
            toast.style.display = 'flex';
            toast.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
          }
        } catch (e) { console.warn('[AddDramaModal] getDramas check failed:', e); }
      }

      const dramaData = {
        title, year,
        country: selectedCountry, genres: selectedGenres,
        status: 'plan', rating: selectedRating,
        watchUrl: selectedSiteUrl || null,
        sourceUrl: lastScraped?.source_url || null,
        tags: [releaseTag, subTag],
        episodesWatched: 0, episodesTotal: 0,
        ongoing: releaseTag === 'ongoing',
        hasSubs: subTag === 'translated',
        voiceover: document.getElementById('hb-add-voiceover')?.value.trim() || null,
        posterUrl: lastScraped?.poster_url || null,
      };

      submitBtn.disabled = true;
      submitBtn.textContent = t('modal.add.btn.loading');
      document.getElementById('hb-add-global-error').textContent = '';

      try {
        const { data, error } = await addDrama(dramaData);
        if (error) {
          document.getElementById('hb-add-global-error').textContent = error;
          submitBtn.disabled = false;
          submitBtn.textContent = t('modal.add.btn');
          return;
        }
        submitBtn.textContent = t('modal.add.btn.success');
        invalidateUserCache();
        setTimeout(() => closeModal(), 900);
      } catch (e) {
        console.error('[AddDramaModal] addDrama threw:', e);
        document.getElementById('hb-add-global-error').textContent = 'Ошибка. Попробуй ещё раз.';
        submitBtn.disabled = false;
        submitBtn.textContent = t('modal.add.btn');
      }
    });
  }

  titleInput.addEventListener('keydown', e => { if (e.key === 'Enter' && submitBtn && !submitBtn.disabled) submitBtn.click(); });

  // ── Persist ───────────────────────────────────────────────────────────────
  function persistState() {
    const el = content;
    if (!el) return;
    el.dataset.selectedRating   = JSON.stringify(selectedRating);
    el.dataset.selectedCountry  = selectedCountry;
    el.dataset.selectedGenres   = JSON.stringify(selectedGenres);
    el.dataset.releaseTag       = releaseTag;
    el.dataset.subTag           = subTag;
    el.dataset.selectedSiteUrl  = selectedSiteUrl  ?? '';
    el.dataset.selectedSiteName = selectedSiteName ?? '';
    el.dataset.showDetails      = JSON.stringify(showDetails);
    el.dataset.voiceover        = document.getElementById('hb-add-voiceover')?.value ?? '';
  }

  persistState();
  syncSubmit();
  setTimeout(() => titleInput.focus(), 80);
}

function statusLabel(status) {
  const map = { watching: 'status.watching', completed: 'status.completed', plan: 'status.plan', dropped: 'status.dropped' };
  return t(map[status] ?? status);
}

// ─────────────────────────────────────────────
// OPEN
// ─────────────────────────────────────────────

let _addModalOpening = false;

export async function openAddDramaModal() {
  if (document.getElementById('hb-modal-overlay') || _addModalOpening) return;
  _addModalOpening = true;

  injectAddDramaCSS();
  injectModalCSS();

  // Тянем свежий персональный список сайтов ДО первого рендера дропдауна — обычно мгновенно,
  // т.к. кэшируется после первого запроса за время жизни вкладки.
  await loadStreamingSites();
  _addModalOpening = false;

  // Пока шёл запрос — модалка могла уже открыться другим кликом/вызовом.
  if (document.getElementById('hb-modal-overlay')) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="hb-modal-overlay">
      <div id="hb-modal-box" class="hb-add-drama-box">
        <button id="hb-modal-close" aria-label="Закрыть">×</button>
        <div id="hb-modal-content"></div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper.firstElementChild);

  document.getElementById('hb-modal-close').addEventListener('click', closeModal);
  document.getElementById('hb-modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'hb-modal-overlay') closeModal();
  });
  const onKeydown = e => {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);

  const content = document.getElementById('hb-modal-content');
  mountAddDramaContent(content);

  const unsub = onLangChange(() => {
    const overlay = document.getElementById('hb-modal-overlay');
    if (!overlay) { unsub(); return; }
    const state = {
      title:            document.getElementById('hb-add-title')?.value ?? '',
      selectedRating:   _getState('selectedRating'),
      selectedCountry:  _getState('selectedCountry'),
      selectedGenres:   _getState('selectedGenres'),
      releaseTag:       _getState('releaseTag'),
      subTag:           _getState('subTag'),
      selectedSiteUrl:  _getState('selectedSiteUrl'),
      selectedSiteName: _getState('selectedSiteName'),
      showDetails:      _getState('showDetails'),
      voiceover:        _getState('voiceover'),
    };
    mountAddDramaContent(content, state);
  });
}

function _getState(key) {
  const el = document.getElementById('hb-modal-content');
  if (!el) return undefined;
  const raw = el.dataset[key];
  if (raw === undefined) return undefined;
  try { return JSON.parse(raw); } catch { return raw; }
}
