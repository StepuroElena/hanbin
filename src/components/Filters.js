/**
 * HANBIN — Filters Bar Component
 */

export function renderFilters(container, { activeFilter = 'all', onFilter }) {
  const statusFilters = [
    { id: 'all',       label: 'All' },
    { id: 'watching',  label: '▶ Watching',      cls: 'status-watching' },
    { id: 'completed', label: '✓ Completed',      cls: 'status-completed' },
    { id: 'plan',      label: 'Plan to watch',    cls: 'status-plan' },
    { id: 'dropped',   label: 'Dropped',          cls: 'status-dropped' },
  ];

  const genreFilters = [
    { id: 'Romance', label: 'Romance' },
    { id: 'Thriller', label: 'Thriller' },
    { id: 'Historical', label: 'Historical' },
    { id: 'Fantasy', label: 'Fantasy' },
  ];

  const countryFilters = [
    { id: 'kr', label: '🇰🇷 Korea' },
    { id: 'cn', label: '🇨🇳 China' },
    { id: 'jp', label: '🇯🇵 Japan' },
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
