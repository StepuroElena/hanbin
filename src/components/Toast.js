/**
 * HANBIN — Toast Notifications
 *
 * Минимальный тост для разовых сообщений, не завязанных на модалку (напр. «ссылка
 * восстановления устарела» — сама модалка смены пароля в этом случае вообще не открывается).
 * Не переиспользует #hb-modal-overlay — плавает поверх чего угодно, включая пустую главную.
 */

let hideTimeout = null;

/**
 * @param {string} message
 * @param {'info'|'error'} type
 */
export function showToast(message, type = 'info') {
  injectToastCSS();

  document.getElementById('hb-toast')?.remove();
  if (hideTimeout) clearTimeout(hideTimeout);

  const toast = document.createElement('div');
  toast.id = 'hb-toast';
  toast.className = `hb-toast hb-toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('hb-toast--visible'));

  hideTimeout = setTimeout(() => {
    toast.classList.remove('hb-toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    // Фолбэк на случай если transitionend не сработает (напр. вкладка в фоне)
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

function injectToastCSS() {
  if (document.getElementById('hb-toast-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-toast-css';
  style.textContent = `
    .hb-toast {
      position: fixed; top: 24px; left: 50%; z-index: 10000;
      max-width: min(360px, calc(100vw - 32px)); padding: 14px 20px;
      border-radius: 14px;
      background: linear-gradient(145deg, rgba(74,25,66,0.97), rgba(45,15,42,0.99));
      border: 1px solid rgba(201,123,138,0.3);
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      color: #f5e6d3; font-family: 'DM Sans', sans-serif; font-size: 13px; line-height: 1.5;
      opacity: 0; transform: translateX(-50%) translateY(-16px);
      transition: opacity 0.25s ease, transform 0.25s ease;
      pointer-events: none;
    }
    .hb-toast--visible { opacity: 1; transform: translateX(-50%) translateY(0); }
    .hb-toast--error { border-color: rgba(255,107,138,0.5); }
  `;
  document.head.appendChild(style);
}
