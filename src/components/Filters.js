/**
 * HANBIN — Filters Bar Component
 *
 * Страны и жанры — динамические, приходят с бэка (getFacets(), см. api/mock.js)
 * и показывают только то, что реально есть в дорамах пользователя. Раньше тут
 * был хардкодный список (Корея/Китай/Япония, 4 жанра) — если у пользователя нет
 * ни одной дорамы из Японии, чип «Япония» всё равно показывался.
 *
 * Жанр — выпадающий список с чекбоксами (мультивыбор), а не плоский список чипов:
 * жанров может быть много (до 10), и выбор нескольких одновременно матчит любой из них (OR).
 */

import { t, onLangChange } from '../i18n/index.js';
import { getFacets } from '../api/mock.js';

const GENRE_KEY_MAP = {
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

export function renderFilters(container, { activeFilter = 'all', onFilter }) {
  // Если изначально передан массив (сохранённый выбор жанров) — восстанавливаем мультивыбор.
  let selectedGenres = Array.isArray(activeFilter) ? [...activeFilter] : [];
  let facets = { countries: [], genres: [] };
  let genreDropdownOpen = false;

  function genreLabel(g) {
    const key = GENRE_KEY_MAP[g];
    return key ? t(key) : g;
  }
  function countryLabel(c) {
    const key = COUNTRY_KEY_MAP[(c || '').toLowerCase()];
    return key ? t(key) : (c || '').toUpperCase();
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
      <button class="filter-chip ${f.cls || ''} ${activeFilter === f.id ? 'active' : ''}"
              data-filter="${f.id}" data-type="status">${f.label}</button>
    `).join('');
  }

  function buildGenreDropdown() {
    if (!facets.genres.length) return '';
    const count = selectedGenres.length;
    return `
      <div class="filter-divider"></div>
      <div class="genre-dropdown-wrap" id="genre-dropdown-wrap">
        <button class="filter-chip genre-dropdown-trigger ${count ? 'active' : ''}" id="genre-dropdown-trigger" type="button">
          ${t('filter.genre.label')}${count ? ` (${count})` : ''} <span class="genre-dropdown-caret">▾</span>
        </button>
        <div class="genre-dropdown-panel ${genreDropdownOpen ? '' : 'hidden'}" id="genre-dropdown-panel">
          ${facets.genres.map(g => `
            <label class="genre-checkbox-item">
              <input type="checkbox" value="${g}" ${selectedGenres.includes(g) ? 'checked' : ''}>
              <span>${genreLabel(g)}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  function buildCountryChips() {
    if (!facets.countries.length) return '';
    return `
      <div class="filter-divider"></div>
      ${facets.countries.map(c => `
        <button class="filter-chip ${activeFilter === c ? 'active' : ''}"
                data-filter="${c}" data-type="country">${countryLabel(c)}</button>
      `).join('')}
    `;
  }

  function render() {
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
    // Статус/страна — обычные взаимоисключающие чипы (как и раньше)
    container.querySelectorAll('.filter-chip[data-type="status"], .filter-chip[data-type="country"]').forEach(chip => {
      chip.addEventListener('click', () => {
        container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedGenres = [];
        const panel = container.querySelector('#genre-dropdown-panel');
        panel?.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
        activeFilter = chip.dataset.filter;
        onFilter?.({ type: chip.dataset.type, value: chip.dataset.filter });
      });
    });

    // Жанр — дропдаун с чекбоксами (мультивыбор)
    const trigger = container.querySelector('#genre-dropdown-trigger');
    const panel = container.querySelector('#genre-dropdown-panel');

    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      genreDropdownOpen = !genreDropdownOpen;
      panel?.classList.toggle('hidden', !genreDropdownOpen);
    });
    panel?.addEventListener('click', (e) => e.stopPropagation());

    panel?.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const value = cb.value;
        if (cb.checked) {
          if (!selectedGenres.includes(value)) selectedGenres.push(value);
        } else {
          selectedGenres = selectedGenres.filter(g => g !== value);
        }

        const count = selectedGenres.length;
        trigger.innerHTML = `${t('filter.genre.label')}${count ? ` (${count})` : ''} <span class="genre-dropdown-caret">▾</span>`;
        trigger.classList.toggle('active', count > 0);

        if (count === 0) {
          // Ничего не выбрано — возвращаемся к «Все»
          container.querySelectorAll('.filter-chip[data-type]').forEach(c =>
            c.classList.toggle('active', c.dataset.type === 'status' && c.dataset.filter === 'all'));
          activeFilter = 'all';
          onFilter?.({ type: 'status', value: 'all' });
        } else {
          container.querySelectorAll('.filter-chip[data-type="status"], .filter-chip[data-type="country"]')
            .forEach(c => c.classList.remove('active'));
          trigger.classList.add('active');
          activeFilter = [...selectedGenres];
          onFilter?.({ type: 'genre', value: [...selectedGenres] });
        }
      });
    });

    // Закрытие дропдауна по клику снаружи
    document.addEventListener('click', () => {
      if (genreDropdownOpen) {
        genreDropdownOpen = false;
        panel?.classList.add('hidden');
      }
    }, { once: true });
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
