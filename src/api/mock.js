/**
 * HANBIN — Mock API
 * Все запросы к бэку проходят через этот файл.
 * Когда бэк будет готов — заменяй mock-функции на реальные fetch/axios вызовы.
 *
 * Паттерн: каждая функция возвращает Promise, имитируя реальный API.
 * Задержка configurable через MOCK_DELAY.
 */

const MOCK_DELAY = 300; // ms, имитация latency

const delay = (ms = MOCK_DELAY) => new Promise(res => setTimeout(res, ms));

// ─────────────────────────────────────────────
// DATA FIXTURES
// ─────────────────────────────────────────────

const MOCK_USER = {
  id: 'user_001',
  name: 'Elena',
  avatar: '소',
  stats: {
    dramasWatched: 73,
    totalEpisodes: 1840,
    totalHours: 2214,
    milestone: 'Drama Queen',
    milestoneMessage: "You've watched 73 dramas. You are the main character.",
  },
  badges: [
    { id: 'drama_queen',    icon: '👑', name: 'Drama Queen',      unlocked: true },
    { id: 'kdrama_fan',     icon: '🌸', name: 'K-Drama Fan',      unlocked: true },
    { id: 'cdrama_exp',     icon: '🏮', name: 'C-Drama Explorer', unlocked: true },
    { id: 'club_2000',      icon: '⏱️', name: '2000h Club',       unlocked: true },
    { id: 'night_owl',      icon: '🌙', name: 'Night Owl',        unlocked: true },
    { id: 'club_100',       icon: '🔒', name: '100 Dramas',       unlocked: false },
  ],
  countries: [
    { code: 'kr', flag: '🇰🇷', name: 'Korea', count: 50, percent: 68, colorClass: 'fill-korea' },
    { code: 'cn', flag: '🇨🇳', name: 'China', count: 20, percent: 27, colorClass: 'fill-china' },
    { code: 'jp', flag: '🇯🇵', name: 'Japan', count: 3,  percent: 4,  colorClass: 'fill-japan' },
  ],
};

const MOCK_DRAMAS = [
  {
    id: 'drama_001',
    title: 'My Demon',
    year: 2023,
    country: 'kr',
    genres: ['Romance', 'Fantasy'],
    status: 'watching',
    ongoing: true,
    rating: 4,
    episodesWatched: 10,
    episodesTotal: 16,
    hasSubs: false,
    cover: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80',
    watchUrl: 'https://example.com/my-demon',
  },
  {
    id: 'drama_002',
    title: 'The Story of Hua Zhi',
    year: 2024,
    country: 'cn',
    genres: ['Historical', 'Romance'],
    status: 'watching',
    ongoing: false,
    rating: 5,
    episodesWatched: 12,
    episodesTotal: 40,
    hasSubs: true,
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
    watchUrl: 'https://example.com/hua-zhi',
  },
  {
    id: 'drama_003',
    title: 'Lovely Runner',
    year: 2024,
    country: 'kr',
    genres: ['Romance', 'Time Travel'],
    status: 'watching',
    ongoing: false,
    rating: 5,
    episodesWatched: 14,
    episodesTotal: 16,
    hasSubs: false,
    cover: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400&q=80',
    watchUrl: 'https://example.com/lovely-runner',
  },
  {
    id: 'drama_004',
    title: 'Marry My Husband',
    year: 2024,
    country: 'kr',
    genres: ['Thriller', 'Romance'],
    status: 'watching',
    ongoing: true,
    rating: 4,
    episodesWatched: 7,
    episodesTotal: 16,
    hasSubs: true,
    cover: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80',
    watchUrl: 'https://example.com/marry-my-husband',
  },
  {
    id: 'drama_005',
    title: 'Queen of Tears',
    year: 2024,
    country: 'kr',
    genres: ['Romance', 'Drama'],
    status: 'completed',
    ongoing: false,
    rating: 5,
    episodesWatched: 16,
    episodesTotal: 16,
    hasSubs: true,
    cover: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=100&q=80',
    watchUrl: 'https://example.com/queen-of-tears',
  },
  {
    id: 'drama_006',
    title: 'Crash Landing on You',
    year: 2019,
    country: 'kr',
    genres: ['Romance', 'Comedy'],
    status: 'completed',
    ongoing: false,
    rating: 5,
    episodesWatched: 16,
    episodesTotal: 16,
    hasSubs: false,
    cover: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&q=80',
    watchUrl: 'https://example.com/cloy',
  },
  {
    id: 'drama_007',
    title: 'Love Between Fairy and Devil',
    year: 2022,
    country: 'cn',
    genres: ['Fantasy', 'Romance'],
    status: 'completed',
    ongoing: false,
    rating: 4,
    episodesWatched: 36,
    episodesTotal: 36,
    hasSubs: false,
    cover: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=100&q=80',
    watchUrl: 'https://example.com/fairy-devil',
  },
  {
    id: 'drama_008',
    title: 'Twenty-Five Twenty-One',
    year: 2022,
    country: 'kr',
    genres: ['Romance', 'Coming-of-age'],
    status: 'plan',
    ongoing: false,
    rating: null,
    episodesWatched: 0,
    episodesTotal: 16,
    hasSubs: false,
    cover: 'https://images.unsplash.com/photo-1519895709498-ce3c5fa1a100?w=100&q=80',
    watchUrl: 'https://example.com/2521',
  },
  {
    id: 'drama_009',
    title: 'Nirvana in Fire',
    year: 2015,
    country: 'cn',
    genres: ['Historical', 'Political'],
    status: 'completed',
    ongoing: false,
    rating: 5,
    episodesWatched: 54,
    episodesTotal: 54,
    hasSubs: false,
    cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&q=80',
    watchUrl: 'https://example.com/nirvana-in-fire',
  },
];

const MOCK_ACTIVITY = [
  { id: 'act_001', dramaId: 'drama_005', action: 'completed', timestamp: new Date(Date.now() - 2 * 3600000) },
  { id: 'act_002', dramaId: 'drama_006', action: 'rated',     timestamp: new Date(Date.now() - 26 * 3600000) },
  { id: 'act_003', dramaId: 'drama_007', action: 'completed', timestamp: new Date(Date.now() - 48 * 3600000) },
  { id: 'act_004', dramaId: 'drama_008', action: 'plan',      timestamp: new Date(Date.now() - 72 * 3600000) },
  { id: 'act_005', dramaId: 'drama_009', action: 'completed', timestamp: new Date(Date.now() - 96 * 3600000) },
];

// ─────────────────────────────────────────────
// API METHODS
// TODO: заменить тело каждой функции на реальный fetch когда будет готов бэк
// ─────────────────────────────────────────────

/**
 * Получить профиль и статистику пользователя
 * TODO: GET /api/user/me
 */
export async function getUser() {
  await delay();
  return { data: MOCK_USER, error: null };
}

/**
 * Получить список всех дорам
 * @param {Object} filters — { status, country, genre, search }
 * TODO: GET /api/dramas?status=watching&country=kr
 */
export async function getDramas(filters = {}) {
  await delay();
  let result = [...MOCK_DRAMAS];

  if (filters.status && filters.status !== 'all') {
    result = result.filter(d => d.status === filters.status);
  }
  if (filters.country) {
    result = result.filter(d => d.country === filters.country);
  }
  if (filters.genre) {
    result = result.filter(d => d.genres.includes(filters.genre));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(d => d.title.toLowerCase().includes(q));
  }

  return { data: result, error: null };
}

/**
 * Получить дорамы со статусом "watching"
 * TODO: GET /api/dramas?status=watching
 */
export async function getCurrentlyWatching() {
  await delay();
  const watching = MOCK_DRAMAS.filter(d => d.status === 'watching');
  return { data: watching, error: null };
}

/**
 * Получить ленту активности
 * TODO: GET /api/activity?limit=10
 */
export async function getActivity(limit = 5) {
  await delay();
  const enriched = MOCK_ACTIVITY.slice(0, limit).map(act => ({
    ...act,
    drama: MOCK_DRAMAS.find(d => d.id === act.dramaId),
  }));
  return { data: enriched, error: null };
}

/**
 * Добавить дораму в список
 * @param {Object} drama
 * TODO: POST /api/dramas
 */
export async function addDrama(drama) {
  await delay();
  console.log('[MOCK] addDrama:', drama);
  return { data: { ...drama, id: `drama_${Date.now()}` }, error: null };
}

/**
 * Обновить статус дорамы
 * @param {string} id
 * @param {string} status — watching | completed | plan | dropped
 * TODO: PATCH /api/dramas/:id
 */
export async function updateDramaStatus(id, status) {
  await delay();
  console.log('[MOCK] updateDramaStatus:', id, '->', status);
  return { data: { id, status }, error: null };
}

/**
 * Поставить оценку дораме
 * @param {string} id
 * @param {number} rating — 1-5
 * TODO: PATCH /api/dramas/:id/rating
 */
export async function rateDrama(id, rating) {
  await delay();
  console.log('[MOCK] rateDrama:', id, '->', rating);
  return { data: { id, rating }, error: null };
}

/**
 * Удалить дораму из списка
 * @param {string} id
 * TODO: DELETE /api/dramas/:id
 */
export async function deleteDrama(id) {
  await delay();
  console.log('[MOCK] deleteDrama:', id);
  return { data: { id, deleted: true }, error: null };
}

/**
 * Поиск дорам
 * @param {string} query
 * TODO: GET /api/dramas/search?q=query
 */
export async function searchDramas(query) {
  await delay(150);
  const q = query.toLowerCase();
  const result = MOCK_DRAMAS.filter(d => d.title.toLowerCase().includes(q));
  return { data: result, error: null };
}

/**
 * Переключить вид (card/table) — сохраняется в localStorage
 * TODO: PATCH /api/user/preferences
 */
export async function setViewMode(mode) {
  await delay(50);
  localStorage.setItem('hanbin_view_mode', mode);
  console.log('[MOCK] setViewMode:', mode);
  return { data: { mode }, error: null };
}

export async function getViewMode() {
  return { data: { mode: localStorage.getItem('hanbin_view_mode') || 'card' }, error: null };
}
