/**
 * HANBIN — Profile Page
 *
 * Простая страница профиля — показывает имя и email авторизованного пользователя.
 * Открывается через пункт «Профиль» в дропдауне аватара (Header.js → navigate('#/profile')).
 * Гостю (нет токена) показываем заглушку с призывом войти — сама страница не требует
 * авторизации для рендера, но данных показывать нечего.
 */

import { renderHeader } from '../components/Header.js';
import { navigate } from '../router.js';
import { getAuthState } from '../api/mock.js';
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

function fieldHTML(label, value) {
  const isEmpty = !value;
  return `
    <div class="profile-field">
      <div class="profile-field__label">${label}</div>
      <div class="profile-field__value ${isEmpty ? 'profile-field__value--empty' : ''}">${isEmpty ? t('profile.field.empty') : value}</div>
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
          ${fieldHTML(t('profile.field.name'), user.name)}
          ${fieldHTML(t('profile.field.email'), user.email)}
        </div>
      </div>
    `;
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
