// Scroll choreography for Ch. 05, in page order: the tally counts up, the gate scene pins and
// scrubs, the prints are dealt and circled with grease pencil, the contact sheet develops.
// Only transform, opacity, filter and stroke-dashoffset move. Called once from motion.js.
import { gateMotion } from './dailies-gate.js';
import { sheetMotion } from './dailies-sheet.js';

const EASE = 'expo.out';
const pad = (n) => String(n).padStart(2, '0');

// the numbers count up once, like a slate's counter running to its value
function tally(gsap) {
  gsap.utils.toArray('.tally__n').forEach((n) => {
    const end = Number(n.dataset.count);
    const show = (v) => {
      const x = Math.round(v);
      n.textContent = n.dataset.fmt === 'time' ? `${Math.floor(x / 60)}:${pad(x % 60)}` : pad(x);
    };
    const o = { v: 0 };
    show(0);
    gsap.to(o, { v: end, duration: 1.4, ease: EASE, onUpdate: () => show(o.v), scrollTrigger: { trigger: n, start: 'top 90%', once: true } });
  });
}

// the prints land on the table, then each picked one is circled as its row crosses the screen
function board(gsap) {
  gsap.from('.print', {
    opacity: 0, y: 44, duration: 0.65, ease: EASE, stagger: 0.07, clearProps: 'transform,opacity',
    scrollTrigger: { trigger: '.table', start: 'top 78%' },
  });
  gsap.utils.toArray('.print--pick').forEach((p) => {
    const loop = p.querySelector('.print__pencil path');
    const arrow = p.querySelector('.note__arrow path');
    const note = p.querySelector('.print__note');
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: p, start: 'top 72%', end: 'top 36%', scrub: 0.5 },
    })
      .fromTo(loop, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1 })
      .fromTo(note, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.3 }, '>-0.1')
      .fromTo(arrow, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3 }, '<');
  });
  gsap.from('.approval', {
    opacity: 0, y: 50, rotate: 4, duration: 1, ease: EASE,
    scrollTrigger: { trigger: '.approval', start: 'top 85%' },
  });
}

export function dailiesMotion(gsap) {
  const { ScrollTrigger } = window;
  if (!document.getElementById('dailies')) return;
  tally(gsap);
  gateMotion(gsap);
  board(gsap);
  sheetMotion(gsap, ScrollTrigger);
  gsap.from('.dly__close > *', {
    opacity: 0, y: 34, duration: 0.65, ease: EASE, stagger: 0.09, clearProps: 'transform,opacity',
    scrollTrigger: { trigger: '.dly__close', start: 'top 88%' },
  });
}
