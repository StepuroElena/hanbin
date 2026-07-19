/**
 * HANBIN — Tooltip Utility
 *
 * Единый JS-тултип с делегированием событий на document. Рендерится ОДНИМ
 * элементом в position:fixed, добавленным напрямую в document.body — поэтому
 * не обрезается никакими overflow:hidden контейнерами (карточки дорам, ячейки
 * таблицы) и сам подстраивает сторону, если не помещается у края экрана.
 *
 * Раньше тултип был чистым CSS (::after у самого триггера) — это ломалось
 * в двух местах: в карточном виде тултип обрезался родительским .card-cover
 * (overflow:hidden, нужен для обрезки постера), а в табличном виде тултип
 * последней колонки вылезал за правый край окна без автоскролла.
 *
 * Использование в разметке не меняется:
 *   <button data-tooltip="Текст тултипа">...</button>
 *   data-tooltip-pos="left" — предпочтительно показывать тултип левее триггера
 *   (по умолчанию — тултип растёт вправо от левого края триггера)
 *
 * initTooltips() вызывается один раз при старте приложения (app.js) —
 * дальше работает само для любых [data-tooltip] элементов, включая те,
 * что появятся позже при перерисовке таблицы/карточек.
 */

export const tooltipCSS = `
.hb-tooltip {
  position: fixed;
  z-index: 100000;
  background: rgba(30, 10, 28, 0.95);
  color: var(--color-text);
  font-size: 11px;
  font-family: var(--font-body);
  letter-spacing: 0.03em;
  white-space: nowrap;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid rgba(201,123,138,0.25);
  pointer-events: none;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.08s ease, transform 0.08s ease;
  left: -9999px;
  top: -9999px;
}
.hb-tooltip--visible {
  opacity: 1;
  transform: translateY(0);
}
`;

let tooltipEl = null;
let currentTarget = null;

function getTooltipEl() {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'hb-tooltip';
    document.body.appendChild(tooltipEl);
  }
  return tooltipEl;
}

function positionTooltip(target) {
  const el = getTooltipEl();
  const rect = target.getBoundingClientRect();
  const margin = 8;
  const elRect = el.getBoundingClientRect();
  const width = elRect.width;
  const height = elRect.height;

  // Вертикально — под элементом, если хватает места, иначе над ним
  let top = rect.bottom + margin;
  if (top + height > window.innerHeight) {
    top = rect.top - height - margin;
  }
  top = Math.max(margin, top);

  // Горизонтально — предпочтение по data-tooltip-pos, но всегда клампим в границы окна,
  // чтобы тултип никогда не вылезал за край экрана независимо от позиции триггера.
  const preferLeft = target.dataset.tooltipPos === 'left';
  let left = preferLeft ? (rect.right - width) : rect.left;
  left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));

  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

function showTooltip(target) {
  const text = target.getAttribute('data-tooltip');
  if (!text) return;
  const el = getTooltipEl();
  el.textContent = text;
  el.classList.remove('hb-tooltip--visible');
  // Позиционируем на следующем кадре — после того как textContent уже выставлен,
  // чтобы getBoundingClientRect() вернул размеры с учётом реального текста.
  requestAnimationFrame(() => {
    if (currentTarget !== target) return; // курсор уже успел уйти
    positionTooltip(target);
    el.classList.add('hb-tooltip--visible');
  });
  currentTarget = target;
}

function hideTooltip() {
  currentTarget = null;
  if (!tooltipEl) return;
  tooltipEl.classList.remove('hb-tooltip--visible');
}

export function initTooltips() {
  if (initTooltips._done) return;
  initTooltips._done = true;

  // mouseover/mouseout (а не mouseenter/mouseleave) — те не всплывают,
  // а нам нужно делегирование на document, т.к. элементы с data-tooltip
  // создаются и удаляются динамически при каждой перерисовке.
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (!target || target === currentTarget) return;
    showTooltip(target);
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (!target || target !== currentTarget) return;
    // relatedTarget внутри того же триггера (например, дочерний svg) — не считаем уходом
    if (target.contains(e.relatedTarget)) return;
    hideTooltip();
  });

  // Скролл/клик надёжно прячут тултип, чтобы он не "завис" в воздухе
  // после перерисовки таблицы/карточек под курсором.
  document.addEventListener('scroll', hideTooltip, true);
  document.addEventListener('click', hideTooltip, true);
}
