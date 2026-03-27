/**
 * HANBIN — Activity Feed Component
 */

import { getActivity, getDramas } from '../api/mock.js';
import { timeAgo, fetchPoster, defaultPosterURI } from '../utils/helpers.js';

const ACTIVITY_PREVIEW = 3; // сколько показываем по умолчанию

export async function renderActivityFeed(container) {
  // Сначала показываем skeleton
  container.innerHTML = `
    <section class="section">
      <div class="section-header">
        <div class="section-title">Последние действия</div>
      </div>
      <div class="activity-list" id="activity-list-inner">
        <div class="loading-dots">Загрузка…</div>
      </div>
      <div id="activity-show-more-wrap"></div>
    </section>
  `;

  // Загружаем активность + дорамы параллельно
  const [{ data: activity }, { data: allDramas }] = await Promise.all([
    getActivity(10),
    getDramas(),
  ]);

  // Бэк не возвращает обложки, поэтому добавляем плейсхолдер в adapt-фазе
  const dramaById = new Map((allDramas || []).map(d => [d.id, d]));

  const actionLabel = (action) => ({
    completed: 'Просмотрено',
    rated:     'Оценено',
    plan:      'Добавлено в «Запланировано»',
    planned:   'Добавлено в «Запланировано»',
    watching:  'Начала смотреть',
    dropped:   'Брошено',
  }[action] || action);

  const badgeClass = (action) => ({
    completed: 'completed',
    rated:     'watching',
    plan:      'plan',
    planned:   'plan',
    watching:  'watching',
    dropped:   'dropped',
  }[action] || 'watching');

  const list = container.querySelector('#activity-list-inner');
  if (!activity?.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state__icon">💭</div><div>Пока ничего нет</div></div>`;
    return;
  }

  let showAll = false;

  function renderItems() {
    const items = showAll ? activity : activity.slice(0, ACTIVITY_PREVIEW);
    const hasMore = activity.length > ACTIVITY_PREVIEW;

    list.innerHTML = items.map((act, i) => {
    const drama = dramaById.get(act.dramaId) ?? act.drama;
    const title = drama?.title || 'Неизвестная дорама';
    const year = drama?.year || '';
    const episodes = drama?.episodesTotal ? `${drama.episodesTotal} эп.` : '';
    const meta = [episodes, year].filter(Boolean).join(' · ');
    const safeTitle = title.replace(/"/g, '&quot;');
    // src выставляется через JS после вставки DOM
    const hasCover = Boolean(drama?.cover);

    return `
      <div class="activity-item" data-id="${act.dramaId}"
           style="animation: fadeUp 0.4s ${0.1 + i * 0.06}s ease both">
        <img class="activity-thumb" ${hasCover ? `src="${drama.cover}"` : ''}
             data-title="${safeTitle}" alt="${safeTitle}" loading="lazy">
        <div class="activity-info">
          <div class="activity-title">${title}</div>
          <div class="activity-detail">
            <span class="badge badge--${badgeClass(act.action)}">${actionLabel(act.action)}</span>
            ${meta ? `<span>${meta}</span>` : ''}
          </div>
        </div>
        <div class="activity-time">${timeAgo(act.timestamp)}</div>
      </div>
    `;
    }).join('');

    // Кнопка «Показать ещё» / «Свернуть»
    const moreWrap = container.querySelector('#activity-show-more-wrap');
    if (moreWrap) {
      if (hasMore) {
        moreWrap.innerHTML = `
          <button class="activity-show-more" id="activity-toggle-btn">
            ${showAll
              ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg> Свернуть'
              : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg> Ещё ${activity.length - ACTIVITY_PREVIEW} действий`
            }
          </button>`;
        moreWrap.querySelector('#activity-toggle-btn').addEventListener('click', () => {
          showAll = !showAll;
          renderItems();
        });
      } else {
        moreWrap.innerHTML = '';
      }
    }

    // Сразу выставляем inline SVG-плейсхолдер, затем асинхронно заменяем на реальный постер
    list.querySelectorAll('.activity-thumb:not([src])').forEach(img => {
    img.src = defaultPosterURI();
    const title = img.dataset.title;
    if (!title) return;
      fetchPoster(title).then(posterUrl => {
        if (!posterUrl) return;
        img.style.transition = 'opacity 0.3s ease';
        img.style.opacity = '0';
        setTimeout(() => { img.src = posterUrl; img.style.opacity = '1'; }, 150);
      });
    });

    // Events
    list.querySelectorAll('.activity-item').forEach(item => {
      item.addEventListener('click', () => {
        console.log('[UI] Open drama from activity:', item.dataset.id);
      });
    });
  }

  renderItems();
}
