// Cinematic set pieces in the spirit of "Erghad Afewo": monumental landforms,
// small isolated figures, ghosted silhouettes in dust, soft out-of-focus haze.
// Original vector drawings built from constants only (no user input).

import { tear } from './tear-art.js';

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
    <defs>${blur('b-far', 18)}${blur('b-near', 26)}
      <filter id="print"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 .42  0 0 0 0 .12  0 0 0 0 .45  0 0 0 -2.4 1.35"/><feComposite in2="SourceGraphic" operator="in" result="speck"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="speck"/></feMerge></filter>
    </defs>
    <!-- monumental mesa, lit from the left -->
    <g class="mesa" filter="url(#print)">
      <path d="M820 470 L860 300 L880 150 C900 120 1010 100 1080 110 C1130 118 1160 130 1170 160 L1200 330 L1300 470Z" fill="#e7a35f"/>
      <path d="M1080 110 C1130 118 1160 130 1170 160 L1200 330 L1300 470 L1060 470 L1090 300Z" fill="#c4689a" opacity=".85"/>
      <g stroke="#a24a85" stroke-width="3" opacity=".55" fill="none">
        <path d="M900 160 L895 300"/><path d="M930 140 L922 320"/><path d="M965 130 L960 290"/><path d="M1000 122 L996 330"/>
        <path d="M1040 116 L1032 280"/><path d="M1110 130 L1120 300"/><path d="M1140 140 L1152 320"/>
      </g>
    </g>
    <ellipse cx="700" cy="430" rx="620" ry="70" fill="#f6c27a" filter="url(#b-far)" opacity=".7"/>
    <!-- ground -->
    <path d="M0 440 C300 420 700 430 1440 425 V560 H0Z" fill="#d97aa8"/>
    <path d="M0 470 C400 455 900 468 1440 460 V560 H0Z" fill="#b7559a"/>
    <!-- ghost caravan, moved by scroll -->
    <g class="caravan ghost" fill="#5a1d6e">${camels}</g>
    <!-- dust kicked up behind it -->
    <g class="dust-trail" filter="url(#b-near)">
      <ellipse cx="80" cy="430" rx="160" ry="50" fill="#e98ab9" opacity=".8"/>
      <ellipse cx="300" cy="440" rx="140" ry="40" fill="#f2a6c8" opacity=".6"/>
    </g>
    <!-- birds, tiny, far -->
    <g fill="#3a1450" class="birds">
      <path d="M420 120 q10 -8 20 0 q10 -8 20 0 q-10 -3 -20 4 q-10 -7 -20 -4Z"/>
      <path d="M520 90 q7 -6 14 0 q7 -6 14 0 q-7 -2 -14 3 q-7 -5 -14 -3Z"/>
      <path d="M1250 70 q8 -6 16 0 q8 -6 16 0 q-8 -2 -16 3 q-8 -5 -16 -3Z"/>
    </g>
    <!-- out-of-focus foreground haze -->
    <ellipse cx="1300" cy="540" rx="300" ry="90" fill="#8a2f86" filter="url(#b-near)" opacity=".75"/>
  </svg>`;
}

const truck = (x, y, s) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 52 V20 Q0 14 6 14 H62 V52Z"/>
    <path d="M62 52 V22 Q62 16 68 16 H92 L110 32 H118 Q124 32 124 38 V52Z"/>
    <path d="M70 22 H90 L102 32 H70Z" fill="#f6c27a" opacity=".55"/>
    <path d="M0 14 C10 0 50 -6 62 14Z" opacity=".9"/>
    <circle cx="24" cy="54" r="11"/><circle cx="100" cy="54" r="11"/>
  </g>`;

export function convoy() {
  return `
  <svg viewBox="0 0 900 120">
    <defs>${blur('b-dust', 14)}</defs>
    <g filter="url(#b-dust)" opacity=".8">
      <ellipse cx="60" cy="90" rx="110" ry="30" fill="#f2a6c8"/><ellipse cx="380" cy="94" rx="100" ry="26" fill="#e98ab9"/><ellipse cx="660" cy="92" rx="90" ry="24" fill="#f2a6c8"/>
    </g>
    <g fill="#1d0b26" stroke="#f2a54a" stroke-width="1.2" stroke-opacity=".7">
      ${truck(140, 40, 1)}${truck(450, 46, .9)}${truck(720, 42, 1.05)}
    </g>
  </svg>`;
}

export function ridges() {
  return `
  <svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice">
    <path class="r-far" d="M0 200 L120 150 L230 180 L340 120 L470 170 L590 130 L720 185 L860 110 L980 165 L1110 125 L1240 170 L1360 135 L1440 160 V320 H0Z" fill="#8a3a74" opacity=".75"/>
    <path class="r-near" d="M0 240 L150 205 L290 236 L420 196 L560 240 L700 204 L860 244 L1000 210 L1150 246 L1300 212 L1440 232 V320 H0Z" fill="#4a1840"/>
    <path d="M0 282 C360 262 720 286 1080 270 S1440 276 1440 276 V320 H0Z" fill="#07050b"/>
    <!-- a tiny caravan treks the last ridge, the whole time you read the offer -->
    <g class="ridge-caravan" fill="#07050b">${[0, 1, 2].map((i) => camel(i * 40, 250, 0.42, i)).join('')}</g>
  </svg>`;
}

// Ch. 08: a clapperboard for the visitor's own scene. The arm is its own group so
// motion.js can snap it shut; the hinge sits at (8, 40).
export function clapper() {
  return `
  <svg viewBox="0 0 170 140" aria-hidden="true">
    <defs><pattern id="clap-stripe" width="26" height="20" patternUnits="userSpaceOnUse" patternTransform="skewX(-35)"><rect width="13" height="20" fill="#f4ead8"/></pattern></defs>
    <g class="clap__board">
      <rect x="4" y="40" width="162" height="96" rx="5" fill="#120d1a"/>
      <rect x="4" y="40" width="162" height="18" fill="#120d1a"/><rect x="4" y="40" width="162" height="18" fill="url(#clap-stripe)"/>
      <g stroke="rgb(244 234 216 / .35)" stroke-width="1"><path d="M14 86H156M14 112H156M86 62V112"/></g>
      <g fill="#f4ead8" font-family="Bricolage Grotesque, sans-serif" font-weight="600" font-size="7" letter-spacing="1.4">
        <text x="16" y="72">SCENE</text><text x="96" y="72">TAKE</text><text x="16" y="98">ROLL</text><text x="16" y="125">YOUR BRAND</text>
      </g>
      <g fill="#f5bd2c" font-family="Instrument Serif, serif" font-style="italic" font-size="20">
        <text x="56" y="80">08</text><text x="134" y="80">1</text><text x="56" y="106">A</text>
      </g>
    </g>
    <g class="clap__arm">
      <rect x="4" y="22" width="162" height="18" rx="2" fill="#120d1a"/><rect x="4" y="22" width="162" height="18" rx="2" fill="url(#clap-stripe)"/>
    </g>
    <g class="clap__snap" stroke="#120d1a" stroke-width="3" stroke-linecap="round"><path d="M172 18l12-8M174 32l15-1M168 6l6-12"/></g>
  </svg>`;
}

// the band opens under Wa3i's torn collage (js/tear-art.js)
const BUILDERS = { caravan: () => caravan() + tear(), convoy, ridges, clapper };

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
