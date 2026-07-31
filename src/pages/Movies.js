/**
 * HANBIN — Movies Page
 *
 * Таблица + счётчики просмотрено/запланировано + модалка добавления фильма +
 * архив + фильтр-чипсы по статусу (Все/Смотрю/Просмотрено/Запланировано/Брошено) —
 * тот же стиль, что и у дорам. Статус в строке — кликабельный бейдж, открывает
 * выпадающее меню с остальными тремя статусами (как у дорам, не просто toggle).
 *
 * Редактируемые столбцы (тот же принцип, что и статус — клик открывает плавающее меню,
 * PATCH уходит сразу на бэк, без отдельной кнопки «Сохранить»):
 *   — название: карандаш → инлайн текстовый инпут (Enter/blur — сохранить, Esc — отмена);
 *   — жанр/категория: клик по ячейке → чекбокс-меню, мультивыбор, сохраняется на каждый тоггл;
 *   — страна: клик → меню с поиском (тот же список COUNTRIES, что и в модалке добавления);
 *   — год: клик → инлайн числовой инпут.
 * Архивные строки НЕ редактируются — так же, как и у дорам (архив — «замороженная» запись).
 *
 * Данные — GET /api/v1/movies (см. src/api/mock.js), гостю показывается локальный мок.
 */

import { renderHeader } from '../components/Header.js';
import { getMovies, getArchivedMovies, updateMovieStatus, updateMovieField, getMovieCategories, archiveMovie, unarchiveMovie, deleteMovie } from '../api/mock.js';
import { renderPagination, PAGE_SIZE_OPTIONS } from '../components/Pagination.js';
import { GENRE_KEYS } from '../components/AddMovieModal.js';
import { t, onLangChange } from '../i18n/index.js';
import { COUNTRIES } from '../data/countries.js';

const MOVIES_CSS = `
  .movies-page { animation: fadeUp 0.5s ease both; }

  .movies-header { margin-bottom: 40px; }
  .movies-header__title {
    font-family: var(--font-display); font-size: 44px; font-weight: 300;
    color: var(--color-text); margin-bottom: 10px; letter-spacing: -0.01em;
  }
  .movies-header__sub { font-size: 16px; color: var(--color-text-muted); line-height: 1.5; }

  .movies-stats-row { display: flex; align-items: stretch; gap: 16px; margin-bottom: 40px; }
  .movies-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; flex: 1; }

  .movies-add-btn {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
    width: 160px; flex-shrink: 0; border-radius: 20px; cursor: pointer;
    background: rgba(201,123,138,0.08); border: 1px dashed rgba(201,123,138,0.4);
    color: var(--color-rose); font-family: var(--font-body); font-size: 13px;
    letter-spacing: 0.04em; transition: var(--transition-fast);
  }
  .movies-add-btn:hover { background: rgba(201,123,138,0.16); border-color: rgba(201,123,138,0.7); transform: translateY(-2px); }
  .movies-add-btn__icon {
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(201,123,138,0.2); display: flex; align-items: center; justify-content: center;
  }

  .movies-section-title {
    font-family: var(--font-display); font-size: 26px; font-weight: 400;
    color: var(--color-text); display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px;
  }
  .movies-section-title::before {
    content: ''; display: block; width: 3px; height: 26px;
    background: var(--color-rose); border-radius: 2px;
  }
  .movies-section-title--archive { color: var(--color-text-muted); font-size: 20px; }
  .movies-section-title--archive::before { background: rgba(232,196,184,0.35); }

  /* Заголовок списка фильмов теперь внутри .section-header (рядом с пагинацией) —
     собственный нижний отступ больше не нужен, зазор уже даёт .section-header. */
  .section-header .movies-section-title { margin-bottom: 0; }

  .movies-status-badge { cursor: pointer; user-select: none; }

  .movies-table-title { font-family: var(--font-display); font-size: 17px; color: var(--color-text); }
  .movies-table-year { font-size: 13px; color: var(--color-text-muted); }
  .movies-table-genre { display: inline-block; font-size: 12px; padding: 3px 10px; border-radius: 20px; background: rgba(255,255,255,0.07); color: var(--color-text-muted); margin: 2px 4px 2px 0; }
  .movies-table-category { display: inline-block; font-size: 12px; padding: 3px 10px; border-radius: 20px; background: rgba(122,171,142,0.14); border: 1px solid rgba(122,171,142,0.25); color: var(--color-jade); margin: 2px 4px 2px 0; }

  /* ── Редактируемые ячейки таблицы фильмов ── */
  .movies-editable-title { display: inline-flex; align-items: center; gap: 6px; }
  .movies-edit-pencil {
    flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; color: rgba(245,230,211,0.3);
    cursor: pointer; transition: var(--transition-fast);
  }
  .movies-edit-pencil:hover { background: var(--color-accent-glow); color: var(--color-rose); }
  .movies-title-input {
    padding: 5px 9px; border-radius: 8px; min-width: 160px;
    background: rgba(255,255,255,0.07); border: 1px solid rgba(232,196,184,0.3);
    color: var(--color-text); font-family: var(--font-display); font-size: 15px;
  }
  .movies-title-input:focus { outline: none; border-color: var(--color-rose); }

  .movies-editable-cell { cursor: pointer; display: inline-block; border-radius: 8px; padding: 2px 4px; margin: -2px -4px; transition: background 0.15s ease; }
  .movies-editable-cell:hover { background: rgba(255,255,255,0.05); }

  .movies-year-input {
    width: 76px; padding: 5px 8px; border-radius: 8px;
    background: rgba(255,255,255,0.07); border: 1px solid rgba(232,196,184,0.3);
    color: var(--color-text); font-family: var(--font-body); font-size: 13px;
  }
  .movies-year-input:focus { outline: none; border-color: var(--color-rose); }

  .movies-multiselect-menu { padding: 4px; max-height: 260px; overflow-y: auto; }
  .movies-multiselect-option {
    display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px;
    cursor: pointer; font-size: 13px; color: var(--color-text); transition: background 0.15s ease;
    white-space: nowrap;
  }
  .movies-multiselect-option:hover { background: rgba(201,123,138,0.12); }
  .movies-multiselect-option--active { color: var(--color-rose); }
  .movies-multiselect-option__check { width: 14px; flex-shrink: 0; text-align: center; font-size: 12px; }
  .movies-multiselect-empty { padding: 14px; text-align: center; font-size: 12px; color: var(--color-text-muted); font-style: italic; }

  .movies-country-search {
    width: 100%; padding: 8px 10px; border-radius: 8px; box-sizing: border-box;
    background: rgba(255,255,255,0.07); border: 1px solid rgba(232,196,184,0.18);
    color: var(--color-text); font-size: 12px; font-family: var(--font-body);
  }
  .movies-country-search:focus { outline: none; border-color: var(--color-rose); }
  .movies-country-options { max-height: 220px; overflow-y: auto; }

  .movies-archive-section { margin-top: 44px; opacity: 0.72; transition: opacity 0.25s ease; }
  .movies-archive-section:hover { opacity: 1; }

  @media (max-width: 768px) {
    .movies-stats-row { flex-direction: column; }
    .movies-add-btn { width: 100%; flex-direction: row; padding: 16px; }
  }
  @media (max-width: 640px) {
    .movies-header__title { font-size: 32px; }
    .movies-stats-grid { grid-template-columns: 1fr; }
  }
`;

function injectMoviesCSS() {
  if (document.getElementById('hb-movies-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-movies-css';
  style.textContent = MOVIES_CSS;
  document.head.appendChild(style);
}

// Статусы фильма — те же 4 значения, что и у дорам (планами на бэке): planned/watching/completed/dropped.
const STATUS_META = {
  watching:  { badgeClass: 'watching',  labelKey: 'status.watching' },
  completed: { badgeClass: 'completed', labelKey: 'status.completed' },
  planned:   { badgeClass: 'plan',      labelKey: 'status.plan' },
  dropped:   { badgeClass: 'dropped',   labelKey: 'status.dropped' },
};
const STATUS_ORDER = ['watching', 'completed', 'planned', 'dropped'];

// Жанр хранится одним строковым полем на бэке (VARCHAR) — несколько выбранных жанров приходят склеенными
// через запятую (см. AddMovieModal.js) — разбиваем обратно и рендерим каждый отдельным бейджиком.
function movieGenresHTML(genreStr) {
  const genres = (genreStr ?? '').split(',').map(g => g.trim()).filter(Boolean);
  if (!genres.length) return '<span class="table-no-tags">—</span>';
  return genres.map(g => `<span class="movies-table-genre">${g}</span>`).join(' ');
}

// Категория тоже хранится одним строковым полем на бэке — несколько выбранных категорий приходят склеенными
// через запятую (см. AddMovieModal.js) — тот же паттерн, что и у жанров, но свой цвет бейджика для отличия.
function movieCategoriesHTML(categoryStr) {
  const categories = (categoryStr ?? '').split(',').map(c => c.trim()).filter(Boolean);
  if (!categories.length) return '<span class="table-no-tags">—</span>';
  return categories.map(c => `<span class="movies-table-category">${c}</span>`).join(' ');
}

function movieCountryHTML(code) {
  if (!code) return '<span class="table-no-tags">—</span>';
  const c = COUNTRIES.find(x => x.code === code);
  if (!c) return '<span class="table-no-tags">—</span>';
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
  return `<span class="movies-table-year">${c.flag} ${lang === 'en' ? c.en : c.ru}</span>`;
}

function movieYearHTML(year) {
  return `<span class="movies-table-year">${year ?? '—'}</span>`;
}

function statCardHTML({ label, number, unit }) {
  return `
    <div class="stat-card glass-card">
      <div class="stat-label">${label}</div>
      <div class="stat-number">${number}</div>
      <div class="stat-unit">${unit}</div>
    </div>
  `;
}

function statusBadgeHTML(status, movieId) {
  const meta = STATUS_META[status] ?? STATUS_META.planned;
  return `<span class="status-select-wrap movies-status-badge" data-id="${movieId}" data-current="${status}">
    <span class="badge badge--${meta.badgeClass}">${t(meta.labelKey)}</span>
  </span>`;
}

function movieRowHTML(movie) {
  return `
    <tr class="drama-table__row" data-id="${movie.id}">
      <td>
        <span class="movies-editable-title">
          <span class="movies-table-title">${movie.title}</span>
          <button type="button" class="movies-edit-pencil" data-id="${movie.id}" data-tooltip="${t('profile.edit_tooltip')}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </button>
        </span>
      </td>
      <td><span class="movies-editable-cell" data-id="${movie.id}" data-field="genre">${movieGenresHTML(movie.genre)}</span></td>
      <td><span class="movies-editable-cell" data-id="${movie.id}" data-field="category">${movieCategoriesHTML(movie.category)}</span></td>
      <td><span class="movies-editable-cell" data-id="${movie.id}" data-field="country">${movieCountryHTML(movie.country)}</span></td>
      <td><span class="movies-editable-cell" data-id="${movie.id}" data-field="year">${movieYearHTML(movie.year)}</span></td>
      <td>${statusBadgeHTML(movie.status, movie.id)}</td>
      <td style="white-space:nowrap">
        <button class="table-archive-btn" data-id="${movie.id}" data-tooltip="${t('archive.btn')}" data-tooltip-pos="left">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
          </svg>
        </button>
      </td>
    </tr>
  `;
}

function archivedRowHTML(movie) {
  const meta = STATUS_META[movie.status] ?? STATUS_META.planned;
  return `
    <tr class="drama-table__row drama-table__row--archived" data-id="${movie.id}">
      <td><span class="movies-table-title">${movie.title}</span></td>
      <td>${movieGenresHTML(movie.genre)}</td>
      <td>${movieCategoriesHTML(movie.category)}</td>
      <td>${movieCountryHTML(movie.country)}</td>
      <td><span class="movies-table-year">${movie.year ?? '—'}</span></td>
      <td><span class="badge badge--${meta.badgeClass}">${t(meta.labelKey)}</span></td>
      <td style="white-space:nowrap;display:flex;align-items:center;gap:6px;border-bottom:none">
        <button class="table-unarchive-btn table-unarchive-btn--accent" data-id="${movie.id}" data-tooltip="${t('archive.unarchive_tooltip')}" data-tooltip-pos="left">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-3.75"/>
          </svg>
          ${t('archive.unarchive_btn')}
        </button>
        <button class="table-delete-btn" data-id="${movie.id}" data-tooltip="${t('archive.delete_tooltip')}" data-tooltip-pos="left">${t('archive.delete_btn')}</button>
      </td>
    </tr>
  `;
}

// Единое плавающее меню для статуса, мультивыбора (жанр/категория) и страны — только одно открыто одновременно.
let _movieMenuEl = null;
function closeMovieStatusMenu() {
  _movieMenuEl?.remove();
  _movieMenuEl = null;
}

export async function renderMovies(container) {
  injectMoviesCSS();

  let allMovies = [];       // полный список (без архива) — фильтр-чипсы режут именно его, без повторного запроса
  let currentFilter = 'all';

  // Персональный список категорий — тянется лениво при первом открытии меню категорий и кэшируется
  // на весь визит страницы (перезагрузится сам при следующем заходе на страницу).
  let movieCategoriesCache = null;
  async function getCategoriesList() {
    if (movieCategoriesCache) return movieCategoriesCache;
    const { data } = await getMovieCategories();
    movieCategoriesCache = (data ?? []).filter(c => c.enabled !== false).map(c => c.name);
    return movieCategoriesCache;
  }

  // ── Пагинация ──
  // Тот же принцип, что у дорам в Home.js: весь отфильтрованный список уже на руках,
  // резка на страницы происходит на фронте. sessionStorage переживает обычный рефреш,
  // но очищается при закрытии вкладки — свои ключи, чтобы не путать со страницей дорам.
  const savedMoviesPageSize = Number(sessionStorage.getItem('hanbin_movies_page_size'));
  let pageSize = PAGE_SIZE_OPTIONS.includes(savedMoviesPageSize) ? savedMoviesPageSize : PAGE_SIZE_OPTIONS[0];
  const savedMoviesPage = Number(sessionStorage.getItem('hanbin_movies_page'));
  let currentPage = savedMoviesPage >= 1 ? savedMoviesPage : 1;

  function persistPagination() {
    sessionStorage.setItem('hanbin_movies_page_size', String(pageSize));
    sessionStorage.setItem('hanbin_movies_page', String(currentPage));
  }

  function buildShell() {
    return `
      <div id="header-slot"></div>
      <div class="container movies-page">
        <div class="movies-header">
          <div class="movies-header__title">${t('movies.title')}</div>
          <div class="movies-header__sub">${t('movies.sub')}</div>
        </div>
        <div class="movies-stats-row">
          <div class="movies-stats-grid" id="movies-stats-slot"></div>
          <button type="button" class="movies-add-btn" id="movies-add-btn">
            <div class="movies-add-btn__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <span>${t('movies.add_btn')}</span>
          </button>
        </div>
        <div class="filters-row" id="movies-filters-row">
          <button class="filter-chip active" data-filter="all">${t('filter.all')}</button>
          <button class="filter-chip status-watching" data-filter="watching">${t('filter.watching')}</button>
          <button class="filter-chip status-completed" data-filter="completed">${t('filter.completed')}</button>
          <button class="filter-chip status-plan" data-filter="planned">${t('filter.plan')}</button>
          <button class="filter-chip status-dropped" data-filter="dropped">${t('filter.dropped')}</button>
        </div>
        <section class="section" style="margin-bottom:0">
          <div class="section-header">
            <div class="movies-section-title">${t('movies.section.list')}</div>
            <div class="pagination-slot" id="movies-pagination-slot"></div>
          </div>
          <div id="movies-list-slot">
            <div class="loading-dots">${t('loading')}</div>
          </div>
        </section>
        <section class="movies-archive-section">
          <div class="movies-section-title movies-section-title--archive">${t('archive.title')}</div>
          <div id="movies-archive-slot">
            <div class="loading-dots">${t('loading')}</div>
          </div>
        </section>
      </div>
    `;
  }

  container.innerHTML = buildShell();
  renderHeader(container.querySelector('#header-slot'), {});

  function renderStats(movies) {
    const slot = container.querySelector('#movies-stats-slot');
    if (!slot) return;
    const watched = movies.filter(m => m.status === 'completed').length;
    const planned = movies.filter(m => m.status === 'planned').length;
    slot.innerHTML = [
      statCardHTML({ label: t('movies.stats.watched'), number: watched, unit: t('movies.stats.watched_unit') }),
      statCardHTML({ label: t('movies.stats.planned'), number: planned, unit: t('movies.stats.planned_unit') }),
    ].join('');
  }

  // ── Дропдаун статуса в таблице — клик по бейджу открывает плавающее меню
  // с остальными тремя статусами (как у дорам), выбор шлёт PATCH.
  function attachStatusDropdown(slot) {
    slot.querySelectorAll('.movies-status-badge').forEach(wrap => {
      wrap.addEventListener('click', (e) => {
        e.stopPropagation();

        const alreadyOpenForThis = _movieMenuEl?.dataset.forId === wrap.dataset.id && _movieMenuEl?.dataset.kind === 'status';
        closeMovieStatusMenu();
        if (alreadyOpenForThis) return;

        const id = wrap.dataset.id;
        const current = wrap.dataset.current;
        const rect = wrap.getBoundingClientRect();

        const menu = document.createElement('div');
        menu.className = 'status-dropdown-menu';
        menu.dataset.forId = id;
        menu.dataset.kind = 'status';
        menu.style.left = rect.left + 'px';
        menu.style.top = (rect.bottom + 6) + 'px';

        STATUS_ORDER.filter(s => s !== current).forEach(status => {
          const meta = STATUS_META[status];
          const item = document.createElement('div');
          item.className = 'status-dropdown-option';
          item.textContent = t(meta.labelKey);
          item.addEventListener('click', async (ev) => {
            ev.stopPropagation();
            closeMovieStatusMenu();
            wrap.style.opacity = '0.5';
            wrap.style.pointerEvents = 'none';

            const { error } = await updateMovieStatus(id, status);
            wrap.style.opacity = '';
            wrap.style.pointerEvents = '';
            if (error) {
              console.warn('[Movies] updateMovieStatus failed:', error);
              return;
            }

            const movie = allMovies.find(m => m.id === id);
            if (movie) movie.status = status;
            wrap.dataset.current = status;
            wrap.innerHTML = `<span class="badge badge--${meta.badgeClass}">${t(meta.labelKey)}</span>`;
            renderStats(allMovies);
          });
          menu.appendChild(item);
        });

        document.body.appendChild(menu);
        _movieMenuEl = menu;

        setTimeout(() => {
          document.addEventListener('click', closeMovieStatusMenu, { once: true });
        }, 0);
      });
    });
  }

  /**
   * Открывает плавающее меню-чекбокс-лист для мультивыбора (жанр/категория) — тот же
   * визуальный класс .status-dropdown-menu, что и у статуса, но с чекбоксами и БЕЗ закрытия
   * при клике по опции — можно отметить сразу несколько подряд, каждый клик сам шлёт PATCH.
   */
  function openMultiSelectMenu(wrap, { kind, options, currentValues, onToggle }) {
    const alreadyOpenForThis = _movieMenuEl?.dataset.forId === wrap.dataset.id && _movieMenuEl?.dataset.kind === kind;
    closeMovieStatusMenu();
    if (alreadyOpenForThis) return;

    const rect = wrap.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.className = 'status-dropdown-menu movies-multiselect-menu';
    menu.dataset.forId = wrap.dataset.id;
    menu.dataset.kind = kind;
    menu.style.left = rect.left + 'px';
    menu.style.top = (rect.bottom + 6) + 'px';
    menu.addEventListener('click', (e) => e.stopPropagation());

    if (!options.length) {
      menu.innerHTML = `<div class="movies-multiselect-empty">${t('movies.filter_empty')}</div>`;
    } else {
      options.forEach(opt => {
        const active = currentValues.includes(opt.value);
        const item = document.createElement('div');
        item.className = `movies-multiselect-option ${active ? 'movies-multiselect-option--active' : ''}`;
        item.innerHTML = `<span class="movies-multiselect-option__check">${active ? '✓' : ''}</span><span>${opt.label}</span>`;
        item.addEventListener('click', () => onToggle(opt.value, item));
        menu.appendChild(item);
      });
    }

    document.body.appendChild(menu);
    _movieMenuEl = menu;

    setTimeout(() => {
      document.addEventListener('click', closeMovieStatusMenu, { once: true });
    }, 0);
  }

  /** Клик по ячейке жанра — мультивыбор из фиксированного списка GENRE_KEYS (тот же, что и в модалке добавления). */
  function attachGenreEdit(slot) {
    slot.querySelectorAll('.movies-editable-cell[data-field="genre"]').forEach(wrap => {
      wrap.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = wrap.dataset.id;
        const movie = allMovies.find(m => m.id === id);
        if (!movie) return;
        let selected = (movie.genre ?? '').split(',').map(g => g.trim()).filter(Boolean);

        openMultiSelectMenu(wrap, {
          kind: 'genre',
          options: GENRE_KEYS.map(g => ({ value: g.value, label: t(g.key) })),
          currentValues: selected,
          onToggle: async (value, itemEl) => {
            selected = selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value];
            itemEl.classList.toggle('movies-multiselect-option--active', selected.includes(value));
            itemEl.querySelector('.movies-multiselect-option__check').textContent = selected.includes(value) ? '✓' : '';

            const genreStr = selected.join(', ');
            const { data, error } = await updateMovieField(id, { genre: genreStr });
            if (error) {
              console.warn('[Movies] updateMovieField(genre) failed:', error);
              return;
            }
            movie.genre = data?.genre ?? genreStr;
            wrap.innerHTML = movieGenresHTML(movie.genre);
          },
        });
      });
    });
  }

  /** Клик по ячейке категории — мультивыбор из персонального списка (getMovieCategories, кэшируется). */
  function attachCategoryEdit(slot) {
    slot.querySelectorAll('.movies-editable-cell[data-field="category"]').forEach(wrap => {
      wrap.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = wrap.dataset.id;
        const movie = allMovies.find(m => m.id === id);
        if (!movie) return;

        const categories = await getCategoriesList();
        let selected = (movie.category ?? '').split(',').map(c => c.trim()).filter(Boolean);

        openMultiSelectMenu(wrap, {
          kind: 'category',
          options: categories.map(name => ({ value: name, label: name })),
          currentValues: selected,
          onToggle: async (value, itemEl) => {
            selected = selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value];
            itemEl.classList.toggle('movies-multiselect-option--active', selected.includes(value));
            itemEl.querySelector('.movies-multiselect-option__check').textContent = selected.includes(value) ? '✓' : '';

            const categoryStr = selected.join(', ');
            const { data, error } = await updateMovieField(id, { category: categoryStr });
            if (error) {
              console.warn('[Movies] updateMovieField(category) failed:', error);
              return;
            }
            movie.category = data?.category ?? categoryStr;
            wrap.innerHTML = movieCategoriesHTML(movie.category);
          },
        });
      });
    });
  }

  /** Клик по ячейке страны — одиночный выбор с поиском (тот же список COUNTRIES, что и в модалке добавления). */
  function attachCountryEdit(slot) {
    slot.querySelectorAll('.movies-editable-cell[data-field="country"]').forEach(wrap => {
      wrap.addEventListener('click', (e) => {
        e.stopPropagation();

        const alreadyOpenForThis = _movieMenuEl?.dataset.forId === wrap.dataset.id && _movieMenuEl?.dataset.kind === 'country';
        closeMovieStatusMenu();
        if (alreadyOpenForThis) return;

        const id = wrap.dataset.id;
        const movie = allMovies.find(m => m.id === id);
        if (!movie) return;

        const rect = wrap.getBoundingClientRect();
        const menu = document.createElement('div');
        menu.className = 'status-dropdown-menu';
        menu.dataset.forId = id;
        menu.dataset.kind = 'country';
        menu.style.left = rect.left + 'px';
        menu.style.top = (rect.bottom + 6) + 'px';
        menu.addEventListener('click', (ev) => ev.stopPropagation());

        menu.innerHTML = `
          <div style="padding:6px 8px;border-bottom:1px solid rgba(232,196,184,0.1)">
            <input type="text" class="movies-country-search" placeholder="${t('modal.addmovie.field.country_search_ph')}" autocomplete="off">
          </div>
          <div class="movies-country-options"></div>
        `;

        const optionsEl = menu.querySelector('.movies-country-options');
        const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';

        const applyCountry = async (code) => {
          closeMovieStatusMenu();
          wrap.style.opacity = '0.5';
          const { data, error } = await updateMovieField(id, { country: code });
          wrap.style.opacity = '';
          if (error) {
            console.warn('[Movies] updateMovieField(country) failed:', error);
            return;
          }
          movie.country = data?.country ?? code;
          wrap.innerHTML = movieCountryHTML(movie.country);
        };

        function renderOptions(query) {
          const q = query.trim().toLowerCase();
          const filtered = q
            ? COUNTRIES.filter(c => c.ru.toLowerCase().includes(q) || c.en.toLowerCase().includes(q))
            : COUNTRIES;
          if (!filtered.length) {
            optionsEl.innerHTML = `<div class="movies-multiselect-empty">${t('modal.addmovie.field.country_empty')}</div>`;
            return;
          }
          optionsEl.innerHTML = filtered.map(c => `<div class="status-dropdown-option" data-code="${c.code}">${c.flag} ${lang === 'en' ? c.en : c.ru}</div>`).join('');
          optionsEl.querySelectorAll('[data-code]').forEach(opt => {
            opt.addEventListener('click', () => applyCountry(opt.dataset.code));
          });
        }
        renderOptions('');

        const searchInput = menu.querySelector('.movies-country-search');
        searchInput.addEventListener('input', () => renderOptions(searchInput.value));

        document.body.appendChild(menu);
        _movieMenuEl = menu;
        setTimeout(() => searchInput.focus(), 30);

        setTimeout(() => {
          document.addEventListener('click', closeMovieStatusMenu, { once: true });
        }, 0);
      });
    });
  }

  /** Клик по ячейке года — инлайн числовой инпут, Enter/blur сохраняет, Esc отменяет. Пустое значение сбрасывает год. */
  function attachYearEdit(slot) {
    slot.querySelectorAll('.movies-editable-cell[data-field="year"]').forEach(wrap => {
      wrap.addEventListener('click', (e) => {
        e.stopPropagation();
        if (wrap.querySelector('.movies-year-input')) return; // уже в режиме редактирования

        const id = wrap.dataset.id;
        const movie = allMovies.find(m => m.id === id);
        if (!movie) return;
        const currentYear = movie.year ?? '';

        wrap.innerHTML = `<input type="number" class="movies-year-input" min="1900" max="2100">`;
        const input = wrap.querySelector('.movies-year-input');
        input.value = currentYear;
        input.focus();
        input.select();

        let settled = false;
        const restore = (year) => {
          if (settled) return;
          settled = true;
          wrap.innerHTML = movieYearHTML(year);
        };

        const save = async () => {
          if (settled) return;
          const raw = input.value.trim();
          if (raw === String(currentYear || '')) { restore(currentYear); return; }
          settled = true;
          input.disabled = true;

          const patch = raw ? { release_year: Number(raw) } : { clear_year: true };
          const { data, error } = await updateMovieField(id, patch);
          settled = false;

          if (error) {
            console.warn('[Movies] updateMovieField(year) failed:', error);
            restore(currentYear);
            return;
          }
          const finalYear = data?.year ?? (raw ? Number(raw) : null);
          movie.year = finalYear;
          restore(finalYear);
        };

        input.addEventListener('blur', save);
        input.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); }
          if (ev.key === 'Escape') { settled = true; restore(currentYear); }
        });
      });
    });
  }

  /** Навешивает карандаш-редактирование названия на одну кнопку — самодостаточно, без пересканирования всей таблицы. */
  function bindTitlePencil(btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const movie = allMovies.find(m => m.id === id);
      if (!movie) return;
      const wrap = btn.closest('.movies-editable-title');
      const currentTitle = movie.title;

      wrap.innerHTML = `<input type="text" class="movies-title-input" maxlength="200">`;
      const input = wrap.querySelector('.movies-title-input');
      input.value = currentTitle;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);

      let settled = false;

      const restore = (title) => {
        if (settled) return;
        settled = true;
        wrap.innerHTML = `
          <span class="movies-table-title">${title}</span>
          <button type="button" class="movies-edit-pencil" data-id="${id}" data-tooltip="${t('profile.edit_tooltip')}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </button>
        `;
        bindTitlePencil(wrap.querySelector('.movies-edit-pencil'));
      };

      const save = async () => {
        if (settled) return;
        const newTitle = input.value.trim();
        if (!newTitle || newTitle === currentTitle) { restore(currentTitle); return; }
        settled = true;
        input.disabled = true;

        const { data, error } = await updateMovieField(id, { title: newTitle });
        settled = false;

        if (error) {
          console.warn('[Movies] updateMovieField(title) failed:', error);
          restore(currentTitle);
          return;
        }
        const finalTitle = data?.title ?? newTitle;
        movie.title = finalTitle;
        restore(finalTitle);
      };

      input.addEventListener('blur', save);
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); }
        if (ev.key === 'Escape') { settled = true; restore(currentTitle); }
      });
    });
  }

  function attachTitleEdit(slot) {
    slot.querySelectorAll('.movies-edit-pencil').forEach(bindTitlePencil);
  }

  function attachArchiveButtons(slot) {
    slot.querySelectorAll('.table-archive-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const row = btn.closest('tr');
        row.style.opacity = '0.4';
        row.style.pointerEvents = 'none';

        const { error } = await archiveMovie(id);
        if (error) {
          console.warn('[Movies] archiveMovie failed:', error);
          row.style.opacity = '';
          row.style.pointerEvents = '';
          return;
        }

        await Promise.all([loadMovies(), loadArchive()]);
      });
    });
  }

  function attachUnarchiveButtons(slot) {
    slot.querySelectorAll('.table-unarchive-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const row = btn.closest('tr');
        row.style.opacity = '0.4';
        row.style.pointerEvents = 'none';

        const { error } = await unarchiveMovie(id);
        if (error) {
          console.warn('[Movies] unarchiveMovie failed:', error);
          row.style.opacity = '';
          row.style.pointerEvents = '';
          return;
        }

        await Promise.all([loadMovies(), loadArchive()]);
      });
    });
  }

  function attachDeleteButtons(slot) {
    slot.querySelectorAll('.table-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const row = btn.closest('tr');

        if (!btn.dataset.confirm) {
          btn.dataset.confirm = '1';
          const confirmText = document.documentElement.lang === 'en' ? 'Sure?' : 'Точно?';
          const deleteText  = document.documentElement.lang === 'en' ? 'Delete' : 'Удалить';
          btn.textContent = confirmText;
          btn.style.color = 'rgba(255,107,138,0.9)';
          setTimeout(() => {
            delete btn.dataset.confirm;
            btn.textContent = deleteText;
            btn.style.color = '';
          }, 2000);
          return;
        }

        btn.disabled = true;
        row.style.pointerEvents = 'none';
        const { error } = await deleteMovie(btn.dataset.id);
        if (error) {
          console.warn('[Movies] deleteMovie failed:', error);
          delete btn.dataset.confirm;
          btn.disabled = false;
          btn.textContent = t('archive.delete_btn');
          btn.style.color = '';
          row.style.pointerEvents = '';
          return;
        }
        row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        setTimeout(() => row.remove(), 300);
      });
    });
  }

  function renderTable() {
    const slot = container.querySelector('#movies-list-slot');
    const paginationSlot = container.querySelector('#movies-pagination-slot');
    if (!slot) return;

    const filtered = currentFilter === 'all' ? allMovies : allMovies.filter(m => m.status === currentFilter);

    if (!allMovies.length) {
      if (paginationSlot) paginationSlot.innerHTML = '';
      slot.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🎬</div>
          <div class="empty-state__text">${t('movies.empty')}</div>
        </div>
      `;
      return;
    }

    if (!filtered.length) {
      if (paginationSlot) paginationSlot.innerHTML = '';
      slot.innerHTML = `<div class="empty-state"><div class="empty-state__icon">🎬</div><div>${t('movies.filter_empty')}</div></div>`;
      return;
    }

    // Пагинация режется на фронте — тот же принцип, что у дорам (см. Home.js loadWatching).
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;
    const startIdx = (currentPage - 1) * pageSize;
    const pageData = filtered.slice(startIdx, startIdx + pageSize);

    if (paginationSlot) {
      renderPagination(paginationSlot, {
        total,
        pageSize,
        currentPage,
        onPageChange: (page) => {
          currentPage = page;
          persistPagination();
          renderTable();
        },
        onPageSizeChange: (size) => {
          pageSize = size;
          currentPage = 1; // меняется общее число страниц — начинаем с первой
          persistPagination();
          renderTable();
        },
      });
    }

    slot.innerHTML = `
      <div class="drama-table-wrap">
        <table class="drama-table">
          <thead>
            <tr>
              <th>${t('movies.table.title')}</th>
              <th>${t('movies.table.genre')}</th>
              <th>${t('movies.table.category')}</th>
              <th>${t('movies.table.country')}</th>
              <th>${t('movies.table.year')}</th>
              <th>${t('movies.table.status')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${pageData.map(movieRowHTML).join('')}</tbody>
        </table>
      </div>
    `;

    attachStatusDropdown(slot);
    attachTitleEdit(slot);
    attachGenreEdit(slot);
    attachCategoryEdit(slot);
    attachCountryEdit(slot);
    attachYearEdit(slot);
    attachArchiveButtons(slot);
  }

  async function loadMovies() {
    const slot = container.querySelector('#movies-list-slot');
    if (slot) slot.innerHTML = `<div class="loading-dots">${t('loading')}</div>`;

    const { data } = await getMovies();
    if (!container.isConnected) return;

    allMovies = data ?? [];
    renderStats(allMovies);
    renderTable();
  }

  async function loadArchive() {
    const slot = container.querySelector('#movies-archive-slot');
    if (!slot) return;

    slot.innerHTML = `<div class="loading-dots">${t('loading')}</div>`;
    const { data } = await getArchivedMovies();

    if (!container.isConnected) return;

    if (!data || !data.length) {
      slot.innerHTML = `
        <div class="archive-empty">
          <span class="archive-empty__icon">🗄️</span>
          <span class="archive-empty__text">${t('movies.archive.empty')}</span>
        </div>
      `;
      return;
    }

    slot.innerHTML = `
      <div class="drama-table-wrap">
        <table class="drama-table">
          <thead>
            <tr>
              <th>${t('movies.table.title')}</th>
              <th>${t('movies.table.genre')}</th>
              <th>${t('movies.table.category')}</th>
              <th>${t('movies.table.country')}</th>
              <th>${t('movies.table.year')}</th>
              <th>${t('movies.table.status')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${data.map(archivedRowHTML).join('')}</tbody>
        </table>
      </div>
    `;

    attachUnarchiveButtons(slot);
    attachDeleteButtons(slot);
  }

  // ── Фильтр-чипсы ──
  container.querySelectorAll('#movies-filters-row .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('#movies-filters-row .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      currentPage = 1; // новый фильтр — другое общее число страниц, начинаем с первой
      persistPagination();
      renderTable();
    });
  });

  container.querySelector('#movies-add-btn')?.addEventListener('click', () => {
    import('../components/AddMovieModal.js').then(({ openAddMovieModal }) => {
      openAddMovieModal({ onAdded: () => loadMovies() });
    });
  });

  await Promise.all([loadMovies(), loadArchive()]);

  onLangChange(async () => {
    if (!container.isConnected) return;
    const titleEl = container.querySelector('.movies-header__title');
    if (titleEl) titleEl.textContent = t('movies.title');
    const subEl = container.querySelector('.movies-header__sub');
    if (subEl) subEl.textContent = t('movies.sub');
    const sectionTitleEl = container.querySelector('.movies-section-title:not(.movies-section-title--archive)');
    if (sectionTitleEl) sectionTitleEl.textContent = t('movies.section.list');
    const archiveTitleEl = container.querySelector('.movies-section-title--archive');
    if (archiveTitleEl) archiveTitleEl.textContent = t('archive.title');
    const addBtnLabel = container.querySelector('#movies-add-btn span');
    if (addBtnLabel) addBtnLabel.textContent = t('movies.add_btn');
    // Перерисовываем ярлыки фильтр-чипсов (не меняем currentFilter/active-класс)
    const filterLabels = { all: 'filter.all', watching: 'filter.watching', completed: 'filter.completed', planned: 'filter.plan', dropped: 'filter.dropped' };
    container.querySelectorAll('#movies-filters-row .filter-chip').forEach(chip => {
      const key = filterLabels[chip.dataset.filter];
      if (key) chip.textContent = t(key);
    });
    renderHeader(container.querySelector('#header-slot'), {});
    await Promise.all([loadMovies(), loadArchive()]);
  });
}
