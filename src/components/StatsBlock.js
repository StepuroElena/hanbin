/**
 * HANBIN — Stats Block Component
 * Hero-секция с большими числами и цитатой дня из дорамы
 */

import { getUser } from '../api/mock.js';

/**
 * Загружает цитату дня.
 * Берётся из localStorage если уже выбрана сегодня,
 * иначе — из data/quotes.json. Меняется раз в сутки.
 */
async function getDailyQuote() {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  try {
    const stored = JSON.parse(localStorage.getItem('hanbin_daily_quote') || 'null');
    if (stored && stored.date === today) return stored.quote;
  } catch (_) { /* битый localStorage — игнорируем */ }

  const res = await fetch('/data/quotes.json');
  const quotes = await res.json();

  // Детерминированный индекс по дате — одна цитата в день для всех
  const seed = Number(today.replace(/-/g, '')); // "20260305" → 20260305
  const quote = quotes[seed % quotes.length];

  try {
    localStorage.setItem('hanbin_daily_quote', JSON.stringify({ date: today, quote }));
  } catch (_) { /* private mode — ничего страшного */ }

  return quote;
}

export async function renderStatsBlock(container) {
  const [{ data: user }, quote] = await Promise.all([
    getUser(),
    getDailyQuote().catch(() => ({
      emoji: '🕯️',
      text: '«Даже самая долгая ночь в конце концов встречает рассвет.»',
      source: 'Нирвана в огне · 2015',
    })),
  ]);

  const { stats } = user;

  container.innerHTML = `
    <section class="hero-section">
      <div class="stats-grid">
        <div class="stat-card glass-card" data-stat="dramas">
          <div class="stat-label">Dramas watched</div>
          <div class="stat-number stat-number--shimmer" id="stat-dramas">${stats.dramasWatched}</div>
          <div class="stat-unit">completed series</div>
        </div>

        <div class="stat-card glass-card" data-stat="episodes">
          <div class="stat-label">Total episodes</div>
          <div class="stat-number" id="stat-episodes">${stats.totalEpisodes.toLocaleString()}</div>
          <div class="stat-unit">episodes devoured</div>
        </div>

        <div class="stat-card glass-card" data-stat="hours">
          <div class="stat-label">Hours of drama</div>
          <div class="stat-number" id="stat-hours">${stats.totalHours.toLocaleString()}</div>
          <div class="stat-unit">hours of pure bliss</div>
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
