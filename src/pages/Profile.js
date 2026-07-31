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
import { getAuthState, updateProfileName, updateProfileEmail } from '../api/mock.js';
import { t, onLangChange } from '../i18n/index.js';

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
    `;

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
