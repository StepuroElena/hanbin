#!/bin/bash
set -e
cd "$(dirname "$0")"

git add \
  src/api/mock.js \
  src/router.js \
  src/app.js \
  src/components/Header.js \
  src/components/StatsBlock.js \
  src/components/DramaCard.js \
  src/components/ActivityFeed.js \
  src/components/Sidebar.js \
  src/components/Filters.js \
  src/pages/Home.js \
  src/pages/Unauthorized.js \
  src/utils/helpers.js \
  pages/unauthorized.html \
  README.md

git commit -m "feat(unauthorized): публичная страница для гостей + auth-aware роутинг

- renderUnauthorized: hero, цитата дня, лента последних дорам, login-баннер
- getAuthState: читает 'hanbin_user' из localStorage; нет записи — гость
- router: при старте проверяет auth, редиректит на unauthorized если нужно
- Весь UI переведён на русский (статусы, фильтры, хедер, активность, сайдбар)
- unauthorizedCSS перемещён до init() — фикс пустой страницы
- README: скриншот страницы гостя, секции Auth-Aware Routing и Unauthorized Page"

git push -u origin feature/unauthorized
echo "✅ Готово — ветка feature/unauthorized запушена"
