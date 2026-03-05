/**
 * HANBIN — Header Component
 */

import { navigate } from '../router.js';
import { searchDramas, setViewMode, getViewMode } from '../api/mock.js';
import { debounce } from '../utils/helpers.js';

export async function renderHeader(container, { onSearch, onViewChange }) {
  const { data: { mode } } = await getViewMode();

  container.innerHTML = `
    <header class="header">
      <div class="header__logo">
        <a href="#/" class="logo-link">
          <div class="logo-name">han<span>bin</span></div>
          <div class="logo-tagline">Drama Tracker</div>
        </a>
      </div>

      <nav class="header__nav hide-mobile">
        <a href="#/" class="nav-link nav-link--active">Home</a>
        <a href="#/search" class="nav-link">Discover</a>
        <a href="#/profile" class="nav-link">My List</a>
      </nav>

      <div class="header__right">
        <div class="search-bar" id="search-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" id="search-input" placeholder="Search dramas…" autocomplete="off">
          <div id="search-results" class="search-dropdown hidden"></div>
        </div>

        <div class="view-toggle">
          <button class="toggle-btn ${mode === 'card' ? 'active' : ''}" data-view="card" title="Card view">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button class="toggle-btn ${mode === 'table' ? 'active' : ''}" data-view="table" title="Table view">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        <button class="add-btn" id="add-drama-btn" title="Add drama">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        <div class="avatar" id="avatar-btn">소</div>
      </div>
    </header>
  `;

  // ── Search ──
  const searchInput = container.querySelector('#search-input');
  const searchDropdown = container.querySelector('#search-results');

  const handleSearch = debounce(async (q) => {
    if (!q.trim()) {
      searchDropdown.classList.add('hidden');
      onSearch?.('');
      return;
    }
    const { data } = await searchDramas(q);
    onSearch?.(q, data);

    if (data.length === 0) {
      searchDropdown.innerHTML = `<div class="search-empty">Nothing found for "${q}"</div>`;
    } else {
      searchDropdown.innerHTML = data.slice(0, 5).map(d => `
        <div class="search-item" data-id="${d.id}">
          <img src="${d.cover}" alt="${d.title}" class="search-item__thumb">
          <div>
            <div class="search-item__title">${d.title}</div>
            <div class="search-item__meta">${d.year} · ${d.genres[0]}</div>
          </div>
          <span class="badge badge--${d.status}">${d.status}</span>
        </div>
      `).join('');
    }
    searchDropdown.classList.remove('hidden');
  }, 250);

  searchInput.addEventListener('input', e => handleSearch(e.target.value));

  document.addEventListener('click', (e) => {
    if (!container.querySelector('#search-bar').contains(e.target)) {
      searchDropdown.classList.add('hidden');
    }
  });

  // ── View toggle ──
  container.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      container.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const viewMode = btn.dataset.view;
      await setViewMode(viewMode);
      onViewChange?.(viewMode);
    });
  });

  // ── Add drama ──
  container.querySelector('#add-drama-btn').addEventListener('click', () => {
    // TODO: открыть модал добавления дорамы
    console.log('[UI] Add drama clicked — TODO: open modal');
    alert('Форма добавления дорамы — TODO: подключить к бэку 🌸');
  });

  // ── Avatar / Profile ──
  container.querySelector('#avatar-btn').addEventListener('click', () => {
    navigate('#/profile');
  });
}
