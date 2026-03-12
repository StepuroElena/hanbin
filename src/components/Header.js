/**
 * HANBIN — Header Component
 */

import { navigate } from '../router.js';
import { searchDramas, setViewMode, getViewMode, getAuthState } from '../api/mock.js';
import { debounce } from '../utils/helpers.js';
import { t, onLangChange } from '../i18n/index.js';
import { renderLangToggle } from './LangToggle.js';

export async function renderHeader(container, { onSearch, onViewChange }) {
  const [{ data: { mode } }, { data: auth }] = await Promise.all([
    getViewMode(),
    getAuthState(),
  ]);

  function buildHTML() {
    const avatarHTML = auth.isLoggedIn
      ? `<div class="avatar-wrap" id="avatar-wrap">
          <div class="avatar avatar--logged-in" id="avatar-btn" data-tooltip="${t('header.tooltip.profile')}: ${auth.user.name}">${auth.user.name.slice(0, 2)}</div>
          <div class="avatar-dropdown" id="avatar-dropdown">
            <div class="avatar-dropdown__user">
              <div class="avatar-dropdown__name">${auth.user.name}</div>
              <div class="avatar-dropdown__label">Drama Queen · 73 дорамы</div>
            </div>
            <button class="avatar-dropdown__btn" id="dropdown-profile-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              ${t('header.dropdown.profile')}
            </button>
            <button class="avatar-dropdown__btn" id="dropdown-settings-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
              ${t('header.dropdown.settings')}
            </button>
            <button class="avatar-dropdown__btn avatar-dropdown__btn--logout" id="dropdown-logout-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              ${t('header.dropdown.logout')}
            </button>
          </div>
        </div>`
      : `<button class="avatar avatar--guest" id="avatar-btn" data-tooltip="${t('header.tooltip.login')}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </button>`;

    return `
      <header class="header">
        <div class="header__logo">
          <a href="#/" class="logo-link">
            <div class="logo-name">han<span>bin</span></div>
            <div class="logo-tagline">${t('header.tagline')}</div>
          </a>
        </div>

        <nav class="header__nav hide-mobile">
          <a href="#/" class="nav-link nav-link--active">${t('header.nav.home')}</a>
          <a href="#/search" class="nav-link">${t('header.nav.catalog')}</a>
          <a href="#/profile" class="nav-link">${t('header.nav.my_list')}</a>
        </nav>

        <div class="header__right">
          <div class="search-bar" id="search-bar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" id="search-input" placeholder="${t('header.search_placeholder')}" autocomplete="off">
            <div id="search-results" class="search-dropdown hidden"></div>
          </div>

          <div class="view-toggle">
            <button class="toggle-btn ${mode === 'card' ? 'active' : ''}" data-view="card" data-tooltip="${t('header.tooltip.card_view')}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button class="toggle-btn ${mode === 'table' ? 'active' : ''}" data-view="table" data-tooltip="${t('header.tooltip.table_view')}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>

          <div id="lang-toggle-slot"></div>

          <button class="add-btn" id="add-drama-btn" data-tooltip="${t('header.tooltip.add')}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>

          ${avatarHTML}
        </div>
      </header>
    `;
  }

  // ── Initial render ──
  container.innerHTML = buildHTML();
  let langUnsub = renderLangToggle(container.querySelector('#lang-toggle-slot'));

  // ── Re-render header on language change (nav links, placeholder, tagline…) ──
  onLangChange(async () => {
    // Save scroll position
    const scrollY = window.scrollY;
    // Tear down previous lang toggle subscription
    langUnsub?.();
    container.innerHTML = buildHTML();
    langUnsub = renderLangToggle(container.querySelector('#lang-toggle-slot'));
    attachListeners();
    window.scrollTo(0, scrollY);
  });

  function attachListeners() {
    // ── Search ──
    const searchInput    = container.querySelector('#search-input');
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
        searchDropdown.innerHTML = `<div class="search-empty">${t('header.search_not_found', { q })}</div>`;
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
      if (!container.querySelector('#search-bar')?.contains(e.target)) {
        searchDropdown?.classList.add('hidden');
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
      import('./AddDramaModal.js').then(({ openAddDramaModal }) => {
        openAddDramaModal();
      });
    });

    // ── Avatar dropdown ──
    const avatarBtn      = container.querySelector('#avatar-btn');
    const avatarDropdown = container.querySelector('#avatar-dropdown');

    if (avatarDropdown) {
      // Открыть/закрыть по клику на аватар
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        avatarDropdown.classList.toggle('avatar-dropdown--open');
      });

      // Закрыть при клике вне дропдауна
      document.addEventListener('click', () => {
        avatarDropdown.classList.remove('avatar-dropdown--open');
      });

      // Не закрывать при клике внутри дропдауна
      avatarDropdown.addEventListener('click', (e) => e.stopPropagation());

      // Перейти в профиль
      container.querySelector('#dropdown-profile-btn')?.addEventListener('click', () => {
        avatarDropdown.classList.remove('avatar-dropdown--open');
        navigate('#/profile');
      });

      // Перейти в настройки
      container.querySelector('#dropdown-settings-btn')?.addEventListener('click', () => {
        avatarDropdown.classList.remove('avatar-dropdown--open');
        navigate('#/settings');
      });

      // Логаут (TODO: подключить к бэку позже)
      container.querySelector('#dropdown-logout-btn')?.addEventListener('click', () => {
        avatarDropdown.classList.remove('avatar-dropdown--open');
        localStorage.removeItem('hanbin_user');
        localStorage.removeItem('hanbin_token');
        navigate('#/guest');
      });

    } else {
      // Гость — переходим на логин
      avatarBtn?.addEventListener('click', () => navigate('#/guest'));
    }
  }

  attachListeners();
}
