/**
 * HANBIN — Cancel Subscription Modal
 *
 * Флоу отмены подписки (ветка feature/payments) — три шага внутри одного модального окна,
 * с теми же переходами/оверлеем, что и логин/регистрация (см. LoginModal.js → openModal/transitionModalContent):
 *
 *  1. «confirm» — честно показываем, что человек теряет (фичи текущего тарифа), и предупреждаем точными числами (сколько
 *     дорам/фильмов останется, сколько будет удалено) о сокращении библиотеки до лимита Free —
 *     разбивка по категориям через getLibraryBreakdown() подгружается прогрессивно, не блокируя
 *     открытие модалки. Если всё и так влезает в лимит — вместо тревожного предупреждения — спокойная
 *     фраза «ничего не потеряется». Для Pro дополнительно предлагаем
 *     мягкую альтернативу — даунгрейд до Plus вместо полной отмены.
 *  2. «reason» — необязательный опрос «почему уходишь» с чипами (переиспользует .filter-chip
 *     из app.js), можно пропустить.
 *  3. «success» — тёплое подтверждение: дата, до которой сохраняется доступ (подписка не
 *     пропадает мгновенно — см. scheduleCancellation в api/mock.js), титул, на который упадём
 *     дальше, и цитата в тон бренда. Отменить решение можно отдельно — кнопка «Отменить отмену»
 *     живёт прямо на карточке тарифа в Profile.js (не дублируем её здесь — решение уже принято).
 *
 * Ничего не бьёт по реальному бэку — plan там всё ещё не хранится (см. TEST_PLAN_OVERRIDES
 * в api/mock.js), весь стейт отмены живёт в localStorage через scheduleCancellation/undoCancellation.
 */

import { t, getLang } from '../i18n/index.js';
import { getRoyalTitleKey } from '../utils/royalTitle.js';
import { getPlanById, PLAN_LIBRARY_LIMITS } from '../data/subscriptionPlans.js';
import { getLibraryBreakdown, scheduleCancellation } from '../api/mock.js';
import { openModal, closeModal, transitionModalContent } from './LoginModal.js';

const REASON_OPTIONS = [
  { id: 'expensive',   labelKey: 'modal.cancel.reason_expensive' },
  { id: 'unused',      labelKey: 'modal.cancel.reason_unused' },
  { id: 'alternative', labelKey: 'modal.cancel.reason_alternative' },
  { id: 'other',       labelKey: 'modal.cancel.reason_other' },
];

// ─── CSS (доп. к базовому MODAL_CSS из LoginModal.js — инжектится вместе с ним через openModal) ───
const CANCEL_MODAL_CSS = `
  .hb-cancel-lose {
    list-style: none; margin: 0 0 18px; padding: 0;
    display: flex; flex-direction: column; gap: 8px;
  }
  .hb-cancel-lose__item {
    font-size: 13px; color: rgba(245,230,211,0.7); line-height: 1.4;
    padding-left: 18px; position: relative;
  }
  .hb-cancel-lose__item::before {
    content: '−'; position: absolute; left: 0; color: #ff9db0; font-weight: 600;
  }

  .hb-cancel-library--loading { font-size: 12px; color: rgba(245,230,211,0.35); margin-bottom: 14px; }

  .hb-cancel-warning {
    background: rgba(255,107,138,0.08); border: 1px solid rgba(255,107,138,0.25);
    border-radius: 12px; padding: 12px 14px; margin-bottom: 18px;
    font-size: 12.5px; line-height: 1.5; color: rgba(245,230,211,0.85);
  }

  .hb-cancel-safe {
    background: rgba(122,171,142,0.08); border: 1px solid rgba(122,171,142,0.2);
    border-radius: 12px; padding: 12px 14px; margin-bottom: 18px;
    font-size: 12.5px; line-height: 1.5; color: rgba(245,230,211,0.75);
  }

  .hb-cancel-downgrade {
    background: rgba(122,171,142,0.08); border: 1px solid rgba(122,171,142,0.25);
    border-radius: 14px; padding: 16px 18px; margin-bottom: 18px;
  }
  .hb-cancel-downgrade__title { font-family: 'Cormorant Garamond', serif; font-size: 17px; color: #f5e6d3; margin-bottom: 4px; }
  .hb-cancel-downgrade__sub { font-size: 12px; color: rgba(245,230,211,0.55); margin-bottom: 12px; line-height: 1.4; }

  .hb-cancel-reasons { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 24px; }

  .hb-cancel-quote {
    font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 16px;
    line-height: 1.5; color: #f5e6d3; text-align: center;
    padding: 18px 16px; margin: 4px 0 22px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(201,123,138,0.2); border-radius: 14px;
  }
`;

function injectCancelModalCSS() {
  if (document.getElementById('hb-cancel-modal-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-cancel-modal-css';
  style.textContent = CANCEL_MODAL_CSS;
  document.head.appendChild(style);
}

/** Дата в человекочитаемом виде под текущий язык — «14 сентября» / «September 14». Экспортируется, Profile.js использует её же для карточки «Отменяется». */
export function formatCancelDate(iso) {
  const date = new Date(iso);
  return date.toLocaleDateString(getLang() === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long' });
}

/** Плавный enter-переход — та же минимальная копия логики, что и в ForgotPasswordModal.js. */
function animateEnter(content, enterClass) {
  if (!enterClass) return;
  content.classList.add(enterClass);
  const enterAnim = enterClass === 'hb-enter-right' ? 'hb-enterRight' : 'hb-enterLeft';
  const onEnterEnd = (e) => {
    if (e.animationName !== enterAnim) return;
    content.classList.remove(enterClass);
    content.removeEventListener('animationend', onEnterEnd);
  };
  content.addEventListener('animationend', onEnterEnd);
  setTimeout(() => {
    content.classList.remove(enterClass);
    content.removeEventListener('animationend', onEnterEnd);
  }, 500);
}

// ─── Шаг 1 — подтверждение ────────────────────
function buildLibraryWarningHTML(breakdown, totalLimit) {
  const perCategoryLimit = Math.floor(totalLimit / 2);
  const dramaExcess = Math.max(0, breakdown.dramas - perCategoryLimit);
  const movieExcess = Math.max(0, breakdown.movies - perCategoryLimit);

  if (dramaExcess <= 0 && movieExcess <= 0) {
    return `<div class="hb-cancel-safe">${t('modal.cancel.library_safe', { limit: totalLimit })}</div>`;
  }

  const keptDramas = Math.min(breakdown.dramas, perCategoryLimit);
  const keptMovies = Math.min(breakdown.movies, perCategoryLimit);

  return `<div class="hb-cancel-warning">${t('modal.cancel.library_warning', {
    movies: breakdown.movies, dramas: breakdown.dramas, keptMovies, keptDramas,
  })}</div>`;
}

function confirmStepHTML(state) {
  const planData = getPlanById(state.plan);
  const title = t(getRoyalTitleKey(state.plan, state.honorific));

  const loseItems = planData.featureKeys.map(k => `<li class="hb-cancel-lose__item">${t(k)}</li>`).join('');

  const libraryLine = state.libraryBreakdown == null
    ? `<div class="hb-cancel-library--loading">${t('loading')}</div>`
    : buildLibraryWarningHTML(state.libraryBreakdown, PLAN_LIBRARY_LIMITS.free);

  const plusTitle = t(getRoyalTitleKey('plus', state.honorific));
  const downgradeBlock = state.plan === 'pro' ? `
    <div class="hb-cancel-downgrade">
      <div class="hb-cancel-downgrade__title">${t('modal.cancel.downgrade_title')}</div>
      <div class="hb-cancel-downgrade__sub">${t('modal.cancel.downgrade_sub', { title: plusTitle })}</div>
      <button type="button" class="hb-btn-secondary" id="hb-cancel-btn-downgrade">${t('modal.cancel.btn_downgrade', { title: plusTitle })}</button>
    </div>
  ` : '';

  return `
    <div class="hb-modal-title">${t('modal.cancel.title', { title })}</div>
    <div class="hb-modal-sub" style="text-transform:none;letter-spacing:0.01em;font-size:13px;line-height:1.5;margin-bottom:14px;">${t('modal.cancel.lose_intro')}</div>
    <ul class="hb-cancel-lose">${loseItems}</ul>
    <div id="hb-cancel-library-slot">${libraryLine}</div>
    ${downgradeBlock}
    <button type="button" class="hb-btn-primary" id="hb-cancel-btn-full">${t('modal.cancel.btn_cancel_full')}</button>
    <button type="button" class="hb-btn-secondary" id="hb-cancel-btn-keep" style="margin-top:10px">${t('modal.cancel.btn_keep')}</button>
  `;
}

function mountConfirmStep(content, enterClass, state, callbacks) {
  document.getElementById('hb-modal-box')?.setAttribute('data-screen', 'cancel-confirm');
  content.innerHTML = confirmStepHTML(state);
  animateEnter(content, enterClass);

  // Прогрессивно догружаем разбивку библиотеки по категориям — не блокируем открытие модалки ожиданием сети.
  if (state.libraryBreakdown == null) {
    getLibraryBreakdown().then(({ data }) => {
      state.libraryBreakdown = data;
      const slot = document.getElementById('hb-cancel-library-slot');
      if (slot) slot.innerHTML = buildLibraryWarningHTML(data, PLAN_LIBRARY_LIMITS.free);
    });
  }

  document.getElementById('hb-cancel-btn-keep').addEventListener('click', closeModal);

  document.getElementById('hb-cancel-btn-full').addEventListener('click', () => {
    state.chosenAction = 'cancel';
    transitionModalContent('left', (el, cls) => mountReasonStep(el, cls, state, callbacks));
  });

  document.getElementById('hb-cancel-btn-downgrade')?.addEventListener('click', () => {
    state.chosenAction = 'downgrade';
    transitionModalContent('left', (el, cls) => mountReasonStep(el, cls, state, callbacks));
  });
}

// ─── Шаг 2 — необязательная причина ───────────
function reasonStepHTML(state) {
  const regretKey = state.honorific === 'lord' ? 'modal.cancel.btn_regret_lord' : 'modal.cancel.btn_regret_lady';
  return `
    <div class="hb-modal-title">${t('modal.cancel.reason_title')}</div>
    <div class="hb-modal-sub" style="text-transform:none;font-size:12.5px;letter-spacing:0.01em;margin-bottom:18px;">${t('modal.cancel.reason_sub')}</div>
    <div class="hb-cancel-reasons">
      ${REASON_OPTIONS.map(r => `<button type="button" class="filter-chip" data-reason="${r.id}">${t(r.labelKey)}</button>`).join('')}
    </div>
    <button type="button" class="hb-btn-primary" id="hb-cancel-btn-confirm">${t('modal.cancel.btn_confirm')}</button>
    <button type="button" class="hb-btn-secondary" id="hb-cancel-btn-regret" style="margin-top:10px">${t(regretKey)}</button>
  `;
}

function mountReasonStep(content, enterClass, state, callbacks) {
  document.getElementById('hb-modal-box')?.setAttribute('data-screen', 'cancel-reason');
  content.innerHTML = reasonStepHTML(state);
  animateEnter(content, enterClass);

  content.querySelectorAll('[data-reason]').forEach(chip => {
    chip.addEventListener('click', () => {
      content.querySelectorAll('[data-reason]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.reason = chip.dataset.reason;
    });
  });

  // «Я передумала» — не просто пропуск ввода причины, а полный отказ от отмены — просто закрываем модалку,
  // ничего не планируем (пропустить причину и всё равно отменить теперь можно просто не выбирая чип и нажав «Подтвердить»).
  document.getElementById('hb-cancel-btn-regret').addEventListener('click', closeModal);

  document.getElementById('hb-cancel-btn-confirm').addEventListener('click', () => finalizeCancellation(content, state, callbacks));
}

async function finalizeCancellation(content, state, callbacks) {
  const targetPlan = state.chosenAction === 'downgrade' ? 'plus' : 'free';
  const { data } = await scheduleCancellation({ fromPlan: state.plan, targetPlan, reason: state.reason });
  state.effectiveAt = data.effectiveAt;
  callbacks.onScheduled?.();
  transitionModalContent('left', (el, cls) => mountSuccessStep(el, cls, state, callbacks));
}

// ─── Шаг 3 — тёплое подтверждение ─────────────
function successStepHTML(state) {
  const fromTitle = t(getRoyalTitleKey(state.plan, state.honorific));
  const targetPlan = state.chosenAction === 'downgrade' ? 'plus' : 'free';
  const targetTitle = t(getRoyalTitleKey(targetPlan, state.honorific));
  const dateStr = formatCancelDate(state.effectiveAt);
  const quoteKey = state.honorific === 'lord' ? 'modal.cancel.quote_lord' : 'modal.cancel.quote_lady';

  return `
    <div class="hb-modal-title">${t('modal.cancel.success_title')}</div>
    <div class="hb-modal-sub" style="text-transform:none;font-size:13px;letter-spacing:0.01em;line-height:1.5;margin-bottom:18px;">${t('modal.cancel.success_sub', { title: fromTitle, date: dateStr, targetTitle })}</div>
    <div class="hb-cancel-quote">${t(quoteKey)}</div>
    <button type="button" class="hb-btn-primary" id="hb-cancel-btn-close">${t('modal.cancel.btn_close')}</button>
  `;
}

function mountSuccessStep(content, enterClass, state, callbacks) {
  document.getElementById('hb-modal-box')?.setAttribute('data-screen', 'cancel-success');
  content.innerHTML = successStepHTML(state);
  animateEnter(content, enterClass);

  document.getElementById('hb-cancel-btn-close').addEventListener('click', closeModal);
}

/**
 * Открывает флоу отмены подписки.
 * @param {{ plan: string, honorific: string, onScheduled?: () => void }} params
 *   plan — тариф, который отменяем ('plus'|'pro'), honorific — 'lord'|'lady' для титулов в тексте,
 *   onScheduled — вызывается после того, как модалка запланировала отмену/даунгрейд —
 *   Profile.js должен перечитать getCancellation() и перерисовать карточки тарифов.
 */
export function openCancelSubscriptionModal({ plan, honorific, onScheduled }) {
  injectCancelModalCSS();
  const state = { plan, honorific, libraryBreakdown: null, chosenAction: null, reason: null, effectiveAt: null };
  const callbacks = { onScheduled };
  openModal((content, enterClass) => mountConfirmStep(content, enterClass, state, callbacks));
}
