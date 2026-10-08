// Chapter seams: the cuts between scenes, drawn the way "Erghad Afewo" stages
// its transitions: walls of cel-shaded dust roll over one scene, a lone figure
// crosses the crest, and the dust thins out into the next scene.
// Every layer is its own SVG so scroll parallax runs on the compositor and the
// "boiling" ink line only re-rasterises at 8 fps (see seams.js).
import { camel } from './elements.js';

const W = 1440;
const DEPTH = 1000; // banks fill far below the frame so parallax never shows a gap

export const SEAMS = {
  rise: {
    sky: ['#07050b', '#0d2a12'], ink: '#030805',
    banks: [['#123a1a', '#0b2511'], ['#1f5a28', '#143f1b'], ['#3f8c3a', '#2a6a2c'], ['#1a6a2c', '#11501f']],
    sun: 'eclipse', birds: '#d8f59a',
  },
  storm: {
    sky: ['#c8566a', '#e98ab9'], ink: '#1d0b26',
    banks: [['#f2a6c8', '#d97aa8'], ['#e98ab9', '#b7559a'], ['#8a4fa8', '#6a3592'], ['#23246e', '#191a55']],
    rider: 'truck',
  },
  // proof -> Tafilalt: ultramarine dust warms to the desert, a caravan on the crest
  reel: {
    sky: ['#23246e', '#6a3592'], ink: '#1d0b26',
    banks: [['#3b3fae', '#2d3090'], ['#8a4fa8', '#6a3592'], ['#e98ab9', '#c9579f'], ['#f6b36a', '#f2a54a']],
    birds: '#1d0b26', rider: 'caravan',
  },
  // Tafilalt -> Okla: the desert goes to dusk, a moon over dinner
  supper: {
    sky: ['#2a0e3c', '#1d1550'], ink: '#0b0618',
    banks: [['#4a1f6e', '#36155a'], ['#3a2a80', '#2b1f6a'], ['#3b3fae', '#2d3090'], ['#3a3c9a', '#2b2d86']],
    stars: true, sun: 'moon',
  },
  // Okla -> Wa3i: blue gives way to the green of the screens, under a black sun
  signal: {
    sky: ['#2b2d86', '#10301f'], ink: '#030805',
    banks: [['#22406a', '#1a3358'], ['#1d6b3a', '#14502b'], ['#3f8c3a', '#2a6a2c'], ['#14482a', '#0f3a20']],
    sun: 'eclipse', birds: '#c8261c',
  },
  night: {
    sky: ['#3a1450', '#1d1550'], ink: '#0b0618',
    banks: [['#4a1f6e', '#36155a'], ['#33287a', '#241c63'], ['#25317f', '#1a2468'], ['#1a2a78', '#121f5e']],
    stars: true, sun: 'moon', rider: 'caravan',
  },
  dawn: {
    sky: ['#120d1a', '#4a1840'], ink: '#1a0a1c',
    banks: [['#7a2e6a', '#5a1d55'], ['#c4689a', '#a24a85'], ['#f2a93a', '#e0862e'], ['#f6c535', '#eaa92c']],
    sun: 'dawn', birds: '#c8261c',
  },
};

// deterministic noise so the clouds look the same on every visit
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// a dust bank: big billows along a baseline, smaller curls riding on top.
// Returned as circles + a body rect so the union has no inner lines.
function billows(seed, base, rMin, rMax) {
  const rnd = rng(seed);
  const shapes = [`<rect x="-300" y="${base}" width="${W + 600}" height="${DEPTH - base}"/>`];
  let x = -240;
  while (x < W + 240) {
    const r = rMin + rnd() * (rMax - rMin);
    const cy = base + (rnd() - 0.3) * r * 0.5;
    shapes.push(`<circle cx="${x.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}"/>`);
    if (rnd() > 0.45) {
      const cr = r * (0.35 + rnd() * 0.25);
      shapes.push(`<circle cx="${(x + (rnd() - 0.5) * r).toFixed(0)}" cy="${(cy - r * 0.75).toFixed(0)}" r="${cr.toFixed(0)}"/>`);
    }
    x += r * (0.9 + rnd() * 0.6);
  }
  return shapes.join('');
}

const layer = (cls, body, extra = '') =>
  `<div class="seam__layer ${cls}"${extra}><svg viewBox="0 0 ${W} 600" preserveAspectRatio="xMidYMax slice" overflow="visible">${body}</svg></div>`;

// three flat tones like a cel: lit rim, shadow body, and a deep core low down.
// Depth comes from colour (rear banks are closer to the sky tone), not opacity,
// so nothing behind them ghosts through.
// Only the crest band boils; the solid body below it is drawn unfiltered, which
// keeps each 8 fps re-draw to a strip instead of the whole layer.
const BOIL_ABOVE = 320;
const BOIL_BELOW = 170;

const boilFilter = (id, base) => `
  <filter id="${id}" filterUnits="userSpaceOnUse" x="-320" y="${base - BOIL_ABOVE}" width="${W + 640}" height="${BOIL_ABOVE + BOIL_BELOW}">
    <feTurbulence class="boil-noise" type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="1"/>
    <feDisplacementMap in="SourceGraphic" scale="9" xChannelSelector="R" yChannelSelector="G"/>
  </filter>`;

function bankLayer(key, i, [lit, shade], ink) {
  const id = `${key}-b${i}`;
  const base = 200 + i * 100;
  const shapes = billows(i * 97 + key.length * 13, base, 46 + i * 10, 110 + i * 16);
  const body = base + BOIL_BELOW - 20;
  // the farthest bank holds still: nobody reads its edge, and it saves a filter pass
  const boils = i > 0;
  return layer('seam__bank', `
    <defs><clipPath id="${id}">${shapes}</clipPath>${boils ? boilFilter(`${id}-f`, base) : ''}</defs>
    <rect x="-320" y="${body}" width="${W + 640}" height="${DEPTH - body}" fill="${shade}"/>
    <rect x="-320" y="${body}" width="${W + 640}" height="${DEPTH - body}" fill="${ink}" opacity=".18"/>
    <g${boils ? ` filter="url(#${id}-f)"` : ''}>
      <g fill="${lit}">${shapes}</g>
      <g clip-path="url(#${id})">
        <g fill="${shade}" transform="translate(22 34)">${shapes}</g>
        <g fill="${ink}" opacity=".18" transform="translate(40 120)">${shapes}</g>
      </g>
    </g>`, ` data-depth="${i}"`);
}

function sunLayer(kind) {
  if (kind === 'eclipse') {
    return layer('seam__sun', `<g transform="translate(1040 150)"><circle r="74" fill="#6fe36a" opacity=".35" filter="url(#soft)"/><circle r="52" fill="#d8f59a"/><circle r="44" fill="#050a06"/></g>`);
  }
  if (kind === 'moon') {
    return layer('seam__sun', `<g transform="translate(360 140)"><circle r="46" fill="#f4ead8"/><circle r="42" cx="16" cy="-8" fill="#2a1660"/></g>`);
  }
  return layer('seam__sun', `<g transform="translate(720 175)"><circle r="190" fill="#fff1b8" opacity=".4" filter="url(#soft)"/><circle r="120" fill="#fff6e0"/><circle r="120" fill="none" stroke="#ef8fb6" stroke-width="3" opacity=".6"/></g>`);
}

function starsLayer() {
  const rnd = rng(7);
  const dots = Array.from({ length: 70 }, (_, i) => {
    const r = (0.8 + rnd() * 1.8).toFixed(1);
    return `<circle class="star" style="animation-delay:${(-rnd() * 4).toFixed(2)}s" cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * 300).toFixed(0)}" r="${r}"/>`;
  });
  return layer('seam__stars', `<g fill="#f4ead8">${dots.join('')}</g>`);
}

function birdsLayer(color) {
  const rnd = rng(31);
  const birds = Array.from({ length: 9 }, (_, i) => {
    const x = 120 + i * 120 + rnd() * 80;
    const y = 80 + rnd() * 200;
    const s = 0.6 + rnd() * 0.9;
    return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})"><path class="bird" style="animation-delay:${(-rnd()).toFixed(2)}s" d="M-18 0 Q-9 -10 0 0 Q9 -10 18 0 Q9 -4 0 4 Q-9 -4 -18 0Z"/></g>`;
  });
  return layer('seam__birds', `<g fill="${color}">${birds.join('')}</g>`);
}

const truck = (ink) => `
  <g transform="translate(0 0)">
    <path d="M0 -70 V-150 Q0 -162 12 -162 H170 V-70Z" fill="${ink}"/>
    <path d="M170 -70 V-140 Q170 -152 182 -152 H250 L300 -108 H322 Q336 -108 336 -94 V-70Z" fill="${ink}"/>
    <path d="M190 -140 H246 L282 -110 H190Z" fill="#f6c27a" opacity=".55"/>
    <path d="M8 -162 C40 -196 140 -200 168 -162Z" fill="${ink}"/>
    <g class="wheel" style="transform-origin:66px -62px"><circle cx="66" cy="-62" r="30" fill="${ink}"/><path d="M66 -84 V-40 M44 -62 H88" stroke="#e98ab9" stroke-width="3" opacity=".6"/></g>
    <g class="wheel" style="transform-origin:272px -62px"><circle cx="272" cy="-62" r="30" fill="${ink}"/><path d="M272 -84 V-40 M250 -62 H294" stroke="#e98ab9" stroke-width="3" opacity=".6"/></g>
  </g>`;

function riderLayer(kind, ink) {
  if (kind === 'truck') {
    return layer('seam__rider', `<g transform="translate(0 512) scale(.9)">${truck(ink)}</g>`);
  }
  const camels = [0, 1, 2, 3].map((i) => camel(i * 84, 0, 1.25 - i * 0.06, i)).join('');
  return layer('seam__rider', `<g transform="translate(0 330) scale(1.3)" fill="${ink}">${camels}</g>`);
}

export function buildSeam(key) {
  const s = SEAMS[key];
  if (!s) return '';
  const banks = s.banks.map((b, i) => bankLayer(key, i, b, s.ink));
  // the rider travels between the last two banks, so the front dust swallows its wheels
  const front = banks.pop();
  return `
    ${s.stars ? starsLayer() : ''}
    ${s.sun ? sunLayer(s.sun) : ''}
    ${s.birds ? birdsLayer(s.birds) : ''}
    ${banks.join('')}
    ${s.rider ? riderLayer(s.rider, s.ink) : ''}
    ${front}`;
}

export const seamSky = (key) => SEAMS[key]?.sky;
