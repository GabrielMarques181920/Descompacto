// ============================================================
// 4 PAREDES — página de vendas (comportamento)
// Mascotes vivos, ticker de desafios reais, reveal e contadores
// ============================================================
import { icon, iconNameFor } from './icons.js';
import { mascot } from './mascots.js';
import { NODES, EXTRA } from './content.js';

// ---------- ícones declarativos ----------
for (const el of document.querySelectorAll('i[data-icon]')) {
  const size = Number(el.dataset.size || 16);
  el.innerHTML = icon(el.dataset.icon, size);
}

// ---------- a dupla nos pontos-chave ----------
function duo(host, { left = 'love', right = 'wink', cls = '' } = {}) {
  if (!host || host.dataset.done) return;
  host.dataset.done = '1';
  host.appendChild(mascot('gota', left, { anim: 'idle', cls }));
  host.appendChild(mascot('chispa', right, { anim: 'idle', cls }));
}
duo(document.querySelector('#hero-duo'));
duo(document.querySelector('#final-duo'), { left: 'wink', right: 'love' });

// ---------- ticker com desafios reais do jogo ----------
function buildTicker() {
  const host = document.querySelector('#ticker');
  if (!host) return;
  // uma amostra por temporada + alguns extras, sem spoilers pesados (nível 3)
  const picks = [];
  for (const u of ['u1', 'u2', 'u3', 'u4', 'u5', 'u6']) {
    const nodes = NODES.filter((n) => n.unit?.id === u && !n.boss && n.level !== 3 && n.title);
    if (nodes.length) picks.push(nodes[(nodes.length - 1) % nodes.length]);
  }
  const extras = EXTRA.filter((e) => e.level === 2 && e.title).slice(0, 4);
  const items = [...picks, ...extras];
  const line = items
    .map((it) => `<span>${icon(iconNameFor(it.em), 14)}${it.title}</span>`)
    .join('');
  host.innerHTML = line + line; // duplicado p/ loop contínuo
}
buildTicker();

// ---------- reveal on scroll ----------
const revealables = [...document.querySelectorAll('.reveal')];
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );
  revealables.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 3, 2) * 70}ms`;
    io.observe(el);
  });
} else {
  revealables.forEach((el) => el.classList.add('in'));
}

// ---------- contadores animados ----------
function countUp(el) {
  const target = Number(el.dataset.count || el.textContent || 0);
  const dur = 1100;
  const t0 = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = String(Math.round(target * eased));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const counters = [...document.querySelectorAll('[data-count]')];
if ('IntersectionObserver' in window) {
  const io2 = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        countUp(e.target);
        io2.unobserve(e.target);
      }
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => io2.observe(el));
} else {
  counters.forEach(countUp);
}

// ---------- ano do rodapé ----------
const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());
