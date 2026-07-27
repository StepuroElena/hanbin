/**
 * HANBIN — Countries List
 * Используется в дропдауне «Страна выпуска» на модалке добавления фильма (с поиском).
 * Названия — на русском и английском (переключаются вместе с языком интерфейса).
 * Список не претендует на исчерпывающую полноту ISO 3166-1 — покрывает основные страны мира.
 */

export const COUNTRIES = [
  { code: 'kr', flag: '🇰🇷', ru: 'Южная Корея',        en: 'South Korea' },
  { code: 'cn', flag: '🇨🇳', ru: 'Китай',              en: 'China' },
  { code: 'jp', flag: '🇯🇵', ru: 'Япония',             en: 'Japan' },
  { code: 'us', flag: '🇺🇸', ru: 'США',                en: 'United States' },
  { code: 'gb', flag: '🇬🇧', ru: 'Великобритания',      en: 'United Kingdom' },
  { code: 'fr', flag: '🇫🇷', ru: 'Франция',            en: 'France' },
  { code: 'de', flag: '🇩🇪', ru: 'Германия',            en: 'Germany' },
  { code: 'it', flag: '🇮🇹', ru: 'Италия',             en: 'Italy' },
  { code: 'es', flag: '🇪🇸', ru: 'Испания',            en: 'Spain' },
  { code: 'pt', flag: '🇵🇹', ru: 'Португалия',          en: 'Portugal' },
  { code: 'ru', flag: '🇷🇺', ru: 'Россия',             en: 'Russia' },
  { code: 'ua', flag: '🇺🇦', ru: 'Украина',             en: 'Ukraine' },
  { code: 'pl', flag: '🇵🇱', ru: 'Польша',             en: 'Poland' },
  { code: 'nl', flag: '🇳🇱', ru: 'Нидерланды',          en: 'Netherlands' },
  { code: 'be', flag: '🇧🇪', ru: 'Бельгия',            en: 'Belgium' },
  { code: 'se', flag: '🇸🇪', ru: 'Швеция',             en: 'Sweden' },
  { code: 'no', flag: '🇳🇴', ru: 'Норвегия',            en: 'Norway' },
  { code: 'dk', flag: '🇩🇰', ru: 'Дания',              en: 'Denmark' },
  { code: 'fi', flag: '🇫🇮', ru: 'Финляндия',          en: 'Finland' },
  { code: 'ie', flag: '🇮🇪', ru: 'Ирландия',            en: 'Ireland' },
  { code: 'ch', flag: '🇨🇭', ru: 'Швейцария',          en: 'Switzerland' },
  { code: 'at', flag: '🇦🇹', ru: 'Австрия',            en: 'Austria' },
  { code: 'gr', flag: '🇬🇷', ru: 'Греция',             en: 'Greece' },
  { code: 'cz', flag: '🇨🇿', ru: 'Чехия',              en: 'Czech Republic' },
  { code: 'hu', flag: '🇭🇺', ru: 'Венгрия',            en: 'Hungary' },
  { code: 'ro', flag: '🇷🇴', ru: 'Румыния',            en: 'Romania' },
  { code: 'tr', flag: '🇹🇷', ru: 'Турция',             en: 'Turkey' },
  { code: 'il', flag: '🇮🇱', ru: 'Израиль',            en: 'Israel' },
  { code: 'in', flag: '🇮🇳', ru: 'Индия',              en: 'India' },
  { code: 'th', flag: '🇹🇭', ru: 'Таиланд',            en: 'Thailand' },
  { code: 'vn', flag: '🇻🇳', ru: 'Вьетнам',            en: 'Vietnam' },
  { code: 'ph', flag: '🇵🇭', ru: 'Филиппины',          en: 'Philippines' },
  { code: 'id', flag: '🇮🇩', ru: 'Индонезия',          en: 'Indonesia' },
  { code: 'my', flag: '🇲🇾', ru: 'Малайзия',           en: 'Malaysia' },
  { code: 'sg', flag: '🇸🇬', ru: 'Сингапур',           en: 'Singapore' },
  { code: 'hk', flag: '🇭🇰', ru: 'Гонконг',            en: 'Hong Kong' },
  { code: 'tw', flag: '🇹🇼', ru: 'Тайвань',            en: 'Taiwan' },
  { code: 'au', flag: '🇦🇺', ru: 'Австралия',          en: 'Australia' },
  { code: 'nz', flag: '🇳🇿', ru: 'Новая Зеландия',      en: 'New Zealand' },
  { code: 'ca', flag: '🇨🇦', ru: 'Канада',             en: 'Canada' },
  { code: 'mx', flag: '🇲🇽', ru: 'Мексика',            en: 'Mexico' },
  { code: 'br', flag: '🇧🇷', ru: 'Бразилия',           en: 'Brazil' },
  { code: 'ar', flag: '🇦🇷', ru: 'Аргентина',          en: 'Argentina' },
  { code: 'cl', flag: '🇨🇱', ru: 'Чили',              en: 'Chile' },
  { code: 'co', flag: '🇨🇴', ru: 'Колумбия',           en: 'Colombia' },
  { code: 'eg', flag: '🇪🇬', ru: 'Египет',             en: 'Egypt' },
  { code: 'za', flag: '🇿🇦', ru: 'ЮАР',                en: 'South Africa' },
  { code: 'ng', flag: '🇳🇬', ru: 'Нигерия',            en: 'Nigeria' },
  { code: 'sa', flag: '🇸🇦', ru: 'Саудовская Аравия',   en: 'Saudi Arabia' },
  { code: 'ae', flag: '🇦🇪', ru: 'ОАЭ',               en: 'United Arab Emirates' },
  { code: 'ir', flag: '🇮🇷', ru: 'Иран',              en: 'Iran' },
  { code: 'kz', flag: '🇰🇿', ru: 'Казахстан',          en: 'Kazakhstan' },
  { code: 'ge', flag: '🇬🇪', ru: 'Грузия',            en: 'Georgia' },
  { code: 'am', flag: '🇦🇲', ru: 'Армения',            en: 'Armenia' },
  { code: 'by', flag: '🇧🇾', ru: 'Беларусь',           en: 'Belarus' },
  { code: 'other', flag: '🌏', ru: 'Другая',           en: 'Other' },
];

export function countryLabel(code, lang) {
  const c = COUNTRIES.find(x => x.code === code);
  if (!c) return code;
  return lang === 'en' ? c.en : c.ru;
}
