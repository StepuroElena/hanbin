/**
 * HANBIN — Favicon Manager
 * Управляет фавиконом динамически.
 * Чтобы сменить фавикон в любом месте приложения:
 *
 *   import { setFavicon } from '../utils/favicon.js';
 *   setFavicon('assets/favicon-special.svg');
 */

const DEFAULT_FAVICON = '/assets/favicon.svg';

/**
 * Устанавливает фавикон по пути к файлу
 * @param {string} href — путь к SVG/PNG файлу
 */
export function setFavicon(href = DEFAULT_FAVICON) {
  let link = document.querySelector("link[rel~='icon']");

  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  link.type = href.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
  link.href = href;
}

/**
 * Сбрасывает фавикон к дефолтному
 */
export function resetFavicon() {
  setFavicon(DEFAULT_FAVICON);
}
