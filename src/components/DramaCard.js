/**
 * HANBIN — Drama Card Component
 */

import { updateDramaStatus, rateDrama, deleteDrama } from '../api/mock.js';
import { renderStars, statusLabel } from '../utils/helpers.js';

/** Рендерит сетку карточек */
export function renderDramaCards(container, dramas) {
  if (!dramas.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🌸</div>
        <div class="empty-state__text">No dramas here yet</div>
        <button class="btn-add-empty" onclick="document.querySelector('#add-drama-btn').click()">
          + Add your first drama
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="watching-row">
      ${dramas.map((d, i) => dramaCardHTML(d, i)).join('')}
    </div>
  `;

  // Attach events
  container.querySelectorAll('.watching-card').forEach(card => {
    const id = card.dataset.id;
    const drama = dramas.find(d => d.id === id);

    // Watch button
    card.querySelector('.card-watch-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      // TODO: открыть ссылку на сайт с дорамой
      if (drama?.watchUrl) window.open(drama.watchUrl, '_blank');
      console.log('[MOCK] Watch drama:', id);
    });

    // Status change
    card.querySelector('.card-status-select')?.addEventListener('change', async (e) => {
      e.stopPropagation();
      const newStatus = e.target.value;
      await updateDramaStatus(id, newStatus);
      // TODO: перерендерить страницу или обновить карточку
      console.log('[MOCK] Status updated:', id, '->', newStatus);
    });

    // Card click → detail page
    card.addEventListener('click', () => {
      // TODO: navigate(`#/drama/${id}`)
      console.log('[UI] Open drama detail:', id);
    });
  });
}

/** Рендерит одну карточку */
function dramaCardHTML(d, index) {
  const progress = d.episodesTotal ? Math.round((d.episodesWatched / d.episodesTotal) * 100) : 0;

  return `
    <div class="watching-card" data-id="${d.id}" style="animation: fadeUp 0.5s ${0.1 + index * 0.07}s ease both">
      <div class="card-cover">
        <img src="${d.cover}" alt="${d.title}" loading="lazy">
        <div class="card-cover-overlay"></div>

        <div class="card-badges">
          <span class="badge badge--${d.status}">${statusLabel(d.status)}</span>
          ${d.ongoing ? '<span class="badge badge--ongoing">Ongoing</span>' : ''}
          ${d.hasSubs ? '<span class="badge badge--ru">RU Sub</span>' : ''}
        </div>

        <button class="card-watch-btn" title="Watch now">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
        </button>
      </div>

      <div class="card-info">
        <div class="card-title">${d.title}</div>

        <div class="card-meta">
          <span class="card-year">${d.year}</span>
          ${d.genres.slice(0, 1).map(g => `<span class="card-genre">${g}</span>`).join('')}
        </div>

        <div class="card-stars">${renderStars(d.rating)}</div>

        ${d.status === 'watching' ? `
          <div class="progress-wrap">
            <div class="progress-bar">
              <div class="progress-fill" style="width:${progress}%"></div>
            </div>
            <div class="progress-text">${d.episodesWatched}/${d.episodesTotal}</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/** Рендерит табличный вид */
export function renderDramaTable(container, dramas) {
  if (!dramas.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">🌸</div><div>No dramas here yet</div></div>`;
    return;
  }

  container.innerHTML = `
    <div class="drama-table-wrap">
      <table class="drama-table">
        <thead>
          <tr>
            <th>Drama</th>
            <th>Year</th>
            <th>Genre</th>
            <th>Status</th>
            <th>Rating</th>
            <th>Progress</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${dramas.map(d => `
            <tr class="drama-table__row" data-id="${d.id}">
              <td>
                <div class="table-drama-title">
                  <img src="${d.cover}" alt="${d.title}" class="table-thumb">
                  <span>${d.title}</span>
                </div>
              </td>
              <td class="table-muted">${d.year}</td>
              <td class="table-muted">${d.genres[0]}</td>
              <td><span class="badge badge--${d.status}">${statusLabel(d.status)}</span></td>
              <td>${renderStars(d.rating)}</td>
              <td class="table-muted">${d.episodesWatched}/${d.episodesTotal}</td>
              <td>
                <button class="table-watch-btn" title="Watch">▶</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.querySelectorAll('.drama-table__row').forEach(row => {
    row.querySelector('.table-watch-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = row.dataset.id;
      const drama = dramas.find(d => d.id === id);
      if (drama?.watchUrl) window.open(drama.watchUrl, '_blank');
    });

    row.addEventListener('click', () => {
      console.log('[UI] Open drama detail:', row.dataset.id);
      // TODO: navigate(`#/drama/${row.dataset.id}`)
    });
  });
}
