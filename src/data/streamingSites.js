/**
 * HANBIN — Streaming Sites (fallback defaults)
 *
 * Раньше это был единственный источник правды (STREAMING_SITES, захардкожен
 * одинаковым для всех пользователей). Теперь список персональный и хранится в БД —
 * см. GET /api/v1/streaming-sites (mock.js: getStreamingSites()).
 *
 * Этот файл остаётся только как:
 *  — дефолтный набор, с которым бэк засевает нового пользователя (тот же список,
 *    что и internal/service/streamingsite/streamingsite.service.go:defaultSites на бэке);
 *  — мгновенный фоллбэк на фронте, пока реальный список ещё не загрузился с бэка,
 *    и для гостей (не залогинен — бэка для них нет).
 *
 * enabled: true у всех по умолчанию — совпадает с бэком (DEFAULT true в БД).
 */

export const DEFAULT_STREAMING_SITES = [
  { id: 'default-1',  name: 'DoramaTV',     url: 'https://m.doramatv.one',  language: 'ru',    enabled: true },
  { id: 'default-2',  name: 'Dorama.land',  url: 'https://dorama.land',     language: 'ru',    enabled: true },
  { id: 'default-3',  name: 'Doramy.club',  url: 'https://doramy.club',     language: 'ru',    enabled: true },
  { id: 'default-4',  name: 'Doramy.info',  url: 'https://doramy.info',     language: 'ru',    enabled: true },
  { id: 'default-5',  name: 'Doramiru',     url: 'https://doram-ru.org',    language: 'ru',    enabled: true },
  { id: 'default-6',  name: 'Rakuten Viki', url: 'https://viki.com',        language: 'en',    enabled: true },
  { id: 'default-7',  name: 'Netflix',      url: 'https://netflix.com',     language: 'multi', enabled: true },
  { id: 'default-8',  name: 'iQiyi',        url: 'https://iq.com',          language: 'multi', enabled: true },
  { id: 'default-9',  name: 'MyDramaList',  url: 'https://mydramalist.com', language: 'en',    enabled: true },
];
