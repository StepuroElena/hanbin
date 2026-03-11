/**
 * HANBIN — Unauthorized Page
 * Парсит "Горячие новинки" с m.doramatv.one через corsproxy.io.
 */

import { openLoginModal } from '../components/LoginModal.js';
import { t, getLang, onLangChange } from '../i18n/index.js';
import { renderLangToggle } from '../components/LangToggle.js';

const SITE_URL = 'https://m.doramatv.one/';
const PROXY    = (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`;
const LIMIT    = 10;

// ─── Парсинг горячих новинок ──────────────────
async function fetchHotDramas() {
  const res  = await fetch(PROXY(SITE_URL), { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const doc     = new DOMParser().parseFromString(html, 'text/html');
  const section = Array.from(doc.querySelectorAll('.feed-section'))
    .find(s => s.querySelector('[data-tab-text="Горячие новинки"]'));

  if (!section) throw new Error('Section "Горячие новинки" not found');

  return Array.from(section.querySelectorAll('.entity-card-tile')).slice(0, LIMIT).map(card => {
    const href  = card.getAttribute('href') || '';
    const link  = href.startsWith('http') ? href : 'https://m.doramatv.one' + href;
    const title = card.querySelector('.entity-card-tile__title')?.textContent?.trim() || '—';
    const img   = card.querySelector('img');
    const cover = img?.getAttribute('data-original') || img?.getAttribute('src') || '';

    const rating = parseFloat(card.querySelector('.compact-rate')?.getAttribute('title')) || null;

    const genres = Array.from(card.querySelectorAll('.elem_genre'))
      .map(b => b.textContent.trim()).slice(0, 2);

    const popText = card.querySelector('.html-popover-holder')?.textContent || '';
    const ongoing = /выходит|аирится/i.test(popText);

    return { title, link, cover, rating, genres, ongoing };
  });
}

// ─── Цитата дня ──────────────────────────────
async function getDailyQuote() {
  const today = new Date().toISOString().slice(0, 10);

  let quote;
  try {
    const cached = JSON.parse(localStorage.getItem('hanbin_daily_quote') || 'null');
    // Если кеш не содержит .en — он устаревший (до i18n), сбрасываем.
    if (cached?.date === today && cached.quote?.en) quote = cached.quote;
  } catch (_) {}

  if (!quote) {
    const res    = await fetch('/data/quotes.json');
    const quotes = await res.json();
    const seed   = Number(today.replace(/-/g, ''));
    quote = quotes[seed % quotes.length];
    try { localStorage.setItem('hanbin_daily_quote', JSON.stringify({ date: today, quote })); } catch (_) {}
  }

  const lang = getLang();
  if (lang === 'en' && quote.en) {
    return { emoji: quote.emoji, text: quote.en.text, source: quote.en.source };
  }
  return { emoji: quote.emoji, text: quote.text, source: quote.source };
}

// ─── Главный рендер ──────────────────────────
export async function renderUnauthorized(container) {
  container.innerHTML = `
    <div id="unauth-header"></div>
    <div class="container">
      <div id="unauth-hero"></div>
      <div id="unauth-quote"></div>
      <div id="unauth-dramas"></div>
      <div id="unauth-banner"></div>
    </div>
  `;
  await Promise.all([
    _renderHeader(container.querySelector('#unauth-header')),
    _renderHero(container.querySelector('#unauth-hero')),
    _renderQuote(container.querySelector('#unauth-quote')),
    _renderDramas(container.querySelector('#unauth-dramas')),
    _renderBanner(container.querySelector('#unauth-banner')),
  ]);
}

// ─── Хедер ───────────────────────────────────
function _renderHeader(el) {
  function build() {
    el.innerHTML = `
      <header class="header">
        <div class="header__logo">
          <a href="#/guest" class="logo-link">
            <div class="logo-name">han<span>bin</span></div>
            <div class="logo-tagline">${t('header.tagline')}</div>
          </a>
        </div>
        <div class="header__right">
          <div class="search-bar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="${t('header.search_placeholder')}" autocomplete="off">
          </div>
          <div id="unauth-lang-slot"></div>
          <button class="btn-login-header" id="unauth-login-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            ${t('unauth.banner_btn').split(' / ')[0]}
          </button>
        </div>
      </header>`;

    renderLangToggle(el.querySelector('#unauth-lang-slot'));
    el.querySelector('#unauth-login-btn').addEventListener('click', openLoginModal);
  }

  build();
  onLangChange(() => build());
}

// ─── Hero ─────────────────────────────────────
function _renderHero(el) {
  function build() {
    el.innerHTML = `
      <section class="unauthorized-hero">
        <div class="unauthorized-hero__eyebrow">
          <span class="unauthorized-hero__eyebrow-dot"></span>
          ${t('unauth.eyebrow')}
        </div>
        <h1 class="unauthorized-hero__title">
          ${t('unauth.title_pre')}<br><em>${t('unauth.title_em')}</em>
          ${t('unauth.title_post') ? `<br>${t('unauth.title_post')}` : ''}
        </h1>
        <p class="unauthorized-hero__subtitle">${t('unauth.subtitle')}</p>
        <button class="unauthorized-hero__cta-btn" id="unauth-hero-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          ${t('unauth.cta')}
        </button>
      </section>`;
    el.querySelector('#unauth-hero-btn').addEventListener('click', openLoginModal);
  }

  build();
  onLangChange(() => build());
}

// ─── Цитата ───────────────────────────────────
async function _renderQuote(el) {
  function buildShell() {
    el.innerHTML = `
      <div class="unauthorized-daily-quote">
        <div class="unauthorized-daily-quote__label">${t('unauth.quote_label')}</div>
        <div class="unauthorized-daily-quote__card">
          <span id="unauth-q-emoji">🌸</span>
          <div class="unauthorized-daily-quote__body">
            <p class="unauthorized-daily-quote__text" id="unauth-q-text">${t('loading')}</p>
            <span class="unauthorized-daily-quote__source" id="unauth-q-src"></span>
          </div>
        </div>
      </div>`;
  }

  buildShell();

  const fallbackRu = { emoji: '🕯️', text: '«Даже самая долгая ночь встречает рассвет.»', source: 'Нирвана в огне · 2015' };
  const fallbackEn = { emoji: '🕯️', text: '«Even the longest night will eventually meet the dawn.»', source: 'Nirvana in Fire · 2015' };

  let q = await getDailyQuote().catch(() => fallbackRu);

  async function fillQuote() {
    q = await getDailyQuote().catch(() =>
      getLang() === 'en' ? fallbackEn : fallbackRu
    );
    el.querySelector('#unauth-q-emoji').textContent = q.emoji;
    el.querySelector('#unauth-q-text').textContent  = q.text;
    el.querySelector('#unauth-q-src').textContent   = q.source;
    const label = el.querySelector('.unauthorized-daily-quote__label');
    if (label) label.textContent = t('unauth.quote_label');
  }

  fillQuote();
  onLangChange(async () => {
    buildShell();
    await fillQuote();
  });
}

// ─── Тебе понравится ─────────────────────────
async function _renderDramas(el) {
  function buildSkeleton() {
    el.innerHTML = `
      <section class="section unauth-hot">
        <div class="section-header">
          <div class="section-title">${t('unauth.hot_title')}</div>
          <a class="unauth-hot__source" href="${SITE_URL}" target="_blank" rel="noopener">
            doramatv.one ↗
          </a>
        </div>
        <div class="unauth-hot__grid" id="unauth-hot-grid">
          ${Array.from({ length: LIMIT }).map(() => `
            <div class="unauth-card unauth-card--skeleton">
              <div class="unauth-card__cover unauth-skel-box"></div>
              <div class="unauth-card__info">
                <div class="unauth-skel-line" style="width:80%;height:12px;margin-bottom:6px"></div>
                <div class="unauth-skel-line" style="width:55%;height:9px"></div>
              </div>
            </div>`).join('')}
        </div>
      </section>`;
  }

  buildSkeleton();

  let dramas = [];
  try {
    dramas = await fetchHotDramas();
  } catch (err) {
    console.warn('[Unauthorized] fetchHotDramas failed:', err.message);
  }

  function renderDramas() {
    const titleEl = el.querySelector('.section-title');
    if (titleEl) titleEl.textContent = t('unauth.hot_title');

    const grid = el.querySelector('#unauth-hot-grid');
    if (!grid) return;

    if (!dramas.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:rgba(245,230,211,0.4);font-size:13px">
          ${t('loading').replace('…', '')}... 
          <a href="${SITE_URL}" target="_blank" rel="noopener" style="color:#c97b8a;margin-left:6px">doramatv.one ↗</a>
        </div>`;
      return;
    }

    grid.innerHTML = dramas.map((d, i) => _cardHTML(d, i)).join('');

    grid.querySelectorAll('.unauth-card').forEach((card, i) => {
      card.addEventListener('click', () => window.open(dramas[i]?.link || SITE_URL, '_blank', 'noopener'));
      card.querySelector('.unauth-card__ext-btn')?.addEventListener('click', e => {
        e.stopPropagation();
        window.open(dramas[i]?.link || SITE_URL, '_blank', 'noopener');
      });
    });
  }

  renderDramas();
  onLangChange(() => renderDramas());
}

// ─── HTML карточки ────────────────────────────
function _cardHTML(d, i) {
  const fallback = `https://picsum.photos/seed/${encodeURIComponent(d.title)}/300/450`;
  const cover    = d.cover || fallback;

  const ratingHTML = d.rating != null
    ? `<div class="unauth-card__rating">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#d4a574"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        ${d.rating.toFixed(1)}
       </div>`
    : '';

  const statusBadge = d.ongoing
    ? `<span class="badge badge--ongoing">${t('status.ongoing')}</span>`
    : `<span class="badge badge--completed">${t('status.completed')}</span>`;

  const genre = d.genres?.[0] || '';

  return `
    <div class="unauth-card" style="animation:fadeUp 0.45s ${0.04 + i * 0.05}s ease both" title="${d.title}">
      <div class="unauth-card__cover">
        <img src="${cover}" alt="${d.title}" loading="lazy"
             onerror="this.onerror=null;this.src='${fallback}'">
        <div class="unauth-card__overlay"></div>
        <div class="unauth-card__badges">${statusBadge}</div>
        <button class="unauth-card__ext-btn" title="↗">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M7 17L17 7M17 7H7M17 7v10"/>
          </svg>
        </button>
        ${ratingHTML}
      </div>
      <div class="unauth-card__info">
        <div class="card-title">${d.title}</div>
        <div class="card-meta">
          ${genre ? `<span class="card-genre">${genre}</span>` : ''}
        </div>
      </div>
    </div>`;
}

// ─── Баннер ───────────────────────────────────
function _renderBanner(el) {
  function build() {
    el.innerHTML = `
      <div class="unauthorized-login-banner">
        <div class="unauthorized-login-banner__left">
          <span class="unauthorized-login-banner__icon">🔐</span>
          <div>
            <div class="unauthorized-login-banner__title">${t('unauth.banner_title')}</div>
            <div class="unauthorized-login-banner__subtitle">${t('unauth.banner_sub')}</div>
          </div>
        </div>
        <button class="unauthorized-login-banner__btn" id="unauth-banner-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          ${t('unauth.banner_btn')}
        </button>
      </div>`;
    el.querySelector('#unauth-banner-btn').addEventListener('click', openLoginModal);
  }

  build();
  onLangChange(() => build());
}
