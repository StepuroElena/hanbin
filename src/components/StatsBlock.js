/**
 * HANBIN — Stats Block Component
 * Hero-секция с большими числами и мотивационным баннером
 */

import { getUser } from '../api/mock.js';

export async function renderStatsBlock(container) {
  const { data: user } = await getUser();
  const { stats, badges } = user;

  container.innerHTML = `
    <section class="hero-section">
      <div class="milestone-banner">
        <div class="milestone-dot"></div>
        <span>${stats.milestoneMessage} ✦</span>
      </div>

      <div class="stats-grid">
        <div class="stat-card glass-card" data-stat="dramas">
          <div class="stat-label">Dramas watched</div>
          <div class="stat-number stat-number--shimmer" id="stat-dramas">${stats.dramasWatched}</div>
          <div class="stat-unit">completed series</div>
        </div>

        <div class="stat-card glass-card" data-stat="episodes">
          <div class="stat-label">Total episodes</div>
          <div class="stat-number" id="stat-episodes">${stats.totalEpisodes.toLocaleString()}</div>
          <div class="stat-unit">episodes devoured</div>
        </div>

        <div class="stat-card glass-card" data-stat="hours">
          <div class="stat-label">Hours of drama</div>
          <div class="stat-number" id="stat-hours">${stats.totalHours.toLocaleString()}</div>
          <div class="stat-unit">hours of pure bliss</div>
        </div>

        <div class="quote-card" data-stat="milestone">
          <div class="quote-emoji">🌸</div>
          <div class="quote-text">"${stats.milestoneMessage}"</div>
          <div class="quote-sub">Milestone unlocked · ${stats.milestone} ✦</div>
        </div>
      </div>
    </section>
  `;

  // Animate numbers counting up
  animateNumber(container.querySelector('#stat-dramas'), stats.dramasWatched);
  animateNumber(container.querySelector('#stat-episodes'), stats.totalEpisodes);
  animateNumber(container.querySelector('#stat-hours'), stats.totalHours);
}

function animateNumber(el, target) {
  if (!el) return;
  let current = 0;
  const duration = 1000;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    current = Math.floor(eased * target);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}
