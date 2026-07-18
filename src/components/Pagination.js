/**
 * HANBIN — Pagination Component
 * Строка номеров страниц + дропдаун размера страницы (10/20/50).
 * Общая для карточного и табличного вида — обе просто рендерят уже нарезанный кусок данных,
 * сама нарезка и подсчёт страниц происходят в Home.js.
 */

export const PAGE_SIZE_OPTIONS = [10, 20, 50];

/** Строит список страниц для отображения: все, если их немного, иначе с многоточиями вокруг текущей. */
function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const keep = new Set([1, 2, 3, total, current]);
  if (current > 1) keep.add(current - 1);
  if (current < total) keep.add(current + 1);

  const sorted = [...keep].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('…');
    result.push(p);
    prev = p;
  }
  return result;
}

/**
 * @param {HTMLElement} container
 * @param {{ total: number, pageSize: number, currentPage: number,
 *           onPageChange: (page:number) => void, onPageSizeChange: (size:number) => void }} opts
 */
export function renderPagination(container, { total, pageSize, currentPage, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, currentPage), totalPages);

  if (totalPages <= 1 && total <= PAGE_SIZE_OPTIONS[0]) {
    // Нечего листать и дорам меньше самого маленького варианта размера страницы — панель не нужна вовсе.
    container.innerHTML = '';
    return;
  }

  const pages = buildPageList(current, totalPages);

  container.innerHTML = `
    <div class="pagination-bar">
      <div class="pagination-pages">
        <button class="pagination-arrow" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''} aria-label="Назад">‹</button>
        ${pages.map(p => p === '…'
          ? `<span class="pagination-ellipsis">…</span>`
          : `<button class="pagination-page ${p === current ? 'pagination-page--active' : ''}" data-page="${p}">${p}</button>`
        ).join('')}
        <button class="pagination-arrow" data-page="${current + 1}" ${current >= totalPages ? 'disabled' : ''} aria-label="Вперёд">›</button>
      </div>
      <select class="pagination-size-select" id="pagination-size-select">
        ${PAGE_SIZE_OPTIONS.map(n => `<option value="${n}" ${n === pageSize ? 'selected' : ''}>${n}</option>`).join('')}
      </select>
    </div>
  `;

  container.querySelectorAll('.pagination-page, .pagination-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = Number(btn.dataset.page);
      if (!page || page < 1 || page > totalPages || page === current) return;
      onPageChange(page);
    });
  });

  container.querySelector('#pagination-size-select')?.addEventListener('change', (e) => {
    onPageSizeChange(Number(e.target.value));
  });
}
