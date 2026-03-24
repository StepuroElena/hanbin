/**
 * HANBIN — Mock API
 * Все запросы к бэку проходят через этот файл.
 * Когда бэк будет готов — заменяй mock-функции на реальные fetch/axios вызовы.
 *
 * Паттерн: каждая функция возвращает Promise, имитируя реальный API.
 * Задержка configurable через MOCK_DELAY.
 */

import { API_BASE, authGet, authPost } from './client.js';

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
 * Получить профиль и статистику пользователя.
 * Теперь идёт через реальный GET /api/v1/users/me.
 * Если не авторизован — фаллбэк на MOCK_USER.
 */
export async function getUser() {
  const { data, error } = await getMe();
  if (data) return { data, error: null };
  // Фаллбэк: пользователь не залогинен или бэк недоступен
  await delay();
  return { data: MOCK_USER, error: null };
}

/**
 * Адаптирует дораму с бэка в формат, который ожидают компоненты.
 *
 * Бэк (DramaOutput):
 *   id, profile_id, title, watch_url, release_year, release_tag,
 *   translation_tag, genre, rating (0–10 | null), watch_status,
 *   country, created_at, updated_at
 *
 * Фронт:
 *   id, title, year, genres[], country, status, episodesWatched,
 *   episodesTotal, watchUrl, rating (1–5 | null), hasSubs, ongoing, cover
 *
 * watch_status маппинг:
 *   planned   → plan
 *   watching  → watching
 *   completed → completed
 *   dropped   → dropped
 */
function adaptDramaFromApi(d) {
  // release_tag: 'ongoing' | 'released'
  const ongoing = d.release_tag === 'ongoing';

  // translation_tag: 'translated' | 'translating'
  const hasSubs = d.translation_tag === 'translated';

  // watch_status с бэка может быть 'planned', на фронте ожидается 'plan'
  const STATUS_MAP = {
    planned:   'plan',
    watching:  'watching',
    completed: 'completed',
    dropped:   'dropped',
  };
  const status = STATUS_MAP[d.watch_status] ?? d.watch_status;

  // Рейтинг: бэк хранит 0–10 (float), фронт показывает 1–5 звёзд
  const rating = d.rating != null ? Math.round(d.rating / 2) || 1 : null;

  return {
    id:              String(d.id),
    title:           d.title,
    year:            d.release_year || null,
    genres:          d.genre ? [d.genre] : [],
    country:         (d.country || '').toLowerCase().slice(0, 2),
    status,
    // Бэк пока не хранит прогресс по эпизодам — показываем 0/0
    episodesWatched: 0,
    episodesTotal:   0,
    watchUrl:        d.watch_url || null,
    rating,
    ongoing,
    hasSubs,
    cover:           null, // бэк пока не хранит обложки
  };
}

/**
 * Получить список всех дорам.
 * Если пользователь залогинен — берёт дорамы с бэка через /users/me.
 * Фаллбэк на MOCK_DRAMAS если не авторизован.
 * @param {Object} filters — { status, country, genre, search }
 */
export async function getDramas(filters = {}) {
  // Пытаемся взять данные с бэка
  const { data: user } = await getMe();
  if (user?._rawDramas?.length) {
    let result = user._rawDramas.map(adaptDramaFromApi);

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

    return { data: result, error: null };
  }

  // Фаллбэк: мок
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
 * Получить дорамы со статусом "watching".
 * Идёт через getDramas({ status: 'watching' }), т.е. автоматически использует бэк если залогинен.
 */
export async function getCurrentlyWatching() {
  return getDramas({ status: 'watching' });
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
 * Добавить дораму в список.
 * Если пользователь авторизован — реальный вызов POST /api/v1/dramas.
 * Фаллбэк на мок если не авторизован.
 *
 * @param {Object} drama
 * @param {string} drama.title          — название (обязательно)
 * @param {string} drama.watchUrl       — ссылка на сайт (обязательно)
 * @param {string[]} drama.genres       — жанры (первый отправляется на бэк; обязательно)
 * @param {string} drama.country        — код страны (обязательно)
 * @param {number} drama.year           — год выпуска
 * @param {string} drama.releaseTag     — 'ongoing' | 'released'
 * @param {string} drama.subTag         — 'translated' | 'translating'
 * @param {number|null} drama.rating    — звёзды 1–5 (на бэк отправляется как float 0–10)
 */
export async function addDrama(drama) {
  const token = localStorage.getItem('hanbin_token');

  // Фаллбэк на мок если не авторизован
  if (!token) {
    await delay();
    console.log('[MOCK] addDrama (not logged in, using mock):', drama);
    return { data: { ...drama, id: `drama_${Date.now()}` }, error: null };
  }

  // Адаптируем формат фронта в формат, который ожидает бэк
  const payload = {
    title:           drama.title,
    watch_url:       drama.watchUrl ?? '',
    release_year:    drama.year ?? new Date().getFullYear(),
    release_tag:     drama.tags?.includes('ongoing') ? 'ongoing' : 'released',
    translation_tag: drama.tags?.includes('translated') ? 'translated' : 'translating',
    genre:           drama.genres?.[0] ?? '',
    country:         drama.country ?? '',
    // Рейтинг: звёзды 1–5 → float 0–10 (на бэке 0–10)
    ...(drama.rating != null ? { rating: drama.rating * 2 } : {}),
  };

  console.log('[API] addDrama payload:', payload);
  return authPost('/dramas', payload);
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
 * Получить последние дорамы с сайта (для незалогиненной страницы)
 * TODO: GET /api/dramas/latest?source=doramyclub
 */
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

/**
 * Зарегистрировать нового пользователя.
 * @param {{ name: string, email: string, password: string }} input
 * @returns {{ data: { user_id: number, name: string, email: string } | null, error: string | null }}
 *
 * POST /api/v1/auth/register
 */
export async function registerUser({ name, email, password }) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    // Бэк может вернуть text/plain при 404 — безопасно читаем текст, потом парсим
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (_) { /* не JSON */ }

    if (!res.ok) {
      if (res.status === 404) {
        return { data: null, error: 'Что-то пошло не так. Попробуй позже.' };
      }
      // Бэк возвращает { error: '...' }
      return { data: null, error: json?.error ?? `Ошибка сервера (${res.status})` };
    }

    // Успех → { user_id, name, email }
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

/**
 * Войти в аккаунт.
 * @param {{ email: string, password: string }} input
 * @returns {{ data: { user_id: number, email: string, token: string } | null, error: string | null }}
 *
 * POST /api/v1/auth/login
 */
export async function loginUser({ email, password }) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (_) { /* не JSON */ }

    if (!res.ok) {
      if (res.status === 401) {
        return { data: null, error: 'Неверная почта или пароль.' };
      }
      if (res.status === 400) {
        return { data: null, error: json?.error ?? 'Заполни все поля.' };
      }
      if (res.status === 404) {
        return { data: null, error: 'Что-то пошло не так. Попробуй позже.' };
      }
      return { data: null, error: json?.error ?? `Ошибка сервера (${res.status})` };
    }

    // Успех → { user_id, email, token }
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

/**
 * Получить данные текущего пользователя с бэка.
 * GET /api/v1/users/me — требует Authorization: Bearer <token>
 *
 * Ответ бэка: { user_id, name, email, dramas[], badges[] }
 * Адаптируем в формат, который ожидают компоненты (stats, countries, badges).
 *
 * Кэшируется на 5 секунд чтобы не слать параллельные запросы
 * когда несколько компонентов (StatsBlock, DramaList, Sidebar) обновляются одновременно.
 * Инвалидируется через invalidateUserCache().
 */
let _getMeCache = null;      // { data, ts } — результат последнего запроса
let _getMeInflight = null;   // Promise — проброс для параллельных вызов
const GET_ME_TTL = 5000;     // ms

export async function getMe() {
  // Возвращаем кэш если он свежий
  if (_getMeCache && (Date.now() - _getMeCache.ts) < GET_ME_TTL) {
    return _getMeCache.data;
  }

  // Если запрос уже летит — подключаемся к нему без нового fetch
  if (_getMeInflight) return _getMeInflight;

  _getMeInflight = (async () => {
  const { data: raw, error } = await authGet('/users/me');
  if (error || !raw) return { data: null, error: error ?? 'no data' };

  // Считаем статистику из списка дорам.
  // Бэк не хранит прогресс по эпизодам (current_episode/total_episodes),
  // поэтому считаем только по количеству дорам с учётом статуса.
  const dramas = raw.dramas ?? [];
  const dramasWatched  = dramas.filter(d => d.watch_status === 'completed').length;
  const dramasWatching = dramas.filter(d => d.watch_status === 'watching').length;
  // Суммарные «эпизоды» = завершённые дорамы (приблизительно, без данных о кол-ве серий)
  // Засчитываем и те, что смотрим сейчас, чтобы цифра не была нулевой
  const totalEpisodes  = dramasWatched + dramasWatching;
  // Среднее: ~45 минут на эпизод условной «дорамы» (будет заменено когда бэк отдаст реальный прогресс)
  const totalHours = Math.round(totalEpisodes * 45 / 60);

  // Группировка по странам
  const countryMap = {};
  for (const d of dramas) {
    const c = d.country || 'unknown';
    countryMap[c] = (countryMap[c] ?? 0) + 1;
  }
  const total = dramas.length || 1;
  // Бэк хранит страну как полное название на английском: 'Korea', 'China', 'Japan'
  const COUNTRY_META = {
    Korea:   { flag: '🇰🇷', name: 'Корея',  colorClass: 'fill-korea' },
    China:   { flag: '🇨🇳', name: 'Китай',  colorClass: 'fill-china' },
    Japan:   { flag: '🇯🇵', name: 'Япония', colorClass: 'fill-japan' },
    // Страховка на случай если бэк вернёт другой регистр или вариант
    korea:   { flag: '🇰🇷', name: 'Корея',  colorClass: 'fill-korea' },
    china:   { flag: '🇨🇳', name: 'Китай',  colorClass: 'fill-china' },
    japan:   { flag: '🇯🇵', name: 'Япония', colorClass: 'fill-japan' },
  };
  const countries = Object.entries(countryMap)
    .map(([country, count]) => {
      const meta = COUNTRY_META[country] ?? { flag: '🌏', name: country, colorClass: 'fill-korea' };
      return { code: country.toLowerCase().slice(0, 2), flag: meta.flag, name: meta.name, count, percent: Math.round(count / total * 100), colorClass: meta.colorClass };
    })
    .sort((a, b) => b.count - a.count);

  // Бэйджи
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

  // Добавляем заблокированные бэйджи-ориентиры, которых ещё нет у пользователя
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
      totalHours,
      milestone: 'Drama Queen',
    },
    badges,
    countries: countries.length ? countries : MOCK_USER.countries,
    // Сырые дорамы для getDramas()
    _rawDramas: dramas,
  };

    const result = { data: adapted, error: null };
    // Сохраняем в кэш
    _getMeCache = { data: result, ts: Date.now() };
    return result;
  })();

  // После завершения (успех или ошибка) сбрасываем inflight-промис
  _getMeInflight.finally(() => { _getMeInflight = null; });

  return _getMeInflight;
}

/**
 * Получить состояние авторизации.
 *
 * Если в localStorage есть токен + user — считаем залогиненным
 * и подтягиваем актуальные данные через getMe().
 * При ошибке getMe — очищаем сессию.
 */
export async function getAuthState() {
  const token = localStorage.getItem('hanbin_token');
  if (!token) return { data: { isLoggedIn: false, user: null }, error: null };

  try {
    const { data: user, error } = await getMe();

    if (user) {
      // Успешно получили данные с бэка
      return { data: { isLoggedIn: true, user }, error: null };
    }

    // Различаем: сетевая ошибка (бэк не запущен) vs 401 (невалидный токен)
    const isNetworkError = error?.includes('подключиться') || error?.includes('connect') || error === 'no data';

    if (isNetworkError) {
      // Бэк недоступен — не сбрасываем сессию, используем данные из localStorage
      const raw = localStorage.getItem('hanbin_user');
      const cached = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
      if (cached) {
        // Отдаём кэшированные данные — пользователь остаётся залогиненным
        const fallbackUser = {
          ...MOCK_USER,
          id:   cached.id   ?? MOCK_USER.id,
          name: cached.name ?? MOCK_USER.name,
          email: cached.email ?? '',
        };
        return { data: { isLoggedIn: true, user: fallbackUser }, error: null };
      }
    }

    // 401 или другая настоящая ошибка авторизации — сбрасываем сессию
    localStorage.removeItem('hanbin_token');
    localStorage.removeItem('hanbin_user');
    return { data: { isLoggedIn: false, user: null }, error: null };

  } catch {
    // Неожиданное исключение — не сбрасываем, чтобы не выкидывать пользователя зря
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
 * Инвалидирует кэш данных пользователя:
 * эмитит событие 'hanbin:data-changed' — компоненты (Home, StatsBlock, Sidebar)
 * подписываются на него и перезапрашивают данные с бэка.
 * Вызывается после addDrama, updateDrama и т.д.
 */
export function invalidateUserCache() {
  // Сбрасываем оба кэша — результат и in-flight промис.
  // Следующий вызов getMe гарантированно пойдёт на GET /users/me.
  _getMeCache = null;
  _getMeInflight = null;
  window.dispatchEvent(new CustomEvent('hanbin:data-changed'));
}
