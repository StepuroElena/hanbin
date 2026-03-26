#!/bin/bash
set -e
cd "$(dirname "$0")"

git add \
  src/app.js \
  src/i18n/index.js \
  src/components/DramaCard.js \
  src/components/Header.js \
  src/pages/Home.js

git commit -m "fix(i18n): перевод хедеров таблиц + сохранение вида при смене языка

- DramaCard: хедеры таблиц через t() — переводятся при смене RU/EN
  (Дорама/Год/Жанр/Статус/Оценка/Прогресс/Страна)
- DramaCard: кнопки архивирования/восстановления, пустые состояния — через t()
- i18n: добавлены ключи table.col.*, archive.unarchive_tooltip (ru + en)
- Header: currentMode в closure — выбранный вид card/table переживает
  перерендер хедера при смене языка, кнопка toggle не сбрасывается
- Home: onLangChange перерендеривает watching-слот в любом виде (не только table),
  селектор .section-title исправлен на :not(.section-title--archive)
- app.js: цвет sticky-хедера таблиц — сливовый rgba(74,25,66,0.82)
  вместо почти-чёрного, текст — var(--color-rose)"

git push -u origin feature/delete_drama
echo "✅ Готово"
