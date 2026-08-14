/**
 * HANBIN — Profile Page
 *
 * Простая страница профиля — показывает имя и email авторизованного пользователя,
 * оба поля редактируются инлайн (карандаш → инпут → Сохранить/Отмена), пишут на бэк через
 * PATCH /api/v1/profiles/{id} (см. updateProfileName/updateProfileEmail в api/mock.js).
 * Пароль на этой странице не показываем и не редактируем — отдельного безопасного
 * эндпоинта смены пароля («текущий пароль → новый») на бэке пока нет.
 *
 * Открывается через пункт «Профиль» в дропдауне аватара (Header.js → navigate('#/profile')).
 * Гостю (нет токена) показываем заглушку с призывом войти — сама страница не требует
 * авторизации для рендера, но данных показывать нечего.
 *
 * Выравнивание — как у Settings.js: .container без max-width-override, левый край совпадает
 * с логотипом в шапке. Сама карточка профиля визуально ограничена по ширине через .profile-card,
 * а не через весь контейнер (иначе «Назад»/заголовок сдвинулись бы вправо от логотипа).
 */

import { renderHeader } from '../components/Header.js';
import { navigate } from '../router.js';
import { getAuthState, updateProfileName, updateProfileEmail, getHonorific, setHonorific, getCancellation, undoCancellation } from '../api/mock.js';
import { t, onLangChange, getLang } from '../i18n/index.js';
import { showToast } from '../components/Toast.js';
import { SUBSCRIPTION_PLANS } from '../data/subscriptionPlans.js';
import { openCancelSubscriptionModal, formatCancelDate } from '../components/CancelSubscriptionModal.js';
import { getRoyalTitleKey } from '../utils/royalTitle.js';

// Приблизительный курс USD→RUB для отображения цен на русском языке — без привязки к реальному платёжному
// провайдеру (ветка feature/payments только начата) — когда подключим оплату, цены для RU будут приходить с бэка.
const USD_TO_RUB = 80;

// Форматирует цену тарифа под текущий язык: RU — в рублях (priceRub, если задан явно в данных — иначе округлённо по USD_TO_RUB),
// иначе — в долларах как есть. priceRub позволяет задать «красивую» цену вместо автоконвертации (см. Pro в data/subscriptionPlans.js — 300₽ вместо расчётных 400₽).
function formatPlanPrice(plan) {
  if (getLang() === 'ru') {
    const rub = plan.priceRub ?? Math.round(plan.priceUsd * USD_TO_RUB);
    return `${rub} ₽`;
  }
  return `$${plan.priceUsd}`;
}

// Цена в пересчёте на день (/30) — снижает субъективное ощущение «дорого» и попутно подчёркивает,
// насколько больше Pro стоит по сравнению с Plus в пересчёте на день.
function formatDailyPrice(plan) {
  if (getLang() === 'ru') {
    const rub = plan.priceRub ?? Math.round(plan.priceUsd * USD_TO_RUB);
    return t('profile.subscription.per_day', { amount: `${Math.round(rub / 30)} ₽` });
  }
  const dollars = (plan.priceUsd / 30).toFixed(2);
  return t('profile.subscription.per_day', { amount: `$${dollars}` });
}

// Тарифные планы — теперь общий модуль data/subscriptionPlans.js (нужен и тут, и в CancelSubscriptionModal.js, чтобы
// не дублировать список фич в двух местах). Кнопка «Стать ...» пока ничего не оплачивает
// и ничего не сохраняет на бэке — показывает тост-заглушку.

const PROFILE_CSS = `
  .profile-page { animation: fadeUp 0.5s ease both; }

  .profile-back {
    display: inline-flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer;
    color: rgba(245,230,211,0.45); font-family: var(--font-body);
    font-size: 12px; letter-spacing: 0.05em; padding: 0; margin-bottom: 22px;
    transition: var(--transition-fast);
  }
  .profile-back:hover { color: var(--color-rose); }

  .profile-header { margin-bottom: 36px; }
  .profile-header__title {
    font-family: var(--font-display); font-size: 34px; font-weight: 300;
    color: var(--color-text); margin-bottom: 6px; letter-spacing: -0.01em;
  }
  .profile-header__sub { font-size: 13px; color: var(--color-text-muted); }

  .profile-card {
    display: flex; align-items: center; gap: 24px;
    padding: 32px; border-radius: 20px;
    max-width: 640px;
  }

  .profile-avatar {
    width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--color-rose), var(--color-plum));
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 24px; font-weight: 500;
    color: var(--color-text); border: 2px solid rgba(201,123,138,0.4);
  }

  .profile-fields { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 18px; }
  .profile-field__label {
    font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--color-text-muted); margin-bottom: 6px;
  }
  .profile-field__value {
    font-family: var(--font-display); font-size: 19px; color: var(--color-text);
    word-break: break-word;
  }
  .profile-field__value--empty { color: var(--color-text-muted); font-style: italic; font-size: 15px; }

  /* ── Редактируемое поле (имя, email) ── */
  .profile-field__row { display: flex; align-items: center; gap: 8px; }
  .profile-field__edit-btn {
    flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; color: rgba(245,230,211,0.35);
    cursor: pointer; transition: var(--transition-fast);
  }
  .profile-field__edit-btn:hover { background: var(--color-accent-glow); color: var(--color-rose); }

  .profile-field__edit-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .profile-field__input {
    flex: 1; min-width: 160px; padding: 8px 12px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(232,196,184,0.25);
    border-radius: 10px; color: var(--color-text); font-family: var(--font-body);
    font-size: 15px; transition: var(--transition-fast);
  }
  .profile-field__input:focus { outline: none; border-color: var(--color-rose); }
  .profile-field__save-btn, .profile-field__cancel-btn {
    padding: 7px 14px; border-radius: 20px; font-family: var(--font-body);
    font-size: 12px; cursor: pointer; transition: var(--transition-fast); white-space: nowrap;
  }
  .profile-field__save-btn {
    border: 1px solid rgba(201,123,138,0.45); background: rgba(201,123,138,0.15); color: var(--color-text);
  }
  .profile-field__save-btn:hover { background: rgba(201,123,138,0.28); }
  .profile-field__save-btn:disabled { opacity: 0.6; cursor: default; }
  .profile-field__cancel-btn { border: 1px solid var(--color-border); background: none; color: var(--color-text-muted); }
  .profile-field__cancel-btn:hover { color: var(--color-text); border-color: rgba(232,196,184,0.3); }
  .profile-field__error { font-size: 11px; color: #ff9db0; margin-top: 6px; min-height: 14px; }

  .profile-guest { padding: 40px; text-align: center; border-radius: 20px; max-width: 640px; }
  .profile-guest__icon { font-size: 40px; margin-bottom: 14px; }
  .profile-guest__text { color: var(--color-text-muted); font-size: 14px; margin-bottom: 20px; }
  .profile-guest__btn {
    display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px;
    background: linear-gradient(135deg, var(--color-rose), #a35f6e);
    border: none; border-radius: 40px; color: #fff;
    font-family: var(--font-body); font-size: 13px; font-weight: 500;
    letter-spacing: 0.06em; cursor: pointer; transition: var(--transition-normal);
  }
  .profile-guest__btn:hover { transform: translateY(-2px); }

  /* ── Honorific ── */
  .profile-honorific { margin-top: 32px; }
  .profile-honorific__label {
    font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--color-text-muted); margin-bottom: 10px;
  }
  .honorific-toggle { display: flex; gap: 8px; }

  /* ── Subscription ── */
  .profile-subscription { margin-top: 40px; }
  .profile-subscription__title {
    font-family: var(--font-display); font-size: 24px; font-weight: 400;
    color: var(--color-text); margin-bottom: 4px;
  }
  .profile-subscription__sub { font-size: 13px; color: var(--color-text-muted); margin-bottom: 22px; }

  .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding-top: 14px; align-items: start; }

  .plan-card {
    position: relative;
    display: flex; flex-direction: column;
    padding: 26px 22px 22px;
    border-radius: 18px;
    transition: var(--transition-normal);
  }
  .plan-card:hover { transform: translateY(-4px); }

  /* —— Популярный тариф — главный визуальный якорь на странице — физически крупнее и приподнята над остальными. —— */
  .plan-card--popular {
    border-color: rgba(201,123,138,0.6);
    background: linear-gradient(160deg, rgba(201,123,138,0.14), rgba(255,255,255,0.07));
    transform: scale(1.055);
    z-index: 2;
    box-shadow: 0 30px 70px rgba(201,123,138,0.3), 0 0 0 1px rgba(201,123,138,0.3);
  }
  .plan-card--popular:hover { transform: scale(1.075) translateY(-4px); border-color: rgba(201,123,138,0.8); }

  .plan-card--current { border-color: rgba(122,171,142,0.5); }

  /* Когда популярный тариф оказывается текущим — остаём масштаб/свечение/фон от popular, но рамка зеленеет (current выигрывает у border-color
     из-за большей специфичности двух классов вместе). */
  .plan-card--popular.plan-card--current { border-color: rgba(122,171,142,0.6); }
  .plan-card--popular.plan-card--current:hover { border-color: rgba(122,171,142,0.8); }

  .plan-card__tag {
    position: absolute; top: -11px; left: 20px;
    padding: 3px 12px; border-radius: 20px;
    font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500;
  }
  .plan-card__tag--popular {
    left: 50%; transform: translateX(-50%); white-space: nowrap;
    background: rgba(201,123,138,0.9); color: #fff;
    padding: 5px 16px; font-size: 10.5px;
    box-shadow: 0 6px 16px rgba(201,123,138,0.45);
  }
  .plan-card__tag--current { background: rgba(122,171,142,0.85); color: #fff; }
  .plan-card__tag--cancelling { background: rgba(212,165,116,0.9); color: #2d0f2a; }

  .plan-card__name {
    font-family: var(--font-display); font-size: 20px; font-weight: 400;
    color: var(--color-text); margin-bottom: 10px;
  }
  .plan-card__price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px; }
  .plan-card__price-amount { font-family: var(--font-display); font-size: 34px; font-weight: 300; color: var(--color-text); }
  .plan-card__price-period { font-size: 12px; color: var(--color-text-muted); }
  .plan-card__price-daily { font-size: 11px; color: var(--color-text-muted); margin-bottom: 20px; }

  .plan-card__features { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; flex: 1; }
  .plan-card__feature { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: rgba(245,230,211,0.75); line-height: 1.4; }
  .plan-card__feature svg { flex-shrink: 0; margin-top: 2px; color: var(--color-jade); }

  .plan-card__btn {
    width: 100%; padding: 11px; border-radius: 30px;
    font-family: var(--font-body); font-size: 13px; font-weight: 500;
    letter-spacing: 0.03em; cursor: pointer; transition: var(--transition-fast);
    border: 1px solid rgba(201,123,138,0.45);
    background: rgba(201,123,138,0.15); color: var(--color-text);
  }
  .plan-card__btn:hover { background: rgba(201,123,138,0.28); }
  .plan-card__btn--current {
    background: none; border-color: var(--color-border); color: var(--color-text-muted); cursor: default;
  }
  .plan-card__btn--current:hover { background: none; }

  .plan-card__cancel-note {
    text-align: center; font-size: 10.5px; color: var(--color-text-muted);
    margin-top: 9px; opacity: 0.75;
  }

  .plan-card__btn--cancel {
    margin-top: 8px;
    border: 1px solid var(--color-border);
    background: none; color: var(--color-text-muted);
  }
  .plan-card__btn--cancel:hover { color: var(--color-text); border-color: rgba(232,196,184,0.3); }

  .plan-card__btn--undo {
    margin-top: 8px;
    border: 1px solid rgba(122,171,142,0.45);
    background: rgba(122,171,142,0.12); color: var(--color-jade);
  }
  .plan-card__btn--undo:hover { background: rgba(122,171,142,0.22); }

  .plan-card__access-until {
    text-align: center; font-size: 10.5px; color: var(--color-text-muted);
    margin-top: 9px; opacity: 0.85;
  }

  @media (max-width: 860px) {
    .plans-grid { grid-template-columns: 1fr; }
  }

  /* Общий .loading-dots (из global.js) центрирует текст — на широких сетках (Movies/Settings) это уместно,
     но здесь всё остальное содержимое страницы прижато к левому краю — центрированный текст
     выглядит сдвинутым относительно заголовка/кнопки «Назад». Выравниваем по левому краю. */
  .profile-page .loading-dots { text-align: left; padding: 40px 0; }

  @media (max-width: 640px) {
    .profile-card { flex-direction: column; text-align: center; }
    .profile-header__title { font-size: 28px; }
  }
`;

function injectProfileCSS() {
  if (document.getElementById('hb-profile-css')) return;
  const style = document.createElement('style');
  style.id = 'hb-profile-css';
  style.textContent = PROFILE_CSS;
  document.head.appendChild(style);
}

// Разметка одного редактируемого поля — карандаш открывает инлайн-форму (см. attachEditableFieldHandlers).
function editableFieldHTML(fieldId, label, value) {
  const isEmpty = !value;
  return `
    <div class="profile-field" id="${fieldId}">
      <div class="profile-field__label">${label}</div>
      <div class="profile-field__row">
        <div class="profile-field__value ${isEmpty ? 'profile-field__value--empty' : ''}" id="${fieldId}-value">${isEmpty ? t('profile.field.empty') : value}</div>
        <button type="button" class="profile-field__edit-btn" id="${fieldId}-edit-btn" data-tooltip="${t('profile.edit_tooltip')}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

/**
 * Навешивает обработчики на карандаш редактирования одного поля (имя ИЛИ email — параметризовано).
 * user — объект auth.user, мутируется на месте при успешном сохранении, чтобы renderContent()
 * при повторном вызове (напр. после смены языка) уже видел новое значение.
 *
 * @param {HTMLElement} slot
 * @param {object} opts
 * @param {string} opts.fieldId — id обёртки поля, напр. 'profile-name-field'
 * @param {string} opts.label
 * @param {object} opts.user
 * @param {string} opts.key — ключ в user, напр. 'name' | 'email'
 * @param {string} [opts.inputType] — 'text' | 'email'
 * @param {number} [opts.maxLength]
 * @param {string} [opts.autocomplete]
 * @param {(id: string|number, value: string) => Promise<{data:any,error:string|null}>} opts.updater
 * @param {() => void} opts.renderContent — полный ре-рендер карточки (используется и как «отмена»)
 * @param {() => void} [opts.onSaved] — доп. побочный эффект после успешного сохранения (напр. обновить шапку)
 */
function attachEditableFieldHandlers(slot, { fieldId, label, user, key, inputType = 'text', maxLength, autocomplete, updater, renderContent, onSaved }) {
  const field = slot.querySelector(`#${fieldId}`);
  const editBtn = slot.querySelector(`#${fieldId}-edit-btn`);
  if (!field || !editBtn) return;

  editBtn.addEventListener('click', () => {
    const currentValue = user[key] || '';
    field.innerHTML = `
      <div class="profile-field__label">${label}</div>
      <div class="profile-field__edit-row">
        <input class="profile-field__input" id="${fieldId}-input" type="${inputType}" ${maxLength ? `maxlength="${maxLength}"` : ''} autocomplete="${autocomplete || 'off'}">
        <button type="button" class="profile-field__save-btn" id="${fieldId}-save-btn">${t('profile.save_btn')}</button>
        <button type="button" class="profile-field__cancel-btn" id="${fieldId}-cancel-btn">${t('profile.cancel_btn')}</button>
      </div>
      <div class="profile-field__error" id="${fieldId}-error"></div>
    `;

    const input = field.querySelector(`#${fieldId}-input`);
    input.value = currentValue;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    const cancel = () => renderContent();
    field.querySelector(`#${fieldId}-cancel-btn`).addEventListener('click', cancel);

    const save = async () => {
      const newValue = input.value.trim();
      const errorEl = field.querySelector(`#${fieldId}-error`);

      if (!newValue) {
        errorEl.textContent = t('profile.err_field_empty');
        return;
      }
      if (newValue === user[key]) {
        cancel();
        return;
      }

      const saveBtn = field.querySelector(`#${fieldId}-save-btn`);
      const cancelBtn = field.querySelector(`#${fieldId}-cancel-btn`);
      saveBtn.disabled = true;
      cancelBtn.disabled = true;
      saveBtn.textContent = t('profile.saving');
      errorEl.textContent = '';

      const { data, error } = await updater(user.id, newValue);

      if (error) {
        saveBtn.disabled = false;
        cancelBtn.disabled = false;
        saveBtn.textContent = t('profile.save_btn');
        errorEl.textContent = error;
        return;
      }

      user[key] = data?.[key] ?? newValue;
      renderContent();
      onSaved?.();
    };

    field.querySelector(`#${fieldId}-save-btn`).addEventListener('click', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') save();
      if (e.key === 'Escape') cancel();
    });
  });
}

// Одна карточка тарифа. currentPlan — plan текущего пользователя (auth.user.plan, дефолт 'free').
// honorific — 'lord' | 'lady' — выбирает, какой из двух титулов показать в качестве названия плана и текста кнопки («Стать Герцогом» вс. «Герцогиней»).
// cancellation — запись из getCancellation() (или null) — если она есть и её fromPlan совпадает с этой картой,
// значит именно этот тариф сейчас «на отмене» (доступ ещё активен до effectiveAt, см. CancelSubscriptionModal.js).
function planCardHTML(plan, currentPlan, honorific, cancellation) {
  const isCurrent = plan.id === currentPlan;
  const isPaid = plan.priceUsd > 0;
  const isCancelling = isCurrent && cancellation?.fromPlan === plan.id;
  // Визуальный якорь (масштаб/свечение/фон у plan-card--popular) и отметка «текущий» (зелёный бордер у plan-card--current) —
  // независимые друг от друга модификаторы, оба могут быть одновременно (если популярный тариф
  // оказался текущим — карточка всё равно остаётся крупнее и приподнятой, просто рамка зеленеет —
  // см. .plan-card--popular.plan-card--current в CSS).
  const modifiers = [plan.popular ? 'plan-card--popular' : '', isCurrent ? 'plan-card--current' : ''].filter(Boolean).join(' ');

  const tag = isCurrent
    ? `<div class="plan-card__tag ${isCancelling ? 'plan-card__tag--cancelling' : 'plan-card__tag--current'}">${t('profile.subscription.current_tag')}</div>`
    : (plan.popular ? `<div class="plan-card__tag plan-card__tag--popular">${t('profile.subscription.popular_tag')}</div>` : '');
  // Статус отмены не меняет текст тега (всё ещё «Твой план») — только цвет (жёлтый вместо зелёного), чтобы не пугать
  // словом «Отменяется» — сам факт отмены и так виден ниже по access-until и кнопке «Снова стать ...».

  const nameKey = honorific === 'lord' ? plan.nameKeyLord : plan.nameKeyLady;
  const ctaKey = honorific === 'lord' ? plan.ctaKeyLord : plan.ctaKeyLady;
  // Кнопка выбора нужна только для нетекущих платных тарифов — текущий план и так очевиден по тегу выше
  // («Отменяется»/«Твой план»), отдельная disabled-кнопка «Текущий план» была избыточной.
  // Free тоже не показывает CTA, когда он не текущий — он и так получится автоматически при отмене.
  const showCtaButton = !isCurrent && plan.id !== 'free';

  // Нижний блок карточки — по трём сценариям: тариф куплен и отменяется / куплен и активен / не куплен.
  let footer = '';
  if (isPaid) {
    if (isCancelling) {
      footer = `
        <div class="plan-card__access-until">${t('profile.subscription.access_until', { date: formatCancelDate(cancellation.effectiveAt) })}</div>
        <button type="button" class="plan-card__btn plan-card__btn--undo" data-undo-cancel="${plan.id}">${t('profile.subscription.btn_undo_cancel', { title: t(nameKey) })}</button>
      `;
    } else if (isCurrent) {
      footer = `<button type="button" class="plan-card__btn plan-card__btn--cancel" data-cancel-plan="${plan.id}">${t('profile.subscription.btn_cancel')}</button>`;
    } else {
      footer = `<div class="plan-card__cancel-note">${t('profile.subscription.cancel_anytime')}</div>`;
    }
  }

  return `
    <div class="plan-card glass-card ${modifiers}" data-plan-id="${plan.id}">
      ${tag}
      <div class="plan-card__name">${t(nameKey)}</div>
      <div class="plan-card__price">
        <span class="plan-card__price-amount">${formatPlanPrice(plan)}</span>
        ${isPaid ? `<span class="plan-card__price-period">${t('profile.subscription.month')}</span>` : ''}
      </div>
      ${isPaid ? `<div class="plan-card__price-daily">${formatDailyPrice(plan)}</div>` : '<div class="plan-card__price-daily">&nbsp;</div>'}
      <ul class="plan-card__features">
        ${plan.featureKeys.map(key => `
          <li class="plan-card__feature">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${t(key)}</span>
          </li>
        `).join('')}
      </ul>
      ${showCtaButton ? `
      <button type="button" class="plan-card__btn" data-select-plan="${plan.id}">
        ${t(ctaKey)}
      </button>
      ` : ''}
      ${footer}
    </div>
  `;
}

function subscriptionSectionHTML(currentPlan, honorific, cancellation) {
  return `
    <div class="profile-subscription">
      <div class="profile-subscription__title">${t('profile.subscription.title')}</div>
      <div class="profile-subscription__sub">${t('profile.subscription.sub')}</div>
      <div class="plans-grid">
        ${SUBSCRIPTION_PLANS.map(plan => planCardHTML(plan, currentPlan, honorific, cancellation)).join('')}
      </div>
    </div>
  `;
}

// Блок выбора обращения — два чипа (переиспользует глобальный класс .filter-chip из app.js). Влияет на
// названия тарифов в блоке подписки ниже — опционально, дефолт 'lady' (Госпожа), если ничего не выбрано.
function honorificSectionHTML(honorific) {
  return `
    <div class="profile-honorific">
      <div class="profile-honorific__label">${t('profile.honorific.title')}</div>
      <div class="honorific-toggle">
        <button type="button" class="filter-chip ${honorific === 'lord' ? 'active' : ''}" data-honorific="lord">${t('profile.honorific.lord')}</button>
        <button type="button" class="filter-chip ${honorific === 'lady' ? 'active' : ''}" data-honorific="lady">${t('profile.honorific.lady')}</button>
      </div>
    </div>
  `;
}

// Кнопки выбора плана пока ничего не оплачивают и не сохраняют выбор на бэке — бэкенд для этого ещё не готов
// (ветка feature/payments только начата). Пока просто тост-заглушка.
// currentPlan/honorific нужны для кнопок отмены/отмены-отмены, onCancellationChanged — коллбэк перечитать getCancellation() и перерисовать карточки.
function attachSubscriptionHandlers(slot, { currentPlan, honorific, onCancellationChanged }) {
  slot.querySelectorAll('[data-select-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      showToast(t('profile.subscription.coming_soon'), 'info');
    });
  });

  slot.querySelectorAll('[data-cancel-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
      openCancelSubscriptionModal({
        plan: btn.dataset.cancelPlan,
        honorific,
        onScheduled: onCancellationChanged,
      });
    });
  });

  slot.querySelectorAll('[data-undo-cancel]').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      await undoCancellation();
      showToast(t('profile.subscription.undo_toast', { title: t(getRoyalTitleKey(currentPlan, honorific)) }), 'info');
      onCancellationChanged();
    });
  });
}

// onSelect(value) — асинхронный коллбэк — сохраняет выбор и перерисовывает страницу (чтобы названия тарифов ниже тоже пересчитались).
function attachHonorificHandlers(slot, onSelect) {
  slot.querySelectorAll('[data-honorific]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      onSelect(btn.dataset.honorific);
    });
  });
}

export async function renderProfile(container) {
  injectProfileCSS();

  function buildShell() {
    return `
      <div id="header-slot"></div>
      <div class="container profile-page">
        <button class="profile-back" id="profile-back-btn">${t('settings.back')}</button>
        <div class="profile-header">
          <div class="profile-header__title">${t('profile.title')}</div>
          <div class="profile-header__sub">${t('profile.sub')}</div>
        </div>
        <div id="profile-content">
          <div class="loading-dots">${t('loading')}</div>
        </div>
      </div>
    `;
  }

  container.innerHTML = buildShell();

  renderHeader(container.querySelector('#header-slot'), {});

  container.querySelector('#profile-back-btn')?.addEventListener('click', () => {
    history.back();
  });

  const { data: auth } = await getAuthState();
  if (!container.isConnected) return;

  const { data: honorificData } = await getHonorific();
  let honorific = honorificData.honorific; // 'lord' | 'lady'

  let { data: cancellation } = await getCancellation(); // запись отмены/даунгрейда или null, если ничего не запланировано

  // Перечитывает состояние отмены после того, как модалка запланировала отмену/даунгрейд, или после «Отменить отмену».
  async function refreshCancellation() {
    const res = await getCancellation();
    cancellation = res.data;
    renderContent();
  }

  function renderContent() {
    const slot = container.querySelector('#profile-content');
    if (!slot) return;

    if (!auth.isLoggedIn) {
      slot.innerHTML = `
        <div class="profile-guest glass-card">
          <div class="profile-guest__icon">👤</div>
          <div class="profile-guest__text">${t('profile.guest.text')}</div>
          <button type="button" class="profile-guest__btn" id="profile-guest-login-btn">${t('profile.guest.btn')}</button>
        </div>
      `;
      slot.querySelector('#profile-guest-login-btn')?.addEventListener('click', () => navigate('#/guest'));
      return;
    }

    const user = auth.user ?? {};
    const initials = (user.avatar || user.name || '··').toString().slice(0, 2);

    slot.innerHTML = `
      <div class="profile-card glass-card">
        <div class="profile-avatar">${initials}</div>
        <div class="profile-fields">
          ${editableFieldHTML('profile-name-field', t('profile.field.name'), user.name)}
          ${editableFieldHTML('profile-email-field', t('profile.field.email'), user.email)}
        </div>
      </div>
      ${honorificSectionHTML(honorific)}
      ${subscriptionSectionHTML(user.plan ?? 'free', honorific, cancellation)}
    `;

    attachSubscriptionHandlers(slot, {
      currentPlan: user.plan ?? 'free',
      honorific,
      onCancellationChanged: refreshCancellation,
    });
    attachHonorificHandlers(slot, async (value) => {
      honorific = value;
      await setHonorific(value);
      renderContent();
      renderHeader(container.querySelector('#header-slot'), {}); // корона/титул в шапке должны обновиться сразу, без навигации
    });

    // Имя показывается и в шапке (инициалы аватара) — после сохранения перерисовываем и её.
    attachEditableFieldHandlers(slot, {
      fieldId: 'profile-name-field',
      label: t('profile.field.name'),
      user, key: 'name',
      maxLength: 40, autocomplete: 'name',
      updater: updateProfileName,
      renderContent,
      onSaved: () => renderHeader(container.querySelector('#header-slot'), {}),
    });

    attachEditableFieldHandlers(slot, {
      fieldId: 'profile-email-field',
      label: t('profile.field.email'),
      user, key: 'email',
      inputType: 'email', maxLength: 80, autocomplete: 'email',
      updater: updateProfileEmail,
      renderContent,
    });
  }

  renderContent();

  onLangChange(() => {
    if (!container.isConnected) return;
    container.innerHTML = buildShell();
    renderHeader(container.querySelector('#header-slot'), {});
    container.querySelector('#profile-back-btn')?.addEventListener('click', () => history.back());
    renderContent();
  });
}
