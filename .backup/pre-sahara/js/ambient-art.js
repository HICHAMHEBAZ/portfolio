// Ambient life for each chapter: small props from the film's world that keep
// moving after the scroll stops. Never generic decoration:
//   proof  - the projector beam the reel plays through, dust turning in the light
//   cases  - a paper-cut sun (Tafilalt), steam off the plate (Okla), questions in the air (Wa3i)
//   method - wind across the road, tyre tracks behind the convoy
//   notes  - a VU meter on the floor that jumps with the scroll
//   night  - stars, a falling one now and then, the ⵣ drawn as a constellation
//   cta    - a flock crossing the sun, motes rising in the light
// Built from constants only (no user input), so innerHTML is safe here.
import { rng } from './seam-art.js';

const pct = (v) => `${v.toFixed(1)}%`;
const sec = (v) => `${v.toFixed(2)}s`;
const vars = (o) => Object.entries(o).map(([k, v]) => `--${k}:${v}`).join(';');

// ---------- Ch. 03: the projector ----------
export function beam() {
  const rnd = rng(11);
  const motes = Array.from({ length: 34 }, () => `<i style="${vars({
    x: pct(rnd() * 100), y: pct(rnd() * 100), s: (0.6 + rnd() * 1.4).toFixed(2), d: sec(7 + rnd() * 9), dl: sec(-rnd() * 14),
  })}"></i>`).join('');
  return `<div class="beam__cone"></div><div class="beam__motes">${motes}</div>`;
}

// ---------- Tafilalt: a sun cut from red paper ----------
function tornCircle(rnd, r, n = 72) {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + (rnd() - 0.5) * 0.04);
    return `${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`;
  });
  return `M${pts.join(' L')}Z`;
}

function tornEdge(rnd, base, amp, n = 48) {
  const W = 1440;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const x = (i / n) * W;
    const y = base + Math.sin(i * 0.35) * amp + (rnd() - 0.5) * 8;
    return `${x.toFixed(0)} ${y.toFixed(1)}`;
  });
  return `M0 240 L${pts.join(' L')} L${W} 240Z`;
}

export function collageSun() {
  const rnd = rng(5);
  const disc = tornCircle(rnd, 230);
  const patch = tornCircle(rnd, 120);
  return `
    <div class="sun" data-px="18"><div class="sun__paper">
      <svg viewBox="-300 -300 600 600">
        <defs><filter id="paper-grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 .9"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>
        <path d="${disc}" fill="#2a0e3c" opacity=".35" transform="translate(12 16)"/>
        <path d="${disc}" fill="#c8261c"/>
        <path d="${patch}" fill="#e0412f" transform="translate(-70 -80)"/>
        <path d="${disc}" fill="#fff" filter="url(#paper-grain)" opacity=".22"/>
      </svg>
    </div></div>
    <svg class="dunes" viewBox="0 0 1440 240" preserveAspectRatio="none">
      <path class="dune dune--back" d="${tornEdge(rnd, 70, 26)}" fill="#5a1a6e" stroke="#f2a54a" stroke-opacity=".45" stroke-width="2"/>
      <path class="dune dune--front" d="${tornEdge(rnd, 140, 20)}" fill="#2a0e3c" stroke="#f2a54a" stroke-opacity=".6" stroke-width="2"/>
    </svg>`;
}

// ---------- Okla: steam off the plate, leaves on the wind ----------
const LEAF = '<svg viewBox="0 0 20 30"><path d="M10 0 C20 8 18 22 10 30 C2 22 0 8 10 0Z" fill="currentColor"/><path d="M10 4 V27" stroke="#14301a" stroke-width="1" opacity=".5"/></svg>';

export function steam() {
  const rnd = rng(17);
  const wisps = [0, 1, 2].map((i) => {
    const x = 70 + i * 70;
    return `<path class="wisp" pathLength="100" style="${vars({ dl: sec(-i * 1.7) })}" d="M${x} 400 C${x - 40} 330 ${x + 50} 290 ${x + 10} 220 S${x - 30} 120 ${x + 20} 30"/>`;
  }).join('');
  const leaves = Array.from({ length: 6 }, () => `<span class="leaf" style="${vars({
    x: pct(rnd() * 100), d: sec(11 + rnd() * 8), dl: sec(-rnd() * 18), r: `${(rnd() * 360).toFixed(0)}deg`,
  })}">${LEAF}</span>`).join('');
  return `<div class="steam" data-px="10"><svg viewBox="0 0 360 420">${wisps}</svg></div>${leaves}`;
}

// ---------- Wa3i: questions in the air ----------
// [glyph, size rem, x %, y %, style, depth]
const QUESTIONS = [
  ['?', 22, 58, 4, 'outline', 1.2], ['؟', 9, 8, 10, 'hot', 0.6], ['?', 5, 44, 30, 'bone', 0.3],
  ['؟', 16, 78, 52, 'outline', 1], ['?', 7, 2, 66, 'bone', 0.5], ['?', 12, 36, 74, 'hot', 0.8],
  ['؟', 4, 92, 18, 'bone', 0.25], ['?', 6, 66, 86, 'bone', 0.4],
];

export function questions() {
  const rnd = rng(41);
  return QUESTIONS.map(([g, size, x, y, kind, depth]) => `<span class="q q--${kind}" data-depth="${depth}" data-px="${(depth * 26).toFixed(0)}" style="${vars({
    size: `${size}rem`, x: `${x}%`, y: `${y}%`, d: sec(5 + rnd() * 4), dl: sec(-rnd() * 6),
  })}">${g}</span>`).join('');
}

// ---------- Ch. 04: wind on the road ----------
export function wind() {
  const rnd = rng(29);
  return Array.from({ length: 14 }, () => `<span class="gust" style="${vars({
    y: pct(4 + rnd() * 70), w: `${(8 + rnd() * 16).toFixed(0)}vw`, d: sec(5 + rnd() * 6), dl: sec(-rnd() * 11),
  })}"></span>`).join('');
}

export function trail() {
  return '<svg viewBox="0 0 1000 14" preserveAspectRatio="none"><path d="M0 3 H1000"/><path d="M0 11 H1000"/></svg>';
}

// ---------- Ch. 05: VU meter ----------
export function eq() {
  const rnd = rng(53);
  return Array.from({ length: 48 }, (_, i) => {
    // louder in the middle of the band, like a real spectrum
    const mid = 1 - Math.abs(i / 47 - 0.45) * 1.3;
    return `<i style="${vars({
      lo: (0.08 + rnd() * 0.12).toFixed(2), hi: Math.max(0.2, mid * (0.6 + rnd() * 0.4)).toFixed(2),
      d: sec(0.35 + rnd() * 0.6), dl: sec(-rnd()),
    })}"></i>`;
  }).join('');
}

// ---------- Ch. 06/07: the night sky ----------
// ⵣ (yaz), the Amazigh sign from the logo, drawn as a constellation
const YAZ = [[0, -70], [0, 70], [-46, -70], [-30, -36], [0, -24], [30, -36], [46, -70], [-46, 70], [-30, 36], [0, 24], [30, 36], [46, 70]];
const YAZ_PATH = 'M0 -70 L0 70 M-46 -70 L-30 -36 L0 -24 L30 -36 L46 -70 M-46 70 L-30 36 L0 24 L30 36 L46 70';

function yaz() {
  const stars = YAZ.map(([x, y]) => `<circle class="yaz__star" cx="${x}" cy="${y}" r="2.6"/>`).join('');
  return `<div class="yaz" data-px="14"><svg viewBox="-60 -84 120 168"><path class="yaz__line" pathLength="1" d="${YAZ_PATH}"/>${stars}</svg></div>`;
}

function sky(seed, withYaz) {
  const rnd = rng(seed);
  const dots = Array.from({ length: 64 }, () => `<circle class="tw" style="${vars({ d: sec(2.5 + rnd() * 4), dl: sec(-rnd() * 6) })}" cx="${(rnd() * 1000).toFixed(0)}" cy="${(rnd() * 600).toFixed(0)}" r="${(0.6 + rnd() * 1.6).toFixed(1)}"/>`).join('');
  const meteors = [0, 1].map(() => `<b class="meteor" style="${vars({ x: pct(30 + rnd() * 60), y: pct(rnd() * 30), d: sec(9 + rnd() * 7), dl: sec(-rnd() * 9) })}"></b>`).join('');
  return `<svg class="stars" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" data-px="8"><g fill="#f4ead8">${dots}</g></svg>${meteors}${withYaz ? yaz() : ''}`;
}

export const skyYaz = () => sky(61, true);
export const skyPlain = () => sky(83, false);

// ---------- Ch. 08: flock over the sun, motes in the light ----------
export function flock() {
  const rnd = rng(71);
  const birds = Array.from({ length: 11 }, (_, i) => {
    // a loose V, leader up front
    const row = Math.ceil(i / 2);
    const side = i % 2 ? -1 : 1;
    const x = 300 - row * 34 + rnd() * 10;
    const y = 120 + side * row * 18 + rnd() * 10;
    return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${(0.8 + rnd() * 0.5).toFixed(2)})"><path class="bird" style="animation-delay:${(-rnd()).toFixed(2)}s" d="M-18 0 Q-9 -10 0 0 Q9 -10 18 0 Q9 -4 0 4 Q-9 -4 -18 0Z"/></g>`;
  }).join('');
  const motes = Array.from({ length: 16 }, () => `<i class="sunmote" style="${vars({
    x: pct(30 + rnd() * 40), y: pct(6 + rnd() * 30), s: (0.5 + rnd()).toFixed(2), dx: `${((rnd() - 0.5) * 80).toFixed(0)}px`,
    d: sec(6 + rnd() * 6), dl: sec(-rnd() * 12),
  })}"></i>`).join('');
  return `<div class="flock" data-px="20"><svg viewBox="0 0 340 240"><g fill="#5a1d55">${birds}</g></svg></div>${motes}`;
}

export const AMBIENT = { beam, collageSun, steam, questions, wind, trail, eq, skyYaz, skyPlain, flock };
