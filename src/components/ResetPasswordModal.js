/**
 * HANBIN — Reset Password Modal
 *
 * Открывается автоматически по ссылке из письма (#/reset-password?token=...) — router.js
 * проверяет токен через validateResetToken() ДО открытия и вызывает openResetPasswordModal()
 * только если токен реально валиден. Если токен протух/использован/не найден — router.js вместо
 * модалки показывает toast с ошибкой (см. Toast.js), эта модалка вообще не монтируется.
 *
 * Не открывается через transitionModalContent (нет предыдущего экрана, откуда переходить) —
 * создаёт свой собственный оверлей, тот же #hb-modal-overlay/#hb-modal-box, что и у логина/регистрации,
 * переиспользуя их CSS (injectModalCSS уже содержит все нужные классы, включая .hb-eye-toggle).
 */

import { t } from '../i18n/index.js';
import { resetPassword } from '../api/mock.js';
import { showToast } from './Toast.js';
import { injectModalCSS, closeModal, transitionModalContent, mountLoginContent } from './LoginModal.js';

const EYE_ICONS_SVG = `
  <svg class="hb-eye-icon hb-eye-icon--show" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
  <svg class="hb-eye-icon hb-eye-icon--hide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
`;

function formHTML(email) {
  return `
    <div class="hb-modal-title">${t('modal.reset.title')}</div>
    <div class="hb-modal-sub hb-modal-sub--email-sent">${t('modal.reset.sub_prefix')} ${email}</div>

    <div class="hb-field">
      <div class="hb-field-label"><span>${t('reset.field.password')} <span class="hb-required">*</span></span></div>
      <div class="hb-field-password-wrap">
        <input class="hb-field-input hb-field-input--password" id="hb-reset-pass" type="password"
          placeholder="${t('reset.field.password_ph')}" maxlength="64" autocomplete="new-password">
        <button type="button" class="hb-eye-toggle" id="hb-reset-pass-toggle" aria-label="${t('modal.show_pass')}">
          ${EYE_ICONS_SVG}
        </button>
      </div>
      <div class="hb-field-error" id="hb-reset-pass-error"></div>
    </div>

    <div class="hb-field">
      <div class="hb-field-label"><span>${t('reset.field.confirm')} <span class="hb-required">*</span></span></div>
      <div class="hb-field-password-wrap">
        <input class="hb-field-input hb-field-input--password" id="hb-reset-confirm" type="password"
          placeholder="${t('reset.field.confirm_ph')}" maxlength="64" autocomplete="new-password">
        <button type="button" class="hb-eye-toggle" id="hb-reset-confirm-toggle" aria-label="${t('modal.show_pass')}">
          ${EYE_ICONS_SVG}
        </button>
      </div>
      <div class="hb-field-error" id="hb-reset-confirm-error"></div>
    </div>

    <button class="hb-btn-primary" id="hb-reset-submit" disabled>${t('reset.btn')}</button>
  `;
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

// Показать/скрыть пароль по клику на глазик — тот же паттерн, что и в RegisterModal.js.
function setupPasswordToggle(inputId, toggleId) {
  const input  = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);
  if (!input || !toggle) return;

  toggle.addEventListener('click', () => {
    const willShow = input.type === 'password';
    input.type = willShow ? 'text' : 'password';
    toggle.classList.toggle('hb-eye-toggle--active', willShow);
    toggle.setAttribute('aria-label', willShow ? t('modal.hide_pass') : t('modal.show_pass'));
  });
}

/**
 * @param {string} token — токен из query-параметра ссылки, уже провалидированный вызывающим кодом
 * @param {string} email — email аккаунта, которому принадлежит токен (для заголовка «Меняем пароль для ...»)
 */
export function openResetPasswordModal(token, email) {
  if (document.getElementById('hb-modal-overlay')) return; // на всякий случай — не дублируем оверлей

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

  document.getElementById('hb-modal-box')?.setAttribute('data-screen', 'reset');

  const content = document.getElementById('hb-modal-content');
  content.innerHTML = formHTML(email);

  const passEl = document.getElementById('hb-reset-pass');
  const confirmEl = document.getElementById('hb-reset-confirm');
  const btn = document.getElementById('hb-reset-submit');

  // Кнопка активна, только если оба поля заполнены И совпадают — несовпадение не считается
  // ошибкой, пока пользователь ещё печатает (сообщение о несовпадении показываем только по клику/submit).
  function syncSubmitButton() {
    const filled = passEl.value.length > 0 && confirmEl.value.length > 0;
    const matches = passEl.value === confirmEl.value;
    btn.disabled = !(filled && matches);
  }

  const clearErrors = () => {
    passEl.classList.remove('hb-error');
    confirmEl.classList.remove('hb-error');
    document.getElementById('hb-reset-pass-error').textContent = '';
    document.getElementById('hb-reset-confirm-error').textContent = '';
  };

  [passEl, confirmEl].forEach(el => el.addEventListener('input', () => {
    clearErrors();
    syncSubmitButton();
  }));

  async function submit() {
    if (btn.disabled) return;
    clearErrors();
    let valid = true;

    if (passEl.value.length < 8) {
      passEl.classList.add('hb-error');
      document.getElementById('hb-reset-pass-error').textContent = t('reset.err_short');
      valid = false;
    }
    if (passEl.value !== confirmEl.value) {
      confirmEl.classList.add('hb-error');
      document.getElementById('hb-reset-confirm-error').textContent = t('reset.err_mismatch');
      valid = false;
    }
    if (!valid) return;

    btn.disabled = true;
    btn.textContent = t('reset.btn_loading');

    const { error } = await resetPassword(token, passEl.value);

    if (error) {
      btn.disabled = false;
      btn.textContent = t('reset.btn');
      confirmEl.classList.add('hb-error');
      document.getElementById('hb-reset-confirm-error').textContent = error;
      return;
    }

    // Успех — сразу открываем форму входа (не заставляем нажимать отдельную кнопку),
    // подтверждение показываем тостом поверх.
    showToast(t('reset.success_sub'), 'info');
    transitionModalContent('right', (el, cls) => mountLoginContent(el, cls));
  }

  btn.addEventListener('click', submit);
  confirmEl.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });

  setupPasswordToggle('hb-reset-pass', 'hb-reset-pass-toggle');
  setupPasswordToggle('hb-reset-confirm', 'hb-reset-confirm-toggle');

  passEl.focus();
}
