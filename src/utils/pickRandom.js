/**
 * HANBIN — Random Picker: чистая логика подбора
 *
 * Объединяет дорамы и фильмы в единый нормализованный пул и выбирает случайный
 * тайтл с учётом фильтров (тип / жанр) и защитой от повтора при "Ещё раз".
 */

// Дорамы используют код 'plan', фильмы — 'planned'. Нормализуем к единому виду для отображения.
function normalizeStatus(status) {
  return status === 'planned' ? 'plan' : status;
}

/**
 * @param {Array} rawDramas - результат getDramas() (уже адаптированные объекты)
 * @returns {Array}
 */
export function normalizeDramas(rawDramas) {
  return rawDramas.map((d) => ({
    id: d.id,
    kind: 'drama',
    title: d.title,
    year: d.year,
    genres: d.genres || [],
    country: d.country || null,
    status: normalizeStatus(d.status),
    rawStatus: d.status, // как есть, для вызова updateDramaStatus
    cover: d.cover || null,
    watchUrl: d.watchUrl || null,
    rating: d.rating ?? null,
    episodesWatched: d.episodesWatched ?? null,
    episodesTotal: d.episodesTotal ?? null,
    episodeDurationMin: d.episodeDurationMin ?? null,
    seasons: d.seasons ?? null,
  }));
}

/**
 * @param {Array} rawMovies - результат getMovies()
 * @returns {Array}
 */
export function normalizeMovies(rawMovies) {
  return rawMovies.map((m) => ({
    id: m.id,
    kind: 'movie',
    title: m.title,
    year: m.year,
    genres: m.genre ? [m.genre] : [],
    country: m.country || null,
    status: normalizeStatus(m.status),
    rawStatus: m.status,
    cover: null,
    watchUrl: null,
    rating: null,
    episodesWatched: null,
    episodesTotal: null,
  }));
}

/**
 * @param {Array} pool - объединённый нормализованный пул (дорамы + фильмы)
 * @param {Object} filters
 * @param {'any'|'movie'|'series'} filters.type
 * @param {string|null} filters.genre - null = случайный жанр (не фильтруем)
 * @param {string|null} lastPickedId - id предыдущего результата, чтобы не повторяться при "Ещё раз"
 * @returns {Object|null}
 */
export function pickRandom(pool, filters = {}, lastPickedId = null) {
  const { type = 'any', genre = null } = filters;

  // Рандомить можно только из "Запланировано" — цель фичи именно выбрать из того, что ещё
  // не начато, а не предложить пересмотреть то, что уже смотрится/просмотрено/брошено.
  let candidates = pool.filter((item) => item.status === 'plan');

  if (type === 'movie') candidates = candidates.filter((item) => item.kind === 'movie');
  if (type === 'series') candidates = candidates.filter((item) => item.kind === 'drama');

  if (genre) {
    candidates = candidates.filter((item) => item.genres.includes(genre));
  }

  if (candidates.length === 0) return null;

  if (candidates.length > 1 && lastPickedId) {
    const withoutLast = candidates.filter((item) => item.id !== lastPickedId);
    if (withoutLast.length > 0) candidates = withoutLast;
  }

  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}

/**
 * Жанры, реально присутствующие в объединённом пуле — чтобы не показывать
 * пустые чипы в модалке. Учитывает текущий тип — жанры фильма и дорамы
 * не смешиваются, если выбран конкретный тип, и объединяются без дублей при "Неважно".
 *
 * TODO(backend): когда будет реальный эндпоинт для рандома — эта фильтрация должна уехать туда,
 * например GET /api/v1/random/facets?type=movie|series|any — фронт не должен сам решать,
 * какие жанры показывать — это бизнес-логика, временно живёт здесь только потому, что
 * бэк ещё не отдаёт готовый список.
 *
 * @param {Array} pool
 * @param {'any'|'movie'|'series'} [type]
 * @returns {string[]}
 */
export function getAvailableGenres(pool, type = 'any') {
  let scoped = pool.filter((item) => item.status === 'plan'); // те же кандидаты, что и в pickRandom
  if (type === 'movie') scoped = scoped.filter((item) => item.kind === 'movie');
  if (type === 'series') scoped = scoped.filter((item) => item.kind === 'drama');
  return [...new Set(scoped.flatMap((item) => item.genres))].sort();
}
