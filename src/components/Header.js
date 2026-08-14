/**
 * HANBIN — Header Component
 */

import { navigate, getCurrentRoute } from '../router.js';
import { searchDramas, setViewMode, getAuthState } from '../api/mock.js';
import { debounce } from '../utils/helpers.js';
import { t, onLangChange } from '../i18n/index.js';
import { renderLangToggle } from './LangToggle.js';
import { getRoyalTitleKey } from '../utils/royalTitle.js';

// Миниатюрная SVG-корона для бейджа на аватаре — fill="currentColor", цвет задаётся модификатором класса (avatar-crown--free/plus/pro).
const CROWN_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18l1-9-5.5 4L12 6l-4.5 7L2 9l1 9z"/></svg>';

export async function renderHeader(container, { onSearch, onViewChange }) {
  // ── Начальное auth-состояние — берём ТОЛЬКО из localStorage, без похода в сеть. ──
  // Так шапка (лого, поиск, переключатель вида) отрисовывается сразу, не дожидаясь бэка.
  // Реальный /users/me (протух ли токен, актуальное имя) досчитывается ниже в фоне —
  // без блокировки первого рендера.
  const hasTokenLocally = !!localStorage.getItem('hanbin_token');
  let cachedUser = null;
  if (hasTokenLocally) {
    try { cachedUser = JSON.parse(localStorage.getItem('hanbin_user') || 'null'); } catch (_) { /* ignore */ }
  }
  // Важно: LoginModal.js сохраняет в hanbin_user только { id, email } — без name.
  // Без этого фоллбэка auth.user.name был undefined, и дальше buildHTML() падал на undefined.slice(),
  // из-за чего вся шапка молча не отрисовывалась вообще.
  const fallbackName = cachedUser?.name || cachedUser?.email || '···';
  let auth = hasTokenLocally
    ? { isLoggedIn: true, user: { ...cachedUser, name: fallbackName } }
    : { isLoggedIn: false, user: null };

  // Обращение — чисто клиентская настройка в localStorage (см. getHonorific/setHonorific в api/mock.js) — читаем напрямую, без аватара,
  // так же, как hasTokenLocally/currentMode выше — не блокирует первый рендер.
  const honorific = localStorage.getItem('hanbin_honorific') === 'lord' ? 'lord' : 'lady';

  // Тариф пока неизвестен (hanbin_user в localStorage хранит только id/email, без plan) — по дефолту считаем 'free',
  // реальный plan доедет с фоновым getAuthState() ниже и перерисует шапку, если отличается.

  // Храним текущий вид в мутабельной переменной — переживает перерендер при смене языка
  let currentMode = localStorage.getItem('hanbin_view_mode') || 'card';

  function buildHTML() {
    const mode = currentMode;
    // Табы «Дорамы/Фильмы» — подсвечиваем активный пункт по текущему роуту.
    // Шапка перерисовывается целиком на каждой странице (router.js), поэтому чтение хэша здесь всегда актуально.
    const currentHash = getCurrentRoute();
    const isMoviesRoute = currentHash === '#/movies';
    const avatarHTML = auth.isLoggedIn
      ? (() => {
          const plan = auth.user?.plan || 'free';
          const royalTitle = t(getRoyalTitleKey(plan, honorific));
          const isPaid = plan !== 'free'; // корона на аватаре — только для платных тарифов, чтобы быть визуально ценной привилегией, а не базовым атрибутом всех
          return `<div class="avatar-wrap" id="avatar-wrap">
          <div class="avatar avatar--logged-in" id="avatar-btn" data-tooltip="${t('header.tooltip.profile')}: ${auth.user.name} · ${royalTitle}">
            ${auth.user.name.slice(0, 2)}
            ${isPaid ? `<span class="avatar-crown avatar-crown--${plan}">${CROWN_SVG}</span>` : ''}
          </div>
          <div class="avatar-dropdown" id="avatar-dropdown">
            <div class="avatar-dropdown__user">
              <div class="avatar-dropdown__name">${auth.user.name}</div>
              <div class="avatar-dropdown__title">${CROWN_SVG} ${royalTitle}</div>
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
        </div>`;
        })()
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

        <nav class="header__nav">
          <a href="#/" class="nav-link ${isMoviesRoute ? '' : 'nav-link--active'}">${t('header.nav.dramas')}</a>
          <a href="#/movies" class="nav-link ${isMoviesRoute ? 'nav-link--active' : ''}">${t('header.nav.movies')}</a>
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

  // Полная перерисовка шапки (используется и при смене языка, и когда доедет
  // реальное auth-состояние с бэка) — сохраняем позицию скролла, если просят.
  function refreshHeader({ preserveScroll = false } = {}) {
    const scrollY = preserveScroll ? window.scrollY : null;
    langUnsub?.();
    container.innerHTML = buildHTML();
    langUnsub = renderLangToggle(container.querySelector('#lang-toggle-slot'));
    attachListeners();
    if (preserveScroll) window.scrollTo(0, scrollY);
  }

  // ── Re-render header on language change (nav links, placeholder, tagline…) ──
  onLangChange(() => refreshHeader({ preserveScroll: true }));

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
        currentMode = viewMode; // Сохраняем в closure — переживет перерендер при смене языка
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

  // ── Фоновая доводка авторизации ──
  // Шапка уже отрисована выше по localStorage. Если реальный ответ бэка
  // расходится (напр. токен протух, или имя изменилось) — перерисовываем
  // только тогда; если токена не было и сейчас нет — вообще не бьём по сети.
  if (hasTokenLocally) {
    getAuthState().then(({ data: realAuth }) => {
      const changed = realAuth.isLoggedIn !== auth.isLoggedIn ||
        (realAuth.user?.name ?? null) !== (auth.user?.name ?? null) ||
        (realAuth.user?.plan ?? 'free') !== (auth.user?.plan ?? 'free');
      auth = realAuth;
      if (changed && container.isConnected) refreshHeader();
    }).catch(() => { /* тихо игнорируем — шапка уже рабочая с локальным состоянием */ });
  }
}
