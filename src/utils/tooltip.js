/**
 * HANBIN — Tooltip Utility
 * Переиспользуемый кастомный тултип через data-атрибут.
 *
 * Использование:
 *   import { tooltipCSS } from '../utils/tooltip.js';
 *   // добавь tooltipCSS в стили
 *
 *   // в HTML:
 *   <button data-tooltip="Текст тултипа">...</button>
 *
 * Позиция по умолчанию — снизу справа.
 * Для позиции снизу слева добавь data-tooltip-pos="left".
 */

export const tooltipCSS = `
[data-tooltip] {
  position: relative;
}
[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
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
  z-index: 999;
}
[data-tooltip][data-tooltip-pos="left"]::after {
  right: auto;
  left: 0;
}
[data-tooltip]:hover::after {
  opacity: 1;
  transform: translateY(0);
}
`;
