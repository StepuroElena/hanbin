/**
 * HANBIN — Random Picker Modal
 *
 * Флоу: одна модалка, состояния внутри неё меняются без пересоздания оверлея:
 *  picker (тип + жанр) -> spinning (~500ms) -> result | empty
 *
 * "Ещё раз" сохраняет текущие фильтры и не даёт выпасть тому же тайтлу подряд.
 * Вся фильтрация/выбор/подсчёт живут на бэке (GET /api/v1/random/*) — этот файл
 * только вызывает эндпоинты и рендерит ответ, без бизнес-логики на клиенте.
 */

import { closeModal, injectModalCSS } from './LoginModal.js';
import { getRandomFacets, getRandomPick } from '../api/mock.js';
import { GENRE_KEY_MAP } from './Filters.js';
import { t, onLangChange } from '../i18n/index.js';

// ─────────────────────────────────────────────
// CSS (тот же паттерн, что у AddDramaModal — своя CSS поверх общей injectModalCSS)
// ─────────────────────────────────────────────

const RANDOM_PICKER_CSS = `
  #hb-modal-box.hb-random-box { width: 400px; }
  #hb-modal-box.hb-random-box #hb-modal-content { padding: 40px 36px 32px; }

  .rp-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--color-rose); margin-bottom: 6px; }
  .rp-title { font-family: var(--font-display); font-size: 24px; font-weight: 300; font-style: italic; color: var(--color-champagne, var(--color-text)); margin-bottom: 26px; }

  .rp-section-label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 10px; }

  .rp-segment { display: flex; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden; margin-bottom: 22px; }
  .rp-segment button { flex: 1; padding: 10px 0; background: none; border: none; color: var(--color-text-muted); font-family: var(--font-body); font-size: 13px; cursor: pointer; transition: var(--transition-fast); }
  .rp-segment button.active { background: rgba(201,123,138,0.28); color: var(--color-text); }
  .rp-segment button:disabled { opacity: 0.3; cursor: not-allowed; }
  .rp-segment button:disabled.active { background: none; color: var(--color-text-muted); }

  .rp-genres { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 8px; margin-bottom: 30px; min-height: 74px; max-height: 140px; overflow-y: auto; transition: opacity 0.15s ease; }
  .rp-chip { padding: 7px 14px; border-radius: 30px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text-muted); font-size: 12px; cursor: pointer; transition: var(--transition-fast); font-family: var(--font-body); }
  .rp-chip:hover { border-color: rgba(201,123,138,0.4); color: var(--color-text); }
  .rp-chip.active { background: rgba(201,123,138,0.24); border-color: var(--color-rose); color: var(--color-text); }
  .rp-chip.rp-random.active { background: rgba(212,165,116,0.22); border-color: var(--color-gold); color: var(--color-text); }

  .rp-primary-btn { width: 100%; padding: 13px; border-radius: 14px; border: none; background: linear-gradient(90deg, var(--color-rose), var(--color-neon-rose)); color: #1a0a18; font-family: var(--font-body); font-size: 14px; font-weight: 500; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease; }
  .rp-primary-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(255,107,138,0.3); }
  .rp-primary-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

  .rp-spin-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 40px 0 20px; }
  .rp-spin-poster { width: 130px; height: 186px; border-radius: 14px; background: linear-gradient(135deg, rgba(201,123,138,0.3), rgba(122,171,142,0.2)); filter: blur(6px); animation: rp-pulse-blur 0.5s ease-in-out infinite alternate; }
  @keyframes rp-pulse-blur { from { filter: blur(6px); opacity: 0.6; } to { filter: blur(2px); opacity: 1; } }
  .rp-spin-text { font-size: 12px; color: var(--color-text-muted); letter-spacing: 0.05em; }

  .rp-result { display: flex; flex-direction: column; align-items: center; text-align: center; }
  .rp-poster { width: 140px; height: 200px; border-radius: 14px; overflow: hidden; margin-bottom: 18px; box-shadow: var(--shadow-card); animation: rp-reveal 0.35s ease both; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 40px; font-weight: 300; color: var(--color-text); background: linear-gradient(135deg, var(--color-rose), var(--color-plum)); }
  .rp-poster img { width: 100%; height: 100%; object-fit: cover; }
  @keyframes rp-reveal { from { opacity: 0; transform: scale(0.92); filter: blur(6px); } to { opacity: 1; transform: scale(1); filter: blur(0); } }

  .rp-result-title { font-family: var(--font-display); font-size: 21px; font-weight: 400; color: var(--color-text); margin-bottom: 6px; line-height: 1.3; }
  .rp-result-meta { font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px; }
  .rp-result-stars { font-size: 13px; color: var(--color-gold); margin-bottom: 20px; min-height: 16px; }

  /* Карточка без постера (всегда у фильмов) — укрупняем типографику и даём больше воздуха,
     чтобы карточка держала собственный вес, а не выглядела урезанной версией карточки с постером. */
  .rp-result--compact { padding-top: 8px; }
  .rp-result--compact .rp-result-title { font-size: 30px; margin-bottom: 12px; }
  .rp-result--compact .rp-result-meta { font-size: 15px; margin-bottom: 26px; }
  .rp-result--compact .rp-info-row { margin-bottom: 32px; gap: 32px; }
  .rp-result--compact .rp-info-label { font-size: 11px; }
  .rp-result--compact .rp-info-value { font-size: 15px; }

  .rp-info-row { display: flex; gap: 20px; margin-bottom: 22px; flex-wrap: wrap; justify-content: center; }
  .rp-info-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .rp-info-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--color-text-muted); }
  .rp-info-value { font-size: 13px; color: var(--color-text); font-family: var(--font-body); }

  .rp-result-actions { display: flex; gap: 10px; width: 100%; }
  .rp-secondary-btn { flex: 1; padding: 12px; border-radius: 14px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); font-family: var(--font-body); font-size: 13px; cursor: pointer; transition: var(--transition-fast); }
  .rp-secondary-btn:hover { background: rgba(255,255,255,0.1); }
  .rp-open-btn { flex: 1; padding: 12px; border-radius: 14px; border: none; background: linear-gradient(90deg, var(--color-rose), var(--color-neon-rose)); color: #1a0a18; font-family: var(--font-body); font-size: 13px; font-weight: 500; cursor: pointer; transition: transform 0.15s ease; }
  .rp-open-btn:hover { transform: translateY(-2px); }

  .rp-edit-filters { text-align: center; font-size: 11px; color: var(--color-text-muted); margin-top: 14px; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
  .rp-edit-filters:hover { color: var(--color-rose); }

  .rp-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 14px; padding: 30px 0 10px; }
  .rp-empty-icon { font-size: 34px; }
  .rp-empty-title { font-family: var(--font-display); font-size: 20px; color: var(--color-text); }
  .rp-empty-sub { font-size: 12px; color: var(--color-text-muted); max-width: 260px; line-height: 1.5; }
`;

function injectRandomPickerCSS() {
  if (document.getElementById('hb-random-picker-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-random-picker-css';
  style.textContent = RANDOM_PICKER_CSS;
  document.head.appendChild(style);
}

function genreLabel(g) {
  const key = GENRE_KEY_MAP[g];
  return key ? t(key) : g;
}

// Код страны -> флаг + название, для вывода в результате (тот же набор, что и в mock.js COUNTRY_META).
const COUNTRY_META = {
  kr: { flag: '🇰🇷', name: 'Корея' },
  cn: { flag: '🇨🇳', name: 'Китай' },
  jp: { flag: '🇯🇵', name: 'Япония' },
};

function countryLabel(code) {
  const meta = COUNTRY_META[(code || '').toLowerCase()];
  return meta ? `${meta.flag} ${meta.name}` : `🌏 ${code}`;
}

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────

let _filters = { type: 'any', genre: null };
let _lastPick = null; // { id, kind } предыдущего результата — для exclude_id/exclude_kind при "Ещё раз"

/**
 * Считает, есть ли вообще что-то в статусе "Запланировано" — используется
 * Header.js, чтобы задизейблить кнопку 🎲. Счёт полностью на бэке — берём флаги
 * из GET /random/facets?type=any вместо того чтобы тянуть всю библиотеку в браузер.
 * @returns {Promise<number>}
 */
export async function getPlannedCount() {
  const { data } = await getRandomFacets('any');
  if (!data) return 0;
  return (data.hasMovies || data.hasSeries) ? 1 : 0;
}

// ─────────────────────────────────────────────
// RENDER: picker
// ─────────────────────────────────────────────

async function renderPicker(content) {
  content.innerHTML = `
    <div class="rp-eyebrow">${t('random.eyebrow')}</div>
    <div class="rp-title">${t('random.title')}</div>
    <div class="rp-section-label">${t('random.type_label')}</div>
    <div class="rp-segment" id="rp-segment">
      <button data-type="any"    class="${_filters.type === 'any' ? 'active' : ''}">${t('random.type_any')}</button>
      <button data-type="movie"  class="${_filters.type === 'movie' ? 'active' : ''}">${t('random.type_movie')}</button>
      <button data-type="series" class="${_filters.type === 'series' ? 'active' : ''}">${t('random.type_series')}</button>
    </div>
    <div class="rp-section-label">${t('random.genre_label')}</div>
    <div class="rp-genres" id="rp-genres">
      <div style="font-size:12px;color:var(--color-text-muted);padding:8px 0;">${t('random.loading')}</div>
    </div>
    <button class="rp-primary-btn" id="rp-pick-btn" disabled>${t('random.pick_btn')} →</button>
  `;

  content.querySelector('#rp-pick-btn').addEventListener('click', () => runPick(content));

  // Всё считает бэк: жанры и флаги наличия типа — за один запрос под текущий _filters.type.
  const { data: facets } = await getRandomFacets(_filters.type);
  const hasMovies = facets ? facets.hasMovies : false;
  const hasSeries = facets ? facets.hasSeries : false;

  // Если одного из типов нет вообще среди запланированных — задизейбливаем соответствующие
  // кнопки сегмента (включая "Неважно" — она бы всё равно свела только к единственно доступному
  // типу, но явно показывать её как выбор бессмысленно, если второй тип пустой).
  if (!hasMovies && hasSeries) _filters.type = 'series';
  if (!hasSeries && hasMovies) _filters.type = 'movie';

  const segmentEl = content.querySelector('#rp-segment');
  segmentEl.innerHTML = `
    <button data-type="any"    class="${_filters.type === 'any' ? 'active' : ''}"    ${(!hasMovies || !hasSeries) ? 'disabled' : ''}>${t('random.type_any')}</button>
    <button data-type="movie"  class="${_filters.type === 'movie' ? 'active' : ''}"  ${!hasMovies ? 'disabled' : ''}>${t('random.type_movie')}</button>
    <button data-type="series" class="${_filters.type === 'series' ? 'active' : ''}" ${!hasSeries ? 'disabled' : ''}>${t('random.type_series')}</button>
  `;
  segmentEl.querySelectorAll('button:not(:disabled)').forEach((btn) => {
    btn.addEventListener('click', () => {
      segmentEl.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      _filters.type = btn.dataset.type;
      renderGenres(content); // тип поменялся — новый запрос к getRandomFacets под него
    });
  });

  await renderGenres(content, facets ? facets.genres : []);

  content.querySelector('#rp-pick-btn').disabled = false;
}

/**
 * Рисует чипы жанров под текущий выбранный тип. knownGenres — если жанры уже пришли
 * вместе с facets из renderPicker, передаём их напрямую (без лишнего запроса). При смене
 * типа (knownGenres не передан) — делает отдельный запрос к getRandomFacets(_filters.type).
 *
 * Важно: не показываем промежуточное "Загружаем" при смене типа — это даёт двойной скачок
 * высоты модалки (старые чипы -> "Загружаем" -> новые чипы). Вместо этого держим старые
 * чипы на экране (приглушёнными, некликабельными) до тех пор, пока не пришли новые —
 * один скачок вместо двух.
 */
async function renderGenres(content, knownGenres) {
  const genresEl = content.querySelector('#rp-genres');

  let genres = knownGenres;
  if (genres === undefined) {
    genresEl.style.opacity = '0.4';
    genresEl.style.pointerEvents = 'none';
    const { data: facets } = await getRandomFacets(_filters.type);
    genresEl.style.opacity = '';
    genresEl.style.pointerEvents = '';
    genres = facets ? facets.genres : [];
  }

  // Если ранее выбранный жанр больше недоступен при новом типе (был только у фильмов,
  // а выбрали "Сериал") — сбрасываем на "случайный", а не оставляем висеть выбор в пустоту.
  if (_filters.genre && !genres.includes(_filters.genre)) {
    _filters.genre = null;
  }

  if (genres.length === 0) {
    genresEl.innerHTML = `<div style="font-size:12px;color:var(--color-text-muted);padding:8px 0;">${t('random.no_genres')}</div>`;
    return;
  }

  genresEl.innerHTML = `
    <button class="rp-chip rp-random ${!_filters.genre ? 'active' : ''}" data-genre="">🎲 ${t('random.genre_random')}</button>
    ${genres.map((g) => `<button class="rp-chip ${_filters.genre === g ? 'active' : ''}" data-genre="${g}">${genreLabel(g)}</button>`).join('')}
  `;
  genresEl.querySelectorAll('.rp-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      genresEl.querySelectorAll('.rp-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      _filters.genre = chip.dataset.genre || null;
    });
  });
}

// ─────────────────────────────────────────────
// RENDER: spinning
// ─────────────────────────────────────────────

function renderSpinning(content) {
  content.innerHTML = `
    <div class="rp-spin-wrap">
      <div class="rp-spin-poster"></div>
      <div class="rp-spin-text">${t('random.spinning')}</div>
    </div>
  `;
}

async function runPick(content) {
  renderSpinning(content);

  const [{ data: pick }] = await Promise.all([
    getRandomPick(_filters.type, _filters.genre || '', _lastPick?.kind || '', _lastPick?.id || ''),
    new Promise((resolve) => setTimeout(resolve, 500)), // минимальная задержка для ощущения "подбора", даже если запрос быстрый
  ]);

  if (!pick) {
    renderEmpty(content);
    return;
  }
  _lastPick = { id: pick.id, kind: pick.kind };
  renderResult(content, pick);
}

// ─────────────────────────────────────────────
// RENDER: result
// ─────────────────────────────────────────────

function renderResult(content, pick) {
  // Фильмы никогда не имеют постера (в БД просто нет такого поля) — буква-заглушка только
  // занимала бы место без пользы — для фильмов блок постера не рендерится вообще.
  const posterHTML = pick.kind === 'movie'
    ? null
    : (pick.cover ? `<img src="${pick.cover}" alt="${pick.title}">` : (pick.title || '?').trim().charAt(0).toUpperCase());

  const metaParts = [pick.year, pick.genres.map(genreLabel).join(', ')].filter(Boolean);
  if (pick.kind === 'drama') {
    if (pick.episodesTotal) metaParts.push(`${pick.episodesTotal} эп.`);
    if (pick.episodeDurationMin) metaParts.push(`${pick.episodeDurationMin} мин`);
    if (pick.seasons && pick.seasons > 1) metaParts.push(`${pick.seasons} сез.`);
  }

  const starsHTML = pick.rating
    ? '★'.repeat(pick.rating) + '☆'.repeat(5 - pick.rating)
    : '';

  // Без постера (всегда у фильмов) карточка выглядела бы пустовато на той же типографике —
  // укрупняем название/meta и даём больше воздуха, чтобы карточка держала собственный вес.
  const isCompact = posterHTML === null;

  // Вместо статуса (он всегда "Запланировано" — рандомится только из этого пула,
  // показывать его бессмысленно) — показываем остальные детали: тип и страна.
  const kindLabel = pick.kind === 'movie' ? t('random.type_movie') : t('random.type_series');
  const infoItems = [
    { label: t('random.type_label'), value: kindLabel },
    ...(pick.country ? [{ label: t('random.country_label'), value: countryLabel(pick.country) }] : []),
  ];

  content.innerHTML = `
    <div class="rp-result ${isCompact ? 'rp-result--compact' : ''}">
      ${posterHTML !== null ? `<div class="rp-poster">${posterHTML}</div>` : ''}
      <div class="rp-result-title">${pick.title}</div>
      <div class="rp-result-meta">${metaParts.join(' · ')}</div>
      ${starsHTML ? `<div class="rp-result-stars">${starsHTML}</div>` : ''}

      <div class="rp-info-row">
        ${infoItems.map((i) => `<div class="rp-info-item"><span class="rp-info-label">${i.label}</span><span class="rp-info-value">${i.value}</span></div>`).join('')}
      </div>

      <div class="rp-result-actions">
        <button class="rp-secondary-btn" id="rp-reroll-btn">🔄 ${t('random.reroll_btn')}</button>
        ${pick.watchUrl ? `<button class="rp-open-btn" id="rp-open-btn">${t('random.open_btn')} →</button>` : ''}
      </div>
      <div class="rp-edit-filters" id="rp-edit-filters">← ${t('random.edit_filters')}</div>
    </div>
  `;

  content.querySelector('#rp-reroll-btn').addEventListener('click', () => runPick(content));
  content.querySelector('#rp-edit-filters').addEventListener('click', () => renderPicker(content));

  const openBtn = content.querySelector('#rp-open-btn');
  if (openBtn) {
    openBtn.addEventListener('click', () => window.open(pick.watchUrl, '_blank'));
  }
}

// ─────────────────────────────────────────────
// RENDER: empty
// ─────────────────────────────────────────────

function renderEmpty(content) {
  const typeLabel = { any: t('random.type_any'), movie: t('random.type_movie'), series: t('random.type_series') }[_filters.type];
  const genreLbl = _filters.genre ? genreLabel(_filters.genre) : t('random.genre_random');

  content.innerHTML = `
    <div class="rp-empty">
      <div class="rp-empty-icon">😔</div>
      <div class="rp-empty-title">${t('random.empty_title')}</div>
      <div class="rp-empty-sub">${t('random.empty_sub', { type: typeLabel, genre: genreLbl })}</div>
      <div class="rp-edit-filters" id="rp-edit-filters">← ${t('random.edit_filters')}</div>
    </div>
  `;
  content.querySelector('#rp-edit-filters').addEventListener('click', () => renderPicker(content));
}

// ─────────────────────────────────────────────
// OPEN
// ─────────────────────────────────────────────

let _opening = false;

export async function openRandomPickerModal() {
  if (document.getElementById('hb-modal-overlay') || _opening) return;
  _opening = true;

  injectRandomPickerCSS();
  injectModalCSS();

  _filters = { type: 'any', genre: null };
  _lastPick = null; // свежий старт при каждом открытии — статусы могли поменяться в таблице/карточках

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="hb-modal-overlay">
      <div id="hb-modal-box" class="hb-random-box">
        <button id="hb-modal-close" aria-label="${t('modal.close')}">×</button>
        <div id="hb-modal-content"></div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper.firstElementChild);
  _opening = false;

  document.getElementById('hb-modal-close').addEventListener('click', closeModal);
  document.getElementById('hb-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'hb-modal-overlay') closeModal();
  });
  const onKeydown = (e) => {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);

  const content = document.getElementById('hb-modal-content');
  await renderPicker(content);

  const unsub = onLangChange(() => {
    const overlay = document.getElementById('hb-modal-overlay');
    if (!overlay) { unsub(); return; }
    const closeBtn = document.getElementById('hb-modal-close');
    if (closeBtn) closeBtn.setAttribute('aria-label', t('modal.close'));
    // Перерисовываем текущий шаг заново с уже выбранными фильтрами/пиком —
    // проще всего просто вернуть на picker с сохранёнными фильтрами.
    renderPicker(document.getElementById('hb-modal-content'));
  });
}
