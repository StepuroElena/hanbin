/**
 * HANBIN — Mock API
 * Все запросы к бэку проходят через этот файл.
 * Когда бэк будет готов — заменяй mock-функции на реальные fetch/axios вызовы.
 *
 * Паттерн: каждая функция возвращает Promise, имитируя реальный API.
 * Задержка configurable через MOCK_DELAY.
 */

import { API_BASE, authGet, authPost, authPatch, authDelete } from './client.js';
import { DEFAULT_STREAMING_SITES } from '../data/streamingSites.js';
import { DEFAULT_MOVIE_CATEGORIES } from '../data/movieCategories.js';

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

/**
 * Реально используемые страны/жанры в дорамах пользователя — для динамического
 * построения чипов фильтров в Filters.js — чтобы не показывать чипы без данных (напр.
 * Япония, если там нет ни одной дорамы). Считается на бэке (GET /api/v1/dramas/facets) —
 * не вычисляем на фронте.
 */
export async function getFacets() {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const { data, error } = await authGet('/dramas/facets');
    if (data) {
      return { data: { countries: data.countries ?? [], genres: data.genres ?? [] }, error: null };
    }
    console.warn('[API] getFacets failed:', error);
    return { data: { countries: [], genres: [] }, error };
  }

  // Гость — считаем из мок-данных локально, там бэка всё равно нет.
  await delay(50);
  const countries = [...new Set(MOCK_DRAMAS.map(d => d.country).filter(Boolean))].sort();
  const genres = [...new Set(MOCK_DRAMAS.flatMap(d => d.genres))].sort();
  return { data: { countries, genres }, error: null };
}

export function adaptDramaFromApi(d) {
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

  // Сезоны: бэк может вернуть либо массив сезонов (берём длину), либо число напрямую.
  // Если с сайта/бэка ничего не пришло — дефолт 1, чтобы ячейка всегда была чем-то редактируемым, а не прочерком.
  const seasonsCount = Array.isArray(d.seasons) ? (d.seasons.length || 1) : (d.seasons ?? 1);

  // total_episodes с бэка — это сумма episode_count по всем сезонам (updateSeasons/updateEpisodeCount кладут одинаковое
  // число в каждый сезон), т.е. total_episodes = (серий на сезон) × seasonsCount. А ячейка «Серии» в таблице
  // должна показывать то, что вводил пользователь (серии на сезон) — делим обратно.
  const episodesPerSeason = seasonsCount > 0 ? Math.round((d.total_episodes ?? 0) / seasonsCount) : (d.total_episodes ?? 0);

  return {
    id:              String(d.id),
    title:           d.title,
    year:            d.release_year || null,
    genres:          d.genre ? [d.genre] : [],
    country:         (d.country || '').toLowerCase().slice(0, 2),
    status,
    episodesWatched: d.current_episode ?? 0,
    episodesTotal:   episodesPerSeason,
    episodeDurationMin: d.episode_duration_min ?? null,
    watchUrl:        d.watch_url || null,
    sourceUrl:       d.source_url || null,
    voiceover:       d.voiceover || null,
    rating,
    ongoing,
    hasSubs,
    isArchived:      Boolean(d.is_archived),
    cover:           d.poster_url ? `${API_BASE}/dramas/poster-proxy?url=${encodeURIComponent(d.poster_url)}` : null,
    seasons:         seasonsCount,
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
    if (filters.country && (!Array.isArray(filters.country) || filters.country.length)) {
      const countryList = Array.isArray(filters.country) ? filters.country : [filters.country];
      result = result.filter(d => countryList.includes(d.country));
    }
    if (filters.genre && (!Array.isArray(filters.genre) || filters.genre.length)) {
      const genreList = Array.isArray(filters.genre) ? filters.genre : [filters.genre];
      result = result.filter(d => d.genres.some(g => genreList.some(fg => g.toLowerCase().includes(fg.toLowerCase()))));
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
  if (filters.country && (!Array.isArray(filters.country) || filters.country.length)) {
    const countryList = Array.isArray(filters.country) ? filters.country : [filters.country];
    result = result.filter(d => countryList.includes(d.country));
  }
  if (filters.genre && (!Array.isArray(filters.genre) || filters.genre.length)) {
    const genreList = Array.isArray(filters.genre) ? filters.genre : [filters.genre];
    result = result.filter(d => d.genres.some(g => genreList.some(fg => g === fg)));
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

/**
 * Возвращает полную информацию по одной дораме отдельным запросом к бэку —
 * GET /api/v1/dramas/{id}. Используется модалкой редактирования ссылок — намеренно не
 * переиспользует уже отрендеренные данные из таблицы/карточек, а всегда тянет свежий снимок.
 *
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
export async function getDrama(id) {
  const token = localStorage.getItem('hanbin_token');
  if (!token) {
    // Гость — берём из мок-данных, бэка всё равно нет.
    await delay();
    const drama = MOCK_DRAMAS.find(d => d.id === id);
    return drama ? { data: drama, error: null } : { data: null, error: 'Дорама не найдена' };
  }

  const { data, error } = await authGet(`/dramas/${id}`);
  if (data) return { data: adaptDramaFromApi(data), error: null };
  console.warn('[API] getDrama failed:', error);
  return { data: null, error };
}

/**
 * Обновляет две ссылки дорамы — сайт из дропдауна (watch_url) и точную ссылку
 * на страницу дорамы (source_url, опционально, вводится вручную). Используется
 * модалкой редактирования ссылок в табличном/карточном виде.
 *
 * @param {string} id
 * @param {{ watchUrl: string, sourceUrl: string|null }} links
 */
export async function updateDramaLinks(id, { watchUrl, sourceUrl }) {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const result = await authPatch(`/dramas/${id}`, {
      watch_url:  watchUrl,
      source_url: sourceUrl ?? '',
    });
    if (!result.error) {
      // Не тихо — ссылки влияют на кнопку «перейти на сайт» в уже отрендеренной строке/карточке —
      // перерисовываем весь список, чтобы новая ссылка сразу же работала.
      invalidateUserCache();
      return { data: { id, watchUrl, sourceUrl }, error: null };
    }
    console.warn('[API] updateDramaLinks failed:', result.error);
    return result;
  }

  await delay();
  console.log('[MOCK] updateDramaLinks:', id, '->', { watchUrl, sourceUrl });
  return { data: { id, watchUrl, sourceUrl }, error: null };
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
    // Серии/длительность — вводятся в модалке добавления вручную или подтягиваются со скрейпера —
    // оба опциональны, отправляются, только если заполнены (0/null значит «пользователь не указал»).
    ...(drama.episodesTotal > 0 ? { seasons: [{ season_number: 1, episode_count: drama.episodesTotal }] } : {}),
    ...(drama.episodeDurationMin != null ? { episode_duration_min: drama.episodeDurationMin } : {}),
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
      // Тихо, без глобального события — вызывающий код (DramaCard.js) сам обновляет ячейку
      // локально. Раньше invalidateUserCache() триггерил перерисовку всей таблицы из-за изменения одного статуса.
      invalidateUserCacheSilent();
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

/**
 * Обновляет озвучку дорамы — используется выпадающим списком в табличном виде,
 * тем же списком VOICEOVER_OPTIONS, что и в модалке добавления дорамы.
 * value === null — снять озвучку.
 */
export async function updateVoiceover(id, value) {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const result = await authPatch(`/dramas/${id}`, { voiceover: value ?? '' });
    if (!result.error) {
      // Тихо, без глобального события hanbin:data-changed — вызывающий код (DramaCard.js)
      // сам обновляет ячейку локально. Раньше invalidateUserCache() триггерил перерисовку
      // всей таблицы (через loadWatching() в Home.js) из-за изменения одной ячейки.
      invalidateUserCacheSilent();
      return { data: { id, voiceover: value }, error: null };
    }
    console.warn('[API] updateVoiceover failed:', result.error);
    return result;
  }

  await delay();
  console.log('[MOCK] updateVoiceover:', id, '->', value);
  return { data: { id, voiceover: value }, error: null };
}

/**
 * Обновляет количество сезонов дорамы — выпадающий список в табличном виде.
 * Бэк принимает массив сезонов { season_number, episode_count } целиком (PATCH заменяет весь массив,
 * а не мержит) — поэтому currentEpisodesPerSeason обязателен.
 *
 * ВАЖНО: количество серий, которое выбирает пользователь в ячейке «Серии» — это серии НА СЕЗОН,
 * а не всего по дораме — поэтому кладём одинаковое значение в КАЖДЫЙ сезон массива, а не только в первый.
 * Раньше все серии клались только в первый сезон, и сумма по сезонам на бэке (используется для «Часов
 * дорам») получалась равной просто числу серий без умножения на количество сезонов — вот откуда была
 * заниженная сумма часов (78 вместо 92, если считать вручную по формуле длительность×серии×сезоны).
 */
export async function updateSeasons(id, count, currentEpisodesPerSeason = 0) {
  const token = localStorage.getItem('hanbin_token');
  const seasons = Array.from({ length: count }, (_, i) => ({
    season_number: i + 1,
    episode_count: currentEpisodesPerSeason, // одинаково во всех сезонах — сумма на бэке сама умножается на count
  }));

  if (token) {
    const result = await authPatch(`/dramas/${id}`, { seasons });
    if (!result.error) {
      invalidateUserCacheSilent();
      return { data: { id, seasons: count }, error: null };
    }
    console.warn('[API] updateSeasons failed:', result.error);
    return result;
  }

  await delay();
  console.log('[MOCK] updateSeasons:', id, '->', count);
  return { data: { id, seasons: count }, error: null };
}

/**
 * Обновляет тег выпуска дорамы — 'released' | 'ongoing'. Используется редактируемым
 * тегом в столбце «Тэги» в табличном виде.
 */
export async function updateReleaseTag(id, tag) {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const result = await authPatch(`/dramas/${id}`, { release_tag: tag });
    if (!result.error) {
      invalidateUserCacheSilent();
      return { data: { id, releaseTag: tag }, error: null };
    }
    console.warn('[API] updateReleaseTag failed:', result.error);
    return result;
  }

  await delay();
  console.log('[MOCK] updateReleaseTag:', id, '->', tag);
  return { data: { id, releaseTag: tag }, error: null };
}

/**
 * Обновляет тег перевода дорамы — 'translated' | 'translating'. Используется редактируемым
 * тегом в столбце «Тэги» в табличном виде.
 */
export async function updateTranslationTag(id, tag) {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const result = await authPatch(`/dramas/${id}`, { translation_tag: tag });
    if (!result.error) {
      invalidateUserCacheSilent();
      return { data: { id, translationTag: tag }, error: null };
    }
    console.warn('[API] updateTranslationTag failed:', result.error);
    return result;
  }

  await delay();
  console.log('[MOCK] updateTranslationTag:', id, '->', tag);
  return { data: { id, translationTag: tag }, error: null };
}

/**
 * Обновляет длительность одной серии в минутах — вводится вручную (часы + минуты) в табличном виде,
 * так как с разных сайтов длительность может быть любой (45мин, 1ч 05мин и т.д.) —
 * скрейпер её не парсит. Бэк требует значение > 0.
 */
export async function updateEpisodeDuration(id, minutes) {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const result = await authPatch(`/dramas/${id}`, { episode_duration_min: minutes });
    if (!result.error) {
      invalidateUserCacheSilent();
      return { data: { id, episodeDurationMin: minutes }, error: null };
    }
    console.warn('[API] updateEpisodeDuration failed:', result.error);
    return result;
  }

  await delay();
  console.log('[MOCK] updateEpisodeDuration:', id, '->', minutes);
  return { data: { id, episodeDurationMin: minutes }, error: null };
}

/**
 * Обновляет количество серий в ОДНОМ сезоне — выпадающий список 1–50 в табличном виде.
 * Принимает текущее количество сезонов по той же причине, что и updateSeasons — оба пишут в одно и то же
 * поле seasons, которое PATCH заменяет целиком, а не мержит.
 *
 * Кладём count в КАЖДЫЙ сезон массива (одинаково), а не только в первый — чтобы сумма на бэке
 * (используется в формуле «Часов дорам») сама естественно умножалась на количество сезонов,
 * вместо того чтобы считаться равной просто числу серий без учёта сезонов.
 */
export async function updateEpisodeCount(id, count, currentSeasonsCount = 1) {
  const token = localStorage.getItem('hanbin_token');
  const seasonsCount = Math.max(1, currentSeasonsCount);
  const seasons = Array.from({ length: seasonsCount }, (_, i) => ({
    season_number: i + 1,
    episode_count: count,
  }));

  if (token) {
    const result = await authPatch(`/dramas/${id}`, { seasons });
    if (!result.error) {
      invalidateUserCacheSilent();
      return { data: { id, episodesTotal: count }, error: null };
    }
    console.warn('[API] updateEpisodeCount failed:', result.error);
    return result;
  }

  await delay();
  console.log('[MOCK] updateEpisodeCount:', id, '->', count);
  return { data: { id, episodesTotal: count }, error: null };
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
// MOVIES
// ─────────────────────────────────────────────

// Минимальный мок — просто список для гостя (бэка всё равно нет). Статус — четыре значения,
// так же как и в бэке: 'planned'/'watching'/'completed'/'dropped'.
const MOCK_MOVIES = [
  { id: 'movie_001', title: 'Decision to Leave', year: 2022, genre: 'Mystery', status: 'completed' },
  { id: 'movie_002', title: 'Parasite', year: 2019, genre: 'Drama', status: 'completed' },
  { id: 'movie_003', title: 'The Handmaiden', year: 2016, genre: 'Thriller', status: 'watching' },
  { id: 'movie_004', title: 'Broker', year: 2022, genre: 'Drama', status: 'planned' },
  { id: 'movie_005', title: 'Burning', year: 2018, genre: 'Mystery', status: 'dropped' },
];

function adaptMovieFromApi(m) {
  return {
    id:         String(m.id),
    title:      m.title,
    year:       m.release_year ?? null,
    genre:      m.genre ?? '',
    country:    m.country ?? '',
    category:   m.category ?? '',
    status:     m.watch_status ?? 'planned',
    isArchived: Boolean(m.is_archived),
  };
}

function _getArchivedMovieIds() {
  try {
    return JSON.parse(localStorage.getItem('hanbin_archived_movies') || '[]');
  } catch { return []; }
}

function _getDeletedMovieIds() {
  try {
    return JSON.parse(localStorage.getItem('hanbin_deleted_movies') || '[]');
  } catch { return []; }
}

/**
 * Список фильмов пользователя — GET /api/v1/movies (требует авторизации).
 * Бэк возвращает ВСЕ фильмы — архивированные отфильтровываются тут, так же как и у дорам.
 * Гость (нет токена) — отдаём мок-данные локально, бэка всё равно нет.
 */
export async function getMovies() {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const { data, error } = await authGet('/movies');
    if (data) {
      return { data: data.map(adaptMovieFromApi).filter(m => !m.isArchived), error: null };
    }
    console.warn('[API] getMovies failed:', error);
    return { data: [], error };
  }

  await delay();
  const archived = _getArchivedMovieIds();
  const deleted = _getDeletedMovieIds();
  return { data: MOCK_MOVIES.filter(m => !archived.includes(m.id) && !deleted.includes(m.id)), error: null };
}

/**
 * Список архивированных фильмов — использует тот же GET /api/v1/movies, фильтрует по is_archived === true.
 */
export async function getArchivedMovies() {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const { data, error } = await authGet('/movies');
    if (data) {
      return { data: data.map(adaptMovieFromApi).filter(m => m.isArchived), error: null };
    }
    console.warn('[API] getArchivedMovies failed:', error);
    return { data: [], error };
  }

  await delay();
  const archivedIds = _getArchivedMovieIds();
  const deleted = _getDeletedMovieIds();
  const visibleArchivedIds = archivedIds.filter(id => !deleted.includes(id));
  if (!visibleArchivedIds.length) return { data: [], error: null };
  return { data: MOCK_MOVIES.filter(m => visibleArchivedIds.includes(m.id)), error: null };
}

/**
 * Добавить фильм — POST /api/v1/movies. Гостю недоступно — нет аккаунта, некуда сохранять.
 * Бэк хранит жанр одним строковым полем (VARCHAR(100)) — если в модалке выбрано несколько жанров,
 * они уже приходят сюда склеенными через запятую (см. AddMovieModal.js).
 * category — опциональное значение из персонального списка категорий (см. getMovieCategories).
 * @param {{ title: string, genre: string, country?: string, category?: string, year?: number|null }} movie
 */
export async function addMovie({ title, genre, country, category, year }) {
  const token = localStorage.getItem('hanbin_token');
  if (!token) return { data: null, error: 'Войди, чтобы добавить фильм' };

  const { data, error } = await authPost('/movies', {
    title,
    genre,
    ...(country ? { country } : {}),
    ...(category ? { category } : {}),
    ...(year ? { release_year: year } : {}),
  });
  if (data) return { data: adaptMovieFromApi(data), error: null };
  return { data: null, error };
}

/**
 * Меняет статус просмотра фильма — PATCH /api/v1/movies/{id}. Клик по статусу в таблице переключает
 * planned ↔ watched (только два состояния, в отличие от дорам без выпадающего списка).
 * Гостю недоступно — меняем только локально (мок-данные всё равно сбрасываются при рефреше).
 * @param {string} id
 * @param {'planned'|'watched'} status
 */
export async function updateMovieStatus(id, status) {
  const token = localStorage.getItem('hanbin_token');
  if (!token) {
    await delay(50);
    console.log('[MOCK] updateMovieStatus:', id, '->', status);
    return { data: { id, status }, error: null };
  }

  const { data, error } = await authPatch(`/movies/${id}`, { watch_status: status });
  if (data) return { data: adaptMovieFromApi(data), error: null };
  return { data: null, error };
}

/**
 * Частичное обновление любых полей фильма — PATCH /api/v1/movies/{id}, тот же эндпоинт, что и updateMovieStatus,
 * но бэк (см. Update в movie.service.go) теперь принимает любой набор опциональных полей за один запрос.
 * Используется редактируемыми ячейками таблицы фильмов в Movies.js (название/жанр/категория/страна/год).
 * @param {string} id
 * @param {{ title?: string, genre?: string, category?: string, country?: string, release_year?: number, clear_year?: boolean }} patch
 */
export async function updateMovieField(id, patch) {
  const token = localStorage.getItem('hanbin_token');
  if (!token) {
    await delay(50);
    console.log('[MOCK] updateMovieField:', id, '->', patch);
    return { data: { id, ...patch }, error: null };
  }

  const { data, error } = await authPatch(`/movies/${id}`, patch);
  if (data) return { data: adaptMovieFromApi(data), error: null };
  return { data: null, error };
}

/**
 * Архивирует фильм — PATCH /api/v1/movies/{id}/archive. Гостю — локально в localStorage
 * (мок-данные всё равно сбрасываются при рефреше), так же как и архив дорам.
 */
export async function archiveMovie(id) {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const { data, error } = await authPatch(`/movies/${id}/archive`);
    if (data) return { data: adaptMovieFromApi(data), error: null };
    console.warn('[API] archiveMovie failed:', error);
    return { data: null, error };
  }

  await delay(50);
  const archived = _getArchivedMovieIds();
  if (!archived.includes(id)) archived.push(id);
  localStorage.setItem('hanbin_archived_movies', JSON.stringify(archived));
  return { data: { id, isArchived: true }, error: null };
}

/**
 * Возвращает фильм из архива — PATCH /api/v1/movies/{id}/unarchive.
 */
export async function unarchiveMovie(id) {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const { data, error } = await authPatch(`/movies/${id}/unarchive`);
    if (data) return { data: adaptMovieFromApi(data), error: null };
    console.warn('[API] unarchiveMovie failed:', error);
    return { data: null, error };
  }

  await delay(50);
  const archived = _getArchivedMovieIds().filter(x => x !== id);
  localStorage.setItem('hanbin_archived_movies', JSON.stringify(archived));
  return { data: { id, isArchived: false }, error: null };
}

/**
 * Удаляет фильм навсегда — DELETE /api/v1/movies/{id}. Бэк требует, чтобы фильм был
 * уже в архиве (так же, как и у дорам). Гостю — локально через список удалённых id в localStorage,
 * так как MOCK_MOVIES — статический массив и его нельзя удалить навсегда.
 */
export async function deleteMovie(id) {
  const token = localStorage.getItem('hanbin_token');

  if (token) {
    const { error } = await authDelete(`/movies/${id}`);
    if (!error) return { data: { id, deleted: true }, error: null };
    console.warn('[API] deleteMovie failed:', error);
    return { data: null, error };
  }

  await delay(50);
  const deleted = _getDeletedMovieIds();
  if (!deleted.includes(id)) deleted.push(id);
  localStorage.setItem('hanbin_deleted_movies', JSON.stringify(deleted));
  return { data: { id, deleted: true }, error: null };
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

/**
 * Запрашивает восстановление пароля по email — POST /api/v1/auth/forgot-password.
 * Если такого аккаунта нет, бэк вернёт 404 — ошибка прокидывается в UI как есть.
 *
 * ВРЕМЕННО (пока не подключён реальный email-провайдер): бэк возвращает готовую ссылку
 * восстановления прямо в ответе (data.resetLink) — её показывает ForgotPasswordModal.js.
 * Как только появится email-сервис — это поле с бэка уйдёт, и весь шаг с показом ссылки надо будет убрать.
 *
 * @param {string} email
 * @returns {Promise<{ data: { resetLink: string, expiresAt: string }|null, error: string|null }>}
 */
export async function forgotPassword(email) {
  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (_) {}

    if (!res.ok) {
      if (res.status === 404) return { data: null, error: 'Аккаунт с такой почтой не найден.' };
      if (res.status === 400) return { data: null, error: json?.error ?? 'Проверь почту.' };
      return { data: null, error: json?.error ?? `Ошибка сервера (${res.status})` };
    }

    return { data: { resetLink: json?.reset_link ?? '', expiresAt: json?.expires_at ?? '' }, error: null };
  } catch (err) {
    console.error('[API] forgotPassword network error:', err);
    return {
      data: null,
      error: err instanceof TypeError
        ? 'Не удалось подключиться к серверу.'
        : 'Ошибка. Попробуй позже.',
    };
  }
}

/**
 * Устанавливает новый пароль по токену из ссылки восстановления — POST /api/v1/auth/reset-password.
 * Используется ResetPasswordModal.js.
 * @param {string} token
 * @param {string} password
 */
export async function resetPassword(token, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (_) {}

    if (!res.ok) {
      return { data: null, error: mapResetTokenError(json?.error, res.status) };
    }

    return { data: json, error: null };
  } catch (err) {
    console.error('[API] resetPassword network error:', err);
    return {
      data: null,
      error: err instanceof TypeError
        ? 'Не удалось подключиться к серверу.'
        : 'Ошибка. Попробуй позже.',
    };
  }
}

/**
 * Проверяет токен восстановления пароля до того, как показать форму смены пароля — GET /api/v1/auth/reset-password?token=...
 * Чистое чтение, ничего не меняет. Используется router.js при открытии ссылки из письма,
 * чтобы решить — открывать ResetPasswordModal.js (токен валиден) или показать тост с ошибкой.
 * @param {string} token
 * @returns {Promise<{ data: { email: string }|null, error: string|null }>}
 */
export async function validateResetToken(token) {
  try {
    const res = await fetch(`${API_BASE}/auth/reset-password?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });

    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (_) {}

    if (!res.ok) {
      return { data: null, error: mapResetTokenError(json?.error, res.status) };
    }

    return { data: { email: json?.email ?? '' }, error: null };
  } catch (err) {
    console.error('[API] validateResetToken network error:', err);
    return {
      data: null,
      error: err instanceof TypeError
        ? 'Не удалось подключиться к серверу.'
        : 'Ошибка. Попробуй позже.',
    };
  }
}

// Бэк возвращает английский текст ошибки (см. authdomain.ErrTokenInvalid/ErrTokenExpired в auth.service.go) —
// переводим известные варианты на русский, чтобы UI не показывал сырой английский текст.
// Используется и validateResetToken(), и resetPassword() — оба могут вернуть ту же ошибку.
function mapResetTokenError(rawMessage, status) {
  const msg = (rawMessage ?? '').toLowerCase();
  if (msg.includes('expired')) return 'Ссылка устарела — запроси новую через «Забыл(а) пароль?»';
  if (msg.includes('invalid') || msg.includes('already been used')) return 'Ссылка недействительна или уже использована';
  return rawMessage || `Ошибка сервера (${status})`;
}

// Тот же смысл, что и mapResetTokenError, но для ошибок токена подтверждения почты
// (authdomain.ErrConfirmationTokenInvalid/ErrConfirmationTokenExpired).
function mapConfirmationTokenError(rawMessage, status) {
  const msg = (rawMessage ?? '').toLowerCase();
  if (msg.includes('expired')) return 'Ссылка подтверждения устарела — зарегистрируйся заново, чтобы получить новое письмо';
  if (msg.includes('invalid') || msg.includes('already been used')) return 'Ссылка недействительна или почта уже подтверждена';
  return rawMessage || `Ошибка сервера (${status})`;
}

/**
 * Подтверждает email по токену из ссылки в письме — GET /api/v1/auth/confirm-email?token=...
 * Используется router.js при открытии ссылки #/confirm-email?token=...
 * @param {string} token
 * @returns {Promise<{ data: { ok: true }|null, error: string|null }>}
 */
export async function confirmEmail(token) {
  try {
    const res = await fetch(`${API_BASE}/auth/confirm-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });

    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (_) {}

    if (!res.ok) {
      return { data: null, error: mapConfirmationTokenError(json?.error, res.status) };
    }

    return { data: json, error: null };
  } catch (err) {
    console.error('[API] confirmEmail network error:', err);
    return {
      data: null,
      error: err instanceof TypeError
        ? 'Не удалось подключиться к серверу.'
        : 'Ошибка. Попробуй позже.',
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
    // /users/me — имя/email/бэйджи/страны (старая доменная модель, но эти поля там есть).
    // /dramas — сам список дорам, теперь из НОВОЙ доменной модели — той же, в которую пишут
    // updateSeasons/updateEpisodeCount/updateEpisodeDuration и т.д. Раньше список брался из raw.dramas выше (/users/me),
    // а та старая доменная модель вообще не знает про seasons/episode_duration_min — отсюда после рефреша
    // введённое количество серий/длительность исчезало.
    const [{ data: raw, error }, { data: dramaList, error: dramaListError }] = await Promise.all([
      authGet('/users/me'),
      authGet('/dramas'),
    ]);
    if (error || !raw) return { data: null, error: error ?? 'no data' };

    const dramas = Array.isArray(dramaList) ? dramaList : (raw.dramas ?? []);
    if (dramaListError) console.warn('[API] getMe: /dramas list failed, falling back to /users/me dramas:', dramaListError);
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

/**
 * Обновляет имя пользователя — PATCH /api/v1/profiles/{id}. Бэк теперь требует авторизацию
 * и сверяет, что {id} в пути совпадает с profile_id из токена — менять чужое имя нельзя.
 * Поле email в этом же UpdateInput на бэке пока игнорируется — отдельной функции для email пока нет намеренно.
 *
 * @param {string|number} id — profile_id текущего пользователя (auth.user.id из getAuthState/getMe)
 * @param {string} name
 */
export async function updateProfileName(id, name) {
  const token = localStorage.getItem('hanbin_token');
  if (!token) return { data: null, error: 'Войди, чтобы изменить имя' };

  const { data, error } = await authPatch(`/profiles/${id}`, { name });
  if (data) {
    // Имя показывается и в шапке (инициалы аватара), и на самой странице профиля —
    // сбрасываем кэш getMe(), чтобы следующий запрос подтянул свежее имя.
    invalidateUserCache();
    return { data, error: null };
  }
  console.warn('[API] updateProfileName failed:', error);
  return { data: null, error };
}

/**
 * Обновляет email пользователя — PATCH /api/v1/profiles/{id}, тот же эндпоинт, что и updateProfileName.
 * Бэк проверяет формат и уникальность — если такой email уже занят, вернётся 409,
 * текст которого прокидывается как error и показывается под полем в Profile.js.
 * Логин идёт по той же таблице profiles, которую меняет этот PATCH — после смены
 * входить надо уже по новому email.
 *
 * @param {string|number} id
 * @param {string} email
 */
export async function updateProfileEmail(id, email) {
  const token = localStorage.getItem('hanbin_token');
  if (!token) return { data: null, error: 'Войди, чтобы изменить email' };

  const { data, error } = await authPatch(`/profiles/${id}`, { email });
  if (data) {
    invalidateUserCache();
    return { data, error: null };
  }
  console.warn('[API] updateProfileEmail failed:', error);
  return { data: null, error };
}

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

// ───────────────────────────────────
// STREAMING SITES
// ───────────────────────────────────

/**
 * Список сайтов для просмотра — теперь персональный для каждого профиля (раньше был
 * захардкожен STREAMING_SITES в AddDramaModal.js, одинаковый для всех пользователей).
 * Бэк лениво засеивает дефолтный набор при первом запросе нового/старого профиля.
 * GET /api/v1/streaming-sites
 *
 * Гость (нет токена) — бэка для него всё равно нет, отдаём дефолтный список локально.
 */
export async function getStreamingSites() {
  const token = localStorage.getItem('hanbin_token');

  if (!token) {
    await delay(50);
    return { data: DEFAULT_STREAMING_SITES, error: null };
  }

  const { data, error } = await authGet('/streaming-sites');
  if (data) {
    return {
      data: data.map(s => ({ id: s.id, name: s.name, url: s.url, language: s.language, enabled: s.enabled !== false })),
      error: null,
    };
  }
  console.warn('[API] getStreamingSites failed, falling back to defaults:', error);
  return { data: DEFAULT_STREAMING_SITES, error };
}

/**
 * Добавляет свой сайт в персональный список (за пределами дефолтных 10).
 * Требует авторизации — гостю недоступно.
 */
export async function addStreamingSite({ name, url, language }) {
  const token = localStorage.getItem('hanbin_token');
  if (!token) return { data: null, error: 'Войди, чтобы добавить свой сайт' };

  const { data, error } = await authPost('/streaming-sites', { name, url, language });
  if (data) return { data: { id: data.id, name: data.name, url: data.url, language: data.language, enabled: data.enabled !== false }, error: null };
  return { data: null, error };
}

/** Обновляет свой сайт в персональном списке — включая тогл вкл/выкл (enabled). Требует авторизации. */
export async function updateStreamingSite(id, { name, url, language, enabled }) {
  const token = localStorage.getItem('hanbin_token');
  if (!token) return { data: null, error: 'Войди, чтобы изменить сайт' };

  const body = {};
  if (name !== undefined) body.name = name;
  if (url !== undefined) body.url = url;
  if (language !== undefined) body.language = language;
  if (enabled !== undefined) body.enabled = enabled;

  const { data, error } = await authPatch(`/streaming-sites/${id}`, body);
  if (data) return { data: { id: data.id, name: data.name, url: data.url, language: data.language, enabled: data.enabled !== false }, error: null };
  return { data: null, error };
}

/** Удаляет свой сайт из персонального списка. Требует авторизации. */
export async function deleteStreamingSite(id) {
  const token = localStorage.getItem('hanbin_token');
  if (!token) return { data: null, error: 'Войди, чтобы удалить сайт' };

  return authDelete(`/streaming-sites/${id}`);
}

// ────────────────────────
// MOVIE CATEGORIES
// ────────────────────────

/**
 * Список коротких тегов/категорий фильма — персональный для каждого профиля (тот же паттерн,
 * что и getStreamingSites). Используется дропдауном «Категория» в AddMovieModal.js и страницей Настроек.
 * GET /api/v1/movie-categories
 *
 * Гость (нет токена) — бэка для него всё равно нет, отдаём дефолтный список локально.
 */
export async function getMovieCategories() {
  const token = localStorage.getItem('hanbin_token');

  if (!token) {
    await delay(50);
    return { data: DEFAULT_MOVIE_CATEGORIES, error: null };
  }

  const { data, error } = await authGet('/movie-categories');
  if (data) {
    return {
      data: data.map(c => ({ id: c.id, name: c.name, enabled: c.enabled !== false })),
      error: null,
    };
  }
  console.warn('[API] getMovieCategories failed, falling back to defaults:', error);
  return { data: DEFAULT_MOVIE_CATEGORIES, error };
}

/**
 * Добавляет свою категорию в персональный список (за пределами дефолтных 8).
 * Требует авторизации — гостю недоступно.
 */
export async function addMovieCategory({ name }) {
  const token = localStorage.getItem('hanbin_token');
  if (!token) return { data: null, error: 'Войди, чтобы добавить свою категорию' };

  const { data, error } = await authPost('/movie-categories', { name });
  if (data) return { data: { id: data.id, name: data.name, enabled: data.enabled !== false }, error: null };
  return { data: null, error };
}

/** Обновляет свою категорию в персональном списке — включая тогл вкл/выкл (enabled). Требует авторизации. */
export async function updateMovieCategory(id, { name, enabled }) {
  const token = localStorage.getItem('hanbin_token');
  if (!token) return { data: null, error: 'Войди, чтобы изменить категорию' };

  const body = {};
  if (name !== undefined) body.name = name;
  if (enabled !== undefined) body.enabled = enabled;

  const { data, error } = await authPatch(`/movie-categories/${id}`, body);
  if (data) return { data: { id: data.id, name: data.name, enabled: data.enabled !== false }, error: null };
  return { data: null, error };
}

/** Удаляет свою категорию из персонального списка. Требует авторизации. */
export async function deleteMovieCategory(id) {
  const token = localStorage.getItem('hanbin_token');
  if (!token) return { data: null, error: 'Войди, чтобы удалить категорию' };

  return authDelete(`/movie-categories/${id}`);
}
