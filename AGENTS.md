# AGENTS.md — Developer Guide for Hanbin

This file is for developers and AI agents continuing work on this project.
Read it fully before making any changes.

---

## 🧠 Project Context

**Hanbin** is a drama tracker SPA for women 18–35 who watch K-dramas and C-dramas.
The core emotional goal: make users feel like **legends**. Every number, badge, and
interaction should feel like an achievement, not a chore.

**Current state:** Frontend only. Mock API in place. No backend yet.

---

## 🏗 Architecture Rules

### 1. File responsibilities — don't mix them

| File | Owns |
|---|---|
| `src/styles/theme.js` | ALL colors, fonts, spacing tokens |
| `src/styles/global.js` | Base CSS, animations, utility classes |
| `src/app.js` | App init, style injection, `componentCSS`, `unauthorizedCSS` |
| `src/api/mock.js` | ALL data fetching (mocks now, real API later) |
| `src/router.js` | Route registration and navigation only |
| `src/pages/*.js` | Page-level layout and component orchestration |
| `src/components/*.js` | Reusable UI components |
| `src/utils/helpers.js` | Pure utility functions (no DOM, no API calls) |

### 2. Never hardcode colors or fonts

❌ Wrong:
```js
el.style.color = '#c97b8a';
```

✅ Correct:
```js
el.style.color = 'var(--color-rose)';
```

All CSS variables are generated from `theme.js` → `buildCSSVariables()`.

### 3. All API calls go through `src/api/mock.js`

Components never call `fetch` directly (exception: `Unauthorized.js` calls `corsproxy.io`
for the live drama feed — this is intentional, it's not a user-data API call).

Every API function returns `{ data, error }` — always handle both.

### 4. Component signature pattern

```js
export async function renderMyComponent(container, options = {}) {
  container.innerHTML = `...`;
  // attach events after innerHTML
}
```

### 5. Router: pages receive `(container, params)`

```js
export async function renderDrama(container, { id }) {
  const { data } = await getDramaById(id);
  container.innerHTML = `...`;
}
```

### 6. Event delegation over individual listeners

```js
container.querySelector('.drama-list').addEventListener('click', (e) => {
  const card = e.target.closest('[data-id]');
  if (card) handleCardClick(card.dataset.id);
});
```

---

## 🎨 Design System

### Palette (from `theme.js`)

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#2d0f2a` | Page background |
| `--color-rose` | `#c97b8a` | Primary accent, borders, icons |
| `--color-neon-rose` | `#ff6b8a` | Glow effects, ongoing badge |
| `--color-champagne` | `#f5e6d3` | Primary text |
| `--color-gold` | `#d4a574` | Completed status, shimmer, stars, ratings |
| `--color-jade` | `#7aab8e` | Watching status |
| `--color-text-muted` | `rgba(245,230,211,0.4)` | Secondary text, labels |
| `--color-surface` | `rgba(255,255,255,0.07)` | Card backgrounds |
| `--color-border` | `rgba(232,196,184,0.1)` | Default borders |
| `--color-border-hover` | `rgba(232,196,184,0.25)` | Hover borders |

### Typography

- **Display font** (`--font-display`): Cormorant Garamond — for titles, hero numbers, quotes
- **Body font** (`--font-body`): DM Sans — for labels, metadata, UI text

### Badge opacity rule

Status badges on card covers must be clearly visible — **not semi-transparent**.
Use opacity ≥ 0.65 for backgrounds and white (`#fff`) text:

```css
/* ✅ Correct */
.badge--completed { background: rgba(122,171,142,0.65); color: #fff; }
.badge--ongoing   { background: rgba(255,107,138,0.7);  color: #fff; }

/* ❌ Wrong — invisible on cover images */
.badge--completed { background: rgba(122,171,142,0.2); color: var(--color-jade); }
```

---

## 📐 Component Patterns

### Available utility CSS classes

```
.glass-card        — surface bg + border + backdrop-blur + hover effect
.section-title     — section header with rose left-border accent
.badge             — base badge style
.badge--watching   — green status badge
.badge--completed  — teal status badge (solid, white text)
.badge--plan       — blush status badge
.badge--dropped    — red status badge
.badge--ongoing    — neon rose badge (solid, white text)
.badge--ru         — "RU Sub" badge
.text-display      — applies display font
.text-muted        — muted text color
.text-accent       — rose accent color
.page-enter        — fade-up entrance animation
.container         — max-width 1280px, centered, padded
```

---

## 🌐 Unauthorized Page (`src/pages/Unauthorized.js`)

The guest landing page. Rendered when `getAuthState()` returns `isLoggedIn: false`.

### Sections

| Section | Key elements |
|---|---|
| Header | Logo, search bar, «Войти» button → `openLoginModal()` |
| Hero | Big title, subtitle, CTA «Войти в профиль» → `openLoginModal()` |
| Daily quote | From `data/quotes.json`, date-seeded |
| **«Тебе понравится»** | Live feed from doramatv.one (see below) |
| Login banner | Bottom CTA → `openLoginModal()` |

### «Тебе понравится» — live drama feed

- **Source:** `https://m.doramatv.one/` — section «Горячие новинки»
- **Proxy:** `https://corsproxy.io/?<encoded-url>` (allorigins.win doesn't work)
- **Limit:** 10 cards
- **Extracted fields:** title, link, cover (`img[data-original]`), rating (`.compact-rate[title]`), genres (`.elem_genre`), ongoing status
- **On error:** shows fallback message + link to site
- **On click:** `window.open(drama.link, '_blank')`

If the section title ever needs changing, update it in `_renderDramas()` inside `Unauthorized.js`.

### CSS location

All unauthorized-page styles are in `unauthorizedCSS` constant at the bottom of `src/app.js`.
Classes are prefixed with `unauth-` to avoid collision with logged-in page styles.

Key classes:
```
.unauth-hot__grid     — 5-column grid (responsive down to 2)
.unauth-card          — drama card with cover + info
.unauth-card__rating  — gold pill overlay (bottom-left of cover)
.unauth-card__badges  — status badges (top-left of cover)
.unauth-card__ext-btn — arrow-out button (bottom-right, appears on hover)
.unauth-skel-box      — skeleton loading placeholder
```

---

## 🔐 Login Modal (`src/components/LoginModal.js`)

### Usage

```js
import { openLoginModal } from '../components/LoginModal.js';
openLoginModal(); // opens the modal
```

Called from three places in `Unauthorized.js`:
1. Header «Войти» button
2. Hero CTA button
3. Bottom login banner button

### Behaviour

- Opens as overlay with backdrop blur
- Closes on overlay click or × button
- Fields: email (maxlength 80) + password (maxlength 64) with live char counter
- «Войти» → connect to `POST /api/auth/login` when backend is ready
- «Зарегистрироваться» → navigates to `#/register`

### Backend integration TODO

```js
// In LoginModal.js, replace mock submit with:
const res = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token, user } = await res.json();
// store token, call navigate('#/')
```

---

## 🔌 Backend Integration Checklist

When a backend is ready, update `src/api/mock.js`:

- [ ] `getUser()` → `GET /api/user/me`
- [ ] `getAuthState()` → `GET /api/auth/me` (or check JWT in localStorage)
- [ ] `getDramas(filters)` → `GET /api/dramas?status=&country=&genre=`
- [ ] `getCurrentlyWatching()` → `GET /api/dramas?status=watching`
- [ ] `getActivity(limit)` → `GET /api/activity?limit=`
- [ ] `addDrama(drama)` → `POST /api/dramas`
- [ ] `updateDramaStatus(id, status)` → `PATCH /api/dramas/:id`
- [ ] `rateDrama(id, rating)` → `PATCH /api/dramas/:id/rating`
- [ ] `deleteDrama(id)` → `DELETE /api/dramas/:id`
- [ ] `searchDramas(query)` → `GET /api/dramas/search?q=`
- [ ] `login(email, password)` → `POST /api/auth/login`
- [ ] `register(email, password)` → `POST /api/auth/register`

Keep the same `{ data, error }` return shape — components won't need to change.

---

## 🗺 Pages Roadmap

| Route | Page | Status |
|---|---|---|
| `#/` | Home / Dashboard (залогиненный) | ✅ Done |
| `#/guest` | Unauthorized landing (гость) | ✅ Done |
| `#/register` | Регистрация | 🔲 In progress (`feature/register`) |
| `#/search` | Поиск / Каталог | 🔲 TODO |
| `#/drama/:id` | Детальная страница дорамы | 🔲 TODO |
| `#/my-list` | Полный список дорам | 🔲 TODO |
| `#/profile` | Профиль пользователя | 🔲 TODO |
| `#/achievements` | Достижения и статистика | 🔲 TODO |
| `#/settings` | Настройки | 🔲 TODO |

---

## ⚠️ Things to Avoid

- ❌ Don't add npm packages — project is intentionally dependency-free
- ❌ Don't use `localStorage` for anything critical
- ❌ Don't hardcode mock data in components — all data comes from `src/api/mock.js`
- ❌ Don't use generic fonts — always use `var(--font-display)` or `var(--font-body)`
- ❌ Don't make badges semi-transparent on cover images — use opacity ≥ 0.65
- ❌ Don't call `fetch` directly from components (except the doramatv.one CORS proxy case)
- ❌ Don't make the UI feel corporate or task-like — it should feel personal and beautiful

---

## ✅ Definition of Done (for any feature)

- [ ] Component reads data from `src/api/mock.js`
- [ ] All colors use CSS variables from `theme.js`
- [ ] Events are attached after `innerHTML` is set
- [ ] New route is registered in `router.js`
- [ ] Hover states and transitions are present
- [ ] Empty state is handled
- [ ] Loading state / skeleton is handled
- [ ] Mobile layout doesn't break (test at 640px)
- [ ] Badge text is readable on cover images
