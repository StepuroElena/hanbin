/**
 * HANBIN — Edit Drama Links Modal Component
 *
 * Открывается кнопкой «редактировать ссылки» в табличном и карточном виде (между
 * кнопкой «перейти на сайт» и кнопкой «архивировать»).
 *
 * Флоу:
 *  1. Модалка открывается сразу с индикатором загрузки.
 *  2. Делается ОТДЕЛЬНЫЙ запрос к бэку — getDrama(id) → GET /api/v1/dramas/{id} —
 *     полная информация по дораме НЕ переиспользуется из уже отрендеренной
 *     таблицы/карточки, а тянется свежая.
 *  3. Показывается вся информация о дораме (для справки, не редактируется) плюс
 *     два редактируемых поля-ссылки:
 *       — сайт из дропдауна (watch_url), редактируется так же, как в модалке
 *         добавления дорамы;
 *       — точная ссылка на страницу дорамы (source_url) — опциональна, вводится
 *         вручную.
 *  4. Кнопка «Сохранить изменения» активна, только если хотя бы одно из двух
 *     полей реально отличается от загруженного снимка.
 */

import { closeModal, injectModalCSS } from './LoginModal.js';
import { getDrama, updateDramaLinks } from '../api/mock.js';
import { STREAMING_SITES } from './AddDramaModal.js';
import { statusLabel, renderStars, countryFlag, defaultPosterURI } from '../utils/helpers.js';
import { t, onLangChange } from '../i18n/index.js';

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────

const EDIT_LINKS_CSS = `
  #hb-modal-box.hb-edit-links-box {
    width: 540px; max-height: 88vh; overflow: hidden;
    display: flex; flex-direction: column;
  }
  #hb-modal-box.hb-edit-links-box #hb-modal-content {
    padding: 30px 40px 28px; overflow-y: auto; flex: 1;
    scrollbar-width: thin; scrollbar-color: rgba(201,123,138,0.3) transparent;
  }
  #hb-modal-box.hb-edit-links-box #hb-modal-content::-webkit-scrollbar { width: 4px; }
  #hb-modal-box.hb-edit-links-box #hb-modal-content::-webkit-scrollbar-thumb {
    background: rgba(201,123,138,0.3); border-radius: 4px;
  }

  .hb-el-loader {
    display: flex; align-items: center; gap: 10px;
    padding: 30px 0; font-size: 13px; color: rgba(245,230,211,0.4); font-style: italic;
  }
  @keyframes hb-el-spin { to { transform: rotate(360deg); } }
  .hb-el-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(201,123,138,0.2);
    border-top-color: rgba(201,123,138,0.7);
    border-radius: 50%; animation: hb-el-spin 0.7s linear infinite; flex-shrink: 0;
  }

  .hb-el-error {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 18px; border-radius: 14px;
    background: rgba(255,107,138,0.08); border: 1px solid rgba(255,107,138,0.28);
  }
  .hb-el-error-icon { font-size: 18px; flex-shrink: 0; }
  .hb-el-error-text { font-size: 12px; color: rgba(245,230,211,0.6); line-height: 1.4; }

  .hb-el-summary { display: flex; gap: 16px; margin: 6px 0 4px; }
  .hb-el-poster {
    width: 84px; flex-shrink: 0; border-radius: 12px; overflow: hidden;
    aspect-ratio: 2/3; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(232,196,184,0.15);
  }
  .hb-el-poster img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hb-el-summary-info { flex: 1; min-width: 0; }
  .hb-el-title {
    font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400;
    color: #f5e6d3; margin-bottom: 6px; line-height: 1.25;
  }
  .hb-el-meta { font-size: 12px; color: rgba(245,230,211,0.45); margin-bottom: 8px; }
  .hb-el-badges { display: flex; flex-wrap: wrap; gap: 6px; }

  .hb-el-info-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px;
    margin: 4px 0 4px;
  }
  .hb-el-info-row { font-size: 12px; }
  .hb-el-info-label {
    color: rgba(245,230,211,0.35); letter-spacing: 0.06em; text-transform: uppercase;
    font-size: 10px; margin-bottom: 3px;
  }
  .hb-el-info-value { color: #f5e6d3; }

  .hb-el-hint { font-size: 11px; color: rgba(245,230,211,0.28); margin-top: 6px; font-style: italic; }

  /* Дропдаун сайта — переиспользует визуальный язык модалки добавления дорамы */
  .hb-site-dropdown { position: relative; }
  .hb-site-trigger {
    width: 100%; padding: 11px 16px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(232,196,184,0.18);
    border-radius: 12px; color: #f5e6d3; font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box; display: flex; align-items: center;
    justify-content: space-between; gap: 10px; user-select: none;
  }
  .hb-site-trigger:hover, .hb-site-trigger.hb-site-trigger--open {
    border-color: rgba(201,123,138,0.55); box-shadow: 0 0 0 3px rgba(201,123,138,0.08);
  }
  .hb-site-trigger-left { display: flex; align-items: center; gap: 9px; min-width: 0; flex: 1; }
  .hb-site-favicon { width: 16px; height: 16px; border-radius: 3px; flex-shrink: 0; object-fit: contain; background: rgba(255,255,255,0.08); }
  .hb-site-trigger-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
  .hb-site-trigger-label.hb-site-trigger--placeholder { color: rgba(245,230,211,0.22); }
  .hb-site-trigger-url { font-size: 11px; color: rgba(245,230,211,0.3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
  .hb-site-chevron { flex-shrink: 0; color: rgba(245,230,211,0.35); transition: transform 0.2s ease; }
  .hb-site-trigger--open .hb-site-chevron { transform: rotate(180deg); }

  .hb-site-list {
    position: fixed;
    background: linear-gradient(145deg, rgba(74,25,66,0.98), rgba(45,15,42,0.99));
    border: 1px solid rgba(201,123,138,0.25); border-radius: 14px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5); z-index: 10000;
    overflow: hidden; max-height: 240px; overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: rgba(201,123,138,0.3) transparent;
    animation: hb-slideUp 0.18s ease;
  }
  .hb-site-list::-webkit-scrollbar { width: 4px; }
  .hb-site-list::-webkit-scrollbar-thumb { background: rgba(201,123,138,0.3); border-radius: 4px; }

  .hb-site-option {
    display: flex; align-items: center; gap: 10px; padding: 11px 14px;
    cursor: pointer; transition: background 0.15s;
    border-bottom: 1px solid rgba(232,196,184,0.05);
  }
  .hb-site-option:last-child { border-bottom: none; }
  .hb-site-option:hover { background: rgba(201,123,138,0.1); }
  .hb-site-option--active { background: rgba(201,123,138,0.15); }
  .hb-site-option-info { flex: 1; min-width: 0; }
  .hb-site-option-name { font-size: 13px; color: #f5e6d3; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hb-site-option-url  { font-size: 11px; color: rgba(245,230,211,0.35); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }

  .hb-site-lang { font-size: 10px; padding: 2px 7px; border-radius: 20px; flex-shrink: 0; letter-spacing: 0.05em; text-transform: uppercase; }
  .hb-site-lang--ru    { background: rgba(122,171,142,0.2); color: #7aab8e; border: 1px solid rgba(122,171,142,0.3); }
  .hb-site-lang--en    { background: rgba(212,165,116,0.2); color: #d4a574; border: 1px solid rgba(212,165,116,0.3); }
  .hb-site-lang--multi { background: rgba(201,123,138,0.18); color: #c97b8a; border: 1px solid rgba(201,123,138,0.3); }

  .hb-site-divider {
    padding: 6px 14px 4px; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(245,230,211,0.25); background: rgba(0,0,0,0.15);
    border-bottom: 1px solid rgba(232,196,184,0.06);
  }

  .hb-btn-save-links {
    background: linear-gradient(135deg, #7aab8e, #5d9478) !important;
    opacity: 1; transition: opacity 0.25s ease, transform 0.15s ease;
  }
  .hb-btn-save-links:not(:disabled):hover { opacity: 0.88 !important; transform: translateY(-1px); }
  .hb-btn-save-links:disabled { opacity: 0.35 !important; cursor: not-allowed !important; transform: none !important; }

  .hb-section-label {
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(245,230,211,0.3); margin: 14px 0 10px;
    display: flex; align-items: center; gap: 10px;
  }
  .hb-section-label::after { content: ''; flex: 1; height: 1px; background: rgba(232,196,184,0.08); }
`;

function injectEditLinksCSS() {
  if (document.getElementById('hb-edit-links-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-edit-links-css';
  style.textContent = EDIT_LINKS_CSS;
  document.head.appendChild(style);
}

// ─────────────────────────────────────────────
// HTML
// ─────────────────────────────────────────────

function shellHTML() {
  return `
    <div class="hb-modal-title">${t('modal.editlinks.title')}</div>

    <div id="hb-el-loading" class="hb-el-loader">
      <div class="hb-el-spinner"></div>
      <span>${t('modal.editlinks.loading')}</span>
    </div>

    <div id="hb-el-error" class="hb-el-error" style="display:none">
      <div class="hb-el-error-icon">⚠️</div>
      <div class="hb-el-error-text" id="hb-el-error-text"></div>
    </div>

    <div id="hb-el-body" style="display:none"></div>
  `;
}

function buildSiteDropdownHTML(savedSiteUrl, savedSiteName) {
  return `
    <div class="hb-site-dropdown" id="hb-el-site-dropdown">
      <div class="hb-site-trigger" id="hb-el-site-trigger" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox">
        <div class="hb-site-trigger-left">
          <img class="hb-site-favicon" id="hb-el-site-favicon"
            src="${savedSiteUrl ? `https://www.google.com/s2/favicons?domain=${savedSiteUrl}&sz=32` : ''}"
            alt="" style="display:${savedSiteUrl ? 'block' : 'none'}">
          <span class="hb-site-trigger-label ${savedSiteUrl ? '' : 'hb-site-trigger--placeholder'}" id="hb-el-site-trigger-label">
            ${savedSiteName ?? t('modal.add.field.where_ph')}
          </span>
        </div>
        <span class="hb-site-trigger-url" id="hb-el-site-trigger-url">${savedSiteUrl ?? ''}</span>
        <svg class="hb-site-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <div class="hb-site-list" id="hb-el-site-list" role="listbox" style="display:none">
        <div class="hb-site-divider">${t('modal.add.sites.ru_label')}</div>
        ${STREAMING_SITES.filter(s => s.language === 'ru').map(s => `
          <div class="hb-site-option ${savedSiteUrl === s.url ? 'hb-site-option--active' : ''}"
            role="option" data-url="${s.url}" data-name="${s.name}">
            <img class="hb-site-favicon" src="https://www.google.com/s2/favicons?domain=${s.url}&sz=32" alt="${s.name}">
            <div class="hb-site-option-info">
              <div class="hb-site-option-name">${s.name}</div>
              <div class="hb-site-option-url">${s.url}</div>
            </div>
            <span class="hb-site-lang hb-site-lang--ru">RU</span>
          </div>`).join('')}
        <div class="hb-site-divider">${t('modal.add.sites.intl_label')}</div>
        ${STREAMING_SITES.filter(s => s.language !== 'ru').map(s => `
          <div class="hb-site-option ${savedSiteUrl === s.url ? 'hb-site-option--active' : ''}"
            role="option" data-url="${s.url}" data-name="${s.name}">
            <img class="hb-site-favicon" src="https://www.google.com/s2/favicons?domain=${s.url}&sz=32" alt="${s.name}">
            <div class="hb-site-option-info">
              <div class="hb-site-option-name">${s.name}</div>
              <div class="hb-site-option-url">${s.url}</div>
            </div>
            <span class="hb-site-lang hb-site-lang--${s.language}">${s.language === 'en' ? 'EN' : 'Multi'}</span>
          </div>`).join('')}
      </div>
    </div>
  `;
}

function infoRow(label, value) {
  return `
    <div class="hb-el-info-row">
      <div class="hb-el-info-label">${label}</div>
      <div class="hb-el-info-value">${value}</div>
    </div>
  `;
}

function bodyHTML(drama) {
  const hasCover = Boolean(drama.cover);
  const flag = countryFlag(drama.country);
  const episodesText = drama.episodesTotal ? String(drama.episodesTotal) : '—';
  const savedSite = STREAMING_SITES.find(s => s.url === drama.watchUrl);

  return `
    <div class="hb-el-summary">
      <div class="hb-el-poster">
        <img src="${hasCover ? drama.cover : defaultPosterURI()}" alt="${drama.title.replace(/"/g, '&quot;')}">
      </div>
      <div class="hb-el-summary-info">
        <div class="hb-el-title">${drama.title}</div>
        <div class="hb-el-meta">${drama.year ?? '—'} · ${flag} ${(drama.country ?? '').toUpperCase()}</div>
        <div class="hb-el-badges">
          <span class="badge badge--${drama.status}">${statusLabel(drama.status)}</span>
          ${drama.ongoing ? `<span class="badge badge--ongoing">${t('status.ongoing')}</span>` : ''}
          ${drama.hasSubs ? '<span class="badge badge--ru">RU Озвучка</span>' : ''}
        </div>
      </div>
    </div>

    <div class="hb-section-label">${t('modal.editlinks.section.info')}</div>
    <div class="hb-el-info-grid">
      ${infoRow(t('table.col.genre'), drama.genres?.join(', ') || '—')}
      ${infoRow(t('table.col.voiceover'), drama.voiceover || '—')}
      ${infoRow(t('table.col.rating'), renderStars(drama.rating))}
      ${infoRow(t('table.col.episodes'), episodesText)}
      ${infoRow(t('table.col.seasons'), drama.seasons ?? 1)}
      ${infoRow(t('table.col.added_at'), drama.addedAt ? new Date(drama.addedAt).toLocaleDateString() : '—')}
    </div>

    <div class="hb-section-label">${t('modal.add.field.where')}</div>

    <div class="hb-field">
      <div class="hb-field-label"><span>${t('modal.editlinks.field.site')}</span></div>
      ${buildSiteDropdownHTML(drama.watchUrl ?? null, savedSite?.name ?? drama.watchUrl ?? null)}
    </div>

    <div class="hb-field">
      <div class="hb-field-label"><span>${t('modal.editlinks.field.source_url')}</span></div>
      <input class="hb-field-input" id="hb-el-source-url" type="url"
        placeholder="${t('modal.editlinks.field.source_url_ph')}"
        value="${drama.sourceUrl ? drama.sourceUrl.replace(/"/g, '&quot;') : ''}">
      <div class="hb-el-hint">${t('modal.editlinks.field.source_url_hint')}</div>
    </div>

    <div class="hb-field-error" id="hb-el-global-error" style="text-align:center;margin-bottom:4px"></div>

    <button class="hb-btn-primary hb-btn-save-links" id="hb-el-save-btn" disabled>
      ${t('modal.editlinks.btn.save')}
    </button>
  `;
}

// ─────────────────────────────────────────────
// MOUNT
// ─────────────────────────────────────────────

function mountBody(bodyEl, dramaId, drama) {
  bodyEl.innerHTML = bodyHTML(drama);
  bodyEl.style.display = 'block';

  const initialWatchUrl  = drama.watchUrl ?? '';
  const initialSourceUrl = (drama.sourceUrl ?? '').trim();

  let selectedSiteUrl  = drama.watchUrl ?? null;
  let selectedSiteName = STREAMING_SITES.find(s => s.url === drama.watchUrl)?.name ?? drama.watchUrl ?? null;

  const trigger    = bodyEl.querySelector('#hb-el-site-trigger');
  const list       = bodyEl.querySelector('#hb-el-site-list');
  const trigLabel  = bodyEl.querySelector('#hb-el-site-trigger-label');
  const trigUrl    = bodyEl.querySelector('#hb-el-site-trigger-url');
  const trigFavico = bodyEl.querySelector('#hb-el-site-favicon');
  const sourceInput = bodyEl.querySelector('#hb-el-source-url');
  const saveBtn     = bodyEl.querySelector('#hb-el-save-btn');
  const globalError = bodyEl.querySelector('#hb-el-global-error');

  function syncSaveButton() {
    const currentSource = sourceInput.value.trim();
    const dirty = (selectedSiteUrl ?? '') !== initialWatchUrl || currentSource !== initialSourceUrl;
    saveBtn.disabled = !dirty;
  }

  function openSiteList() {
    const rect = trigger.getBoundingClientRect();
    list.style.left   = rect.left + 'px';
    list.style.width  = rect.width + 'px';
    list.style.top    = (rect.bottom + 6) + 'px';
    list.style.display = 'block';
    trigger.setAttribute('aria-expanded', 'true');
    trigger.classList.add('hb-site-trigger--open');
  }
  function closeSiteList() {
    list.style.display = 'none';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.classList.remove('hb-site-trigger--open');
  }

  bodyEl.closest('#hb-modal-content')?.addEventListener('scroll', () => {
    if (list.style.display !== 'none') closeSiteList();
  });

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    list.style.display === 'none' ? openSiteList() : closeSiteList();
  });
  trigger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); list.style.display === 'none' ? openSiteList() : closeSiteList(); }
    if (e.key === 'Escape') closeSiteList();
  });

  list.querySelectorAll('.hb-site-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const url  = opt.dataset.url;
      const name = opt.dataset.name;

      selectedSiteUrl  = url;
      selectedSiteName = name;

      trigLabel.textContent = name;
      trigLabel.classList.remove('hb-site-trigger--placeholder');
      trigUrl.textContent = url;
      trigFavico.src = `https://www.google.com/s2/favicons?domain=${url}&sz=32`;
      trigFavico.style.display = 'block';

      list.querySelectorAll('.hb-site-option').forEach(o => o.classList.remove('hb-site-option--active'));
      opt.classList.add('hb-site-option--active');
      closeSiteList();
      syncSaveButton();
    });
  });

  document.addEventListener('click', e => {
    if (!bodyEl.querySelector('#hb-el-site-dropdown')?.contains(e.target)) closeSiteList();
  });

  sourceInput.addEventListener('input', syncSaveButton);

  saveBtn.addEventListener('click', async () => {
    if (saveBtn.disabled) return;

    saveBtn.disabled = true;
    saveBtn.textContent = t('modal.editlinks.btn.saving');
    globalError.textContent = '';

    const sourceUrl = sourceInput.value.trim();
    const { error } = await updateDramaLinks(dramaId, {
      watchUrl: selectedSiteUrl ?? '',
      sourceUrl: sourceUrl || null,
    });

    if (error) {
      globalError.textContent = error;
      saveBtn.disabled = false;
      saveBtn.textContent = t('modal.editlinks.btn.save');
      return;
    }

    saveBtn.textContent = t('modal.editlinks.btn.saved');
    setTimeout(() => closeModal(), 800);
  });
}

// ─────────────────────────────────────────────
// OPEN
// ─────────────────────────────────────────────

export async function openEditDramaLinksModal(dramaId) {
  if (document.getElementById('hb-modal-overlay')) return;

  injectEditLinksCSS();
  injectModalCSS();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="hb-modal-overlay">
      <div id="hb-modal-box" class="hb-edit-links-box">
        <button id="hb-modal-close" aria-label="${t('modal.close')}">×</button>
        <div id="hb-modal-content"></div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper.firstElementChild);

  document.getElementById('hb-modal-close').addEventListener('click', closeModal);
  document.getElementById('hb-modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'hb-modal-overlay') closeModal();
  });
  const onKeydown = e => {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);

  const content = document.getElementById('hb-modal-content');
  content.innerHTML = shellHTML();

  let lastLoadedDrama = null;

  const unsub = onLangChange(() => {
    const overlay = document.getElementById('hb-modal-overlay');
    if (!overlay) { unsub(); return; }
    content.innerHTML = shellHTML();
    if (lastLoadedDrama) {
      document.getElementById('hb-el-loading').style.display = 'none';
      mountBody(document.getElementById('hb-el-body'), dramaId, lastLoadedDrama);
    }
  });

  // Отдельный запрос к бэку за полной информацией — намеренно не переиспользует
  // данные уже отрендеренной строки/карточки.
  const { data, error } = await getDrama(dramaId);

  // Модалка могла быть закрыта, пока шёл запрос
  if (!document.getElementById('hb-modal-overlay')) return;

  const loadingEl = document.getElementById('hb-el-loading');
  if (loadingEl) loadingEl.style.display = 'none';

  if (!data) {
    const errorEl = document.getElementById('hb-el-error');
    const errorTextEl = document.getElementById('hb-el-error-text');
    if (errorTextEl) errorTextEl.textContent = error || t('modal.editlinks.error_load');
    if (errorEl) errorEl.style.display = 'flex';
    return;
  }

  lastLoadedDrama = data;
  mountBody(document.getElementById('hb-el-body'), dramaId, data);
}
