/**
 * HANBIN — Utility helpers
 */

/** Форматирует временную метку в читаемый вид */
export function timeAgo(date) {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);

  if (h < 1)  return 'Только что';
  if (h < 24) return `${h}ч назад`;
  if (d === 1) return 'Вчера';
  return `${d} дн. назад`;
}

/** Рендерит звёзды рейтинга */
export function renderStars(rating, max = 5) {
  if (!rating) return '<span style="color:var(--color-text-muted);font-size:11px">Без оценки</span>';
  return Array.from({ length: max }, (_, i) =>
    `<span style="color:${i < rating ? 'var(--color-gold)' : 'rgba(245,230,211,0.2)'};font-size:11px">★</span>`
  ).join('');
}

/** Возвращает label для статуса */
export function statusLabel(status) {
  return {
    watching:  '▶ Смотрю',
    completed: '✓ Просмотрено',
    plan:      'Запланировано',
    dropped:   'Брошено',
  }[status] || status;
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
