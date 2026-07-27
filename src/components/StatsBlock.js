/**
 * HANBIN — Stats Block Component
 * Hero-секция с большими числами и цитатой дня из дорамы
 */

import { getStats } from '../api/mock.js';
import { t, getLang, onLangChange } from '../i18n/index.js';

/**
 * Загружает цитату дня.
 * Берётся из localStorage если уже выбрана сегодня,
 * иначе — из data/quotes.json. Меняется раз в сутки.
 */
async function getDailyQuote() {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  // Кешируем только сырые данные (без локализации).
  // Если кеш не содержит поля .en — он устаревший (до добавления i18n), сбрасываем.
  let quote;
  try {
    const stored = JSON.parse(localStorage.getItem('hanbin_daily_quote') || 'null');
    if (stored && stored.date === today && stored.quote?.en) {
      quote = stored.quote;
    }
  } catch (_) { /* битый localStorage — игнорируем */ }

  if (!quote) {
    const res = await fetch('/data/quotes.json');
    const quotes = await res.json();
    const seed = Number(today.replace(/-/g, ''));
    quote = quotes[seed % quotes.length];
    try {
      localStorage.setItem('hanbin_daily_quote', JSON.stringify({ date: today, quote }));
    } catch (_) { /* private mode — ничего страшного */ }
  }

  // Локализуем на лету
  const lang = getLang();
  if (lang === 'en' && quote.en) {
    return { emoji: quote.emoji, text: quote.en.text, source: quote.en.source };
  }
  return { emoji: quote.emoji, text: quote.text, source: quote.source };
}

export async function renderStatsBlock(container) {
  // Скелетон сразу — не ждём getStats() (это реальный запрос к бэку).
  // Функция возвращается быстро, а реальные цифры подставляются ниже в фоне.
  container.innerHTML = `
    <section class="hero-section">
      <div class="stats-grid">
        <div class="stat-card glass-card"><div class="stat-label">${t('stats.dramas_watched')}</div><div class="stat-number stat-number--shimmer">···</div><div class="stat-unit">${t('stats.dramas_unit')}</div></div>
        <div class="stat-card glass-card"><div class="stat-label">${t('stats.dramas_planned')}</div><div class="stat-number">···</div><div class="stat-unit">${t('stats.planned_unit')}</div></div>
        <div class="stat-card glass-card"><div class="stat-label">${t('stats.hours')}</div><div class="stat-number">···</div><div class="stat-unit">${t('stats.hours_unit')}</div></div>
        <div class="quote-card"><div class="quote-emoji">✨</div><div class="quote-text">…</div><div class="quote-sub"></div></div>
      </div>
    </section>
  `;

  const fallbackRu = { emoji: '🕯️', text: '«Даже самая долгая ночь в конце концов встречает рассвет.»', source: 'Нирвана в огне · 2015' };
  const fallbackEn = { emoji: '🕯️', text: '«Even the longest night will eventually meet the dawn.»', source: 'Nirvana in Fire · 2015' };

  // Оба запроса идут параллельно — не ждём один через другой.
  // quote — let, потому что переприсваивается внутри render() при каждой смене языка.
  const [{ data: stats }, dailyQuote] = await Promise.all([
    getStats(),
    getDailyQuote().catch(() => fallbackRu),
  ]);
  let quote = dailyQuote;

  async function render() {
    // При каждом ре-рендере перечитываем цитату с актуальным языком
    quote = await getDailyQuote().catch(() =>
      getLang() === 'en' ? fallbackEn : fallbackRu
    );
    container.innerHTML = `
      <section class="hero-section">
        <div class="stats-grid">
          <div class="stat-card glass-card" data-stat="dramas">
            <div class="stat-label">${t('stats.dramas_watched')}</div>
            <div class="stat-number stat-number--shimmer" id="stat-dramas">${stats.dramasWatched}</div>
            <div class="stat-unit">${t('stats.dramas_unit')}</div>
          </div>

          <div class="stat-card glass-card" data-stat="planned">
            <div class="stat-label">${t('stats.dramas_planned')}</div>
            <div class="stat-number" id="stat-planned">${stats.dramasPlanned.toLocaleString()}</div>
            <div class="stat-unit">${t('stats.planned_unit')}</div>
          </div>

          <div class="stat-card glass-card" data-stat="hours">
            <div class="stat-label">${t('stats.hours')}</div>
            <div class="stat-number" id="stat-hours">${stats.totalHours.toLocaleString()}</div>
            <div class="stat-unit">${t('stats.hours_unit')}</div>
          </div>

          <div class="quote-card" data-stat="quote">
            <div class="quote-emoji">${quote.emoji}</div>
            <div class="quote-text">${quote.text}</div>
            <div class="quote-sub">${quote.source} ✦</div>
          </div>
        </div>
      </section>
    `;

    // Animate numbers counting up
    animateNumber(container.querySelector('#stat-dramas'), stats.dramasWatched);
    animateNumber(container.querySelector('#stat-planned'), stats.dramasPlanned);
    animateNumber(container.querySelector('#stat-hours'), stats.totalHours);
  }

  render();
  onLangChange(async () => await render());
}

/**
 * Лёгкое обновление только цифр в уже отрендеренном блоке статистики — используется после изменения статуса/сезонов/серий
 * в таблице дорам (событие hanbin:stats-changed в Home.js) — в отличие от renderStatsBlock НЕ стирает
 * разметку в скелетон, не трогает карточку цитаты и не дергает остальные элементы страницы —
 * только сами числа плавно пересчитываются к новому значению (тот же эффект, что и у фильмов).
 */
export async function refreshStatsNumbers(container) {
  if (!container) return;

  const dramasEl  = container.querySelector('#stat-dramas');
  const plannedEl = container.querySelector('#stat-planned');
  const hoursEl   = container.querySelector('#stat-hours');

  // Блок ещё ни разу не рендерился (например первый заход на страницу) — нечего
  // обновлять точечно, делаем полный рендер как обычно.
  if (!dramasEl || !plannedEl || !hoursEl) {
    return renderStatsBlock(container);
  }

  const { data: stats } = await getStats();
  if (!stats) return;

  animateNumber(dramasEl, stats.dramasWatched);
  animateNumber(plannedEl, stats.dramasPlanned);
  animateNumber(hoursEl, stats.totalHours);
}

function animateNumber(el, target) {
  if (!el) return;
  let current = 0;
  const duration = 1000;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    current = Math.floor(eased * target);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}
