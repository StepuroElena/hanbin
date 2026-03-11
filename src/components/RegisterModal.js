/**
 * HANBIN — Register Modal Component
 *
 * Использование:
 *   import { openRegisterModal } from './components/RegisterModal.js';
 *   openRegisterModal();
 *
 * При переходе из LoginModal — оверлей остаётся, контент плавно слайдится.
 * При закрытии крестиком / оверлеем — возврат на страницу unauthorized.
 * Кнопка «Зарегистрироваться» недоступна пока все три поля не заполнены.
 * Кнопка «Войти» — плавно возвращает к LoginModal.
 */

import { navigate }                                        from '../router.js';
import { closeModal, transitionModalContent, mountLoginContent } from './LoginModal.js';

// ─── HTML контента — форма регистрации ────────
const LOGO_SVG = `
  <svg class="hb-modal-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <defs>
      <linearGradient id="hb-reg-logo-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d1238"/>
        <stop offset="100%" stop-color="#2d0f2a"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="7" fill="url(#hb-reg-logo-bg)"/>
    <rect x="4" y="6" width="2.5" height="20" rx="1" fill="#f5e6d3"/>
    <path d="M6.5 14 Q10 10 13.5 14 L13.5 26 L11 26 L11 15.5 Q10 13.5 6.5 15.5Z" fill="#f5e6d3"/>
    <rect x="17" y="6" width="2.5" height="20" rx="1" fill="#c97b8a" transform="skewX(-4)"/>
    <path d="M19.5 15.5 Q25 14 25 19 Q25 24.5 19.5 24.5 L19.5 22.5 Q23 22.5 23 19 Q23 16.5 19.5 17Z" fill="#c97b8a" transform="skewX(-4)"/>
  </svg>
`;

function registerContentHTML() {
  return `
    ${LOGO_SVG}
    <div class="hb-modal-title">Стань легендой</div>
    <div class="hb-modal-sub">Создай аккаунт и начни свой путь</div>

    <div class="hb-field">
      <div class="hb-field-label">
        <span>Имя <span class="hb-required">*</span></span>
        <span class="hb-counter" id="hb-reg-name-counter">0 / 40</span>
      </div>
      <input class="hb-field-input" id="hb-reg-name" type="text"
        placeholder="Как тебя зовут?" maxlength="40" autocomplete="name">
      <div class="hb-field-error" id="hb-reg-name-error"></div>
    </div>

    <div class="hb-field">
      <div class="hb-field-label">
        <span>Email <span class="hb-required">*</span></span>
        <span class="hb-counter" id="hb-reg-email-counter">0 / 80</span>
      </div>
      <input class="hb-field-input" id="hb-reg-email" type="email"
        placeholder="your@email.com" maxlength="80" autocomplete="email">
      <div class="hb-field-error" id="hb-reg-email-error"></div>
    </div>

    <div class="hb-field">
      <div class="hb-field-label">
        <span>Пароль <span class="hb-required">*</span></span>
        <span class="hb-counter" id="hb-reg-pass-counter">0 / 64</span>
      </div>
      <input class="hb-field-input" id="hb-reg-pass" type="password"
        placeholder="Минимум 6 символов" maxlength="64" autocomplete="new-password">
      <div class="hb-field-error" id="hb-reg-pass-error"></div>
    </div>

    <button class="hb-btn-primary" id="hb-btn-reg-submit" disabled>Зарегистрироваться</button>

    <div class="hb-divider">
      <div class="hb-divider-line"></div>
      <span class="hb-divider-text">или</span>
      <div class="hb-divider-line"></div>
    </div>

    <button class="hb-btn-secondary" id="hb-btn-reg-login">Войти</button>
  `;
}

// ─── Логика формы регистрации ─────────────────
function syncRegisterButton() {
  const name  = document.getElementById('hb-reg-name')?.value.trim();
  const email = document.getElementById('hb-reg-email')?.value.trim();
  const pass  = document.getElementById('hb-reg-pass')?.value.trim();
  const btn   = document.getElementById('hb-btn-reg-submit');
  if (btn) btn.disabled = !(name && email && pass);
}

function updateRegCounter(inputId, counterId, max, errorId) {
  const val     = document.getElementById(inputId)?.value ?? '';
  const counter = document.getElementById(counterId);
  if (!counter) return;
  counter.textContent = `${val.length} / ${max}`;
  counter.classList.toggle('warn', val.length > max * 0.88);
  document.getElementById(inputId)?.classList.remove('hb-error');
  const errEl = document.getElementById(errorId);
  if (errEl) errEl.textContent = '';
  syncRegisterButton();
}

function validateAndRegister() {
  const btn = document.getElementById('hb-btn-reg-submit');
  if (!btn || btn.disabled) return;

  const nameEl  = document.getElementById('hb-reg-name');
  const emailEl = document.getElementById('hb-reg-email');
  const passEl  = document.getElementById('hb-reg-pass');
  let valid = true;

  if (nameEl.value.trim().length < 2) {
    nameEl.classList.add('hb-error');
    document.getElementById('hb-reg-name-error').textContent = '⚠ Имя слишком короткое';
    valid = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    emailEl.classList.add('hb-error');
    document.getElementById('hb-reg-email-error').textContent = '⚠ Некорректный адрес почты';
    valid = false;
  }
  if (passEl.value.length < 6) {
    passEl.classList.add('hb-error');
    document.getElementById('hb-reg-pass-error').textContent = '⚠ Минимум 6 символов';
    valid = false;
  }

  if (valid) {
    // TODO: POST /api/auth/register
    console.log('[RegisterModal] Register attempt:', emailEl.value);
    alert('✓ Аккаунт создан! (TODO: подключить к API)');
    // После успешной регистрации закрываем и переходим на unauthorized
    closeModal();
    navigate('#/guest');
  }
}

// ─── Смонтировать содержимое регистрации ─────
export function mountRegisterContent(content, enterClass) {
  content.innerHTML = registerContentHTML();
  if (enterClass) {
    content.classList.add(enterClass);
    content.addEventListener('animationend', () => content.classList.remove(enterClass), { once: true });
  }

  document.getElementById('hb-reg-name').addEventListener('input', () =>
    updateRegCounter('hb-reg-name', 'hb-reg-name-counter', 40, 'hb-reg-name-error'));
  document.getElementById('hb-reg-email').addEventListener('input', () =>
    updateRegCounter('hb-reg-email', 'hb-reg-email-counter', 80, 'hb-reg-email-error'));
  document.getElementById('hb-reg-pass').addEventListener('input', () =>
    updateRegCounter('hb-reg-pass', 'hb-reg-pass-counter', 64, 'hb-reg-pass-error'));

  document.getElementById('hb-btn-reg-submit').addEventListener('click', validateAndRegister);
  ['hb-reg-name', 'hb-reg-email', 'hb-reg-pass'].forEach(id =>
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') validateAndRegister();
    })
  );

  // Кнопка «Войти» — плавно возвращаемся к логину (слайд вправо)
  document.getElementById('hb-btn-reg-login').addEventListener('click', () => {
    transitionModalContent('right', (el, cls) => mountLoginContent(el, cls));
  });

  document.getElementById('hb-reg-name').focus();
}

// ─── Открыть модалку регистрации напрямую ─────
// (например, по прямой ссылке #/register)
export function openRegisterModal() {
  // Если оверлей уже есть (открыт логин) — просто переключаем контент
  if (document.getElementById('hb-modal-overlay')) {
    transitionModalContent('left', (el, cls) => mountRegisterContent(el, cls));
    return;
  }

  // Иначе — импортируем openLoginModal и открываем через него
  import('./LoginModal.js').then(({ openLoginModal }) => {
    openLoginModal();
    // После того как оверлей создан, сразу переключаем контент без анимации
    requestAnimationFrame(() => {
      const content = document.getElementById('hb-modal-content');
      if (content) mountRegisterContent(content, null);
    });
  });
}
