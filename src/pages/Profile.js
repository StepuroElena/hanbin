/**
 * HANBIN — Profile Page
 *
 * Простая страница профиля — показывает имя и email авторизованного пользователя.
 * Имя редактируется инлайн (карандаш → инпут → Сохранить/Отмена), пишет на бэк через
 * PATCH /api/v1/profiles/{id} (см. updateProfileName в api/mock.js).
 * Email пока НЕ редактируется — на бэке это поле в PATCH тихо игнорируется, редактирование
 * добавим только когда там появится реальная поддержка (см. заметку в mock.js).
 * Пароль на этой странице не показываем и не редактируем — отдельного безопасного
 * эндпоинта смены пароля («текущий пароль → новый») на бэке пока нет.
 *
 * Открывается через пункт «Профиль» в дропдауне аватара (Header.js → navigate('#/profile')).
 * Гостю (нет токена) показываем заглушку с призывом войти — сама страница не требует
 * авторизации для рендера, но данных показывать нечего.
 */

import { renderHeader } from '../components/Header.js';
import { navigate } from '../router.js';
import { getAuthState, updateProfileName } from '../api/mock.js';
import { t, onLangChange } from '../i18n/index.js';

const PROFILE_CSS = `
  .profile-page { animation: fadeUp 0.5s ease both; max-width: 640px; }

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

  /* ── Редактируемое поле (имя) ── */
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

  .profile-guest { padding: 40px; text-align: center; border-radius: 20px; }
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

// email (и любое другое не-редактируемое поле) — просто лейбл + значение
function fieldHTML(label, value) {
  const isEmpty = !value;
  return `
    <div class="profile-field">
      <div class="profile-field__label">${label}</div>
      <div class="profile-field__value ${isEmpty ? 'profile-field__value--empty' : ''}">${isEmpty ? t('profile.field.empty') : value}</div>
    </div>
  `;
}

// name — лейбл + значение + карандаш-кнопка, разворачивающая инлайн-форму редактирования
function editableNameFieldHTML(name) {
  const isEmpty = !name;
  return `
    <div class="profile-field" id="profile-name-field">
      <div class="profile-field__label">${t('profile.field.name')}</div>
      <div class="profile-field__row">
        <div class="profile-field__value ${isEmpty ? 'profile-field__value--empty' : ''}" id="profile-name-value">${isEmpty ? t('profile.field.empty') : name}</div>
        <button type="button" class="profile-field__edit-btn" id="profile-name-edit-btn" data-tooltip="${t('profile.edit_tooltip')}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
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

  // Переключает поле «Имя» в режим редактирования: инпут + Сохранить/Отмена.
  // user — тот же объект, что и в auth.user, мутируется на месте при успешном сохранении,
  // чтобы renderContent() при повторном вызове (напр. после смены языка) уже видел новое имя.
  function attachNameEditHandlers(slot, user) {
    const field = slot.querySelector('#profile-name-field');
    const editBtn = slot.querySelector('#profile-name-edit-btn');
    if (!field || !editBtn) return;

    editBtn.addEventListener('click', () => {
      const currentName = user.name || '';
      field.innerHTML = `
        <div class="profile-field__label">${t('profile.field.name')}</div>
        <div class="profile-field__edit-row">
          <input class="profile-field__input" id="profile-name-input" type="text" maxlength="40" autocomplete="name">
          <button type="button" class="profile-field__save-btn" id="profile-name-save-btn">${t('profile.save_btn')}</button>
          <button type="button" class="profile-field__cancel-btn" id="profile-name-cancel-btn">${t('profile.cancel_btn')}</button>
        </div>
        <div class="profile-field__error" id="profile-name-error"></div>
      `;

      const input = field.querySelector('#profile-name-input');
      input.value = currentName;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);

      const cancel = () => renderContent();
      field.querySelector('#profile-name-cancel-btn').addEventListener('click', cancel);

      const save = async () => {
        const newName = input.value.trim();
        const errorEl = field.querySelector('#profile-name-error');

        if (!newName) {
          errorEl.textContent = t('profile.err_name_empty');
          return;
        }
        if (newName === user.name) {
          cancel();
          return;
        }

        const saveBtn = field.querySelector('#profile-name-save-btn');
        const cancelBtn = field.querySelector('#profile-name-cancel-btn');
        saveBtn.disabled = true;
        cancelBtn.disabled = true;
        saveBtn.textContent = t('profile.saving');
        errorEl.textContent = '';

        const { data, error } = await updateProfileName(user.id, newName);

        if (error) {
          saveBtn.disabled = false;
          cancelBtn.disabled = false;
          saveBtn.textContent = t('profile.save_btn');
          errorEl.textContent = error;
          return;
        }

        user.name = data?.name ?? newName;
        renderContent();
        // Шапка сама заново читает auth-состояние (getMe уже инвалидирован в updateProfileName) —
        // просто перерисовываем её, чтобы инициалы/имя в аватаре обновились сразу же, без перехода по страницам.
        renderHeader(container.querySelector('#header-slot'), {});
      };

      field.querySelector('#profile-name-save-btn').addEventListener('click', save);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') cancel();
      });
    });
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
          ${editableNameFieldHTML(user.name)}
          ${fieldHTML(t('profile.field.email'), user.email)}
        </div>
      </div>
    `;

    attachNameEditHandlers(slot, user);
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
