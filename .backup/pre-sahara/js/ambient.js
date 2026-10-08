// Ambient choreography. Three layers per chapter, after the motion-design playbook:
//   primary   - scroll drives the prop (sun rises, beam sweeps, tracks draw)
//   secondary - the pointer gives depth (nearer props drift further)
//   ambient   - CSS loops (bob, flicker, twinkle) that run only while on screen
// Transform ownership, so nothing fights over one element:
//   GSAP pointer -> x / y      GSAP scroll -> xPercent / yPercent / rotation
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

function projector(gsap) {
  gsap.fromTo('.beam__cone', { rotation: -5 }, {
    rotation: 6, ease: 'none', transformOrigin: '0 0',
    scrollTrigger: { trigger: '#proof', start: 'top top', end: 'bottom bottom', scrub: true },
  });
}

function cases(gsap) {
  const taf = document.querySelector('.amb--sun');
  if (taf) {
    const st = scrubbed(taf.parentElement);
    gsap.fromTo(taf.querySelector('.sun'), { yPercent: 30, rotation: -12 }, { yPercent: -18, rotation: 20, ease: 'none', scrollTrigger: st });
    gsap.fromTo(taf.querySelector('.dune--back'), { yPercent: 18 }, { yPercent: 0, ease: 'none', scrollTrigger: st });
    gsap.fromTo(taf.querySelector('.dune--front'), { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: st });
  }
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

// the VU meter kicks with scroll speed, then settles back to the idle beat
function vuMeter(gsap, ScrollTrigger) {
  const meter = document.querySelector('.amb--eq');
  if (!meter) return;
  const kick = gsap.quickTo(meter, '--amp', { duration: 0.35, ease: 'power3.out' });
  const settle = gsap.delayedCall(0.18, () => kick(0)).pause();
  ScrollTrigger.create({
    trigger: '.notes', start: 'top bottom', end: 'bottom top',
    onUpdate: (self) => {
      kick(Math.min(1, Math.abs(self.getVelocity()) / 2600));
      settle.restart(true);
    },
  });
}

function night(gsap) {
  const yaz = document.querySelector('.yaz');
  if (!yaz) return;
  gsap.timeline({ scrollTrigger: { trigger: yaz, start: 'top 85%' } })
    .from(yaz.querySelectorAll('.yaz__star'), { scale: 0, opacity: 0, transformOrigin: 'center', duration: 0.5, ease: 'back.out(3)', stagger: 0.035 })
    .fromTo(yaz.querySelector('.yaz__line'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' }, 0.2);
}

function dawn(gsap) {
  const flock = document.querySelector('.flock');
  if (!flock) return;
  gsap.fromTo(flock, { xPercent: -70, yPercent: 40 }, { xPercent: 160, yPercent: -30, ease: 'none', scrollTrigger: scrubbed('.cta') });
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
  projector(gsap);
  cases(gsap);
  tracks(gsap, ScrollTrigger, mm);
  vuMeter(gsap, ScrollTrigger);
  night(gsap);
  dawn(gsap);
  pointerDepth(gsap);
}
