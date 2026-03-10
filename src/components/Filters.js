/**
 * HANBIN — Filters Bar Component
 */

export function renderFilters(container, { activeFilter = 'all', onFilter }) {
  const statusFilters = [
    { id: 'all',       label: 'Все' },
    { id: 'watching',  label: '▶ Смотрю',      cls: 'status-watching' },
    { id: 'completed', label: '✓ Просмотрено',      cls: 'status-completed' },
    { id: 'plan',      label: 'Запланировано',    cls: 'status-plan' },
    { id: 'dropped',   label: 'Брошено',          cls: 'status-dropped' },
  ];

  const genreFilters = [
    { id: 'Romance', label: 'Романтика' },
    { id: 'Thriller', label: 'Триллер' },
    { id: 'Historical', label: 'Исторические' },
    { id: 'Fantasy', label: 'Фэнтези' },
  ];

  const countryFilters = [
    { id: 'kr', label: '🇰🇷 Корея' },
    { id: 'cn', label: '🇨🇳 Китай' },
    { id: 'jp', label: '🇯🇵 Япония' },
  ];

  container.innerHTML = `
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

  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      onFilter?.({ type: chip.dataset.type, value: chip.dataset.filter });
    });
  });
}
