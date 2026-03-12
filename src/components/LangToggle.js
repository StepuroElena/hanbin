/**
 * HANBIN — Language Toggle Component
 * Иконка переключения RU ↔ EN в хедере.
 *
 * Использование:
 *   import { renderLangToggle } from './LangToggle.js';
 *   renderLangToggle(containerEl);
 */

import { getLang, setLang, onLangChange, t } from '../i18n/index.js';

/**
 * Монтирует кнопку переключения языка в container.
 * Возвращает функцию для размонтирования (unsubscribe).
 */
export function renderLangToggle(container) {
  function build() {
    const lang = getLang();
    const next = lang === 'ru' ? 'en' : 'ru';
    container.innerHTML = `
      <button
        class="lang-toggle"
        data-next="${next}"
        data-tooltip="${t('header.tooltip.lang')}"
        aria-label="${t('header.tooltip.lang')}"
      >
        <span class="lang-toggle__flag">${lang === 'ru' ? '🇷🇺' : '🇬🇧'}</span>
        <span class="lang-toggle__code">${lang.toUpperCase()}</span>
      </button>
    `;

    container.querySelector('.lang-toggle').addEventListener('click', () => {
      setLang(next);
    });
  }

  build();

  // Rebuild button when language changes (flag + code flip)
  const unsub = onLangChange(() => build());
  return unsub;
}

/** CSS для lang-toggle — вставляется через injectLangToggleCSS() */
export const langToggleCSS = `
/* ── Lang Toggle ── */
.lang-toggle {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 30px;
  border: 1px solid var(--color-border);
  background: rgba(255,255,255,0.04);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;
  position: relative;
}
.lang-toggle:hover {
  border-color: rgba(201,123,138,0.45);
  background: rgba(201,123,138,0.1);
  color: var(--color-rose);
}
.lang-toggle__flag {
  font-size: 15px;
  line-height: 1;
}
.lang-toggle__code {
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
  transition: var(--transition-fast);
}
.lang-toggle:hover .lang-toggle__code {
  color: var(--color-rose);
}

/* Mobile: hide the code label, keep only flag */
@media (max-width: 480px) {
  .lang-toggle__code { display: none; }
  .lang-toggle { padding: 7px 9px; }
}
`;
