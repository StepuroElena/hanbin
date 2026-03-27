#!/bin/bash
set -e
cd "$(dirname "$0")"

git add \
  src/api/client.js \
  src/api/mock.js \
  src/components/DramaCard.js

git commit -m "feat(archive): wire PATCH /dramas/{id}/archive|unarchive to front + fix is_archived source of truth

- client.js: добавлен authPatch() — авторизованный PATCH-запрос с Bearer-токеном
- mock.js: archiveDrama() → реальный PATCH /api/v1/dramas/{id}/archive при наличии токена
- mock.js: unarchiveDrama() → реальный PATCH /api/v1/dramas/{id}/unarchive при наличии токена
- mock.js: adaptDramaFromApi() пробрасывает is_archived с бэка как isArchived
- mock.js: getDramas() фильтрует архивированные по isArchived (флаг с бэка), не по localStorage
- mock.js: getArchivedDramas() фильтрует по isArchived === true с бэка; localStorage только для мока
- DramaCard: кнопка архива рендерится по data-action=archive|unarchive в зависимости от статуса
- DramaCard: обработчик читает data-action и вызывает archiveDrama/unarchiveDrama соответственно
- Работает в обоих видах: карточки и таблица"

git push -u origin feature/delete_drama
echo "✅ Готово"
