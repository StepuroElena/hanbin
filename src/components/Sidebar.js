/**
 * HANBIN — Sidebar Component
 * Статистика по странам + бейджи
 */

import { getUser } from '../api/mock.js';
import { t, onLangChange } from '../i18n/index.js';

export async function renderSidebar(container) {
  const { data: user } = await getUser();
  const { countries } = user;

  function render() {
    container.innerHTML = `
      <aside class="sidebar">

        <!-- Country breakdown -->
        <div class="sidebar-card glass-card">
          <div class="sidebar-title">${t('sidebar.by_country')}</div>
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

      </aside>
    `;

  }

  render();
  onLangChange(() => render());
}
