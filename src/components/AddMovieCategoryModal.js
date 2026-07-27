/**
 * HANBIN — Add Movie Category Modal
 *
 * Открывается кнопкой «+ Добавить категорию» на странице Настроек. Позволяет добавить
 * собственную короткую категорию/тег в персональный список (POST /api/v1/movie-categories).
 * Требует авторизации — гостю недоступно (кнопка на странице настроек скрыта для гостя,
 * но на всякий случай сервис тоже отклонит запрос без токена). Максимально простая форма —
 * только название, без url/языка, в отличие от AddStreamingSiteModal.js.
 */

import { closeModal, injectModalCSS } from './LoginModal.js';
import { addMovieCategory } from '../api/mock.js';
import { t, onLangChange } from '../i18n/index.js';

const LOGO_SVG = `
  <svg class="hb-modal-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <defs>
      <linearGradient id="hb-add-category-logo-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d1238"/>
        <stop offset="100%" stop-color="#2d0f2a"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="7" fill="url(#hb-add-category-logo-bg)"/>
    <rect x="4" y="6" width="2.5" height="20" rx="1" fill="#f5e6d3"/>
    <path d="M6.5 14 Q10 10 13.5 14 L13.5 26 L11 26 L11 15.5 Q10 13.5 6.5 15.5Z" fill="#f5e6d3"/>
    <rect x="17" y="6" width="2.5" height="20" rx="1" fill="#c97b8a" transform="skewX(-4)"/>
    <path d="M19.5 15.5 Q25 14 25 19 Q25 24.5 19.5 24.5 L19.5 22.5 Q23 22.5 23 19 Q23 16.5 19.5 17Z" fill="#c97b8a" transform="skewX(-4)"/>
  </svg>
`;

const ADD_CATEGORY_CSS = `
  #hb-modal-box.hb-add-category-box { width: 400px; }
`;

function injectAddCategoryCSS() {
  if (document.getElementById('hb-add-category-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-add-category-css';
  style.textContent = ADD_CATEGORY_CSS;
  document.head.appendChild(style);
}

function buildHTML() {
  return `
    ${LOGO_SVG}
    <div class="hb-modal-title">${t('modal.addcategory.title')}</div>
    <div class="hb-modal-sub">${t('modal.addcategory.sub')}</div>

    <div class="hb-field">
      <div class="hb-field-label"><span>${t('modal.addcategory.field.name')} <span class="hb-required">*</span></span></div>
      <input class="hb-field-input" id="hb-addcategory-name" type="text" maxlength="100"
        placeholder="${t('modal.addcategory.field.name_ph')}" autocomplete="off">
      <div class="hb-field-error" id="hb-addcategory-name-error"></div>
    </div>

    <div class="hb-field-error" id="hb-addcategory-global-error" style="text-align:center;margin-bottom:4px"></div>

    <button class="hb-btn-primary" id="hb-addcategory-submit" disabled>${t('modal.addcategory.btn')}</button>
  `;
}

function mountContent(content, { onAdded } = {}) {
  content.innerHTML = buildHTML();

  const nameInput = content.querySelector('#hb-addcategory-name');
  const submitBtn = content.querySelector('#hb-addcategory-submit');

  function syncSubmit() {
    submitBtn.disabled = !nameInput.value.trim();
  }

  nameInput.addEventListener('input', () => {
    nameInput.classList.remove('hb-error');
    content.querySelector('#hb-addcategory-name-error').textContent = '';
    syncSubmit();
  });

  async function submit() {
    if (submitBtn.disabled) return;
    const name = nameInput.value.trim();

    if (!name) {
      nameInput.classList.add('hb-error');
      content.querySelector('#hb-addcategory-name-error').textContent = t('modal.addcategory.err_name');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = t('modal.addcategory.btn_loading');
    content.querySelector('#hb-addcategory-global-error').textContent = '';

    const { data, error } = await addMovieCategory({ name });

    if (error) {
      content.querySelector('#hb-addcategory-global-error').textContent = error;
      submitBtn.disabled = false;
      submitBtn.textContent = t('modal.addcategory.btn');
      return;
    }

    onAdded?.(data);
    closeModal();
  }

  submitBtn.addEventListener('click', submit);
  nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });

  setTimeout(() => nameInput.focus(), 80);
}

/**
 * Открывает модалку добавления категории.
 * @param {{ onAdded?: (category) => void }} opts
 * onAdded вызывается с только что созданной категорией ({id, name, enabled}) — вызывающий
 * код (Settings.js) сам добавляет её в локальный список и перерисовывает секцию.
 */
export function openAddMovieCategoryModal(opts = {}) {
  if (document.getElementById('hb-modal-overlay')) return;

  injectAddCategoryCSS();
  injectModalCSS();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="hb-modal-overlay">
      <div id="hb-modal-box" class="hb-add-category-box">
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
