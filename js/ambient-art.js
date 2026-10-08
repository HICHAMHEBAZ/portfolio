// Ambient scenery for each chapter, in the "Erghad Afewo" grammar: one light
// source, a low wide horizon, a few silhouettes, big empty colour. Stillness is
// part of the style, so each chapter carries one quiet loop at most:
//   proof   - road blue: a high sun, a walker on the far ridge
//   tafilalt- magenta dusk: low coral sun, an acacia on the ridge
//   okla    - night green: the black eclipse sun, steam off the plate
//   wa3i    - alarm red: questions hanging in the red air
//   method  - magenta: wind across the road, tracks behind the convoy
//   notes   - tent indigo: the night circle, a lamp in the tent door
//   offer   - amber noon: sun and acacia
//   faq     - amber: one figure resting on a mound, looking at the horizon
//   cta     - eclipse: the ⵣ drawn in stars, a flock crossing the ringed sun
// Built from constants only (no user input), so innerHTML is safe here.
import { rng } from './seam-art.js';
import { land, sun, haze, figure, sitter, acacia, tent, moundPath } from './film-props.js';

const pct = (v) => `${v.toFixed(1)}%`;
const sec = (v) => `${v.toFixed(2)}s`;
const vars = (o) => Object.entries(o).map(([k, v]) => `--${k}:${v}`).join(';');

// ---------- Ch. 03: road blue ----------
export const roadSun = () => `
  ${sun(80, 16, 'clamp(80px, 9vw, 150px)')}
  ${haze([[8, 70, '40vw', '16vw', 'haze-2'], [70, 64, '34vw', '12vw']])}
  ${land(3, { far: 150, near: 236, props: figure(1180, 160, 120, { lean: -2 }) })}`;

// ---------- Tafilalt: magenta dusk ----------
export const duskSun = () => `
  ${sun(84, 12, 'clamp(150px, 20vw, 320px)')}
  ${haze([[60, 58, '44vw', '14vw'], [-6, 74, '36vw', '12vw', 'haze-2']])}
  ${land(5, { far: 110, near: 214, rim: true, props: acacia(1230, 128, 170) })}`;

// ---------- Okla: night green, steam off the plate ----------
function wisps() {
  return [0, 1, 2].map((i) => {
    const x = 70 + i * 70;
    return `<path class="wisp" pathLength="100" style="${vars({ dl: sec(-i * 1.7) })}" d="M${x} 400 C${x - 40} 330 ${x + 50} 290 ${x + 10} 220 S${x - 30} 120 ${x + 20} 30"/>`;
  }).join('');
}

export const greenSun = () => `
  ${sun(18, 12, 'clamp(70px, 8vw, 130px)', 'eclipse')}
  ${haze([[50, 70, '50vw', '14vw', 'haze-2']])}
  <div class="steam" data-px="10"><svg viewBox="0 0 360 420">${wisps()}</svg></div>
  ${land(9, { far: 170, near: 240 })}`;

// ---------- Wa3i: alarm red, questions in the air ----------
// [glyph, size rem, x %, y %, style, depth]; one hot question, the rest pale
const QUESTIONS = [
  ['?', 22, 58, 4, 'outline', 1.2], ['؟', 9, 8, 10, 'pale', 0.6], ['?', 5, 44, 30, 'pale', 0.3],
  ['؟', 16, 78, 52, 'outline', 1], ['?', 7, 2, 66, 'pale', 0.5], ['?', 12, 36, 74, 'hot', 0.8],
  ['؟', 4, 92, 18, 'pale', 0.25],
];

export function alarmSky() {
  const rnd = rng(41);
  const qs = QUESTIONS.map(([g, size, x, y, kind, depth]) => `<span class="q q--${kind}" data-depth="${depth}" data-px="${(depth * 26).toFixed(0)}" style="${vars({
    size: `${size}rem`, x: `${x}%`, y: `${y}%`, d: sec(6 + rnd() * 4), dl: sec(-rnd() * 6),
  })}">${g}</span>`).join('');
  return `${qs}${land(13, { far: 190, near: 250 })}`;
}

// ---------- Ch. 04: wind on the road ----------
export function wind() {
  const rnd = rng(29);
  const gusts = Array.from({ length: 10 }, () => `<span class="gust" style="${vars({
    y: pct(4 + rnd() * 70), w: `${(8 + rnd() * 16).toFixed(0)}vw`, d: sec(6 + rnd() * 6), dl: sec(-rnd() * 11),
  })}"></span>`).join('');
  return `${haze([[70, 10, '40vw', '16vw', 'haze-2']])}${gusts}`;
}

export function trail() {
  return '<svg viewBox="0 0 1000 14" preserveAspectRatio="none"><path d="M0 3 H1000"/><path d="M0 11 H1000"/></svg>';
}

// ---------- Ch. 05: tent indigo, the night circle ----------
function stars(seed, n, h = 600) {
  const rnd = rng(seed);
  const dots = Array.from({ length: n }, () => `<circle class="tw" style="${vars({ d: sec(3 + rnd() * 4), dl: sec(-rnd() * 6) })}" cx="${(rnd() * 1000).toFixed(0)}" cy="${(rnd() * h).toFixed(0)}" r="${(0.6 + rnd() * 1.4).toFixed(1)}"/>`).join('');
  return `<svg class="stars" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" data-px="8"><g fill="var(--sun)">${dots}</g></svg>`;
}

export const tentNight = () => `
  ${stars(61, 40, 340)}
  ${land(17, { far: 170, near: 236, props: `${tent(1160, 214, 220)}${sitter(1010, 236, 70)}${sitter(1300, 236, 64, true)}` })}`;

// ---------- Ch. 06: amber noon ----------
export const noon = () => `
  ${sun(78, 10, 'clamp(90px, 11vw, 170px)')}
  ${haze([[-8, 62, '40vw', '14vw', 'haze-2']])}
  ${land(23, { far: 170, near: 238, props: acacia(220, 186, 150) })}`;

// ---------- Ch. 07: one figure resting on a mound ----------
export const rest = () => `
  ${haze([[66, 50, '36vw', '14vw']])}
  ${land(31, {
    far: 190, near: 252,
    front: `<path class="s-land__near" d="${moundPath(37, 1220, 150, 140)}"/>${figure(1220, 158, 150, { lean: 2 })}`,
  })}`;

// ---------- Ch. 08: the finale ----------
// ⵣ (yaz), the Amazigh sign from the logo, drawn as a constellation
const YAZ = [[0, -70], [0, 70], [-46, -70], [-30, -36], [0, -24], [30, -36], [46, -70], [-46, 70], [-30, 36], [0, 24], [30, 36], [46, 70]];
const YAZ_PATH = 'M0 -70 L0 70 M-46 -70 L-30 -36 L0 -24 L30 -36 L46 -70 M-46 70 L-30 36 L0 24 L30 36 L46 70';

function yaz() {
  const pts = YAZ.map(([x, y]) => `<circle class="yaz__star" cx="${x}" cy="${y}" r="2.6"/>`).join('');
  return `<div class="yaz" data-px="14"><svg viewBox="-60 -84 120 168"><path class="yaz__line" pathLength="1" d="${YAZ_PATH}"/>${pts}</svg></div>`;
}

export function finale() {
  const rnd = rng(71);
  const birds = Array.from({ length: 9 }, (_, i) => {
    // a loose V, leader up front
    const row = Math.ceil(i / 2);
    const side = i % 2 ? -1 : 1;
    const x = 300 - row * 34 + rnd() * 10;
    const y = 120 + side * row * 18 + rnd() * 10;
    return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${(0.8 + rnd() * 0.5).toFixed(2)})"><path class="bird" style="animation-delay:${(-rnd()).toFixed(2)}s" d="M-18 0 Q-9 -10 0 0 Q9 -10 18 0 Q9 -4 0 4 Q-9 -4 -18 0Z"/></g>`;
  }).join('');
  return `${stars(83, 50, 380)}${yaz()}<div class="flock" data-px="20"><svg viewBox="0 0 340 240"><g fill="var(--land-near)">${birds}</g></svg></div>`;
}

export const AMBIENT = { roadSun, duskSun, greenSun, alarmSky, wind, trail, tentNight, noon, rest, finale };
