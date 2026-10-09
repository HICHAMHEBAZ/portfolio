// GSAP choreography, directed like a short film:
// cold open -> title -> pinned "noise" sequence -> reel -> scenes -> CTA.
// Motion identity from the carousel system: expo-out entrances (650 / 1100 ms),
// setup -> action (scenery first, then numeral, headline, blocks), wash changes
// on the slow in-out curve, and stillness between.
import { initSeams } from './seams.js';
import { initHud } from './hud.js';
import { initAmbient } from './ambient.js';
import { PIN } from './timing.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'expo.out';

function splitWords(node) {
  const text = node.textContent.trim();
  const accent = node.dataset.accent;
  node.setAttribute('aria-label', text);
  const words = text.split(/\s+/);
  node.replaceChildren(...words.flatMap((w, i) => {
    const span = document.createElement('span');
    // one accent word per headline, in the scene's hot colour
    span.className = w === accent ? 'w w--accent' : 'w';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = w;
    return i < words.length - 1 ? [span, document.createTextNode(' ')] : [span];
  }));
}

// the page is released (scroll, 3D opening shot) the moment the bars start to part;
// the bars themselves are removed once they are off screen
let released = false;
function releaseIntro() {
  if (released) return;
  released = true;
  document.body.classList.remove('is-loading');
  document.dispatchEvent(new Event('intro:done'));
}

function finishIntro() {
  releaseIntro();
  document.getElementById('intro')?.remove();
}

// Ch. 01 copy enters as the bars part: setup (kicker) -> action (the two quote
// lines rise out of their masks) -> resolution (subtitles, actions, credits).
// One direction, expo-out, stagger budget under 600ms.
function heroEntrance(gsap, tl, at) {
  const mobile = window.innerWidth < 761;
  tl.fromTo('.hero__slate', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut', clearProps: 'clipPath' }, at)
    .from('.hero__line--a .line > span', { yPercent: 110, duration: 1.1 }, at + 0.15)
    .from('.hero__line--b .line > span', { yPercent: 110, duration: 1.1 }, at + (mobile ? 0.3 : 0.75))
    .from('.hero__word', { opacity: 0, y: 40, duration: 1.1 }, at + 0.45)
    .from('.hero__sub', { opacity: 0, y: 24, duration: 0.65, stagger: 0.09 }, at + 0.9)
    .from('.hero__ctas .btn', { opacity: 0, y: 24, duration: 0.65, stagger: 0.09, clearProps: 'transform,opacity' }, at + 1.1)
    .from('.credits-row li', { opacity: 0, y: 12, duration: 0.65, stagger: 0.07 }, at + 1.25);
}

function coldOpen(gsap) {
  let seen = false;
  try {
    seen = sessionStorage.getItem('intro-seen') === '1';
    sessionStorage.setItem('intro-seen', '1');
  } catch {
    // storage blocked: play the full open
  }
  const skipEvents = ['wheel', 'touchstart', 'keydown'];
  const skip = () => tl.progress(1);
  const tl = gsap.timeline({
    defaults: { ease: EASE },
    onComplete: () => {
      skipEvents.forEach((ev) => window.removeEventListener(ev, skip));
      finishIntro();
    },
  });
  if (!seen) {
    tl.to('[data-line="1"]', { opacity: 1, filter: 'blur(0px)', duration: 0.6, startAt: { filter: 'blur(8px)' } })
      .to('[data-line="1"]', { opacity: 0, duration: 0.35 }, '+=0.45')
      .to('[data-line="2"]', { opacity: 1, filter: 'blur(0px)', duration: 0.6, startAt: { filter: 'blur(8px)' } })
      .to('[data-line="2"]', { opacity: 0, duration: 0.35 }, '+=0.45');
  }
  tl.addLabel('bars')
    .add(releaseIntro, 'bars')
    .to('.intro__bar--top', { yPercent: -100, duration: 1.0, ease: 'expo.inOut' }, 'bars')
    .to('.intro__bar--bottom', { yPercent: 100, duration: 1.0, ease: 'expo.inOut' }, '<')
    .to('.intro__skip', { opacity: 0, duration: 0.3 }, '<')
    .add(() => document.getElementById('intro')?.remove(), 'bars+=1')
    .from('.nav', { opacity: 0, duration: 0.8 }, 'bars+=.3');
  heroEntrance(gsap, tl, tl.labels.bars + 0.2);

  document.getElementById('intro-skip')?.addEventListener('click', skip);
  skipEvents.forEach((ev) => window.addEventListener(ev, skip, { once: true, passive: true }));
  // never hold the page hostage on slow or throttled devices
  setTimeout(() => { if (!released) tl.progress(1); }, seen ? 2500 : 4000);
}

// infinite CSS loops (seams, caravan, credits, CTA, noise) only run while their section is near the viewport
function pauseOffscreen() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting));
  }, { rootMargin: '10% 0px' });
  document.querySelectorAll('.seam, .caravan-band, .reel-credits, .cta, .noise').forEach((n) => io.observe(n));
}

// setup -> action: the numeral scales in, then the headline rises 34px word by word
function focusPulls(gsap) {
  gsap.utils.toArray('.numeral').forEach((n) => {
    gsap.from(n, { scale: 0.86, opacity: 0, duration: 1.1, ease: EASE, transformOrigin: '100% 0%', scrollTrigger: { trigger: n.parentElement, start: 'top 80%' } });
  });
  document.querySelectorAll('[data-split]').forEach((h) => {
    splitWords(h);
    const words = h.querySelectorAll('.w');
    gsap.from(words, {
      opacity: 0, y: 34, duration: 0.65, ease: EASE, stagger: Math.min(0.09, 0.55 / words.length), delay: 0.12,
      scrollTrigger: { trigger: h, start: 'top 85%' },
    });
  });
  // kicker pills wipe on, left to right
  gsap.utils.toArray('.slate').forEach((n) => {
    if (n.closest('.hero, .intro, .lightbox')) return;
    gsap.fromTo(n, { clipPath: 'inset(0% 100% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut',
      scrollTrigger: { trigger: n, start: 'top 90%' },
      onComplete: () => gsap.set(n, { clearProps: 'clipPath' }),
    });
  });
  // blocks cascade on the 90ms stagger
  gsap.utils.toArray('.lede, .story-beats, .case__story .btn').forEach((n) => {
    if (n.closest('.hero, .intro, .lightbox')) return;
    const items = n.matches('.story-beats') ? n.children : n;
    gsap.from(items, { opacity: 0, y: 34, duration: 0.65, ease: EASE, stagger: 0.09, scrollTrigger: { trigger: n, start: 'top 90%' } });
  });
}

function noise(gsap) {
  const section = document.getElementById('noise');
  const lines = gsap.utils.toArray('.narration');
  const cols = gsap.utils.toArray('.noise__col');
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section, start: 'top top', end: PIN.noise, pin: '.noise__pin', scrub: 0.8,
      onUpdate: (self) => section.classList.toggle('is-turned', self.progress > 0.7),
    },
  });
  cols.forEach((col, i) => tl.fromTo(col, { yPercent: i % 2 ? -50 : 0 }, { yPercent: i % 2 ? 0 : -50, duration: 4 }, 0));
  // the last line lands by ~85% of the pin, so "sounds like them" holds before the scene moves on
  lines.forEach((line, i) => {
    if (i === 0) return;
    const at = i * 0.95;
    tl.to(lines[i - 1], { opacity: 0, y: -40, duration: 0.45 }, at)
      .fromTo(line, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45 }, at + 0.2);
  });
}

// the leader's frame number rolls like the HUD: old number up and out, new one in from below
function leaderCounter(gsap) {
  const count = document.getElementById('work-count');
  const sweep = document.querySelector('.leader');
  const total = document.querySelectorAll('#work-track .frame:not(.frame--end)').length;
  if (!count || !sweep || !total) return () => {};
  let shown = 1;
  return (progress) => {
    sweep.style.setProperty('--sweep', (1 - progress).toFixed(4));
    const n = Math.min(total, 1 + Math.floor(progress * total));
    if (n === shown) return;
    const dir = n > shown ? 1 : -1;
    shown = n;
    gsap.killTweensOf(count);
    gsap.timeline()
      .to(count, { yPercent: -110 * dir, opacity: 0, duration: 0.16, ease: 'power2.in' })
      .add(() => { count.textContent = String(n).padStart(2, '0'); })
      .fromTo(count, { yPercent: 110 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: EASE });
  };
}

function proofReel(gsap, mm) {
  mm.add('(min-width: 761px)', () => {
    const track = document.getElementById('work-track');
    const setLeader = leaderCounter(gsap);
    const distance = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: '#proof', start: 'top top', end: () => `+=${distance() * PIN.proof}`,
        pin: '.proof__pin', scrub: 0.7, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => {
          gsap.set('#work-progress', { scaleX: self.progress });
          setLeader(self.progress);
        },
      },
    });
    gsap.utils.toArray('.frame__img img').forEach((im) => {
      gsap.fromTo(im, { xPercent: -6, scale: 1.08 }, {
        xPercent: 6, scale: 1.08, ease: 'none',
        scrollTrigger: { trigger: im, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
      });
    });
  });
}

function scenes(gsap) {
  gsap.utils.toArray('.case').forEach((c) => {
    const media = c.querySelector('.case__media');
    gsap.fromTo(media, { y: 60 }, { y: -60, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo(media, { clipPath: 'inset(18% 0% 18% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut',
      scrollTrigger: { trigger: c, start: 'top 75%' },
      onComplete: () => gsap.set(media, { clearProps: 'clipPath' }),
    });
  });

  const cards = gsap.utils.toArray('#wa3i-fan button');
  const spread = [{ x: -0.55, r: -9 }, { x: 0, r: 0 }, { x: 0.55, r: 9 }];
  cards.forEach((c, i) => {
    gsap.set(c, { xPercent: -50, yPercent: -50, zIndex: i === 1 ? 2 : 1 });
    gsap.to(c, {
      x: () => c.offsetWidth * spread[i].x, rotate: spread[i].r, y: i === 1 ? -16 : 12, duration: 1.4, ease: EASE,
      scrollTrigger: { trigger: '#wa3i-fan', start: 'top 75%', toggleActions: 'play none none reverse' },
    });
  });
}

function landscapes(gsap, mm) {
  const band = document.querySelector('.caravan-band');
  if (band) {
    const st = { trigger: band, start: 'top bottom', end: 'bottom top', scrub: true };
    gsap.fromTo(band.querySelector('.caravan'), { x: -500 }, { x: 900, ease: 'none', scrollTrigger: st });
    gsap.fromTo(band.querySelector('.dust-trail'), { x: -600 }, { x: 760, ease: 'none', scrollTrigger: st });
    gsap.fromTo(band.querySelector('.mesa'), { y: 40 }, { y: -20, ease: 'none', scrollTrigger: st });
    gsap.fromTo(band.querySelector('.band-sun'), { y: 60 }, { y: -40, ease: 'none', scrollTrigger: st });
  }

  mm.add('(min-width: 761px)', () => {
    const steps = gsap.utils.toArray('.step');
    gsap.fromTo('#convoy', { x: () => -document.getElementById('convoy').offsetWidth }, {
      x: () => document.querySelector('.road').offsetWidth, ease: 'none',
      scrollTrigger: {
        trigger: '.road', start: 'top 80%', end: 'bottom 35%', scrub: 0.8, invalidateOnRefresh: true,
        onUpdate: (self) => {
          const lit = Math.floor(self.progress * (steps.length + 0.6));
          steps.forEach((s, i) => s.classList.toggle('is-lit', i < lit));
        },
      },
    });
  });

  gsap.from('.service', {
    y: 34, opacity: 0, duration: 0.65, ease: EASE, stagger: 0.09, clearProps: 'transform,opacity',
    scrollTrigger: { trigger: '#services-grid', start: 'top 80%' },
  });

  const cta = { trigger: '.cta', start: 'top bottom', end: 'bottom bottom', scrub: true };
  gsap.fromTo('.cta__ridges .r-far', { y: 50 }, { y: 0, ease: 'none', scrollTrigger: cta });
  gsap.fromTo('.cta__ridges .r-near', { y: 25 }, { y: 0, ease: 'none', scrollTrigger: cta });
  gsap.from('.path', { y: 34, opacity: 0, duration: 0.65, ease: EASE, stagger: 0.09, clearProps: 'transform,opacity', scrollTrigger: { trigger: '.paths', start: 'top 85%' } });
}

// Ch. 05: tapes are dealt onto the shelf, then their reels turn with the scroll
function notes(gsap) {
  gsap.from('.tape', {
    y: 34, opacity: 0, duration: 0.65, ease: EASE, stagger: 0.09, clearProps: 'transform,opacity',
    scrollTrigger: { trigger: '#tapes', start: 'top 82%' },
  });
  gsap.to('.tape__reel', {
    rotation: 900, ease: 'none',
    scrollTrigger: { trigger: '.notes', start: 'top bottom', end: 'bottom top', scrub: 0.4 },
  });
}

// in-page links glide instead of jumping; pins are already measured, so the
// target's own offset is where its chapter starts
function anchors() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    const id = link?.getAttribute('href').slice(1);
    const target = id === 'top' ? document.body : id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const top = id === 'top' ? 0 : target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
  });
}

// lazy images and late web fonts change the page height after the pins were
// measured; re-measure once things settle so every pin starts where it should
function remeasure(ScrollTrigger) {
  let timer = null;
  const refresh = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, 200);
  };
  let lastH = document.body.scrollHeight;
  new ResizeObserver(() => {
    const h = document.body.scrollHeight;
    if (Math.abs(h - lastH) < 2) return;
    lastH = h;
    refresh();
  }).observe(document.getElementById('main'));
  document.fonts?.ready.then(refresh);
  window.addEventListener('load', refresh);
}

export function initMotion({ hero } = {}) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger || reduced) {
    if (!gsap) console.warn('GSAP failed to load; showing the static page.');
    document.documentElement.classList.add('no-motion');
    document.querySelectorAll('.step').forEach((s) => s.classList.add('is-lit'));
    finishIntro();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  coldOpen(gsap);
  // pins are created top-to-bottom so each one measures the spacing above it
  focusPulls(gsap);
  noise(gsap);
  proofReel(gsap, mm);
  scenes(gsap);
  landscapes(gsap, mm);
  notes(gsap);
  initSeams(gsap);
  pauseOffscreen();
  initHud(gsap, ScrollTrigger);
  initAmbient(gsap, ScrollTrigger);
  // matchMedia pins can register out of order; measure them top-to-bottom
  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  // the figure on the ridge gives a small nod when you reach for a CTA
  document.querySelectorAll('[data-nod]').forEach((b) => b.addEventListener('pointerenter', () => hero?.nod()));
  anchors();
  remeasure(ScrollTrigger);
}
