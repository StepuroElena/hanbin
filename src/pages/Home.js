/**
 * HANBIN — Home Page
 */

import { renderHeader }      from '../components/Header.js';
import { renderStatsBlock }  from '../components/StatsBlock.js';
import { renderFilters }     from '../components/Filters.js';
import { renderDramaCards, renderDramaTable, renderArchiveTable } from '../components/DramaCard.js';
import { renderSidebar }     from '../components/Sidebar.js';
import { renderPagination, PAGE_SIZE_OPTIONS } from '../components/Pagination.js';
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
            <div class="pagination-slot" id="pagination-slot"></div>
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
  // Дефолт при загрузке — всегда «status:'all'», без жанра/страны, в любом виде.
  // Статус, жанр и страна теперь комбинируются по И одновременно — раньше выбор любого
  // из трёх заменял currentFilters целиком, и выбрать статус+жанр+страну вместе было невозможно.
  let currentFilters = { status: 'all', genre: [], country: [] };
  // Становится true, как только пользователь вручную выберет фильтр (статус/жанр/страна).
  // После явного выбора — фильтр должен переживать переключение карточки/таблицы, а не сбрасываться.
  let hasExplicitFilter = false;

  // ── Пагинация ──
  // sessionStorage — переживает обычный рефреш страницы (как и позиция скролла в router.js), но очищается,
  // когда закрывается вкладка/сессия — в отличие от localStorage. Оговорка: браузерный «жёсткий»
  // рефреш (Cmd+Shift+R) технически не отличается от обычного для JS/sessionStorage — оба просто перезагружают страницу,
  // не трогая sessionStorage. Сброс только при закрытии вкладки/окна.
  const savedPageSize = Number(sessionStorage.getItem('hanbin_page_size'));
  let pageSize = PAGE_SIZE_OPTIONS.includes(savedPageSize) ? savedPageSize : PAGE_SIZE_OPTIONS[0];
  const savedPage = Number(sessionStorage.getItem('hanbin_page'));
  let currentPage = savedPage >= 1 ? savedPage : 1;

  function persistPagination() {
    sessionStorage.setItem('hanbin_page_size', String(pageSize));
    sessionStorage.setItem('hanbin_page', String(currentPage));
  }

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
      // Дефолт одинаков для обоих видов — status:'all', без жанра/страны. Актуален только пока пользователь ни разу не трогал фильтры вручную.
      if (!hasExplicitFilter) {
        currentFilters = { status: 'all', genre: [], country: [] };
      }
      loadWatching();
    },
  });

  // ── Stats ──
  // Без await: внутри уже рисуется скелетон синхронно, реальные цифры подтянутся сами.
  renderStatsBlock(container.querySelector('#stats-slot'));

  // ── Filters ──
  // Filters.js теперь сам комбинирует статус/жанр/страну внутри себя и отдаёт весь объединённый
  // объект целиком при любом изменении — просто применяем его как новый currentFilters.
  // Раньше каждый фильтр был взаимоисключающим — выбор статуса стирал выбранный жанр/страну и наоборот,
  // из-за чего комбинация «статус + жанр + страна одновременно» была невозможна.
  renderFilters(container.querySelector('#filters-slot'), {
    activeFilter: currentFilters,
    onFilter: async (filters) => {
      hasExplicitFilter = true; // теперь этот выбор переживёт переключение карточки/таблицы
      currentPage = 1; // новый фильтр — другое общее количество страниц, начинаем с первой
      persistPagination();
      currentFilters = filters;
      await loadWatching();
    },
  });

  // ── Currently Watching ──
  async function loadWatching() {
    const slot = container.querySelector('#watching-slot');
    slot.innerHTML = `<div class="loading-dots">${t('loading')}</div>`;

    // Берём весь отфильтрованный список целиком — пагинация режется на фронте, а не на бэке.
    let { data: allData } = await getDramas({ ...currentFilters, limit: 100000 });

    const total = allData.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * pageSize;
    const pageData = allData.slice(startIdx, startIdx + pageSize);

    renderPagination(container.querySelector('#pagination-slot'), {
      total,
      pageSize,
      currentPage,
      onPageChange: (page) => {
        currentPage = page;
        persistPagination();
        loadWatching();
      },
      onPageSizeChange: (size) => {
        pageSize = size;
        currentPage = 1; // меняется количество страниц — начинаем с первой, чтобы не зависнуть в пустую страницу
        persistPagination();
        loadWatching();
      },
    });

    if (currentView === 'table') {
      renderDramaTable(slot, pageData);
    } else {
      renderDramaCards(slot, pageData);
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

  // ── Refresh on data change (e.g. after addDrama) ──
  // Перезапрашиваем /users/me и обновляем все слоты
  const onDataChanged = async () => {
    await loadWatching();
    await loadArchive();
    await renderStatsBlock(container.querySelector('#stats-slot'));
    await renderSidebar(container.querySelector('#sidebar-slot'));
  };
  window.addEventListener('hanbin:data-changed', onDataChanged);

  // Лёгкое событие от DramaCard.js: статус/сезоны/серии/длительность в таблице влияют на карточки
  // «Просмотрено дорам» / «Запланировано» / «Часов дорам» — перерисовываем ТОЛЬКО блок
  // статистики, а не всю таблицу/архив/сайдбар.
  const onStatsChanged = () => {
    renderStatsBlock(container.querySelector('#stats-slot'));
  };
  window.addEventListener('hanbin:stats-changed', onStatsChanged);

  // Отписываемся при уходе со страницы (router чистит container)
  const observer = new MutationObserver(() => {
    if (!container.isConnected) {
      window.removeEventListener('hanbin:data-changed', onDataChanged);
      window.removeEventListener('hanbin:stats-changed', onStatsChanged);
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
