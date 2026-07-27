/**
 * HANBIN — Movies Page
 *
 * Таблица + счётчики просмотрено/запланировано + модалка добавления фильма +
 * архив + фильтр-чипсы по статусу (Все/Смотрю/Просмотрено/Запланировано/Брошено) —
 * тот же стиль, что и у дорам. Статус в строке — кликабельный бейдж, открывает
 * выпадающее меню с остальными тремя статусами (как у дорам, не просто toggle).
 * Данные — GET /api/v1/movies (см. src/api/mock.js), гостю показывается локальный мок.
 */

import { renderHeader } from '../components/Header.js';
import { getMovies, getArchivedMovies, updateMovieStatus, archiveMovie, unarchiveMovie, deleteMovie } from '../api/mock.js';
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

  .movies-status-badge { cursor: pointer; user-select: none; }

  .movies-table-title { font-family: var(--font-display); font-size: 17px; color: var(--color-text); }
  .movies-table-year { font-size: 13px; color: var(--color-text-muted); }
  .movies-table-genre { display: inline-block; font-size: 12px; padding: 3px 10px; border-radius: 20px; background: rgba(255,255,255,0.07); color: var(--color-text-muted); margin: 2px 4px 2px 0; }

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

function movieCountryHTML(code) {
  if (!code) return '<span class="table-no-tags">—</span>';
  const c = COUNTRIES.find(x => x.code === code);
  if (!c) return '<span class="table-no-tags">—</span>';
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
  return `<span class="movies-table-year">${c.flag} ${lang === 'en' ? c.en : c.ru}</span>`;
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
      <td><span class="movies-table-title">${movie.title}</span></td>
      <td>${movieGenresHTML(movie.genre)}</td>
      <td>${movieCountryHTML(movie.country)}</td>
      <td><span class="movies-table-year">${movie.year ?? '—'}</span></td>
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

let _movieMenuEl = null;
function closeMovieStatusMenu() {
  _movieMenuEl?.remove();
  _movieMenuEl = null;
}

export async function renderMovies(container) {
  injectMoviesCSS();

  let allMovies = [];       // полный список (без архива) — фильтр-чипсы режут именно его, без повторного запроса
  let currentFilter = 'all';

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
          <div class="movies-section-title">${t('movies.section.list')}</div>
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

        const alreadyOpenForThis = _movieMenuEl?.dataset.forId === wrap.dataset.id;
        closeMovieStatusMenu();
        if (alreadyOpenForThis) return;

        const id = wrap.dataset.id;
        const current = wrap.dataset.current;
        const rect = wrap.getBoundingClientRect();

        const menu = document.createElement('div');
        menu.className = 'status-dropdown-menu';
        menu.dataset.forId = id;
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
    if (!slot) return;

    const filtered = currentFilter === 'all' ? allMovies : allMovies.filter(m => m.status === currentFilter);

    if (!allMovies.length) {
      slot.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🎬</div>
          <div class="empty-state__text">${t('movies.empty')}</div>
        </div>
      `;
      return;
    }

    if (!filtered.length) {
      slot.innerHTML = `<div class="empty-state"><div class="empty-state__icon">🎬</div><div>${t('movies.filter_empty')}</div></div>`;
      return;
    }

    slot.innerHTML = `
      <div class="drama-table-wrap">
        <table class="drama-table">
          <thead>
            <tr>
              <th>${t('movies.table.title')}</th>
              <th>${t('movies.table.genre')}</th>
              <th>${t('movies.table.country')}</th>
              <th>${t('movies.table.year')}</th>
              <th>${t('movies.table.status')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${filtered.map(movieRowHTML).join('')}</tbody>
        </table>
      </div>
    `;

    attachStatusDropdown(slot);
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
