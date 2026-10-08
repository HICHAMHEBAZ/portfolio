// Wa3i -> the method: the collage is torn off the screen.
// Three sheets from Wa3i's paste-up (ink, red paper, newsprint) hang over the
// desert. Scroll rips them away one after another and scraps flutter down
// across the sky. Unlike the dust seams, this cut is paper, not weather.
// Built from constants only (no user input), so innerHTML is safe here.
import { rng } from './seam-art.js';

const EDGE_W = 1440;
const EDGE_H = 40;

// a torn bottom edge: jagged at two scales, plus a paler fibre rim just under it
function tornEdge(seed, rim) {
  const rnd = rng(seed);
  const pts = [];
  for (let x = 0; x <= EDGE_W; x += 10 + rnd() * 18) {
    const y = 10 + Math.sin(x * 0.011 + seed) * 6 + (rnd() - 0.5) * 12;
    pts.push(`${x.toFixed(0)} ${y.toFixed(1)}`);
  }
  pts.push(`${EDGE_W} ${(10 + rnd() * 8).toFixed(1)}`);
  const line = pts.join(' L');
  const rimLine = pts.map((p) => {
    const [x, y] = p.split(' ').map(Number);
    return `${x} ${(y + 3 + rnd() * 5).toFixed(1)}`;
  }).join(' L');
  return `<svg class="tear__edge" viewBox="0 0 ${EDGE_W} ${EDGE_H}" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 0 L${rimLine} L${EDGE_W} 0Z" fill="${rim}"/>
    <path d="M0 0 L${line} L${EDGE_W} 0Z" class="tear__fill"/>
  </svg>`;
}

// [kind, edge % of band height, seed, rim colour]; back to front
const SHEETS = [
  ['news', 66, 3, '#fffaf0'],
  ['red', 54, 9, '#f6d5c8'],
  ['ink', 42, 15, 'rgb(244 234 216 / .75)'],
];

function sheet([kind, edge, seed, rim]) {
  return `<div class="tear__sheet tear__sheet--${kind}" data-tear="${kind}" style="--edge:${edge}%">${tornEdge(seed, rim)}</div>`;
}

// a torn scrap: an irregular polygon cut from one of the sheets
function scrapShape(rnd) {
  const n = 7;
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = 34 + rnd() * 16;
    return `${(50 + Math.cos(a) * r).toFixed(0)}% ${(50 + Math.sin(a) * r).toFixed(0)}%`;
  }).join(',');
}

const SCRAPS = 9;

function scraps() {
  const rnd = rng(77);
  return Array.from({ length: SCRAPS }, (_, i) => {
    const kind = ['news', 'red', 'ink'][i % 3];
    const style = [
      `--x:${(4 + (i / SCRAPS) * 88 + rnd() * 6).toFixed(1)}%`,
      `--y:${(44 + rnd() * 20).toFixed(1)}%`,
      `--w:${(28 + rnd() * 46).toFixed(0)}px`,
      `--d:${(1.1 + rnd() * 1.2).toFixed(2)}s`,
      `--dl:${(-rnd() * 2).toFixed(2)}s`,
      `clip-path:polygon(${scrapShape(rnd)})`,
    ].join(';');
    const fall = (0.5 + rnd() * 0.9).toFixed(2);
    const drift = ((rnd() - 0.5) * 160).toFixed(0);
    const spin = ((rnd() > 0.5 ? 1 : -1) * (160 + rnd() * 380)).toFixed(0);
    const at = (0.08 + rnd() * 0.42).toFixed(2);
    return `<i class="scrap scrap--${kind}" data-fall="${fall}" data-drift="${drift}" data-spin="${spin}" data-at="${at}" style="${style}"></i>`;
  }).join('');
}

export function tear() {
  return `<div class="tear" aria-hidden="true">${SHEETS.map(sheet).join('')}<div class="tear__scraps">${scraps()}</div></div>`;
}
