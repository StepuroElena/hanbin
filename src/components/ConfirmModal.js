/**
 * HANBIN — Confirm Modal
 *
 * Общая модалка подтверждения опасного действия (удаление озвучки, категории и т.п.).
 * Использует тот же общий оверлей #hb-modal-overlay и стили, что и остальные модалки (LoginModal.js).
 * Само действие выполняется внутри модалки: кнопка показывает «Удаляем…», при ошибке модалка
 * остаётся открытой и показывает текст ошибки, при успехе — закрывается.
 */

import { closeModal, injectModalCSS } from './LoginModal.js';
import { t } from '../i18n/index.js';

const CONFIRM_CSS = `
  #hb-modal-box.hb-confirm-box { width: 380px; }
  .hb-confirm-title {
    font-family: var(--font-display, 'Cormorant Garamond', serif); font-size: 24px; font-weight: 400;
    color: var(--color-text, #f5e6d3); margin: 4px 0 10px; line-height: 1.25;
  }
  .hb-confirm-text { font-size: 13px; line-height: 1.55; color: rgba(245,230,211,0.6); margin-bottom: 22px; }
  .hb-confirm-actions { display: flex; flex-direction: column; gap: 8px; }
  #hb-modal-box .hb-btn-primary.hb-btn-danger { background: linear-gradient(135deg, #b8546a, #e06a84); cursor: pointer; }
  #hb-modal-box .hb-btn-primary.hb-btn-danger:hover:not(:disabled) { opacity: 0.9; }
`;

function injectConfirmCSS() {
  if (document.getElementById('hb-confirm-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-confirm-css';
  style.textContent = CONFIRM_CSS;
  document.head.appendChild(style);
}

const escapeHTML = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Открывает модалку подтверждения.
 * @param {{
 *   title: string,
 *   text?: string,
 *   confirmLabel?: string,
 *   onConfirm: () => Promise<{ error?: string|null } | void>,
 *   onDone?: () => void,
 * }} opts
 *  onConfirm — само действие (напр. запрос на удаление). Вернул error — модалка покажет его и останется открытой.
 *  onDone    — вызывается после успешного действия и закрытия модалки.
 */
export function openConfirmModal({ title, text = '', confirmLabel = t('confirm_modal.delete'), onConfirm, onDone } = {}) {
  if (document.getElementById('hb-modal-overlay')) return;

  injectModalCSS();
  injectConfirmCSS();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="hb-modal-overlay">
      <div id="hb-modal-box" class="hb-confirm-box">
        <button id="hb-modal-close" aria-label="${t('modal.close')}">×</button>
        <div id="hb-modal-content">
          <div class="hb-confirm-title">${escapeHTML(title)}</div>
          ${text ? `<div class="hb-confirm-text">${escapeHTML(text)}</div>` : ''}
          <div class="hb-field-error" id="hb-confirm-error" style="text-align:center;margin-bottom:8px"></div>
          <div class="hb-confirm-actions">
            <button class="hb-btn-primary hb-btn-danger" id="hb-confirm-ok">${escapeHTML(confirmLabel)}</button>
            <button class="hb-btn-secondary" id="hb-confirm-cancel">${t('confirm_modal.cancel')}</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper.firstElementChild);

  const okBtn = document.getElementById('hb-confirm-ok');
  const errorEl = document.getElementById('hb-confirm-error');
  let busy = false;

  const onKeydown = e => { if (e.key === 'Escape' && !busy) close(); };
  function close() {
    document.removeEventListener('keydown', onKeydown);
    closeModal();
  }

  document.addEventListener('keydown', onKeydown);
  document.getElementById('hb-modal-close').addEventListener('click', () => { if (!busy) close(); });
  document.getElementById('hb-confirm-cancel').addEventListener('click', () => { if (!busy) close(); });
  document.getElementById('hb-modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'hb-modal-overlay' && !busy) close();
  });

  okBtn.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    okBtn.disabled = true;
    okBtn.textContent = t('confirm_modal.deleting');
    errorEl.textContent = '';

    const result = await onConfirm?.();
    busy = false;

    if (result?.error) {
      errorEl.textContent = result.error;
      okBtn.disabled = false;
      okBtn.textContent = confirmLabel;
      return;
    }

    close();
    onDone?.();
  });

  setTimeout(() => okBtn.focus(), 80);
}
