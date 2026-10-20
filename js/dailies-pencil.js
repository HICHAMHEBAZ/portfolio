// Grease-pencil strokes for the dailies: hand-drawn loops and arrows as SVG paths of
// length 1, drawn on by animating stroke-dashoffset from 1 to 0 (the .pencil rules in
// css/dailies-sheet.css). The wobble is seeded, so a loop looks the same on every visit.
const NS = 'http://www.w3.org/2000/svg';

function wobble(seed) {
  let a = seed >>> 0;
  return () => {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0;
    return a / 4294967296 - 0.5;
  };
}

// a loop around a w x h box: a little over one turn, the radius drifting outward so the
// stroke overshoots its own start the way a pencil does
export function loopPath(w, h, seed = 1) {
  const r = wobble(seed);
  const start = -1.1 + r() * 0.7;
  const steps = 44;
  const pts = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const angle = start + t * Math.PI * 2 * 1.14;
    const drift = 0.93 + t * 0.11 + r() * 0.04;
    return [w / 2 + Math.cos(angle) * (w / 2) * drift, h / 2 + Math.sin(angle) * (h / 2) * drift];
  });
  return `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}`;
}

// a short curved arrow, tail on the left, head on the right, in a 46 x 22 box
export const ARROW = { d: 'M2 15 C12 4 26 3 40 11 M32 4 L41 11 L31 17', w: 46, h: 22 };

export function pencilSvg(d, w, h, cls = '') {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', `pencil ${cls}`.trim());
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('pathLength', '1');
  svg.append(path);
  return svg;
}
