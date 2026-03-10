/**
 * HANBIN — Login Modal Component
 *
 * Использование:
 *   import { openLoginModal } from './components/LoginModal.js';
 *   openLoginModal();
 *
 * Модалка монтируется в <body>, поверх любой страницы.
 * По крестику / клику на оверлей — закрывается, пользователь остаётся на текущей странице.
 * Кнопка «Войти» недоступна пока оба поля не заполнены.
 */

// ─── CSS ─────────────────────────────────────
const MODAL_CSS = `
  @keyframes hb-fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes hb-slideUp { from{opacity:0;transform:translateY(28px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }

  #hb-login-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(18,6,18,0.78);
    backdrop-filter: blur(14px);
    display: flex; align-items: center; justify-content: center;
    animation: hb-fadeIn 0.25s ease;
  }

  #hb-login-modal {
    width: 420px;
    border-radius: 24px;
    background: linear-gradient(145deg, rgba(74,25,66,0.96), rgba(45,15,42,0.99));
    border: 1px solid rgba(201,123,138,0.28);
    box-shadow: 0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,123,138,0.07);
    padding: 44px 40px 40px;
    position: relative;
    overflow: hidden;
    animation: hb-slideUp 0.32s cubic-bezier(0.34,1.56,0.64,1);
  }

  #hb-login-modal::before {
    content: '';
    position: absolute; top: -60px; right: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,123,138,0.16), transparent 70%);
    pointer-events: none;
  }
  #hb-login-modal::after {
    content: '✦';
    position: absolute; bottom: 14px; right: 22px;
    font-size: 52px;
    color: rgba(201,123,138,0.07);
    pointer-events: none;
  }

  #hb-login-close {
    position: absolute; top: 16px; right: 16px;
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(232,196,184,0.15);
    color: rgba(245,230,211,0.45);
    font-size: 18px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  #hb-login-close:hover {
    color: #f5e6d3;
    border-color: rgba(201,123,138,0.45);
    background: rgba(201,123,138,0.1);
  }

  /* логотип */
  .hb-modal-logo {
    width: 44px; height: 44px;
    margin-bottom: 16px;
    border-radius: 10px;
    display: block;
  }

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
    letter-spacing: 0; text-transform: none;
    transition: color 0.2s;
  }
  .hb-counter.warn { color: rgba(255,107,138,0.75); }

  .hb-field-input {
    width: 100%; padding: 13px 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(232,196,184,0.18);
    border-radius: 12px; color: #f5e6d3;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
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

  .hb-field-error {
    margin-top: 5px; font-size: 11px;
    color: #ff6b8a; min-height: 16px;
  }

  .hb-divider {
    display: flex; align-items: center;
    gap: 12px; margin: 20px 0 14px;
  }
  .hb-divider-line { flex: 1; height: 1px; background: rgba(232,196,184,0.1); }
  .hb-divider-text { font-size: 11px; color: rgba(245,230,211,0.25); letter-spacing: 0.1em; }

  #hb-btn-login {
    width: 100%; padding: 14px; margin-bottom: 4px;
    border: none; border-radius: 12px; color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    transition: opacity 0.2s, transform 0.2s, background 0.25s;
  }
  #hb-btn-login:disabled {
    background: rgba(255,255,255,0.08);
    color: rgba(245,230,211,0.3);
    cursor: not-allowed;
    transform: none !important;
  }
  #hb-btn-login:not(:disabled) {
    background: linear-gradient(135deg, #c97b8a, #ff6b8a);
    cursor: pointer;
  }
  #hb-btn-login:not(:disabled):hover { opacity: 0.87; transform: translateY(-1px); }
  #hb-btn-login:not(:disabled):active { transform: translateY(0); }

  #hb-btn-register {
    width: 100%; padding: 13px;
    background: transparent;
    border: 1px solid rgba(201,123,138,0.3);
    border-radius: 12px; color: #c97b8a;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer; transition: all 0.2s;
  }
  #hb-btn-register:hover {
    border-color: rgba(201,123,138,0.6);
    background: rgba(201,123,138,0.08);
  }
`;

// ─── Логотип SVG (inline) ─────────────────────
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

// ─── Inject CSS once ──────────────────────────
function injectModalCSS() {
  if (document.getElementById('hb-login-modal-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-login-modal-css';
  style.textContent = MODAL_CSS;
  document.head.appendChild(style);
}

// ─── HTML ─────────────────────────────────────
function createModalHTML() {
  return `
    <div id="hb-login-overlay">
      <div id="hb-login-modal">
        <button id="hb-login-close" aria-label="Закрыть">×</button>

        ${LOGO_SVG}
        <div class="hb-modal-title">Добро пожаловать домой</div>
        <div class="hb-modal-sub">Войдите в свой любимый аккаунт</div>

        <div class="hb-field">
          <div class="hb-field-label">
            <span>Email <span class="hb-required">*</span></span>
            <span class="hb-counter" id="hb-email-counter">0 / 80</span>
          </div>
          <input
            class="hb-field-input" id="hb-email"
            type="email" placeholder="your@email.com"
            maxlength="80" autocomplete="email"
          >
          <div class="hb-field-error" id="hb-email-error"></div>
        </div>

        <div class="hb-field">
          <div class="hb-field-label">
            <span>Пароль <span class="hb-required">*</span></span>
            <span class="hb-counter" id="hb-pass-counter">0 / 64</span>
          </div>
          <input
            class="hb-field-input" id="hb-pass"
            type="password" placeholder="••••••••"
            maxlength="64" autocomplete="current-password"
          >
          <div class="hb-field-error" id="hb-pass-error"></div>
        </div>

        <button id="hb-btn-login" disabled>Войти</button>

        <div class="hb-divider">
          <div class="hb-divider-line"></div>
          <span class="hb-divider-text">или</span>
          <div class="hb-divider-line"></div>
        </div>

        <button id="hb-btn-register">Зарегистрироваться</button>
      </div>
    </div>
  `;
}

// ─── Проверяем заполненность обоих полей ──────
function syncLoginButton() {
  const email = document.getElementById('hb-email').value.trim();
  const pass  = document.getElementById('hb-pass').value.trim();
  document.getElementById('hb-btn-login').disabled = !(email && pass);
}

// ─── Счётчик + сброс ошибки + sync кнопки ────
function updateCounter(inputId, counterId, max, errorId) {
  const val = document.getElementById(inputId).value;
  const counter = document.getElementById(counterId);
  counter.textContent = `${val.length} / ${max}`;
  counter.classList.toggle('warn', val.length > max * 0.88);
  document.getElementById(inputId).classList.remove('hb-error');
  document.getElementById(errorId).textContent = '';
  syncLoginButton();
}

// ─── Валидация и логин ────────────────────────
function validateAndLogin() {
  const btn = document.getElementById('hb-btn-login');
  if (btn.disabled) return;

  const emailEl = document.getElementById('hb-email');
  let valid = true;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    emailEl.classList.add('hb-error');
    document.getElementById('hb-email-error').textContent = '⚠ Некорректный адрес почты';
    valid = false;
  }

  if (valid) {
    // TODO: подключить к реальному API авторизации
    console.log('[LoginModal] Login attempt:', emailEl.value);
    alert('✓ Вход выполнен! (TODO: подключить к API)');
    closeLoginModal();
  }
}

// ─── Закрыть / открыть ───────────────────────
function closeLoginModal() {
  const overlay = document.getElementById('hb-login-overlay');
  if (overlay) overlay.remove();
}

export function openLoginModal() {
  if (document.getElementById('hb-login-overlay')) return;

  injectModalCSS();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = createModalHTML();
  document.body.appendChild(wrapper.firstElementChild);

  document.getElementById('hb-login-close').addEventListener('click', closeLoginModal);

  document.getElementById('hb-login-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'hb-login-overlay') closeLoginModal();
  });

  const onKeydown = (e) => {
    if (e.key === 'Escape') {
      closeLoginModal();
      document.removeEventListener('keydown', onKeydown);
    }
  };
  document.addEventListener('keydown', onKeydown);

  document.getElementById('hb-email').addEventListener('input', () =>
    updateCounter('hb-email', 'hb-email-counter', 80, 'hb-email-error'));
  document.getElementById('hb-pass').addEventListener('input', () =>
    updateCounter('hb-pass', 'hb-pass-counter', 64, 'hb-pass-error'));

  document.getElementById('hb-btn-login').addEventListener('click', validateAndLogin);

  ['hb-email', 'hb-pass'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') validateAndLogin();
    });
  });

  document.getElementById('hb-btn-register').addEventListener('click', () => {
    alert('Регистрация — скоро! 🌸');
  });

  document.getElementById('hb-email').focus();
}
