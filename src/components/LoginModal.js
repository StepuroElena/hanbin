/**
 * HANBIN — Login Modal Component
 */

import { t, onLangChange } from '../i18n/index.js';
import { loginUser } from '../api/mock.js';

// ─── CSS ─────────────────────────────────────
const MODAL_CSS = `
  @keyframes hb-fadeIn     { from{opacity:0} to{opacity:1} }
  @keyframes hb-fadeOut    { from{opacity:1} to{opacity:0} }
  @keyframes hb-slideUp    { from{opacity:0;transform:translateY(28px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes hb-slideLeft  { from{opacity:1;transform:translateX(0)}  to{opacity:0;transform:translateX(-40px)} }
  @keyframes hb-slideRight { from{opacity:1;transform:translateX(0)}  to{opacity:0;transform:translateX(40px)} }
  @keyframes hb-enterLeft  { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes hb-enterRight { from{opacity:0;transform:translateX(40px)}  to{opacity:1;transform:translateX(0)} }

  #hb-modal-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(18,6,18,0.78);
    backdrop-filter: blur(14px);
    display: flex; align-items: center; justify-content: center;
    animation: hb-fadeIn 0.25s ease;
  }
  #hb-modal-overlay.hb-closing {
    animation: hb-fadeOut 0.22s ease forwards;
    pointer-events: none;
  }

  #hb-modal-box {
    width: 420px;
    border-radius: 24px;
    background: linear-gradient(145deg, rgba(74,25,66,0.96), rgba(45,15,42,0.99));
    border: 1px solid rgba(201,123,138,0.28);
    box-shadow: 0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,123,138,0.07);
    position: relative; overflow: hidden;
    animation: hb-slideUp 0.32s cubic-bezier(0.34,1.56,0.64,1);
  }

  #hb-modal-content {
    padding: 44px 40px 40px; position: relative;
  }
  #hb-modal-content.hb-exit-left  { animation: hb-slideLeft  0.22s ease forwards; pointer-events:none; }
  #hb-modal-content.hb-exit-right { animation: hb-slideRight 0.22s ease forwards; pointer-events:none; }
  #hb-modal-content.hb-enter-left  { animation: hb-enterLeft  0.28s cubic-bezier(0.34,1.26,0.64,1) both; }
  #hb-modal-content.hb-enter-right { animation: hb-enterRight 0.28s cubic-bezier(0.34,1.26,0.64,1) both; }

  #hb-modal-box::before {
    content: ''; position: absolute; top: -60px; right: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,123,138,0.16), transparent 70%);
    pointer-events: none; transition: background 0.4s ease;
  }
  #hb-modal-box.hb-theme-register::before {
    background: radial-gradient(circle, rgba(122,171,142,0.14), transparent 70%);
  }
  #hb-modal-box::after {
    content: '✦'; position: absolute; bottom: 14px; right: 22px;
    font-size: 52px; color: rgba(201,123,138,0.07); pointer-events: none;
  }

  #hb-modal-close {
    position: absolute; top: 16px; right: 16px; z-index: 10;
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(232,196,184,0.15);
    color: rgba(245,230,211,0.45);
    font-size: 18px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  #hb-modal-close:hover {
    color: #f5e6d3; border-color: rgba(201,123,138,0.45);
    background: rgba(201,123,138,0.1);
  }

  .hb-modal-logo { width: 44px; height: 44px; margin-bottom: 16px; border-radius: 10px; display: block; }

  .hb-modal-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px; font-weight: 300; font-style: italic;
    color: #f5e6d3; letter-spacing: 0.02em; margin-bottom: 6px;
  }
  .hb-modal-sub {
    font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(245,230,211,0.38); margin-bottom: 32px;
  }

  .hb-field { margin-bottom: 10px; }
  .hb-field-label {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
    color: rgba(245,230,211,0.4); margin-bottom: 8px;
  }
  .hb-required { color: #ff6b8a; }
  .hb-counter {
    font-size: 10px; color: rgba(245,230,211,0.22);
    letter-spacing: 0; text-transform: none; transition: color 0.2s;
  }
  .hb-counter.warn { color: rgba(255,107,138,0.75); }

  .hb-field-input {
    width: 100%; padding: 13px 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(232,196,184,0.18);
    border-radius: 12px; color: #f5e6d3;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }
  .hb-field-input::placeholder { color: rgba(245,230,211,0.22); }
  .hb-field-input:focus {
    border-color: rgba(201,123,138,0.55);
    box-shadow: 0 0 0 3px rgba(201,123,138,0.08);
  }
  .hb-field-input.hb-error {
    border-color: rgba(255,107,138,0.6);
    box-shadow: 0 0 0 3px rgba(255,107,138,0.07);
  }
  .hb-field-error { margin-top: 5px; font-size: 11px; color: #ff6b8a; min-height: 16px; }

  .hb-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0 14px; }
  .hb-divider-line { flex: 1; height: 1px; background: rgba(232,196,184,0.1); }
  .hb-divider-text { font-size: 11px; color: rgba(245,230,211,0.25); letter-spacing: 0.1em; }

  .hb-btn-primary {
    width: 100%; padding: 14px; margin-bottom: 4px;
    border: none; border-radius: 12px; color: #fff;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    transition: opacity 0.2s, transform 0.2s, background 0.25s;
  }
  .hb-btn-primary:disabled {
    background: rgba(255,255,255,0.08); color: rgba(245,230,211,0.3);
    cursor: not-allowed; transform: none !important;
  }
  .hb-btn-primary:not(:disabled) {
    background: linear-gradient(135deg, #c97b8a, #ff6b8a); cursor: pointer;
  }
  .hb-btn-primary:not(:disabled):hover { opacity: 0.87; transform: translateY(-1px); }
  .hb-btn-primary:not(:disabled):active { transform: translateY(0); }

  .hb-btn-secondary {
    width: 100%; padding: 13px; background: transparent;
    border: 1px solid rgba(201,123,138,0.3); border-radius: 12px; color: #c97b8a;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer; transition: all 0.2s;
  }
  .hb-btn-secondary:hover {
    border-color: rgba(201,123,138,0.6); background: rgba(201,123,138,0.08);
  }
`;

// ─── Логотип SVG ──────────────────────────────
const LOGO_SVG = `
  <svg class="hb-modal-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <defs>
      <linearGradient id="hb-logo-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d1238"/>
        <stop offset="100%" stop-color="#2d0f2a"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="7" fill="url(#hb-logo-bg)"/>
    <rect x="4" y="6" width="2.5" height="20" rx="1" fill="#f5e6d3"/>
    <path d="M6.5 14 Q10 10 13.5 14 L13.5 26 L11 26 L11 15.5 Q10 13.5 6.5 15.5Z" fill="#f5e6d3"/>
    <rect x="17" y="6" width="2.5" height="20" rx="1" fill="#c97b8a" transform="skewX(-4)"/>
    <path d="M19.5 15.5 Q25 14 25 19 Q25 24.5 19.5 24.5 L19.5 22.5 Q23 22.5 23 19 Q23 16.5 19.5 17Z" fill="#c97b8a" transform="skewX(-4)"/>
  </svg>
`;

function injectModalCSS() {
  if (document.getElementById('hb-modal-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-modal-css';
  style.textContent = MODAL_CSS;
  document.head.appendChild(style);
}

function createOverlayHTML() {
  return `
    <div id="hb-modal-overlay">
      <div id="hb-modal-box">
        <button id="hb-modal-close" aria-label="${t('modal.close')}">×</button>
        <div id="hb-modal-content"></div>
      </div>
    </div>
  `;
}

// ─── HTML контента логина (i18n-aware) ────────
function loginContentHTML() {
  return `
    ${LOGO_SVG}
    <div class="hb-modal-title">${t('modal.login.title')}</div>
    <div class="hb-modal-sub">${t('modal.login.sub')}</div>

    <div class="hb-field">
      <div class="hb-field-label">
        <span>${t('modal.login.email')} <span class="hb-required">*</span></span>
        <span class="hb-counter" id="hb-email-counter">0 / 80</span>
      </div>
      <input class="hb-field-input" id="hb-email" type="email"
        placeholder="${t('modal.login.email_ph')}" maxlength="80" autocomplete="email">
      <div class="hb-field-error" id="hb-email-error"></div>
    </div>

    <div class="hb-field">
      <div class="hb-field-label">
        <span>${t('modal.login.password')} <span class="hb-required">*</span></span>
        <span class="hb-counter" id="hb-pass-counter">0 / 64</span>
      </div>
      <input class="hb-field-input" id="hb-pass" type="password"
        placeholder="${t('modal.login.pass_ph')}" maxlength="64" autocomplete="current-password">
      <div class="hb-field-error" id="hb-pass-error"></div>
    </div>

    <button class="hb-btn-primary" id="hb-btn-login" disabled>${t('modal.login.btn')}</button>

    <div class="hb-divider">
      <div class="hb-divider-line"></div>
      <span class="hb-divider-text">${t('modal.login.or')}</span>
      <div class="hb-divider-line"></div>
    </div>

    <button class="hb-btn-secondary" id="hb-btn-register">${t('modal.login.to_register')}</button>
  `;
}

// ─── Плавный переход контента ─────────────────
export function transitionModalContent(direction, renderFn) {
  const content = document.getElementById('hb-modal-content');
  const box     = document.getElementById('hb-modal-box');
  if (!content) return;

  const exitClass   = direction === 'left' ? 'hb-exit-left'  : 'hb-exit-right';
  const enterClass  = direction === 'left' ? 'hb-enter-right' : 'hb-enter-left';
  const exitAnim    = direction === 'left' ? 'hb-slideLeft'   : 'hb-slideRight';

  if (direction === 'left') box.classList.add('hb-theme-register');
  else                       box.classList.remove('hb-theme-register');

  content.classList.add(exitClass);

  const onEnd = (e) => {
    if (e.animationName !== exitAnim) return; // игнорируем чужие animationend
    content.removeEventListener('animationend', onEnd);
    content.classList.remove(exitClass);
    renderFn(content, enterClass);
  };

  content.addEventListener('animationend', onEnd);

  // Фолбэк: если анимация вдруг не сработала (hidden, reduced-motion и т.д.)
  setTimeout(() => {
    if (!content.classList.contains(exitClass)) return; // уже сработало
    content.removeEventListener('animationend', onEnd);
    content.classList.remove(exitClass);
    renderFn(content, enterClass);
  }, 400);
}

// ─── Логика формы логина ──────────────────────
function syncLoginButton() {
  const email = document.getElementById('hb-email')?.value.trim();
  const pass  = document.getElementById('hb-pass')?.value.trim();
  const btn   = document.getElementById('hb-btn-login');
  if (btn) btn.disabled = !(email && pass);
}

function updateCounter(inputId, counterId, max, errorId) {
  const val     = document.getElementById(inputId)?.value ?? '';
  const counter = document.getElementById(counterId);
  if (!counter) return;
  counter.textContent = `${val.length} / ${max}`;
  counter.classList.toggle('warn', val.length > max * 0.88);
  document.getElementById(inputId)?.classList.remove('hb-error');
  const errEl = document.getElementById(errorId);
  if (errEl) errEl.textContent = '';
  syncLoginButton();
}

async function validateAndLogin() {
  const btn = document.getElementById('hb-btn-login');
  if (!btn || btn.disabled) return;

  const emailEl = document.getElementById('hb-email');
  const passEl  = document.getElementById('hb-pass');

  // Клиентская валидация email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    emailEl.classList.add('hb-error');
    document.getElementById('hb-email-error').textContent = t('modal.login.err_email');
    return;
  }

  // Блокируем кнопку на время запроса
  btn.disabled = true;
  btn.textContent = 'Вход…';

  const { data, error } = await loginUser({
    email: emailEl.value.trim(),
    password: passEl.value,
  });

  if (error) {
    // Показываем ошибку под полем пароля (general error)
    passEl.classList.add('hb-error');
    document.getElementById('hb-pass-error').textContent = error;
    btn.disabled = false;
    btn.textContent = t('modal.login.btn');
    return;
  }

  // Успех — сохраняем токен и данные пользователя
  localStorage.setItem('hanbin_token', data.token);
  localStorage.setItem('hanbin_user', JSON.stringify({
    id: String(data.user_id),
    email: data.email,
  }));

  // Закрываем модалку и сразу рендерим главную.
  // Не ждём animationend и не полагаемся на hashchange — вызываем forceRender напрямую.
  closeModal();
  import('../router.js').then(({ navigate, forceRender }) => {
    navigate('#/');
    forceRender();
  });
}

// ─── Смонтировать содержимое логина ──────────
export function mountLoginContent(content, enterClass) {
  // Сохраняем значения полей если они уже были введены (при смене языка)
  const prevEmail = document.getElementById('hb-email')?.value ?? '';
  const prevPass  = document.getElementById('hb-pass')?.value ?? '';

  content.innerHTML = loginContentHTML();

  if (enterClass) {
    content.classList.add(enterClass);
    const enterAnim = enterClass === 'hb-enter-right' ? 'hb-enterRight' : 'hb-enterLeft';
    const onEnterEnd = (e) => {
      if (e.animationName !== enterAnim) return;
      content.classList.remove(enterClass);
      content.removeEventListener('animationend', onEnterEnd);
    };
    content.addEventListener('animationend', onEnterEnd);
    setTimeout(() => { content.classList.remove(enterClass); content.removeEventListener('animationend', onEnterEnd); }, 500);
  }

  // Восстанавливаем значения
  if (prevEmail) { document.getElementById('hb-email').value = prevEmail; }
  if (prevPass)  { document.getElementById('hb-pass').value  = prevPass; }
  syncLoginButton();

  document.getElementById('hb-email').addEventListener('input', () =>
    updateCounter('hb-email', 'hb-email-counter', 80, 'hb-email-error'));
  document.getElementById('hb-pass').addEventListener('input', () =>
    updateCounter('hb-pass', 'hb-pass-counter', 64, 'hb-pass-error'));

  document.getElementById('hb-btn-login').addEventListener('click', validateAndLogin);
  ['hb-email', 'hb-pass'].forEach(id =>
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') validateAndLogin();
    })
  );

  document.getElementById('hb-btn-register').addEventListener('click', () => {
    transitionModalContent('left', (el, cls) => {
      import('./RegisterModal.js').then(({ mountRegisterContent }) => {
        mountRegisterContent(el, cls);
      });
    });
  });

  document.getElementById('hb-email').focus();
}

// ─── Закрыть оверлей ─────────────────────────
export function closeModal() {
  const overlay = document.getElementById('hb-modal-overlay');
  if (!overlay) return;
  overlay.classList.add('hb-closing');
  overlay.addEventListener('animationend', () => overlay.remove(), { once: true });
}

// ─── Открыть модалку логина ───────────────────
export function openLoginModal() {
  if (document.getElementById('hb-modal-overlay')) return;

  injectModalCSS();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = createOverlayHTML();
  document.body.appendChild(wrapper.firstElementChild);

  document.getElementById('hb-modal-close').addEventListener('click', closeModal);
  document.getElementById('hb-modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'hb-modal-overlay') closeModal();
  });

  const onKeydown = e => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', onKeydown);
    }
  };
  document.addEventListener('keydown', onKeydown);

  mountLoginContent(document.getElementById('hb-modal-content'), null);

  // ── При смене языка перерисовываем активный контент модалки ──
  const unsub = onLangChange(() => {
    const overlay = document.getElementById('hb-modal-overlay');
    if (!overlay) { unsub(); return; } // модалка закрыта — отписываемся

    // Обновляем aria-label крестика
    const closeBtn = document.getElementById('hb-modal-close');
    if (closeBtn) closeBtn.setAttribute('aria-label', t('modal.close'));

    const content = document.getElementById('hb-modal-content');
    if (!content) return;

    // Определяем что сейчас открыто — логин или регистрация
    const isRegister = document.getElementById('hb-modal-box')?.classList.contains('hb-theme-register');

    if (isRegister) {
      import('./RegisterModal.js').then(({ mountRegisterContent }) => {
        mountRegisterContent(content, null);
      });
    } else {
      mountLoginContent(content, null);
    }
  });
}
