/**
 * HANBIN — Stats Block Component
 * Hero-секция с большими числами и цитатой дня из дорамы
 */

import { getUser } from '../api/mock.js';
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
  const { data: user } = await getUser();
  const { stats } = user;

  const fallbackRu = { emoji: '🕯️', text: '«Даже самая долгая ночь в конце концов встречает рассвет.»', source: 'Нирвана в огне · 2015' };
  const fallbackEn = { emoji: '🕯️', text: '«Even the longest night will eventually meet the dawn.»', source: 'Nirvana in Fire · 2015' };

  let quote = await getDailyQuote().catch(() => fallbackRu);

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

          <div class="stat-card glass-card" data-stat="episodes">
            <div class="stat-label">${t('stats.total_episodes')}</div>
            <div class="stat-number" id="stat-episodes">${stats.totalEpisodes.toLocaleString()}</div>
            <div class="stat-unit">${t('stats.episodes_unit')}</div>
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
    animateNumber(container.querySelector('#stat-episodes'), stats.totalEpisodes);
    animateNumber(container.querySelector('#stat-hours'), stats.totalHours);
  }

  render();
  onLangChange(async () => await render());
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
