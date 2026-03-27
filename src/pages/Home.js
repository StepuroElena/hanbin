/**
 * HANBIN — Home Page
 */

import { renderHeader }      from '../components/Header.js';
import { renderStatsBlock }  from '../components/StatsBlock.js';
import { renderFilters }     from '../components/Filters.js';
import { renderDramaCards, renderDramaTable, renderArchiveTable } from '../components/DramaCard.js';
import { renderActivityFeed } from '../components/ActivityFeed.js';
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
        <div class="two-col">
          <div id="activity-slot"></div>
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

  // ── Header ──
  const headerSlot = container.querySelector('#header-slot');
  await renderHeader(headerSlot, {
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
      if (mode === 'card') {
        currentFilters = { ...currentFilters, status: 'watching' };
      } else {
        currentFilters = { ...currentFilters, status: 'all' };
      }
      loadWatching();
    },
  });

  // ── Stats ──
  await renderStatsBlock(container.querySelector('#stats-slot'));

  // ── Filters ──
  renderFilters(container.querySelector('#filters-slot'), {
    activeFilter: 'all',
    onFilter: async ({ type, value }) => {
      if (type === 'status') {
        const defaultStatus = currentView === 'card' ? 'watching' : 'all';
        currentFilters = { ...currentFilters, status: value === 'all' ? defaultStatus : value };
      }
      if (type === 'genre')  currentFilters = { ...currentFilters, genre: value };
      if (type === 'country') currentFilters = { ...currentFilters, country: value };
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

  await loadWatching();

  // ── Archive ──
  async function loadArchive() {
    const slot = container.querySelector('#archive-slot');
    if (!slot) return;
    const { data } = await getArchivedDramas();
    renderArchiveTable(slot, data, loadArchive);
  }

  await loadArchive();

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

  // ── Activity + Sidebar (parallel) ──
  await Promise.all([
    renderActivityFeed(container.querySelector('#activity-slot')),
    renderSidebar(container.querySelector('#sidebar-slot')),
  ]);
}
