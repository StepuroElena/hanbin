/**
 * HANBIN — Add Streaming Site Modal
 *
 * Открывается кнопкой «+ Добавить сайт» в каждой языковой группе на странице Настроек.
 * Позволяет добавить собственный сайт в персональный список (POST /api/v1/streaming-sites).
 * Требует авторизации — гостю недоступно (кнопка на странице настроек скрыта для гостя,
 * но на всякий случай сервис тоже отклонит запрос без токена).
 */

import { closeModal, injectModalCSS } from './LoginModal.js';
import { addStreamingSite } from '../api/mock.js';
import { t, onLangChange } from '../i18n/index.js';

const LOGO_SVG = `
  <svg class="hb-modal-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <defs>
      <linearGradient id="hb-add-site-logo-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d1238"/>
        <stop offset="100%" stop-color="#2d0f2a"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="7" fill="url(#hb-add-site-logo-bg)"/>
    <rect x="4" y="6" width="2.5" height="20" rx="1" fill="#f5e6d3"/>
    <path d="M6.5 14 Q10 10 13.5 14 L13.5 26 L11 26 L11 15.5 Q10 13.5 6.5 15.5Z" fill="#f5e6d3"/>
    <rect x="17" y="6" width="2.5" height="20" rx="1" fill="#c97b8a" transform="skewX(-4)"/>
    <path d="M19.5 15.5 Q25 14 25 19 Q25 24.5 19.5 24.5 L19.5 22.5 Q23 22.5 23 19 Q23 16.5 19.5 17Z" fill="#c97b8a" transform="skewX(-4)"/>
  </svg>
`;

const ADD_SITE_CSS = `
  #hb-modal-box.hb-add-site-box { width: 460px; }

  .hb-add-site-lang-chips { display: flex; gap: 8px; margin-top: 2px; }
  .hb-add-site-lang-chip {
    flex: 1; padding: 10px 8px; text-align: center; border-radius: 12px;
    border: 1px solid rgba(232,196,184,0.2); background: rgba(255,255,255,0.04);
    color: rgba(245,230,211,0.55); font-size: 12px; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.2s ease; user-select: none;
  }
  .hb-add-site-lang-chip:hover { border-color: rgba(201,123,138,0.4); color: #f5e6d3; background: rgba(201,123,138,0.08); }
  .hb-add-site-lang-chip.hb-chip--active { background: rgba(201,123,138,0.2); border-color: rgba(201,123,138,0.6); color: #f5e6d3; }
`;

function injectAddSiteCSS() {
  if (document.getElementById('hb-add-site-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-add-site-css';
  style.textContent = ADD_SITE_CSS;
  document.head.appendChild(style);
}

function buildHTML(defaultLanguage) {
  return `
    ${LOGO_SVG}
    <div class="hb-modal-title">${t('modal.addsite.title')}</div>
    <div class="hb-modal-sub">${t('modal.addsite.sub')}</div>

    <div class="hb-field">
      <div class="hb-field-label"><span>${t('modal.addsite.field.name')} <span class="hb-required">*</span></span></div>
      <input class="hb-field-input" id="hb-addsite-name" type="text" maxlength="120"
        placeholder="${t('modal.addsite.field.name_ph')}" autocomplete="off">
      <div class="hb-field-error" id="hb-addsite-name-error"></div>
    </div>

    <div class="hb-field">
      <div class="hb-field-label"><span>${t('modal.addsite.field.url')} <span class="hb-required">*</span></span></div>
      <input class="hb-field-input" id="hb-addsite-url" type="url" maxlength="500"
        placeholder="${t('modal.addsite.field.url_ph')}" autocomplete="off">
      <div class="hb-field-error" id="hb-addsite-url-error"></div>
    </div>

    <div class="hb-field">
      <div class="hb-field-label"><span>${t('modal.addsite.field.language')}</span></div>
      <div class="hb-add-site-lang-chips" id="hb-addsite-lang-chips">
        <div class="hb-add-site-lang-chip ${defaultLanguage === 'ru' ? 'hb-chip--active' : ''}" data-value="ru">${t('modal.addsite.lang.ru')}</div>
        <div class="hb-add-site-lang-chip ${defaultLanguage === 'en' ? 'hb-chip--active' : ''}" data-value="en">${t('modal.addsite.lang.en')}</div>
        <div class="hb-add-site-lang-chip ${defaultLanguage === 'multi' ? 'hb-chip--active' : ''}" data-value="multi">${t('modal.addsite.lang.multi')}</div>
      </div>
    </div>

    <div class="hb-field-error" id="hb-addsite-global-error" style="text-align:center;margin-bottom:4px"></div>

    <button class="hb-btn-primary" id="hb-addsite-submit" disabled>${t('modal.addsite.btn')}</button>
  `;
}

function mountContent(content, { defaultLanguage = 'ru', onAdded } = {}) {
  content.innerHTML = buildHTML(defaultLanguage);

  let selectedLanguage = defaultLanguage;

  const nameInput = content.querySelector('#hb-addsite-name');
  const urlInput  = content.querySelector('#hb-addsite-url');
  const submitBtn = content.querySelector('#hb-addsite-submit');

  function syncSubmit() {
    submitBtn.disabled = !(nameInput.value.trim() && urlInput.value.trim());
  }

  nameInput.addEventListener('input', () => {
    nameInput.classList.remove('hb-error');
    content.querySelector('#hb-addsite-name-error').textContent = '';
    syncSubmit();
  });
  urlInput.addEventListener('input', () => {
    urlInput.classList.remove('hb-error');
    content.querySelector('#hb-addsite-url-error').textContent = '';
    syncSubmit();
  });

  content.querySelector('#hb-addsite-lang-chips').addEventListener('click', e => {
    const chip = e.target.closest('.hb-add-site-lang-chip');
    if (!chip) return;
    content.querySelectorAll('.hb-add-site-lang-chip').forEach(c => c.classList.remove('hb-chip--active'));
    chip.classList.add('hb-chip--active');
    selectedLanguage = chip.dataset.value;
  });

  submitBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();

    if (!name) {
      nameInput.classList.add('hb-error');
      content.querySelector('#hb-addsite-name-error').textContent = t('modal.addsite.err_name');
      return;
    }
    if (!url) {
      urlInput.classList.add('hb-error');
      content.querySelector('#hb-addsite-url-error').textContent = t('modal.addsite.err_url');
      return;
    }
    // Мягко чиним частую опечатку — ссылку без протокола (пользователь ожидаемо не всегда пишет https://)
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

    submitBtn.disabled = true;
    submitBtn.textContent = t('modal.addsite.btn_loading');
    content.querySelector('#hb-addsite-global-error').textContent = '';

    const { data, error } = await addStreamingSite({ name, url, language: selectedLanguage });

    if (error) {
      content.querySelector('#hb-addsite-global-error').textContent = error;
      submitBtn.disabled = false;
      submitBtn.textContent = t('modal.addsite.btn');
      return;
    }

    onAdded?.(data);
    closeModal();
  });

  setTimeout(() => nameInput.focus(), 80);
}

/**
 * Открывает модалку добавления сайта.
 * @param {{ defaultLanguage?: 'ru'|'en'|'multi', onAdded?: (site) => void }} opts
 * onAdded вызывается с только что созданным сайтом ({id, name, url, language, enabled}) —
 * вызывающий код (Settings.js) сам добавляет его в локальный список и перерисовывает секцию.
 */
export function openAddStreamingSiteModal(opts = {}) {
  if (document.getElementById('hb-modal-overlay')) return;

  injectAddSiteCSS();
  injectModalCSS();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="hb-modal-overlay">
      <div id="hb-modal-box" class="hb-add-site-box">
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
