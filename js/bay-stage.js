// Ch. 05 stage art: what each bay's device shows at every beat.
// Beat 0 is the observed mess (the field notes float around the device);
// beats 1-6 are the pipeline steps. A layer is on screen while the bay's beat
// is in its data-on list, so one layer can carry two beats (variants -> approve).
// Everything is flat cel shapes in the bay's wash tokens, like the carousel slides.
import { thumbPath } from './data.js';

const layer = (on, cls, body) => `<div class="st ${cls}" data-on="${on}">${body}</div>`;
const bars = (n, cls = '') => Array.from({ length: n }, () => `<i class="bar ${cls}"></i>`).join('');

// the wash swatches the carousel queue rotates through (cover colours of consecutive posts)
const QUEUE = ['#fdc82f', '#e951c5', '#1ca9e4', '#8bdc58', '#d71b19', '#2e2e7b', '#4657b0'];
const LOOKS = [
  { id: 'A', bg: 'linear-gradient(180deg,#fed66a,#fdb52b)', ink: '#1d142c' },
  { id: 'B', bg: 'linear-gradient(180deg,#fdb465,#e951c5)', ink: '#2c072d' },
  { id: 'C', bg: 'linear-gradient(180deg,#4fc8ea,#0c57ae)', ink: '#0a1a3a' },
];

// a 9:16 reel: script -> beats -> sourced footage -> looks -> assembly -> editable cut
function phone() {
  const script = [['Stakes', 3], ['Question', 2], ['Turn', 3], ['Rehook', 2]]
    .map(([tag, n]) => `<div class="st-line"><b>${tag}</b><span>${bars(n)}</span></div>`).join('');
  const beats = ['Footage', 'Motion', 'Footage', 'Motion', 'Motion', 'Footage']
    .map((m, i) => `<span class="chip chip--${m.toLowerCase()}"><b>B${String(i + 1).padStart(2, '0')}</b>${m}</span>`).join('');
  const looks = LOOKS.map((l) => `<span class="look" style="--look:${l.bg};--look-ink:${l.ink}"><b>${l.id}</b><i></i><i></i>${l.id === 'B' ? '<em class="pick-star" aria-hidden="true">★</em>' : ''}</span>`).join('');
  const strip = ['tafilalt-ksar', 'tafilalt-oasis', 'tafilalt-caravan', 'tafilalt-dunes', 'tafilalt-people', 'tafilalt-mountains']
    .map((f, i) => `<span class="cel" style="--i:${i}"><img src="${thumbPath(f + '.webp')}" alt="" loading="lazy" decoding="async"></span>`).join('');
  return `
    ${layer('0', 'st-mess', `<span class="st-cursor"></span>${bars(5, 'bar--mess')}<span class="st-loader"></span>`)}
    ${layer('1', 'st-script', `<p class="st-k">Script</p>${script}`)}
    ${layer('2', 'st-beats', `<p class="st-k">Shot list</p><div class="shotlist">${beats}</div>`)}
    ${layer('3', 'st-footage', `<figure class="shot"><img src="${thumbPath('tafilalt-ksar.webp')}" alt="" loading="lazy" decoding="async"><span class="shot__ring"></span></figure><p class="receipt"><b>Source</b> logged<br><b>Licence</b> on file ✓</p>`)}
    ${layer('4', 'st-looks', `<p class="st-k">Pick one look</p><div class="looks">${looks}</div>`)}
    ${layer('5', 'st-strip', `<p class="st-k">Assembling</p><div class="strip">${strip}</div>`)}
    ${layer('6', 'st-final', `<img class="final__bg" src="${thumbPath('tafilalt-caravan.webp')}" alt="" loading="lazy" decoding="async"><span class="final__play"></span><p class="final__cap">the road <em>back</em> home</p><div class="final__clips">${bars(5, 'bar--clip')}</div>`)}`;
}

// a 4:5 slide: source -> variants -> approval -> colour queue -> build -> PDF
function slide() {
  const covers = LOOKS.map((l) => `<span class="look look--cover" style="--look:${l.bg};--look-ink:${l.ink}"><b>${l.id}</b><strong>0${LOOKS.indexOf(l) + 3}</strong><i></i><i></i><em class="stamp" aria-hidden="true">✓</em></span>`).join('');
  const washes = QUEUE.slice(0, 4).map((c, i) => `<span class="wash" style="--c:${c};--i:${i}"></span>`).join('');
  const queue = QUEUE.map((c, i) => `<span style="--c:${c}"${i === 3 ? ' class="is-now"' : ''}></span>`).join('');
  return `
    ${layer('0', 'st-mess', `${bars(4, 'bar--mess')}<span class="st-cursor"></span>`)}
    ${layer('1', 'st-source', `<p class="st-k">Source</p><i class="bar bar--title"></i>${bars(2)}<i class="bar bar--pull"></i>${bars(3)}`)}
    ${layer('2 3', 'st-covers', `<p class="st-k st-k--a">Three covers</p><p class="st-k st-k--b">Approved</p><div class="looks">${covers}</div>`)}
    ${layer('4', 'st-colour', `${washes}<p class="st-k">Next colour story</p><div class="queue">${queue}</div>`)}
    ${layer('5', 'st-build', `<span class="build__n">03</span><i class="bar bar--h"></i><i class="bar bar--h bar--hot"></i>${bars(2)}<img class="build__mascot" src="assets/img/mascot-cutout.webp" alt="" loading="lazy" decoding="async"><span class="build__mound"></span><span class="build__chrome">03 / 09</span>`)}
    ${layer('6', 'st-ready', `<div class="pages"><span></span><span></span><span><b>PDF</b> 9 pages</span></div><p class="caption">${bars(3)}</p><p class="tags"><span>#marketing</span><span>#maroc</span><span>#contenu</span></p>`)}`;
}

export const STAGES = { phone, slide };
