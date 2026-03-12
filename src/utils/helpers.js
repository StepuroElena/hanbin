/**
 * HANBIN — Utility helpers
 */

import { t } from '../i18n/index.js';

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
  if (!rating) return `<span style="color:var(--color-text-muted);font-size:11px">${t('status.plan')}</span>`;
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

/** Debounce */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
