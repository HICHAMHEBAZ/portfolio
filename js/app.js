import { renderAll, oklaImages, $ } from './render.js';
import { mountElements } from './elements.js';
import { mountSeams } from './seams.js';
import { mountAmbient } from './ambient.js';
import { Carousel, SwipeDeck } from './carousel.js';
import { initNav, initCursor, initLightbox, initForm, initAuditForm } from './ui.js';
import { initMotion } from './motion.js';

let heroApi = null;
// proxy so motion can talk to the 3D scene before it has finished loading
const hero = {
  nod: () => heroApi?.nod(),
};

function boot() {
  renderAll();
  mountElements();
  mountSeams();
  mountAmbient();
  new Carousel(document.querySelector('.case [data-carousel]'));
  new SwipeDeck($('#okla-deck'), oklaImages());
  initNav();
  initCursor();
  initLightbox();
  initForm();
  initAuditForm();
  initMotion({ hero });
  scheduleHero();
}

function scheduleHero() {
  if (navigator.connection?.saveData) return;
  // three.js streams in while the cold open plays, so the shot is ready when the bars part
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadHero, { once: true });
  else loadHero();
}

// the opening shot rolls the moment the cold open clears the frame
function whenIntroDone(fn) {
  if (!document.body.classList.contains('is-loading')) fn();
  else document.addEventListener('intro:done', fn, { once: true });
}

async function loadHero() {
  const container = $('#hero-canvas');
  try {
    const { initHeroScene } = await import('./scene/hero-scene.js');
    heroApi = await initHeroScene(container, { mascotUrl: 'assets/img/mascot-cutout.webp' });
    if (heroApi) {
      container.classList.add('is-live');
      container.closest('.hero')?.classList.add('has-3d');
      whenIntroDone(heroApi.play);
    }
  } catch (err) {
    console.error('3D hero failed, keeping the static mascot:', err);
  }
}

boot();
