/**
 * HANBIN — Public Profile Page
 *
 * Read-only страница чужого списка фильмов, доступная БЕЗ логина — #/u/:id.
 * Это и есть growth-петля шаринга: пользователь А жмёт «Поделиться» на странице
 * Фильмов → получает эту ссылку → отправляет другу → друг видит список без регистрации →
 * внизу CTA "Заведи свой список" ведёт в модалку регистрации.
 *
 * Никакого редактирования, никаких чекбоксов/фильтров — намеренно простая витрина.
 * Данные — GET /api/v1/public/profiles/{id}/movies (см. src/api/mock.js), эндпоинт публичный,
 * не требует JWT.
 */

import { getPublicProfileMovies } from '../api/mock.js';
import { openLoginModal } from '../components/LoginModal.js';
import { openRegisterModal } from '../components/RegisterModal.js';
import { t, onLangChange, getLang } from '../i18n/index.js';
import { renderLangToggle } from '../components/LangToggle.js';
import { countryLabel, COUNTRIES } from '../data/countries.js';
import { GENRE_KEYS } from '../components/AddMovieModal.js';

// Жанр хранится на бэке одним фиксированным английским значением (напр. 'Drama') — тот же список, что
// и в модалке добавления фильма. Обратный маппинг значение -> i18n-ключ, чтобы при переключении языка
// жанр тоже переводился, а не оставался в сыром английском виде как пришёл с бэка.
const GENRE_VALUE_TO_KEY = Object.fromEntries(GENRE_KEYS.map(g => [g.value, g.key]));

// Жанр может быть несколькими значениями через запятую (тот же паттерн, что и в Movies.js
// movieGenresHTML) — разбиваем и переводим каждый отдельно; значения вне фиксированного списка (не должно
// таких быть, но на всякий случай) показываются как есть, без падения.
function genreLabels(genreStr) {
  return (genreStr ?? '').split(',').map(g => g.trim()).filter(Boolean)
    .map(g => GENRE_VALUE_TO_KEY[g] ? t(GENRE_VALUE_TO_KEY[g]) : g);
}


const PUBLIC_CSS = `
  .public-page { animation: fadeUp 0.5s ease both; }

  .public-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 28px 28px 20px; max-width: 1280px; margin: 0 auto 40px;
    border-bottom: 1px solid var(--color-border);
    gap: 16px;
  }
  .public-header__right { display: flex; align-items: center; gap: 12px; }

  .public-hero { text-align: center; padding: 20px 0 8px; margin-bottom: 40px; }
  .public-hero__title {
    font-family: var(--font-display); font-size: clamp(30px, 4.5vw, 48px);
    font-weight: 300; color: var(--color-text); margin-bottom: 10px; letter-spacing: -0.01em;
  }
  .public-hero__count { font-size: 14px; color: var(--color-text-muted); margin-bottom: 24px; }

  .public-random-btn {
    display: inline-flex; align-items: center; gap: 8px; padding: 11px 26px;
    border-radius: 40px; border: 1px solid rgba(201,123,138,0.35);
    background: rgba(201,123,138,0.1); color: var(--color-text);
    font-family: var(--font-body); font-size: 13px; letter-spacing: 0.04em;
    cursor: pointer; transition: var(--transition-normal);
  }
  .public-random-btn:hover { background: rgba(201,123,138,0.2); border-color: var(--color-rose); transform: translateY(-2px); }
  .public-random-btn:disabled { opacity: 0.35; cursor: default; transform: none; }

  .public-random-result {
    max-width: 420px; margin: 26px auto 0; padding: 24px 28px;
    background: linear-gradient(135deg, rgba(74,25,66,0.55), rgba(45,15,42,0.75));
    border: 1px solid rgba(201,123,138,0.25); border-radius: 18px;
    text-align: center; backdrop-filter: blur(10px);
    animation: fadeUp 0.35s ease both;
  }
  .public-random-result__label { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-rose); margin-bottom: 10px; }
  .public-random-result__title { font-family: var(--font-display); font-size: 22px; color: var(--color-text); margin-bottom: 6px; }
  .public-random-result__meta { font-size: 12px; color: var(--color-text-muted); }

  .public-list { max-width: 900px; margin: 0 auto 48px; }
  .public-row {
    display: flex; align-items: center; gap: 16px;
    padding: 16px 20px; border-radius: 14px;
    background: var(--color-glass); border: 1px solid var(--color-border);
    margin-bottom: 10px; transition: var(--transition-fast);
  }
  .public-row:hover { border-color: rgba(201,123,138,0.3); background: var(--color-surface); }
  .public-row__title { font-family: var(--font-display); font-size: 16px; color: var(--color-text); flex: 1; min-width: 0; }
  .public-row__meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
  .public-row__year { font-size: 12px; color: var(--color-text-muted); }
  .public-row__tag {
    font-size: 11px; padding: 2px 9px; border-radius: 20px;
    background: rgba(255,255,255,0.07); color: var(--color-text-muted);
  }

  .public-cta {
    max-width: 900px; margin: 0 auto 60px; padding: 28px 32px;
    background: linear-gradient(135deg, rgba(74,25,66,0.5), rgba(45,15,42,0.7));
    border: 1px solid rgba(201,123,138,0.2); border-radius: 20px;
    display: flex; align-items: center; justify-content: space-between; gap: 24px;
    backdrop-filter: blur(10px);
  }
  .public-cta__title { font-family: var(--font-display); font-size: 20px; color: var(--color-text); margin-bottom: 4px; }
  .public-cta__sub { font-size: 13px; color: var(--color-text-muted); }
  .public-cta__btn {
    display: flex; align-items: center; gap: 8px; padding: 12px 28px;
    background: linear-gradient(135deg, var(--color-rose), #a35f6e);
    border: none; border-radius: 40px; color: #fff;
    font-family: var(--font-body); font-size: 13px; font-weight: 500;
    letter-spacing: 0.06em; cursor: pointer; transition: var(--transition-normal);
    white-space: nowrap; text-transform: uppercase; flex-shrink: 0;
  }
  .public-cta__btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(201,123,138,0.4); }

  .public-notfound { max-width: 480px; margin: 100px auto; text-align: center; }
  .public-notfound__icon { font-size: 48px; margin-bottom: 16px; }
  .public-notfound__title { font-family: var(--font-display); font-size: 24px; color: var(--color-text); margin-bottom: 10px; }
  .public-notfound__sub { font-size: 14px; color: var(--color-text-muted); margin-bottom: 24px; line-height: 1.5; }
  .public-notfound__link { color: var(--color-rose); font-size: 13px; text-decoration: none; }
  .public-notfound__link:hover { text-decoration: underline; }

  @media (max-width: 640px) {
    .public-header { padding: 20px 16px; flex-wrap: wrap; }
    .public-cta { flex-direction: column; text-align: center; padding: 24px; }
    .public-row { flex-wrap: wrap; }
  }
`;

function injectPublicCSS() {
  if (document.getElementById('hb-public-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-public-css';
  style.textContent = PUBLIC_CSS;
  document.head.appendChild(style);
}

function headerHTML() {
  return `
    <header class="public-header">
      <a href="#/guest" class="logo-link">
        <div class="logo-name">han<span>bin</span></div>
        <div class="logo-tagline">${t('header.tagline')}</div>
      </a>
      <div class="public-header__right">
        <div id="public-lang-slot"></div>
        <button class="btn-login-header" id="public-login-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          ${t('unauth.banner_btn').split(' / ')[0]}
        </button>
      </div>
    </header>
  `;
}

function notFoundHTML() {
  return `
    <div class="public-notfound">
      <div class="public-notfound__icon">🔗</div>
      <div class="public-notfound__title">${t('public.not_found_title')}</div>
      <div class="public-notfound__sub">${t('public.not_found_sub')}</div>
      <a class="public-notfound__link" href="#/guest">${t('public.back_home')}</a>
    </div>
  `;
}

function movieCountryText(code) {
  if (!code) return '';
  const c = COUNTRIES.find(x => x.code === code);
  if (!c) return '';
  return `${c.flag} ${countryLabel(code, getLang())}`;
}

function movieRowHTML(m) {
  const countryText = movieCountryText(m.country);
  const genres = genreLabels(m.genre);
  return `
    <div class="public-row">
      <div class="public-row__title">${m.title}</div>
      <div class="public-row__meta">
        ${m.year ? `<span class="public-row__year">${m.year}</span>` : ''}
        ${countryText ? `<span class="public-row__year">${countryText}</span>` : ''}
        ${genres.map(g => `<span class="public-row__tag">${g}</span>`).join('')}
        ${m.category ? `<span class="public-row__tag">${m.category}</span>` : ''}
      </div>
    </div>
  `;
}

export async function renderPublicProfile(container, params) {
  injectPublicCSS();
  const profileId = params.id;

  container.innerHTML = `
    <div id="public-header-slot"></div>
    <div class="container public-page">
      <div class="loading-dots">${t('public.loading')}</div>
    </div>
  `;

  function buildHeader() {
    const slot = container.querySelector('#public-header-slot');
    if (!slot) return;
    slot.innerHTML = headerHTML();
    renderLangToggle(slot.querySelector('#public-lang-slot'));
    slot.querySelector('#public-login-btn')?.addEventListener('click', openLoginModal);
  }
  buildHeader();

  const { data, notFound } = await getPublicProfileMovies(profileId);
  if (!container.isConnected) return;

  const pageSlot = container.querySelector('.public-page');
  if (!pageSlot) return;

  if (!data || notFound) {
    pageSlot.innerHTML = notFoundHTML();
    return;
  }

  function buildBody() {
    // В публичном списке показываем только «Запланировано» — это и есть то, что имеет смысл показывать гостю:
    // «загляни, что она планирует посмотреть», а не весь личный архив со статусами типа «брошено».
    const plannedMovies = (data.movies ?? []).filter(m => m.status === 'planned');

    pageSlot.innerHTML = `
      <section class="public-hero">
        <div class="public-hero__title">${t('public.title', { name: data.name })}</div>
        <div class="public-hero__count">${t('public.count', { n: plannedMovies.length })}</div>
        <button class="public-random-btn" id="public-random-btn" ${plannedMovies.length ? '' : 'disabled'}>
          🎲 ${t('public.random_btn')}
        </button>
        <div id="public-random-slot"></div>
      </section>
      <div class="public-list">
        ${plannedMovies.length
          ? plannedMovies.map(movieRowHTML).join('')
          : `<div class="empty-state"><div class="empty-state__icon">🎬</div><div class="empty-state__text">${t('public.empty')}</div></div>`}
      </div>
      <div class="public-cta">
        <div>
          <div class="public-cta__title">${t('public.cta_title')}</div>
          <div class="public-cta__sub">${t('public.cta_sub')}</div>
        </div>
        <button class="public-cta__btn" id="public-cta-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          ${t('public.cta_btn')}
        </button>
      </div>
    `;
    pageSlot.querySelector('#public-cta-btn')?.addEventListener('click', openRegisterModal);

    // Рандомайзер — тот же смысл, что и у RandomPickerModal.js на авторизованных страницах, но работает
    // полностью локально над уже загруженным списком — без запросов к /api/v1/random/*, который
    // требует JWT и вернёт случайный тайтл из списка СМОТРЯЩЕГО гостя, а не владельца списка — здесь нам
    // нужен именно тайтл из чужого расшаренного списка к просмотру, который уже загружен.
    let lastPickIdx = -1;
    function runRandomPick() {
      if (!plannedMovies.length) return;
      const slot = pageSlot.querySelector('#public-random-slot');
      if (!slot) return;

      let idx = Math.floor(Math.random() * plannedMovies.length);
      if (plannedMovies.length > 1 && idx === lastPickIdx) {
        idx = (idx + 1) % plannedMovies.length;
      }
      lastPickIdx = idx;
      const pick = plannedMovies[idx];

      const countryText = movieCountryText(pick.country);
      const metaParts = [pick.year, countryText, ...genreLabels(pick.genre), pick.category].filter(Boolean);
      slot.innerHTML = `
        <div class="public-random-result">
          <div class="public-random-result__label">${t('public.random_label')}</div>
          <div class="public-random-result__title">${pick.title}</div>
          ${metaParts.length ? `<div class="public-random-result__meta">${metaParts.join(' · ')}</div>` : ''}
        </div>
      `;
    }

    pageSlot.querySelector('#public-random-btn')?.addEventListener('click', runRandomPick);
  }
  buildBody();

  onLangChange(() => {
    if (!container.isConnected) return;
    buildHeader();
    buildBody();
  });
}
