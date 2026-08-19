/**
 * HANBIN — Filters Bar Component
 *
 * Статус — единственный выбор (эксклюзивный, «Все» снимает фильтр по статусу).
 * Жанр и страна — независимый мультивыбор каждый (можно выбрать сразу Корею и Китай,
 * или сразу Драму и Мистику) — внутри группы это ИЛИ, между группами (статус/жанр/страна) — И.
 * Например: статус «Смотрю» + страна [Корея, Китай] + жанр [Драма] покажет дорамы
 * в статусе «Смотрю», из Кореи ИЛИ Китая, с жанром Драма.
 *
 * Страны и жанры — динамические, приходят с бэка (getFacets(), см. api/mock.js)
 * и показывают только то, что реально есть в дорамах пользователя.
 */

import { t, onLangChange } from '../i18n/index.js';
import { getFacets } from '../api/mock.js';

export const GENRE_KEY_MAP = {
  Romance: 'modal.add.genres.romance',
  Thriller: 'modal.add.genres.thriller',
  Historical: 'modal.add.genres.historical',
  Fantasy: 'modal.add.genres.fantasy',
  Comedy: 'modal.add.genres.comedy',
  Drama: 'modal.add.genres.drama',
  Action: 'modal.add.genres.action',
  Mystery: 'modal.add.genres.mystery',
  Horror: 'modal.add.genres.horror',
  Documentary: 'modal.add.genres.documentary',
};

const COUNTRY_KEY_MAP = {
  kr: 'modal.add.country.kr',
  cn: 'modal.add.country.cn',
  jp: 'modal.add.country.jp',
  other: 'modal.add.country.other',
};

/**
 * @param {HTMLElement} container
 * @param {{ activeFilter?: { status?: string, genre?: string[], country?: string[] },
 *           onFilter?: (filters: { status: string, genre: string[], country: string[] }) => void }} opts
 */
export function renderFilters(container, { activeFilter = {}, onFilter }) {
  let activeStatus = activeFilter.status ?? 'all';
  let selectedGenres = Array.isArray(activeFilter.genre) ? [...activeFilter.genre] : [];
  let selectedCountries = Array.isArray(activeFilter.country) ? [...activeFilter.country] : [];
  let facets = { countries: [], genres: [] };

  // Плавающая панель жанров — как и остальные floating-меню в приложении, живёт в document.body
  // с position:fixed, а не внутри .filters-row — иначе её могло перекрывать sticky-шапкой таблицы
  // (тут разные ветки DOM, и локальный z-index внутри .filters-row против этого не спасает).
  let genrePanelEl = null;

  function genreLabel(g) {
    const key = GENRE_KEY_MAP[g];
    return key ? t(key) : g;
  }
  function countryLabel(c) {
    const key = COUNTRY_KEY_MAP[(c || '').toLowerCase()];
    return key ? t(key) : (c || '').toUpperCase();
  }

  function emit() {
    onFilter?.({ status: activeStatus, genre: [...selectedGenres], country: [...selectedCountries] });
  }

  function closeGenrePanel() {
    genrePanelEl?.remove();
    genrePanelEl = null;
    container.querySelector('#genre-dropdown-trigger')?.classList.remove('genre-dropdown-trigger--open');
  }

  function openGenrePanel(trigger) {
    closeGenrePanel();
    const rect = trigger.getBoundingClientRect();

    const panel = document.createElement('div');
    panel.className = 'genre-dropdown-panel';
    panel.style.left = rect.left + 'px';
    panel.style.top = (rect.bottom + 8) + 'px';
    panel.innerHTML = facets.genres.map(g => `
      <label class="genre-checkbox-item">
        <input type="checkbox" value="${g}" ${selectedGenres.includes(g) ? 'checked' : ''}>
        <span>${genreLabel(g)}</span>
      </label>
    `).join('');
    panel.addEventListener('click', (e) => e.stopPropagation()); // клик внутри не должен закрывать панель

    panel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const value = cb.value;
        if (cb.checked) {
          if (!selectedGenres.includes(value)) selectedGenres.push(value);
        } else {
          selectedGenres = selectedGenres.filter(g => g !== value);
        }
        updateGenreTriggerLabel();
        emit();
      });
    });

    document.body.appendChild(panel);
    genrePanelEl = panel;
    trigger.classList.add('genre-dropdown-trigger--open');

    setTimeout(() => {
      document.addEventListener('click', closeGenrePanel, { once: true });
    }, 0);
  }

  function updateGenreTriggerLabel() {
    const trigger = container.querySelector('#genre-dropdown-trigger');
    if (!trigger) return;
    const count = selectedGenres.length;
    trigger.innerHTML = `${t('filter.genre.label')}${count ? ` (${count})` : ''} <span class="genre-dropdown-caret">▾</span>`;
    trigger.classList.toggle('active', count > 0);
  }

  function buildStatusChips() {
    const statusFilters = [
      { id: 'all', label: t('filter.all') },
      { id: 'watching', label: t('filter.watching'), cls: 'status-watching' },
      { id: 'completed', label: t('filter.completed'), cls: 'status-completed' },
      { id: 'plan', label: t('filter.plan'), cls: 'status-plan' },
      { id: 'dropped', label: t('filter.dropped'), cls: 'status-dropped' },
    ];
    return statusFilters.map(f => `
      <button class="filter-chip ${f.cls || ''} ${activeStatus === f.id ? 'active' : ''}"
              data-filter="${f.id}" data-type="status">${f.label}</button>
    `).join('');
  }

  function buildGenreDropdown() {
    if (!facets.genres.length) return '';
    const count = selectedGenres.length;
    return `
      <div class="filter-divider"></div>
      <button class="filter-chip genre-dropdown-trigger ${count ? 'active' : ''}" id="genre-dropdown-trigger" type="button">
        ${t('filter.genre.label')}${count ? ` (${count})` : ''} <span class="genre-dropdown-caret">▾</span>
      </button>
    `;
  }

  // Страна — такой же мультивыбор, как жанр (просто чипы, без дропдауна, т.к. вариантов немного) —
  // клик по чипу переключает ЕЁ ОДНУ, не трогая остальные выбранные страны.
  function buildCountryChips() {
    if (!facets.countries.length) return '';
    return `
      <div class="filter-divider"></div>
      ${facets.countries.map(c => `
        <button class="filter-chip ${selectedCountries.includes(c) ? 'active' : ''}"
                data-filter="${c}" data-type="country">${countryLabel(c)}</button>
      `).join('')}
    `;
  }

  function render() {
    closeGenrePanel();
    container.innerHTML = `
      <div class="filters-row">
        ${buildStatusChips()}
        ${buildGenreDropdown()}
        ${buildCountryChips()}
      </div>
    `;
    attachEvents();
  }

  function attachEvents() {
    // Статус — эксклюзивно среди статусов (один активен), не трогает жанр/страну.
    container.querySelectorAll('.filter-chip[data-type="status"]').forEach(chip => {
      chip.addEventListener('click', () => {
        activeStatus = chip.dataset.filter;
        container.querySelectorAll('.filter-chip[data-type="status"]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        emit();
      });
    });

    // Страна — мультивыбор (как жанр): клик переключает только свою страну, остальные не трогает.
    container.querySelectorAll('.filter-chip[data-type="country"]').forEach(chip => {
      chip.addEventListener('click', () => {
        const code = chip.dataset.filter;
        if (selectedCountries.includes(code)) {
          selectedCountries = selectedCountries.filter(c => c !== code);
          chip.classList.remove('active');
        } else {
          selectedCountries.push(code);
          chip.classList.add('active');
        }
        emit();
      });
    });

    // Жанр — плавающая панель с чекбоксами (мультивыбор), см. openGenrePanel/closeGenrePanel выше.
    const genreTrigger = container.querySelector('#genre-dropdown-trigger');
    genreTrigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (genrePanelEl) { closeGenrePanel(); } else { openGenrePanel(genreTrigger); }
    });
  }

  async function init() {
    render(); // статус-чипы сразу, без ожидания бэка
    const { data } = await getFacets();
    facets = data ?? { countries: [], genres: [] };
    render(); // дорисовываем жанры/страны, когда пришли реальные данные
  }

  init();
  onLangChange(() => render());
}
