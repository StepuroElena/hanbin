/**
 * HANBIN — Forgot Password Modal Content
 *
 * Открывается из LoginModal.js («Забыл(а) пароль?») через тот же transitionModalContent,
 * что и переход логин↔регистрация — переиспользует CSS/анимации из LoginModal.js.
 *
 * Бэк (см. api/mock.js:forgotPassword) возвращает два варианта ответа в зависимости от того, настроен ли
 * на бэке реальный email-провайдер (RESEND_API_KEY):
 *   — ключ есть → письмо реально ушло, data.resetLink пустой → показываем простое «проверь почту»;
 *   — ключа нет (локальная разработка без Resend) → data.resetLink заполнен → показываем саму ссылку прямо в модалке.
 */

import { t } from '../i18n/index.js';
import { forgotPassword } from '../api/mock.js';
import { transitionModalContent } from './LoginModal.js';

function forgotPasswordFormHTML() {
  return `
    <div class="hb-modal-title">${t('modal.forgot.title')}</div>
    <div class="hb-modal-sub">${t('modal.forgot.sub')}</div>

    <div class="hb-field">
      <div class="hb-field-label">
        <span>${t('modal.login.email')} <span class="hb-required">*</span></span>
      </div>
      <input class="hb-field-input" id="hb-forgot-email" type="email"
        placeholder="${t('modal.login.email_ph')}" maxlength="80" autocomplete="email">
      <div class="hb-field-error" id="hb-forgot-email-error"></div>
    </div>

    <button class="hb-btn-primary" id="hb-btn-forgot-submit">${t('modal.forgot.btn')}</button>
    <button class="hb-btn-secondary" id="hb-btn-forgot-back" style="margin-top:10px">${t('modal.forgot.back')}</button>
  `;
}

function forgotPasswordSuccessHTML(resetLink) {
  // Если бэк реально отправил письмо (Resend настроен) — resetLink пустой, показываем простое «проверь почту».
  if (!resetLink) {
    return `
      <div class="hb-modal-title">${t('modal.forgot.email_sent_title')}</div>
      <div class="hb-modal-sub hb-modal-sub--email-sent">${t('modal.forgot.email_sent_sub')}</div>
      <button class="hb-btn-secondary" id="hb-btn-forgot-back">${t('modal.forgot.back')}</button>
    `;
  }

  // Фолбэк для локальной разработки без настроенного Resend — бэк отдаёт ссылку напрямую, показываем её тут же.
  return `
    <div class="hb-modal-title">${t('modal.forgot.sent_title')}</div>
    <div class="hb-modal-sub">${t('modal.forgot.sent_sub')}</div>

    <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(232,196,184,0.18);border-radius:12px;padding:14px 16px;margin-bottom:22px;">
      <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(245,230,211,0.4);margin-bottom:8px;">
        ${t('modal.forgot.dev_note')}
      </div>
      <a href="${resetLink}" style="word-break:break-all;color:#c97b8a;font-size:13px;line-height:1.5;">${resetLink}</a>
    </div>

    <button class="hb-btn-secondary" id="hb-btn-forgot-back">${t('modal.forgot.back')}</button>
  `;
}

/** Плавный enter-переход того же вида, что и в LoginModal.js/RegisterModal.js — копия минимальной логики, чтобы не тянуть лишний экспорт. */
function animateEnter(content, enterClass) {
  if (!enterClass) return;
  content.classList.add(enterClass);
  const enterAnim = enterClass === 'hb-enter-right' ? 'hb-enterRight' : 'hb-enterLeft';
  const onEnterEnd = (e) => {
    if (e.animationName !== enterAnim) return;
    content.classList.remove(enterClass);
    content.removeEventListener('animationend', onEnterEnd);
  };
  content.addEventListener('animationend', onEnterEnd);
  setTimeout(() => {
    content.classList.remove(enterClass);
    content.removeEventListener('animationend', onEnterEnd);
  }, 500);
}

function backToLogin() {
  // Загрузка модуля запущена до transitionModalContent, а не внутри renderFn — иначе она стартует только
  // после exit-анимации, и в этот момент старая форма видимо моргает обратно (opacity сбрасывается
  // до того, как mountLoginContent успеет подменить содержимое).
  const modulePromise = import('./LoginModal.js');
  transitionModalContent('right', (el, cls) => {
    modulePromise.then(({ mountLoginContent }) => mountLoginContent(el, cls));
  });
}

export function mountForgotPasswordContent(content, enterClass) {
  document.getElementById('hb-modal-box')?.setAttribute('data-screen', 'forgot');

  content.innerHTML = forgotPasswordFormHTML();
  animateEnter(content, enterClass);

  const emailEl = document.getElementById('hb-forgot-email');
  const btn = document.getElementById('hb-btn-forgot-submit');

  emailEl.addEventListener('input', () => {
    emailEl.classList.remove('hb-error');
    document.getElementById('hb-forgot-email-error').textContent = '';
  });

  async function submit() {
    const email = emailEl.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailEl.classList.add('hb-error');
      document.getElementById('hb-forgot-email-error').textContent = t('modal.login.err_email');
      return;
    }

    btn.disabled = true;
    btn.textContent = t('modal.forgot.btn_loading');

    const { data, error } = await forgotPassword(email);

    if (error) {
      emailEl.classList.add('hb-error');
      document.getElementById('hb-forgot-email-error').textContent = error;
      btn.disabled = false;
      btn.textContent = t('modal.forgot.btn');
      return;
    }

    content.innerHTML = forgotPasswordSuccessHTML(data.resetLink || '');
    document.getElementById('hb-btn-forgot-back').addEventListener('click', backToLogin);
  }

  btn.addEventListener('click', submit);
  emailEl.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  document.getElementById('hb-btn-forgot-back').addEventListener('click', backToLogin);

  emailEl.focus();
}
