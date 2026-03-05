/**
 * HANBIN — Design Tokens
 * Все цвета, типографика, отступы и анимации хранятся здесь.
 * Меняй этот файл чтобы изменить весь визуал приложения.
 */

export const colors = {
  // Core palette
  deepPlum:    '#2d0f2a',
  plum:        '#4a1942',
  rose:        '#c97b8a',
  neonRose:    '#ff6b8a',
  blush:       '#e8c4b8',
  champagne:   '#f5e6d3',
  warmGold:    '#d4a574',
  jade:        '#7aab8e',
  ink:         '#1a0a18',
  mist:        '#f9f0f5',

  // Semantic
  bg:          '#2d0f2a',
  surface:     'rgba(255,255,255,0.07)',
  glass:       'rgba(255,255,255,0.06)',
  border:      'rgba(232,196,184,0.1)',
  borderHover: 'rgba(232,196,184,0.25)',
  text:        '#f5e6d3',
  textMuted:   'rgba(245,230,211,0.4)',
  textFaint:   'rgba(245,230,211,0.25)',
  accent:      '#c97b8a',
  accentGlow:  'rgba(201,123,138,0.2)',

  // Status badges
  statusWatching:  { bg: 'rgba(122,171,142,0.35)',  text: '#7aab8e',  border: 'rgba(122,171,142,0.4)' },
  statusCompleted: { bg: 'rgba(212,165,116,0.3)',   text: '#d4a574',  border: 'rgba(212,165,116,0.4)' },
  statusPlan:      { bg: 'rgba(232,196,184,0.12)',  text: '#e8c4b8',  border: 'rgba(232,196,184,0.3)' },
  statusDropped:   { bg: 'rgba(255,107,138,0.2)',   text: '#ff6b8a',  border: 'rgba(255,107,138,0.4)' },
  statusOngoing:   { bg: 'rgba(255,107,138,0.25)',  text: '#ff6b8a',  border: 'rgba(255,107,138,0.35)' },
  statusRu:        { bg: 'rgba(74,25,66,0.6)',      text: '#e8c4b8',  border: 'rgba(232,196,184,0.25)' },

  // Country bars
  countryKorea: 'linear-gradient(90deg, #c97b8a, #ff6b8a)',
  countryChina: 'linear-gradient(90deg, #7aab8e, #a8d8be)',
  countryJapan: 'linear-gradient(90deg, #d4a574, #e8c87a)',
};

export const typography = {
  fontDisplay: "'Cormorant Garamond', serif",
  fontBody:    "'DM Sans', sans-serif",
  googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap',

  sizes: {
    xs:   '10px',
    sm:   '11px',
    base: '13px',
    md:   '14px',
    lg:   '16px',
    xl:   '22px',
    '2xl':'32px',
    hero: '58px',
  },
  weights: {
    light:   300,
    regular: 400,
    medium:  500,
  },
  letterSpacing: {
    tight:  '-0.02em',
    normal: '0',
    wide:   '0.05em',
    wider:  '0.1em',
    widest: '0.2em',
  },
};

export const spacing = {
  xs:  '4px',
  sm:  '8px',
  md:  '16px',
  lg:  '24px',
  xl:  '32px',
  '2xl': '44px',
  '3xl': '60px',
};

export const radii = {
  sm:   '8px',
  md:   '12px',
  lg:   '16px',
  xl:   '20px',
  '2xl':'30px',
  full: '9999px',
};

export const shadows = {
  card:  '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(201,123,138,0.1)',
  glow:  '0 0 8px #ff6b8a',
  soft:  '0 4px 20px rgba(0,0,0,0.2)',
};

export const transitions = {
  fast:   'all 0.2s ease',
  normal: 'all 0.3s ease',
  slow:   'all 0.5s ease',
};

export const gradients = {
  bgAtmosphere: `
    radial-gradient(ellipse 80% 60% at 10% 0%, rgba(201,123,138,0.18) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 90% 100%, rgba(122,171,142,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(74,25,66,0.5) 0%, transparent 70%)
  `,
  quoteCard:  'linear-gradient(135deg, rgba(74,25,66,0.6), rgba(45,15,42,0.8))',
  progressBar: 'linear-gradient(90deg, #c97b8a, #ff6b8a)',
  shimmer:    'linear-gradient(90deg, #f5e6d3 0%, #d4a574 40%, #f5e6d3 100%)',
};

// Собирает CSS-переменные из токенов — вставляется в :root
export function buildCSSVariables() {
  return `
    --color-bg: ${colors.bg};
    --color-plum: ${colors.plum};
    --color-rose: ${colors.rose};
    --color-neon-rose: ${colors.neonRose};
    --color-blush: ${colors.blush};
    --color-champagne: ${colors.champagne};
    --color-gold: ${colors.warmGold};
    --color-jade: ${colors.jade};
    --color-surface: ${colors.surface};
    --color-glass: ${colors.glass};
    --color-border: ${colors.border};
    --color-border-hover: ${colors.borderHover};
    --color-text: ${colors.text};
    --color-text-muted: ${colors.textMuted};
    --color-accent: ${colors.accent};
    --color-accent-glow: ${colors.accentGlow};
    --font-display: ${typography.fontDisplay};
    --font-body: ${typography.fontBody};
    --gradient-progress: ${gradients.progressBar};
    --gradient-shimmer: ${gradients.shimmer};
    --shadow-card: ${shadows.card};
    --transition-fast: ${transitions.fast};
    --transition-normal: ${transitions.normal};
  `;
}
