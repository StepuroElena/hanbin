/**
 * HANBIN — Unauthorized Page
 * Публичная главная страница для незалогиненного пользователя.
 *
 * Содержит:
 *  - Хедер с кнопкой «Войти»
 *  - Hero-секция с CTA
 *  - Цитата дня (из /data/quotes.json, та же логика что в StatsBlock)
 *  - Сетка последних дорам с doramyclub.art (без фильтров и тегов)
 *  - Баннер-призыв залогиниться
 */

import { getLatestDramas } from '../api/mock.js';
import { navigate }        from '../router.js';

// ─── Цитата дня ──────────────────────────────
/**
 * Загружает цитату дня из /data/quotes.json.
 * Та же детерминированная логика что в StatsBlock.js:
 * индекс = числовое представление даты YYYYMMDD % длина массива.
 * Меняется раз в сутки, одинакова для всех пользователей.
 */
async function getDailyQuote() {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  // Проверяем кэш
  try {
    const cached = JSON.parse(localStorage.getItem('hanbin_daily_quote') || 'null');
    if (cached && cached.date === today) return cached.quote;
  } catch (_) { /* битый localStorage — игнорируем */ }

  const res    = await fetch('/data/quotes.json');
  const quotes = await res.json();

  const seed  = Number(today.replace(/-/g, '')); // "20260307" → 20260307
  const quote = quotes[seed % quotes.length];

  try {
    localStorage.setItem('hanbin_daily_quote', JSON.stringify({ date: today, quote }));
  } catch (_) { /* private mode — ничего страшного */ }

  return quote;
}

// ─── Рендер ──────────────────────────────────
export async function renderUnauthorized(container) {
  container.innerHTML = `
    <div id="unauthorized-header-slot"></div>
    <div class="container">
      <div id="unauthorized-hero-slot"></div>
      <div id="unauthorized-daily-quote-slot"></div>
      <div id="unauthorized-latest-dramas-slot"></div>
      <div id="unauthorized-login-banner-slot"></div>
    </div>
  `;

  await Promise.all([
    renderUnauthorizedHeader(container.querySelector('#unauthorized-header-slot')),
    renderHeroSection(container.querySelector('#unauthorized-hero-slot')),
    renderDailyQuoteSection(container.querySelector('#unauthorized-daily-quote-slot')),
    renderLatestDramas(container.querySelector('#unauthorized-latest-dramas-slot')),
    renderLoginBanner(container.querySelector('#unauthorized-login-banner-slot')),
  ]);
}

// ─── Хедер ───────────────────────────────────
function renderUnauthorizedHeader(container) {
  container.innerHTML = `
    <header class="header">
      <div class="header__logo">
        <a href="#/guest" class="logo-link">
          <div class="logo-name">han<span>bin</span></div>
          <div class="logo-tagline">Трекер дорам</div>
        </a>
      </div>

      <div class="header__right">
        <div class="search-bar" id="unauthorized-search-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" id="unauthorized-search-input" placeholder="Поиск дорам…" autocomplete="off">
        </div>

        <button class="btn-login-header" id="unauthorized-login-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Войти
        </button>
      </div>
    </header>
  `;

  container.querySelector('#unauthorized-login-btn').addEventListener('click', () => {
    navigate('#/login');
  });
}

// ─── Hero ─────────────────────────────────────
function renderHeroSection(container) {
  container.innerHTML = `
    <section class="unauthorized-hero">
      <div class="unauthorized-hero__eyebrow">
        <span class="unauthorized-hero__eyebrow-dot"></span>
        Трекер дорам для настоящих ценителей ✦
      </div>
      <h1 class="unauthorized-hero__title">Твой личный<br><em>дневник дорам</em></h1>
      <p class="unauthorized-hero__subtitle">
        Отслеживай просмотренные, планируй следующие, делись впечатлениями. Всё в одном месте.
      </p>
      <button class="unauthorized-hero__cta-btn" id="unauthorized-hero-login-btn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        Войти в профиль
      </button>
    </section>
  `;

  container.querySelector('#unauthorized-hero-login-btn').addEventListener('click', () => {
    navigate('#/login');
  });
}

// ─── Цитата дня ──────────────────────────────
async function renderDailyQuoteSection(container) {
  // Показываем fallback пока грузим
  container.innerHTML = `
    <div class="unauthorized-daily-quote">
      <div class="unauthorized-daily-quote__label">Цитата дня</div>
      <div class="unauthorized-daily-quote__card" id="unauthorized-daily-quote-card">
        <span class="unauthorized-daily-quote__emoji" id="unauthorized-daily-quote-emoji">🌸</span>
        <div class="unauthorized-daily-quote__body">
          <p class="unauthorized-daily-quote__text" id="unauthorized-daily-quote-text">Загрузка…</p>
          <span class="unauthorized-daily-quote__source" id="unauthorized-daily-quote-source"></span>
        </div>
      </div>
    </div>
  `;

  const fallbackQuote = {
    emoji: '🕯️',
    text: '«Даже самая долгая ночь в конце концов встречает рассвет.»',
    source: 'Нирвана в огне · 2015',
  };

  const quote = await getDailyQuote().catch(() => fallbackQuote);

  container.querySelector('#unauthorized-daily-quote-emoji').textContent  = quote.emoji;
  container.querySelector('#unauthorized-daily-quote-text').textContent   = quote.text;
  container.querySelector('#unauthorized-daily-quote-source').textContent = quote.source;
}

// ─── Последние дорамы ─────────────────────────
async function renderLatestDramas(container) {
  container.innerHTML = `
    <section class="section unauthorized-latest-dramas">
      <div class="section-header">
        <div class="section-title">Последние дорамы</div>
        <span class="unauthorized-latest-dramas__source-label">с doramyclub.art</span>
      </div>
      <div class="unauthorized-latest-dramas__grid" id="unauthorized-dramas-grid">
        <div class="loading-dots">Загрузка…</div>
      </div>
    </section>
  `;

  const { data: dramas } = await getLatestDramas();

  const grid = container.querySelector('#unauthorized-dramas-grid');
  grid.innerHTML = dramas.map(d => unauthorizedDramaCardHTML(d)).join('');

  // Анимация появления карточек
  grid.querySelectorAll('.unauthorized-drama-card').forEach((card, i) => {
    card.style.animation = `fadeUp 0.5s ${0.05 + i * 0.05}s ease both`;
  });
}

/** HTML одной карточки дорамы (без прогресса, статуса, рейтинга) */
function unauthorizedDramaCardHTML(drama) {
  const episodeBadge = drama.latestEpisode
    ? `<span class="badge badge--ep">EP ${drama.latestEpisode}</span>`
    : '';
  const ongoingBadge = drama.ongoing
    ? `<span class="badge badge--ongoing">Выходит</span>`
    : '';
  const newBadge = drama.isNew
    ? `<span class="badge badge--new">Новинка</span>`
    : '';

  return `
    <div class="unauthorized-drama-card" data-id="${drama.id}">
      <div class="card-cover">
        <img src="${drama.cover}" alt="${drama.title}" loading="lazy">
        <div class="card-cover-overlay"></div>
        <div class="card-badges">
          ${episodeBadge}${ongoingBadge}${newBadge}
        </div>
        <button class="card-watch-btn" title="Смотреть">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
        </button>
      </div>
      <div class="card-info">
        <div class="card-title">${drama.title}</div>
        <div class="card-meta">
          <span class="card-year">${drama.year}</span>
          <span class="card-genre">${drama.genres[0]}</span>
        </div>
      </div>
    </div>
  `;
}

// ─── Баннер «войди» ───────────────────────────
function renderLoginBanner(container) {
  container.innerHTML = `
    <div class="unauthorized-login-banner">
      <div class="unauthorized-login-banner__left">
        <span class="unauthorized-login-banner__icon">🔐</span>
        <div>
          <div class="unauthorized-login-banner__title">Начни отслеживать свои дорамы</div>
          <div class="unauthorized-login-banner__subtitle">
            Войди в профиль, чтобы добавлять в список, ставить оценки и следить за прогрессом
          </div>
        </div>
      </div>
      <button class="unauthorized-login-banner__btn" id="unauthorized-banner-login-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        Войти
      </button>
    </div>
  `;

  container.querySelector('#unauthorized-banner-login-btn').addEventListener('click', () => {
    navigate('#/login');
  });
}
