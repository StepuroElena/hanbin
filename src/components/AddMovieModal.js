/**
 * HANBIN — Add Movie Modal Component
 *
 * Простая модалка: название (обязательно), год (опционально), жанр (обязательно, чипсы,
 * можно выбрать сразу несколько), категория (опционально, дропдаун с поиском, персональный
 * список редактируется в Настройках), страна выпуска (опционально, дропдаун с поиском по названию).
 */

import { closeModal, injectModalCSS } from './LoginModal.js';
import { addMovie, getMovieCategories } from '../api/mock.js';
import { t, onLangChange, getLang } from '../i18n/index.js';
import { COUNTRIES, countryLabel } from '../data/countries.js';

const LOGO_SVG = `
  <svg class="hb-modal-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <defs>
      <linearGradient id="hb-addmovie-logo-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d1238"/>
        <stop offset="100%" stop-color="#2d0f2a"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="7" fill="url(#hb-addmovie-logo-bg)"/>
    <rect x="4" y="6" width="2.5" height="20" rx="1" fill="#f5e6d3"/>
    <path d="M6.5 14 Q10 10 13.5 14 L13.5 26 L11 26 L11 15.5 Q10 13.5 6.5 15.5Z" fill="#f5e6d3"/>
    <rect x="17" y="6" width="2.5" height="20" rx="1" fill="#c97b8a" transform="skewX(-4)"/>
    <path d="M19.5 15.5 Q25 14 25 19 Q25 24.5 19.5 24.5 L19.5 22.5 Q23 22.5 23 19 Q23 16.5 19.5 17Z" fill="#c97b8a" transform="skewX(-4)"/>
  </svg>
`;

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
  { key: 'modal.add.genres.scifi',       value: 'SciFi' },
  { key: 'modal.add.genres.adventure',   value: 'Adventure' },
  { key: 'modal.add.genres.bodyhorror',  value: 'BodyHorror' },
  { key: 'modal.add.genres.detective',   value: 'Detective' },
];

const ADD_MOVIE_CSS = `
  #hb-modal-box.hb-add-movie-box { width: 460px; }

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
  .hb-field-select.hb-error { border-color: rgba(255,107,138,0.6); box-shadow: 0 0 0 3px rgba(255,107,138,0.07); }

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
  .hb-chips.hb-error .hb-chip { border-color: rgba(255,107,138,0.4); }

  /* Страна — дропдаун с поиском */
  .hb-country-dropdown { position: relative; }
  .hb-country-trigger {
    width: 100%; padding: 11px 16px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(232,196,184,0.18);
    border-radius: 12px; color: #f5e6d3; font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box; display: flex; align-items: center;
    justify-content: space-between; gap: 10px; user-select: none;
  }
  .hb-country-trigger:hover, .hb-country-trigger--open {
    border-color: rgba(201,123,138,0.55); box-shadow: 0 0 0 3px rgba(201,123,138,0.08);
  }
  .hb-country-trigger-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; text-align: left; }
  .hb-country-trigger-label--placeholder { color: rgba(245,230,211,0.3); }
  .hb-country-chevron { flex-shrink: 0; color: rgba(245,230,211,0.35); transition: transform 0.2s ease; }
  .hb-country-trigger--open .hb-country-chevron { transform: rotate(180deg); }
  .hb-country-clear {
    flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.08); color: rgba(245,230,211,0.5);
    border: none; cursor: pointer; font-size: 13px; line-height: 1;
  }
  .hb-country-clear:hover { background: rgba(255,107,138,0.2); color: #ff9db0; }

  .hb-country-panel {
    position: fixed;
    background: linear-gradient(145deg, rgba(74,25,66,0.98), rgba(45,15,42,0.99));
    border: 1px solid rgba(201,123,138,0.25); border-radius: 14px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5); z-index: 10000;
    overflow: hidden; animation: hb-slideUp 0.18s ease;
  }
  .hb-country-search-wrap { padding: 8px; border-bottom: 1px solid rgba(232,196,184,0.1); }
  .hb-country-search {
    width: 100%; padding: 9px 12px;
    background: rgba(255,255,255,0.07); border: 1px solid rgba(232,196,184,0.15);
    border-radius: 9px; color: #f5e6d3; font-family: 'DM Sans', sans-serif; font-size: 13px;
    outline: none; box-sizing: border-box;
  }
  .hb-country-search:focus { border-color: rgba(201,123,138,0.5); }
  .hb-country-list {
    max-height: 220px; overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: rgba(201,123,138,0.3) transparent;
  }
  .hb-country-list::-webkit-scrollbar { width: 4px; }
  .hb-country-list::-webkit-scrollbar-thumb { background: rgba(201,123,138,0.3); border-radius: 4px; }
  .hb-country-option {
    display: flex; align-items: center; gap: 10px; padding: 10px 14px;
    cursor: pointer; transition: background 0.15s; font-size: 13px; color: #f5e6d3;
  }
  .hb-country-option:hover { background: rgba(201,123,138,0.1); }
  .hb-country-option--active { background: rgba(201,123,138,0.15); }
  .hb-country-empty { padding: 16px 14px; text-align: center; font-size: 12px; color: rgba(245,230,211,0.35); font-style: italic; }

  /* Категория — дропдаун с поиском, та же верстка, что и у страны — переиспользуем те же классы через общий селектор */
  .hb-country-dropdown.hb-category-dropdown { position: relative; }
  .hb-category-empty-note { padding: 10px 14px; text-align: center; font-size: 12px; color: rgba(245,230,211,0.35); font-style: italic; }

  /* Категория — мультивыбор, выбранные отображаются чипсами прямо в триггере */
  .hb-category-multi { position: relative; }
  .hb-category-multi-trigger {
    width: 100%; min-height: 46px; padding: 8px 12px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(232,196,184,0.18);
    border-radius: 12px; outline: none; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box; display: flex; align-items: center; flex-wrap: wrap;
    gap: 6px; user-select: none;
  }
  .hb-category-multi-trigger:hover, .hb-category-multi-trigger--open {
    border-color: rgba(201,123,138,0.55); box-shadow: 0 0 0 3px rgba(201,123,138,0.08);
  }
  .hb-category-multi-trigger--open .hb-country-chevron { transform: rotate(180deg); }
  .hb-category-multi-trigger .hb-country-chevron { flex-shrink: 0; margin-left: auto; color: rgba(245,230,211,0.35); transition: transform 0.2s ease; }
  .hb-category-chips { display: flex; flex-wrap: wrap; gap: 6px; flex: 1; min-width: 0; }
  .hb-category-placeholder { color: rgba(245,230,211,0.3); font-size: 14px; padding: 4px 2px; }
  .hb-category-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 6px 4px 11px; border-radius: 20px;
    background: rgba(201,123,138,0.2); border: 1px solid rgba(201,123,138,0.4);
    color: #f5e6d3; font-size: 12px; font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .hb-category-chip-remove {
    width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.1); border: none; color: rgba(245,230,211,0.6);
    font-size: 12px; line-height: 1; cursor: pointer; padding: 0;
  }
  .hb-category-chip-remove:hover { background: rgba(255,107,138,0.25); color: #ff9db0; }
  .hb-country-option.hb-category-option--selected {
    background: rgba(122,171,142,0.14);
  }
  .hb-country-option.hb-category-option--selected::after {
    content: '✓'; margin-left: auto; color: var(--color-jade, #7aab8e); font-size: 12px;
  }
`;

function injectAddMovieCSS() {
  if (document.getElementById('hb-add-movie-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-add-movie-css';
  style.textContent = ADD_MOVIE_CSS;
  document.head.appendChild(style);
}

function buildHTML(savedState = {}) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i)
    .map(y => `<option value="${y}" ${String(savedState.year ?? '') === String(y) ? 'selected' : ''}>${y}</option>`)
    .join('');

  const lang = getLang();
  const countryLabelText = savedState.country ? countryLabel(savedState.country, lang) : null;
  const countryFlag = savedState.country ? (COUNTRIES.find(c => c.code === savedState.country)?.flag ?? '') : '';

  return `
    ${LOGO_SVG}
    <div class="hb-modal-title">${t('modal.addmovie.title')}</div>
    <div class="hb-modal-sub">${t('modal.addmovie.sub')}</div>

    <div class="hb-field">
      <div class="hb-field-label">
        <span>${t('modal.addmovie.field.title')} <span class="hb-required">*</span></span>
        <span class="hb-counter" id="hb-addmovie-title-counter">${(savedState.title ?? '').length} / 200</span>
      </div>
      <input class="hb-field-input" id="hb-addmovie-title" type="text"
        placeholder="${t('modal.addmovie.field.title_ph')}" maxlength="200" autocomplete="off"
        value="${savedState.title ?? ''}">
      <div class="hb-field-error" id="hb-addmovie-title-error"></div>
    </div>

    <div class="hb-field">
      <div class="hb-field-label"><span>${t('modal.addmovie.field.year')}</span></div>
      <select class="hb-field-select" id="hb-addmovie-year">
        <option value="">${t('modal.addmovie.field.year_ph')}</option>
        ${yearOptions}
      </select>
    </div>

    <div class="hb-field">
      <div class="hb-field-label"><span>${t('modal.addmovie.field.genre')} <span class="hb-required">*</span></span></div>
      <div class="hb-chips" id="hb-addmovie-genre-chips">
        ${GENRE_KEYS.map(g => `<div class="hb-chip ${(savedState.genres ?? []).includes(g.value) ? 'hb-chip--active' : ''}" data-value="${g.value}">${t(g.key)}</div>`).join('')}
      </div>
      <div class="hb-field-error" id="hb-addmovie-genre-error"></div>
    </div>

    <div class="hb-field">
      <div class="hb-field-label"><span>${t('modal.addmovie.field.category')}</span></div>
      <div class="hb-category-multi" id="hb-category-dropdown">
        <div class="hb-category-multi-trigger" id="hb-category-trigger" tabindex="0" role="button">
          <div class="hb-category-chips" id="hb-category-chips-inline">
            ${categoryChipsInlineHTML(savedState.categories ?? [])}
          </div>
          <svg class="hb-country-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="hb-field">
      <div class="hb-field-label"><span>${t('modal.addmovie.field.country')}</span></div>
      <div class="hb-country-dropdown" id="hb-country-dropdown">
        <button type="button" class="hb-country-trigger" id="hb-country-trigger">
          <span class="hb-country-trigger-label ${countryLabelText ? '' : 'hb-country-trigger-label--placeholder'}" id="hb-country-trigger-label">
            ${countryLabelText ? `${countryFlag} ${countryLabelText}` : t('modal.addmovie.field.country_ph')}
          </span>
          ${countryLabelText ? `<button type="button" class="hb-country-clear" id="hb-country-clear">×</button>` : ''}
          <svg class="hb-country-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="hb-field-error" id="hb-addmovie-global-error" style="text-align:center;margin-bottom:4px"></div>
    <button class="hb-btn-primary" id="hb-btn-addmovie-submit" disabled>${t('modal.addmovie.btn')}</button>
  `;
}

/** Чипсы выбранных категорий внутри триггера дропдауна — каждая со своим × для быстрого удаления без открытия панели. */
function categoryChipsInlineHTML(categories) {
  if (!categories.length) {
    return `<span class="hb-category-placeholder">${t('modal.addmovie.field.category_ph')}</span>`;
  }
  return categories.map(name => `
    <span class="hb-category-chip" data-name="${name}">
      ${name}
      <button type="button" class="hb-category-chip-remove" data-name="${name}">×</button>
    </span>
  `).join('');
}

function countryOptionHTML(c, lang, isActive) {
  const label = lang === 'en' ? c.en : c.ru;
  return `
    <div class="hb-country-option ${isActive ? 'hb-country-option--active' : ''}" data-code="${c.code}">
      <span>${c.flag}</span><span>${label}</span>
    </div>
  `;
}

/**
 * Позиционирует плавающую панель (страна/категория) относительно триггера — если снизу не хватает места до края
 * экрана (особенно актуально для последнего поля перед кнопкой сабмита) — открываем вверх,
 * а не обрезаем по низу экрана. Тот же принцип, что и в attachEpisodeCountDropdown (DramaCard.js).
 */
function positionFloatingPanel(panel, rect) {
  const viewportMargin = 12;
  const searchAreaHeight = 60; // примерная высота строки поиска с отступами
  const listMaxHeight = 220; // совпадает с max-height в .hb-country-list

  const spaceBelow = window.innerHeight - rect.bottom - viewportMargin;
  const spaceAbove = rect.top - viewportMargin;
  const listEl = panel.querySelector('.hb-country-list');

  if (spaceBelow >= (listMaxHeight + searchAreaHeight) || spaceBelow >= spaceAbove) {
    // Открываем вниз, как обычно, но не даём списку вылезть за нижний край окна
    panel.style.top = (rect.bottom + 6) + 'px';
    panel.style.bottom = '';
    if (listEl) listEl.style.maxHeight = Math.max(120, Math.min(listMaxHeight, spaceBelow - searchAreaHeight)) + 'px';
  } else {
    // Снизу слишком мало места (поле ближе к низу экрана/модалки) — открываем вверх от триггера
    panel.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
    panel.style.top = '';
    if (listEl) listEl.style.maxHeight = Math.max(120, Math.min(listMaxHeight, spaceAbove - searchAreaHeight)) + 'px';
  }
}

export function mountAddMovieContent(content, savedState = {}, { onAdded } = {}) {
  content.innerHTML = buildHTML(savedState);

  const titleInput   = document.getElementById('hb-addmovie-title');
  const titleCounter = document.getElementById('hb-addmovie-title-counter');
  const yearSelect    = document.getElementById('hb-addmovie-year');
  const submitBtn     = document.getElementById('hb-btn-addmovie-submit');

  let selectedGenres = Array.isArray(savedState.genres) ? [...savedState.genres] : [];
  let selectedCountry = savedState.country ?? '';
  let selectedCategories = Array.isArray(savedState.categories) ? [...savedState.categories] : [];

  // Категории — персональный список пользователя (редактируется в Настройках) — тянем сразу
  // при открытии модалки, панель ожидает этот промис перед рендером списка.
  const categoriesPromise = getMovieCategories();

  function persistState() {
    content.dataset.title      = titleInput.value;
    content.dataset.year       = yearSelect.value;
    content.dataset.genres     = JSON.stringify(selectedGenres);
    content.dataset.country    = selectedCountry;
    content.dataset.categories = JSON.stringify(selectedCategories);
  }

  function syncSubmit() {
    const title = titleInput.value.trim();
    submitBtn.disabled = !(title.length > 0 && selectedGenres.length > 0);
  }

  titleInput.addEventListener('input', () => {
    titleCounter.textContent = `${titleInput.value.length} / 200`;
    titleInput.classList.remove('hb-error');
    document.getElementById('hb-addmovie-title-error').textContent = '';
    syncSubmit();
    persistState();
  });

  yearSelect.addEventListener('change', persistState);

  // ── Жанр — чипсы (множественный выбор, можно отметить сразу несколько) ──
  document.getElementById('hb-addmovie-genre-chips')?.addEventListener('click', (e) => {
    const chip = e.target.closest('.hb-chip');
    if (!chip) return;
    const wrap = document.getElementById('hb-addmovie-genre-chips');
    const value = chip.dataset.value;
    if (selectedGenres.includes(value)) {
      selectedGenres = selectedGenres.filter(g => g !== value);
      chip.classList.remove('hb-chip--active');
    } else {
      selectedGenres.push(value);
      chip.classList.add('hb-chip--active');
    }
    wrap.classList.remove('hb-error');
    document.getElementById('hb-addmovie-genre-error').textContent = '';
    syncSubmit();
    persistState();
  });

  // ── Страна — дропдаун с поиском ──
  const countryTrigger = document.getElementById('hb-country-trigger');
  const countryDropdown = document.getElementById('hb-country-dropdown');
  let countryPanelEl = null;

  function closeCountryPanel() {
    countryPanelEl?.remove();
    countryPanelEl = null;
    countryTrigger?.classList.remove('hb-country-trigger--open');
  }

  function renderCountryList(panel, query) {
    const lang = getLang();
    const q = query.trim().toLowerCase();
    const filtered = q
      ? COUNTRIES.filter(c => c.ru.toLowerCase().includes(q) || c.en.toLowerCase().includes(q))
      : COUNTRIES;
    const listEl = panel.querySelector('.hb-country-list');
    if (!filtered.length) {
      listEl.innerHTML = `<div class="hb-country-empty">${t('modal.addmovie.field.country_empty')}</div>`;
      return;
    }
    listEl.innerHTML = filtered.map(c => countryOptionHTML(c, lang, c.code === selectedCountry)).join('');
    listEl.querySelectorAll('.hb-country-option').forEach(opt => {
      opt.addEventListener('click', () => {
        selectedCountry = opt.dataset.code;
        updateCountryTrigger();
        closeCountryPanel();
        persistState();
      });
    });
  }

  function openCountryPanel() {
    closeCountryPanel();
    closeCategoryPanel();
    const rect = countryDropdown.getBoundingClientRect();

    const panel = document.createElement('div');
    panel.className = 'hb-country-panel';
    panel.style.left = rect.left + 'px';
    panel.style.width = rect.width + 'px';
    panel.innerHTML = `
      <div class="hb-country-search-wrap">
        <input type="text" class="hb-country-search" id="hb-country-search" placeholder="${t('modal.addmovie.field.country_search_ph')}" autocomplete="off">
      </div>
      <div class="hb-country-list"></div>
    `;
    panel.addEventListener('click', (e) => e.stopPropagation());
    document.body.appendChild(panel);
    countryPanelEl = panel;
    countryTrigger.classList.add('hb-country-trigger--open');
    positionFloatingPanel(panel, rect);

    renderCountryList(panel, '');

    const searchInput = panel.querySelector('#hb-country-search');
    searchInput.addEventListener('input', () => renderCountryList(panel, searchInput.value));
    setTimeout(() => searchInput.focus(), 30);

    setTimeout(() => {
      document.addEventListener('click', closeCountryPanel, { once: true });
    }, 0);
  }

  function updateCountryTrigger() {
    const label = document.getElementById('hb-country-trigger-label');
    if (!label) return;
    if (selectedCountry) {
      const c = COUNTRIES.find(x => x.code === selectedCountry);
      const lang = getLang();
      label.textContent = `${c.flag} ${lang === 'en' ? c.en : c.ru}`;
      label.classList.remove('hb-country-trigger-label--placeholder');
    } else {
      label.textContent = t('modal.addmovie.field.country_ph');
      label.classList.add('hb-country-trigger-label--placeholder');
    }
    document.getElementById('hb-country-clear')?.remove();
    if (selectedCountry) {
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'hb-country-clear';
      clearBtn.id = 'hb-country-clear';
      clearBtn.textContent = '×';
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedCountry = '';
        updateCountryTrigger();
        persistState();
      });
      label.insertAdjacentElement('afterend', clearBtn);
    }
  }

  countryTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    countryPanelEl ? closeCountryPanel() : openCountryPanel();
  });

  // ── Категория — мультивыбор с поиском, выбранные отображаются чипсами прямо в триггере, список тянется асинхронно из categoriesPromise ──
  const categoryTrigger = document.getElementById('hb-category-trigger');
  const categoryChipsInline = document.getElementById('hb-category-chips-inline');
  const categoryDropdown = document.getElementById('hb-category-dropdown');
  let categoryPanelEl = null;

  function closeCategoryPanel() {
    categoryPanelEl?.remove();
    categoryPanelEl = null;
    categoryTrigger?.classList.remove('hb-category-multi-trigger--open');
  }

  function renderCategoryChipsInline() {
    categoryChipsInline.innerHTML = categoryChipsInlineHTML(selectedCategories);
    categoryChipsInline.querySelectorAll('.hb-category-chip-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedCategories = selectedCategories.filter(c => c !== btn.dataset.name);
        renderCategoryChipsInline();
        if (categoryPanelEl) renderCategoryList(categoryPanelEl, categoryPanelEl.querySelector('#hb-category-search')?.value ?? '');
        persistState();
      });
    });
  }

  function toggleCategory(name) {
    if (selectedCategories.includes(name)) {
      selectedCategories = selectedCategories.filter(c => c !== name);
    } else {
      selectedCategories.push(name);
    }
    renderCategoryChipsInline();
    persistState();
  }

  function categoryOptionHTML(cat, isSelected) {
    return `
      <div class="hb-country-option ${isSelected ? 'hb-category-option--selected' : ''}" data-name="${cat.name}">
        <span>${cat.name}</span>
      </div>
    `;
  }

  async function renderCategoryList(panel, query) {
    const listEl = panel.querySelector('.hb-country-list');
    const { data } = await categoriesPromise;
    const enabled = (data ?? []).filter(c => c.enabled !== false);

    if (!enabled.length) {
      listEl.innerHTML = `<div class="hb-category-empty-note">${t('modal.addmovie.field.category_empty')}</div>`;
      return;
    }

    const q = query.trim().toLowerCase();
    const filtered = q ? enabled.filter(c => c.name.toLowerCase().includes(q)) : enabled;

    if (!filtered.length) {
      listEl.innerHTML = `<div class="hb-country-empty">${t('modal.addmovie.field.category_empty')}</div>`;
      return;
    }

    listEl.innerHTML = filtered.map(c => categoryOptionHTML(c, selectedCategories.includes(c.name))).join('');
    // Клик по опции не закрывает панель — можно отметить сразу несколько категорий подряд.
    listEl.querySelectorAll('.hb-country-option').forEach(opt => {
      opt.addEventListener('click', () => {
        toggleCategory(opt.dataset.name);
        opt.classList.toggle('hb-category-option--selected', selectedCategories.includes(opt.dataset.name));
      });
    });
  }

  function openCategoryPanel() {
    closeCategoryPanel();
    closeCountryPanel();
    const rect = categoryDropdown.getBoundingClientRect();

    const panel = document.createElement('div');
    panel.className = 'hb-country-panel';
    panel.style.left = rect.left + 'px';
    panel.style.width = rect.width + 'px';
    panel.innerHTML = `
      <div class="hb-country-search-wrap">
        <input type="text" class="hb-country-search" id="hb-category-search" placeholder="${t('modal.addmovie.field.category_search_ph')}" autocomplete="off">
      </div>
      <div class="hb-country-list"><div class="hb-category-empty-note">${t('loading')}</div></div>
    `;
    panel.addEventListener('click', (e) => e.stopPropagation());
    document.body.appendChild(panel);
    categoryPanelEl = panel;
    categoryTrigger.classList.add('hb-category-multi-trigger--open');
    positionFloatingPanel(panel, rect);

    renderCategoryList(panel, '');

    const searchInput = panel.querySelector('#hb-category-search');
    searchInput.addEventListener('input', () => renderCategoryList(panel, searchInput.value));
    setTimeout(() => searchInput.focus(), 30);

    setTimeout(() => {
      document.addEventListener('click', closeCategoryPanel, { once: true });
    }, 0);
  }

  categoryTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    categoryPanelEl ? closeCategoryPanel() : openCategoryPanel();
  });

  renderCategoryChipsInline();

  async function submit() {
    if (submitBtn.disabled) return;

    const title = titleInput.value.trim();
    // Бэк принимает жанр одним строковым полем (VARCHAR) — несколько выбранных жанров склеиваем через запятую.
    const genre = selectedGenres.join(', ');
    const country = selectedCountry;
    const category = selectedCategories.join(', ');
    const year  = yearSelect.value ? parseInt(yearSelect.value, 10) : null;

    let valid = true;
    if (!title) {
      titleInput.classList.add('hb-error');
      document.getElementById('hb-addmovie-title-error').textContent = t('modal.addmovie.field.title_err');
      valid = false;
    }
    if (!selectedGenres.length) {
      document.getElementById('hb-addmovie-genre-chips')?.classList.add('hb-error');
      document.getElementById('hb-addmovie-genre-error').textContent = t('modal.addmovie.field.genre_err');
      valid = false;
    }
    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = t('modal.addmovie.btn_loading');
    document.getElementById('hb-addmovie-global-error').textContent = '';

    const { data, error } = await addMovie({ title, genre, country, category, year });

    if (error) {
      document.getElementById('hb-addmovie-global-error').textContent = error;
      submitBtn.disabled = false;
      submitBtn.textContent = t('modal.addmovie.btn');
      return;
    }

    submitBtn.textContent = t('modal.addmovie.btn_success');
    onAdded?.(data);
    setTimeout(() => closeModal(), 700);
  }

  submitBtn.addEventListener('click', submit);
  titleInput.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });

  syncSubmit();
  persistState();
  setTimeout(() => titleInput.focus(), 80);

  // Если модалка скроллится (контент теперь выше max-height и скроллится внутри) — закрываем открытые
  // панели страны/категории, чтобы они не «отвязывались» от триггера — панели позиционированы
  // через position:fixed относительно viewport и не следуют за скроллом своего контейнера.
  content.addEventListener('scroll', () => {
    closeCountryPanel();
    closeCategoryPanel();
  });
}

let _addMovieModalOpening = false;

export function openAddMovieModal({ onAdded } = {}) {
  if (document.getElementById('hb-modal-overlay') || _addMovieModalOpening) return;

  injectModalCSS();
  injectAddMovieCSS();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="hb-modal-overlay">
      <div id="hb-modal-box" class="hb-add-movie-box">
        <button id="hb-modal-close" aria-label="${t('modal.close')}">×</button>
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
  mountAddMovieContent(content, {}, { onAdded });

  const unsub = onLangChange(() => {
    const overlay = document.getElementById('hb-modal-overlay');
    if (!overlay) { unsub(); return; }
    let restoredGenres = [];
    try { restoredGenres = JSON.parse(content.dataset.genres ?? '[]'); } catch { restoredGenres = []; }
    let restoredCategories = [];
    try { restoredCategories = JSON.parse(content.dataset.categories ?? '[]'); } catch { restoredCategories = []; }
    const state = {
      title:      content.dataset.title ?? '',
      year:       content.dataset.year ?? '',
      genres:     restoredGenres,
      country:    content.dataset.country ?? '',
      categories: restoredCategories,
    };
    mountAddMovieContent(content, state, { onAdded });
  });
}
