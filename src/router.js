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
import { renderSettings }     from './pages/Settings.js';
import { renderMovies }       from './pages/Movies.js';
import { renderProfile }      from './pages/Profile.js';
import { getAuthState, validateResetToken, confirmEmail } from './api/mock.js';
import { t } from './i18n/index.js';
import { showToast } from './components/Toast.js';
// TODO: раскомментируй когда создашь эти страницы:
// import { renderSearch }    from './pages/Search.js';
// import { renderDrama }     from './pages/Drama.js';

// ─── Маршруты ────────────────────────────────
const ROUTES = {
  '#/':         renderHome,
  '#/home':     renderHome,
  '#/guest':    renderUnauthorized,  // Публичная страница для незалогиненных
  '#/settings': renderSettings,
  '#/movies':   renderMovies,
  '#/profile':  renderProfile,
  // '#/search':   renderSearch,
  // '#/drama/:id':renderDrama,
};

// ─── Навигация ────────────────────────────────
export function navigate(path) {
  window.location.hash = path;
}

export function getCurrentRoute() {
  return window.location.hash || '#/';
}

export function getQueryParams() {
  const hash = window.location.hash || '';
  const qIndex = hash.indexOf('?');
  if (qIndex === -1) return {};
  return Object.fromEntries(new URLSearchParams(hash.slice(qIndex + 1)));
}

// ─── Принудительный ре-рендер текущего маршрута ──
// Используется после логина: хэш мог не измениться,
// поэтому hashchange не стреляет — вызываем render вручную.
export let forceRender = () => {}; // будет заменён внутри initRouter

// ─── Resolve маршрута с параметрами ───────────
function resolveRoute(hash) {
  const path = hash.split('?')[0];
  // Точное совпадение
  if (ROUTES[path]) return { handler: ROUTES[path], params: {} };

  // Параметрические маршруты (напр. #/drama/123)
  for (const [pattern, handler] of Object.entries(ROUTES)) {
    const paramNames = [];
    const regexStr = pattern.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    const match = path.match(new RegExp(`^${regexStr}$`));
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

    // Ссылка восстановления пароля из письма (#/reset-password?token=...) — не отдельная страница,
    // а модалка поверх главной. Перехватываем здесь, до resolveRoute.
    if (hash.startsWith('#/reset-password')) {
      await handleResetPasswordLink();
      return;
    }

    // Ссылка подтверждения email из письма после регистрации (#/confirm-email?token=...) —
    // тот же паттерн, что и у #/reset-password выше: не отдельная страница, а действие поверх главной.
    if (hash.startsWith('#/confirm-email')) {
      await handleConfirmEmailLink();
      return;
    }

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

  /**
   * Обрабатывает открытие ссылки восстановления из письма. Сначала тихо убираем ?token=... из адресной
   * строки (через history.replaceState — без hashchange, чтобы не спровоцировать второй render()
   * через событие), рендерим главную как обычно, и только потом поверх неё либо открываем
   * модалку смены пароля (токен валиден), либо показываем toast с ошибкой (протух/использован/нет токена).
   */
  async function handleResetPasswordLink() {
    const token = getQueryParams().token ?? '';

    history.replaceState(null, '', window.location.pathname + window.location.search + '#/');

    if (!token) {
      await render();
      showToast(t('reset.err_no_token'), 'error');
      return;
    }

    const { data, error } = await validateResetToken(token);
    await render();

    if (error) {
      showToast(error, 'error');
      return;
    }

    const { openResetPasswordModal } = await import('./components/ResetPasswordModal.js');
    openResetPasswordModal(token, data.email);
  }

  /**
   * Обрабатывает открытие ссылки подтверждения почты из письма — тот же паттерн, что и у
   * handleResetPasswordLink: сначала тихо убираем ?token=... из адресной строки (через history.replaceState —
   * без hashchange, чтобы не спровоцировать второй render() через событие), рендерим главную как обычно,
   * и только потом показываем тост с результатом подтверждения. В отличие от ссылки восстановления
   * пароля здесь нет отдельной модалки — токен одноразовый, повторный переход по ссылке всё равно вернёт
   * ошибку «уже использован» от бэка — это нормально, не показываем это как ошибку пользователю.
   */
  async function handleConfirmEmailLink() {
    const token = getQueryParams().token ?? '';

    history.replaceState(null, '', window.location.pathname + window.location.search + '#/');

    if (!token) {
      await render();
      showToast(t('confirm.err_no_token'), 'error');
      return;
    }

    const { error } = await confirmEmail(token);
    await render();

    if (error) {
      showToast(error, 'error');
      return;
    }

    showToast(t('confirm.success'), 'info');
    const { openLoginModal } = await import('./components/LoginModal.js');
    openLoginModal();
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
