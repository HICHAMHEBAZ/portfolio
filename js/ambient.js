// Ambient choreography, after the carousel's motion spec ("setup -> action"):
//   setup     - when a chapter arrives, its sun rises and its land settles first
//   primary   - scroll drives the scenery (the sun climbs, ridges part at depth)
//   secondary - the pointer gives depth (nearer props drift further)
//   ambient   - CSS loops (halo breathes 6s, haze drifts 14s, ridges drift 24s)
// Transform ownership, so nothing fights over one element:
//   GSAP pointer -> x / y      GSAP scroll -> xPercent / yPercent / rotation
//   GSAP setup   -> scale / opacity on the sun, y on ridge paths
//   CSS loops    -> translate / rotate / scale (the individual properties)
import { AMBIENT } from './ambient-art.js';

const POINTER = window.matchMedia('(pointer: fine)').matches;
const scrubbed = (trigger, extra = {}) => ({ trigger, start: 'top bottom', end: 'bottom top', scrub: true, ...extra });

export function mountAmbient(root = document) {
  root.querySelectorAll('[data-amb]').forEach((slot) => {
    const build = AMBIENT[slot.dataset.amb];
    if (!build) {
      console.warn(`Unknown ambient layer "${slot.dataset.amb}"`);
      return;
    }
    slot.innerHTML = build();
  });
}

// loops pause off screen (see .amb:not(.is-live) in ambient.css)
function liveWhileVisible() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting));
  }, { rootMargin: '10% 0px' });
  document.querySelectorAll('.amb').forEach((n) => io.observe(n));
}

// every chapter's sun and land: set up on arrival, then ride the scroll
function scenery(gsap) {
  document.querySelectorAll('.amb').forEach((amb) => {
    const host = amb.closest('[data-grade]') || amb.parentElement;
    const sunEl = amb.querySelector('.s-sun');
    const farEl = amb.querySelector('.s-land__far');
    const nearEl = amb.querySelectorAll('.s-land__near, .s-land__rim, .s-land__front');
    const props = amb.querySelector('.s-land__props');

    const setup = gsap.timeline({ scrollTrigger: { trigger: host, start: 'top 70%' } });
    if (sunEl) setup.from(sunEl, { scale: 0.8, opacity: 0, duration: 1.1, ease: 'expo.out' }, 0);
    if (farEl) setup.from(farEl, { y: 40, duration: 1.1, ease: 'expo.out' }, 0.05);
    if (nearEl.length) setup.from(nearEl, { y: 60, duration: 1.1, ease: 'expo.out' }, 0.1);
    if (props) setup.from(props, { y: 90, duration: 1.1, ease: 'expo.out' }, 0.25);

    if (sunEl) gsap.fromTo(sunEl, { yPercent: 30 }, { yPercent: -20, ease: 'none', scrollTrigger: scrubbed(host) });
  });
}

function cases(gsap) {
  const steam = document.querySelector('.amb--steam .steam');
  if (steam) gsap.fromTo(steam, { yPercent: 20 }, { yPercent: -15, ease: 'none', scrollTrigger: scrubbed(steam.closest('.case')) });

  gsap.utils.toArray('.amb--questions .q').forEach((q) => {
    const d = Number(q.dataset.depth);
    gsap.fromTo(q, { yPercent: 40 * d, rotation: -14 * d }, {
      yPercent: -40 * d, rotation: 14 * d, ease: 'none', scrollTrigger: scrubbed(q.closest('.case')),
    });
  });
}

// tyre tracks follow the convoy's rear wheel (same trigger as the convoy in motion.js)
function tracks(gsap, ScrollTrigger, mm) {
  const trailEl = document.querySelector('.road__trail');
  const convoy = document.getElementById('convoy');
  const road = document.querySelector('.road');
  if (!trailEl || !convoy || !road) return;
  mm.add('(min-width: 761px)', () => {
    ScrollTrigger.create({
      trigger: road, start: 'top 80%', end: 'bottom 35%', scrub: 0.8,
      onUpdate: (self) => {
        const w = convoy.offsetWidth;
        const r = road.offsetWidth;
        const rear = -w + self.progress * (r + w) + w * 0.12;
        const shown = gsap.utils.clamp(0, 100, (rear / r) * 100);
        trailEl.style.clipPath = `inset(0 ${(100 - shown).toFixed(2)}% 0 0)`;
      },
    });
  });
}

// Ch. 05: the lamp in the tent door flickers up as the circle comes into view
function lamp(gsap) {
  const tentLamp = document.querySelector('.amb--tent .s-lamp');
  if (!tentLamp) return;
  gsap.from(tentLamp, { opacity: 0, duration: 1.4, ease: 'steps(5)', scrollTrigger: { trigger: '.notes', start: 'top 60%' } });
}

// Ch. 08: the ⵣ is drawn star by star, then the ink disc crosses the sun
function finale(gsap) {
  const yaz = document.querySelector('.yaz');
  if (yaz) {
    gsap.timeline({ scrollTrigger: { trigger: '.cta', start: 'top 70%' } })
      .from(yaz.querySelectorAll('.yaz__star'), { scale: 0, opacity: 0, transformOrigin: 'center', duration: 0.5, ease: 'back.out(3)', stagger: 0.035 })
      .fromTo(yaz.querySelector('.yaz__line'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' }, 0.2);
  }
  // the eclipse pass: 9 s on the wash curve, leaving a thin cream ring
  const disc = document.querySelector('.cta__disc');
  if (disc) {
    gsap.fromTo(disc, { xPercent: -135 }, {
      xPercent: 0, duration: 9, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.cta', start: 'top 55%', toggleActions: 'play none none reverse' },
    });
  }
  const flock = document.querySelector('.flock');
  if (flock) gsap.fromTo(flock, { xPercent: -70, yPercent: 40 }, { xPercent: 160, yPercent: -30, ease: 'none', scrollTrigger: scrubbed('.cta') });
  gsap.fromTo('.cta__sun', { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom bottom', scrub: true } });
}

// nearer props drift further with the pointer; only the ones on screen are fed
function pointerDepth(gsap) {
  if (!POINTER) return;
  const nodes = gsap.utils.toArray('.amb [data-px], .amb[data-px]').map((n) => ({
    amb: n.closest('.amb'), px: Number(n.dataset.px),
    x: gsap.quickTo(n, 'x', { duration: 1.2, ease: 'power3.out' }),
    y: gsap.quickTo(n, 'y', { duration: 1.2, ease: 'power3.out' }),
  }));
  window.addEventListener('pointermove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    nodes.forEach((n) => {
      if (!n.amb?.classList.contains('is-live')) return;
      n.x(-nx * n.px);
      n.y(-ny * n.px);
    });
  }, { passive: true });
}

export function initAmbient(gsap, ScrollTrigger) {
  const mm = gsap.matchMedia();
  liveWhileVisible();
  scenery(gsap);
  cases(gsap);
  tracks(gsap, ScrollTrigger, mm);
  lamp(gsap);
  finale(gsap);
  pointerDepth(gsap);
}
