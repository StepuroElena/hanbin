/**
 * HANBIN — Mock API
 * Все запросы к бэку проходят через этот файл.
 * Когда бэк будет готов — заменяй mock-функции на реальные fetch/axios вызовы.
 *
 * Паттерн: каждая функция возвращает Promise, имитируя реальный API.
 * Задержка configurable через MOCK_DELAY.
 */

import { API_BASE, authGet, authPost, authPatch, authDelete } from './client.js';

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
    dramasPlanned: 12,
    totalHours: 2214,
    milestone: 'Drama Queen',
  },
  badges: [
    { id: 'drama_queen',    icon: '👑', name: 'Королева дорам',      unlocked: true },
    { id: 'kdrama_fan',     icon: '🌸', name: 'K-Дорама фанат',      unlocked: true },
    { id: 'cdrama_exp',     icon: '🏮', name: 'C-Дорама исследователь', unlocked: true },
    { id: 'club_2000',      icon: '⏱️', name: 'Клуб 2000ч',       unlocked: true },
    { id: 'night_owl',      icon: '🌙', name: 'Ночная сова',        unlocked: true },
    { id: 'club_100',       icon: '🔒', name: '100 дорам',       unlocked: false },
  ],
  countries: [
    { code: 'kr', flag: '🇰🇷', name: 'Корея', count: 50, percent: 68, colorClass: 'fill-korea' },
    { code: 'cn', flag: '🇨🇳', name: 'Китай', count: 20, percent: 27, colorClass: 'fill-china' },
    { code: 'jp', flag: '🇯🇵', name: 'Япония', count: 3,  percent: 4,  colorClass: 'fill-japan' },
  ],
};

// Честный "пустой" профиль — показываем, если пользователь залогинен,
// но его данные почему-то не загрузились. Никаких выдуманных цифр.
const EMPTY_USER = {
  id: null,
  name: '',
  avatar: '',
  stats: {
    dramasWatched: 0,
    totalEpisodes: 0,
    dramasPlanned: 0,
    totalHours: 0,
    milestone: '',
  },
  badges: [],
  countries: [],
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
    episodeDurationMin: 60,
    seasons: 1,
    hasSubs: false,
    cover: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80',
    watchUrl: 'https://example.com/my-demon',
    addedAt: new Date(Date.now() - 12 * 24 * 3600000),
    lastWatchedAt: new Date(Date.now() - 1 * 3600000),
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
    episodeDurationMin: 45,
    seasons: 1,
    hasSubs: true,
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
    watchUrl: 'https://example.com/hua-zhi',
    addedAt: new Date(Date.now() - 8 * 24 * 3600000),
    lastWatchedAt: new Date(Date.now() - 6 * 3600000),
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
    episodeDurationMin: 70,
    seasons: 1,
    hasSubs: false,
    cover: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400&q=80',
    watchUrl: 'https://example.com/lovely-runner',
    addedAt: new Date(Date.now() - 5 * 24 * 3600000),
    lastWatchedAt: new Date(Date.now() - 30 * 60000),
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
    episodeDurationMin: 65,
    seasons: 1,
    hasSubs: true,
    cover: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80',
    watchUrl: 'https://example.com/marry-my-husband',
    addedAt: new Date(Date.now() - 20 * 24 * 3600000),
    lastWatchedAt: new Date(Date.now() - 2 * 24 * 3600000),
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
    episodeDurationMin: 75,
    seasons: 1,
    hasSubs: true,
    cover: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=100&q=80',
    watchUrl: 'https://example.com/queen-of-tears',
    addedAt: new Date(Date.now() - 30 * 24 * 3600000),
    lastWatchedAt: new Date(Date.now() - 2 * 3600000),
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
    episodeDurationMin: 80,
    seasons: 1,
    hasSubs: false,
    cover: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&q=80',
    watchUrl: 'https://example.com/cloy',
    addedAt: new Date(Date.now() - 90 * 24 * 3600000),
    lastWatchedAt: new Date(Date.now() - 26 * 3600000),
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
    episodeDurationMin: 45,
    seasons: 1,
    hasSubs: false,
    cover: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=100&q=80',
    watchUrl: 'https://example.com/fairy-devil',
    addedAt: new Date(Date.now() - 60 * 24 * 3600000),
    lastWatchedAt: new Date(Date.now() - 48 * 3600000),
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
    episodeDurationMin: 60,
    seasons: 2,
    hasSubs: false,
    cover: 'https://images.unsplash.com/photo-1519895709498-ce3c5fa1a100?w=100&q=80',
    watchUrl: 'https://example.com/2521',
    addedAt: new Date(Date.now() - 3 * 24 * 3600000),
    lastWatchedAt: null,
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
    episodeDurationMin: 45,
    seasons: 2,
    hasSubs: false,
    cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&q=80',
    watchUrl: 'https://example.com/nirvana-in-fire',
    addedAt: new Date(Date.now() - 120 * 24 * 3600000),
    lastWatchedAt: new Date(Date.now() - 96 * 3600000),
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
// ─────────────────────────────────────────────

export async function getUser() {
  const { data, error } = await getMe();
  if (data) return { data, error: null };

  // Залогинен, но getMe() не смог загрузить данные (сбой/холодный старт бэка) —
  // НЕ подменяем реального пользователя фейковыми демо-данными, отдаём честный пустой профиль.
  if (localStorage.getItem('hanbin_token')) {
    return { data: EMPTY_USER, error };
  }

  await delay();
  return { data: MOCK_USER, error: null };
}

// Считаем по-старому из мок-данных — только для гостя, когда бэка ещё нет.
function computeMockStats() {
  const dramasPlanned = MOCK_DRAMAS.filter(d => d.status === 'plan').length;
  return { ...MOCK_USER.stats, dramasPlanned };
}

/**
 * Статистика для карточек на главной — считается на бэке одним запросом.
 * GET /api/v1/dramas/stats — требует авторизации.
 *
 * @returns {Promise<{ data: {
 *   dramasWatched: number, dramasWatching: number, dramasPlanned: number,
 *   dramasDropped: number, totalEpisodes: number, totalHours: number
 * }, error: string|null }>}
 */
export async function getStats() {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const { data, error } = await authGet('/dramas/stats');
    if (data) {
      return {
        data: {
          dramasWatched:  data.dramas_watched,
          dramasWatching: data.dramas_watching,
          dramasPlanned:  data.dramas_planned,
          dramasDropped:  data.dramas_dropped,
          totalEpisodes:  data.total_episodes,
          totalHours:     data.total_hours,
        },
        error: null,
      };
    }
    console.warn('[API] getStats failed, falling back to empty stats:', error);
    return { data: { dramasWatched: 0, dramasWatching: 0, dramasPlanned: 0, dramasDropped: 0, totalEpisodes: 0, totalHours: 0 }, error };
  }

  await delay();
  return { data: computeMockStats(), error: null };
}

function adaptDramaFromApi(d) {
  const ongoing = d.release_tag === 'ongoing';
  const hasSubs = d.translation_tag === 'translated';
  const STATUS_MAP = {
    planned:   'plan',
    watching:  'watching',
    completed: 'completed',
    dropped:   'dropped',
  };
  const status = STATUS_MAP[d.watch_status] ?? d.watch_status;
  const rating = d.rating != null ? Math.round(d.rating / 2) || 1 : null;

  return {
    id:              String(d.id),
    title:           d.title,
    year:            d.release_year || null,
    genres:          d.genre ? [d.genre] : [],
    country:         (d.country || '').toLowerCase().slice(0, 2),
    status,
    episodesWatched: d.current_episode ?? 0,
    episodesTotal:   d.total_episodes  ?? 0,
    episodeDurationMin: d.episode_duration_min ?? null,
    watchUrl:        d.watch_url || null,
    sourceUrl:       d.source_url || null,
    voiceover:       d.voiceover || null,
    rating,
    ongoing,
    hasSubs,
    isArchived:      Boolean(d.is_archived),
    cover:           d.poster_url ? `${API_BASE}/dramas/poster-proxy?url=${encodeURIComponent(d.poster_url)}` : null,
    seasons:         d.seasons ?? null,
    addedAt:         d.created_at ? new Date(d.created_at) : null,
    lastWatchedAt:   d.updated_at ? new Date(d.updated_at) : null,
  };
}

export async function getDramas(filters = {}) {
  const limit = filters.limit ?? 50;
  const { data: user } = await getMe();
  if (user && Array.isArray(user._rawDramas)) {
    let result = user._rawDramas.map(adaptDramaFromApi).filter(d => !d.isArchived);

    if (filters.status && filters.status !== 'all') {
      result = result.filter(d => d.status === filters.status);
    }
    if (filters.country) {
      result = result.filter(d => d.country === filters.country);
    }
    if (filters.genre) {
      result = result.filter(d => d.genres.some(g => g.toLowerCase().includes(filters.genre.toLowerCase())));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(d => d.title.toLowerCase().includes(q));
    }

    return { data: result.slice(0, limit), error: null };
  }

  // Залогинен, но getMe() не вернул данные — не подсовываем выдуманные дорамы, отдаём пустой список.
  if (localStorage.getItem('hanbin_token')) {
    return { data: [], error: null };
  }

  await delay();
  const _archived = _getArchivedIds();
  let result = MOCK_DRAMAS.filter(d => !_archived.includes(d.id));

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

export async function getCurrentlyWatching() {
  return getDramas({ status: 'watching' });
}

export async function getActivity(limit = 5) {
  await delay();
  const enriched = MOCK_ACTIVITY.slice(0, limit).map(act => ({
    ...act,
    drama: MOCK_DRAMAS.find(d => d.id === act.dramaId),
  }));
  return { data: enriched, error: null };
}

export async function addDrama(drama) {
  const token = localStorage.getItem('hanbin_token');

  if (!token) {
    await delay();
    console.log('[MOCK] addDrama (not logged in, using mock):', drama);
    return { data: { ...drama, id: `drama_${Date.now()}` }, error: null };
  }

  const payload = {
    title:           drama.title,
    watch_url:       drama.watchUrl ?? '',
    source_url:      drama.sourceUrl ?? '',
    release_year:    drama.year ?? new Date().getFullYear(),
    release_tag:     drama.tags?.includes('ongoing') ? 'ongoing' : 'released',
    translation_tag: drama.tags?.includes('translated') ? 'translated' : 'translating',
    genre:           drama.genres?.[0] ?? '',
    country:         drama.country ?? '',
    voiceover:       drama.voiceover ?? '',
    poster_url:      drama.posterUrl ?? '',
    ...(drama.rating != null ? { rating: drama.rating * 2 } : {}),
  };

  console.log('[API] addDrama payload:', payload);
  return authPost('/dramas', payload);
}

// Фронтенд-код статуса -> бэкенд-код (обратное STATUS_MAP из adaptDramaFromApi)
const REVERSE_STATUS_MAP = { plan: 'planned', watching: 'watching', completed: 'completed', dropped: 'dropped' };

export async function updateDramaStatus(id, status) {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const backendStatus = REVERSE_STATUS_MAP[status] ?? status;
    const result = await authPatch(`/dramas/${id}`, { watch_status: backendStatus });
    if (!result.error) {
      invalidateUserCache();
      return { data: { id, status }, error: null };
    }
    console.warn('[API] updateDramaStatus failed:', result.error);
    return result;
  }

  await delay();
  console.log('[MOCK] updateDramaStatus:', id, '->', status);
  return { data: { id, status }, error: null };
}

export async function rateDrama(id, rating) {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    // Фронт хранит оценку как 1-5 звёзд, бэк — как 0-10 (см. adaptDramaFromApi/addDrama).
    // rating === null — снять оценку (повторный клик по той же звездочке).
    const body = rating == null ? { clear_rating: true } : { rating: rating * 2 };
    const result = await authPatch(`/dramas/${id}`, body);
    if (!result.error) {
      invalidateUserCacheSilent();
      return { data: { id, rating }, error: null };
    }
    console.warn('[API] rateDrama failed:', result.error);
    return result;
  }

  await delay();
  console.log('[MOCK] rateDrama:', id, '->', rating);
  return { data: { id, rating }, error: null };
}

export async function getLatestDramas(limit = 10) {
  await delay();
  const latestDramas = [
    { id: 'latest_001', title: 'Возвращение к истокам', year: 2025, country: 'cn', genres: ['Исторические'], ongoing: false, isNew: false, latestEpisode: 10, cover: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&q=80' },
    { id: 'latest_002', title: 'Агентство «Красная нить»', year: 2025, country: 'kr', genres: ['Романтика'], ongoing: true, isNew: false, latestEpisode: null, cover: 'https://images.unsplash.com/photo-1519895709498-ce3c5fa1a100?w=400&q=80' },
    { id: 'latest_003', title: 'Заколка Феникса', year: 2025, country: 'cn', genres: ['Исторические'], ongoing: true, isNew: false, latestEpisode: null, cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80' },
    { id: 'latest_004', title: 'Выйти замуж за злодея', year: 2025, country: 'cn', genres: ['Фэнтези'], ongoing: true, isNew: true, latestEpisode: null, cover: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80' },
    { id: 'latest_005', title: 'Бездна', year: 2025, country: 'kr', genres: ['Триллер'], ongoing: true, isNew: false, latestEpisode: null, cover: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&q=80' },
    { id: 'latest_006', title: 'Первый человек', year: 2025, country: 'kr', genres: ['Романтика'], ongoing: true, isNew: false, latestEpisode: null, cover: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80' },
    { id: 'latest_007', title: 'Наш соседский спецназ', year: 2025, country: 'kr', genres: ['Боевик'], ongoing: false, isNew: false, latestEpisode: 8, cover: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400&q=80' },
    { id: 'latest_008', title: 'Рассвет книги небес', year: 2025, country: 'cn', genres: ['Исторические'], ongoing: false, isNew: false, latestEpisode: 10, cover: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80' },
    { id: 'latest_009', title: 'Её величество Феникс', year: 2025, country: 'cn', genres: ['Исторические'], ongoing: false, isNew: true, latestEpisode: null, cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
    { id: 'latest_010', title: 'Двойная жизнь детектива', year: 2025, country: 'kr', genres: ['Мистерия'], ongoing: true, isNew: false, latestEpisode: null, cover: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80' },
  ];
  return { data: latestDramas.slice(0, limit), error: null };
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export async function registerUser({ name, email, password }) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (_) {}

    if (!res.ok) {
      if (res.status === 404) return { data: null, error: 'Что-то пошло не так. Попробуй позже.' };
      return { data: null, error: json?.error ?? `Ошибка сервера (${res.status})` };
    }

    return { data: json, error: null };
  } catch (err) {
    console.error('[API] registerUser network error:', err);
    return {
      data: null,
      error: err instanceof TypeError
        ? 'Не удалось подключиться к серверу. Убедись, что бэк запущен на порту 8080.'
        : 'Ошибка регистрации. Попробуй позже.',
    };
  }
}

export async function loginUser({ email, password }) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (_) {}

    if (!res.ok) {
      if (res.status === 401) return { data: null, error: 'Неверная почта или пароль.' };
      if (res.status === 400) return { data: null, error: json?.error ?? 'Заполни все поля.' };
      if (res.status === 404) return { data: null, error: 'Что-то пошло не так. Попробуй позже.' };
      return { data: null, error: json?.error ?? `Ошибка сервера (${res.status})` };
    }

    return { data: json, error: null };
  } catch (err) {
    console.error('[API] loginUser network error:', err);
    return {
      data: null,
      error: err instanceof TypeError
        ? 'Не удалось подключиться к серверу. Убедись, что бэк запущен на порту 8080.'
        : 'Ошибка входа. Попробуй позже.',
    };
  }
}

export async function deleteDrama(id) {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const result = await authDelete(`/dramas/${id}`);
    if (!result.error) {
      invalidateUserCache();
      return { data: { id, deleted: true }, error: null };
    }
    console.warn('[API] deleteDrama failed:', result.error);
    return result;
  }

  await delay();
  console.log('[MOCK] deleteDrama:', id);
  return { data: { id, deleted: true }, error: null };
}

export async function archiveDrama(id) {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const result = await authPatch(`/dramas/${id}/archive`);
    if (!result.error) {
      invalidateUserCache();
      return result;
    }
    console.warn('[API] archiveDrama: fallback to mock, error:', result.error);
  }

  await delay();
  const archived = _getArchivedIds();
  if (!archived.includes(id)) archived.push(id);
  localStorage.setItem('hanbin_archived', JSON.stringify(archived));
  console.log('[MOCK] archiveDrama:', id);
  invalidateUserCache();
  return { data: { id, status: 'archived' }, error: null };
}

export async function unarchiveDrama(id) {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const result = await authPatch(`/dramas/${id}/unarchive`);
    if (!result.error) {
      const archived = _getArchivedIds().filter(x => x !== id);
      localStorage.setItem('hanbin_archived', JSON.stringify(archived));
      invalidateUserCache();
      return result;
    }
    console.warn('[API] unarchiveDrama: fallback to mock, error:', result.error);
  }

  await delay();
  const archived = _getArchivedIds().filter(x => x !== id);
  localStorage.setItem('hanbin_archived', JSON.stringify(archived));
  console.log('[MOCK] unarchiveDrama:', id);
  invalidateUserCache();
  return { data: { id, status: 'plan' }, error: null };
}

export async function getArchivedDramas() {
  const { data: user } = await getMe();

  if (user?._rawDramas?.length !== undefined) {
    const result = user._rawDramas
      .map(adaptDramaFromApi)
      .filter(d => d.isArchived);
    return { data: result, error: null };
  }

  if (localStorage.getItem('hanbin_token')) {
    return { data: [], error: null };
  }

  await delay();
  const archivedIds = _getArchivedIds();
  if (!archivedIds.length) return { data: [], error: null };
  const result = MOCK_DRAMAS.filter(d => archivedIds.includes(d.id));
  return { data: result, error: null };
}

function _getArchivedIds() {
  try {
    return JSON.parse(localStorage.getItem('hanbin_archived') || '[]');
  } catch { return []; }
}

export async function searchDramas(query) {
  await delay(150);
  const q = query.toLowerCase();
  const result = MOCK_DRAMAS.filter(d => d.title.toLowerCase().includes(q));
  return { data: result, error: null };
}

export async function setViewMode(mode) {
  await delay(50);
  localStorage.setItem('hanbin_view_mode', mode);
  console.log('[MOCK] setViewMode:', mode);
  return { data: { mode }, error: null };
}

export async function getViewMode() {
  return { data: { mode: localStorage.getItem('hanbin_view_mode') || 'card' }, error: null };
}

let _getMeCache = null;
let _getMeInflight = null;
const GET_ME_TTL = 5000;

export async function getMe() {
  if (_getMeCache && (Date.now() - _getMeCache.ts) < GET_ME_TTL) {
    return _getMeCache.data;
  }

  if (_getMeInflight) return _getMeInflight;

  _getMeInflight = (async () => {
    const { data: raw, error } = await authGet('/users/me');
    if (error || !raw) return { data: null, error: error ?? 'no data' };

    const dramas = raw.dramas ?? [];
    const dramasWatched  = dramas.filter(d => d.watch_status === 'completed').length;
    const dramasWatching = dramas.filter(d => d.watch_status === 'watching').length;
    const dramasPlanned  = dramas.filter(d => d.watch_status === 'planned').length;
    const totalEpisodes  = dramasWatched + dramasWatching;
    const totalHours = Math.round(totalEpisodes * 45 / 60);

    // Разбивка по странам считается на бэке (raw.countries) — здесь только
    // презентационный маппинг кода страны на флаг/название/цвет.
    const COUNTRY_META = {
      kr: { flag: '🇰🇷', name: 'Корея',  colorClass: 'fill-korea' },
      cn: { flag: '🇨🇳', name: 'Китай',  colorClass: 'fill-china' },
      jp: { flag: '🇯🇵', name: 'Япония', colorClass: 'fill-japan' },
    };
    const countries = (raw.countries ?? []).map(c => {
      const key = (c.country || '').toLowerCase().slice(0, 2);
      const meta = COUNTRY_META[key] ?? { flag: '🌏', name: c.country || 'Другое', colorClass: 'fill-korea' };
      return { code: key, flag: meta.flag, name: meta.name, count: c.count, percent: c.percent, colorClass: meta.colorClass };
    });

    const BADGE_ICONS = {
      drama_queen: '👑', k_drama_fan: '🌸', c_drama_explorer: '🏮',
      '2000h_club': '⏱️', night_owl: '🌙', '100_dramas': '🔒',
    };
    const badges = (raw.badges ?? []).map(b => ({
      id:       b.code,
      icon:     b.icon || BADGE_ICONS[b.code] || '🏅',
      name:     b.name,
      unlocked: true,
    }));

    const LOCKED_BADGES = [
      { id: '100_dramas', icon: '🔒', name: '100 дорам', unlocked: false },
    ];
    for (const locked of LOCKED_BADGES) {
      if (!badges.find(b => b.id === locked.id)) badges.push(locked);
    }

    const adapted = {
      id:     String(raw.user_id),
      name:   raw.name,
      email:  raw.email,
      avatar: raw.name?.slice(0, 2) ?? '소',
      stats: {
        dramasWatched,
        totalEpisodes,
        dramasPlanned,
        totalHours,
        milestone: 'Drama Queen',
      },
      badges,
      countries,
      _rawDramas: dramas,
    };

    const result = { data: adapted, error: null };
    _getMeCache = { data: result, ts: Date.now() };
    return result;
  })();

  _getMeInflight.finally(() => { _getMeInflight = null; });

  return _getMeInflight;
}

export async function getAuthState() {
  const token = localStorage.getItem('hanbin_token');
  if (!token) return { data: { isLoggedIn: false, user: null }, error: null };

  try {
    const { data: user, error } = await getMe();

    if (user) {
      return { data: { isLoggedIn: true, user }, error: null };
    }

    const isNetworkError = error?.includes('подключиться') || error?.includes('connect') || error === 'no data';

    if (isNetworkError) {
      const raw = localStorage.getItem('hanbin_user');
      const cached = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
      if (cached) {
        const fallbackUser = {
          ...MOCK_USER,
          id:   cached.id   ?? MOCK_USER.id,
          name: cached.name ?? MOCK_USER.name,
          email: cached.email ?? '',
        };
        return { data: { isLoggedIn: true, user: fallbackUser }, error: null };
      }
    }

    localStorage.removeItem('hanbin_token');
    localStorage.removeItem('hanbin_user');
    return { data: { isLoggedIn: false, user: null }, error: null };

  } catch {
    const raw = localStorage.getItem('hanbin_user');
    const cached = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
    if (cached) {
      const fallbackUser = { ...MOCK_USER, id: cached.id ?? MOCK_USER.id, name: cached.name ?? MOCK_USER.name };
      return { data: { isLoggedIn: true, user: fallbackUser }, error: null };
    }
    return { data: { isLoggedIn: false, user: null }, error: null };
  }
}

// ─────────────────────────────────────────────
// CACHE INVALIDATION
// ─────────────────────────────────────────────

export function invalidateUserCache() {
  _getMeCache = null;
  _getMeInflight = null;
  window.dispatchEvent(new CustomEvent('hanbin:data-changed'));
}

// Та же инвалидация кэша, но БЕЗ глобального события hanbin:data-changed — используется там,
// где изменение не влияет на состав списка/статистику (например, оценка) —
// вызывающий код сам обновляет DOM локально, без мигания всей секции в «Zagruzka…».
export function invalidateUserCacheSilent() {
  _getMeCache = null;
  _getMeInflight = null;
}

// ─────────────────────────────────────────────
// SCRAPER
// ─────────────────────────────────────────────

/**
 * Спарсить информацию о дораме с внешнего сайта.
 * GET /api/v1/dramas/scrape?title=...&site_url=...
 *
 * Публичный эндпоинт — не требует авторизации.
 *
 * @returns {Promise<{
 *   data: object | null,
 *   error: string | null,
 *   notFound: boolean   ← true если дорама не найдена на этом сайте (HTTP 404)
 * }>}
 */
export async function scrapeDrama(title, siteUrl) {
  try {
    const params = new URLSearchParams({ title, site_url: siteUrl });
    const res = await fetch(`${API_BASE}/dramas/scrape?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (_) {}

    // Дорама не найдена или сайт заблокировал запрос (403/503) — бэк вернёт not_found:true
    if (res.status === 404 || json?.not_found === true) {
      return { data: null, error: json?.error ?? 'Дорама не найдена на этом сайте', notFound: true };
    }

    if (!res.ok) {
      // Любая другая ошибка — сайт недоступен, молча игнорируем на фронте
      return { data: null, error: json?.error ?? 'Не удалось получить данные с сайта', notFound: false };
    }

    return { data: json, error: null, notFound: false };
  } catch (err) {
    console.error('[API] scrapeDrama failed:', err);
    return {
      data: null,
      notFound: false,
      error: err instanceof TypeError
        ? 'Не удалось подключиться к серверу.'
        : 'Ошибка парсинга. Попробуй позже.',
    };
  }
}
