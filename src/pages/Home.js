/**
 * HANBIN — Home Page
 */

import { renderHeader }      from '../components/Header.js';
import { renderStatsBlock }  from '../components/StatsBlock.js';
import { renderFilters }     from '../components/Filters.js';
import { renderDramaCards, renderDramaTable, renderArchiveTable } from '../components/DramaCard.js';
import { renderSidebar }     from '../components/Sidebar.js';
import { getDramas, getCurrentlyWatching, getArchivedDramas } from '../api/mock.js';
import { t, onLangChange } from '../i18n/index.js';

export async function renderHome(container) {
  function buildShell() {
    return `
      <div id="header-slot"></div>
      <div class="container">
        <div id="stats-slot"></div>
        <div id="filters-slot"></div>
        <section class="section">
          <div class="section-header">
            <div class="section-title">${t('home.currently_watching')}</div>
            <button class="see-all" id="see-all-watching">${t('home.see_all')}</button>
          </div>
          <div id="watching-slot"></div>
        </section>
        <div class="two-col two-col--sidebar-only">
          <div id="sidebar-slot"></div>
        </div>
        <section class="section section--archive" id="archive-section">
          <div class="section-header">
            <div class="section-title section-title--archive">${t('archive.title')}</div>
          </div>
          <div id="archive-slot"></div>
        </section>
      </div>
    `;
  }

  container.innerHTML = buildShell();

  // Читаем сохранённый вид — переживает рефреш
  let currentView = localStorage.getItem('hanbin_view_mode') || 'card';
  let currentFilters = { status: currentView === 'card' ? 'watching' : 'all' };
  // Становится true, как только пользователь вручную выберет фильтр (статус/жанр/страна).
  // Пока false — переключение карточки/таблицы вправе подставлять дефолтный статус для нового вида.
  // После явного выбора — фильтр должен переживать переключение вида, а не сбрасываться.
  let hasExplicitFilter = false;

  // ── Header ──
  // Без await: шапка сама красит себя мгновенно (по localStorage) и доводит auth в фоне—
  // не блокируем её отрисовкой остальные секции страницы.
  const headerSlot = container.querySelector('#header-slot');
  renderHeader(headerSlot, {
    onSearch: (query, results) => {
      if (!query) return loadWatching();
      if (results) {
        if (currentView === 'table') {
          renderDramaTable(container.querySelector('#watching-slot'), results);
        } else {
          renderDramaCards(container.querySelector('#watching-slot'), results);
        }
      }
    },
    onViewChange: (mode) => {
      currentView = mode;
      // Раньше тут был баг: при любом переключении вида currentFilters тихо затирался дефолтом,
      // и любой выбранный вручную фильтр/статус сбрасывался при переключении карточки/таблицы.
      // Теперь дефолт применяется только пока пользователь ни разу не трогал фильтры вручную.
      if (!hasExplicitFilter) {
        currentFilters = { status: mode === 'card' ? 'watching' : 'all' };
      }
      loadWatching();
    },
  });

  // ── Stats ──
  // Без await: внутри уже рисуется скелетон синхронно, реальные цифры подтянутся сами.
  renderStatsBlock(container.querySelector('#stats-slot'));

  // ── Filters ──
  // activeFilter должен совпадать с реальным дефолтным фильтром выше (currentFilters).
  // Раньше тут был жёстко прописан 'all', хотя реальный дефолт в карточном виде — status:'watching'.
  // Отсюда визуальное рассогласование: чип «Все» активен, а на самом деле показывался фоллбэк на «status:'plan'».
  renderFilters(container.querySelector('#filters-slot'), {
    activeFilter: currentFilters.status ?? currentFilters.genre ?? currentFilters.country ?? 'all',
    onFilter: async ({ type, value }) => {
      // Фильтры взаимоисключающие — как и визуально в чипах (активен только один).
      // Раньше они тихо накапливались (AND) поверх дефолтного status:'watching',
      // из-за чего клик по жанру/стране показывал только «сейчас смотрю + жанр» и часто выглядел как «не работает».
      hasExplicitFilter = true; // теперь этот выбор переживёт переключение карточки/таблицы
      if (type === 'status') {
        // "Все" — это всегда весь список, в любом виде (карточки/таблица).
        // Раньше здесь был баг: в карточном виде клик по «Все» тихо откатывался на status:'watching',
        // и пользователь никогда не видел полный список в карточках.
        // Дефолтный status:'watching' остаётся только при первой загрузке страницы (см. currentFilters выше).
        currentFilters = { status: value };
      } else if (type === 'genre') {
        currentFilters = { genre: value };
      } else if (type === 'country') {
        currentFilters = { country: value };
      }
      await loadWatching();
    },
  });

  // ── Currently Watching ──
  async function loadWatching() {
    const slot = container.querySelector('#watching-slot');
    slot.innerHTML = `<div class="loading-dots">${t('loading')}</div>`;

    let { data } = await getDramas(currentFilters);

    // Если в карточном виде watching-фильтр вернул пустой список —
    // показываем запланированные как фоллбэк («Следующее на очереди»)
    if (currentView !== 'table' && currentFilters.status === 'watching' && data.length === 0) {
      const { data: planData } = await getDramas({ ...currentFilters, status: 'plan' });
      data = planData;
    }

    if (currentView === 'table') {
      renderDramaTable(slot, data);
    } else {
      renderDramaCards(slot, data);
    }
  }

  // Без await: loadWatching сама сразу ставит индикатор загрузки, дальше не блокируем архив/сайдбар.
  loadWatching();

  // ── Archive ──
  async function loadArchive() {
    const slot = container.querySelector('#archive-slot');
    if (!slot) return;
    // Сразу показываем индикатор загрузки — раньше секция оставалась пустой, пока не приходил ответ.
    slot.innerHTML = `<div class="loading-dots">${t('loading')}</div>`;
    const { data } = await getArchivedDramas();
    renderArchiveTable(slot, data, loadArchive);
  }

  // Без await: идёт параллельно loadWatching, а не после неё.
  loadArchive();

  // See all watching
  container.querySelector('#see-all-watching')?.addEventListener('click', () => {
    console.log('[UI] See all watching');
    // TODO: navigate('#/my-list?status=watching')
  });

  // ── Refresh on data change (e.g. after addDrama) ──
  // Перезапрашиваем /users/me и обновляем все слоты
  const onDataChanged = async () => {
    await loadWatching();
    await loadArchive();
    await renderStatsBlock(container.querySelector('#stats-slot'));
    await renderSidebar(container.querySelector('#sidebar-slot'));
  };
  window.addEventListener('hanbin:data-changed', onDataChanged);

  // Отписываемся при уходе со страницы (router чистит container)
  const observer = new MutationObserver(() => {
    if (!container.isConnected) {
      window.removeEventListener('hanbin:data-changed', onDataChanged);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: false });

  // ── Update on lang change ──
  onLangChange(async () => {
    // Заголовок секции "Сейчас смотрю"
    // Берём точный элемент: первый .section-title не .section-title--archive
    const title = container.querySelector('.section-title:not(.section-title--archive)');
    if (title) title.textContent = t('home.currently_watching');
    const seeAll = container.querySelector('#see-all-watching');
    if (seeAll) seeAll.textContent = t('home.see_all');

    // Заголовок секции "Архив"
    const archiveTitle = container.querySelector('.section-title--archive');
    if (archiveTitle) archiveTitle.textContent = t('archive.title');

    // Перерендерим слот с дорамами: в любом виде обновляются бейджи статусов и заголовки таблиц
    await loadWatching();
    await loadArchive();
  });

  // ── Sidebar ──
  // Без await: идёт параллельно с остальными секциями, а не после них.
  renderSidebar(container.querySelector('#sidebar-slot'));
}
