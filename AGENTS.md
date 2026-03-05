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
| `src/api/mock.js` | ALL data fetching (mocks now, real API later) |
| `src/router.js` | Route registration and navigation only |
| `src/pages/*.js` | Page-level layout and component orchestration |
| `src/components/*.js` | Reusable UI components |
| `src/utils/helpers.js` | Pure utility functions (no DOM, no API calls) |

### 2. Never hardcode colors or fonts

❌ Wrong:
```js
el.style.color = '#c97b8a';
el.style.fontFamily = 'Cormorant Garamond, serif';
```

✅ Correct:
```js
el.style.color = 'var(--color-rose)';
el.style.fontFamily = 'var(--font-display)';
```

All CSS variables are generated from `theme.js` → `buildCSSVariables()`.

### 3. All API calls go through `src/api/mock.js`

Components never call `fetch` directly.
Every API function returns `{ data, error }` — always handle both.

```js
const { data, error } = await getDramas({ status: 'watching' });
if (error) { /* handle */ }
```

### 4. Component signature pattern

Every component is an async function that receives a DOM container and optional params:

```js
export async function renderMyComponent(container, options = {}) {
  container.innerHTML = `...`;
  // attach events after innerHTML
}
```

Never return HTML strings from top-level render functions — always write to `container`.

### 5. Router: pages receive `(container, params)`

```js
export async function renderDrama(container, { id }) {
  const { data } = await getDramaById(id);
  container.innerHTML = `...`;
}
```

### 6. Event delegation over individual listeners

For lists of items, prefer event delegation:

```js
// ✅ One listener for the whole list
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
| `--color-gold` | `#d4a574` | Completed status, shimmer, stars |
| `--color-jade` | `#7aab8e` | Watching status |
| `--color-text-muted` | `rgba(245,230,211,0.4)` | Secondary text, labels |
| `--color-surface` | `rgba(255,255,255,0.07)` | Card backgrounds |
| `--color-border` | `rgba(232,196,184,0.1)` | Default borders |
| `--color-border-hover` | `rgba(232,196,184,0.25)` | Hover borders |

### Typography

- **Display font** (`--font-display`): Cormorant Garamond — for titles, hero numbers, quotes
- **Body font** (`--font-body`): DM Sans — for labels, metadata, UI text

### Tone & Mood

The app should always feel:
- **Luxurious** — not cheap, not generic
- **Editorial** — like a beautiful magazine
- **Personal** — like it knows the user
- **Celebratory** — every stat is a flex

Never make it feel like a productivity tool or to-do list.

---

## 📐 Component Patterns

### Adding a new component

1. Create `src/components/MyComponent.js`
2. Export a single async render function
3. Import it in the relevant page
4. Attach all events inside the render function after `innerHTML`

```js
// src/components/MyComponent.js
import { someApiCall } from '../api/mock.js';

export async function renderMyComponent(container, options = {}) {
  const { data } = await someApiCall();

  container.innerHTML = `
    <div class="my-component glass-card">
      ${data.map(item => `
        <div class="my-item" data-id="${item.id}">${item.title}</div>
      `).join('')}
    </div>
  `;

  // Events
  container.querySelectorAll('.my-item').forEach(el => {
    el.addEventListener('click', () => {
      // TODO: navigate or open modal
    });
  });
}
```

### Available utility CSS classes

```
.glass-card        — surface bg + border + backdrop-blur + hover effect
.section-title     — section header with rose left-border accent
.badge             — base badge style
.badge--watching   — green status badge
.badge--completed  — gold status badge
.badge--plan       — blush status badge
.badge--dropped    — red status badge
.badge--ongoing    — neon rose badge
.badge--ru         — "RU Sub" badge
.text-display      — applies display font
.text-muted        — muted text color
.text-accent       — rose accent color
.page-enter        — fade-up entrance animation
.container         — max-width 1280px, centered, padded
```

---

## 🔌 Backend Integration Checklist

When a backend is ready, update `src/api/mock.js`:

- [ ] `getUser()` → `GET /api/user/me`
- [ ] `getDramas(filters)` → `GET /api/dramas?status=&country=&genre=`
- [ ] `getCurrentlyWatching()` → `GET /api/dramas?status=watching`
- [ ] `getActivity(limit)` → `GET /api/activity?limit=`
- [ ] `addDrama(drama)` → `POST /api/dramas`
- [ ] `updateDramaStatus(id, status)` → `PATCH /api/dramas/:id`
- [ ] `rateDrama(id, rating)` → `PATCH /api/dramas/:id/rating`
- [ ] `deleteDrama(id)` → `DELETE /api/dramas/:id`
- [ ] `searchDramas(query)` → `GET /api/dramas/search?q=`
- [ ] `setViewMode(mode)` → `PATCH /api/user/preferences`

Keep the same `{ data, error }` return shape — components won't need to change.

---

## 🗺 Pages Roadmap

### `#/search` — Discover page
- Full search with filters
- Browse by genre, country, year
- Trending / popular dramas section

### `#/drama/:id` — Drama detail page
- Full info: synopsis, cast, episodes list
- Rating widget (1–5 stars)
- Status selector
- Episode progress tracker
- Notes / personal review

### `#/my-list` — Full drama list
- All dramas with full filter/sort
- Bulk status updates
- Export list

### `#/profile` — User profile
- Stats overview
- All badges
- Watch history calendar heatmap
- Edit profile

### `#/achievements` — Badges page
- All badges (locked + unlocked)
- Progress toward next badge
- Milestone timeline

### `#/settings` — Settings
- Theme switcher (light mode TODO)
- Language preference
- Notification settings
- Account management

---

## ⚠️ Things to Avoid

- ❌ Don't add npm packages without discussion — project is intentionally dependency-free
- ❌ Don't use `localStorage` for anything critical — it's used only for UI preferences (view mode)
- ❌ Don't hardcode mock data in components — all data comes from `src/api/mock.js`
- ❌ Don't use generic fonts (Inter, Roboto, Arial) — always use `var(--font-display)` or `var(--font-body)`
- ❌ Don't use purple gradients on white — breaks the whole aesthetic
- ❌ Don't make the UI feel corporate or task-like — it should feel personal and beautiful

---

## ✅ Definition of Done (for any feature)

- [ ] Component reads data from `src/api/mock.js`
- [ ] All colors use CSS variables from `theme.js`
- [ ] Events are attached after `innerHTML` is set
- [ ] New route is registered in `router.js`
- [ ] Hover states and transitions are present
- [ ] Empty state is handled
- [ ] Loading state is handled
- [ ] Mobile layout doesn't break
