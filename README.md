# 한빈 · Hanbin — Drama Tracker

> *Track your K-dramas and C-dramas. Feel like the main character.*

A beautifully designed SPA for tracking Korean and Chinese dramas. Built for women who are obsessed with Asian dramas and want to feel like legends about how much they've watched.

---

## 📸 Screenshots

### Главная страница (залогиненный)
![Hanbin preview](assets/preview.png)

### Страница гостя — Hero
![Unauthorized preview](assets/preview-unauthorized.png)

### Раздел «Тебе понравится»
![You might like section](assets/preview-you-might-like.png)

### Модалка логина
![Login modal](assets/preview-login-modal.png)

### Модалка регистрации
![Register modal](assets/preview-register-modal.png)

---

## ✨ Features

- **Hero stats** — total dramas, episodes, hours with animated counting
- **Currently Watching** — card view with progress bars, badges, direct watch links
- **Smart filters** — by status, genre, country
- **Card / Table view toggle**
- **Activity feed** — recent updates
- **Badges & achievements** system
- **Search** with live dropdown
- Hash-based **SPA router** — ready for new pages
- **Auth-aware routing** — при запуске показывает unauthorized страницу если пользователь не залогинен
- **Unauthorized landing page** — публичная страница с hero, цитатой дня, разделом «Тебе понравится» и баннером входа
- **«Тебе понравится»** — живая лента из 10 дорам, парсится с [doramatv.one](https://m.doramatv.one/) через CORS-прокси; показывает рейтинг ★, жанр и статус прямо на постере
- **Модалка логина** — email + пароль, плавный переход к регистрации без пересоздания оверлея
- **Модалка регистрации** — имя + email + пароль, валидация, плавный переход обратно к логину
- **🌐 Двуязычный интерфейс (RU / EN)** — переключатель языка в хедере, весь UI переводится мгновенно без перезагрузки страницы

---

## 🌐 Локализация (i18n)

Приложение поддерживает два языка: **русский** и **английский**.

### Переключение

Кнопка 🇷🇺 / 🇬🇧 в правом верхнем углу хедера. При клике:
- весь UI обновляется мгновенно (без перезагрузки)
- выбор сохраняется в `localStorage` (`hanbin_lang`)
- при первом визите язык определяется автоматически из настроек браузера (fallback — русский)

### Что переводится

| Блок | Переводится |
|---|---|
| Хедер — навигация, поиск, тултипы | ✅ |
| Статистика — лейблы и единицы | ✅ |
| Фильтры — статусы, жанры, страны | ✅ |
| Секции — заголовки, кнопки «Все →» | ✅ |
| Сайдбар — страны, бейджи | ✅ |
| Цитата дня — текст + название дорамы | ✅ |
| Лендинг для гостей — всё | ✅ |
| Модалка логина — все тексты и ошибки | ✅ |
| Модалка регистрации — все тексты и ошибки | ✅ |

### Архитектура

Модуль `src/i18n/index.js` экспортирует:

```js
import { t, getLang, setLang, onLangChange } from '../i18n/index.js';

t('header.tagline')              // → 'Трекер дорам' | 'Drama Tracker'
t('activity.time.hours_ago', { h: 3 }) // → '3ч назад' | '3h ago'

setLang('en')                    // переключить язык
getLang()                        // → 'ru' | 'en'
onLangChange(lang => rebuildUI()) // подписаться на смену языка
```

Компонент-кнопка живёт в `src/components/LangToggle.js`, CSS инжектируется через `app.js`.

### Добавить перевод

Открой `src/i18n/index.js` и добавь ключ в оба блока (`ru` и `en`):

```js
// ru:
'my.new.key': 'Мой текст',
// en:
'my.new.key': 'My text',
```

Затем используй в компоненте:

```js
import { t } from '../i18n/index.js';
element.textContent = t('my.new.key');
```

### Цитаты на двух языках

Каждая цитата в `data/quotes.json` содержит поле `en` с переводом текста и английским названием дорамы:

```json
{
  "emoji": "🌸",
  "text": "«Если любишь — люби по-настоящему.»",
  "source": "Приземление в любовь · 2019",
  "en": {
    "text": "«If you love — love truly.»",
    "source": "Crash Landing on You · 2019"
  }
}
```

При смене языка нужная версия берётся на лету; сырые данные кешируются в `localStorage` один раз в сутки.

---

## 🚀 Running Locally

The project uses ES Modules (`type="module"`), so a local server is required.

### Option 1 — Node.js (recommended)

```bash
cd ~/Desktop/hanbin/hanbin-front
npx serve .
```

Opens at `http://localhost:3000`. Stop with **Ctrl+C**.

### Option 2 — VS Code Live Server

1. Install the **Live Server** extension in VS Code
2. Right-click `pages/home.html` → **Open with Live Server**
3. Opens at `http://localhost:5500`

### Option 3 — Python

```bash
python3 -m http.server 8080
```

---

## 📁 Project Structure

```
hanbin-front/
├── pages/
│   └── home.html               # Единственный HTML файл — точка входа SPA
├── data/
│   └── quotes.json             # Цитаты из дорам (RU + EN)
├── assets/
│   ├── favicon.svg
│   ├── preview.png
│   ├── preview-unauthorized.png
│   ├── preview-you-might-like.png
│   ├── preview-login-modal.png
│   └── preview-register-modal.png
└── src/
    ├── app.js                  # Инициализация, инъекция стилей
    ├── router.js               # Hash-based SPA роутер + auth-aware redirect
    ├── i18n/
    │   └── index.js            # ★ Все переводы RU/EN — добавлять строки здесь
    ├── styles/
    │   ├── theme.js            # ★ Все цвета, токены, шрифты — редактировать здесь
    │   └── global.js           # Базовый CSS, анимации, утилиты
    ├── api/
    │   └── mock.js             # Mock API — заменить на fetch когда будет бэкенд
    ├── components/
    │   ├── Header.js           # Поиск, переключатель вида, кнопка добавления, аватар
    │   ├── LangToggle.js       # Кнопка переключения языка RU ↔ EN
    │   ├── StatsBlock.js       # Герой-статистика с анимацией + цитата дня
    │   ├── DramaCard.js        # Карточный вид + таблица
    │   ├── ActivityFeed.js     # Лента последних действий
    │   ├── Sidebar.js          # Статистика по странам + достижения
    │   ├── Filters.js          # Панель фильтров
    │   ├── LoginModal.js       # Модалка авторизации — единый оверлей, слайд-переходы
    │   └── RegisterModal.js    # Модалка регистрации — монтируется в тот же оверлей
    ├── pages/
    │   ├── Home.js             # Главная страница — собирает все компоненты
    │   └── Unauthorized.js     # Публичная страница для гостей
    └── utils/
        ├── helpers.js          # timeAgo, renderStars, statusLabel, debounce (i18n-aware)
        ├── tooltip.js          # Тултипы
        └── favicon.js          # Установка фавикона
```

---

## 🌍 Unauthorized Page

Публичная страница `src/pages/Unauthorized.js` показывается незалогиненным пользователям. Полностью переведена на оба языка.

| Секция | Описание |
|---|---|
| **Хедер** | Логотип + поиск + переключатель языка + кнопка «Войти» |
| **Hero** | Заголовок «Твой личный дневник дорам» + CTA |
| **Цитата дня** | Из `data/quotes.json`, меняется раз в сутки, переводится |
| **Тебе понравится** | 10 дорам с doramatv.one — постер, рейтинг ★, жанр, статус |
| **Login-баннер** | Призыв войти в профиль |

Стили живут в `unauthorizedCSS` в `src/app.js`.

---

## 🎬 «Тебе понравится» — как работает

Парсит секцию «Горячие новинки» с [m.doramatv.one](https://m.doramatv.one/) через `corsproxy.io`:

```
fetchHotDramas()
  └─ fetch(corsproxy.io + m.doramatv.one)
  └─ DOMParser → section[data-tab-text="Горячие новинки"]
  └─ .entity-card-tile × 10
      ├─ title  (.entity-card-tile__title)
      ├─ cover  (img[data-original])
      ├─ rating (.compact-rate[title])
      ├─ genres (.elem_genre)
      └─ status ("выходит" / "аирится" → badge «Выходит» | «Ongoing»)
```

При ошибке показывается сообщение + прямая ссылка на сайт.
Клик по карточке — открывает страницу дорамы в новой вкладке.

---

## 🔐 Auth Modals — Login & Register

### Архитектура

Обе модалки работают через **один общий оверлей** (`#hb-modal-overlay`). При переходе между ними оверлей и фон остаются на месте — меняется только контент внутри `#hb-modal-content`. Это исключает моргание фона. При смене языка пока модалка открыта — контент перерисовывается мгновенно, введённые значения полей сохраняются.

```
#hb-modal-overlay   ← создаётся один раз, не удаляется при переходах
  └─ #hb-modal-box  ← карточка модалки
       └─ #hb-modal-content  ← сюда монтируется loginContent или registerContent
```

### Анимация переходов

| Переход | Старый контент | Новый контент |
|---|---|---|
| Логин → Регистрация | slide-out влево (220ms) | slide-in справа (280ms) |
| Регистрация → Логин | slide-out вправо (220ms) | slide-in слева (280ms) |
| Открытие модалки | — | slideUp + scale (320ms) |
| Закрытие | fade-out (220ms) | — |

### API

```js
import { openLoginModal } from '../components/LoginModal.js';
openLoginModal();

import { openRegisterModal } from '../components/RegisterModal.js';
openRegisterModal();

import { closeModal } from '../components/LoginModal.js';
closeModal();
```

### Поля и валидация

**Логин:** Email (maxlength 80) + Пароль (maxlength 64)  
**Регистрация:** Имя (maxlength 40) + Email (maxlength 80) + Пароль (maxlength 64, min 6)

Все сообщения об ошибках переведены на оба языка.

---

## 🔌 Auth-Aware Routing

```js
// src/router.js
if (hash === '#/' || hash === '') {
  const { data: auth } = await getAuthState();
  if (!auth.isLoggedIn) handler = renderUnauthorized;
}
```

Залогиниться для тестирования (консоль браузера):
```js
localStorage.setItem('hanbin_user', JSON.stringify({ id: 'user_001', name: 'Elena' }))
// Разлогиниться:
localStorage.removeItem('hanbin_user')
```

---

## 🎨 Changing the Design

All visual tokens live in **`src/styles/theme.js`**:

```js
export const colors = {
  rose: '#c97b8a',      // main accent
  neonRose: '#ff6b8a',  // glow accent
  deepPlum: '#2d0f2a',  // background
  jade: '#7aab8e',      // "watching" status
  warmGold: '#d4a574',  // "completed" + shimmer + rating stars
}
```

---

## 🔌 Connecting the Backend

All API calls are in **`src/api/mock.js`**:

```js
export async function getDramas(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`/api/dramas?${params}`);
  const data = await res.json();
  return { data, error: null };
}
```

Backend login/register integration points are marked with `// TODO` comments in `LoginModal.js` and `RegisterModal.js`.

---

## 📋 Planned Pages

| Route | Page | Status |
|---|---|---|
| `#/` | Home / Dashboard | ✅ Done |
| `#/guest` | Unauthorized landing | ✅ Done |
| `#/register` | Регистрация | ✅ Done (модалка) |
| `#/search` | Поиск / Каталог | 🔲 TODO |
| `#/drama/:id` | Детальная страница дорамы | 🔲 TODO |
| `#/my-list` | Полный список дорам | 🔲 TODO |
| `#/profile` | Профиль пользователя | 🔲 TODO |
| `#/achievements` | Достижения и статистика | 🔲 TODO |
| `#/settings` | Настройки | 🔲 TODO |

---

## 🌿 Git Workflow

Рабочая ветка — `develop`. В `main` идёт только стабильный код.

```bash
# Создать feature-ветку
git checkout develop
git checkout -b feature/my-feature

# Запушить
git push origin feature/my-feature
```

### Текущие ветки

| Ветка | Описание |
|---|---|
| `main` | Стабильный код |
| `develop` | Рабочая ветка |
| `feature/en` | Двуязычный интерфейс RU/EN — готово к мержу |

Смержить `feature/en` в `develop`:
```bash
git checkout develop
git merge feature/en
git push origin develop
```

---

## 🛠 Tech Stack

- Vanilla JavaScript (ES Modules, no bundler)
- No frameworks — pure DOM manipulation
- No dependencies — runs in any browser
- CSS via JS injection from `theme.js` + `global.js`
- i18n — собственный модуль, без сторонних библиотек
