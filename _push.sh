#!/bin/bash
set -e
cd "$(dirname "$0")"

# Удаляем старые скриптовые костыли из репозитория
git rm --cached _screenshots.sh install_screenshot.py save_screenshots.py 2>/dev/null || true
rm -f _screenshots.sh install_screenshot.py save_screenshots.py

git add \
  src/components/LoginModal.js \
  src/components/RegisterModal.js \
  README.md

git commit -m "feat(auth): модалка регистрации + плавные переходы между модалками

- RegisterModal: имя + email + пароль, валидация, счётчик символов
- LoginModal: рефактор — единый оверлей (#hb-modal-overlay) для обеих модалок
- Переход логин ↔ регистрация: slide-left / slide-right анимация контента
  без пересоздания оверлея (нет моргания фона)
- Закрытие: fade-out анимация вместо мгновенного remove()
- Декоративный блик меняет цвет при переключении форм (rose → jade)
- CSS унифицирован: .hb-btn-primary / .hb-btn-secondary, общий hb-modal-css
- README: секция Auth Modals с архитектурой, анимациями, API и TODO для бэка"

git push -u origin feature/register
echo "✅ Готово"
