/**
 * HANBIN — Activity Feed Component
 */

import { getActivity } from '../api/mock.js';
import { timeAgo, statusLabel } from '../utils/helpers.js';

export async function renderActivityFeed(container) {
  const { data: activity } = await getActivity(5);

  const actionLabel = (action) => ({
    completed: 'Просмотрено',
    rated:     'Оценено',
    plan:      'Добавлено в «Запланировано»',
    watching:  'Начала смотреть',
    dropped:   'Брошено',
  }[action] || action);

  container.innerHTML = `
    <section class="section">
      <div class="section-header">
        <div class="section-title">Последние действия</div>
        <button class="see-all" id="see-all-activity">Все →</button>
      </div>

      <div class="activity-list">
        ${activity.map((act, i) => `
          <div class="activity-item" data-id="${act.dramaId}"
               style="animation: fadeUp 0.4s ${0.1 + i * 0.06}s ease both">
            <img class="activity-thumb" src="${act.drama?.cover}" alt="${act.drama?.title}" loading="lazy">
            <div class="activity-info">
              <div class="activity-title">${act.drama?.title}</div>
              <div class="activity-detail">
                <span class="badge badge--${act.action === 'completed' ? 'completed' : act.action === 'plan' ? 'plan' : 'watching'}">
                  ${actionLabel(act.action)}
                </span>
                <span>${act.drama?.episodesTotal} episodes · ${act.drama?.year}</span>
              </div>
            </div>
            <div class="activity-time">${timeAgo(act.timestamp)}</div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  // Events
  container.querySelectorAll('.activity-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      console.log('[UI] Open drama from activity:', id);
      // TODO: navigate(`#/drama/${id}`)
    });
  });

  container.querySelector('#see-all-activity')?.addEventListener('click', () => {
    console.log('[UI] See all activity');
    // TODO: navigate('#/activity')
  });
}
