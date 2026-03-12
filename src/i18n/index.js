/**
 * HANBIN — i18n Module
 * Поддерживает RU и EN. Ключ хранится в localStorage: 'hanbin_lang'.
 *
 * Использование:
 *   import { t, getLang, setLang, onLangChange } from '../i18n/index.js';
 *   t('header.search_placeholder')  →  "Поиск дорам…" | "Search dramas…"
 */

// ─── Translations ─────────────────────────────────────────────
export const translations = {
  ru: {
    // Header
    'header.tagline':             'Трекер дорам',
    'header.nav.home':            'Главная',
    'header.nav.catalog':         'Каталог',
    'header.nav.my_list':         'Мой список',
    'header.search_placeholder':  'Поиск дорам…',
    'header.tooltip.card_view':   'Вид карточек',
    'header.tooltip.table_view':  'Табличный вид',
    'header.tooltip.add':         'Добавить дораму',
    'header.tooltip.profile':     'Профиль',
    'header.tooltip.login':       'Войти в аккаунт',
    'header.tooltip.lang':        'Switch to English',
    'header.add_todo':            'Форма добавления дорамы — TODO: подключить к бэку 🌸',
    'header.dropdown.profile':     'Профиль',
    'header.dropdown.settings':    'Настройки',
    'header.dropdown.logout':      'Выйти из аккаунта',
    'header.search_not_found':    'Ничего не найдено по «{q}»',

    // Stats block
    'stats.dramas_watched':       'Просмотрено дорам',
    'stats.dramas_unit':          'завершённых сериалов',
    'stats.total_episodes':       'Всего эпизодов',
    'stats.episodes_unit':        'поглощённых серий',
    'stats.hours':                'Часов дорам',
    'stats.hours_unit':           'часов чистого удовольствия',

    // Filters
    'filter.all':                 'Все',
    'filter.watching':            '▶ Смотрю',
    'filter.completed':           '✓ Просмотрено',
    'filter.plan':                'Запланировано',
    'filter.dropped':             'Брошено',
    'filter.genre.romance':       'Романтика',
    'filter.genre.thriller':      'Триллер',
    'filter.genre.historical':    'Исторические',
    'filter.genre.fantasy':       'Фэнтези',
    'filter.country.kr':          '🇰🇷 Корея',
    'filter.country.cn':          '🇨🇳 Китай',
    'filter.country.jp':          '🇯🇵 Япония',

    // Home page
    'home.currently_watching':    'Сейчас смотрю',
    'home.see_all':               'Все →',
    'home.recent_activity':       'Недавняя активность',
    'home.view_all':              'Все →',

    // Activity
    'activity.added_rating':      'Поставлена оценка',
    'activity.added_plan':        'Добавлено в «Запланировано»',
    'activity.time.just_now':     'Только что',
    'activity.time.hours_ago':    '{h}ч назад',
    'activity.time.yesterday':    'Вчера',
    'activity.time.days_ago':     '{d} дн. назад',

    // Sidebar
    'sidebar.by_country':         'По странам',
    'sidebar.badges':             'Мои значки',
    'sidebar.badge.drama_queen':  'Королева дорам',
    'sidebar.badge.kdrama_fan':   'K-Дорама фанат',
    'sidebar.badge.cdrama':       'C-Дорама путник',
    'sidebar.badge.2000h':        'Клуб 2000ч',
    'sidebar.badge.night_owl':    'Ночная сова',
    'sidebar.badge.100dramas':    '100 дорам',

    // Card / status badges
    'status.watching':            'Смотрю',
    'status.completed':           'Просмотрено',
    'status.plan':                'Запланировано',
    'status.dropped':             'Брошено',
    'status.ongoing':             'Выходит',

    // Unauthorized page
    'unauth.eyebrow':             'Трекер дорам для настоящих ценителей ✦',
    'unauth.title_pre':           'Твой личный',
    'unauth.title_em':            'дневник дорам',
    'unauth.title_post':          '',
    'unauth.subtitle':            'Отслеживай просмотренные, планируй следующие, делись впечатлениями. Всё в одном месте.',
    'unauth.cta':                 '✦ Войти',
    'unauth.cta_legacy':           '✦ Начать бесплатно',
    'unauth.hot_title':           'Тебе понравится',
    'unauth.hot_source_prefix':   'Горячие новинки с',
    'unauth.banner_title':        'Начни отслеживать свои дорамы',
    'unauth.banner_sub':          'Сохраняй список, ставь оценки, следи за выходящими сериями',
    'unauth.banner_btn':          'Войти / Зарегистрироваться',
    'unauth.quote_label':         '— Цитата дня —',

    // Empty / loading
    'empty.no_dramas':            'Список пуст. Добавь свою первую дораму!',
    'empty.add_btn':              '+ Добавить дораму',
    'loading':                    'Загрузка…',

    // Login modal
    'modal.close':                'Закрыть',
    'modal.login.title':          'Добро пожаловать домой',
    'modal.login.sub':            'Войдите в свой любимый аккаунт',
    'modal.login.email':          'Email',
    'modal.login.password':       'Пароль',
    'modal.login.btn':            'Войти',
    'modal.login.or':             'или',
    'modal.login.to_register':    'Зарегистрироваться',
    'modal.login.email_ph':       'your@email.com',
    'modal.login.pass_ph':        '••••••••',
    'modal.login.err_email':      '⚠ Некорректный адрес почты',
    'modal.login.success':        '✓ Вход выполнен! (TODO: подключить к API)',

    // Add Drama modal
    'modal.add.title':                  'Новая дорама',
    'modal.add.sub':                    'Добавить в мой список',
    'modal.add.duplicate.title':        'Дорама уже в списке',
    'modal.add.duplicate.text':         'Эта дорама уже добавлена в твой список.',
    'modal.add.field.title':            'Название дорамы',
    'modal.add.field.title_ph':         'Например: Моя демон',
    'modal.add.field.title_err':        'Введи название дорамы',
    'modal.add.field.where':            'Где смотреть',
    'modal.add.field.where_ph':         'Выбери сайт для просмотра…',
    'modal.add.field.year':             'Год выпуска',
    'modal.add.field.country':          'Страна',
    'modal.add.field.genre':            'Жанр',
    'modal.add.section.details':        'Детали',
    'modal.add.section.tags':           'Теги и статус',
    'modal.add.section.rating':         'Рейтинг',
    'modal.add.tag.release':            'Выпуск',
    'modal.add.tag.released':           'Выпущен',
    'modal.add.tag.ongoing':            'Выходит',
    'modal.add.tag.translation':        'Перевод',
    'modal.add.tag.translated':         'Переведён',
    'modal.add.tag.translating':        'Переводится',
    'modal.add.status.label':           'Статус просмотра',
    'modal.add.status.value':           'Запланировано',
    'modal.add.status.hint':            'При добавлении всегда ставится «Запланировано»',
    'modal.add.rating.optional':        'необязательно',
    'modal.add.rating.hint':            'Нажми на звёздочку, чтобы поставить оценку',
    'modal.add.rating.1':               'Ужасно 😬',
    'modal.add.rating.2':               'Слабовато 😕',
    'modal.add.rating.3':               'Норм 🙂',
    'modal.add.rating.4':               'Хорошо ✨',
    'modal.add.rating.5':               'Шедевр 🌸',
    'modal.add.btn':                    'Добавить в список',
    'modal.add.btn.loading':            'Добавляем…',
    'modal.add.btn.success':            'Добавлено ✓',
    'modal.add.sites.ru_label':         'Русскоязычные',
    'modal.add.sites.intl_label':       'Международные',
    'modal.add.genres.romance':         'Романтика',
    'modal.add.genres.thriller':        'Триллер',
    'modal.add.genres.historical':      'Исторические',
    'modal.add.genres.fantasy':         'Фэнтези',
    'modal.add.genres.comedy':          'Комедия',
    'modal.add.genres.drama':           'Драма',
    'modal.add.genres.action':          'Боевик',
    'modal.add.genres.mystery':         'Мистерия',
    'modal.add.genres.horror':          'Ужасы',
    'modal.add.genres.documentary':     'Документальный',
    'modal.add.country.kr':             '🇰🇷 Корея',
    'modal.add.country.cn':             '🇨🇳 Китай',
    'modal.add.country.jp':             '🇯🇵 Япония',
    'modal.add.country.other':          '🌏 Другая',

    // Register modal
    'modal.reg.title':            'Стань легендой',
    'modal.reg.sub':              'Создай аккаунт и начни свой путь',
    'modal.reg.name':             'Имя',
    'modal.reg.name_ph':          'Как тебя зовут?',
    'modal.reg.email':            'Email',
    'modal.reg.password':         'Пароль',
    'modal.reg.pass_ph':          'Минимум 8 символов',
    'modal.reg.btn':              'Зарегистрироваться',
    'modal.reg.or':               'или',
    'modal.reg.to_login':         'Войти',
    'modal.reg.err_name':         '⚠ Имя слишком короткое',
    'modal.reg.err_email':        '⚠ Некорректный адрес почты',
    'modal.reg.err_pass':         '⚠ Минимум 8 символов',
    'modal.reg.success':          '✓ Аккаунт создан! (TODO: подключить к API)',
  },

  en: {
    // Header
    'header.tagline':             'Drama Tracker',
    'header.nav.home':            'Home',
    'header.nav.catalog':         'Catalog',
    'header.nav.my_list':         'My List',
    'header.search_placeholder':  'Search dramas…',
    'header.tooltip.card_view':   'Card view',
    'header.tooltip.table_view':  'Table view',
    'header.tooltip.add':         'Add drama',
    'header.tooltip.profile':     'Profile',
    'header.tooltip.login':       'Sign in',
    'header.tooltip.lang':        'Переключить на русский',
    'header.add_todo':            'Add drama form — TODO: connect to backend 🌸',
    'header.dropdown.profile':     'Profile',
    'header.dropdown.settings':    'Settings',
    'header.dropdown.logout':      'Sign out',
    'header.search_not_found':    'Nothing found for "{q}"',

    // Stats block
    'stats.dramas_watched':       'Dramas watched',
    'stats.dramas_unit':          'completed series',
    'stats.total_episodes':       'Total episodes',
    'stats.episodes_unit':        'episodes devoured',
    'stats.hours':                'Hours of drama',
    'stats.hours_unit':           'hours of pure bliss',

    // Filters
    'filter.all':                 'All',
    'filter.watching':            '▶ Watching',
    'filter.completed':           '✓ Completed',
    'filter.plan':                'Plan to watch',
    'filter.dropped':             'Dropped',
    'filter.genre.romance':       'Romance',
    'filter.genre.thriller':      'Thriller',
    'filter.genre.historical':    'Historical',
    'filter.genre.fantasy':       'Fantasy',
    'filter.country.kr':          '🇰🇷 Korea',
    'filter.country.cn':          '🇨🇳 China',
    'filter.country.jp':          '🇯🇵 Japan',

    // Home page
    'home.currently_watching':    'Currently Watching',
    'home.see_all':               'See all →',
    'home.recent_activity':       'Recent Activity',
    'home.view_all':              'View all →',

    // Activity
    'activity.added_rating':      'Rating added',
    'activity.added_plan':        'Added to Plan to Watch',
    'activity.time.just_now':     'Just now',
    'activity.time.hours_ago':    '{h}h ago',
    'activity.time.yesterday':    'Yesterday',
    'activity.time.days_ago':     '{d} days ago',

    // Sidebar
    'sidebar.by_country':         'By Country',
    'sidebar.badges':             'Your Badges',
    'sidebar.badge.drama_queen':  'Drama Queen',
    'sidebar.badge.kdrama_fan':   'K-Drama Fan',
    'sidebar.badge.cdrama':       'C-Drama Explorer',
    'sidebar.badge.2000h':        '2000h Club',
    'sidebar.badge.night_owl':    'Night Owl',
    'sidebar.badge.100dramas':    '100 Dramas',

    // Card / status badges
    'status.watching':            'Watching',
    'status.completed':           'Completed',
    'status.plan':                'Plan to watch',
    'status.dropped':             'Dropped',
    'status.ongoing':             'Ongoing',

    // Unauthorized page
    'unauth.eyebrow':             'Drama tracker for true connoisseurs ✦',
    'unauth.title_pre':           'Your personal',
    'unauth.title_em':            'drama diary',
    'unauth.title_post':          '',
    'unauth.subtitle':            'Track what you\'ve watched, plan what\'s next, share your impressions. All in one place.',
    'unauth.cta':                 '✦ Sign in',
    'unauth.cta_legacy':           '✦ Start for free',
    'unauth.hot_title':           'You might enjoy',
    'unauth.hot_source_prefix':   'Hot picks from',
    'unauth.banner_title':        'Start tracking your dramas',
    'unauth.banner_sub':          'Save your list, rate shows, follow ongoing series',
    'unauth.banner_btn':          'Sign in / Register',
    'unauth.quote_label':         '— Quote of the day —',

    // Empty / loading
    'empty.no_dramas':            'Your list is empty. Add your first drama!',
    'empty.add_btn':              '+ Add drama',
    'loading':                    'Loading…',

    // Login modal
    'modal.close':                'Close',
    'modal.login.title':          'Welcome back home',
    'modal.login.sub':            'Sign in to your favourite account',
    'modal.login.email':          'Email',
    'modal.login.password':       'Password',
    'modal.login.btn':            'Sign in',
    'modal.login.or':             'or',
    'modal.login.to_register':    'Create an account',
    'modal.login.email_ph':       'your@email.com',
    'modal.login.pass_ph':        '••••••••',
    'modal.login.err_email':      '⚠ Invalid email address',
    'modal.login.success':        '✓ Signed in! (TODO: connect to API)',

    // Add Drama modal
    'modal.add.title':                  'New Drama',
    'modal.add.sub':                    'Add to my list',
    'modal.add.duplicate.title':        'Already in your list',
    'modal.add.duplicate.text':         'This drama is already in your list.',
    'modal.add.field.title':            'Drama title',
    'modal.add.field.title_ph':         'e.g. My Demon',
    'modal.add.field.title_err':        'Enter the drama title',
    'modal.add.field.where':            'Where to watch',
    'modal.add.field.where_ph':         'Pick a streaming site…',
    'modal.add.field.year':             'Release year',
    'modal.add.field.country':          'Country',
    'modal.add.field.genre':            'Genre',
    'modal.add.section.details':        'Details',
    'modal.add.section.tags':           'Tags & status',
    'modal.add.section.rating':         'Rating',
    'modal.add.tag.release':            'Release',
    'modal.add.tag.released':           'Released',
    'modal.add.tag.ongoing':            'Ongoing',
    'modal.add.tag.translation':        'Translation',
    'modal.add.tag.translated':         'Translated',
    'modal.add.tag.translating':        'In progress',
    'modal.add.status.label':           'Watch status',
    'modal.add.status.value':           'Plan to watch',
    'modal.add.status.hint':            'New dramas are always added as \'Plan to watch\'',
    'modal.add.rating.optional':        'optional',
    'modal.add.rating.hint':            'Click a star to rate',
    'modal.add.rating.1':               'Terrible 😬',
    'modal.add.rating.2':               'Weak 😕',
    'modal.add.rating.3':               'OK 🙂',
    'modal.add.rating.4':               'Good ✨',
    'modal.add.rating.5':               'Masterpiece 🌸',
    'modal.add.btn':                    'Add to list',
    'modal.add.btn.loading':            'Adding…',
    'modal.add.btn.success':            'Added ✓',
    'modal.add.sites.ru_label':         'Russian-language',
    'modal.add.sites.intl_label':       'International',
    'modal.add.genres.romance':         'Romance',
    'modal.add.genres.thriller':        'Thriller',
    'modal.add.genres.historical':      'Historical',
    'modal.add.genres.fantasy':         'Fantasy',
    'modal.add.genres.comedy':          'Comedy',
    'modal.add.genres.drama':           'Drama',
    'modal.add.genres.action':          'Action',
    'modal.add.genres.mystery':         'Mystery',
    'modal.add.genres.horror':          'Horror',
    'modal.add.genres.documentary':     'Documentary',
    'modal.add.country.kr':             '🇰🇷 Korea',
    'modal.add.country.cn':             '🇨🇳 China',
    'modal.add.country.jp':             '🇯🇵 Japan',
    'modal.add.country.other':          '🌏 Other',

    // Register modal
    'modal.reg.title':            'Become a legend',
    'modal.reg.sub':              'Create an account and start your journey',
    'modal.reg.name':             'Name',
    'modal.reg.name_ph':          'What’s your name?',
    'modal.reg.email':            'Email',
    'modal.reg.password':         'Password',
    'modal.reg.pass_ph':          'At least 8 characters',
    'modal.reg.btn':              'Create account',
    'modal.reg.or':               'or',
    'modal.reg.to_login':         'Sign in',
    'modal.reg.err_name':         '⚠ Name is too short',
    'modal.reg.err_email':        '⚠ Invalid email address',
    'modal.reg.err_pass':         '⚠ At least 8 characters',
    'modal.reg.success':          '✓ Account created! (TODO: connect to API)',
  },
};

// ─── State ────────────────────────────────────────────────────
const STORAGE_KEY = 'hanbin_lang';
const SUPPORTED   = ['ru', 'en'];
const listeners   = new Set();

function detectDefaultLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch (_) {}
  // Auto-detect from browser
  const browser = (navigator.language || 'ru').slice(0, 2).toLowerCase();
  return SUPPORTED.includes(browser) ? browser : 'ru';
}

let _currentLang = detectDefaultLang();

// ─── Public API ───────────────────────────────────────────────

/** Возвращает текущий язык: 'ru' | 'en' */
export function getLang() { return _currentLang; }

/** Переключает язык и уведомляет подписчиков */
export function setLang(lang) {
  if (!SUPPORTED.includes(lang)) return;
  _currentLang = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
  document.documentElement.lang = lang;
  listeners.forEach(fn => fn(lang));
}

/** Подписаться на смену языка */
export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn); // возвращает unsubscribe
}

/**
 * Возвращает перевод по ключу.
 * Поддерживает интерполяцию: t('activity.time.hours_ago', { h: 3 }) → '3h ago'
 */
export function t(key, vars = {}) {
  const dict = translations[_currentLang] || translations.ru;
  let str = dict[key] ?? translations.ru[key] ?? key;
  // Simple interpolation: replace {varName} placeholders
  Object.entries(vars).forEach(([k, v]) => {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  });
  return str;
}
