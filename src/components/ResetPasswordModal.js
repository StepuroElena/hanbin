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
 * переиспользуя их CSS (injectModalCSS уже содержит все нужные классы).
 */

import { t } from '../i18n/index.js';
import { resetPassword } from '../api/mock.js';
import { injectModalCSS, closeModal } from './LoginModal.js';

function formHTML(email) {
  return `
    <div class="hb-modal-title">${t('modal.reset.title')}</div>
    <div class="hb-modal-sub hb-modal-sub--email-sent">${t('modal.reset.sub_prefix')} ${email}</div>

    <div class="hb-field">
      <div class="hb-field-label"><span>${t('reset.field.password')} <span class="hb-required">*</span></span></div>
      <input class="hb-field-input" id="hb-reset-pass" type="password"
        placeholder="${t('reset.field.password_ph')}" maxlength="64" autocomplete="new-password">
      <div class="hb-field-error" id="hb-reset-pass-error"></div>
    </div>

    <div class="hb-field">
      <div class="hb-field-label"><span>${t('reset.field.confirm')} <span class="hb-required">*</span></span></div>
      <input class="hb-field-input" id="hb-reset-confirm" type="password"
        placeholder="${t('reset.field.confirm_ph')}" maxlength="64" autocomplete="new-password">
      <div class="hb-field-error" id="hb-reset-confirm-error"></div>
    </div>

    <button class="hb-btn-primary" id="hb-reset-submit">${t('reset.btn')}</button>
  `;
}

function successHTML() {
  return `
    <div class="hb-modal-title">${t('reset.success_title')}</div>
    <div class="hb-modal-sub hb-modal-sub--email-sent">${t('reset.success_sub')}</div>
    <button class="hb-btn-secondary" id="hb-reset-go-login">${t('reset.success_btn')}</button>
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

  const clearErrors = () => {
    passEl.classList.remove('hb-error');
    confirmEl.classList.remove('hb-error');
    document.getElementById('hb-reset-pass-error').textContent = '';
    document.getElementById('hb-reset-confirm-error').textContent = '';
  };
  [passEl, confirmEl].forEach(el => el.addEventListener('input', clearErrors));

  async function submit() {
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

    content.innerHTML = successHTML();
    document.getElementById('hb-reset-go-login')?.addEventListener('click', () => {
      closeModal();
      import('./LoginModal.js').then(({ openLoginModal }) => openLoginModal());
    });
  }

  btn.addEventListener('click', submit);
  confirmEl.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });

  passEl.focus();
}
