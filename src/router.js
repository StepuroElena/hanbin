/**
 * HANBIN — Router
 * Hash-based SPA router. Добавляй новые страницы сюда.
 *
 * Чтобы добавить страницу:
 * 1. Создай файл в src/pages/YourPage.js
 * 2. Зарегистрируй маршрут в ROUTES ниже
 */

import { renderHome }         from './pages/Home.js';
import { renderUnauthorized } from './pages/Unauthorized.js';
import { getAuthState }       from './api/mock.js';
// TODO: раскомментируй когда создашь эти страницы:
// import { renderSearch }    from './pages/Search.js';
// import { renderDrama }     from './pages/Drama.js';
// import { renderProfile }   from './pages/Profile.js';
// import { renderSettings }  from './pages/Settings.js';

// ─── Маршруты ────────────────────────────────
const ROUTES = {
  '#/':         renderHome,
  '#/home':     renderHome,
  '#/guest':    renderUnauthorized,  // Публичная страница для незалогиненных
  // '#/search':   renderSearch,
  // '#/drama/:id':renderDrama,
  // '#/profile':  renderProfile,
  // '#/settings': renderSettings,
};

// ─── Навигация ────────────────────────────────
export function navigate(path) {
  window.location.hash = path;
}

export function getCurrentRoute() {
  return window.location.hash || '#/';
}

// ─── Resolve маршрута с параметрами ───────────
function resolveRoute(hash) {
  // Точное совпадение
  if (ROUTES[hash]) return { handler: ROUTES[hash], params: {} };

  // Параметрические маршруты (напр. #/drama/123)
  for (const [pattern, handler] of Object.entries(ROUTES)) {
    const paramNames = [];
    const regexStr = pattern.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    const match = hash.match(new RegExp(`^${regexStr}$`));
    if (match) {
      const params = {};
      paramNames.forEach((name, i) => params[name] = match[i + 1]);
      return { handler, params };
    }
  }

  return { handler: renderHome, params: {} }; // fallback
}

// ─── Инициализация ───────────────────────────
export function initRouter(appEl) {
  async function render() {
    const hash = getCurrentRoute();
    let { handler, params } = resolveRoute(hash);

    // Если пользователь открыл корень (#/ или пустой хэш) — проверяем авторизацию
    if (hash === '#/' || hash === '#/home' || hash === '') {
      const { data: auth } = await getAuthState();
      if (!auth.isLoggedIn) handler = renderUnauthorized;
    }

    appEl.innerHTML = '<div class="page-enter"></div>';
    const pageEl = appEl.querySelector('.page-enter');

    try {
      await handler(pageEl, params);
    } catch (err) {
      console.error('[Router] Page render error:', err);
      pageEl.innerHTML = `<div class="container" style="padding-top:60px;text-align:center;color:var(--color-rose)">
        Something went wrong loading this page.
      </div>`;
    }
  }

  window.addEventListener('hashchange', render);
  render(); // initial render
}
