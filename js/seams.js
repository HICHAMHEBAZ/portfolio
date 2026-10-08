// Seam choreography. Each seam is a scrubbed shot with three layers of motion:
//   primary   - dust banks roll over the scene at different depths
//   secondary - a rider crosses the crest, the sun or moon climbs
//   ambient   - birds flap, stars flicker, the ink line boils on twos
// Every seam lands on the next chapter's sky, so the wash changes under the dust.
import { buildSeam, seamSky } from './seam-art.js';

const BOIL_FPS = 8;

export function mountSeams(root = document) {
  root.querySelectorAll('[data-seam]').forEach((seam) => {
    const key = seam.dataset.seam;
    const sky = seamSky(key);
    if (!sky) {
      console.warn(`Unknown seam "${key}"`);
      return;
    }
    seam.style.setProperty('--sky-a', sky[0]);
    seam.style.setProperty('--sky-b', sky[1]);
    seam.innerHTML = buildSeam(key);
  });
}

// the ink line re-draws itself 8 times a second, only while a seam is on screen
function startBoil() {
  const noises = document.querySelectorAll('.boil-noise');
  if (!noises.length) return;
  const visible = new Set();
  let timer = null;
  let seed = 1;
  const tick = () => {
    seed = (seed % 6) + 1;
    noises.forEach((n) => n.setAttribute('seed', String(seed)));
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    if (visible.size && !timer) timer = setInterval(tick, 1000 / BOIL_FPS);
    if (!visible.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  });
  document.querySelectorAll('.seam').forEach((n) => io.observe(n));
}

function seamShot(gsap, seam) {
  const st = { trigger: seam, start: 'top bottom', end: 'bottom top', scrub: 0.6 };
  const banks = seam.querySelectorAll('.seam__bank');
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: st });

  // rear banks drift less than front ones: depth through parallax
  banks.forEach((b) => {
    const d = Number(b.dataset.depth) + 1;
    tl.fromTo(b, { yPercent: 6 * d, xPercent: d % 2 ? -1.5 * d : 1.5 * d }, { yPercent: -3 * d, xPercent: d % 2 ? 1.5 * d : -1.5 * d }, 0);
  });
  const sun = seam.querySelector('.seam__sun');
  if (sun) tl.fromTo(sun, { yPercent: 22, scale: 0.9 }, { yPercent: -10, scale: 1.05 }, 0);
  const stars = seam.querySelector('.seam__stars');
  if (stars) tl.fromTo(stars, { yPercent: 0 }, { yPercent: -6 }, 0);
  const birds = seam.querySelector('.seam__birds');
  if (birds) tl.fromTo(birds, { xPercent: -30, yPercent: 10 }, { xPercent: 30, yPercent: -12 }, 0);
  const rider = seam.querySelector('.seam__rider');
  if (rider) tl.fromTo(rider, { xPercent: -45 }, { xPercent: 105 }, 0);
}

export function initSeams(gsap) {
  gsap.utils.toArray('.seam').forEach((seam) => seamShot(gsap, seam));
  startBoil();
}
