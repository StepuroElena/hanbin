/**
 * HANBIN — Sidebar Component
 * Статистика по странам + бейджи
 */

import { getUser } from '../api/mock.js';
import { navigate } from '../router.js';

export async function renderSidebar(container) {
  const { data: user } = await getUser();
  const { countries, badges } = user;

  container.innerHTML = `
    <aside class="sidebar">

      <!-- Country breakdown -->
      <div class="sidebar-card glass-card">
        <div class="sidebar-title">По странам</div>
        ${countries.map(c => `
          <div class="country-bar">
            <div class="country-name">${c.flag} ${c.name}</div>
            <div class="country-track">
              <div class="country-fill ${c.colorClass}" style="width:${c.percent}%"></div>
            </div>
            <div class="country-count">${c.count}</div>
          </div>
        `).join('')}
      </div>

      <!-- Badges -->
      <div class="sidebar-card glass-card">
        <div class="sidebar-title">Мои достижения</div>
        <div class="badges-grid">
          ${badges.map(b => `
            <div class="badge-item ${b.unlocked ? '' : 'badge-item--locked'}"
                 title="${b.unlocked ? b.name : 'Заблокировано — смотри дальше!'}">
              <div class="badge-icon">${b.icon}</div>
              <div class="badge-name">${b.name}</div>
            </div>
          `).join('')}
        </div>
        <button class="see-all" id="see-all-badges" style="margin-top:14px;display:block">
          Все достижения →
        </button>
      </div>

    </aside>
  `;

  // Badges click
  container.querySelectorAll('.badge-item').forEach(item => {
    item.addEventListener('click', () => {
      console.log('[UI] Badge clicked');
      // TODO: navigate('#/achievements')
    });
  });

  container.querySelector('#see-all-badges')?.addEventListener('click', () => {
    console.log('[UI] See all badges');
    // TODO: navigate('#/achievements')
  });
}
