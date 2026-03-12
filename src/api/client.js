/**
 * HANBIN — API Client
 * Реальные вызовы к бэкенду.
 * Импортируется из mock.js для функций, которые уже переключены на бэк.
 *
 * BASE_URL берётся из window.HANBIN_API_BASE (можно переопределить в index.html)
 * или из дефолта localhost:8080.
 */

export const API_BASE = (typeof window !== 'undefined' && window.HANBIN_API_BASE)
  ? window.HANBIN_API_BASE
  : 'http://localhost:8080/api/v1';

/**
 * Получить JWT-токен из localStorage.
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem('hanbin_token');
}

/**
 * Авторизованный GET-запрос с Bearer-токеном.
 * @param {string} path — путь относительно API_BASE, напр. '/users/me'
 * @returns {Promise<{ data: any, error: string|null }>}
 */
export async function authGet(path) {
  const token = getToken();
  if (!token) return { data: null, error: 'not authenticated' };

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (_) { /* не JSON */ }

    if (res.status === 401) {
      // Токен протух — чистим сессию
      localStorage.removeItem('hanbin_token');
      localStorage.removeItem('hanbin_user');
      return { data: null, error: 'unauthorized' };
    }

    if (!res.ok) {
      return { data: null, error: json?.error ?? `Ошибка сервера (${res.status})` };
    }

    return { data: json, error: null };
  } catch (err) {
    console.error(`[API] GET ${path} failed:`, err);
    return {
      data: null,
      error: err instanceof TypeError
        ? 'Не удалось подключиться к серверу. Убедись, что бэк запущен на порту 8080.'
        : 'Ошибка запроса. Попробуй позже.',
    };
  }
}
