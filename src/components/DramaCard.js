/**
 * HANBIN — Drama Card Component
 */

import { updateDramaStatus, rateDrama, deleteDrama, archiveDrama, unarchiveDrama } from '../api/mock.js';
import { renderStars, statusLabel, fetchPoster, defaultPosterURI, timeAgo } from '../utils/helpers.js';
import { t } from '../i18n/index.js';

const STATUS_OPTIONS = [
  { value: 'watching',  key: 'status.watching' },
  { value: 'completed', key: 'status.completed' },
  { value: 'plan',      key: 'status.plan' },
  { value: 'dropped',   key: 'status.dropped' },
];

let _statusMenuEl = null;

function closeStatusMenu() {
  _statusMenuEl?.remove();
  _statusMenuEl = null;
}

/**
 * Навешивает клик-обработчик на ячейки со статусом в таблице (.status-select-wrap).
 * Клик открывает плавающее меню с остальными статусами (текущий исключён),
 * выбор шлёт PATCH на бэк через updateDramaStatus — он сам инвалидирует кэш и через
 * событие hanbin:data-changed вся страница (Home.js) сама перерисует таблицу с новым статусом.
 */
function attachStatusDropdown(container) {
  container.querySelectorAll('.status-select-wrap').forEach(wrap => {
    wrap.addEventListener('click', (e) => {
      e.stopPropagation();

      const alreadyOpenForThis = _statusMenuEl?.dataset.forId === wrap.dataset.id;
      closeStatusMenu();
      if (alreadyOpenForThis) return; // второй клик по той же ячейке — просто закрываем

      const id = wrap.dataset.id;
      const current = wrap.dataset.current;
      const rect = wrap.getBoundingClientRect();

      const menu = document.createElement('div');
      menu.className = 'status-dropdown-menu';
      menu.dataset.forId = id;
      menu.style.left = rect.left + 'px';
      menu.style.top = (rect.bottom + 6) + 'px';

      STATUS_OPTIONS.filter(opt => opt.value !== current).forEach(opt => {
        const item = document.createElement('div');
        item.className = 'status-dropdown-option';
        item.textContent = t(opt.key);
        item.addEventListener('click', async (ev) => {
          ev.stopPropagation();
          closeStatusMenu();
          wrap.style.opacity = '0.5';
          wrap.style.pointerEvents = 'none';
          const { error } = await updateDramaStatus(id, opt.value);
          if (error) {
            console.warn('[Table] status update failed:', error);
            wrap.style.opacity = '';
            wrap.style.pointerEvents = '';
          }
          // При успехе updateDramaStatus сам вызовет invalidateUserCache() ->
          // Home.js перерисует таблицу с актуальным статусом — локально строку не перерисовываем.
        });
        menu.appendChild(item);
      });

      document.body.appendChild(menu);
      _statusMenuEl = menu;

      // Закрытие по клику снаружи — вешаем на следующий тик, чтобы не поймать текущий клик
      setTimeout(() => {
        document.addEventListener('click', closeStatusMenu, { once: true });
      }, 0);
    });
  });
}

/**
 * Рендерит интерактивные звёзды для ячейки «Оценка» в таблице.
 * Всегда 5 звёзд (даже без оценки) — столбец не должен превращаться в текст «Не оценено».
 */
function interactiveStarsHTML(d, max = 5) {
  const rating = d.rating || 0;
  const stars = Array.from({ length: max }, (_, i) => {
    const value = i + 1;
    return `<span class="table-star ${value <= rating ? 'table-star--filled' : ''}" data-value="${value}">★</span>`;
  }).join('');
  return `<div class="table-stars-wrap" data-id="${d.id}" data-current="${rating}">${stars}</div>`;
}

/**
 * Навешивает клик/ховер на звёзды в таблице (.table-stars-wrap).
 * Клик по звездочке шлёт PATCH на бэк через rateDrama — он сам инвалидирует кэш
 * и через событие hanbin:data-changed вся страница (Home.js) сама перерисует таблицу.
 * Повторный клик по текущей оценке — снимает её (rating = null).
 */
function attachRatingControls(container) {
  container.querySelectorAll('.table-stars-wrap').forEach(wrap => {
    const id = wrap.dataset.id;
    const stars = [...wrap.querySelectorAll('.table-star')];

    stars.forEach(star => {
      star.addEventListener('click', async (e) => {
        e.stopPropagation();
        const value = Number(star.dataset.value);
        const current = Number(wrap.dataset.current) || 0;
        const newRating = value === current ? null : value;

        wrap.classList.add('table-stars-wrap--loading');
        const { error } = await rateDrama(id, newRating);
        wrap.classList.remove('table-stars-wrap--loading');

        if (error) {
          console.warn('[Table] rate failed:', error);
          return;
        }

        // Обновляем только эту ячейку локально — rateDrama инвалидирует кэш тихо,
        // без глобального события — остальная таблица не мигает в «Загрузка…».
        const newValue = newRating ?? 0;
        wrap.dataset.current = newValue;
        stars.forEach(s => {
          s.classList.toggle('table-star--filled', Number(s.dataset.value) <= newValue);
        });
      });

      // Превью оценки при наведении мыши
      star.addEventListener('mouseenter', () => {
        const value = Number(star.dataset.value);
        stars.forEach(s => {
          s.classList.toggle('table-star--preview', Number(s.dataset.value) <= value);
        });
      });
    });

    wrap.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('table-star--preview'));
    });
  });
}

/** Рендерит сетку карточек */
export function renderDramaCards(container, dramas) {
  if (!dramas.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🌸</div>
        <div class="empty-state__text">${t('empty.no_dramas')}</div>
        <button class="btn-add-empty" onclick="document.querySelector('#add-drama-btn').click()">
          ${t('empty.add_btn')}
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

  // 1. Сразу выставляем inline SVG-плейсхолдер (никаких файлов на нашей стороне)
  container.querySelectorAll('.card-cover img:not([src])').forEach(img => {
    img.src = defaultPosterURI();
  });

  // 2. Асинхронно подгружаем реальные постеры с doramatv.one
  //    Каждая карточка получает постер независимо — не блокируем рендер
  dramas.forEach(drama => {
    if (drama.cover) return; // постер уже есть — не трогаем

    const card = container.querySelector(`.watching-card[data-id="${drama.id}"]`);
    const img  = card?.querySelector('.card-cover img');
    if (!img) return;

    fetchPoster(drama.title, drama.watchUrl).then(posterUrl => {
      if (!posterUrl) return; // нет результата — плейсхолдер остаётся
      // Плавно заменяем плейсхолдер на реальный постер
      const fresh = new Image();
      fresh.onload = () => {
        img.style.transition = 'opacity 0.4s ease';
        img.style.opacity = '0';
        setTimeout(() => {
          img.src = posterUrl;
          img.style.opacity = '1';
        }, 200);
      };
      fresh.src = posterUrl;
    });
  });

  // Attach events
  container.querySelectorAll('.watching-card').forEach(card => {
    const id = card.dataset.id;
    const drama = dramas.find(d => d.id === id);

    // Watch button
    card.querySelector('.card-watch-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (drama?.watchUrl) window.open(drama.watchUrl, '_blank');
      console.log('[MOCK] Watch drama:', id);
    });

    // Archive / Unarchive button
    card.querySelector('.card-archive-btn')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const action = e.currentTarget.dataset.action;
      card.style.opacity = '0.4';
      card.style.pointerEvents = 'none';
      if (action === 'unarchive') {
        await unarchiveDrama(id);
      } else {
        await archiveDrama(id);
      }
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
  // cover выставляется через JS после вставки DOM (data-cover) чтобы не ломать HTML-атрибуты
  const hasCover = Boolean(d.cover);

  return `
    <div class="watching-card" data-id="${d.id}" style="animation: fadeUp 0.5s ${0.1 + index * 0.07}s ease both">
      <div class="card-cover">
        <img ${hasCover ? `src="${d.cover}"` : ''} data-title="${d.title.replace(/"/g, '&quot;')}" alt="${d.title.replace(/"/g, '&quot;')}" loading="lazy">
        <div class="card-cover-overlay"></div>

        <div class="card-badges">
          <span class="badge badge--${d.status}">${statusLabel(d.status)}</span>
          ${d.ongoing ? `<span class="badge badge--ongoing">${t('status.ongoing')}</span>` : ''}
          ${d.hasSubs ? '<span class="badge badge--ru">RU Озвучка</span>' : ''}
        </div>

        <button class="card-watch-btn" title="${t('archive.btn')}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
        </button>
        ${d.status === 'archived'
          ? `<button class="card-archive-btn card-archive-btn--unarchive" data-action="unarchive" data-tooltip="${t('archive.unarchive_tooltip')}" data-tooltip-pos="left">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-3.75"/>
              </svg>
            </button>`
          : `<button class="card-archive-btn" data-action="archive" data-tooltip="${t('archive.btn')}" data-tooltip-pos="left">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
              </svg>
            </button>`
        }
      </div>

      <div class="card-info">
        <div class="card-title">${d.title}</div>

        <div class="card-meta">
          <span class="card-year">${d.year}</span>
          ${d.genres.slice(0, 1).map(g => `<span class="card-genre">${g}</span>`).join('')}
        </div>

        ${d.voiceover ? `<div class="card-voiceover">🎙️ ${d.voiceover}</div>` : ''}

        <div class="card-stars">${renderStars(d.rating)}</div>

        ${d.status === 'watching' ? `
          <div class="progress-wrap">
            <div class="progress-bar">
              <div class="progress-fill" style="width:${progress}%"></div>
            </div>
            <div class="progress-text">${d.episodesWatched}/${d.episodesTotal}</div>
          </div>
        ` : `
          <div class="card-status-text">${statusLabel(d.status)}</div>
        `}
      </div>
    </div>
  `;
}

/** Склонение слова «сезон» под число (RU) */
function seasonLabel(n) {
  const { getLang } = { getLang: () => localStorage.getItem('hanbin_lang') || 'ru' };
  if (getLang() !== 'ru') return n === 1 ? 'season' : 'seasons';
  const abs = Math.abs(n) % 100;
  const mod = abs % 10;
  if (abs >= 11 && abs <= 19) return 'сезонов';
  if (mod === 1)              return 'сезон';
  if (mod >= 2 && mod <= 4)  return 'сезона';
  return 'сезонов';
}

/** Склонение слова «серия» под число (RU) */
function episodeLabel(n) {
  const getLang = () => localStorage.getItem('hanbin_lang') || 'ru';
  if (getLang() !== 'ru') return n === 1 ? 'episode' : 'episodes';
  const abs = Math.abs(n) % 100;
  const mod = abs % 10;
  if (abs >= 11 && abs <= 19) return 'серий';
  if (mod === 1)              return 'серия';
  if (mod >= 2 && mod <= 4)  return 'серии';
  return 'серий';
}

/** Форматирует ячейку «Кол-во серий»: «16 серий · 60 мин/серия» или просто «16 серий», если длительность не указана. */
function formatEpisodes(d) {
  const count = d.episodesTotal;
  if (!count) return '<span class="table-no-tags">—</span>';
  const label = episodeLabel(count);
  if (d.episodeDurationMin) {
    return t('table.episodes.with_duration', { n: count, label, min: d.episodeDurationMin });
  }
  return t('table.episodes.count_only', { n: count, label });
}

/** Форматирует дату: сегодня/вчера через timeAgo, остальное — dd.mm.yyyy */
function formatDate(date) {
  if (!date) return '<span class="table-no-tags">—</span>';
  const d = new Date(date);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diffDays < 2) return `<span class="table-date-fresh">${timeAgo(d)}</span>`;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

/** Рендерит табличный вид */
export function renderDramaTable(container, dramas) {
  if (!dramas.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">🌸</div><div>${t('empty.no_dramas')}</div></div>`;
    return;
  }

  const countryFlag = { kr: '🇰🇷', cn: '🇨🇳', jp: '🇯🇵' };

  container.innerHTML = `
    <div class="drama-table-wrap">
      <table class="drama-table">
        <thead>
          <tr>
            <th>${t('table.col.drama')}</th>
            <th>${t('table.col.year')}</th>
            <th>${t('table.col.country')}</th>
            <th>${t('table.col.genre')}</th>
            <th>${t('table.col.voiceover')}</th>
            <th>${t('table.col.status')}</th>
            <th>${t('table.col.rating')}</th>
            <th>${t('table.col.episodes')}</th>
            <th>${t('table.col.seasons')}</th>
            <th>${t('table.col.added_at')}</th>
            <th>${t('table.col.last_watched')}</th>
            <th>${t('table.col.tags')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${dramas.map(d => {
            const flag = countryFlag[d.country] ?? '🌏';
            const tags = [
              d.ongoing  ? `<span class="badge badge--ongoing">${t('status.ongoing')}</span>` : '',
              d.hasSubs  ? `<span class="badge badge--ru">RU</span>` : '',
            ].filter(Boolean).join(' ');
            return `
            <tr class="drama-table__row" data-id="${d.id}">
              <td>
                <div class="table-drama-title">
                  <img class="table-thumb" ${d.cover ? `src="${d.cover}"` : ''} data-title="${d.title.replace(/"/g, '&quot;')}" alt="${d.title.replace(/"/g, '&quot;')}" loading="lazy">
                  <span>${d.title}</span>
                </div>
              </td>
              <td class="table-muted">${d.year}</td>
              <td class="table-muted table-country">${flag} ${(d.country ?? '').toUpperCase()}</td>
              <td class="table-muted">${d.genres.slice(0, 2).join(', ')}</td>
              <td class="table-muted">${d.voiceover ? d.voiceover : '<span class="table-no-tags">—</span>'}</td>
              <td>
                <div class="status-select-wrap" data-id="${d.id}" data-current="${d.status}">
                  <span class="badge badge--${d.status}">${statusLabel(d.status)}</span>
                </div>
              </td>
              <td>${interactiveStarsHTML(d)}</td>
              <td class="table-muted table-episodes">${formatEpisodes(d)}</td>
              <td class="table-muted table-seasons">${d.seasons != null ? `${d.seasons} ${seasonLabel(d.seasons)}` : '<span class="table-no-tags">—</span>'}</td>
              <td class="table-muted table-date">${formatDate(d.addedAt)}</td>
              <td class="table-muted table-date">${d.lastWatchedAt ? formatDate(d.lastWatchedAt) : '<span class="table-no-tags">—</span>'}</td>
              <td class="table-tags">${tags || '<span class="table-no-tags">—</span>'}</td>
              <td style="white-space:nowrap">
                <button class="table-watch-btn" data-tooltip="${t('table.watch_tooltip')}" data-tooltip-pos="left" data-id="${d.id}">▶</button>
                ${d.status === 'archived'
                  ? `<button class="table-archive-btn table-archive-btn--unarchive" data-id="${d.id}" data-action="unarchive" data-tooltip="${t('archive.unarchive_tooltip')}" data-tooltip-pos="left">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.75"/>
                      </svg>
                    </button>`
                  : `<button class="table-archive-btn" data-id="${d.id}" data-action="archive" data-tooltip="${t('archive.btn')}" data-tooltip-pos="left">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
                      </svg>
                    </button>`
                }
              </td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Плейсхолдер + асинхронная подгрузка постера для каждой строки
  container.querySelectorAll('.table-thumb:not([src])').forEach(img => {
    img.src = defaultPosterURI();
    const title = img.dataset.title;
    if (!title) return;
    fetchPoster(title).then(posterUrl => {
      if (!posterUrl) return;
      const fresh = new Image();
      fresh.onload = () => {
        img.style.transition = 'opacity 0.35s ease';
        img.style.opacity = '0';
        setTimeout(() => { img.src = posterUrl; img.style.opacity = '1'; }, 150);
      };
      fresh.src = posterUrl;
    });
  });

  // —— Смена статуса из таблицы: клик по badge —> выпадающий список из остальных статусов
  attachStatusDropdown(container);

  // —— Оценка из таблицы: клик по звездочке —> PATCH на бэк
  attachRatingControls(container);

  container.querySelectorAll('.drama-table__row').forEach(row => {
    row.querySelector('.table-watch-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = row.dataset.id;
      const drama = dramas.find(d => String(d.id) === String(id));
      if (!drama) return;

      // sourceUrl — URL страницы дорамы от скрейпера (точный)
      // watchUrl — URL сайта (может быть просто хост)
      const url = drama.sourceUrl || drama.source_url;
      if (url) {
        window.open(url, '_blank');
        return;
      }
      // Если есть только watchUrl (хост) — строим поиск по названию
      if (drama.watchUrl) {
        try {
          const base = new URL(drama.watchUrl);
          const searchUrl = `${base.origin}/search?q=${encodeURIComponent(drama.title)}`;
          window.open(searchUrl, '_blank');
        } catch {
          window.open(drama.watchUrl, '_blank');
        }
      }
    });

    row.querySelector('.table-archive-btn')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = row.dataset.id;
      const action = e.currentTarget.dataset.action;
      row.style.opacity = '0.4';
      row.style.pointerEvents = 'none';
      if (action === 'unarchive') {
        await unarchiveDrama(id);
      } else {
        await archiveDrama(id);
      }
    });

    row.addEventListener('click', () => {
      console.log('[UI] Open drama detail:', row.dataset.id);
    });
  });
}

/** Рендерит таблицу архива — всегда табличный вид, кнопка «Вернуть» */
export function renderArchiveTable(container, dramas, onUnarchive) {
  if (!dramas.length) {
    container.innerHTML = `
      <div class="archive-empty">
        <span class="archive-empty__icon">🗄️</span>
        <span class="archive-empty__text">${t('archive.empty')}</span>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="drama-table-wrap">
      <table class="drama-table">
        <thead>
          <tr>
            <th>${t('table.col.drama')}</th>
            <th>${t('table.col.year')}</th>
            <th>${t('table.col.genre')}</th>
            <th>${t('table.col.country')}</th>
            <th>${t('table.col.progress')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${dramas.map(d => {
            const watched  = d.episodesWatched ?? 0;
            const total    = d.episodesTotal   ?? 0;
            const progress = total > 0 ? Math.round(watched / total * 100) : 0;
            const countryFlag = { kr: '🇰🇷', cn: '🇨🇳', jp: '🇯🇵' };
            const flag = countryFlag[d.country] ?? '🌏';
            return `
            <tr class="drama-table__row drama-table__row--archived" data-id="${d.id}">
              <td>
                <div class="table-drama-title">
                  <img class="table-thumb" ${d.cover ? `src="${d.cover}"` : ''} data-title="${d.title.replace(/"/g, '&quot;')}" alt="${d.title.replace(/"/g, '&quot;')}" loading="lazy">
                  <span>${d.title}</span>
                </div>
              </td>
              <td class="table-muted">${d.year ?? '—'}</td>
              <td class="table-muted">${d.genres[0] ?? '—'}</td>
              <td class="table-muted table-country">${flag} ${(d.country ?? '').toUpperCase()}</td>
              <td class="table-muted table-progress">
                ${total > 0 ? `
                  <div class="table-progress-wrap">
                    <div class="table-progress-bar archive-progress-bar">
                      <div class="table-progress-fill archive-progress-fill" style="width:${progress}%"></div>
                    </div>
                    <span>${watched}/${total}</span>
                    <span class="archive-progress-pct">${progress}%</span>
                  </div>
                ` : '<span class="table-no-tags">—</span>'}
              </td>
              <td style="white-space:nowrap;display:flex;align-items:center;gap:6px;border-bottom:none">
                <button class="table-unarchive-btn table-unarchive-btn--accent" data-id="${d.id}" data-tooltip="${t('archive.unarchive_tooltip')}" data-tooltip-pos="left">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-3.75"/>
                  </svg>
                  ${t('archive.unarchive_btn')}
                </button>
                <button class="table-delete-btn" data-id="${d.id}" data-tooltip="${t('archive.delete_tooltip')}" data-tooltip-pos="left">${t('archive.delete_btn')}</button>
              </td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
    </div>`;

  container.querySelectorAll('.table-thumb:not([src])').forEach(img => {
    img.src = defaultPosterURI();
    const title = img.dataset.title;
    if (!title) return;
    fetchPoster(title).then(posterUrl => {
      if (!posterUrl) return;
      const fresh = new Image();
      fresh.onload = () => {
        img.style.transition = 'opacity 0.35s ease';
        img.style.opacity = '0';
        setTimeout(() => { img.src = posterUrl; img.style.opacity = '1'; }, 150);
      };
      fresh.src = posterUrl;
    });
  });

  container.querySelectorAll('.table-unarchive-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const row = btn.closest('tr');
      row.style.opacity = '0.4';
      row.style.pointerEvents = 'none';
      await unarchiveDrama(btn.dataset.id);
      if (onUnarchive) onUnarchive();
    });
  });

  container.querySelectorAll('.table-delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const row = btn.closest('tr');
      // Показываем мини-подтверждение внутри бутона
      if (!btn.dataset.confirm) {
        btn.dataset.confirm = '1';
        const confirmText = document.documentElement.lang === 'en' ? 'Sure?' : 'Точно?';
        const deleteText  = document.documentElement.lang === 'en' ? 'Delete' : 'Удалить';
        btn.textContent = confirmText;
        btn.style.color = 'rgba(255,107,138,0.9)';
        setTimeout(() => {
          delete btn.dataset.confirm;
          btn.textContent = deleteText;
          btn.style.color = '';
        }, 2000);
        return;
      }
      // Второй клик — удаляем
      btn.disabled = true;
      row.style.pointerEvents = 'none';
      const { error } = await deleteDrama(btn.dataset.id);
      if (error) {
        // Не удалось — возвращаем кнопку в исходное состояние, строку не трогаем
        console.warn('[Archive] delete failed:', error);
        delete btn.dataset.confirm;
        btn.disabled = false;
        btn.textContent = t('archive.delete_btn');
        btn.style.color = '';
        row.style.pointerEvents = '';
        return;
      }
      row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      setTimeout(() => row.remove(), 300);
    });
  });
}
