/**
 * HANBIN — Latest Dramas from doramyclub.art
 *
 * Пытается загрузить последние дорамы через allorigins.win (CORS-прокси).
 * Если не получилось — показывает данные из mock.
 *
 * Каждая карточка содержит:
 *   - постер
 *   - название
 *   - год выпуска
 *   - жанр
 *   - тег «Выходит» / «Завершён»
 *   - количество эпизодов / сезонов
 * Кликнув на карточку или кнопку «Смотреть», пользователь переходит на doramyclub.art.
 */

const SITE_URL = 'https://doramyclub.art/';
const PROXY    = `https://api.allorigins.win/get?url=${encodeURIComponent(SITE_URL)}`;
const LIMIT    = 10;

// picsum.photos — стабильный CDN без ограничений hotlink
// Каждый seed дает уникальную картинку нужного размера
const cover = (seed) => `https://picsum.photos/seed/${seed}/300/450`;

// ── Fallback mock-данные (реальные тайтлы с сайта, обновлены 03.2026) ──────
const FALLBACK = [
  {
    title: 'Не стоило целоваться',
    year: 2025,
    genres: ['Романтика', 'Комедия'],
    ongoing: false,
    episodes: 16,
    seasons: 1,
    url: 'https://doramyclub.art/',
    cover: cover('kiss2025'),
  },
  {
    title: 'Неприятно познакомиться',
    year: 2025,
    genres: ['Романтика'],
    ongoing: false,
    episodes: 12,
    seasons: 1,
    url: 'https://doramyclub.art/',
    cover: cover('meet2025'),
  },
  {
    title: 'Струящаяся над рекой луна',
    year: 2025,
    genres: ['Исторические', 'Романтика'],
    ongoing: true,
    episodes: 40,
    seasons: 1,
    url: 'https://doramyclub.art/',
    cover: cover('moon2025'),
  },
  {
    title: 'Последнее лето',
    year: 2025,
    genres: ['Мелодрама'],
    ongoing: false,
    episodes: 16,
    seasons: 1,
    url: 'https://doramyclub.art/',
    cover: cover('summer2025'),
  },
  {
    title: 'Любовь на бирюзовой земле',
    year: 2025,
    genres: ['Романтика', 'Фэнтези'],
    ongoing: true,
    episodes: 24,
    seasons: 1,
    url: 'https://doramyclub.art/',
    cover: cover('love2025'),
  },
  {
    title: 'Цена признания',
    year: 2025,
    genres: ['Триллер', 'Мистика'],
    ongoing: false,
    episodes: 12,
    seasons: 1,
    url: 'https://doramyclub.art/',
    cover: cover('confession2025'),
  },
  {
    title: 'Слепленный город',
    year: 2025,
    genres: ['Боевик', 'Мелодрама'],
    ongoing: false,
    episodes: 20,
    seasons: 1,
    url: 'https://doramyclub.art/',
    cover: cover('city2025'),
  },
  {
    title: 'Босс компании Тайфун',
    year: 2025,
    genres: ['Романтика', 'Комедия'],
    ongoing: true,
    episodes: 24,
    seasons: 1,
    url: 'https://doramyclub.art/',
    cover: cover('boss2025'),
  },
  {
    title: 'Битва за любовь',
    year: 2025,
    genres: ['Фэнтези', 'Романтика'],
    ongoing: true,
    episodes: 36,
    seasons: 1,
    url: 'https://doramyclub.art/',
    cover: cover('battle2025'),
  },
  {
    title: 'Мелодия дракон Инь',
    year: 2025,
    genres: ['Исторические', 'Фэнтези'],
    ongoing: false,
    episodes: 40,
    seasons: 1,
    url: 'https://doramyclub.art/',
    cover: cover('dragon2025'),
  },
];

// ── Parser: вытаскивает карточки из HTML главной страницы doramyclub.art ───
function parseDoramas(html) {
  const parser = new DOMParser();
  const doc    = parser.parseFromString(html, 'text/html');
  const items  = [];

  const cards = doc.querySelectorAll(
    '.short-film, .th-item, .item, article.short, .card, .latest-item, .short'
  );

  cards.forEach(card => {
    try {
      const titleEl = card.querySelector(
        '.short-title, .th-title, h2, h3, .title, .film-name, a[title]'
      );
      const title = titleEl?.textContent?.trim() || titleEl?.getAttribute('title');
      if (!title) return;

      const linkEl = card.querySelector('a');
      const url    = linkEl?.href || SITE_URL;

      // Постер — берём src и проверяем что это не svg/иконка
      const imgEl = card.querySelector('img');
      let posterSrc = imgEl?.src || imgEl?.dataset?.src || '';
      // Если постер не загрузился с сайта — падаем на picsum
      if (!posterSrc || posterSrc.includes('data:') || posterSrc.length < 10) {
        posterSrc = cover(encodeURIComponent(title));
      }

      const text = card.textContent || '';
      const yearMatch = text.match(/20\d{2}/);
      const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

      const genreEls = card.querySelectorAll('.genre, .cat, .tag, .genres a, .short-cat a');
      const genres = genreEls.length
        ? Array.from(genreEls).map(g => g.textContent.trim()).filter(Boolean)
        : ['Дорама'];

      const ongoing = /выходит|ongoing|сейчас\s*показывают|в\s*эфире/i.test(text);

      const episodeMatch = text.match(/(\d+)\s*(?:серий|серия|ep)/i);
      const episodes = episodeMatch ? parseInt(episodeMatch[1]) : null;

      const seasonMatch = text.match(/(\d+)\s*сез/i);
      const seasons = seasonMatch ? parseInt(seasonMatch[1]) : 1;

      items.push({ title, url, cover: posterSrc, year, genres, ongoing, episodes, seasons });
    } catch (_) {
      // skip broken card
    }
  });

  return items;
}

// ── Fetch latest from site (with CORS proxy) ──────────────────────────────
async function fetchLatestDramas() {
  try {
    const res = await fetch(PROXY, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const items = parseDoramas(json.contents || '');

    // Если постеры с сайта — заменяем битые на picsum через onerror в HTML
    return items.length >= 3 ? items.slice(0, LIMIT) : null;
  } catch (err) {
    console.warn('[LatestFromSite] fetch failed, using fallback:', err.message);
    return null;
  }
}

// ── Render ────────────────────────────────────────────────────────────────
export async function renderLatestFromSite(container) {
  // Skeleton while loading
  container.innerHTML = `
    <section class="section latest-section">
      <div class="section-header">
        <div class="section-title">Последние с&nbsp;ДорамыКлуб</div>
        <a class="see-all latest-site-link" href="${SITE_URL}" target="_blank" rel="noopener">
          Перейти на сайт ↗
        </a>
      </div>
      <div class="latest-grid">
        ${Array.from({ length: LIMIT }).map((_, i) => `
          <div class="latest-card latest-card--skeleton">
            <div class="latest-card__cover skeleton-box"></div>
            <div class="latest-card__body">
              <div class="skeleton-line" style="width:80%;height:14px;margin-bottom:8px"></div>
              <div class="skeleton-line" style="width:50%;height:10px"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  const dramas = (await fetchLatestDramas()) ?? FALLBACK;

  const grid = container.querySelector('.latest-grid');
  grid.innerHTML = dramas.slice(0, LIMIT).map((d, i) => latestCardHTML(d, i)).join('');

  // Click events → open on site
  grid.querySelectorAll('.latest-card').forEach((card, i) => {
    const url = dramas[i]?.url || SITE_URL;
    card.addEventListener('click', () => window.open(url, '_blank', 'noopener'));
    card.querySelector('.latest-card__go')?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.open(url, '_blank', 'noopener');
    });
  });
}

// ── Card HTML ─────────────────────────────────────────────────────────────
function latestCardHTML(d, index) {
  const statusClass = d.ongoing ? 'latest-badge--ongoing' : 'latest-badge--done';
  const statusText  = d.ongoing ? 'Выходит' : 'Завершён';
  const episodeInfo = [
    d.episodes  ? `${d.episodes} эп.`  : null,
    d.seasons > 1 ? `${d.seasons} сез.` : null,
  ].filter(Boolean).join(' · ') || 'Неизвестно';

  const genre = (d.genres?.[0]) || 'Дорама';

  // fallback picsum на случай если постер с сайта не загрузится
  const fallbackSrc = cover(encodeURIComponent(d.title || index));

  return `
    <div class="latest-card" style="animation: fadeUp 0.5s ${0.05 + index * 0.05}s ease both; cursor:pointer">
      <div class="latest-card__cover">
        <img
          src="${d.cover}"
          alt="${d.title}"
          loading="lazy"
          onerror="this.onerror=null; this.src='${fallbackSrc}'"
        >
        <div class="latest-card__overlay"></div>
        <span class="latest-badge ${statusClass}">${statusText}</span>
        <button class="latest-card__go" title="Смотреть на сайте">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M7 17L17 7M17 7H7M17 7v10"/>
          </svg>
        </button>
      </div>
      <div class="latest-card__body">
        <div class="latest-card__title">${d.title}</div>
        <div class="latest-card__meta">
          <span class="latest-card__year">${d.year}</span>
          <span class="latest-card__genre">${genre}</span>
        </div>
        <div class="latest-card__eps">${episodeInfo}</div>
      </div>
    </div>
  `;
}

// ── Styles (injected once) ────────────────────────────────────────────────
let _stylesInjected = false;
export function injectLatestStyles() {
  if (_stylesInjected) return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    /* ── Latest Section ──────────────────────────────────── */
    .latest-section { margin-bottom: 48px; }

    .latest-site-link {
      font-size: 12px;
      color: var(--color-rose, #c97b8a);
      text-decoration: none;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      opacity: 0.85;
      transition: opacity 0.2s;
    }
    .latest-site-link:hover { opacity: 1; text-decoration: underline; }

    /* ── Grid ── */
    .latest-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
    }

    @media (max-width: 1100px) { .latest-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 820px)  { .latest-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 560px)  { .latest-grid { grid-template-columns: repeat(2, 1fr); } }

    /* ── Card ── */
    .latest-card {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(232,196,184,0.1);
      border-radius: 14px;
      overflow: hidden;
      transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .latest-card:hover {
      transform: translateY(-5px);
      border-color: rgba(201,123,138,0.35);
      box-shadow: 0 16px 32px rgba(0,0,0,0.25);
    }

    /* Cover */
    .latest-card__cover {
      position: relative;
      aspect-ratio: 2/3;
      overflow: hidden;
      background: rgba(255,255,255,0.04);
    }
    .latest-card__cover img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
      display: block;
    }
    .latest-card:hover .latest-card__cover img { transform: scale(1.05); }

    .latest-card__overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(45,15,42,0.92) 0%, transparent 55%);
    }

    /* Status badge */
    .latest-badge {
      position: absolute;
      top: 9px; left: 9px;
      padding: 3px 9px;
      border-radius: 20px;
      font-size: 9px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 600;
      backdrop-filter: blur(8px);
    }
    .latest-badge--ongoing {
      background: rgba(255,107,138,0.28);
      color: #ff6b8a;
      border: 1px solid rgba(255,107,138,0.4);
    }
    .latest-badge--done {
      background: rgba(212,165,116,0.28);
      color: #d4a574;
      border: 1px solid rgba(212,165,116,0.4);
    }

    /* Go-to-site button */
    .latest-card__go {
      position: absolute;
      bottom: 9px; right: 9px;
      width: 28px; height: 28px;
      border-radius: 50%;
      background: rgba(201,123,138,0.85);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      opacity: 0;
      transform: scale(0.7);
      transition: opacity 0.25s, transform 0.25s;
    }
    .latest-card:hover .latest-card__go { opacity: 1; transform: scale(1); }

    /* Body */
    .latest-card__body { padding: 11px 12px 13px; }

    .latest-card__title {
      font-family: var(--font-display, 'Cormorant Garamond', serif);
      font-size: 14px;
      font-weight: 400;
      color: var(--color-text, #f5e6d3);
      line-height: 1.3;
      margin-bottom: 5px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .latest-card__meta {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 5px;
    }
    .latest-card__year {
      font-size: 10px;
      color: rgba(245,230,211,0.4);
    }
    .latest-card__genre {
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 20px;
      background: rgba(255,255,255,0.07);
      color: rgba(245,230,211,0.5);
    }

    .latest-card__eps {
      font-size: 10px;
      color: rgba(245,230,211,0.35);
    }

    /* ── Skeleton ── */
    .latest-card--skeleton { pointer-events: none; }
    .skeleton-box {
      width: 100%;
      aspect-ratio: 2/3;
      background: rgba(255,255,255,0.06);
      animation: skeletonPulse 1.5s ease-in-out infinite;
    }
    .skeleton-line {
      border-radius: 6px;
      background: rgba(255,255,255,0.06);
      animation: skeletonPulse 1.5s ease-in-out infinite;
    }
    @keyframes skeletonPulse {
      0%, 100% { opacity: 0.5; }
      50%       { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}
