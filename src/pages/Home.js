/**
 * HANBIN — Home Page
 */

import { renderHeader }      from '../components/Header.js';
import { renderStatsBlock }  from '../components/StatsBlock.js';
import { renderFilters }     from '../components/Filters.js';
import { renderDramaCards, renderDramaTable } from '../components/DramaCard.js';
import { renderActivityFeed } from '../components/ActivityFeed.js';
import { renderSidebar }     from '../components/Sidebar.js';
import { getDramas, getCurrentlyWatching } from '../api/mock.js';
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
      </div>
    `;
  }

  container.innerHTML = buildShell();

  let currentView = 'card';
  let currentFilters = { status: 'all' };

  // ── Header ──
  const headerSlot = container.querySelector('#header-slot');
  await renderHeader(headerSlot, {
    onSearch: (query, results) => {
      if (!query) return loadWatching();
      if (results) renderDramaCards(container.querySelector('#watching-slot'), results);
    },
    onViewChange: (mode) => {
      currentView = mode;
      loadWatching();
    },
  });

  // ── Stats ──
  await renderStatsBlock(container.querySelector('#stats-slot'));

  // ── Filters ──
  renderFilters(container.querySelector('#filters-slot'), {
    activeFilter: 'all',
    onFilter: async ({ type, value }) => {
      if (type === 'status') currentFilters = { status: value === 'all' ? undefined : value };
      if (type === 'genre')  currentFilters = { genre: value };
      if (type === 'country') currentFilters = { country: value };
      await loadWatching();
    },
  });

  // ── Currently Watching ──
  async function loadWatching() {
    const slot = container.querySelector('#watching-slot');
    slot.innerHTML = `<div class="loading-dots">${t('loading')}</div>`;
    const { data } = await getDramas(currentFilters);
    if (currentView === 'table') {
      renderDramaTable(slot, data);
    } else {
      renderDramaCards(slot, data.filter(d => d.status === 'watching'));
    }
  }

  await loadWatching();

  // See all watching
  container.querySelector('#see-all-watching')?.addEventListener('click', () => {
    console.log('[UI] See all watching');
    // TODO: navigate('#/my-list?status=watching')
  });

  // ── Update section title on lang change ──
  onLangChange(() => {
    const title = container.querySelector('.section-title');
    if (title) title.textContent = t('home.currently_watching');
    const seeAll = container.querySelector('#see-all-watching');
    if (seeAll) seeAll.textContent = t('home.see_all');
  });

  // ── Activity + Sidebar (parallel) ──
  await Promise.all([
    renderActivityFeed(container.querySelector('#activity-slot')),
    renderSidebar(container.querySelector('#sidebar-slot')),
  ]);
}
