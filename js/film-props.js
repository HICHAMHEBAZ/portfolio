// The "Sahara Cinema" prop kit, ported from the carousel system (sahara-carousel/
// template/js/scene.js) to full-bleed web sections.
// Rules (ART-STYLE.md): silhouettes in var(--land-near), lit shapes in var(--sun) /
// var(--haze), ONE var(--hot) detail per object, flat fills, no gradients inside
// objects. Everything reads the chapter's wash tokens, so a prop is re-graded
// simply by the section it sits in. Built from constants only (no user input).
import { rng } from './seam-art.js';

export const LAND_W = 1440;
export const LAND_H = 300;
const OVER = 220; // ridges run past both edges so the ambient drift never shows a gap

// a jagged ridge closed to the bottom of the land strip
function ridgePath(seed, y, amp, step, jag) {
  const r = rng(seed);
  const pts = [];
  let drift = 0;
  for (let x = -OVER; x <= LAND_W + OVER; x += step) {
    drift = (drift + (r() - 0.5) * amp * 0.35) * 0.86;
    const wave = Math.sin((x + seed * 13) / 170) * amp * 0.5;
    pts.push(`${x},${(y + wave + drift + (r() - 0.5) * jag).toFixed(1)}`);
  }
  return `M${-OVER},${LAND_H} L${pts.join(' L')} L${LAND_W + OVER},${LAND_H}Z`;
}

// a rubble mound peaking at cx, for a figure to stand on
export function moundPath(seed, cx, peak, half) {
  const r = rng(seed);
  const pts = [];
  for (let x = cx - half * 1.6; x <= cx + half * 1.6; x += 14) {
    const t = (x - cx) / half;
    const y = peak + Math.abs(t) ** 1.6 * (LAND_H - peak) * 0.55 + (r() - 0.5) * 12;
    pts.push(`${x.toFixed(0)},${Math.min(y, LAND_H).toFixed(1)}`);
  }
  return `M${cx - half * 1.6},${LAND_H} L${pts.join(' L')} L${cx + half * 1.6},${LAND_H}Z`;
}

// low wide horizon: far ridge, near ridge, and whatever stands on them.
// `props` sits between the two ridges, `front` in front of the near one.
export function land(seed, { far = 120, near = 200, props = '', front = '', rim = false } = {}) {
  const nearD = ridgePath(seed + 7, near, 60, 14, 18);
  return `<svg class="s-land" viewBox="0 0 ${LAND_W} ${LAND_H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <path class="s-land__far" d="${ridgePath(seed, far, 50, 22, 8)}"/>
    <g class="s-land__props">${props}</g>
    ${rim ? `<path class="s-land__rim" d="${nearD}"/>` : ''}
    <path class="s-land__near" d="${nearD}"/>
    <g class="s-land__front">${front}</g>
  </svg>`;
}

// the one light source; its halo breathes (css/scenery.css)
export const sun = (x, y, size, kind = '') =>
  `<div class="s-sun${kind ? ` s-sun--${kind}` : ''}" data-px="14" style="--x:${x}%;--y:${y}%;--size:${size}"></div>`;

// out-of-focus dust blobs, never behind body copy
export const haze = (list) => list.map(([x, y, w, h, c = 'haze']) =>
  `<div class="s-haze" style="--x:${x}%;--y:${y}%;--w:${w};--h:${h};background:var(--${c})"></div>`).join('');

/* ---------- props: 2-5 shapes each ---------- */

// standing figure in a long robe and wrapped headscarf, looking at the horizon
export function figure(x, y, h, { hot = true, lean = 0 } = {}) {
  const s = h / 460;
  return `<g transform="translate(${x - 100 * s} ${y - 450 * s}) scale(${s.toFixed(3)})">
    <g transform="rotate(${lean} 100 450)" fill="var(--land-near)">
      <path d="M62 78 C60 28 140 28 138 78 C138 96 128 106 100 110 C72 106 62 96 62 78Z"/>
      <path d="M58 118 C80 104 120 104 142 118 L170 440 C140 452 60 452 30 440Z"/>
      <path d="M58 130 C20 190 28 260 44 330 L64 320 C58 260 62 200 82 150Z"/>
    </g>
    ${hot ? '<path class="s-hot" d="M64 74 C84 84 116 84 136 74" fill="none" stroke="var(--hot)" stroke-width="9" stroke-linecap="round"/>' : ''}
  </g>`;
}

// seated figure, knees up, for the night circle
export function sitter(x, y, h, flip = false) {
  const s = h / 200;
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" fill="var(--land-near)">
    <circle cx="0" cy="-168" r="24"/>
    <path d="M-30 -140 C-10 -152 18 -150 30 -136 L44 -60 L78 -56 L84 0 L-56 0 C-62 -40 -48 -110 -30 -140Z"/>
  </g>`;
}

// acacia: flat crown on a bent trunk
export function acacia(x, y, h) {
  const s = h / 360;
  return `<g transform="translate(${x - 200 * s} ${y - 360 * s}) scale(${s.toFixed(3)})" fill="var(--land-near)">
    <path d="M190 360 C196 290 186 240 170 190 C186 214 214 256 216 360Z"/>
    <path d="M176 210 C230 200 250 170 300 168 L300 176 C250 184 232 214 188 232Z"/>
    <path d="M20 150 C70 108 150 96 210 110 C270 94 350 108 384 150 C330 138 270 140 210 150 C150 140 80 138 20 150Z"/>
    <path d="M60 128 C110 96 170 88 210 98 C260 86 320 96 350 126 C300 114 250 112 210 120 C170 112 110 112 60 128Z"/>
  </g>`;
}

// nomad tent: dark canvas, a lit opening (the lamp), one hot pennant on the pole
export function tent(x, y, w) {
  const s = w / 460;
  return `<g transform="translate(${x - 230 * s} ${y - 280 * s}) scale(${s.toFixed(3)})">
    <path d="M10 280 L170 40 C200 20 260 20 290 40 L450 280Z" fill="var(--land-near)"/>
    <path class="s-lamp" d="M170 280 L210 130 C225 118 245 118 260 130 L300 280Z" fill="var(--sun)"/>
    <path d="M230 30 L230 -6" stroke="var(--land-near)" stroke-width="8" stroke-linecap="round"/>
    <path class="s-flag" d="M232 -4 L274 8 L232 20Z" fill="var(--hot)"/>
  </g>`;
}

// ringed sun: ink disc 4px smaller than the light, a thin cream ring left over
export function ringedSun() {
  return `<svg class="s-ring" viewBox="0 0 220 220" aria-hidden="true">
    <circle cx="110" cy="110" r="104" fill="var(--hot)" opacity=".35"/>
    <circle cx="110" cy="110" r="84" fill="none" stroke="var(--paper)" stroke-width="9"/>
    <circle cx="110" cy="110" r="76" fill="var(--land-near)"/>
  </svg>`;
}
