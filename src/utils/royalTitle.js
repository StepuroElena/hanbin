/**
 * HANBIN — Royal Title Helper
 *
 * Единая логика сопоставления тарифа ('free'|'plus'|'pro') + обращения ('lord'|'lady') → i18n-ключ
 * королевского титула (Барон/Герцог/Король и т.д.). Используется и в Profile.js (карточки тарифов),
 * и в Header.js (корона на аватаре + строка статуса в дропдауне) — чтобы маппинг не расходился между ними.
 *
 * Сами тексты титулов лежат в i18n (profile.subscription.{plan}.name_lord/name_lady) — здесь только
 * маппинг plan → ключ, без хардкода строк.
 */

const TITLE_KEYS = {
  free: { lord: 'profile.subscription.free.name_lord', lady: 'profile.subscription.free.name_lady' },
  plus: { lord: 'profile.subscription.plus.name_lord', lady: 'profile.subscription.plus.name_lady' },
  pro:  { lord: 'profile.subscription.pro.name_lord',  lady: 'profile.subscription.pro.name_lady' },
};

/**
 * @param {string} plan — 'free' | 'plus' | 'pro', неизвестное значение падает обратно на 'free'
 * @param {string} honorific — 'lord' | 'lady', неизвестное значение падает обратно на 'lady'
 * @returns {string} i18n-ключ титула, передать в t()
 */
export function getRoyalTitleKey(plan, honorific) {
  const entry = TITLE_KEYS[plan] || TITLE_KEYS.free;
  return honorific === 'lord' ? entry.lord : entry.lady;
}
