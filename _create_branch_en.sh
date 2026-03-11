#!/bin/bash
# Запускает создание ветки feature/en и делает первый коммит
# Запусти: bash ~/Desktop/hanbin/hanbin-front/_create_branch_en.sh

cd ~/Desktop/hanbin/hanbin-front || exit 1

# Переключаемся на develop (рабочая ветка)
git checkout develop

# Создаём ветку feature/en от develop
git checkout -b feature/en

# Добавляем все изменённые и новые файлы
git add src/i18n/index.js \
        src/components/LangToggle.js \
        src/components/Header.js \
        src/components/Filters.js \
        src/components/StatsBlock.js \
        src/components/Sidebar.js \
        src/pages/Home.js \
        src/pages/Unauthorized.js \
        src/utils/helpers.js \
        src/app.js

git commit -m "feat(i18n): add RU/EN language toggle

- Add src/i18n/index.js — translation module with t(), getLang(), setLang(), onLangChange()
- Add src/components/LangToggle.js — flag button component (🇷🇺/🇬🇧) with CSS
- Inject LangToggle CSS via app.js
- Update Header, Filters, StatsBlock, Sidebar, DramaCard, ActivityFeed components to use t()
- Update Home.js and Unauthorized.js pages to use t() and react to onLangChange
- Update helpers.js (timeAgo, statusLabel) to be i18n-aware
- Language persists in localStorage under key 'hanbin_lang'
- Auto-detects browser language on first visit (ru fallback)"

echo ""
echo "✅ Ветка feature/en создана и коммит сделан!"
echo "   Запусти 'git push origin feature/en' чтобы запушить."
