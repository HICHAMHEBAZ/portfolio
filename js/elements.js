// Set pieces in the "Erghad Afewo" grammar: monumental landforms in flat cel
// tones, small isolated silhouettes in var(--land-near), out-of-focus haze.
// Every fill reads its chapter's wash tokens. Built from constants only.

const blur = (id, std) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${std}"/></filter>`;

export const camel = (x, y, s, i) => `
  <g transform="translate(${x} ${y}) scale(${s})"><g class="walker" style="animation-delay:${-i * 0.3}s">
    <path d="M6 30 C8 18 18 12 26 16 C30 4 40 4 44 14 C50 15 54 20 56 24 L64 8 C66 4 72 4 74 8 L72 12 L67 13 L60 30 C58 34 52 35 48 34 L47 58 L43 58 L42 36 L22 36 L20 58 L16 58 L15 36 C8 36 5 34 6 30Z"/>
    <path d="M30 14 C30 4 33 -6 36 -14 C38 -18 42 -18 43 -14 C45 -6 44 4 42 14Z"/>
    <circle cx="39" cy="-19" r="5"/>
  </g></g>`;

export function caravan() {
  const camels = [0, 1, 2, 3, 4].map((i) => camel(i * 92, 368 + (i % 2) * 4, 1.15 - i * 0.04, i)).join('');
  return `
  <svg viewBox="0 0 1440 560" preserveAspectRatio="xMidYMax slice">
    <defs>${blur('b-far', 18)}${blur('b-near', 26)}</defs>
    <circle class="band-sun" cx="300" cy="170" r="70" fill="var(--sun)"/>
    <!-- monumental mesa: one lit face, one shadow face, hard edge between -->
    <g class="mesa">
      <path d="M820 470 L860 300 L880 150 C900 120 1010 100 1080 110 C1130 118 1160 130 1170 160 L1200 330 L1300 470Z" fill="var(--haze)"/>
      <path d="M1080 110 C1130 118 1160 130 1170 160 L1200 330 L1300 470 L1060 470 L1090 300Z" fill="var(--land-far)"/>
    </g>
    <ellipse cx="700" cy="430" rx="620" ry="70" fill="var(--sky-1)" filter="url(#b-far)" opacity=".7"/>
    <!-- ground -->
    <path d="M0 440 C300 420 700 430 1440 425 V560 H0Z" fill="var(--land-far)"/>
    <path d="M0 470 C400 455 900 468 1440 460 V560 H0Z" fill="var(--land-near)"/>
    <!-- the caravan, moved by scroll -->
    <g class="caravan" fill="var(--land-near)">${camels}</g>
    <!-- dust kicked up behind it -->
    <g class="dust-trail" filter="url(#b-near)">
      <ellipse cx="80" cy="430" rx="160" ry="50" fill="var(--haze-2)" opacity=".7"/>
      <ellipse cx="300" cy="440" rx="140" ry="40" fill="var(--haze)" opacity=".6"/>
    </g>
    <!-- birds, tiny, far -->
    <g fill="var(--land-near)" class="birds">
      <path d="M420 120 q10 -8 20 0 q10 -8 20 0 q-10 -3 -20 4 q-10 -7 -20 -4Z"/>
      <path d="M520 90 q7 -6 14 0 q7 -6 14 0 q-7 -2 -14 3 q-7 -5 -14 -3Z"/>
      <path d="M1250 70 q8 -6 16 0 q8 -6 16 0 q-8 -2 -16 3 q-8 -5 -16 -3Z"/>
    </g>
  </svg>`;
}

const truck = (x, y, s) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 52 V20 Q0 14 6 14 H62 V52Z"/>
    <path d="M62 52 V22 Q62 16 68 16 H92 L110 32 H118 Q124 32 124 38 V52Z"/>
    <path d="M70 22 H90 L102 32 H70Z" fill="var(--sun)"/>
    <path d="M0 14 C10 0 50 -6 62 14Z" opacity=".9"/>
    <circle cx="24" cy="54" r="11"/><circle cx="100" cy="54" r="11"/>
  </g>`;

export function convoy() {
  return `
  <svg viewBox="0 0 900 120">
    <defs>${blur('b-dust', 14)}</defs>
    <g filter="url(#b-dust)" opacity=".8">
      <ellipse cx="60" cy="90" rx="110" ry="30" fill="var(--haze)"/><ellipse cx="380" cy="94" rx="100" ry="26" fill="var(--haze-2)"/><ellipse cx="660" cy="92" rx="90" ry="24" fill="var(--haze)"/>
    </g>
    <g fill="var(--land-near)">
      ${truck(140, 40, 1)}${truck(450, 46, .9)}${truck(720, 42, 1.05)}
    </g>
  </svg>`;
}

export function ridges() {
  return `
  <svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice">
    <path class="r-far" d="M0 200 L120 150 L230 180 L340 120 L470 170 L590 130 L720 185 L860 110 L980 165 L1110 125 L1240 170 L1360 135 L1440 160 V320 H0Z" fill="var(--land-far)"/>
    <path class="r-near" d="M0 240 L150 205 L290 236 L420 196 L560 240 L700 204 L860 244 L1000 210 L1150 246 L1300 212 L1440 232 V320 H0Z" fill="var(--land-near)"/>
    <path d="M0 282 C360 262 720 286 1080 270 S1440 276 1440 276 V320 H0Z" fill="var(--night)"/>
    <!-- a tiny caravan treks the last ridge, the whole time you read the offer -->
    <g class="ridge-caravan" fill="var(--land-near)">${[0, 1, 2].map((i) => camel(i * 40, 250, 0.42, i)).join('')}</g>
  </svg>`;
}

const BUILDERS = { caravan, convoy, ridges };

export function mountElements(root = document) {
  root.querySelectorAll('[data-el]').forEach((slot) => {
    const build = BUILDERS[slot.dataset.el];
    if (!build) {
      console.warn(`Unknown element "${slot.dataset.el}"`);
      return;
    }
    slot.innerHTML = build();
  });
}
