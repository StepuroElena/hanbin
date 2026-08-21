/**
 * HANBIN — Utility helpers
 */

import { t } from '../i18n/index.js';
import { scrapeDrama } from '../api/mock.js';
import { API_BASE } from '../api/client.js';

/** Форматирует временную метку в читаемый вид (i18n-aware) */
export function timeAgo(date) {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);

  if (h < 1)  return t('activity.time.just_now');
  if (h < 24) return t('activity.time.hours_ago', { h });
  if (d === 1) return t('activity.time.yesterday');
  return t('activity.time.days_ago', { d });
}

/** Рендерит звёзды рейтинга */
export function renderStars(rating, max = 5) {
  if (!rating) return `<span style="color:var(--color-text-muted);font-size:11px;letter-spacing:0.04em">${t('status.no_rating')}</span>`;
  return Array.from({ length: max }, (_, i) =>
    `<span style="color:${i < rating ? 'var(--color-gold)' : 'rgba(245,230,211,0.2)'};font-size:11px">★</span>`
  ).join('');
}

/** Возвращает label для статуса (i18n-aware) */
export function statusLabel(status) {
  const map = {
    watching:  'status.watching',
    completed: 'status.completed',
    plan:      'status.plan',
    dropped:   'status.dropped',
  };
  return map[status] ? t(map[status]) : status;
}

/** Код страны → флаг */
export function countryFlag(code) {
  return { kr: '🇰🇷', cn: '🇨🇳', jp: '🇯🇵' }[code] || '🌍';
}

/**
 * Получает URL постера дорамы с m.doramatv.one по названию.
 * Кэширует в sessionStorage чтобы не делать лишних запросов.
 *
 * Раньше здесь был прямой fetch на m.doramatv.one через сторонний CORS-прокси (corsproxy.io) —
 * тот сломался в проде: бесплатный тариф corsproxy.io разрешает запросы только с dev-окружений
 * (localhost, CodePen, Glitch и т.п.), продакшн-домен (hanbin-drama.com) получал 403 по всем
 * постерам разом. Бэк уже умеет ходить на этот сайт сам через GET /api/v1/dramas/scrape
 * (server-to-server — никакого CORS вообще, плюс кеш на 14 дней) — переиспользуем этот же
 * эндпоинт вместо ещё одного стороннего бесплатного сервиса, который может так же сломаться.
 *
 * @param {string} title  — название дорамы (на любом языке)
 * @param {string} [watchUrl] — ссылка на дораму (пока не используется, оставлено для расширения)
 * @returns {Promise<string|null>} — URL постера (уже завёрнутый через /dramas/poster-proxy) или null если не найдено
 */
export async function fetchPoster(title, watchUrl) {
  if (!title) return null;

  const cacheKey = `hanbin_poster_${title.toLowerCase().trim()}`;
  const cached = sessionStorage.getItem(cacheKey);
  // null строкой означает «точно не найдено» — не повторяем запрос
  if (cached !== null) return cached === 'null' ? null : cached;

  const { data } = await scrapeDrama(title, 'https://m.doramatv.one');
  const rawPoster = data?.poster_url || null;

  // Прямой hotlink на CDN картинок doramatv часто защищён проверкой Referer — заворачиваем
  // через тот же /dramas/poster-proxy, что уже используется в adaptDramaFromApi/adaptRandomPickFromApi,
  // иначе сам <img src="..."> может словить 403 даже с рабочим URL постера.
  const poster = rawPoster ? `${API_BASE}/dramas/poster-proxy?url=${encodeURIComponent(rawPoster)}` : null;

  sessionStorage.setItem(cacheKey, poster ?? 'null');
  return poster;
}

/**
 * Генерирует data URI дефолтного постера как inline SVG.
 * Никаких файлов на нашей стороне — чистый JS.
 */
export function defaultPosterURI() {
  const label = t('poster.no_poster');
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">',
    '<defs>',
    '<linearGradient id="bg" x1="0" y1="1" x2="0" y2="0">',
    '<stop offset="0%" stop-color="#0a0310"/>',
    '<stop offset="55%" stop-color="#241030"/>',
    '<stop offset="100%" stop-color="#3a1240"/>',
    '</linearGradient>',
    '<radialGradient id="gc" cx="50%" cy="52%" r="42%">',
    '<stop offset="0%" stop-color="#c97b8a" stop-opacity="0.45"/>',
    '<stop offset="100%" stop-color="#c97b8a" stop-opacity="0"/>',
    '</radialGradient>',
    '<radialGradient id="gt" cx="50%" cy="5%" r="55%">',
    '<stop offset="0%" stop-color="#7aab8e" stop-opacity="0.2"/>',
    '<stop offset="100%" stop-color="#7aab8e" stop-opacity="0"/>',
    '</radialGradient>',
    '<linearGradient id="fr" x1="0" y1="0" x2="1" y2="1">',
    '<stop offset="0%" stop-color="#c97b8a" stop-opacity="0.9"/>',
    '<stop offset="50%" stop-color="#d4a574" stop-opacity="0.6"/>',
    '<stop offset="100%" stop-color="#7aab8e" stop-opacity="0.7"/>',
    '</linearGradient>',
    '<linearGradient id="pl" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0%" stop-color="#f5e6d3" stop-opacity="0.5"/>',
    '<stop offset="100%" stop-color="#c97b8a" stop-opacity="0.25"/>',
    '</linearGradient>',
    '</defs>',
    '<rect width="200" height="300" fill="url(#bg)"/>',
    '<rect width="200" height="300" fill="url(#gc)"/>',
    '<rect width="200" height="300" fill="url(#gt)"/>',
    '<line x1="0" y1="0" x2="200" y2="300" stroke="#c97b8a" stroke-width="0.5" stroke-opacity="0.18"/>',
    '<line x1="200" y1="0" x2="0" y2="300" stroke="#7aab8e" stroke-width="0.5" stroke-opacity="0.18"/>',
    '<rect x="10" y="10" width="180" height="280" rx="5" fill="none" stroke="url(#fr)" stroke-width="1.4"/>',
    '<rect x="16" y="16" width="168" height="268" rx="3.5" fill="none" stroke="url(#fr)" stroke-width="0.6" stroke-opacity="0.6"/>',
    '<line x1="10" y1="26" x2="10" y2="10" stroke="#c97b8a" stroke-width="2" stroke-opacity="0.9" stroke-linecap="round"/>',
    '<line x1="10" y1="10" x2="26" y2="10" stroke="#c97b8a" stroke-width="2" stroke-opacity="0.9" stroke-linecap="round"/>',
    '<line x1="174" y1="10" x2="190" y2="10" stroke="#c97b8a" stroke-width="2" stroke-opacity="0.9" stroke-linecap="round"/>',
    '<line x1="190" y1="10" x2="190" y2="26" stroke="#c97b8a" stroke-width="2" stroke-opacity="0.9" stroke-linecap="round"/>',
    '<line x1="10" y1="274" x2="10" y2="290" stroke="#7aab8e" stroke-width="2" stroke-opacity="0.8" stroke-linecap="round"/>',
    '<line x1="10" y1="290" x2="26" y2="290" stroke="#7aab8e" stroke-width="2" stroke-opacity="0.8" stroke-linecap="round"/>',
    '<line x1="174" y1="290" x2="190" y2="290" stroke="#7aab8e" stroke-width="2" stroke-opacity="0.8" stroke-linecap="round"/>',
    '<line x1="190" y1="274" x2="190" y2="290" stroke="#7aab8e" stroke-width="2" stroke-opacity="0.8" stroke-linecap="round"/>',
    '<ellipse cx="100" cy="131" rx="8" ry="15" fill="url(#pl)" stroke="#f5e6d3" stroke-width="0.7" stroke-opacity="0.7" transform="rotate(0 100 150)"/>',
    '<ellipse cx="100" cy="131" rx="8" ry="15" fill="url(#pl)" stroke="#f5e6d3" stroke-width="0.7" stroke-opacity="0.7" transform="rotate(72 100 150)"/>',
    '<ellipse cx="100" cy="131" rx="8" ry="15" fill="url(#pl)" stroke="#f5e6d3" stroke-width="0.7" stroke-opacity="0.7" transform="rotate(144 100 150)"/>',
    '<ellipse cx="100" cy="131" rx="8" ry="15" fill="url(#pl)" stroke="#f5e6d3" stroke-width="0.7" stroke-opacity="0.7" transform="rotate(216 100 150)"/>',
    '<ellipse cx="100" cy="131" rx="8" ry="15" fill="url(#pl)" stroke="#f5e6d3" stroke-width="0.7" stroke-opacity="0.7" transform="rotate(288 100 150)"/>',
    '<circle cx="100" cy="150" r="6.5" fill="#c97b8a" fill-opacity="0.6"/>',
    '<circle cx="100" cy="150" r="3.5" fill="#f5e6d3" fill-opacity="0.75"/>',
    '<circle cx="100" cy="150" r="1.5" fill="#fff" fill-opacity="0.6"/>',
    '<line x1="46" y1="200" x2="154" y2="200" stroke="#c97b8a" stroke-width="0.8" stroke-opacity="0.55"/>',
    '<line x1="64" y1="205" x2="136" y2="205" stroke="#c97b8a" stroke-width="0.4" stroke-opacity="0.3"/>',
    `<text x="100" y="224" font-family="Georgia,serif" font-size="10" fill="#f5e6d3" fill-opacity="0.65" text-anchor="middle" letter-spacing="4">${label}</text>`,
    '<text x="30" y="28" font-family="serif" font-size="9" fill="#c97b8a" fill-opacity="0.55" text-anchor="middle">✦</text>',
    '<text x="170" y="28" font-family="serif" font-size="9" fill="#c97b8a" fill-opacity="0.55" text-anchor="middle">✦</text>',
    '<text x="30" y="284" font-family="serif" font-size="9" fill="#7aab8e" fill-opacity="0.5" text-anchor="middle">✦</text>',
    '<text x="170" y="284" font-family="serif" font-size="9" fill="#7aab8e" fill-opacity="0.5" text-anchor="middle">✦</text>',
    '</svg>',
  ].join('');
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/** Debounce */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** Фиксированный список озвучек — общий для модалки добавления дорамы и табличного вида. */
export const VOICEOVER_OPTIONS = ['Light Breeze', 'SlothSound', 'DubLik.TV', 'SoftBox', 'AniMaunt', 'STEPonee'];
