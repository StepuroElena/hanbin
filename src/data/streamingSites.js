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
 */

export const DEFAULT_STREAMING_SITES = [
  { id: 'default-1',  name: 'DoramaTV',     url: 'https://m.doramatv.one',  language: 'ru' },
  { id: 'default-2',  name: 'Dorama.land',  url: 'https://dorama.land',     language: 'ru' },
  { id: 'default-3',  name: 'Doramy.club',  url: 'https://doramy.club',     language: 'ru' },
  { id: 'default-4',  name: 'Doramy.info',  url: 'https://doramy.info',     language: 'ru' },
  { id: 'default-5',  name: 'Doramiru',     url: 'https://doram-ru.org',    language: 'ru' },
  { id: 'default-6',  name: 'Dorama24',     url: 'https://dorama24.su',     language: 'ru' },
  { id: 'default-7',  name: 'Rakuten Viki', url: 'https://viki.com',        language: 'en' },
  { id: 'default-8',  name: 'Netflix',      url: 'https://netflix.com',     language: 'multi' },
  { id: 'default-9',  name: 'iQiyi',        url: 'https://iq.com',          language: 'multi' },
  { id: 'default-10', name: 'MyDramaList',  url: 'https://mydramalist.com', language: 'en' },
];
