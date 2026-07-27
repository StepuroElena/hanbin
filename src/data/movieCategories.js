/**
 * HANBIN — Movie Categories (fallback defaults)
 *
 * Персональный список коротких тегов/категорий фильма (напр. «Для вечера», «Атмосферное»),
 * которые можно выбрать в дропдауне при добавлении фильма — редактируется на странице
 * настроек, свой набор для каждого профиля. См. GET /api/v1/movie-categories (mock.js:
 * getMovieCategories()).
 *
 * Этот файл — тот же паттерн, что и data/streamingSites.js:
 *  — дефолтный набор, с которым бэк засевает нового пользователя (тот же список, что и
 *    internal/service/moviecategory/moviecategory.service.go:defaultCategories на бэке);
 *  — мгновенный фоллбэк на фронте, пока реальный список ещё не загрузился с бэка,
 *    и для гостей (не залогинен — бэка для них нет).
 *
 * enabled: true у всех по умолчанию — совпадает с бэком (DEFAULT true в БД).
 */

export const DEFAULT_MOVIE_CATEGORIES = [
  { id: 'default-1', name: 'Для вечера',            enabled: true },
  { id: 'default-2', name: 'С попкорном',           enabled: true },
  { id: 'default-3', name: 'Атмосферное',           enabled: true },
  { id: 'default-4', name: 'Экранизация',           enabled: true },
  { id: 'default-5', name: 'Культовое',             enabled: true },
  { id: 'default-6', name: 'Заставляет задуматься', enabled: true },
  { id: 'default-7', name: 'Хочется поплакать',     enabled: true },
  { id: 'default-8', name: 'Пересматриваю',         enabled: true },
];
