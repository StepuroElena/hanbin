/**
 * HANBIN — Subscription Plans Data
 *
 * Общее описание тарифов — вынесено из Profile.js в отдельный модуль, чтобы им мог пользоваться
 * и CancelSubscriptionModal.js (нужны названия/фичи тарифа, который человек теряет при отмене),
 * без дублирования списка в двух местах.
 *
 * Названия тарифов — королевские титулы, зависят от обращения (nameKeyLord/nameKeyLady) — см. Profile.js.
 * priceUsd — базовая цена в долларах/мес. Разрыв Plus→Pro (1.5→$5, почти x3.3) намеренно больше,
 * чем разрыв Free→Plus — classic decoy effect, чтобы средний тариф выглядел «золотой серединой».
 */

export const SUBSCRIPTION_PLANS = [
  { id: 'free', nameKeyLord: 'profile.subscription.free.name_lord', nameKeyLady: 'profile.subscription.free.name_lady', ctaKeyLord: 'profile.subscription.free.cta_lord', ctaKeyLady: 'profile.subscription.free.cta_lady', priceUsd: 0, featureKeys: ['profile.subscription.free.f1', 'profile.subscription.free.f2', 'profile.subscription.free.f3'] },
  { id: 'plus', nameKeyLord: 'profile.subscription.plus.name_lord', nameKeyLady: 'profile.subscription.plus.name_lady', ctaKeyLord: 'profile.subscription.plus.cta_lord', ctaKeyLady: 'profile.subscription.plus.cta_lady', priceUsd: 1.5, featureKeys: ['profile.subscription.plus.f1', 'profile.subscription.plus.f2'], popular: true },
  { id: 'pro',  nameKeyLord: 'profile.subscription.pro.name_lord',  nameKeyLady: 'profile.subscription.pro.name_lady',  ctaKeyLord: 'profile.subscription.pro.cta_lord',  ctaKeyLady: 'profile.subscription.pro.cta_lady',  priceUsd: 4, priceRub: 300, featureKeys: ['profile.subscription.pro.f1'] },
];

/** Лимит записей в библиотеке (дорамы+фильмы) на каждом тарифе — совпадает с featureKeys выше (f1 free/plus). */
export const PLAN_LIBRARY_LIMITS = { free: 20, plus: 100, pro: Infinity };

/** Порядок тарифов от младшего к старшему — используется, чтобы найти «на ступень ниже» при мягком даунгрейде. */
export const PLAN_ORDER = ['free', 'plus', 'pro'];

export function getPlanById(id) {
  return SUBSCRIPTION_PLANS.find(p => p.id === id) ?? SUBSCRIPTION_PLANS[0];
}
