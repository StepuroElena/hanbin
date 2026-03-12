/**
 * HANBIN — Sidebar Component
 * Статистика по странам + бейджи
 */

import { getUser } from '../api/mock.js';
import { t, onLangChange } from '../i18n/index.js';

export async function renderSidebar(container) {
  const { data: user } = await getUser();
  const { countries, badges } = user;

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

        <!-- Badges -->
        <div class="sidebar-card glass-card">
          <div class="sidebar-title">${t('sidebar.badges')}</div>
          <div class="badges-grid">
            ${badges.map(b => {
              // Map badge id to i18n key
              const nameKeyMap = {
                drama_queen:  'sidebar.badge.drama_queen',
                kdrama_fan:   'sidebar.badge.kdrama_fan',
                cdrama:       'sidebar.badge.cdrama',
                '2000h':      'sidebar.badge.2000h',
                night_owl:    'sidebar.badge.night_owl',
                '100dramas':  'sidebar.badge.100dramas',
              };
              const localName = nameKeyMap[b.id] ? t(nameKeyMap[b.id]) : b.name;
              const lockedLabel = t('sidebar.badges') === 'Your Badges'
                ? 'Locked — keep watching!'
                : 'Заблокировано — смотри дальше!';
              return `
                <div class="badge-item ${b.unlocked ? '' : 'badge-item--locked'}"
                     title="${b.unlocked ? localName : lockedLabel}">
                  <div class="badge-icon">${b.icon}</div>
                  <div class="badge-name">${localName}</div>
                </div>
              `;
            }).join('')}
          </div>
          <button class="see-all" id="see-all-badges" style="margin-top:14px;display:block">
            ${t('home.see_all')}
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

  render();
  onLangChange(() => render());
}
