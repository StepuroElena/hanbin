/**
 * HANBIN — Register Modal Component
 */

import { navigate, forceRender }                                 from '../router.js';
import { t }                                                     from '../i18n/index.js';
import { closeModal, transitionModalContent, mountLoginContent } from './LoginModal.js';
import { registerUser, loginUser }                               from '../api/mock.js';

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

// ─── HTML контента регистрации (i18n-aware) ───
function registerContentHTML() {
  return `
    ${LOGO_SVG}
    <div class="hb-modal-title">${t('modal.reg.title')}</div>
    <div class="hb-modal-sub">${t('modal.reg.sub')}</div>

    <div class="hb-field">
      <div class="hb-field-label">
        <span>${t('modal.reg.name')} <span class="hb-required">*</span></span>
        <span class="hb-counter" id="hb-reg-name-counter">0 / 40</span>
      </div>
      <input class="hb-field-input" id="hb-reg-name" type="text"
        placeholder="${t('modal.reg.name_ph')}" maxlength="40" autocomplete="name">
      <div class="hb-field-error" id="hb-reg-name-error"></div>
    </div>

    <div class="hb-field">
      <div class="hb-field-label">
        <span>${t('modal.reg.email')} <span class="hb-required">*</span></span>
        <span class="hb-counter" id="hb-reg-email-counter">0 / 80</span>
      </div>
      <input class="hb-field-input" id="hb-reg-email" type="email"
        placeholder="${t('modal.login.email_ph')}" maxlength="80" autocomplete="email">
      <div class="hb-field-error" id="hb-reg-email-error"></div>
    </div>

    <div class="hb-field">
      <div class="hb-field-label">
        <span>${t('modal.reg.password')} <span class="hb-required">*</span></span>
        <span class="hb-counter" id="hb-reg-pass-counter">0 / 64</span>
      </div>
      <input class="hb-field-input" id="hb-reg-pass" type="password"
        placeholder="${t('modal.reg.pass_ph')}" maxlength="64" autocomplete="new-password">
      <div class="hb-field-error" id="hb-reg-pass-error"></div>
    </div>

    <div class="hb-field-error" id="hb-reg-global-error" style="text-align:center;margin-bottom:4px"></div>
    <button class="hb-btn-primary" id="hb-btn-reg-submit" disabled>${t('modal.reg.btn')}</button>

    <div class="hb-divider">
      <div class="hb-divider-line"></div>
      <span class="hb-divider-text">${t('modal.reg.or')}</span>
      <div class="hb-divider-line"></div>
    </div>

    <button class="hb-btn-secondary" id="hb-btn-reg-login">${t('modal.reg.to_login')}</button>
  `;
}

// ─── Логика формы ─────────────────────────────
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

async function validateAndRegister() {
  const btn = document.getElementById('hb-btn-reg-submit');
  if (!btn || btn.disabled) return;

  const nameEl  = document.getElementById('hb-reg-name');
  const emailEl = document.getElementById('hb-reg-email');
  const passEl  = document.getElementById('hb-reg-pass');

  // ─ Клиентская валидация ──────────────────────────────
  let valid = true;

  if (nameEl.value.trim().length < 2) {
    nameEl.classList.add('hb-error');
    document.getElementById('hb-reg-name-error').textContent = t('modal.reg.err_name');
    valid = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    emailEl.classList.add('hb-error');
    document.getElementById('hb-reg-email-error').textContent = t('modal.reg.err_email');
    valid = false;
  }
  if (passEl.value.length < 8) {
    passEl.classList.add('hb-error');
    document.getElementById('hb-reg-pass-error').textContent = t('modal.reg.err_pass');
    valid = false;
  }
  if (!valid) return;

  // ─ Запрос к бэку ────────────────────────────────────
  setLoadingState(btn, true);

  const { data, error } = await registerUser({
    name:     nameEl.value.trim(),
    email:    emailEl.value.trim(),
    password: passEl.value,
  });

  setLoadingState(btn, false);

  if (error) {
    const isEmailError = error.includes('email') || error.includes('taken') || error.includes('занят');
    if (isEmailError) {
      emailEl.classList.add('hb-error');
      document.getElementById('hb-reg-email-error').textContent = error;
    } else {
      // Общая/серверная ошибка — показываем отдельным баннером над кнопкой
      document.getElementById('hb-reg-global-error').textContent = error;
    }
    return;
  }

  // ─ Успех: сохраняем user_id ─────────────────────────
  console.log('[RegisterModal] Регистрация успешна, user_id:', data.user_id);

  // Получаем JWT-токен сразу после регистрации, чтобы не заставлять пользователя логиниться второй раз
  setLoadingState(btn, true);
  const { data: loginData, error: loginError } = await loginUser({
    email:    emailEl.value.trim(),
    password: passEl.value,
  });
  setLoadingState(btn, false);

  if (loginError || !loginData?.token) {
    // Регистрация прошла, но автологин не удался — отправляем на страницу логина
    console.warn('[RegisterModal] Автологин не удался:', loginError);
    closeModal();
    navigate('#/guest');
    return;
  }

  // Сохраняем токен — дальше getMe() будет его использовать для запросов к бэку
  localStorage.setItem('hanbin_token', loginData.token);
  localStorage.setItem('hanbin_user', JSON.stringify({
    id:    String(loginData.user_id),
    email: loginData.email,
  }));

  closeModal();
  navigate('#/');
  forceRender();
}

// Блокируем/разблокируем кнопку во время запроса
function setLoadingState(btn, loading) {
  btn.disabled = loading;
  btn.textContent = loading ? 'Загрузка…' : t('modal.reg.btn');
  btn.style.opacity = loading ? '0.7' : '';
}

// ─── Смонтировать содержимое регистрации ─────
export function mountRegisterContent(content, enterClass) {
  // Сохраняем значения полей перед перерисовкой (при смене языка)
  const prevName  = document.getElementById('hb-reg-name')?.value  ?? '';
  const prevEmail = document.getElementById('hb-reg-email')?.value ?? '';
  const prevPass  = document.getElementById('hb-reg-pass')?.value  ?? '';

  content.innerHTML = registerContentHTML();

  if (enterClass) {
    content.classList.add(enterClass);
    content.addEventListener('animationend', () => content.classList.remove(enterClass), { once: true });
  }

  // Восстанавливаем значения
  if (prevName)  { document.getElementById('hb-reg-name').value  = prevName; }
  if (prevEmail) { document.getElementById('hb-reg-email').value = prevEmail; }
  if (prevPass)  { document.getElementById('hb-reg-pass').value  = prevPass; }
  syncRegisterButton();

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

  document.getElementById('hb-btn-reg-login').addEventListener('click', () => {
    transitionModalContent('right', (el, cls) => mountLoginContent(el, cls));
  });

  document.getElementById('hb-reg-name').focus();
}

// ─── Открыть модалку регистрации напрямую ─────
export function openRegisterModal() {
  if (document.getElementById('hb-modal-overlay')) {
    transitionModalContent('left', (el, cls) => mountRegisterContent(el, cls));
    return;
  }
  import('./LoginModal.js').then(({ openLoginModal }) => {
    openLoginModal();
    requestAnimationFrame(() => {
      const content = document.getElementById('hb-modal-content');
      if (content) mountRegisterContent(content, null);
    });
  });
}
