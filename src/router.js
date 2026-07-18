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

// ─── Принудительный ре-рендер текущего маршрута ──
// Используется после логина: хэш мог не измениться,
// поэтому hashchange не стреляет — вызываем render вручную.
export let forceRender = () => {}; // будет заменён внутри initRouter

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
// ─── Сохранение/восстановление позиции скролла ───
const SCROLL_KEY_PREFIX = 'hanbin_scroll_';

function saveScroll(hash) {
  try { sessionStorage.setItem(SCROLL_KEY_PREFIX + hash, String(window.scrollY)); } catch (_) { /* ignore */ }
}

function readSavedScroll(hash) {
  try {
    const v = sessionStorage.getItem(SCROLL_KEY_PREFIX + hash);
    return v ? Number(v) : 0;
  } catch (_) { return 0; }
}

function restoreScroll(hash) {
  const target = readSavedScroll(hash);
  if (!target) return;

  let attempts = 0;
  const maxAttempts = 20;

  const tryScroll = () => {
    attempts++;
    const maxScrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScrollable >= target || attempts >= maxAttempts) {
      window.scrollTo(0, target);
      return;
    }
    setTimeout(tryScroll, 100);
  };

  tryScroll();
}

export function initRouter(appEl) {
  const isHomeHash = (hash) => hash === '#/' || hash === '#/home' || hash === '';

  // Быстрая синхронная проверка по localStorage — НЕ бьёт по сети,
  // поэтому не блокирует первую отрисовку. Реальная валидность токена
  // (протух ли он, отвечает ли бэк) проверяется отдельно, в фоне.
  const hasTokenLocally = () => !!localStorage.getItem('hanbin_token');

  // Сохраняем скролл непрерывно, пока пользователь листает — на случай рефреша/закрытия вкладки.
  let scrollSaveScheduled = false;
  window.addEventListener('scroll', () => {
    if (scrollSaveScheduled) return;
    scrollSaveScheduled = true;
    requestAnimationFrame(() => {
      saveScroll(getCurrentRoute());
      scrollSaveScheduled = false;
    });
  }, { passive: true });
  window.addEventListener('beforeunload', () => saveScroll(getCurrentRoute()));

  // Восстанавливаем скролл только на самом первом рендере после загрузки/рефреша.
  // Обычная SPA-навигация (hashchange) по-прежнему уходит вверх.
  let isFirstRenderAfterLoad = true;

  async function render() {
    const hash = getCurrentRoute();
    let { handler, params } = resolveRoute(hash);

    if (isHomeHash(hash)) {
      handler = hasTokenLocally() ? renderHome : renderUnauthorized;
    }

    // Красим страницу сразу — до всякого обращения к бэку.
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

    // Фоновая валидация сессии: если токен есть, но бэк говорит, что он
    // невалиден (протух/отозван) — тихо переключаемся на гостевую страницу.
    // Не блокирует и не задерживает то, что уже отрисовано выше.
    if (isHomeHash(hash) && hasTokenLocally()) {
      validateSessionInBackground(pageEl, hash);
    }

    if (isFirstRenderAfterLoad) {
      isFirstRenderAfterLoad = false;
      restoreScroll(hash);
    }
  }

  async function validateSessionInBackground(pageEl, hashAtRenderTime) {
    try {
      const { data: auth } = await getAuthState();
      // Если пока ждали ответ бэка пользователь успел уйти с этой страницы
      // или страница уже перерисована — ничего не трогаем.
      if (!pageEl.isConnected || getCurrentRoute() !== hashAtRenderTime) return;
      if (!auth.isLoggedIn) {
        pageEl.innerHTML = '';
        await renderUnauthorized(pageEl, {});
      }
    } catch (err) {
      console.warn('[Router] Background session check failed:', err);
    }
  }

  // Привязываем forceRender к локальному render
  forceRender = render;

  window.addEventListener('hashchange', render);
  render(); // initial render
}
