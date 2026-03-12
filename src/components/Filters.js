/**
 * HANBIN — Filters Bar Component
 */

import { t, onLangChange } from '../i18n/index.js';

export function renderFilters(container, { activeFilter = 'all', onFilter }) {

  function buildFilters() {
    const statusFilters = [
      { id: 'all',       label: t('filter.all') },
      { id: 'watching',  label: t('filter.watching'),  cls: 'status-watching' },
      { id: 'completed', label: t('filter.completed'), cls: 'status-completed' },
      { id: 'plan',      label: t('filter.plan'),      cls: 'status-plan' },
      { id: 'dropped',   label: t('filter.dropped'),   cls: 'status-dropped' },
    ];

    const genreFilters = [
      { id: 'Romance',    label: t('filter.genre.romance') },
      { id: 'Thriller',   label: t('filter.genre.thriller') },
      { id: 'Historical', label: t('filter.genre.historical') },
      { id: 'Fantasy',    label: t('filter.genre.fantasy') },
    ];

    const countryFilters = [
      { id: 'kr', label: t('filter.country.kr') },
      { id: 'cn', label: t('filter.country.cn') },
      { id: 'jp', label: t('filter.country.jp') },
    ];

    return `
      <div class="filters-row">
        ${statusFilters.map(f => `
          <button class="filter-chip ${f.cls || ''} ${activeFilter === f.id ? 'active' : ''}"
                  data-filter="${f.id}" data-type="status">
            ${f.label}
          </button>
        `).join('')}

        <div class="filter-divider"></div>

        ${genreFilters.map(f => `
          <button class="filter-chip ${activeFilter === f.id ? 'active' : ''}"
                  data-filter="${f.id}" data-type="genre">
            ${f.label}
          </button>
        `).join('')}

        <div class="filter-divider"></div>

        ${countryFilters.map(f => `
          <button class="filter-chip ${activeFilter === f.id ? 'active' : ''}"
                  data-filter="${f.id}" data-type="country">
            ${f.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  function render() {
    container.innerHTML = buildFilters();
    container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.dataset.filter;
        onFilter?.({ type: chip.dataset.type, value: chip.dataset.filter });
      });
    });
  }

  render();
  onLangChange(() => render());
}
