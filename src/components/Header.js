/**
 * HANBIN — Header Component
 */

import { navigate } from '../router.js';
import { searchDramas, setViewMode, getViewMode, getAuthState } from '../api/mock.js';
import { debounce } from '../utils/helpers.js';

export async function renderHeader(container, { onSearch, onViewChange }) {
  const [{ data: { mode } }, { data: auth }] = await Promise.all([
    getViewMode(),
    getAuthState(),
  ]);

  const avatarHTML = auth.isLoggedIn
    ? `<div class="avatar avatar--logged-in" id="avatar-btn" data-tooltip="Профиль: ${auth.user.name}">${auth.user.name.slice(0, 2)}</div>`
    : `<button class="avatar avatar--guest" id="avatar-btn" data-tooltip="Войти в аккаунт">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
      </button>`;

  container.innerHTML = `
    <header class="header">
      <div class="header__logo">
        <a href="#/" class="logo-link">
          <div class="logo-name">han<span>bin</span></div>
          <div class="logo-tagline">Трекер дорам</div>
        </a>
      </div>

      <nav class="header__nav hide-mobile">
        <a href="#/" class="nav-link nav-link--active">Главная</a>
        <a href="#/search" class="nav-link">Каталог</a>
        <a href="#/profile" class="nav-link">Мой список</a>
      </nav>

      <div class="header__right">
        <div class="search-bar" id="search-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" id="search-input" placeholder="Поиск дорам…" autocomplete="off">
          <div id="search-results" class="search-dropdown hidden"></div>
        </div>

        <div class="view-toggle">
          <button class="toggle-btn ${mode === 'card' ? 'active' : ''}" data-view="card" data-tooltip="Вид карточек">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button class="toggle-btn ${mode === 'table' ? 'active' : ''}" data-view="table" data-tooltip="Табличный вид">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        <button class="add-btn" id="add-drama-btn" data-tooltip="Добавить дораму">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        ${avatarHTML}
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
