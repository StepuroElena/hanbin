/**
 * HANBIN — Global CSS
 * Базовые стили, анимации, утилиты.
 * Цвета берутся из CSS-переменных, которые инжектирует theme.js
 */

export const globalCSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-body);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Atmospheric background layers */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: var(--bg-atmosphere);
    pointer-events: none;
    z-index: 0;
  }

  /* Grain texture overlay */
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
    opacity: 0.4;
  }

  #app {
    position: relative;
    z-index: 1;
  }

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 28px 60px;
  }

  /* ── Animations ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes shimmer {
    to { background-position: 200% center; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* ── Page transition ── */
  .page-enter {
    animation: fadeUp 0.45s ease both;
  }

  /* ── Utilities ── */
  .text-display {
    font-family: var(--font-display);
  }

  .text-muted { color: var(--color-text-muted); }
  .text-accent { color: var(--color-rose); }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 20px;
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 500;
    backdrop-filter: blur(8px);
    border: 1px solid transparent;
    white-space: nowrap;
  }

  /* badge--* colours are defined in app.js componentCSS (single source of truth) */

  .section-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 400;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-title::before {
    content: '';
    display: block;
    width: 3px;
    height: 22px;
    background: var(--color-rose);
    border-radius: 2px;
    flex-shrink: 0;
  }

  .glass-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    transition: var(--transition-normal);
  }

  .glass-card:hover {
    border-color: var(--color-border-hover);
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(201,123,138,0.3); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(201,123,138,0.5); }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .hide-tablet { display: none !important; }
  }

  @media (max-width: 640px) {
    .container { padding: 0 16px 40px; }
    .hide-mobile { display: none !important; }
  }
`;
