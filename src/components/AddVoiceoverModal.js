/**
 * HANBIN — Add / Edit Voiceover Modal
 *
 * Открывается со страницы Настроек:
 *  • плитка «+ Добавить озвучку» — добавляет свою озвучку (POST /api/v1/voiceovers);
 *  • карандаш на карточке своей озвучки — переименовывает её (PATCH /api/v1/voiceovers/{id}).
 * Дефолтные озвучки здесь не редактируются — у них в Настройках только тогл.
 * Проверки (пустое имя, дубли, запрет на дефолтные) делает бэк — модалка только показывает ошибку.
 * Та же вёрстка, что у AddMovieCategoryModal.js.
 */

import { closeModal, injectModalCSS } from './LoginModal.js';
import { addVoiceoverOption, updateVoiceoverOption } from '../api/mock.js';
import { t, onLangChange } from '../i18n/index.js';

const LOGO_SVG = `
  <svg class="hb-modal-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <defs>
      <linearGradient id="hb-voiceover-logo-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d1238"/>
        <stop offset="100%" stop-color="#2d0f2a"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="7" fill="url(#hb-voiceover-logo-bg)"/>
    <rect x="4" y="6" width="2.5" height="20" rx="1" fill="#f5e6d3"/>
    <path d="M6.5 14 Q10 10 13.5 14 L13.5 26 L11 26 L11 15.5 Q10 13.5 6.5 15.5Z" fill="#f5e6d3"/>
    <rect x="17" y="6" width="2.5" height="20" rx="1" fill="#c97b8a" transform="skewX(-4)"/>
    <path d="M19.5 15.5 Q25 14 25 19 Q25 24.5 19.5 24.5 L19.5 22.5 Q23 22.5 23 19 Q23 16.5 19.5 17Z" fill="#c97b8a" transform="skewX(-4)"/>
  </svg>
`;

const VOICEOVER_MODAL_CSS = `
  #hb-modal-box.hb-voiceover-box { width: 400px; }
`;

function injectVoiceoverModalCSS() {
  if (document.getElementById('hb-voiceover-modal-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-voiceover-modal-css';
  style.textContent = VOICEOVER_MODAL_CSS;
  document.head.appendChild(style);
}

const escapeAttr = s => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Переводит ошибки бэка в текст для пользователя. */
function errorText(error) {
  const msg = String(error ?? '');
  if (msg.includes('already exists')) return t('modal.voiceover.err_duplicate');
  if (msg.includes('name is required')) return t('modal.voiceover.err_name');
  if (msg.includes('characters or fewer')) return t('modal.voiceover.err_too_long');
  return msg;
}

function buildHTML(voiceover) {
  const isEdit = !!voiceover;
  return `
    ${LOGO_SVG}
    <div class="hb-modal-title">${t(isEdit ? 'modal.voiceover.edit_title' : 'modal.voiceover.title')}</div>
    <div class="hb-modal-sub">${t(isEdit ? 'modal.voiceover.edit_sub' : 'modal.voiceover.sub')}</div>

    <div class="hb-field">
      <div class="hb-field-label"><span>${t('modal.voiceover.field.name')} <span class="hb-required">*</span></span></div>
      <input class="hb-field-input" id="hb-voiceover-name" type="text" maxlength="255"
        placeholder="${t('modal.voiceover.field.name_ph')}" autocomplete="off"
        value="${isEdit ? escapeAttr(voiceover.name) : ''}">
      <div class="hb-field-error" id="hb-voiceover-name-error"></div>
    </div>

    <div class="hb-field-error" id="hb-voiceover-global-error" style="text-align:center;margin-bottom:4px"></div>

    <button class="hb-btn-primary" id="hb-voiceover-submit" disabled>${t(isEdit ? 'modal.voiceover.btn_save' : 'modal.voiceover.btn')}</button>
  `;
}

function mountContent(content, { voiceover = null, onSaved } = {}) {
  const isEdit = !!voiceover;
  content.innerHTML = buildHTML(voiceover);

  const nameInput = content.querySelector('#hb-voiceover-name');
  const submitBtn = content.querySelector('#hb-voiceover-submit');
  const nameError = content.querySelector('#hb-voiceover-name-error');
  const globalError = content.querySelector('#hb-voiceover-global-error');
  const idleLabel = t(isEdit ? 'modal.voiceover.btn_save' : 'modal.voiceover.btn');

  function syncSubmit() {
    const name = nameInput.value.trim();
    submitBtn.disabled = !name || (isEdit && name === voiceover.name);
  }

  nameInput.addEventListener('input', () => {
    nameInput.classList.remove('hb-error');
    nameError.textContent = '';
    globalError.textContent = '';
    syncSubmit();
  });

  async function submit() {
    if (submitBtn.disabled) return;
    const name = nameInput.value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = t('modal.voiceover.btn_loading');
    globalError.textContent = '';

    const { data, error } = isEdit
      ? await updateVoiceoverOption(voiceover.id, { name })
      : await addVoiceoverOption({ name });

    if (error) {
      nameInput.classList.add('hb-error');
      nameError.textContent = errorText(error);
      submitBtn.disabled = false;
      submitBtn.textContent = idleLabel;
      return;
    }

    onSaved?.(data);
    closeModal();
  }

  submitBtn.addEventListener('click', submit);
  nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });

  syncSubmit();
  setTimeout(() => { nameInput.focus(); nameInput.select(); }, 80);
}

/**
 * Открывает модалку озвучки.
 * @param {{ voiceover?: {id, name}, onSaved?: (voiceover) => void }} opts
 *  voiceover — если передан, модалка в режиме переименования этой (своей) озвучки, иначе — добавление.
 *  onSaved вызывается с сохранённой озвучкой ({id, name, enabled, isDefault}) — Settings.js сам
 *  обновляет локальный список и перерисовывает секцию.
 */
export function openVoiceoverModal(opts = {}) {
  if (document.getElementById('hb-modal-overlay')) return;

  injectVoiceoverModalCSS();
  injectModalCSS();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="hb-modal-overlay">
      <div id="hb-modal-box" class="hb-voiceover-box">
        <button id="hb-modal-close" aria-label="${t('modal.close')}">×</button>
        <div id="hb-modal-content"></div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper.firstElementChild);

  document.getElementById('hb-modal-close').addEventListener('click', closeModal);
  document.getElementById('hb-modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'hb-modal-overlay') closeModal();
  });
  const onKeydown = e => {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);

  const content = document.getElementById('hb-modal-content');
  mountContent(content, opts);

  const unsub = onLangChange(() => {
    const overlay = document.getElementById('hb-modal-overlay');
    if (!overlay) { unsub(); return; }
    mountContent(content, opts);
  });
}
