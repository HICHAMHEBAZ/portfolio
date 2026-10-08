// GSAP choreography, directed like a short film:
// cold open -> focus-pull title -> pinned "noise" sequence -> reel -> scenes -> CTA.
// Motion identity: expo-out, slow focus pulls (blur -> sharp), letterbox wipes.
import { initSeams } from './seams.js';
import { initHud } from './hud.js';
import { initAmbient } from './ambient.js';
import { PIN } from './timing.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'expo.out';

function splitWords(node) {
  const text = node.textContent.trim();
  node.setAttribute('aria-label', text);
  const words = text.split(/\s+/);
  node.replaceChildren(...words.flatMap((w, i) => {
    const span = document.createElement('span');
    span.className = 'w';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = w;
    return i < words.length - 1 ? [span, document.createTextNode(' ')] : [span];
  }));
}

function finishIntro() {
  document.body.classList.remove('is-loading');
  document.getElementById('intro')?.remove();
}

function coldOpen(gsap) {
  let seen = false;
  try {
    seen = sessionStorage.getItem('intro-seen') === '1';
    sessionStorage.setItem('intro-seen', '1');
  } catch {
    // storage blocked: play the full open
  }
  const tl = gsap.timeline({ defaults: { ease: EASE }, onComplete: finishIntro });
  if (!seen) {
    tl.to('[data-line="1"]', { opacity: 1, filter: 'blur(0px)', duration: 0.9, startAt: { filter: 'blur(8px)' } })
      .to('[data-line="1"]', { opacity: 0, duration: 0.5 }, '+=0.7')
      .to('[data-line="2"]', { opacity: 1, filter: 'blur(0px)', duration: 0.9, startAt: { filter: 'blur(8px)' } })
      .to('[data-line="2"]', { opacity: 0, duration: 0.5 }, '+=0.8');
  }
  tl.to('.intro__bar--top', { yPercent: -100, duration: 1.4, ease: 'expo.inOut' })
    .to('.intro__bar--bottom', { yPercent: 100, duration: 1.4, ease: 'expo.inOut' }, '<')
    .to('.intro__skip', { opacity: 0, duration: 0.3 }, '<')
    .from('.hero__title .line > span', { yPercent: 105, filter: 'blur(10px)', duration: 1.3, stagger: 0.12 }, '-=.7')
    .from('.hero__slate, .hero__subs, .hero__ctas, .hero__beats', { y: 20, opacity: 0, filter: 'blur(6px)', duration: 1, stagger: 0.1 }, '-=.9')
    .from('.nav', { opacity: 0, duration: 0.8 }, '<');

  document.getElementById('intro-skip')?.addEventListener('click', () => tl.progress(1));
  // never hold the page hostage on slow or throttled devices
  setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, seen ? 3000 : 7000);
}

function focusPulls(gsap) {
  document.querySelectorAll('[data-split]').forEach((h) => {
    splitWords(h);
    gsap.from(h.querySelectorAll('.w'), {
      opacity: 0, y: 24, filter: 'blur(12px)', duration: 1.2, ease: EASE, stagger: 0.05,
      scrollTrigger: { trigger: h, start: 'top 85%' },
    });
  });
  // slates are wiped on like a clapperboard card, left to right
  gsap.utils.toArray('.slate').forEach((n) => {
    if (n.closest('.hero, .intro, .lightbox')) return;
    gsap.fromTo(n, { clipPath: 'inset(0% 100% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut',
      scrollTrigger: { trigger: n, start: 'top 90%' },
      onComplete: () => gsap.set(n, { clearProps: 'clipPath' }),
    });
  });
  gsap.utils.toArray('.lede, .story-beats > div, .case__story .btn').forEach((n) => {
    if (n.closest('.hero, .intro, .lightbox')) return;
    gsap.from(n, { opacity: 0, y: 16, duration: 0.9, ease: EASE, scrollTrigger: { trigger: n, start: 'top 90%' } });
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
    tl.to(lines[i - 1], { opacity: 0, y: -30, filter: 'blur(10px)', duration: 0.45 }, at)
      .fromTo(line, { opacity: 0, y: 30, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45 }, at + 0.2);
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
      gsap.fromTo(im, { xPercent: -6 }, {
        xPercent: 6, ease: 'none',
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

// Wa3i -> method: the collage is ripped off back to front. Newsprint goes first and
// fastest, the red paper follows, and the ink sheet only rolls back to a torn
// horizon, so the top of the band always matches the scene above it.
// Each sheet peels from one corner (rotation about its bottom edge) as it lifts.
const TEAR = [
  { sel: '[data-tear="news"]', lift: -55, rot: -3.5, origin: '0% 100%', at: 0, dur: 0.5 },
  { sel: '[data-tear="red"]', lift: -46, rot: 2.5, origin: '100% 100%', at: 0.12, dur: 0.55 },
  { sel: '[data-tear="ink"]', lift: -34, rot: -0.6, origin: '0% 100%', at: 0.22, dur: 0.78 },
];

function tearAway(gsap, band) {
  if (!band.querySelector('.tear')) return;
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: band, start: 'top 62%', end: 'center 22%', scrub: 0.6, invalidateOnRefresh: true },
  });
  TEAR.forEach(({ sel, lift, rot, origin, at, dur }) => {
    tl.fromTo(sel, { yPercent: 0, rotation: 0 }, { yPercent: lift, rotation: rot, transformOrigin: origin, duration: dur, ease: 'power1.in' }, at);
  });
  // scraps tear loose at the edges and fall across the sky, turning over
  band.querySelectorAll('.scrap').forEach((s) => {
    const at = Number(s.dataset.at);
    tl.set(s, { opacity: 1 }, at)
      .fromTo(s, { y: 0, x: 0, rotation: 0 }, {
        y: () => band.offsetHeight * Number(s.dataset.fall), x: Number(s.dataset.drift), rotation: Number(s.dataset.spin),
        duration: 0.55, ease: 'power1.in',
      }, at)
      .to(s, { opacity: 0, duration: 0.1 }, at + 0.45);
  });
}

function landscapes(gsap, mm) {
  const band = document.querySelector('.caravan-band');
  if (band) {
    const st = { trigger: band, start: 'top bottom', end: 'bottom top', scrub: true };
    gsap.fromTo(band.querySelector('.caravan'), { x: -500 }, { x: 900, ease: 'none', scrollTrigger: st });
    gsap.fromTo(band.querySelector('.dust-trail'), { x: -600 }, { x: 760, ease: 'none', scrollTrigger: st });
    gsap.fromTo(band.querySelector('.mesa'), { y: 40 }, { y: -20, ease: 'none', scrollTrigger: st });
    tearAway(gsap, band);
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
    y: 50, opacity: 0, duration: 1, ease: EASE, stagger: 0.1,
    scrollTrigger: { trigger: '#services-grid', start: 'top 80%' },
  });

  const cta = { trigger: '.cta', start: 'top bottom', end: 'bottom bottom', scrub: true };
  gsap.fromTo('.cta__sun', { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: cta });
  gsap.fromTo('.cta__ridges .r-far', { y: 50 }, { y: 0, ease: 'none', scrollTrigger: cta });
  gsap.fromTo('.cta__ridges .r-near', { y: 25 }, { y: 0, ease: 'none', scrollTrigger: cta });
  gsap.from('.path', { y: 60, opacity: 0, duration: 1.1, ease: EASE, stagger: 0.12, scrollTrigger: { trigger: '.paths', start: 'top 85%' } });
}

// Ch. 08: "action". The arm snaps down when the chapter arrives, and lifts while
// the visitor hovers a send button, ready to clap again when they commit or leave.
const ARM_OPEN = -26;
function clapper(gsap, ScrollTrigger) {
  const arm = document.querySelector('.clap__arm');
  const board = document.querySelector('.clap__board');
  const snap = document.querySelector('.clap__snap');
  if (!arm || !board) return;
  gsap.set(arm, { rotation: ARM_OPEN, svgOrigin: '8 40' });
  const clap = () => gsap.timeline({ defaults: { overwrite: 'auto' } })
    .to(arm, { rotation: 0, duration: 0.16, ease: 'power4.in' })
    .fromTo(board, { y: 0, rotation: 0 }, { keyframes: [{ y: 3, rotation: -1.5, duration: 0.06 }, { y: 0, rotation: 0, duration: 0.5, ease: 'elastic.out(1, .35)' }], svgOrigin: '85 136' })
    .fromTo(snap, { opacity: 1, scale: 0.4, svgOrigin: '170 22' }, { opacity: 0, scale: 1.3, duration: 0.45, ease: EASE }, '<');
  const lift = () => gsap.to(arm, { rotation: ARM_OPEN, duration: 0.5, ease: EASE, overwrite: true });
  // re-arms when the visitor scrolls back above the chapter, so it claps on every entry
  ScrollTrigger.create({ trigger: '.cta__head', start: 'top 75%', onEnter: () => gsap.delayedCall(0.35, clap), onLeaveBack: lift });
  document.querySelectorAll('.cta [type="submit"]').forEach((b) => {
    b.addEventListener('pointerenter', lift);
    b.addEventListener('pointerleave', clap);
  });
}

// Ch. 05: tapes are dealt onto the shelf, then their reels turn with the scroll
function notes(gsap) {
  gsap.from('.tape', {
    x: 140, y: 30, rotate: 7, opacity: 0, duration: 1.2, ease: EASE, stagger: 0.12,
    scrollTrigger: { trigger: '#tapes', start: 'top 82%' },
  });
  gsap.to('.tape__reel', {
    rotation: 900, ease: 'none',
    scrollTrigger: { trigger: '.notes', start: 'top bottom', end: 'bottom top', scrub: 0.4 },
  });
  gsap.fromTo('.notes__speaker', { yPercent: 12 }, {
    yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.notes', start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

// Ch. 01 on desktop: the stage pins and plays as one shot.
// The quote lines part to either side, the camera pushes in on the figure,
// and the description runs as three subtitles. He hops as you leave.
const SUB_BEATS = [0.3, 0.58]; // where subtitle 1 and 2 take over
function heroStory(gsap, mm, hero) {
  mm.add('(min-width: 761px)', () => {
    const subs = gsap.utils.toArray('.hero__sub');
    const beats = gsap.utils.toArray('.hero__beats i');
    let hopped = false;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.hero', start: 'top top', end: PIN.hero, pin: '.hero__stage', scrub: 0.8, anticipatePin: 1,
        // first pin on the page: measure it before every trigger below it
        refreshPriority: 1,
        onUpdate: (self) => {
          hero?.setStory(self.progress);
          if (self.progress > 0.88 && self.direction > 0 && !hopped) {
            hopped = true;
            hero?.hop();
          }
          if (self.progress < 0.6) hopped = false;
        },
        onLeaveBack: () => hero?.setStory(0),
      },
    });
    tl.to({}, { duration: 1 }, 0)
      .to('.hero__line--a', { xPercent: -35, opacity: 0, filter: 'blur(12px)', duration: 0.22, ease: 'power2.in' }, 0.08)
      .to('.hero__line--b', { xPercent: 35, opacity: 0, filter: 'blur(12px)', duration: 0.22, ease: 'power2.in' }, 0.1)
      .to('.hero__slate', { opacity: 0, duration: 0.1 }, 0.1);
    SUB_BEATS.forEach((at, i) => {
      tl.to(subs[i], { opacity: 0, y: -24, filter: 'blur(8px)', duration: 0.08 }, at)
        .fromTo(subs[i + 1], { opacity: 0, y: 24, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.1, ease: 'power2.out' }, at + 0.05)
        .fromTo(beats[i + 1], { '--fill': 0 }, { '--fill': 1, duration: 0.1 }, at);
    });
    return () => hero?.setStory(0);
  });
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
  heroStory(gsap, mm, hero);
  focusPulls(gsap);
  noise(gsap);
  proofReel(gsap, mm);
  scenes(gsap);
  landscapes(gsap, mm);
  notes(gsap);
  clapper(gsap, ScrollTrigger);
  initSeams(gsap, ScrollTrigger);
  initHud(gsap, ScrollTrigger);
  initAmbient(gsap, ScrollTrigger);
  // matchMedia pins can register out of order; measure them top-to-bottom
  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  // the figure on the ridge gives a small nod when you reach for a CTA
  document.querySelectorAll('[data-nod]').forEach((b) => b.addEventListener('pointerenter', () => hero?.nod()));
  window.addEventListener('load', () => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });
}
