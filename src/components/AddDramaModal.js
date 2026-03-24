/**
 * HANBIN — Add Drama Modal Component
 * Модалка добавления новой дорамы.
 * Открывается через openAddDramaModal(), закрывается через closeModal() из LoginModal.js.
 */

import { closeModal, injectModalCSS } from './LoginModal.js';
import { addDrama, getDramas, invalidateUserCache } from '../api/mock.js';
import { t, onLangChange } from '../i18n/index.js';

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

// Стриминг-сайты из data/streaming-sites.json
const STREAMING_SITES = [
  { id: 1,  name: 'DoramaTV',      url: 'https://doramatv.one',   language: 'ru' },
  { id: 2,  name: 'Dorama.land',   url: 'https://dorama.land',    language: 'ru' },
  { id: 3,  name: 'Doramy.club',   url: 'https://doramy.club',    language: 'ru' },
  { id: 4,  name: 'Doramy.info',   url: 'https://doramy.info',    language: 'ru' },
  { id: 5,  name: 'Doramiru',      url: 'https://doram-ru.org',   language: 'ru' },
  { id: 6,  name: 'Dorama24',      url: 'https://dorama24.su',    language: 'ru' },
  { id: 7,  name: 'Rakuten Viki',  url: 'https://viki.com',       language: 'en' },
  { id: 8,  name: 'Netflix',       url: 'https://netflix.com',    language: 'multi' },
  { id: 9,  name: 'iQiyi',         url: 'https://iq.com',         language: 'multi' },
  { id: 10, name: 'MyDramaList',   url: 'https://mydramalist.com',language: 'en' },
];

// Жанры — ключ i18n + внутреннее значение для сохранения
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

// Страны — ключ i18n + код
const COUNTRY_KEYS = [
  { code: 'kr',    key: 'modal.add.country.kr' },
  { code: 'cn',    key: 'modal.add.country.cn' },
  { code: 'jp',    key: 'modal.add.country.jp' },
  { code: 'other', key: 'modal.add.country.other' },
];

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────

const ADD_DRAMA_CSS = `
  /* ── Расширенный бокс для формы ── */
  #hb-modal-box.hb-add-drama-box {
    width: 560px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  #hb-modal-box.hb-add-drama-box #hb-modal-content {
    padding: 36px 40px 32px;
    overflow-y: auto;
    flex: 1;
    scrollbar-width: thin;
    scrollbar-color: rgba(201,123,138,0.3) transparent;
  }

  #hb-modal-box.hb-add-drama-box #hb-modal-content::-webkit-scrollbar {
    width: 4px;
  }
  #hb-modal-box.hb-add-drama-box #hb-modal-content::-webkit-scrollbar-thumb {
    background: rgba(201,123,138,0.3);
    border-radius: 4px;
  }

  /* ── Двухколоночная раскладка полей ── */
  .hb-add-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  /* ── Теги (чипы) ── */
  .hb-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 2px;
  }

  .hb-chip {
    padding: 6px 13px;
    border-radius: 30px;
    border: 1px solid rgba(232,196,184,0.2);
    background: rgba(255,255,255,0.04);
    color: rgba(245,230,211,0.55);
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
  }

  .hb-chip:hover {
    border-color: rgba(201,123,138,0.4);
    color: var(--color-champagne, #f5e6d3);
    background: rgba(201,123,138,0.08);
  }

  .hb-chip.hb-chip--active {
    background: rgba(201,123,138,0.2);
    border-color: rgba(201,123,138,0.6);
    color: #f5e6d3;
  }

  /* Страна — особый стиль */
  .hb-chip.hb-chip--country {
    font-size: 13px;
    gap: 5px;
  }

  /* ── Рейтинг звёздами ── */
  .hb-stars-wrap {
    display: flex;
    gap: 6px;
    margin-top: 4px;
  }

  .hb-star {
    font-size: 24px;
    cursor: pointer;
    color: rgba(212,165,116,0.25);
    transition: color 0.15s ease, transform 0.12s ease;
    line-height: 1;
    user-select: none;
  }

  .hb-star:hover,
  .hb-star.hb-star--active {
    color: #d4a574;
  }

  .hb-star:hover {
    transform: scale(1.15);
  }

  .hb-stars-hint {
    font-size: 11px;
    color: rgba(245,230,211,0.3);
    margin-top: 6px;
    font-style: italic;
  }

  /* ── Статус-бейдж (только показ, не редактируемый) ── */
  .hb-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    border-radius: 30px;
    background: rgba(232,196,184,0.1);
    border: 1px solid rgba(232,196,184,0.25);
    color: #e8c4b8;
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.05em;
    margin-top: 4px;
  }

  .hb-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(232,196,184,0.6);
  }

  /* ── Toast / уведомление "уже добавлена" ── */
  .hb-toast {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 18px;
    border-radius: 14px;
    background: rgba(255,107,138,0.12);
    border: 1px solid rgba(255,107,138,0.35);
    margin-bottom: 16px;
    animation: hb-slideUp 0.3s ease;
  }

  .hb-toast-icon { font-size: 18px; flex-shrink: 0; line-height: 1.2; }

  .hb-toast-body { flex: 1; min-width: 0; }

  .hb-toast-title {
    font-size: 13px;
    font-weight: 500;
    color: #ff6b8a;
    margin-bottom: 3px;
  }

  .hb-toast-text {
    font-size: 12px;
    color: rgba(245,230,211,0.55);
    line-height: 1.4;
  }

  /* ── Секция-разделитель внутри формы ── */
  .hb-section-label {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(245,230,211,0.3);
    margin: 20px 0 12px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .hb-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(232,196,184,0.08);
  }

  /* ── Кастомный дропдаун сайта ── */
  .hb-site-dropdown {
    position: relative;
  }

  .hb-site-trigger {
    width: 100%;
    padding: 11px 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(232,196,184,0.18);
    border-radius: 12px;
    color: #f5e6d3;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    user-select: none;
  }

  .hb-site-trigger:hover,
  .hb-site-trigger.hb-site-trigger--open {
    border-color: rgba(201,123,138,0.55);
    box-shadow: 0 0 0 3px rgba(201,123,138,0.08);
  }

  .hb-site-trigger-left {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
    flex: 1;
  }

  .hb-site-favicon {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    flex-shrink: 0;
    object-fit: contain;
    background: rgba(255,255,255,0.08);
  }

  .hb-site-trigger-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .hb-site-trigger-label.hb-site-trigger--placeholder {
    color: rgba(245,230,211,0.22);
  }

  .hb-site-trigger-url {
    font-size: 11px;
    color: rgba(245,230,211,0.3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
  }

  .hb-site-chevron {
    flex-shrink: 0;
    color: rgba(245,230,211,0.35);
    transition: transform 0.2s ease;
  }

  .hb-site-trigger--open .hb-site-chevron {
    transform: rotate(180deg);
  }

  .hb-site-list {
    position: absolute;
    top: calc(100% + 6px);
    left: 0; right: 0;
    background: linear-gradient(145deg, rgba(74,25,66,0.98), rgba(45,15,42,0.99));
    border: 1px solid rgba(201,123,138,0.25);
    border-radius: 14px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    z-index: 100;
    overflow: hidden;
    max-height: 260px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(201,123,138,0.3) transparent;
    animation: hb-slideUp 0.18s ease;
  }

  .hb-site-list::-webkit-scrollbar { width: 4px; }
  .hb-site-list::-webkit-scrollbar-thumb { background: rgba(201,123,138,0.3); border-radius: 4px; }

  .hb-site-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 14px;
    cursor: pointer;
    transition: background 0.15s;
    border-bottom: 1px solid rgba(232,196,184,0.05);
  }

  .hb-site-option:last-child { border-bottom: none; }

  .hb-site-option:hover {
    background: rgba(201,123,138,0.1);
  }

  .hb-site-option--active {
    background: rgba(201,123,138,0.15);
  }

  .hb-site-option-info {
    flex: 1;
    min-width: 0;
  }

  .hb-site-option-name {
    font-size: 13px;
    color: #f5e6d3;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hb-site-option-url {
    font-size: 11px;
    color: rgba(245,230,211,0.35);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 1px;
  }

  .hb-site-lang {
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 20px;
    flex-shrink: 0;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .hb-site-lang--ru  { background: rgba(122,171,142,0.2);  color: #7aab8e; border: 1px solid rgba(122,171,142,0.3); }
  .hb-site-lang--en  { background: rgba(212,165,116,0.2);  color: #d4a574; border: 1px solid rgba(212,165,116,0.3); }
  .hb-site-lang--multi { background: rgba(201,123,138,0.18); color: #c97b8a; border: 1px solid rgba(201,123,138,0.3); }

  .hb-site-divider {
    padding: 6px 14px 4px;
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(245,230,211,0.25);
    background: rgba(0,0,0,0.15);
    border-bottom: 1px solid rgba(232,196,184,0.06);
  }

  /* ── select стиль как у input ── */
  .hb-field-select {
    width: 100%;
    padding: 13px 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(232,196,184,0.18);
    border-radius: 12px;
    color: #f5e6d3;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(245,230,211,0.35)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
    box-sizing: border-box;
  }

  .hb-field-select:focus {
    border-color: rgba(201,123,138,0.55);
    box-shadow: 0 0 0 3px rgba(201,123,138,0.08);
  }

  .hb-field-select option {
    background: #2d0f2a;
    color: #f5e6d3;
  }

  /* ── Кнопка добавить (зелёный акцент) ── */
  .hb-btn-add {
    background: linear-gradient(135deg, #7aab8e, #5d9478) !important;
    opacity: 1;
    transition: opacity 0.25s ease, transform 0.15s ease;
  }
  .hb-btn-add:not(:disabled):hover {
    opacity: 0.88 !important;
    transform: translateY(-1px);
  }
  .hb-btn-add:disabled {
    opacity: 0.35 !important;
    cursor: not-allowed !important;
    transform: none !important;
  }
`;

// ─────────────────────────────────────────────
// HTML
// ─────────────────────────────────────────────

function buildHTML(savedState = {}) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1989 }, (_, i) => {
    const y = currentYear + 1 - i;
    return `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`;
  }).join('');

  const { selectedGenres = [], selectedCountry = 'kr', releaseTag = 'released', subTag = 'translated' } = savedState;

  return `
    ${LOGO_SVG}
    <div class="hb-modal-title">${t('modal.add.title')}</div>
    <div class="hb-modal-sub">${t('modal.add.sub')}</div>

    <!-- Уведомление "уже добавлена" -->
    <div id="hb-add-duplicate-toast" class="hb-toast" style="display:none">
      <div class="hb-toast-icon">🌸</div>
      <div class="hb-toast-body">
        <div class="hb-toast-title">${t('modal.add.duplicate.title')}</div>
        <div class="hb-toast-text" id="hb-add-duplicate-text">${t('modal.add.duplicate.text')}</div>
      </div>
    </div>

    <!-- Название -->
    <div class="hb-field">
      <div class="hb-field-label">
        <span>${t('modal.add.field.title')} <span class="hb-required">*</span></span>
        <span class="hb-counter" id="hb-add-title-counter">0 / 120</span>
      </div>
      <input class="hb-field-input" id="hb-add-title" type="text"
        placeholder="${t('modal.add.field.title_ph')}" maxlength="120" autocomplete="off"
        value="${savedState.title ?? ''}">
      <div class="hb-field-error" id="hb-add-title-error"></div>
    </div>

    <!-- Дропдаун сайтов -->
    <div class="hb-field">
      <div class="hb-field-label"><span>${t('modal.add.field.where')}</span></div>
      <div class="hb-site-dropdown" id="hb-site-dropdown">
        <div class="hb-site-trigger" id="hb-site-trigger" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox">
          <div class="hb-site-trigger-left">
            <img class="hb-site-favicon" id="hb-site-favicon" src="${savedState.selectedSiteUrl ? `https://www.google.com/s2/favicons?domain=${savedState.selectedSiteUrl}&sz=32` : ''}" alt="" style="display:${savedState.selectedSiteUrl ? 'block' : 'none'}">
            <span class="hb-site-trigger-label ${savedState.selectedSiteUrl ? '' : 'hb-site-trigger--placeholder'}" id="hb-site-trigger-label">${savedState.selectedSiteName ?? t('modal.add.field.where_ph')}</span>
          </div>
          <span class="hb-site-trigger-url" id="hb-site-trigger-url">${savedState.selectedSiteUrl ?? ''}</span>
          <svg class="hb-site-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <div class="hb-site-list" id="hb-site-list" role="listbox" style="display:none">
          <div class="hb-site-divider">${t('modal.add.sites.ru_label')}</div>
          ${STREAMING_SITES.filter(s => s.language === 'ru').map(s => `
            <div class="hb-site-option ${savedState.selectedSiteUrl === s.url ? 'hb-site-option--active' : ''}" role="option" data-url="${s.url}" data-name="${s.name}" data-lang="${s.language}">
              <img class="hb-site-favicon" src="https://www.google.com/s2/favicons?domain=${s.url}&sz=32" alt="${s.name}">
              <div class="hb-site-option-info">
                <div class="hb-site-option-name">${s.name}</div>
                <div class="hb-site-option-url">${s.url}</div>
              </div>
              <span class="hb-site-lang hb-site-lang--ru">RU</span>
            </div>
          `).join('')}
          <div class="hb-site-divider">${t('modal.add.sites.intl_label')}</div>
          ${STREAMING_SITES.filter(s => s.language !== 'ru').map(s => `
            <div class="hb-site-option ${savedState.selectedSiteUrl === s.url ? 'hb-site-option--active' : ''}" role="option" data-url="${s.url}" data-name="${s.name}" data-lang="${s.language}">
              <img class="hb-site-favicon" src="https://www.google.com/s2/favicons?domain=${s.url}&sz=32" alt="${s.name}">
              <div class="hb-site-option-info">
                <div class="hb-site-option-name">${s.name}</div>
                <div class="hb-site-option-url">${s.url}</div>
              </div>
              <span class="hb-site-lang hb-site-lang--${s.language}">${s.language === 'en' ? 'EN' : 'Multi'}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="hb-field-error" id="hb-add-url-error"></div>
    </div>

    <div class="hb-section-label">${t('modal.add.section.details')}</div>

    <!-- Год + Страна -->
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

    <!-- Жанр -->
    <div class="hb-field" style="margin-top:16px">
      <div class="hb-field-label"><span>${t('modal.add.field.genre')}</span></div>
      <div class="hb-chips" id="hb-add-genre-chips">
        ${GENRE_KEYS.map(g => `
          <div class="hb-chip ${selectedGenres.includes(g.value) ? 'hb-chip--active' : ''}" data-value="${g.value}">${t(g.key)}</div>
        `).join('')}
      </div>
    </div>

    <div class="hb-section-label">${t('modal.add.section.tags')}</div>

    <!-- Теги выхода и перевода -->
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

    <!-- Статус просмотра -->
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

    <!-- Рейтинг -->
    <div class="hb-field">
      <div class="hb-field-label">
        <span>${t('modal.add.section.rating')} <span style="color:rgba(245,230,211,0.3);font-size:10px;letter-spacing:0">(${t('modal.add.rating.optional')})</span></span>
      </div>
      <div class="hb-stars-wrap" id="hb-add-stars">
        <span class="hb-star ${(savedState.selectedRating ?? 0) >= 1 ? 'hb-star--active' : ''}" data-value="1">★</span>
        <span class="hb-star ${(savedState.selectedRating ?? 0) >= 2 ? 'hb-star--active' : ''}" data-value="2">★</span>
        <span class="hb-star ${(savedState.selectedRating ?? 0) >= 3 ? 'hb-star--active' : ''}" data-value="3">★</span>
        <span class="hb-star ${(savedState.selectedRating ?? 0) >= 4 ? 'hb-star--active' : ''}" data-value="4">★</span>
        <span class="hb-star ${(savedState.selectedRating ?? 0) >= 5 ? 'hb-star--active' : ''}" data-value="5">★</span>
      </div>
      <div class="hb-stars-hint" id="hb-add-stars-hint">
        ${savedState.selectedRating ? t(`modal.add.rating.${savedState.selectedRating}`) : t('modal.add.rating.hint')}
      </div>
    </div>

    <!-- Глобальная ошибка -->
    <div class="hb-field-error" id="hb-add-global-error" style="text-align:center;margin-bottom:4px"></div>

    <!-- Кнопка -->
    <button class="hb-btn-primary hb-btn-add" id="hb-btn-add-submit" ${(savedState.title ?? '').trim() ? '' : 'disabled'}>
      ${t('modal.add.btn')}
    </button>
  `;
}

// ─────────────────────────────────────────────
// HELPERS — описание рейтинга (через i18n)
// ─────────────────────────────────────────────
const ratingHint = (val) => val ? t(`modal.add.rating.${val}`) : t('modal.add.rating.hint');

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

  // ── Состояние формы — восстанавливаем из savedState ──
  let selectedRating  = savedState.selectedRating  ?? null;
  let selectedCountry = savedState.selectedCountry ?? 'kr';
  let selectedGenres  = savedState.selectedGenres  ? [...savedState.selectedGenres] : [];
  let releaseTag      = savedState.releaseTag      ?? 'released';
  let subTag          = savedState.subTag          ?? 'translated';
  let selectedSiteUrl  = savedState.selectedSiteUrl  ?? null;
  let selectedSiteName = savedState.selectedSiteName ?? null;

  // ── Хелпер: синхронизировать кнопку Submit ───
  // Кнопка активна только когда заполнены все обязательные поля:
  // title, watch_url (сайт из дропдауна), genre (хотя бы один жанр)
  function syncSubmit() {
    const title    = document.getElementById('hb-add-title')?.value.trim() ?? '';
    const hasUrl   = !!selectedSiteUrl;
    const hasGenre = selectedGenres.length > 0;
    const btn      = document.getElementById('hb-btn-add-submit');
    if (btn) btn.disabled = !(title.length > 0 && hasUrl && hasGenre);
  }

  // ── Название ─────────────────────────────────
  const titleInput   = document.getElementById('hb-add-title');
  const titleCounter = document.getElementById('hb-add-title-counter');

  // Инициализируем счётчик если есть сохранённое значение
  if (titleInput.value) titleCounter.textContent = `${titleInput.value.length} / 120`;

  // Синхронизируем кнопку сразу при маунте (актуально при восстановлении состояния)
  syncSubmit();

  titleInput.addEventListener('input', () => {
    const len = titleInput.value.length;
    titleCounter.textContent = `${len} / 120`;
    titleCounter.classList.toggle('warn', len > 105);
    titleInput.classList.remove('hb-error');
    document.getElementById('hb-add-title-error').textContent = '';
    syncSubmit();
    document.getElementById('hb-add-duplicate-toast').style.display = 'none';
  });

  // ── Дропдаун сайтов ──────────────────────────
  const trigger    = document.getElementById('hb-site-trigger');
  const list       = document.getElementById('hb-site-list');
  const trigLabel  = document.getElementById('hb-site-trigger-label');
  const trigUrl    = document.getElementById('hb-site-trigger-url');
  const trigFavico = document.getElementById('hb-site-favicon');

  function openSiteList() {
    list.style.display = 'block';
    trigger.setAttribute('aria-expanded', 'true');
    trigger.classList.add('hb-site-trigger--open');
  }

  function closeSiteList() {
    list.style.display = 'none';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.classList.remove('hb-site-trigger--open');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    list.style.display === 'none' ? openSiteList() : closeSiteList();
  });

  trigger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); list.style.display === 'none' ? openSiteList() : closeSiteList(); }
    if (e.key === 'Escape') closeSiteList();
  });

  list.querySelectorAll('.hb-site-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const url  = opt.dataset.url;
      const name = opt.dataset.name;
      const lang = opt.dataset.lang;

      selectedSiteUrl = url;

      // Обновляем триггер
      trigLabel.textContent = name;
      trigLabel.classList.remove('hb-site-trigger--placeholder');
      trigUrl.textContent = url;

      const faviconSrc = `https://www.google.com/s2/favicons?domain=${url}&sz=32`;
      trigFavico.src = faviconSrc;
      trigFavico.style.display = 'block';

      // Подсвечиваем активный пункт
      list.querySelectorAll('.hb-site-option').forEach(o => o.classList.remove('hb-site-option--active'));
      opt.classList.add('hb-site-option--active');

      closeSiteList();
      document.getElementById('hb-add-url-error').textContent = '';
      syncSubmit();
    });
  });

  // Закрываем при клике вне
  const onOutsideClick = (e) => {
    if (!document.getElementById('hb-site-dropdown')?.contains(e.target)) closeSiteList();
  };
  document.addEventListener('click', onOutsideClick);

  // ── Страна (single-select чипы) ───────────────
  document.getElementById('hb-add-country-chips').addEventListener('click', e => {
    const chip = e.target.closest('.hb-chip');
    if (!chip) return;
    document.querySelectorAll('#hb-add-country-chips .hb-chip').forEach(c => c.classList.remove('hb-chip--active'));
    chip.classList.add('hb-chip--active');
    selectedCountry = chip.dataset.value;
  });

  // ── Жанры (multi-select чипы) ─────────────────
  document.getElementById('hb-add-genre-chips').addEventListener('click', e => {
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
  });

  // ── Тег выпуска (single-select) ───────────────
  document.getElementById('hb-add-release-chips').addEventListener('click', e => {
    const chip = e.target.closest('.hb-chip');
    if (!chip) return;
    document.querySelectorAll('#hb-add-release-chips .hb-chip').forEach(c => c.classList.remove('hb-chip--active'));
    chip.classList.add('hb-chip--active');
    releaseTag = chip.dataset.value;
  });

  // ── Тег перевода (single-select) ─────────────
  document.getElementById('hb-add-sub-chips').addEventListener('click', e => {
    const chip = e.target.closest('.hb-chip');
    if (!chip) return;
    document.querySelectorAll('#hb-add-sub-chips .hb-chip').forEach(c => c.classList.remove('hb-chip--active'));
    chip.classList.add('hb-chip--active');
    subTag = chip.dataset.value;
  });

  // ── Рейтинг звёздами ─────────────────────────
  const starsWrap = document.getElementById('hb-add-stars');
  const starsHint = document.getElementById('hb-add-stars-hint');
  const stars     = starsWrap.querySelectorAll('.hb-star');

  function renderStars(hoverValue) {
    const active = hoverValue ?? selectedRating ?? 0;
    stars.forEach(s => {
      const v = parseInt(s.dataset.value, 10);
      s.classList.toggle('hb-star--active', v <= active);
    });
  }

  starsWrap.addEventListener('mouseover', e => {
    const star = e.target.closest('.hb-star');
    if (!star) return;
    renderStars(parseInt(star.dataset.value, 10));
    starsHint.textContent = ratingHint(parseInt(star.dataset.value, 10));
  });

  starsWrap.addEventListener('mouseleave', () => {
    renderStars(null);
    starsHint.textContent = ratingHint(selectedRating);
  });

  starsWrap.addEventListener('click', e => {
    const star = e.target.closest('.hb-star');
    if (!star) return;
    const val = parseInt(star.dataset.value, 10);
    selectedRating = (selectedRating === val) ? null : val;
    starsHint.textContent = ratingHint(selectedRating);
    renderStars(null);
  });

  // ── Submit ────────────────────────────────────
  const submitBtn = document.getElementById('hb-btn-add-submit');

  submitBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const year  = parseInt(document.getElementById('hb-add-year').value, 10);

    // Клиентская валидация — не должна срабатывать (кнопка заблокирована), но как страховка
    if (!title) {
      titleInput.classList.add('hb-error');
      document.getElementById('hb-add-title-error').textContent = t('modal.add.field.title_err');
      return;
    }

    // Проверка дубликата — только если используется мок (нет токена)
    // При реальном бэке дубликат вернёт ошибку сам
    const token = localStorage.getItem('hanbin_token');
    if (!token) {
      try {
        const { data: existing } = await getDramas();
        const duplicate = Array.isArray(existing) && existing.find(d =>
          d.title.toLowerCase().trim() === title.toLowerCase()
        );
        if (duplicate) {
          const toast    = document.getElementById('hb-add-duplicate-toast');
          const toastText = document.getElementById('hb-add-duplicate-text');
          toastText.textContent = `«${duplicate.title}» — ${statusLabel(duplicate.status)}.`;
          toast.style.display = 'flex';
          toast.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return;
        }
      } catch (e) {
        console.warn('[AddDramaModal] getDramas check failed, skipping duplicate check:', e);
      }
    }

    // Собираем данные для отправки
    const dramaData = {
      title,
      year,
      country:  selectedCountry,
      genres:   selectedGenres,
      status:   'plan',
      rating:   selectedRating,
      watchUrl: selectedSiteUrl || null,
      tags:     [releaseTag, subTag],
      episodesWatched: 0,
      episodesTotal:   0,
      ongoing: releaseTag === 'ongoing',
      hasSubs: subTag === 'translated',
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

      console.log('[AddDramaModal] Дорама добавлена:', data);
      submitBtn.textContent = t('modal.add.btn.success');
      // Инвалидируем кэш — компоненты на Home перезапросят /users/me
      invalidateUserCache();
      setTimeout(() => closeModal(), 900);
    } catch (e) {
      console.error('[AddDramaModal] addDrama threw:', e);
      document.getElementById('hb-add-global-error').textContent = 'Ошибка. Попробуй ещё раз.';
      submitBtn.disabled = false;
      submitBtn.textContent = t('modal.add.btn');
    }
  });

  // Enter в поле названия — submit
  titleInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitBtn.click();
  });

  // ── Сохраняем состояние в data-атрибуты контейнера ──
  // Пользуемся MutationObserver через прокси-функцию, чтобы перехватывать изменения переменных
  function persistState() {
    const el = content;
    if (!el) return;
    el.dataset.selectedRating  = JSON.stringify(selectedRating);
    el.dataset.selectedCountry = selectedCountry;
    el.dataset.selectedGenres  = JSON.stringify(selectedGenres);
    el.dataset.releaseTag      = releaseTag;
    el.dataset.subTag          = subTag;
    el.dataset.selectedSiteUrl  = selectedSiteUrl  ?? '';
    el.dataset.selectedSiteName = selectedSiteName ?? '';
  }

  // Сохраняем при каждом изменении состояния
  const origCountryListener = document.getElementById('hb-add-country-chips').onclick;
  document.getElementById('hb-add-country-chips').addEventListener('click',  () => requestAnimationFrame(persistState));
  document.getElementById('hb-add-genre-chips').addEventListener('click',    () => requestAnimationFrame(persistState));
  document.getElementById('hb-add-release-chips').addEventListener('click',  () => requestAnimationFrame(persistState));
  document.getElementById('hb-add-sub-chips').addEventListener('click',      () => requestAnimationFrame(persistState));
  starsWrap.addEventListener('click', () => requestAnimationFrame(persistState));
  list.querySelectorAll('.hb-site-option').forEach(opt => {
    opt.addEventListener('click', () => requestAnimationFrame(persistState));
  });

  // Инициальное сохранение
  persistState();

  // Фокус на поле названия
  setTimeout(() => titleInput.focus(), 80);
}

// ─────────────────────────────────────────────
// Хелпер: читаемый статус через i18n
// ─────────────────────────────────────────────
function statusLabel(status) {
  const map = {
    watching:  'status.watching',
    completed: 'status.completed',
    plan:      'status.plan',
    dropped:   'status.dropped',
  };
  return t(map[status] ?? status);
}

// ─────────────────────────────────────────────
// OPEN — точка входа
// ─────────────────────────────────────────────

export function openAddDramaModal() {
  // Если уже открыта другая модалка — не открываем поверх
  if (document.getElementById('hb-modal-overlay')) return;

  injectAddDramaCSS();
  injectModalCSS(); // полный CSS из LoginModal — включает .hb-btn-secondary и все остальные стили

  // Создаём оверлей
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

  // Закрытие
  document.getElementById('hb-modal-close').addEventListener('click', closeModal);
  document.getElementById('hb-modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'hb-modal-overlay') closeModal();
  });
  const onKeydown = e => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', onKeydown);
    }
  };
  document.addEventListener('keydown', onKeydown);

  const content = document.getElementById('hb-modal-content');

  // Монтируем контент
  mountAddDramaContent(content);

  // ── Перерисовка при смене языка (сохраняем состояние формы) ──
  const unsub = onLangChange(() => {
    const overlay = document.getElementById('hb-modal-overlay');
    if (!overlay) { unsub(); return; }

    // Снимаем текущее состояние перед перерисовкой
    const state = {
      title:           document.getElementById('hb-add-title')?.value ?? '',
      selectedRating:  _getState('selectedRating'),
      selectedCountry: _getState('selectedCountry'),
      selectedGenres:  _getState('selectedGenres'),
      releaseTag:      _getState('releaseTag'),
      subTag:          _getState('subTag'),
      selectedSiteUrl:  _getState('selectedSiteUrl'),
      selectedSiteName: _getState('selectedSiteName'),
    };

    mountAddDramaContent(content, state);
  });
}

// Хелпер для чтения состояния из data-атрибутов (сохраняем на контейнере)
function _getState(key) {
  const el = document.getElementById('hb-modal-content');
  if (!el) return undefined;
  const raw = el.dataset[key];
  if (raw === undefined) return undefined;
  try { return JSON.parse(raw); } catch { return raw; }
}
